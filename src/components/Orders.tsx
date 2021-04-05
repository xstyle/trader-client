import { OperationStatus, OrderStatus } from "@tinkoff/invest-openapi-js-sdk/build/domain.d"
import Link from "next/link"
import { ComponentType, useState } from "react"
import { Button, Card, Form, Modal, ModalProps, Pagination, Table } from "react-bootstrap"
import Moment from "react-moment"
import useSWR, { mutate } from "swr"
import { OrderType } from "../types/OrderType"
import { HOSTNAME } from '../utils/env'
import { Paginator } from "../utils/pagination"
import Price, { TickerPriceWithCurrency } from "./Price"
import { SelectOperation } from "./SelectOperation"
import { TickerInfo } from "./Ticker"

const style: React.CSSProperties = {
    position: 'sticky',
    top: 0
}

export function OrdersView({ orders }: OrdersProviderInterface) {
    return <Card>
        <Table
            //size="lg"
            bordered
            hover
            responsive>
            <thead style={style}>
                <tr>
                    <th>#</th>
                    <th>Date</th>
                    <th>Ticker</th>
                    <th>Operation</th>
                    <th>Requested</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Executed Lots</th>
                    <th>Payment</th>
                    <th>Req. Price</th>
                </tr>
            </thead>
            <tbody>
                {
                    orders.map((order, index) =>
                        <tr key={order._id}>
                            <th title={order.orderId} className="text-right">{orders.length - index}</th>
                            <td className="text-monospace">
                                <Moment withTitle titleFormat={"HH:mm:ss"} fromNow>{order.createdAt}</Moment>
                            </td>
                            <td>
                                <Link href={`/ticker/${order.figi}`}>
                                    <a><TickerInfo figi={order.figi} fieldName="ticker" /></a>
                                </Link>
                            </td>
                            <td>{order.operation}</td>
                            <td className="text-right">{order.requestedLots}</td>
                            <td className="text-right">
                                <TickerPriceWithCurrency price={order.price} figi={order.figi} />
                            </td>
                            <td>{order.status}</td>
                            <td className="text-right">{order.executedLots || 0}</td>
                            <td className="text-right"><TickerPriceWithCurrency price={order.payment} figi={order.figi} /></td>
                            <td className="text-right"><TickerPriceWithCurrency price={order.requestedPrice} figi={order.figi} /></td>
                        </tr>
                    )
                }
            </tbody>
        </Table>
    </Card>
}

export function MutateOrders(filter: OrdersSourceUrlProviderOptions) {
    const source_url = ordersSourceUrlProvider(filter)
    mutate(source_url)
}

export type OrdersSourceUrlProviderOptions = {
    figi?: string,
    collection?: string,
    start_date?: string,
    end_date?: string,
    status?: OrderStatus | OperationStatus | (OrderStatus | OperationStatus)[]
}
export function ordersSourceUrlProvider({ figi, collection, start_date, end_date, status }: OrdersSourceUrlProviderOptions): string {
    const url = new URL('/order', `http://${HOSTNAME}:3001`)

    if (figi) url.searchParams.set('figi', figi)
    if (collection) url.searchParams.set('collection', collection)
    if (start_date) url.searchParams.set('start_date', start_date)
    if (end_date) url.searchParams.set('end_date', end_date)
    if (status) {
        if (Array.isArray(status)) {
            status.forEach(status => url.searchParams.append('status', status))
        } else {
            url.searchParams.set('status', status)
        }
    }

    return url.href
}

export const ordersProvider = <TProps extends OrdersSourceUrlProviderOptions>(Component: ComponentType<TProps & OrdersProviderInterface>): React.FC<TProps> => (props) => {
    const source_url = ordersSourceUrlProvider(props)
    const { data: orders, error } = useSWR(source_url, { refreshInterval: 5000 })

    if (error) return <div>Error loading Orders</div>
    if (!orders) return <div>Loading Orders...</div>
    return <Component
        {...props}
        orders={orders}
        source_url={source_url} />
}

export const Orders = ordersProvider(OrdersView)

type OperationType = {
    id: string,
    date: string,
}

export interface OrdersProviderInterface {
    orders: OrderType[],
    source_url: string,
}

interface OrderCtrlInterface {
    onCancel(order: OrderType): Promise<void>
    onSync(order: OrderType): Promise<void>
}

export interface OrdersCtrlInterface extends OrderCtrlInterface {
    payment: number
    amount: number
    commission: number
    onRemoveCollection(order: OrderType): Promise<void>
    onSelectOrders(): void
}

export const OrdersCtrl = <TProps extends OrdersProviderInterface & OrdersSourceUrlProviderOptions>(Component: React.ComponentType<TProps & OrdersCtrlInterface>): React.FC<TProps> => (props) => {

    const { orders, source_url } = props
    const [show, setShow] = useState(false)
    const [limit, setLimit] = useState(10)

    const amount = orders.reduce((amount, order) => {
        if (!order.executedLots) return amount
        switch (order.operation) {
            case 'Sell':
                return amount - order.executedLots
            case 'Buy':
            case 'BuyCard':
                return amount + order.executedLots
            default:
                return amount
        }
    }, 0)

    const payment = orders.reduce((payment, order) => order.payment ? payment + order.payment : payment, 0)
    const commission = orders.reduce((commission, order) => order.commission ? commission + order.commission.value : commission, 0)

    async function handleSync(order: OrderType) {
        const data = [...orders]
        const index = orders.indexOf(order)
        data[index] = { ...orders[index], isSyncing: true }
        mutate(source_url, data, false)
        await fetch(`http://${HOSTNAME}:3001/order/${order._id}/sync`)
        mutate(source_url)
    }

    function toogleShow() {
        setShow(!show)
    }

    async function handleSelect(operation: OperationType) {
        const url = new URL('/order/add_collection', `http://${HOSTNAME}:3001`)
        url.searchParams.set('id', operation.id)
        url.searchParams.set('date', operation.date)
        if (props.collection) url.searchParams.set('collection', props.collection)

        await fetch(url.href)
        mutate(source_url)
    }

    async function handleRemoveCollection(order: OrderType) {
        await fetch(`http://${HOSTNAME}:3001/order/${order._id}/remove_collection?collection=${props.collection}`)
        mutate(source_url)
    }

    async function handleCancel(order: OrderType) {
        const data = [...orders]
        const index = orders.indexOf(order)
        data[index] = { ...orders[index], isCanceling: true }
        mutate(source_url, data, false)
        await fetch(`http://${HOSTNAME}:3001/order/${order._id}/cancel`)
        mutate(source_url)
    }

    function handleShowAll() {
        setLimit(orders.length)
    }
    const exclude = orders.map(order => order.orderId)

    return <>
        <Component
            {...props}
            //limit={limit}
            amount={amount}
            commission={commission}
            payment={payment}
            onShowAll={handleShowAll}
            onSync={handleSync}
            onCancel={handleCancel}
            onSelectOrders={toogleShow}
            onRemoveCollection={handleRemoveCollection} />
        {props.figi && <SelectOperation
            show={show}
            figi={props.figi}
            exclude={exclude}
            onSelect={handleSelect}
            onClose={toogleShow} />}
    </>
}

export function ModalOrderInfoButton({ order, children = null, onSync, onCancel, variant = "info" }: { order: OrderType, children: React.ReactNode, onSync(order: OrderType): Promise<void>, onCancel(order: OrderType): Promise<void>, variant: string }) {
    const [show, setShow] = useState(false)
    function showToogle() {
        setShow(!show)
    }

    return <>
        <Button
            onClick={showToogle}
            variant={variant}
            size="sm">
            {children}
        </Button>
        <SimpleOrderInfoModal
            onSync={onSync}
            onCancel={onCancel}
            title="Order deatails"
            order={order}
            show={show}
            onHide={showToogle} />
    </>
}



export function OrdersTableView({ orders, onRemoveCollection, onSync, onCancel, amount, commission, payment }: OrdersProviderInterface & OrdersCtrlInterface) {
    return <>
        <Table
            responsive
            size="sm"
            striped
            hover>
            <thead>
                <tr>
                    <th></th>
                    <th>Type</th>
                    <th className="text-right">Req.</th>
                    <th className="text-right">Price</th>
                    <th>Status</th>
                    <th className="text-right">Exec.</th>
                    <th className="text-right">Payment</th>
                    <th>Created</th>
                    <th className="text-right">Commission</th>
                    <th></th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {
                    orders.map((order, index) =>
                        <tr key={order.orderId}
                            className={order.status === "Decline" ? "text-muted" : ""}>
                            <td>
                                <ModalOrderInfoButton
                                    order={order}
                                    onSync={onSync}
                                    variant={"secondary"}
                                    onCancel={onCancel}>Show</ModalOrderInfoButton>
                            </td>
                            <td>{order.operation}</td>
                            <td className="text-right">{order.requestedLots}</td>
                            <td className="text-right">
                                <Price price={order.price} />
                            </td>
                            <td>{order.status}</td>
                            <td className="text-right">{order.executedLots}</td>
                            <td className="text-right">
                                <Price price={order.payment} />
                            </td>
                            <td className="text-monospace text-nowrap">
                                <Moment format="DD.MM.YYYY HH:mm:ss">{order.createdAt}</Moment>
                            </td>
                            <td className="text-right">
                                {order.commission && <Price price={order.commission.value} />}
                            </td>
                            <td>
                                {!order.isSynced && <Button
                                    size="sm"
                                    variant="info"
                                    disabled={order.isSyncing}
                                    onClick={() => onSync(order)}>
                                    {order.isSyncing && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                                    {!order.isSyncing && 'Sync'}
                                </Button>}
                            </td>
                            <td>
                                <Button
                                    size="sm"
                                    variant="danger"
                                    onClick={() => onRemoveCollection(order)}>Remove</Button>
                            </td>
                        </tr>
                    )
                }
            </tbody>
            <tfoot>
                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th className="text-right">{amount}</th>
                    <th className="text-right"><Price price={payment} /></th>
                    <th></th>
                    <th className="text-right"><Price price={commission} /></th>
                    <th></th>
                    <th></th>
                </tr>
            </tfoot>
        </Table>
    </>
}

interface SimpleModalInterface extends ModalProps {
    title: string
}

export const SimpleModal = <TProps extends object>(Component: React.ComponentType<TProps>): React.FC<TProps & SimpleModalInterface> => (props) => {
    return <Modal
        show={props.show}
        onHide={props.onHide}>
        <Modal.Header closeButton>
            <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Component {...props as TProps} />
        </Modal.Body>
    </Modal>
}
const SimpleOrderInfoModal = SimpleModal(OrderInfoView)

interface OrderInfoInterface extends OrderCtrlInterface {
    order: OrderType
}

function OrderInfoView({ order, onSync, onCancel }: OrderInfoInterface) {
    async function handleSync() {
        onSync(order)
    }
    async function handleCancel() {
        onCancel(order)
    }
    return <>
        <Table hover size="sm">
            <tbody>
                <tr>
                    <th>Status</th>
                    <td>{order.status}</td>
                </tr>
                <tr>
                    <th>Date</th>
                    <td>
                        <Moment format="D MMMM YYYY HH:mm:ss">{order.date}</Moment>
                    </td>
                </tr>
                <tr>
                    <th>Requestred Lots</th>
                    <td>{order.requestedLots}</td>
                </tr>
                <tr>
                    <th>Executed Lots</th>
                    <td>{order.executedLots}</td>
                </tr>
                <tr>
                    <th>Price</th>
                    <td>{order.price} {order.currency}</td>
                </tr>
                <tr>
                    <th>Payment</th>
                    <td>{order.payment} {order.currency}</td>
                </tr>
                <tr>
                    <th>Commission</th>
                    {order.commission && <td>{order.commission.value} {order.commission.currency}</td>}
                    {!order.commission && <td>-</td>}
                </tr>
                <tr>
                    <th>Figi</th>
                    <td>{order.figi}</td>
                </tr>
                <tr>
                    <th>Operation</th>
                    <td>{order.operation}</td>
                </tr>
                <tr>
                    <th>Id</th>
                    <td>{order.orderId}</td>
                </tr>
                <tr>
                    <th>Is synced</th>
                    <td>{order.isSynced ? "yes" : "no"}</td>
                </tr>
            </tbody>
        </Table>
        <h2>Trades</h2>
        <Table hover size="sm" responsive>
            <thead>
                <tr>
                    <th>Price</th>
                    <th>Quantity</th>
                    <th>Date</th>
                    <th>Trade ID</th>
                </tr>
            </thead> 
            <tbody>
                {
                    order.trades && order.trades.map(trade =>
                        <tr key={trade._id}>
                            <td><Price price={trade.price} /></td>
                            <td>{trade.quantity}</td>
                            <td>
                                <Moment format="D MMMM YYYY HH:mm:ss">{trade.date}</Moment>
                            </td>
                            <td>{trade.tradeId}</td>
                        </tr>
                    )
                }
            </tbody>
        </Table>
        <Form.Group>
            <Button
                onClick={handleSync}
                disabled={order.isSyncing}
                variant="primary"
                block>
                {order.isSyncing && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                {order.isSyncing ? ' Syncing...' : 'Sync'}
            </Button>
        </Form.Group>
        <Form.Group>
            <Button
                onClick={handleCancel}
                disabled={order.isCanceling}
                variant="danger"
                block>
                {order.isCanceling && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>}
                {order.isCanceling ? ' Canceling...' : 'Cancel'}
            </Button>
        </Form.Group>
    </>
}

export const OrdersTable = Paginator<OrdersProviderInterface & OrdersCtrlInterface>((props) => {
    return <>
        {props.pages_number > 1 && <Pagination className="pagination">
            <Pagination.First onClick={props.onSelectFirstPage} disabled={props.first_page_disabled} />
            <Pagination.Prev onClick={props.onPrevPage} disabled={props.prev_page_disabled} />
            <Pagination.Next onClick={props.onNextPage} disabled={props.next_page_disabled} />
            <Pagination.Last onClick={props.onSelectLastPage} disabled={props.last_page_disabled} />
        </Pagination>}
        <Card >
            <Card.Header>Orders {props.first_item_on_page_index + 1} - {props.last_item_on_page_index + 1} из {props.items_number}</Card.Header>
            <OrdersTableView {...props} />
        </Card>
        <style jsx global>{`
            .page-link {
                min-width: 34px;
                text-align: center;
            }
        `}</style>
    </>
}, 'orders')