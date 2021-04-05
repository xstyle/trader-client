export type StockType = {
    name: string
    ticker: string
    figi: string
    minPriceIncrement: number
    lot: number
    currency: string
    type: string
}

export interface StocksSourceUrlProvider {
    search?: string;
}

export interface StocksProviderInterface {
    instruments: StockType[]
    source_url: string
}
