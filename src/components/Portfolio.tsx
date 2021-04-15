import { Card, Table } from "react-bootstrap"
import { PortfolioProviderInterface } from "../types/PositioinType"
import { LinkToTickerPage } from "./Links"
import { portfolioProvider } from "./Portfolio/PortfolioProvider"
import Price from "./Price"
import { MarketInstrumentAndCandleProvider, useCandles, useMarketInstrumentsIndex } from './Candle'

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
        const prices = useCandles(figis)
        const market_instrument_index = useMarketInstrumentsIndex({ figis })
        const sum: { RUB: number, USD: number } = props.positions.reduce((sum, { figi, balance }) => {
            if (!prices[figi]) return sum
            const market_instrument = market_instrument_index[figi]
            if (!market_instrument) return sum
            const { currency } = market_instrument
            switch (currency) {
                case "USD":
                    sum.USD += prices[figi].c * balance
                    sum.RUB += prices[figi].c * balance * props.usd_candle.c
                    break;
                case "RUB":
                    sum.USD += prices[figi].c * balance / props.usd_candle.c
                    sum.RUB += prices[figi].c * balance
                    break;
                default:
                    break;
            }

            return sum
        }, { RUB: 0, USD: 0 })
        return <Component
            {...props}
            sum={sum} />
    }
}


export const PortfolioAmount = portfolioProvider<{}>(PortfolioCtrl((props) => <Price price={props.sum.USD} suffix={"$"} />))

function PortfolioTableView({ positions, usd_candle, sum }: PortfolioProviderInterface & PortfolioCtrlInterface) {
    if (!usd_candle) return <div>Loading USD candle...</div>
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
                            <MarketInstrumentAndCandleProvider
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
                                render={(market_instrument, candle) => {
                                    const usd_sum = market_instrument.currency == 'USD' ? candle.c * position.balance : candle.c * position.balance / usd_candle.c
                                    const rub_sum = market_instrument.currency == 'USD' ? candle.c * position.balance * usd_candle.c : candle.c * position.balance
                                    return <>
                                        <td className="text-monospace text-right">{candle && candle.c.toFixed(2)}</td>
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