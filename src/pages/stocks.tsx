import { useFormik } from "formik"
import Head from "next/head"
import Link from "next/link"
import React, { ChangeEventHandler, MouseEventHandler, useState } from "react"
import { Button, Card, Col, Container, Form, Table } from "react-bootstrap"
import VisibilitySensor from "react-visibility-sensor"
import Header from "../components/Header"
import { MarketInstrumentPrice } from "../components/Price"
import { SelectList } from "../components/SelectList"
import { stocksProdiver } from "../components/Stock/StockProvider"
import { getTickerUrl } from "../lib/link"
import { StocksProviderInterface } from "../types/StockType"
import { defaultGetServerSideProps } from "../utils"
import { HOSTNAME } from '../utils/env'

export const getServerSideProps = defaultGetServerSideProps

interface StocksCtrlInterface {
    search: string
    onChange: ChangeEventHandler<HTMLInputElement>
    onUpdateDb: MouseEventHandler<HTMLButtonElement>
    is_updating: boolean
}

function StocksTableView({ instruments, onAddTo }: StocksProviderInterface & StocksTableCtrlInterface) {
    const offset = {
        top: -1000,
        bottom: -1000
    }
    return <Card>
        <Table
            className="card-table"
            responsive
            hover
            size="sm">
            <thead>
                <tr>
                    <th></th>
                    <th>Ticker</th>
                    <th className="text-right">Price</th>
                    <th>Name</th>
                    <th>Step</th>
                    <th>Lot</th>
                    <th>Currency</th>
                    <th>Type</th>
                    <th>FIGI</th>
                </tr>
            </thead>
            <tbody>
                {
                    instruments.map((instrument, index) =>
                        <tr key={instrument.figi}>
                            <td>
                                <Button
                                    variant="secondary"
                                    className="text-nowrap"
                                    size="sm"
                                    onClick={() => onAddTo(instrument.figi)}>Lists</Button>
                            </td>
                            <th>
                                <Link href={getTickerUrl(instrument.figi)}>
                                    <a>{instrument.ticker}</a>
                                </Link>
                            </th>
                            <VisibilitySensor
                                partialVisibility
                                intervalCheck
                                offset={offset}
                            >
                                {({ isVisible }) =>
                                    <td className="text-right">
                                        {isVisible && <MarketInstrumentPrice figi={instrument.figi} placeholder={0} />}
                                    </td>
                                }
                            </VisibilitySensor>
                            <td>{instrument.name}</td>
                            <td>{instrument.minPriceIncrement}</td>
                            <td>{instrument.lot}</td>
                            <td>{instrument.currency}</td>
                            <td>{instrument.type}</td>
                            <td>{instrument.figi}</td>
                        </tr>
                    )
                }
            </tbody>
        </Table >
    </Card>
}

interface StocksTableCtrlInterface {
    onAddTo(figi: string): void
}

function StocksTableCtrl<TProps extends {}>(Component: React.ComponentType<TProps & StocksTableCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const [figi, setFigi] = useState('')
        function handleAddTo(figi: string) {
            setFigi(figi)
        }

        function handleClose() {
            setFigi('')
        }

        return <>
            <Component
                {...props}
                onAddTo={handleAddTo} />
            <SelectList
                figi={figi}
                show={!!figi}
                onClose={handleClose} />
        </>
    }
}

const StocksTable = stocksProdiver(StocksTableCtrl(StocksTableView))

function StocksCtrl<TProps extends {}>(Component: React.ComponentType<TProps & StocksCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const [is_updating, setUpdating] = useState(false)
        const { values: { search }, handleChange } = useFormik({
            initialValues: { search: '' },
            onSubmit: () => { }
        })

        async function handleUpdateDb() {
            setUpdating(true)
            await fetch(`http://${HOSTNAME}:3001/ticker/updatedb`)
            // mutate(props.source_url)
            setUpdating(false)
        }
        return <Component
            {...props}
            search={search}
            onChange={handleChange}
            onUpdateDb={handleUpdateDb}
            is_updating={is_updating} />
    }
}

function StocksView({ search, onChange, is_updating, onUpdateDb }: StocksCtrlInterface) {
    return <>
        <Form.Group>
            <Form.Row>
                <Col>
                    <Form.Control
                        name="search"
                        placeholder="Type text to search stocks..."
                        value={search}
                        onChange={onChange} />
                </Col>
                <Col xs="auto">
                    <Button
                        variant="dark"
                        disabled={is_updating}
                        onClick={onUpdateDb}>{is_updating ? "Updating..." : "Update DB of stocks"}</Button>
                </Col>
            </Form.Row>
        </Form.Group>

        <StocksTable search={search} />
    </>
}

const Stocks = StocksCtrl(StocksView)

function Body() {
    return <Container fluid>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h1>Stocks</h1>
        </div>
        <Stocks />
    </Container>
}

export default function Page() {
    return <>
        <Head>
            <title>Stocks</title>
        </Head>
        <Header />
        <Body />
    </>
}