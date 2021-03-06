import { SuperCandle } from "../types/CandleType"
import useSuperCandle, { lastCandleProvider, useMarketInstrument } from "./Candle"

export default function Price({
    suffix = "",
    price,
    as: As = "span",
    className = "",
    title
}: {
    suffix?: string,
    price: number,
    as?: keyof JSX.IntrinsicElements,
    className?: string,
    title?: string
}): JSX.Element | null {
    if (typeof price !== "number") return null
    return <As
        className={`text-monospace ${className}`}
        title={title}>
        <span>{price.toFixed(2)}</span>
        {suffix && <span className="pl-1">{suffix}</span>}
    </As>
}

export function MarketInstrumentPriceWithCurrency({ figi, price, className = "", currency = false, color = false, change = 0 }: { figi: string, price: number, className?: string, currency?: boolean, color?: boolean, change?: number }) {
    const { data: marketInstrument } = useMarketInstrument(figi)
    const classNameColor = !color ? "" : change === 0 ? "" : change > 0 ? "text-success" : "text-danger"
    let suffix = currency ? marketInstrument?.currency ?? "---" : undefined
    switch (suffix) {
        case "USD":
            suffix = "$"
            break;
        case "RUB":
            suffix = "₽"
            break;
        default:
            break;
    }
    return <Price
        suffix={suffix}
        price={price}
        className={`${className} ${classNameColor}`} />
}

interface InstrumentPrice {
    figi: string;
    placeholder?: number;
    lots?: number;
    adjustment?: number;
    className?: string;
    currency?: boolean;
    color?: boolean
}

export function MarketInstrumentPrice({ figi, placeholder, lots = 1, adjustment = 0, className, currency = false, color = false }: InstrumentPrice) {
    const candle = useSuperCandle(figi)
    const { data: marketInstrument, error } = useMarketInstrument(figi)
    if (!candle || !marketInstrument || error) {
        if (placeholder != null) {
            return <MarketInstrumentPriceWithCurrency
                figi={figi}
                color={color}
                price={placeholder}
                className={className} />
        }
        return null
    }
    return <MarketInstrumentPriceWithCurrency
        figi={figi}
        color={color}
        price={(candle.c * lots) + adjustment}
        change={candle.change}
        className={className}
        currency={currency} />
}

export function ColorPriceView({ candle }: { candle?: SuperCandle }) {
    if (!candle) return null
    return <span className={candle.change && candle.change > 0 ? "text-success" : candle.change && candle.change < 0 ? "text-danger" : ""}><Price price={candle.c} /></span>
}

export const ColorPrice = lastCandleProvider(ColorPriceView)