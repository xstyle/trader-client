import { TickerData } from "../types/TickerType"
import useTicker, { tickerProvider, useTickerInfo } from "./Ticker"

export default function Price({ suffix = "", price, as = "span" }: { suffix?: string, price: number, as?: string }): JSX.Element | null {
    if (typeof price !== "number") {
        return null
    }
    const As = as as keyof JSX.IntrinsicElements
    return <As className="text-monospace">{price.toFixed(2)}{suffix ? " " + suffix : ""}</As>
}

export function TickerPriceWithCurrency({ figi, price }: { figi: string, price: number }) {
    const { data: tickerInfo, error } = useTickerInfo(figi)
    if (!tickerInfo || error) return <Price suffix="---" price={price} />
    return <Price suffix={tickerInfo.currency} price={price} />
}

export function TickerPrice({ figi, placeholder, lots = 1, adjustment = 0 }: { figi: string, placeholder?: number, lots?: number, adjustment?: number }) {
    const ticker = useTicker(figi)
    const { data: tickerInfo, error } = useTickerInfo(figi)
    if (!ticker || !tickerInfo || error) {
        if (placeholder != null) {
            return <TickerPriceWithCurrency figi={figi} price={placeholder} />
        }
        return null
    }
    return <TickerPriceWithCurrency figi={figi} price={(ticker.c * lots) + adjustment} />
}

export function ColorPriceView({ ticker }: { ticker?: TickerData }) {
    if (!ticker) return null
    return <span className={ticker.change && ticker.change > 0 ? "text-success" : ticker.change && ticker.change < 0 ? "text-danger" : ""}><Price price={ticker.c} /></span>
}

export const ColorPrice = tickerProvider(ColorPriceView)