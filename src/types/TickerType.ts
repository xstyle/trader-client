export type TickerData = {
    time: string,
    v: number,
    c: number,
    n?: number,
    change?: number,
    o: number,
    h: number,
    l: number
}

export type TickerDataIndex = {
    [id: string]: TickerData
}

export type TickerInfoType = {
    currency: "USD" | "RUB",
    ticker: string,
    figi: string,
    name: string
}