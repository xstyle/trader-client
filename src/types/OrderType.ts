import { TradeType } from "./TradeType";


export type OrderType = {
    _id: string;
    orderId: string;
    figi: string;
    executedLots: number;
    operation: "Buy" | "Sell" | "BuyCard";
    payment: number;
    commission?: {
        value: number;
        currency: string;
    };
    collections: string[];
    createdAt: string;
    date: string;
    price: number;
    currency: string;
    status: string;
    requestedPrice: number;
    requestedLots: number;
    isSynced: boolean;
    isSyncing?: boolean;
    isCanceling?: boolean;
    trades?: TradeType[];
};
