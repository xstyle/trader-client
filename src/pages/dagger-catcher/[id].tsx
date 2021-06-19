import Head from 'next/head';
import Link from "next/link";
import { useRouter } from "next/router";
import { Breadcrumb, Button, Card, Col, Container, Form, Row } from "react-bootstrap";
import Moment from "react-moment";
import useSuperCandle, { MarketInstrumentField, useMarketInstrument } from "../../components/Candle";
import Chart from "../../components/Chart";
import { DaggerCatcherCtrl, DaggerCatcherCtrlInterface } from '../../components/DaggerCatcher/DaggerCatcherController';
import { daggerCatcherProvider, daggerCatchersProvider } from '../../components/DaggerCatcher/DaggerCatcherProvider';
import Header from "../../components/Header";
import { OrderbookPositionPrice } from '../../components/Orderbook';
import { OrdersCtrl, OrdersCtrlInterface, ordersProvider, OrdersProviderInterface, OrdersSourceUrlProviderOptions, OrdersTable } from "../../components/Orders";
import Price, { MarketInstrumentPrice } from "../../components/Price";
import { Reports } from '../../components/Reports';
import { useStatistica } from '../../components/Statistic/Statistic';
import { TickerNavbar } from '../../components/TickerNavbar';
import { TickerSidebarView } from '../../components/TickerSidebar';
import { DaggerCatcherProviderInterface } from '../../types/DaggerCatcherType';
import { OrderType } from "../../types/OrderType";
import { defaultGetServerSideProps } from "../../utils";

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
    return <>
        <TickerNavbar figi={id} activeKey="dagger" />
        <Container fluid>
            <Row>
                <SideBar id={id} />
                <Col lg="10">
                    <DaggerCatcher id={id} />
                </Col>
            </Row>

        </Container>
    </>
}

const SideBar = daggerCatchersProvider<{ id: string }>((props) => {
    return <TickerSidebarView
        id={props.id}
        tickers={props.daggerCatchers}
        href={(figi: string) => `/dagger-catcher/${figi}`} />
})



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

function DaggerCatcherView({ daggerCatcher: catcher, onSubmit, state, onChange }: DaggerCatcherProviderInterface & DaggerCatcherCtrlInterface) {
    const candle = useSuperCandle(catcher.figi)
    const { data: marketInstrument } = useMarketInstrument(catcher.figi)
    return <>
        <Head>
            <title>{marketInstrument && marketInstrument.ticker} {candle && candle.c.toFixed(2)}</title>
        </Head>
        <Row>
            <Col sm="12" md="6">
                <div className="d-flex flex-row">
                    <div className="text-monospace display-3 text-center flex-fill">
                        <MarketInstrumentPrice figi={catcher.figi} color />
                    </div>
                    <div className="d-flex align-items-center">
                        <div>
                            <div className="">
                                <OrderbookPositionPrice figi={catcher.figi} type="asks" />
                            </div>
                            <div className="">
                                <OrderbookPositionPrice figi={catcher.figi} type="bids" />
                            </div>
                        </div>

                    </div>
                </div>
                {
                    candle && <>
                        <p className="text-monospace text-center">{candle.v.toFixed(0)} shares for <Moment durationFromNow interval={100}>{candle.time}</Moment></p>
                        <p className="text-monospace text-center">{(candle.v * 1000 / (Date.now() - new Date(candle.time).getTime())).toFixed(0)} shares per second</p>
                    </>
                }
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