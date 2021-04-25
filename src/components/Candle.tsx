import { Candle, CandleResolution, MarketInstrument } from "@tinkoff/invest-openapi-js-sdk/build/domain.d";
import { useEffect, useState } from "react";
import useSWR from "swr";
import { CandlesIndex, SuperCandle } from "../types/CandleType";
import { HOSTNAME } from '../utils/env';
import { subscribeToCandle } from "../utils/candle";
import Price, { MarketInstrumentPriceWithCurrency } from "./Price";
import moment from "moment";

function number(new_value: SuperCandle, old_value: SuperCandle) {
    if (old_value.time === new_value.time) return new_value.v - old_value.v
    return new_value.v
}

export default function useSuperCandle(figi: string) {
    const [data, setData] = useState<SuperCandle>()
    useEffect(() => {
        return subscribeToCandle({ figi, interval: "1min" }, (new_data, old_data) => {
            const data: SuperCandle = { ...new_data }
            if (old_data) {
                data.n = number(new_data, old_data)
                data.change = new_data.c - old_data.c
            }
            setData(data)
        })
    }, [figi])
    return data
}

export function useStatefullSuperCandleHistory(figi: string, options = {}) {
    const [data, setData] = useState<SuperCandle[]>([])
    useEffect(() => subscribeToCandle({ figi, interval: "1min" }, (new_data, old_data) => {
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

export type MarketInstrumentsIndex = {
    [id: string]: MarketInstrument | undefined
}

export function useMarketInstrumentsIndex({ figis }: { figis: string[] }) {
    const { data } = useMarketInstruments({ figis })
    return (data || []).reduce((index, marketInstrument) => {
        index[marketInstrument.figi] = marketInstrument
        return index
    }, {} as MarketInstrumentsIndex)
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


export function useCandles(figis: string[] = []): CandlesIndex {
    const [data, setData] = useState<CandlesIndex>({})
    useEffect(((data: CandlesIndex) => () => {
        const subscribers = figis.map((figi) => {
            return subscribeToCandle({ figi, interval: "1min" }, (x) => {
                data[figi] = x
                setData({ ...data })
            })
        })
        return () => {
            console.log('unsubscribe')
            subscribers.map(subscriber => subscriber())
        }
    })(data), [JSON.stringify(figis)])
    return data
}

export function useHistoryPrice({ figi, date, interval }: { figi: string, date: string, interval: CandleResolution }): Candle | undefined {
    const url = new URL(`/ticker/${figi}/price`, `http://${HOSTNAME}:3001`)
    url.searchParams.set("date", date)
    url.searchParams.set("interval", interval)
    const { data } = useSWR(url.href)
    if (!data) return
    return data.data.candles[0]
}

export function HistoricalPrice({ figi, date, interval }: { figi: string, date: string, interval: CandleResolution }) {
    const candle = useHistoryPrice({ figi, date, interval })
    if (!candle) return null
    return <MarketInstrumentPriceWithCurrency figi={figi} price={candle.c} />
}

export function PriceChange({ figi, days_shift }: { figi: string, days_shift: number }) {
    const previous_day_candle = usePreviousDayCandle({ figi, days_shift })
    const candle = useSuperCandle(figi)
    if (!previous_day_candle || !candle) return null
    const price_change = (candle.c / previous_day_candle.c * 100) - 100
    const className = price_change < 0 ? `text-danger` : price_change > 0 ? 'text-success' : undefined
    const title = `Closing price ${moment(previous_day_candle.time).format("DD MMMM (dddd)")}: ${previous_day_candle.c}`
    return <Price
        price={price_change}
        suffix="%"
        className={className}
        title={title} />
}

export function ValueChange({ figi, days_shift, balance = 1, currency }: { figi: string, days_shift: number, balance?: number, currency?: boolean }) {
    const previous_candle = usePreviousDayCandle({ figi, days_shift })
    const candle = useSuperCandle(figi)
    if (!previous_candle || !candle) return null
    const value_change = (candle.c - previous_candle.c) * balance
    const className = value_change < 0 ? `text-danger` : value_change > 0 ? 'text-success' : undefined
    return <MarketInstrumentPriceWithCurrency figi={figi} price={value_change} className={className} currency={currency} />
}

export function PreviousDayPrice({ figi, days_shift }: { figi: string, days_shift: number }) {
    const candle = usePreviousDayCandle({ figi, days_shift })
    if (!candle) return null
    return <MarketInstrumentPriceWithCurrency figi={figi} price={candle.c} />
}

export function usePreviousDayCandle({ figi, days_shift }: { figi: string, days_shift: number }): Candle | undefined {
    const url = new URL(`/ticker/${figi}/get_previous_candle`, `http://${HOSTNAME}:3001`)
    url.searchParams.set("days_shift", days_shift.toString())
    const { data } = useSWR(url.href)
    return data?.candles[0]
}