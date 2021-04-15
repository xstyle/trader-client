import { useEffect, useState } from "react"
import useSWR from "swr";
import subscribeService from "../utils/subscribe.service"
import { HOSTNAME } from '../utils/env'
import { SuperCandle, CandlesIndex } from "../types/CandleType"
import { MarketInstrument } from "@tinkoff/invest-openapi-js-sdk/build/domain.d"

function number(new_value: SuperCandle, old_value: SuperCandle) {
    if (old_value.time === new_value.time) return new_value.v - old_value.v
    return new_value.v
}

export default function useSuperCandle(figi: string) {
    const [data, setData] = useState<SuperCandle>()
    useEffect(() => {
        if (typeof figi === 'string') {
            return subscribeService.subscribe({ figi }, (new_data, old_data) => {
                const data: SuperCandle = { ...new_data }
                if (old_data) {
                    data.n = number(new_data, old_data)
                    data.change = new_data.c - old_data.c
                }
                setData(data)
            })
        }
    }, [figi])
    return data
}

export function useStatefullSuperCandleHistory(figi: string, options = {}) {
    const [data, setData] = useState<SuperCandle[]>([])
    useEffect(() => subscribeService.subscribe({ figi }, (new_data, old_data) => {
        if (!old_data) return
        const _data: SuperCandle = { ...new_data }
        _data.n = number(new_data, old_data)
        return setData([_data, ...data])
    }))
    return data
}

export function CandleFieldValue({ figi, value = "c" }: { figi: string, value?: keyof SuperCandle }): JSX.Element | null {
    const candle = useSuperCandle(figi)
    if (typeof candle !== 'undefined') {
        return <>{candle[value]}</>
    }
    return null
}

export interface LastCandleProviderInterface {
    candle?: SuperCandle
}

export function lastCandleProvider<TProps extends { figi: string }>(Component: React.ComponentType<TProps & LastCandleProviderInterface>): React.FC<TProps> {
    return (props) => {
        const { figi } = props
        const candle = useSuperCandle(figi)
        return <Component
            {...props}
            candle={candle} />
    }
}

export function useMarketInstrument(id: string | undefined) {
    return useSWR<MarketInstrument>(id ? `http://${HOSTNAME}:3001/ticker/${id}` : null)
}

export function useMarketInstruments({ figis }: { figis: string[] }) {
    const url = new URL('/ticker', `http://${HOSTNAME}:3001`)
    figis.forEach(figi => url.searchParams.append('figi', figi))
    return useSWR<MarketInstrument[]>(url.href, { initialData: !figis.length ? [] : undefined })
}

type MarketInstrumentsIndexType = {
    [id: string]: MarketInstrument | undefined
}

export function useMarketInstrumentsIndex({ figis }: { figis: string[] }) {
    const { data } = useMarketInstruments({ figis })
    return (data || []).reduce((index, marketInstrument) => {
        index[marketInstrument.figi] = marketInstrument
        return index
    }, {} as MarketInstrumentsIndexType)
}

export function MarketInstrumentField({ figi, fieldName }: { readonly figi: string, readonly fieldName: keyof MarketInstrument }): JSX.Element {
    const { data, error } = useMarketInstrument(figi)
    if (error) return <>"Error"</>
    if (!data) return <>"---"</>
    return <>{data[fieldName]}</>
}

export function MarketInstrumentAndCandleProvider({ figi, render, placeholder }: { figi: string, placeholder?: JSX.Element, render: (data: MarketInstrument, ticker: SuperCandle) => JSX.Element }): JSX.Element | null {
    const { data: marketInstrument, error } = useMarketInstrument(figi)
    const candle = useSuperCandle(figi)
    if (error) return <div>Error</div>
    if (!marketInstrument || !candle) return placeholder || null
    return render(marketInstrument, candle)
}


export function useCandles(figis: string[] = []) {
    const [data, setData] = useState<CandlesIndex>({})
    useEffect(((data: CandlesIndex) => () => {
        const subscribers = figis.map((figi) => {
            //console.log(`${figi} has been subscribed`)
            return subscribeService.subscribe({ figi }, (new_data) => {
                data[figi] = new_data
                setData({ ...data })
            })
        })
        return () => {
            //console.log(`All figis have been unsubscribed`)
            subscribers.map(subscriber => subscriber())
        }
    })({}), [JSON.stringify(figis)])
    return data
}
