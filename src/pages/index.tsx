import { OrderStatus } from "@tinkoff/invest-openapi-js-sdk/build/domain"
import moment from "moment"
import Head from "next/head"
import React, { useState } from "react"
import { Container } from 'react-bootstrap'
import Header from '../components/Header'
import { ordersProvider, OrdersView } from '../components/Orders'
import { SelectButtonGroupView } from "../components/SelectGroupButton"
import { OperationStatus } from "../types/OperationType"
import { defaultGetServerSideProps } from "../utils"

export const getServerSideProps = defaultGetServerSideProps

function Page() {
    return <>
        <Head>
            <title>TraderBots</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    const start_date = moment().add(-2, 'h').startOf('day').hours(7).toISOString()
    const end_date = moment().add(-2, 'h').endOf('day').add(2, 'h').toISOString()
    const [status, setStatus] = useState<OrderStatus | OperationStatus>()
    const options: { name: string, value?: OrderStatus | OperationStatus }[] = [
        { name: 'All' },
        { name: 'Done', value: 'Done' },
        { name: 'Rejected', value: 'Rejected' },
        { name: 'New', value: 'New' }
    ]
    return <Container fluid>
        <h1>Events</h1>
        <h2>Today</h2>
        <SelectButtonGroupView
            value={status}
            onSelect={setStatus}
            options={options} />
        <Orders {...{ start_date, end_date, status }} />
    </Container>
}

const Orders = ordersProvider(OrdersView)

export default Page