import React from "react"
import { Table } from "react-bootstrap"
import { Operation, OperationsProvider } from "../../types/OperationType"
import { MarketInstrumentField } from "../Candle"
import { MarketInstrumentPriceWithCurrency } from "../Price"

export default function OperationsStatistics(props: OperationsProvider) {
    const operationsIndex = props.operations.reduce((result, operation) => {
        const instrument = result[operation.figi] ?? (result[operation.figi] = { operations: [], figi: operation.figi })
        instrument.operations.push(operation)
        return result
    }, {} as {
        [id: string]: {
            operations: Operation[]
            figi: string
        }
    })

    function getStatistic(instrumentOperation: { figi: string, operations: Operation[] }) {
        const buyOperations = instrumentOperation.operations.filter(operation => operation.operationType === "Buy")
        const sellOperations = instrumentOperation.operations.filter(operation => operation.operationType === "Sell")
        const buy = buyOperations.reduce((result, operation) => operation.quantityExecuted + result, 0)
        const sell = sellOperations.reduce((result, operation) => operation.quantityExecuted + result, 0)

        const paymentBuy = buyOperations.reduce((result, operation) => operation.payment + result, 0)
        const paymentSell = sellOperations.reduce((result, operation) => operation.payment + result, 0)

        const balance = buy - sell
        const paymentBalance = paymentBuy + paymentSell

        return {
            ...instrumentOperation,
            statistics: {
                buy,
                sell,
                balance,
                paymentBuy,
                paymentSell,
                paymentBalance,
                price: paymentBalance / balance
            }
        }
    }
    const instrumentsOperations = Object.values(operationsIndex)
    const instrumentsOperationsWithStatistics = instrumentsOperations.map(getStatistic)

    return <Table bordered hover striped>
        <thead>
            <tr>
                <th>FIGI</th>
                <th className="text-right">Sell</th>
                <th className="text-right">Buy</th>
                <th className="text-right">Balance</th>
                <th className="text-right">Payment Sell</th>
                <th className="text-right">Payment Buy</th>
                <th className="text-right">Payment Balance</th>
                <th className="text-right">Price</th>
            </tr>
        </thead>
        <tbody>
            {
                instrumentsOperationsWithStatistics.map((instrumentsOperations) => (
                    <tr>
                        <td>
                            <MarketInstrumentField
                                figi={instrumentsOperations.figi}
                                fieldName="ticker" />
                        </td>
                        <td className="text-monospace text-right">{instrumentsOperations.statistics.sell}</td>
                        <td className="text-monospace text-right">{instrumentsOperations.statistics.buy}</td>
                        <td className="text-monospace text-right">{instrumentsOperations.statistics.balance}</td>
                        <td className="text-monospace text-right">
                            <MarketInstrumentPriceWithCurrency
                                figi={instrumentsOperations.figi}
                                price={instrumentsOperations.statistics.paymentSell} />
                        </td>
                        <td className="text-monospace text-right">
                            <MarketInstrumentPriceWithCurrency
                                figi={instrumentsOperations.figi}
                                price={instrumentsOperations.statistics.paymentBuy} />
                        </td>
                        <td className="text-monospace text-right">
                            <MarketInstrumentPriceWithCurrency
                                figi={instrumentsOperations.figi}
                                price={instrumentsOperations.statistics.paymentBalance} />
                        </td>
                        <td className="text-monospace text-right">
                            <MarketInstrumentPriceWithCurrency
                                figi={instrumentsOperations.figi}
                                price={instrumentsOperations.statistics.price} />
                        </td>
                    </tr>
                ))
            }
        </tbody>
    </Table>
}