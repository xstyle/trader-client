import { Currency } from "@tinkoff/invest-openapi-js-sdk/build/domain.d"
import moment from "moment"
import { Card, Table } from "react-bootstrap"
import { CandlesIndex } from "../types/CandleType"
import { PortfolioProviderInterface } from "../types/PositioinType"
import { MarketInstrumentsIndex, PreviousDayPrice, PriceChange, useCandles, useMarketInstrumentsIndex, ValueChange } from './Candle'
import { LinkToTickerPage } from "./Links"
import { portfolioProvider } from "./Portfolio/PortfolioProvider"
import Price from "./Price"

const style: React.CSSProperties = {
    position: 'sticky',
    top: 0
}

interface PortfolioCtrlInterface {
    sum: {
        USD: number,
        RUB: number
    },
    candles_index: CandlesIndex,
    market_instrument_index: MarketInstrumentsIndex
}

function priceConverter(price: number, currency: Currency, usd_price: number) {
    return {
        RUB: currency === "USD" ? price * usd_price : price,
        USD: currency === "USD" ? price : price / usd_price
    }
}

function PortfolioCtrl<TProps extends PortfolioProviderInterface>(Component: React.ComponentType<TProps & PortfolioCtrlInterface>): React.FC<TProps> {
    return (props) => {

        const figis = props.positions.map(position => position.figi)
        const prices_index = useCandles(figis)
        const market_instrument_index = useMarketInstrumentsIndex({ figis })

        const sum: { RUB: number, USD: number } = props.positions.reduce((sum, { figi, balance }) => {
            const candle = prices_index[figi]
            if (!candle) return sum
            const market_instrument = market_instrument_index[figi]
            if (!market_instrument?.currency) return sum

            const prices = priceConverter(candle.c, market_instrument.currency, props.usd_candle.c)
            sum.USD += prices.USD * balance
            sum.RUB += prices.RUB * balance
            return sum
        }, { RUB: 0, USD: 0 })

        return <Component
            {...props}
            sum={sum}
            candles_index={prices_index}
            market_instrument_index={market_instrument_index} />
    }
}


export const PortfolioAmount = portfolioProvider<{}>(PortfolioCtrl((props) => <Price price={props.sum.USD} suffix={"$"} />))

function PortfolioTableView({ positions, usd_candle, sum, candles_index, market_instrument_index }: PortfolioProviderInterface & PortfolioCtrlInterface) {
    const date = moment().add(-3, 'day').hours(7).startOf('hour').toISOString()
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
                    <th className="text-right">Historical Price</th>
                    <th className="text-right">Change</th>
                    <th className="text-right">Value Change</th>
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
                    positions.map(position => {
                        const market_instrument = market_instrument_index[position.figi]
                        const candle = candles_index[position.figi]

                        let usd_sum = 0
                        let rub_sum = 0

                        if (candle && market_instrument?.currency) {
                            const prices = priceConverter(candle.c, market_instrument.currency, usd_candle.c)
                            usd_sum = prices.USD * position.balance
                            rub_sum = prices.RUB * position.balance
                        }

                        return <tr key={position.figi} >
                            <th>
                                <LinkToTickerPage figi={position.figi}>
                                    <a>{position.ticker}</a>
                                </LinkToTickerPage>
                            </th>
                            <td className="text-right">{candle && <Price price={candle.c} />}</td>
                            <td className="text-right">
                                <PreviousDayPrice figi={position.figi} days_shift={-1} />
                            </td>
                            <td className="text-right">
                                <PriceChange figi={position.figi} days_shift={-1} />
                            </td>
                            <td className="text-right">
                                <ValueChange figi={position.figi} days_shift={-1} balance={position.balance} currency />
                            </td>
                            <td>{position.name}</td>
                            <td className="text-monospace text-right">{position.balance.toFixed(2)}</td>
                            <td className="text-monospace text-right">{position.blocked}</td>
                            <td className="text-monospace text-right">{position.lots}</td>
                            <td className="text-monospace text-right">{usd_sum.toFixed(2)}</td>
                            <td className="text-monospace text-right">{rub_sum.toFixed(2)}</td>
                            <td>{position.instrumentType}</td>
                            <td>{position.figi}</td>
                        </tr>
                    })
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
                    <th></th>
                </tr>
            </tfoot>
        </Table>
    </Card >
}

export const Portfolio = portfolioProvider(PortfolioCtrl(PortfolioTableView))