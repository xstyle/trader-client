import Head from "next/head";
import Link from "next/link";
import React from "react";
import { Button, Card, Container, Table } from "react-bootstrap";
import Moment from "react-moment";
import { PageWithHeader } from "../../components/Header";
import { historiesProvider, HistoriesProviderInterface } from "../../components/History/HistoryProvider";
import { MarketInstrumentField } from "../../components/Candle";
import { defaultGetServerSideProps } from "../../utils"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <PageWithHeader>
        <Head>
            <title>My Histories</title>
        </Head>
        <Body />
    </PageWithHeader>
}

function Body() {
    return <Container fluid>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h1>Histories</h1>
            <Link href="/history/new" passHref>
                <Button variant="primary">Create</Button>
            </Link>
        </div>
        <Histories />
    </Container>
}

const Histories = historiesProvider(HistoriesView)

function HistoriesView({ histories }: HistoriesProviderInterface) {
    return <Card>
        <Table hover responsive>
            <thead>
                <tr>
                    <th>Title</th>
                    <th>Ticker</th>
                    <th>Type</th>
                    <th>Created</th>
                    <th style={{ "width": "1px" }}></th>
                </tr>
            </thead>
            <tbody>
                {
                    histories.map(history =>
                        <tr key={history._id}>
                            <td>
                                <Link href={`/history/${history._id}`}>
                                    {history.title || '-'}
                                </Link>
                            </td>
                            <td>
                                <Link
                                    href={`/ticker/${history.figi}`}
                                    passHref>
                                    <a>
                                        <MarketInstrumentField figi={history.figi} fieldName="ticker" />
                                    </a>
                                </Link>
                            </td>
                            <td>{history.type || '-'}</td>
                            <td className="text-nowrap">
                                <Moment format="D MMMM YYYY">{history.created_at}</Moment>
                            </td>
                            <td>
                                <Link href={`/history/${history._id}/edit`} passHref>
                                    <Button
                                        variant="secondary"
                                        size="sm">
                                        <i className="fa fa-edit" />
                                    </Button>
                                </Link>
                            </td>
                        </tr>
                    )
                }
            </tbody>
        </Table>
    </Card>
}