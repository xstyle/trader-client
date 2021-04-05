import moment from "moment"
import dynamic from "next/dynamic"
import React, { ComponentType, FC } from "react"
import { Pagination, Card, Table } from "react-bootstrap"
import Moment from "react-moment"
import { ReportDay } from "../types/ReportDayType"
import { OrderType } from "../types/OrderType"
import { Paginator, PaginatorInterface } from "../utils/pagination"

const Chart = dynamic<{ data: any }>(() => import("./Charts").then((mod) => mod.Chart), { ssr: false })

interface ReportCtrlInterface {
    days: ReportDay[]
}

function sumAmount(orders: OrderType[]) {
    return orders.reduce(amountReducer, 0)
}

function amountReducer(amount: number, operation: OrderType) {
    if (operation.status !== 'Done') return amount
    switch (operation.operation) {
        case 'Buy':
        case 'BuyCard':
            amount += operation.executedLots || operation.requestedLots
            break;
        case 'Sell':
            amount -= operation.executedLots || operation.requestedLots
            break;
        default:
            break;
    }
    return amount
}


function ReportsCtrl<TProps extends {}>(Component: React.ComponentType<TProps & ReportCtrlInterface>): React.FC<TProps & { orders: OrderType[] }> {
    return (props) => {
        const { orders } = props
        if (!orders.length) return null

        const days: ReportDay[] = []
        // step 0
        const first_date = moment(orders[orders.length - 1].createdAt)
        first_date.startOf('d')

        const amount = sumAmount(orders)
        const last_date = amount ? moment() : moment(orders[0].createdAt)
        last_date.endOf('d')

        // step 1
        const index_date = first_date.clone()
        while (index_date.isBefore(last_date)) {
            days.push({
                formatted_date: index_date.format('D.MM.YY'),
                date: index_date.toDate(),
                operations: [],
                amount: 0,
                change: 0,
                payment: 0,
                payment_amount: 0,
                turnover: 0,
                middle: 0,
            })
            index_date.add(1, 'd')
        }
        // step 2
        const operations_index = orders.reduce((index, order) => {
            const formatted_date = moment(order.createdAt).format('YYYY.MM.DD')
            if (!index[formatted_date]) index[formatted_date] = []
            index[formatted_date].push(order)
            return index
        }, {} as { [id: string]: OrderType[] })
        days.forEach(day => {
            const formatted_date = moment(day.date).format('YYYY.MM.DD')
            if (operations_index[formatted_date]) day.operations = operations_index[formatted_date]
        })
        //step 3
        days.forEach(day => {
            day.change = day.operations.reduce(amountReducer, 0)
        })
        // step 4
        days.forEach((day, index, array) => {
            day.amount = day.change + (index ? array[index - 1].amount : 0)
        })

        // step 5
        days.forEach(day => {
            day.payment = day.operations.reduce((payment, operation) => {
                if (operation.status !== 'Done') return payment
                return payment += operation.payment
            }, 0)
        })

        // step 6
        days.forEach((day, index, array) => {
            day.payment_amount = day.payment + (index ? array[index - 1].payment_amount : 0)
        })

        // step 7
        days.forEach((day, index, array) => {
            day.middle = day.amount ? Math.abs(day.payment_amount / day.amount) : 0
        })

        // step 8 
        days.forEach((day, index, array) => {
            day.turnover = day.operations.reduce((turnover, operation) => turnover + Math.abs(operation.payment || 0), 0)
        })

        return <Component
            {...props}
            days={days} />
    }
}

export const Reports = ReportsCtrl(ReportView)

function ReportView({ days }: ReportCtrlInterface) {
    return <>
        <Chart data={days} />
        <ReportTable days={days} />
    </>
}

const ReportTable = Paginator<ReportCtrlInterface>((props) => {
    return <>
        {props.pages_number > 1 && <Pagination>
            <Pagination.First onClick={props.onSelectFirstPage} disabled={props.first_page_disabled} />
            <Pagination.Prev onClick={props.onPrevPage} disabled={props.prev_page_disabled} />
            <Pagination.Next onClick={props.onNextPage} disabled={props.next_page_disabled} />
            <Pagination.Last onClick={props.onSelectLastPage} disabled={props.last_page_disabled} />
        </Pagination>}
        <Card>
            <Card.Header>{props.first_item_on_page_index + 1} - {props.last_item_on_page_index + 1} из {props.items_number}</Card.Header>
            <ReportTableView {...props} />
        </Card>

    </>
}, 'days')

function ReportTableView({ days, first_item_on_page_index }: ReportCtrlInterface & PaginatorInterface) {
    return <Table striped hover size="sm" responsive>
        <thead>
            <tr>
                <th>#</th>
                <th className="text-right">Date</th>
                <th className="text-right">Change</th>
                <th className="text-right">Value</th>
                <th className="text-right">Operations</th>
                <th className="text-right">Turnover</th>
                <th className="text-right">Payment</th>
                <th className="text-right">Payment Amount</th>
                <th className="text-right">Middle</th>
            </tr>
        </thead>
        <tbody>
            {
                days.map((day, index) =>
                    <tr key={day.date.toString()}>
                        <td>{index + 1 + first_item_on_page_index}</td>
                        <td className="text-monospace text-right text-nowrap"><Moment format="D MMM YY">{day.date}</Moment></td>
                        <td className={`text-right ${!day.change ? "text-muted" : ""}`}>{day.change}</td>
                        <td className={`text-right ${!day.change ? "text-muted" : ""}`}>{day.amount}</td>
                        <td className={`text-monospace text-right ${!day.operations.length ? "text-muted" : ""}`}>{day.operations.length}</td>
                        <td className={`text-monospace text-right ${!day.turnover ? "text-muted" : ""}`}>{day.turnover.toFixed(2)}</td>
                        <td className={`text-monospace text-right ${!day.payment ? "text-muted" : ""}`}>{day.payment.toFixed(2)}</td>
                        <td className={`text-monospace text-right ${!day.payment ? "text-muted" : ""}`}>{day.payment_amount.toFixed(2)}</td>
                        <td className={`text-monospace text-right ${!day.payment ? "text-muted" : ""}`}>{day.middle.toFixed(2)}</td>
                    </tr>
                )
            }
        </tbody>
    </Table>
}