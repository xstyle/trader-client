import { useEffect, useState } from "react"
import { Table } from "react-bootstrap"
import { Depth, OrderbookStreaming } from "../types/OrderbookType"
import { subscribeToOrderBook } from "../utils/orderbook"
import { MarketInstrumentPriceWithCurrency } from "./Price"

export function useOrderbook(figi: string, depth?: Depth) {
    const [data, setData] = useState<OrderbookStreaming>()
    useEffect(() => {
        return subscribeToOrderBook({ figi, depth }, setData)
    }, [figi, depth])
    return data
}

export function OrderbookPositionPrice({ figi, depth = 1, type }: { figi: string, depth?: Depth,  type: 'bids' | 'asks' }) {
    const orderbook = useOrderbook(figi, depth)
    const price = orderbook?.[type]?.[depth - 1]?.[0]
    if (!price) return null
    return <MarketInstrumentPriceWithCurrency figi={figi} price={price} className={type === "asks" ? "text-danger" : "text-success"}/>
}

export function OrderbookTable(props: { figi: string, depth?: Depth }) {
    const orderbook = useOrderbook(props.figi, props.depth)
    if (!orderbook) return <div>Orderbook is loading...</div>
    const spread: number = orderbook?.asks[0][0] - orderbook?.bids[0][0]
    return <Table size="sm" hover>
        <thead>
            <tr>
                <th>Type</th>
                <th>Price</th>
                <th>Number</th>
            </tr>
        </thead>
        <tbody>
            {
                orderbook?.asks.reverse().map((bid, index) => {
                    return <tr key={index}>
                        <td>Sell</td>
                        <td>{bid[0]}</td>
                        <td>{bid[1]}</td>
                    </tr>
                })
            }
            <tr>
                <td colSpan={3}>Spread <MarketInstrumentPriceWithCurrency figi={props.figi} price={spread} currency /></td>
            </tr>
            {
                orderbook?.bids.map((bid, index) => {
                    return <tr key={index}>
                        <td>Buy</td>
                        <td>{bid[0]}</td>
                        <td>{bid[1]}</td>
                    </tr>
                })
            }
        </tbody>
    </Table>

}