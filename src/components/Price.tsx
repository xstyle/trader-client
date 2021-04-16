import { SuperCandle } from "../types/CandleType"
import useSuperCandle, { lastCandleProvider, useMarketInstrument } from "./Candle"

export default function Price({ suffix = "", price, as = "span", className = "" }: { suffix?: string, price: number, as?: string, className?: string }): JSX.Element | null {
    if (typeof price !== "number") {
        return null
    }
    const As = as as keyof JSX.IntrinsicElements
    return <As className={`text-monospace ${className}`}>{price.toFixed(2)}{suffix ? " " + suffix : ""}</As>
}



export function MarketInstrumentPriceWithCurrency({ figi, price, className }: { figi: string, price: number, className?: string }) {
    const { data: marketInstrument, error } = useMarketInstrument(figi)
    if (!marketInstrument || error) return <Price suffix="---" price={price} />
    return <Price suffix={marketInstrument.currency} price={price} className={className} />
}

interface InstrumentPrice {
    figi: string,
    placeholder?: number,
    lots?: number,
    adjustment?: number,
    className?: string
}

export function MarketInstrumentPrice({ figi, placeholder, lots = 1, adjustment = 0, className }: InstrumentPrice) {
    const candle = useSuperCandle(figi)
    const { data: marketInstrument, error } = useMarketInstrument(figi)
    if (!candle || !marketInstrument || error) {
        if (placeholder != null) {
            return <MarketInstrumentPriceWithCurrency figi={figi} price={placeholder} className={className} />
        }
        return null
    }
    return <MarketInstrumentPriceWithCurrency figi={figi} price={(candle.c * lots) + adjustment} className={className}/>
}

export function ColorPriceView({ candle }: { candle?: SuperCandle }) {
    if (!candle) return null
    return <span className={candle.change && candle.change > 0 ? "text-success" : candle.change && candle.change < 0 ? "text-danger" : ""}><Price price={candle.c} /></span>
}

export const ColorPrice = lastCandleProvider(ColorPriceView)