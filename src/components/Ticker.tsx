import { useEffect, useState } from "react"
import useSWR from "swr";
import subscribeService from "../utils/subscribe.service";
import { HOSTNAME } from '../utils/env'
import { TickerData, TickerDataIndex, TickerInfoType } from "../types/TickerType";

function number(new_value: TickerData, old_value: TickerData) {
    if (old_value.time === new_value.time) return new_value.v - old_value.v
    return new_value.v
}

export default function useTicker(figi: string) {
    const [data, setData] = useState<TickerData>()
    useEffect(() => {
        if (typeof figi === 'string') {
            return subscribeService.subscribe({ figi }, (new_data, old_data) => {
                if (old_data) {
                    new_data.n = number(new_data, old_data)
                    new_data.change = new_data.c - old_data.c
                }
                setData(new_data)
            })
        }
    }, [figi])
    return data
}

export function useStatefullTicker(figi: string, options = {}) {
    const [data, setData] = useState<TickerData[]>([])
    useEffect(() => subscribeService.subscribe({ figi }, (new_data, old_data) => {
        if (!old_data) return
        new_data.n = number(new_data, old_data)
        return setData([new_data, ...data])
    }))
    return data
}

export function Ticker({ figi, value = "c" }: { figi: string, value?: keyof TickerData }): JSX.Element | null  {
    const ticker = useTicker(figi)
    if (typeof ticker !== 'undefined') {
        return <>ticker[value]</>
    }
    return null
}

export interface TickerProviderInterface {
    ticker?: TickerData
}

export function tickerProvider<TProps extends { figi: string }>(Component: React.ComponentType<TProps & TickerProviderInterface>): React.FC<TProps> {
    return (props) => {
        const { figi } = props
        const ticker = useTicker(figi)
        return <Component
            {...props}
            ticker={ticker} />
    }
}

export function useTickerInfo(id: string | undefined) {
    return useSWR<TickerInfoType>(id ? `http://${HOSTNAME}:3001/ticker/${id}` : null)
}

export function TickerInfo({ figi, fieldName }: { readonly figi: string, readonly fieldName: keyof TickerInfoType }): JSX.Element {
    const { data, error } = useTickerInfo(figi)
    if (error) return <>"Error"</>
    if (!data) return <>"---"</>
    return <>{data[fieldName]}</>
}

export function TickerProvider({ figi, render, placeholder }: { figi: string, placeholder?: JSX.Element, render: (data: TickerInfoType, ticker: TickerData) => JSX.Element }): JSX.Element | null {
    const { data, error } = useTickerInfo(figi)
    const ticker = useTicker(figi)
    if (error) return <div>Error</div>
    if (!data || !ticker) return placeholder || null
    return render(data, ticker)
}


export function useTickers(figis: string[] = []) {
    const [data, setData] = useState<TickerDataIndex>({})
    useEffect(((data: TickerDataIndex) => () => {
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
