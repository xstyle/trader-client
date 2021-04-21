import { Candle, MarketInstrument } from "@tinkoff/invest-openapi-js-sdk/build/domain.d"

export type SuperCandle = Candle & {
    n?: number,
    change?: number,
}

export type CandlesIndex = {
    [id: string]: Candle | undefined
}