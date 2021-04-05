import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"
import { Badge, Breadcrumb, Button, Col, Container, Form, ModalProps, Nav, Row } from "react-bootstrap"
import { withModal } from "../../components/ChartModal"
import Header from "../../components/Header"
import { OrdersCtrl, OrdersCtrlInterface, ordersProvider, OrdersProviderInterface, OrdersTable } from "../../components/Orders"
import Price, { TickerPrice, TickerPriceWithCurrency } from "../../components/Price"
import { Reports } from "../../components/Reports"
import { robotProvider, robotsProvider } from "../../components/Robot/RobotProvider"
import { RobotCtrl, RobotCtrlInterface } from "../../components/Robots"
import { RobotProviderInterface, RobotSourceUrlProviderInterface, RobotsProviderInterface, RobotsSourceUrlProviderInterface } from "../../types/RobotType"
import { defaultGetServerSideProps } from "../../utils"
import { HOSTNAME } from "../../utils/env"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>Robot</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    const { query } = useRouter()
    if (!query.id) return null
    if (Array.isArray(query.id)) return null
    return <Container fluid>
        <Row>
            <Col lg={2} className="d-none d-lg-block">
                <SideBar id={query.id} />
            </Col>
            <Col lg={10}>
                <RobotPageBreadcrumb id={query.id} />
                <div className="d-flex flex-row justify-content-between align-items-center">
                    <h1>Robot</h1>
                    <Link
                        href={`/robot/${query.id}/edit`}
                        passHref>
                        <Button
                            size="sm"
                            variant="dark">Edit</Button>
                    </Link>
                </div>
                <Robot id={query.id} />
            </Col>
        </Row>
    </Container>
}

function RobotPageBreadcrumbView(props: RobotProviderInterface) {
    return <Breadcrumb>
        <Link
            href={`/robot`}
            passHref>
            <Breadcrumb.Item>Robots</Breadcrumb.Item>
        </Link>
        <Link
            href={{
                pathname: `/robot`,
                query: {
                    figi: props.robot.figi
                }
            }}
            passHref>
            <Breadcrumb.Item>Same Robots</Breadcrumb.Item>
        </Link>
        <Breadcrumb.Item active>Robot</Breadcrumb.Item>
    </Breadcrumb>
}

const RobotPageBreadcrumb = robotProvider(RobotPageBreadcrumbView)

const SideBar = robotProvider(PreSidebarCtrl(robotsProvider(SidebarView)))

function PreSidebarCtrl<TProps extends RobotProviderInterface>(Component: React.ComponentType<TProps & RobotsSourceUrlProviderInterface>): React.FC<TProps> {
    return (props) => {
        return <Component {...props} figi={props.robot.figi} />
    }
}

function SidebarView({ robot, robots = [] }: RobotsProviderInterface & RobotProviderInterface & RobotSourceUrlProviderInterface & RobotsSourceUrlProviderInterface) {
    return <Nav
        variant="pills"
        style={{ position: 'sticky', top: '1rem' }}
        className="flex-column">
        {
            robots.map(item =>
                <Link
                    key={item._id}
                    href={`/robot/${item._id}`}
                    scroll={false}
                    passHref>
                    <Nav.Link
                        active={item._id === robot._id}
                        className="d-flex flex-row justify-content-between">
                        <Price price={item.buy_price} /> - <Price price={item.sell_price} />
                    </Nav.Link>
                </Link>
            )
        }
    </Nav>
}

const ModalChart = withModal(({ onShow }: ModalProps) => (<Button variant="success" onClick={onShow}>Charts</Button>))

const Robot = robotProvider(RobotCtrl(RobotView))

function RobotView({ robot, onDisable, onEnable, onSync, onCheckOrders, onResetAllOrders }: RobotCtrlInterface & RobotProviderInterface) {
    const router = useRouter()
    async function handleMakeArchive() {
        const response = await fetch(`http://${HOSTNAME}:3001/history/make_archive`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: 'first',
                description: `Copy of Instrument ${robot.figi}`,
                figi: robot.figi,
                collection_id: robot._id,
                type: 'instrument'
            })
        })
        const history = await response.json()
        router.push(`/history/${history._id}/edit`)
    }
    const delta = robot.sell_price - robot.buy_price
    const interest = delta / robot.buy_price * 100

    return <>
        <p>{robot.ticker} <Badge variant="info"><TickerPrice figi={robot.figi} /></Badge></p>
        <p><TickerPriceWithCurrency price={robot.buy_price} figi={robot.figi} /> --- [ <TickerPriceWithCurrency price={delta} figi={robot.figi} /> (<Price suffix="%" price={interest} />) ] --&gt; <TickerPriceWithCurrency price={robot.sell_price} figi={robot.figi} /></p>
        <p>Start shares number: {robot.start_shares_number}</p>
        <p>Shares number: {robot.shares_number}</p>
        <p>Budget: <TickerPriceWithCurrency price={robot.budget} figi={robot.figi} /></p>
        <Form.Group>
            {robot.is_enabled
                ? <Button
                    onClick={onDisable}
                    variant="success">Enabled</Button>
                : <Button
                    onClick={onEnable}
                    variant="danger">Disabled</Button>}
            &nbsp;
            <Button
                onClick={onSync}
                variant="dark">Sync</Button>
            &nbsp;
            <Button
                onClick={handleMakeArchive}
                variant="dark">Archive</Button>
            &nbsp;
            <Button
                onClick={onCheckOrders}
                variant="dark">Check Orders</Button>
            &nbsp;
            <Button
                onClick={onResetAllOrders}
                variant="dark">Cancel Orders</Button>
            &nbsp;
            <ModalChart figi={robot.figi} />
        </Form.Group>
        <Orders
            collection={robot._id}
            figi={robot.figi} />
    </>
}

const Orders = ordersProvider(OrdersCtrl(OrdersView))

function OrdersView(props: OrdersProviderInterface & OrdersCtrlInterface) {
    return <>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h2>Orders</h2>
            <Button
                onClick={props.onSelectOrders}
                size="sm"
                variant="dark">Add order</Button>
        </div>
        <OrdersTable {...props} />
        <h2>Report</h2>
        <Reports orders={props.orders} />
    </>
}