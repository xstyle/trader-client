import { PortfolioPosition } from "@tinkoff/invest-openapi-js-sdk/build/domain.d";
import { SuperCandle } from "./CandleType";

export type Position = {
    ticker: string,
    figi: string,
    balance: number,
    currency: "USD" | "RUB",
    name: string,
    blocked: number,
    lots: number,
    instrumentType: "Stock"
}

export interface PortfolioProviderInterface {
    positions: PortfolioPosition[]
    usd_candle: SuperCandle
}