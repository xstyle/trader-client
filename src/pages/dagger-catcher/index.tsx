import Head from "next/head"
import Link from "next/link"
import React from "react"
import { Button, Card, Container, ModalProps, Table } from "react-bootstrap"
import { lastCandleProvider, LastCandleProviderInterface, MarketInstrumentField } from "../../components/Candle"
import { withModal } from "../../components/ChartModal"
import { DaggerCatcherCtrl, DaggerCatcherCtrlInterface } from "../../components/DaggerCatcher/DaggerCatcherController"
import { daggerCatchersProvider } from "../../components/DaggerCatcher/DaggerCatcherProvider"
import Header from "../../components/Header"
import { TinLink } from "../../components/Links"
import { DaggerCatcherProviderInterface, DaggerCatchersProviderInterface } from "../../types/DaggerCatcherType"
import { defaultGetServerSideProps } from "../../utils"

export const getServerSideProps = defaultGetServerSideProps

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

function View({ daggerCatchers, source_url }: DaggerCatchersProviderInterface) {
    if (daggerCatchers.length === 0) {
        return <div className="alert alert-info">
            You have't created any <b>Dagger Catcher</b>.
            </div>
    }
    return <>
        <Card>
            <Table
                responsive
                striped
                hover
                size="sm">
                <thead>
                    <tr>
                        <th style={{ width: "1px" }}></th>
                        <th style={{ width: "1px" }}>Ticker</th>
                        <th style={{ width: "1px" }} className="text-right">Price</th>
                        <th>App</th>
                        <th>Charts</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        daggerCatchers.map(daggerCatcher => <TableRow key={daggerCatcher._id} daggerCatcher={daggerCatcher} source_url={source_url} />)
                    }
                </tbody>
            </Table>
        </Card>
    </>
}

const TableRow = DaggerCatcherCtrl(TableRowView)

function TableRowView({ daggerCatcher, onSetPinned }: DaggerCatcherCtrlInterface & DaggerCatcherProviderInterface) {
    return <tr key={daggerCatcher._id}>
        <td>
            <Button variant={daggerCatcher.is_pinned ? "warning" : "secondary"} size="sm" onClick={onSetPinned}>
                <i className="fas fa-thumbtack"></i>
            </Button>
        </td>
        <td>
            <Link
                href={`/dagger-catcher/${daggerCatcher.figi}`}>
                <a>
                    <MarketInstrumentField
                        figi={daggerCatcher.figi}
                        fieldName="ticker" />
                </a>
            </Link>
        </td>
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
                    variant="secondary"><i className="fa fa-edit" /></Button>
            </Link>
        </td>
    </tr>
}

function ColorPriceView({ candle }: LastCandleProviderInterface) {
    if (!candle) return null
    return <span className={candle.change && (candle.change > 0) ? "text-success" : candle.change && (candle.change < 0) ? "text-danger" : ""}>{candle.c.toFixed(2)}</span>
}

const ColorPrice = lastCandleProvider(ColorPriceView)

const ModalChart = withModal(({ onShow }: ModalProps) => (<Button variant="link" size="sm" onClick={onShow}>Chart</Button>))