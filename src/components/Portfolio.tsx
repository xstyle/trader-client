import { Card, Table } from "react-bootstrap"
import { PortfolioProviderInterface } from "../types/PositioinType"
import { LinkToTickerPage } from "./Links"
import { portfolioProvider } from "./Portfolio/PortfolioProvider"
import Price from "./Price"
import { TickerProvider, useTickers } from './Ticker'

const style: React.CSSProperties = {
    position: 'sticky',
    top: 0
}

interface PortfolioCtrlInterface {
    sum: {
        USD: number,
        RUB: number
    }
}

function PortfolioCtrl<TProps extends PortfolioProviderInterface>(Component: React.ComponentType<TProps & PortfolioCtrlInterface>): React.FC<TProps> {
    return (props) => {

        const figis = props.positions.map(position => position.figi)
        const prices = useTickers(figis)
        const sum: { RUB: number, USD: number } = props.positions.reduce((sum, { figi, balance, currency }) => {
            if (!prices[figi]) return sum
            switch (currency) {
                case "USD":
                    sum[currency] += prices[figi].c * balance
                    sum["RUB"] += prices[figi].c * balance * props.usd_ticker.c
                    break;
                case "RUB":
                    sum["USD"] += prices[figi].c * balance / props.usd_ticker.c
                    sum["RUB"] += prices[figi].c * balance
                    break;
                default:
                    break;
            }

            return sum
        }, { "RUB": 0, "USD": 0 })
        return <Component
            {...props}
            sum={sum} />
    }
}


export const PortfolioAmount = portfolioProvider<object>(PortfolioCtrl((props) => <Price price={props.sum["USD"]} suffix={"$"} />))

function PortfolioTableView({ positions, usd_ticker, sum }: PortfolioProviderInterface & PortfolioCtrlInterface) {
    if (!usd_ticker) return <div>Loading USD ticker...</div>
    return <Card>
        <Table
            hover
            size="sm"
            responsive>
            <thead
                style={style}>
                <tr>
                    <th>Ticker</th>
                    <th className="text-right">Price</th>
                    <th>Name</th>
                    <th className="text-right">Balance</th>
                    <th className="text-right">Blocked</th>
                    <th className="text-right">Lots</th>
                    <th className="text-right">USD</th>
                    <th className="text-right">RUB</th>
                    <th>Type</th>
                    <th>FIGI</th>
                </tr>
            </thead>
            <tbody>
                {
                    positions.map((position, index) =>
                        <tr key={position.figi}>
                            <th>
                                <LinkToTickerPage figi={position.figi}>
                                    <a>{position.ticker}</a>
                                </LinkToTickerPage>
                            </th>
                            <TickerProvider
                                figi={position.figi}
                                placeholder={
                                    (<>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                        <td>-</td>
                                    </>)
                                }
                                render={(ticker_info, ticker) => {
                                    const usd_sum = ticker_info.currency == 'USD' ? ticker.c * position.balance : ticker.c * position.balance / usd_ticker.c
                                    const rub_sum = ticker_info.currency == 'USD' ? ticker.c * position.balance * usd_ticker.c : ticker.c * position.balance
                                    return <>
                                        <td className="text-monospace text-right">{ticker && ticker.c.toFixed(2)}</td>
                                        <td>{position.name}</td>
                                        <td className="text-monospace text-right">{position.balance.toFixed(2)}</td>
                                        <td className="text-monospace text-right">{position.blocked}</td>
                                        <td className="text-monospace text-right">{position.lots}</td>
                                        <td className="text-monospace text-right">{usd_sum.toFixed(2)}</td>
                                        <td className="text-monospace text-right">{rub_sum.toFixed(2)}</td>
                                    </>
                                }} />
                            <td>{position.instrumentType}</td>
                            <td>{position.figi}</td>
                        </tr>
                    )
                }
            </tbody>
            <tfoot>
                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th className="text-right"><Price price={sum.USD} /></th>
                    <th className="text-right"><Price price={sum.RUB} /></th>
                    <th></th>
                    <th></th>
                </tr>
            </tfoot>
        </Table>
    </Card>
}

export const Portfolio = portfolioProvider(PortfolioCtrl(PortfolioTableView))