import { OrderType } from "./OrderType";

export type ReportDay = {
    operations: OrderType[],
    date: Date,
    formatted_date: string,
    change: number,
    amount: number,
    payment: number,
    payment_amount: number,
    middle: number,
    turnover: number,
}