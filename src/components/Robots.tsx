import useSWR, { mutate } from "swr"
import Link from "next/link"
import useTicker, { TickerInfo } from "./Ticker"
import { HOSTNAME } from "../utils/env"
import { Badge, Button, Card, Form, Table, ToastProps } from "react-bootstrap"
import Price, { TickerPrice } from "./Price"
import { Component, CSSProperties } from "react"
import { useRouter } from "next/router"
import { RobotProviderInterface, RobotsProviderInterface, RobotsSourceUrlProviderInterface, RobotType } from "../types/RobotType"
import { robotsProvider } from "./Robot/RobotProvider"

function interest(robot: RobotType) {

    const buy = robot.buy_price + Math.ceil(robot.buy_price * 0.0005 * 100) / 100
    const sell = robot.sell_price - Math.ceil(robot.sell_price * 0.0005 * 100) / 100

    return Math.round((sell - buy) / buy * 100 * 100) / 100
}

function round(value: number) {
    return Math.round(value * 100) / 100
}

const Robots = robotsProvider(RobotsList)

const top_style: CSSProperties = {
    position: 'sticky',
    top: 0
}

const footer_style: CSSProperties = {
    position: 'sticky',
    bottom: 0
}

function RobotsList(props: RobotsProviderInterface & RobotsSourceUrlProviderInterface) {
    const robotsGroups = Object.values(props.robots.reduce<{ [id: string]: RobotType[] }>((index, robot) => {
        if (!index[robot.figi]) index[robot.figi] = []
        index[robot.figi].push(robot)
        return index
    }, {}))
    return <>
        {
            robotsGroups.map((robotsGroup) => <RobotsGroupView
                {...props}
                robots={robotsGroup}
                key={robotsGroup[0].figi}
                figi={robotsGroup[0].figi} />)
        }
    </>
}
const style: CSSProperties = {
    position: "sticky",
    top: 0,
    zIndex: 1,
    backgroundColor: "#222"
}
function RobotsGroupView(props: RobotsProviderInterface & RobotsSourceUrlProviderInterface & {figi: string}) {
    return <div>
        <h3 style={style}>
            <Link href={`/ticker/${props.figi}`}>
                <a className="mr-4">
                    <TickerInfo figi={props.figi} fieldName={"name"} />
                </a>
            </Link>
            <Badge variant="success"><TickerPrice figi={props.figi}/></Badge>
        </h3>
        <RobotsTableView {...props} />
    </div>
}

function RobotFooter(props: RobotsProviderInterface & RobotsSourceUrlProviderInterface & { figi: string }) {
    const ticker = useTicker(props.figi)
    if (!ticker)
        return null
    const consolidate_budget = props.robots.reduce((sum, robot) => sum + robot.budget, 0)
    const consolidate_shares_number = props.robots.reduce((sum, robot) => sum + robot.shares_number, 0)

    const online_budget = consolidate_shares_number * ticker.c + consolidate_budget

    return <tfoot style={footer_style}>
        <tr>
            <th></th>
            <th className="text-right">{round(consolidate_shares_number)}</th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th></th>
            <th className="text-right text-monospace">{consolidate_budget.toFixed(2)}</th>
            <th className="text-right text-monospace">{online_budget.toFixed(2)}</th>
            <th></th>
            <th></th>
            <th></th>
        </tr>
    </tfoot>
}

const WIDTH_1PX_STYLE: CSSProperties = {
    width: "1px"
}

function RobotsTableView(props: RobotsProviderInterface & RobotsSourceUrlProviderInterface) {
    return <Card>
        <Table
            responsive
            hover
            size="sm"
        >
            <thead
                style={top_style}>
                <tr>
                    <th style={WIDTH_1PX_STYLE}></th>
                    <th className="text-right" >Amount</th>
                    <th className="text-right">Price</th>
                    <th className="text-right">Buy</th>
                    <th className="text-right">Sell</th>
                    <th></th>
                    <th></th>
                    <th className="text-right">Budget</th>
                    <th></th>
                    <th className="text-right">Interest</th>
                    {/* <th>Orders</th> */}
                    <th>Tags</th>
                    <th style={WIDTH_1PX_STYLE}></th>
                </tr>
            </thead>
            <tbody>
                {
                    props.robots.map((robot) =>
                        <Robot
                            robot={robot}
                            key={robot._id}
                            source_url={props.source_url} />
                    )
                }
            </tbody>
            {typeof props.figi != 'undefined' ? <RobotFooter {...props} figi={props.figi} /> : null}
        </Table >
    </Card>
}

const Robot = RobotCtrl(RobotView)

export interface RobotCtrlInterface {
    onEnable(): Promise<void>
    onDisable(): Promise<void>
    onResetAllOrders(): Promise<void>
    onCheckOrders(): Promise<void>
    onSync(): Promise<void>
}

export function RobotCtrl<TProps extends RobotProviderInterface>(Component: React.ComponentType<TProps & RobotCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const { source_url, robot: robot } = props
        async function handleEnable() {
            await fetch(`http://${HOSTNAME}:3001/robot/${robot._id}/enable`)
            mutate(source_url)
        }
        async function handleDisable() {
            await fetch(`http://${HOSTNAME}:3001/robot/${robot._id}/disable`)
            mutate(source_url)
        }
        async function handleResetOrders() {
            fetch(`http://${HOSTNAME}:3001/robot/${robot._id}/reset`)
        }
        async function handleForceCheckOrders() {
            fetch(`http://${HOSTNAME}:3001/robot/${robot._id}/check_orders`)
        }
        async function handleSync() {
            await fetch(`http://${HOSTNAME}:3001/robot/${robot._id}/sync`)
            mutate(source_url)
        }

        return <Component
            {...props}
            onEnable={handleEnable}
            onDisable={handleDisable}
            onResetAllOrders={handleResetOrders}
            onCheckOrders={handleForceCheckOrders}
            onSync={handleSync} />
    }
}

function RobotView({ robot, onEnable, onDisable }: RobotCtrlInterface & RobotProviderInterface) {
    const ticker = useTicker(robot.figi)
    const { query } = useRouter()
    return <tr >
        <td>
            <Link
                href={`/robot/${robot._id}`}
                passHref>
                <Button
                    size="sm"
                    variant="outline-light">Show</Button>
            </Link>
        </td>
        <td className="text-right text-monospace">
            <span className={robot.shares_number == 0 ? "text-muted" : ""}>{robot.shares_number}</span>
            <div className="text-muted small">
                [{robot.min_shares_number}...{robot.max_shares_number}]
            </div>
        </td>
        <td className="text-right text-monospace">
            {ticker && <Pricemetr
                price={ticker.c}
                {...robot} />}
        </td>
        <td className="text-right text-monospace">
            <div><Price price={robot.buy_price} /></div>
            <div className="small">
                {robot.price_for_placing_buy_order === robot.buy_price ? '~' : <Price price={robot.price_for_placing_buy_order} />}
            </div>
        </td>
        <td className="text-right text-monospace">
            <div><Price price={robot.sell_price} /></div>
            <div className="small">
                {robot.price_for_placing_sell_order === robot.sell_price ? '~' : <Price price={robot.price_for_placing_sell_order} />}
            </div>
        </td>
        <td>
            {robot.is_enabled && <Button
                variant="success"
                size="sm"
                onClick={() => onDisable()}>On</Button>}
            {!robot.is_enabled && <Button
                variant="danger"
                size="sm"
                onClick={() => onEnable()}>Off</Button>}
        </td>
        <td>
            {robot.stop_after_sell && <i className="fas fa-hand-paper text-success" />}
        </td>
        <td className="text-right">
            <Price price={robot.budget} />
        </td>
        <td className="text-right">
            {ticker && <Price price={robot.budget + ticker.c * robot.shares_number} />}
            {robot.shares_number > robot.min_shares_number && <Form.Text className="text-muted">
                (<Price price={robot.budget + robot.sell_price * (robot.shares_number - robot.min_shares_number)} />)
            </Form.Text>}
        </td>
        <td className="text-muted text-right text-monospace">
            {interest(robot)}%
        </td>
        <td>
            {
                robot.tags.map((tag, index) =>
                    <Link
                        key={index}
                        href={{
                            pathname: "/robot",
                            query: {
                                ...query,
                                tag
                            }
                        }}>
                        <a>#{tag}</a>
                    </Link>
                )
            }
        </td>
        <td className="text-nowrap">
            <Link
                href={`/robot/${robot._id}/edit`}
                passHref>
                <Button
                    size="sm"
                    variant={"secondary"}>Edit</Button>
            </Link>
        </td>
    </tr>
}

export default Robots

function Pricemetr(props: RobotType & { price: number }) {
    const style = {
        opacity: minmax(0.1, 1, (Math.abs(props.price - props.sell_price) / props.sell_price) * -22.5 + 1.225)
    }
    const style_buy = {
        opacity: minmax(0.1, 1, (Math.abs(props.price - props.buy_price) / props.buy_price) * -22.5 + 1.225)
    }

    return <>
        {props.price < props.sell_price
            && props.min_shares_number !== props.shares_number
            && <div className="text-danger small" style={style}><Price price={props.sell_price} /></div>}
        {false
            && props.price < props.buy_price
            && props.max_shares_number !== props.shares_number
            && <div className="text-success small" style={style_buy}><Price price={props.buy_price} /></div>}
        <div style={style}><Price price={props.price} /></div>
        {props.price > props.sell_price
            && false
            && props.min_shares_number !== props.shares_number
            && <div className="text-danger small" style={style}><Price price={props.sell_price} /></div>}
        {props.price > props.buy_price
            && props.min_shares_number >= props.shares_number
            && <div className="text-success small" style={style_buy}><Price price={props.buy_price} /></div>}
    </>
}

function minmax(min: number, max: number, value: number) {
    return Math.min(max, Math.max(min, value))
}