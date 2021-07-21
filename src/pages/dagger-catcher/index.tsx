import Head from "next/head"
import Link from "next/link"
import React from "react"
import { Button, Card, Container, ModalProps, Table } from "react-bootstrap"
import { MarketInstrumentField, PriceChange } from "../../components/Candle"
import { withModal } from "../../components/ChartModal"
import { DaggerCatcherCtrl, DaggerCatcherCtrlInterface } from "../../components/DaggerCatcher/DaggerCatcherController"
import { daggerCatchersProvider } from "../../components/DaggerCatcher/DaggerCatcherProvider"
import Header from "../../components/Header"
import { TinLink } from "../../components/Links"
import { MarketInstrumentPrice } from "../../components/Price"
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
        <DaggerCatchers isHidden={false}/>
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
                        <th style={{ width: "1px" }} className="text-right">Last Price</th>
                        <th style={{ width: "1px" }} className="text-right">Price Change</th>
                        <th>Charts</th>
                        <th>App</th>
                        <th style={{ "width": "1px" }}></th>
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
        <td className="text-right">
            <MarketInstrumentPrice figi={daggerCatcher.figi} color currency />
        </td>
        <td className="text-right">
            <PriceChange figi={daggerCatcher.figi} days_shift={-1} />
        </td>
        <td>
            <ModalChart figi={daggerCatcher.figi} />
        </td>
        <td>
            <TinLink figi={daggerCatcher.figi} />
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

const ModalChart = withModal(({ onShow }: ModalProps) => (
    <Button variant="secondary" size="sm" onClick={onShow}>
        <i className="fa fa-chart-line" />
    </Button>
))