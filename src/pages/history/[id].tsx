import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React from "react";
import { Breadcrumb, Button, Card, Container } from "react-bootstrap";
import Moment from "react-moment";
import { PageWithHeader } from "../../components/Header";
import { historyProvider } from "../../components/History/HistoryProvider";
import OperationsStatisticsView from "../../components/Operation/OperationsStatistics";
import { ordersProvider } from "../../components/Orders";
import { OrdersCollection } from "../../components/OrdersCollection";
import { HistoryProviderInterface } from "../../types/HistoryType";
import { defaultGetServerSideProps } from "../../utils";

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <PageWithHeader>
        <Head>
            <title>History</title>
        </Head>
        <Body />
    </PageWithHeader>
}

const History = historyProvider(HistoryView)

function Body() {
    const { query } = useRouter()
    return <Container fluid>
        <Breadcrumb>
            <Link
                href="/history"
                passHref>
                <Breadcrumb.Item>Histories</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>History</Breadcrumb.Item>
        </Breadcrumb>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h1>History</h1>
            <Link
                href={`/history/${query.id}/edit`}
                passHref>
                <Button
                    size="sm"
                    variant="secondary">
                    <i className="fa fa-edit" />
                </Button>
            </Link>
        </div>
        <History id={query.id as string} />
    </Container>
}

function HistoryView({ history }: HistoryProviderInterface) {
    return <>
        <Card className="mb-3">
            <Card.Header>
                {history.title}
            </Card.Header>
            <Card.Body>
                <dl className="row">
                    <dt className="col-sm-3">Created</dt>
                    <dd className="col-sm-9 text-muted">
                        <Moment format="D MMMM YYYY HH:mm:ss">{history.created_at}</Moment>
                    </dd>
                    <dt className="col-sm-3">Type</dt>
                    <dd className="col-sm-9 text-muted">{history.type || '-'}</dd>
                    <dt className="col-sm-3">Collection ID</dt>
                    <dd className="col-sm-9 text-muted">{history.collection_id || '-'}</dd>
                    <dt className="col-sm-3">Description</dt>
                    <dd className="col-sm-9 text-muted">{history.description}</dd>
                </dl>
            </Card.Body>
        </Card>
        <h2 className="mb-3 mt-5">Statistics</h2>
        <Card>
            <OperationsStatistics
                collection={history._id}
                figi={history.figi} />
        </Card>
        <OrdersCollection
            collection={history._id}
            figi={history.figi} />
    </>
}

const OperationsStatistics = ordersProvider((props) => {
    return <OperationsStatisticsView
        operations={props.orders.map(order => ({
            operationType: order.operation,
            figi: order.figi,
            payment: order.payment,
            quantityExecuted: order.executedLots
        }))} />
})