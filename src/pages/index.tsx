import moment from "moment"
import Head from "next/head"
import React from "react"
import { Container } from 'react-bootstrap'
import Header from '../components/Header'
import { OrdersCtrl, ordersProvider, OrdersView } from '../components/Orders'
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
    const start_date = moment().add(-2, 'h').startOf('day').hours(10).toISOString()
    const end_date = moment().add(-2, 'h').endOf('day').add(2, 'h').toISOString()

    return <Container fluid>
        <h1>Events</h1>
        <h2>Today</h2>
        <Orders {...{ start_date, end_date }} />
    </Container>
}

const Orders = ordersProvider(OrdersCtrl(OrdersView))

export default Page