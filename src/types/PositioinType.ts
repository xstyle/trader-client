import { TickerData } from "./TickerType";

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
    positions: Position[]
    usd_ticker: TickerData
}