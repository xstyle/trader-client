import Head from "next/head"
import Link from "next/link"
import React from "react"
import { Button, Card, Container, ModalProps, Table } from "react-bootstrap"
import { withModal } from "../../components/ChartModal"
import { daggerCatchersProvider } from "../../components/DaggerCatcher/DaggerCatcherProvider"
import Header from "../../components/Header"
import { TinLink } from "../../components/Links"
import { TickerInfo, tickerProvider, TickerProviderInterface } from "../../components/Ticker"
import { DaggerCatchersProviderInterface } from "../../types/DaggerCatcherType"

export default function Page() {
    return <>
        <Head>
            <title>Dagger Catchers</title>
        </Head>
        <Header />
        <Body />
    </>
}

const DaggerCatchers = daggerCatchersProvider(View)

function Body() {
    return <Container fluid>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h1>Dagger Catchers</h1>
            <Link
                href="/dagger-catcher/new"
                passHref>
                <Button variant="primary">Create</Button>
            </Link>
        </div>
        <DaggerCatchers />
    </Container>
}

function View({ daggerCatchers }: DaggerCatchersProviderInterface) {
    if (daggerCatchers.length === 0) {
        return <div className="alert alert-info">
            You have't created any <b>Dagger Catcher</b>.
            </div>
    }
    return <Card>
        <Table
            responsive
            striped
            hover
            size="sm">
            <thead>
                <tr>
                    <th>Name</th>
                    <th className="text-right">Price</th>
                    <th>Tinkoff</th>
                    <th>Charts</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {
                    daggerCatchers.map(daggerCatcher =>
                        <tr key={daggerCatcher._id}>
                            <th>
                                <Link
                                    href={`/dagger-catcher/${daggerCatcher.figi}`}>
                                    <a>
                                        <TickerInfo
                                            figi={daggerCatcher.figi}
                                            fieldName="ticker" />
                                    </a>
                                </Link>
                            </th>
                            <td className="text-monospace text-right">
                                <Link href={`/ticker/${daggerCatcher.figi}`}>
                                    <a className="text-body">
                                        <ColorPrice figi={daggerCatcher.figi} />
                                    </a>
                                </Link>
                            </td>
                            <td>
                                <TinLink figi={daggerCatcher.figi} />
                            </td>
                            <td>
                                <ModalChart figi={daggerCatcher.figi} />
                            </td>
                            <td>
                                <Link
                                    href={`/dagger-catcher/${daggerCatcher._id}/edit`}
                                    passHref>
                                    <Button
                                        size="sm"
                                        variant="outline-success">Edit</Button>
                                </Link>
                            </td>
                        </tr>
                    )
                }
            </tbody>
        </Table>
    </Card>
}

function ColorPriceView({ ticker }: TickerProviderInterface) {
    if (!ticker) return null
    return <span className={ticker.change && (ticker.change > 0) ? "text-success" : ticker.change && (ticker.change < 0) ? "text-danger" : ""}>{ticker.c.toFixed(2)}</span>
}

const ColorPrice = tickerProvider(ColorPriceView)

const ModalChart = withModal(({ onShow }: ModalProps) => (<Button variant="link" size="sm" onClick={onShow}>Chart</Button>))