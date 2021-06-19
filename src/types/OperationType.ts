import { OperationTypeWithCommission } from "@tinkoff/invest-openapi-js-sdk/build/domain.d"

export type Operation = {
    id: string,
    operationType: "Buy" | "Sell" | "BuyCard",
    price: number,
    figi: string,
    status: OperationStatus,
    date: string,
    quantity: number,
    quantityExecuted: number,
    payment: number,
    currency: "RUB" | "USD",
    trades: any[]
}

export type OperationStatus = "Done" | "Decline"

export interface OperationsProvider {
    operations: Operation[];
    source_url: string;
}

export interface OperationsProviderParams {
    figi?: string,
    start_date: string,
    end_date: string,
    status?: ("Done" | "Decline")[]
    types?: OperationTypeWithCommission[]
}