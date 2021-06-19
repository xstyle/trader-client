import { OperationType, OperationTypeWithCommission } from "@tinkoff/invest-openapi-js-sdk/build/domain.d"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { ComponentType, FC, useState } from "react"
import { Badge, Button, ButtonToolbar, Card, Container, Form, Table } from "react-bootstrap"
import ReactDatePicker from "react-datepicker"
import "react-datepicker/dist/react-datepicker.css"
import Moment from "react-moment"
import { MarketInstrumentField } from "../components/Candle"
import Header from "../components/Header"
import { operationsProvider } from "../components/Operation/OperationProvider"
import OperationsStatisticsView from "../components/Operation/OperationsStatistics"
import { MultiSelectButtonGroupView } from "../components/SelectGroupButton"
import { TickerNavbar } from "../components/TickerNavbar"
import { OperationsProvider, OperationsProviderParams, OperationStatus } from "../types/OperationType"
import { defaultGetServerSideProps } from "../utils"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>My operations</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    const { query } = useRouter()
    return <>
        {
            query.figi ?
                <TickerNavbar
                    figi={query.figi as string}
                    activeKey="operations" /> :
                null
        }
        <Container fluid>
            <h1>Operations</h1>
            <Layout figi={query.figi as string | undefined} />
        </Container>
    </>
}

const Layout = operationsCtrl<{ figi: string | undefined }>(LayoutView)

type DateRange = {
    start_date?: Date,
    end_date?: Date,
    status: OperationStatus[]
    types: OperationTypeWithCommission[]
}

interface OperationsCtrl {
    onDataRangeChange: (date: [Date, Date]) => void
    onSetStart(date: string): void
    onSetEnd(date: string): void
    onToogleStatus(status: OperationStatus): void
    onToogleOperationType(type: OperationTypeWithCommission): void
    onClearStatus(): void
}

function operationsCtrl<TProps extends {}>(Component: ComponentType<TProps & OperationsCtrl & DateRange>): FC<TProps> {
    return (props) => {
        const [state, setState] = useState<DateRange>({
            status: ["Done"],
            types: ["Buy", "Sell"]
        })
        Date
        function handleDateRangeChange([start_date, end_date]: [Date, Date?]) {
            start_date.setHours(0, 0, 0, 0)
            end_date && end_date.setHours(23, 59, 59, 999)
            setState({
                ...state,
                start_date: start_date,
                end_date: end_date
            })
        }

        const handleSetStart = (date: string) => {

        }

        const handleSetEnd = (date: string) => {

        }

        function handleToogleStatus(status: OperationStatus) {
            const index = state.status.indexOf(status)
            const _status = [...state.status]
            if (index > -1) {
                _status.splice(index, 1)
            } else {
                _status.push(status)
            }
            setState({ ...state, status: _status })
        }

        function handleToogleOperationStatus(type: OperationType) {
            const index = state.types.indexOf(type)
            const types = [...state.types]
            if (index > -1) {
                types.splice(index, 1)
            } else {
                types.push(type)
            }
            setState({ ...state, types })
        }

        function handleClearStatus() {
            setState({
                ...state,
                status: [...defaultStatuses]
            })
        }

        return <Component
            {...props}
            {...state}
            onDataRangeChange={handleDateRangeChange}
            onSetStart={handleSetStart}
            onSetEnd={handleSetEnd}
            onToogleStatus={handleToogleStatus}
            onToogleOperationType={handleToogleOperationStatus}
            onClearStatus={handleClearStatus}
        />
    }
}

const defaultStatuses: OperationStatus[] = ["Done", "Decline"]
const defaultTypes: OperationTypeWithCommission[] = ["Sell", "Buy", "BuyCard", "MarginCommission", "BrokerCommission"]

function LayoutView(props: OperationsCtrl & DateRange) {
    return <>
        <Form.Group>
            <ReactDatePicker
                selected={props.start_date}
                onChange={props.onDataRangeChange}
                startDate={props.start_date}
                endDate={props.end_date}
                monthsShown={3}
                selectsRange
                inline
            />
        </Form.Group>
        <ButtonToolbar>
            <MultiSelectButtonGroupView
                options={defaultStatuses.map(status => ({ name: status, value: status }))}
                values={props.status}
                onSelect={props.onToogleStatus} />
            <Button
                className="ml-3 mr-3 mb-3"
                size="sm"
                onClick={props.onClearStatus}>All</Button>
            <MultiSelectButtonGroupView
                options={defaultTypes.map(type => ({ name: type, value: type }))}
                values={props.types}
                onSelect={props.onToogleOperationType} />
        </ButtonToolbar>
        {
            props.start_date && props.end_date ?
                <Operations
                    {...props}
                    start_date={props.start_date.toISOString()}
                    end_date={props.end_date.toISOString()} /> :
                null
        }
    </>
}

const Operations = operationsProvider(OperationsView)

function OperationsView(props: OperationsProvider & OperationsProviderParams & OperationsCtrl) {
    const { figi } = props
    return <>
        {
            figi ?
                <Form.Group>
                    <Link
                        passHref
                        href={{
                            pathname: "/operations",
                            query: {}
                        }}>
                        <Badge variant="primary">
                            <MarketInstrumentField
                                figi={figi}
                                fieldName="name" /> <span aria-hidden="true">&times;</span>
                        </Badge>
                    </Link>
                </Form.Group> :
                null
        }
        <Card className="mb-3">
            <OperationTableView {...props} />
        </Card>
        <OperationsStatisticsView {...props} />
    </>
}

function OperationTableView({ operations, figi, onSetEnd, onSetStart }: OperationsProvider & OperationsCtrl & { figi?: string }) {
    const { query } = useRouter()
    return <Table
        hover
        responsive
        size="sm">
        <thead className="thead-sticky">
            <tr>
                <th>#</th>
                <th>Type</th>
                <th>Ticker</th>
                <th>Status</th>
                <th>Date</th>
                <th></th>
                <th>Quantity</th>
                <th>Quantity Executed</th>
                <th>Price</th>
                <th>Payment</th>
                <th>Currency</th>
                <th>Trades</th>
            </tr>
        </thead>
        <tbody>
            {
                operations.map((item, index) =>
                    <tr key={item.id}>
                        <th>{operations.length - index}</th>
                        <td>{item.operationType}</td>
                        <td>
                            {
                                item.figi ? <Link
                                    href={{
                                        pathname: "/operations",
                                        query: {
                                            ...query,
                                            figi: item.figi
                                        }
                                    }}>
                                    <a>
                                        <MarketInstrumentField
                                            figi={item.figi}
                                            fieldName="ticker" />
                                    </a>
                                </Link> :
                                    null
                            }
                        </td>
                        <td>{item.status}</td>
                        <td>
                            <Moment
                                fromNow
                                withTitle
                                titleFormat="DD/MM/YYYY  HH:mm:ss">{item.date}</Moment>
                        </td>
                        <td>
                            <Button
                                onClick={() => onSetStart(item.date)}>start</Button> <Button
                                    onClick={() => onSetEnd(item.date)}>end</Button>
                        </td>
                        <td>{item.quantity}</td>
                        <td><b>{item.quantityExecuted}</b></td>
                        <td className="text-right text-monospace">{item.price && item.price.toFixed(2)}</td>
                        <td className="text-right text-monospace">{item.payment.toFixed(2)}</td>
                        <td>{item.currency}</td>
                        <td>{item.trades && item.trades.length}</td>
                    </tr>
                )
            }
        </tbody>
        <tfoot className="tfoot-sticky">
            <tr>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th></th>
                <th>{figi && operations.reduce((amount, operation) => {
                    switch (operation.operationType) {
                        case 'Buy':
                            return amount + operation.quantityExecuted
                            break
                        case 'Sell':
                            return amount - operation.quantityExecuted
                            break
                        default:
                            return amount
                            break
                    }
                }, 0)}</th>
                <th></th>
                <th className="text-right text-monospace">{
                    (Math.round(operations.reduce((result, operation) => result + operation.payment, 0) * 100) / 100).toFixed(2)
                }</th>
                <th></th>
                <th></th>
            </tr>
        </tfoot>
    </Table>
}