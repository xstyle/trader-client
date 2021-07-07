import Head from "next/head"
import Link from "next/link"
import { Button, Card, Container, Table } from "react-bootstrap"
import useSWR from "swr"
import { defaultGetServerSideProps } from "../utils"
import Header from "../components/Header"
import { MarketInstrumentPrice, MarketInstrumentPriceWithCurrency } from "../components/Price"
import { MarketInstrumentField } from "../components/Candle"
import { HOSTNAME } from "../utils/env"
import { getTickerUrl } from "../lib/link"


export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>Active orders</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    return <Container fluid>
        <h1>Active orders</h1>
        <Orders />
    </Container>
}

interface OrdersSourceUrlProviderInterface {
    figi?: string
}

type Order = {
    orderId: string,
    figi: string,
    operation: "Buy" | "Sell",
    status: string,
    requestedLots: number,
    executedLots: number,
    price: number,
    type: string,
}

interface OrdersProviderInterface {
    orders: Order[]
    mutate(): void
}

function ordersSourceUrlProvider({ figi }: OrdersSourceUrlProviderInterface): string {
    const url = new URL('/order/active', `http://${HOSTNAME}:3001`)
    if (typeof figi === 'string') {
        url.searchParams.set('figi', figi)
    }
    return url.href
}

function ordersProvider<TProps extends OrdersSourceUrlProviderInterface>(Component: React.ComponentType<TProps & OrdersProviderInterface>): React.FC<TProps> {
    return (props) => {
        const source_url = ordersSourceUrlProvider(props)
        const { data, error, mutate } = useSWR(source_url)
        if (error) return <div>Error...</div>
        if (!data) return <div>Loading...</div>

        return <Component {...props} orders={data} mutate={mutate} />
    }
}

interface OrdersCtrlInterface {
    onDecline(order: Order): void
}

const OrdersCtrl = <TProps extends OrdersProviderInterface>(Component: React.ComponentType<TProps & OrdersCtrlInterface>): React.FC<TProps> => (props) => {
    async function handleDecline(order: Order) {
        await fetch(`http://${HOSTNAME}:3001/order/active/${order.orderId}/cancel`)
        props.mutate()
    }
    return <Component {...props as TProps} onDecline={handleDecline} />
}

const OrdersView = (props: OrdersProviderInterface & OrdersCtrlInterface) => (
    <Card>
        <Table hover responsive striped>
            <thead>
                <tr>
                    <th>Ticker</th>
                    <th>Operation</th>
                    <th>Lots</th>
                    <th>Executed</th>
                    <th>Price</th>
                    <th>Current Price</th>
                    <th>Id</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {
                    props.orders.map(order => (
                        <tr key={order.orderId}>
                            <td>
                                <Link href={getTickerUrl(order.figi)}>
                                    <a><MarketInstrumentField figi={order.figi} fieldName={"ticker"} /></a>
                                </Link>
                            </td>
                            <td>{order.operation}</td>
                            <td>{order.requestedLots}</td>
                            <td>{order.executedLots}</td>
                            <td><MarketInstrumentPriceWithCurrency price={order.price} figi={order.figi} /></td>
                            <td><MarketInstrumentPrice figi={order.figi} /></td>
                            <td>{order.orderId}</td>
                            <td>
                                <Button onClick={() => props.onDecline(order)}>Decline</Button>
                            </td>
                        </tr>
                    ))
                }
            </tbody>
        </Table>
    </Card>

)

const Orders = ordersProvider(OrdersCtrl(OrdersView))