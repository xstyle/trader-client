import Head from 'next/head';
import Link from "next/link";
import { useRouter } from "next/router";
import { ChangeEventHandler, ComponentType, CSSProperties, FC, useEffect, useState } from "react";
import { Badge, Breadcrumb, Button, Card, Col, Container, Form, Nav, Row } from "react-bootstrap";
import Moment from "react-moment";
import Chart from "../../components/Chart";
import { daggerCatcherProvider, daggerCatchersProvider } from '../../components/DaggerCatcher/DaggerCatcherProvider';
import Header from "../../components/Header";
import { MutateOrders, OrdersCtrl, OrdersCtrlInterface, ordersProvider, OrdersProviderInterface, OrdersSourceUrlProviderOptions, OrdersTable } from "../../components/Orders";
import Price, { ColorPriceView, MarketInstrumentPrice } from "../../components/Price";
import { Reports } from '../../components/Reports';
import { useStatistica } from '../../components/Statistic/Statistic';
import useSuperCandle, { MarketInstrumentField, useMarketInstrument } from "../../components/Candle";
import { DaggerCatcherProviderInterface, DaggerCatchersProviderInterface } from '../../types/DaggerCatcherType';
import { SuperCandle } from "../../types/CandleType";
import { OrderType } from "../../types/OrderType";
import { defaultGetServerSideProps } from "../../utils";
import { getValueFromInput } from "../../utils/defaultTypePath";
import { MarketInstrument } from '@tinkoff/invest-openapi-js-sdk/build/domain.d';

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Header />
        <Body />
    </>
}

function Body() {
    const { query } = useRouter()
    const { id } = query
    if (!id) return null
    if (Array.isArray(id)) return null
    return <Container fluid>
        <Row>
            <Col xl="2" lg={3} md={4} className="d-none d-md-block">
                <SideBar id={id} />
            </Col>
            <Col xl="10" lg={9} md={8} >
                <DaggerCatcher id={id} />
            </Col>
        </Row>
    </Container>
}

const SideBar = daggerCatchersProvider(SideBarView)

const style: CSSProperties = { position: 'sticky', top: '1rem' };

function SideBarView({ id, daggerCatchers }: DaggerCatchersProviderInterface & { id: string }) {
    return <Nav
        variant="pills"
        style={style}
        className="flex-column">
        {
            daggerCatchers.map(catcher =>
                <Link
                    key={catcher._id}
                    href={`/dagger-catcher/${catcher.figi}`}
                    passHref>
                    <Nav.Link
                        active={catcher.figi === id}
                        className="d-flex flex-row justify-content-between">
                        <MarketInstrumentField
                            figi={catcher.figi}
                            fieldName="ticker" />
                        <div>
                            <Badge
                                pill
                                variant="light">
                                <MarketInstrumentPrice figi={catcher.figi} />
                            </Badge>
                        </div>
                    </Nav.Link>
                </Link>
            )
        }
    </Nav>
}

const DaggerCatcher = daggerCatcherProvider(DaggerCatcherCtrl(DaggerCatcherView))

function OrdersView(props: OrdersProviderInterface & OrdersCtrlInterface & OrdersSourceUrlProviderOptions & { figi: string }) {
    return <>
        <Statistica
            orders={props.orders}
            figi={props.figi} />
        <Form.Group>
            <Button
                variant="dark"
                size="sm"
                onClick={props.onSelectOrders}>Add orders</Button>
        </Form.Group>
        <OrdersTable {...props} />
        <h2>Report</h2>
        <Reports orders={props.orders} />
    </>
}

function Statistica({ orders, figi }: { figi: string, orders: OrderType[] }) {
    const candle = useSuperCandle(figi)
    const { lots, budget, price_per_share } = useStatistica(orders)
    if (!candle) return <div>Loading a candle...</div>

    const cost = lots * candle.c
    const result = budget + cost
    const profit = result / budget * 100

    return <>
        <p>Количество лотов {lots}. Бюджет <Price price={budget} />. Стоимость <Price price={cost} />$. Итог <b><Price price={result} />$</b>. Доходность <Price price={profit} />%.</p>
        <p>Средняя <Price price={price_per_share} /></p>
    </>
}

const Orders = ordersProvider(
    OrdersCtrl(
        OrdersView
    )
)

interface DaggerCatcherCtrlInterface {
    marketInstrument: MarketInstrument,
    candle: SuperCandle,
    state: {
        price: number,
        min: number,
        max: number,
        step: number,
        lots: number
    },
    onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    onSubmit(operation: "Sell" | "Buy"): void,
}

function DaggerCatcherCtrl<TProps extends DaggerCatcherProviderInterface>(Component: ComponentType<TProps & DaggerCatcherCtrlInterface>): FC<TProps> {
    return (props) => {
        const candle = useSuperCandle(props.daggerCatcher.figi)
        const { error, data: marketInstrument } = useMarketInstrument(props.daggerCatcher.figi)

        const initialState = {
            price: Math.round((props.daggerCatcher.max + props.daggerCatcher.min) * 100 / 2) / 100,
            min: props.daggerCatcher.min,
            max: props.daggerCatcher.max,
            step: 0.1,
            lots: 1,
        };

        const [state, setState] = useState(initialState)

        useEffect(() => {
            setState(initialState)
        }, [props.daggerCatcher])

        if (error) return <div>Error</div>
        if (!candle || !marketInstrument) return <div>Loading...</div>

        const handleChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement> = (event) => {
            const { target } = event
            const { name } = target
            const value = getValueFromInput(target)
            setState({ ...state, [name]: value })
        }

        async function handleSubmit(operation: "Sell" | "Buy") {
            try {
                await fetch(`${props.source_url}/order`, {
                    method: 'POST',
                    body: JSON.stringify({ ...state, operation }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                MutateOrders({
                    figi: props.daggerCatcher.figi,
                    collection: props.daggerCatcher._id
                })
            } catch (err) {
                console.error(err)
            }
        }

        return <Component
            {...props}
            state={state}
            onSubmit={handleSubmit}
            onChange={handleChange}
            candle={candle}
            marketInstrument={marketInstrument} />
    }
}

function DaggerCatcherView({ daggerCatcher: catcher, marketInstrument, onSubmit, state, onChange, candle }: DaggerCatcherProviderInterface & DaggerCatcherCtrlInterface) {
    return <>
        <Head>
            <title>${marketInstrument.ticker} {candle.c.toFixed(2)}</title>
        </Head>
        <Breadcrumb>
            <Link href="/dagger-catcher" passHref>
                <Breadcrumb.Item>Dagger Catchers</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>{marketInstrument.name}</Breadcrumb.Item>
        </Breadcrumb>
        <Row>
            <Col sm="12" md="6">
                <p className="text-monospace display-3 text-center">
                    <ColorPriceView candle={candle} />
                </p>
                <p className="text-monospace text-center">{candle.v.toFixed(0)} shares for <Moment durationFromNow interval={100}>{candle.time}</Moment></p>
                <p className="text-monospace text-center">{(candle.v * 1000 / (Date.now() - new Date(candle.time).getTime())).toFixed(0)} shares per second</p>
                <Card className="mb-4">
                    <Card.Body>
                        <Form>
                            <Form.Row>
                                <Col>
                                    <Form.Group>
                                        <Button
                                            block
                                            variant="success"
                                            size="lg"
                                            onDoubleClick={() => onSubmit('Buy')}
                                            type="button"><b>BUY</b> {state.lots} <Price price={state.lots * state.price} /></Button>
                                    </Form.Group>
                                </Col>
                                <Col>
                                    <Form.Group>
                                        <Button
                                            block
                                            variant="danger"
                                            size="lg"
                                            onDoubleClick={() => onSubmit('Sell')}
                                            type="button"><b>SELL</b> {state.lots} <Price price={state.lots * state.price} /></Button>
                                    </Form.Group>
                                </Col>
                            </Form.Row>
                            <Form.Group controlId="formBasicRangeCustom">
                                <Form.Label>Price <Price price={state.price} as="b" /></Form.Label>
                                <Form.Control
                                    name="price"
                                    type="range"
                                    min={state.min}
                                    max={state.max}
                                    step={state.step}
                                    //custom
                                    value={state.price}
                                    onChange={onChange} />
                            </Form.Group>
                            <Form.Group>
                                <Form.Label>Lots <Price price={state.lots} as="b" /></Form.Label>
                                <Form.Control
                                    name="lots"
                                    type="range"
                                    min={1}
                                    max={10}
                                    step={1}
                                    //custom
                                    value={state.lots}
                                    onChange={onChange} />
                            </Form.Group>
                        </Form>
                    </Card.Body>
                </Card>
            </Col>
            <Col sm="12" md="6">
                <Card className="mb-4">
                    <Card.Body>
                        <Chart
                            figi={catcher.figi}
                            interval="1min"
                            dateTimeFormat="%H:%M" />
                    </Card.Body>
                </Card>
            </Col>
        </Row>
        <Form.Group>
            <Link
                href={{
                    pathname: "/robot",
                    query: {
                        figi: catcher.figi
                    }
                }}
                passHref>
                <Button
                    className="mr-2"
                    variant={"secondary"}>Robots</Button>
            </Link>
            <Link
                href={`/ticker/${catcher.figi}`}
                passHref>
                <Button
                    className="mr-2"
                    variant={"secondary"}>Ticker</Button>
            </Link>
            <Link
                href={`/dagger-catcher/${catcher._id}/edit`}
                passHref>
                <Button variant={"secondary"}>Edit</Button>
            </Link>

        </Form.Group>
        <Orders
            collection={catcher._id}
            figi={catcher.figi} />
    </>
}