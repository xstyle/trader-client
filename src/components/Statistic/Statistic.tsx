import { useMemo } from "react";
import { OrderType } from "../../types/OrderType";

export function useStatistica(orders: OrderType[]): { lots: number, budget: number, price_per_share: number } {
    return useMemo(() => {
        const lots = orders.reduce((sum, order) => order.operation == 'Sell' ? sum - order.executedLots : sum + order.executedLots, 0)
        const budget = orders.reduce((budget, order) => {
            budget += order.payment || 0
            if (order.commission && order.commission.value) budget += order.commission.value
            return budget
        }, 0)
        const price_per_share = Math.abs(budget / lots)
        return {
            lots,
            budget,
            price_per_share
        }
    }, [orders]);
}