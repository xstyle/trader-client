import Link from "next/link"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { Button, Card, Col, Container, ListGroup, Row, Table } from "react-bootstrap"
import Chart from "../../components/Chart"
import { PageWithHeader } from "../../components/Header"
import { InstrumentsLink, TinLink } from "../../components/Links"
import { marketInstrumentProvider, MarketInstrumentProviderInterface } from "../../components/MarketInstrument/MarketInstrumentProvider"
import { ordersProvider, OrdersProviderInterface, OrdersSourceUrlProviderOptions } from "../../components/Orders"
import { OrdersCollection } from "../../components/OrdersCollection"
import { ColorPriceView, MarketInstrumentPrice, MarketInstrumentPriceWithCurrency } from "../../components/Price"
import { useStatistica } from "../../components/Statistic/Statistic"
import useSuperCandle, { useStatefullSuperCandleHistory } from "../../components/Candle"
import { defaultGetServerSideProps } from "../../utils"
import { HOSTNAME } from "../../utils/env"

export const getServerSideProps = defaultGetServerSideProps

const Page = () => (<PageWithHeader>
  <Body />
</PageWithHeader>)

export default Page

function Body() {
  const router = useRouter()
  const figi = router.query.figi as string
  return <MarketInstrumentInfo figi={figi} />
}

interface MarketInstrumentCtrlInterface {
  is_importing: boolean,
  onImportAllOrder: () => Promise<void>
}

const MarketInstrumentCtrl = <TProps extends MarketInstrumentProviderInterface>(Component: React.ComponentType<TProps & MarketInstrumentCtrlInterface>): React.FC<TProps> => (props) => {
  const [is_importing, setImportStatus] = useState<boolean>(false)
  async function handleImportAllOrders() {
    setImportStatus(true)
    const response = await fetch(`http://${HOSTNAME}:3001/ticker/${props.marketInstrument.figi}/import_orders`)
    const data = await response.json()
    setImportStatus(false)
    console.log(data)
  }
  return <Component
    {...props}
    is_importing={is_importing}
    onImportAllOrder={handleImportAllOrders}
  />
}

const MarketInstrumentInfo = marketInstrumentProvider(MarketInstrumentCtrl(MarketInstrumentInfoView))

function MarketInstrumentInfoView({ marketInstrument, onImportAllOrder, is_importing }: MarketInstrumentCtrlInterface & MarketInstrumentProviderInterface) {
  const candle = useSuperCandle(marketInstrument.figi)
  if (!candle) return <div>Waiting update of Ticker {marketInstrument.ticker}...</div>
  return <Container fluid>
    <h1>{marketInstrument.name}</h1>
    <Row>
      <Col xl={3} lg={4} md={5} className="mb-3">
        <p className="text-monospace display-3 text-center">
          <ColorPriceView candle={candle} />
        </p>
        <p>Value {candle.v}</p>
        <p>Number {candle.n}</p>
        <div className="form-group">
          <Link
            passHref
            href={{
              pathname: '/robot/new',
              query: {
                figi: marketInstrument.figi,
                buy_price: candle.c,
                name: marketInstrument.name
              }
            }}>
            <Button
              variant="success"
              className="mr-2 mb-2">Create</Button>
          </Link>
          <Button
            className="mr-2 mb-2"
            variant={"secondary"}
            disabled={is_importing}
            onClick={onImportAllOrder}>{is_importing ? "Importing..." : "Import"}</Button>
          <InstrumentsLink figi={marketInstrument.figi}>
            <Button
              variant="secondary"
              className="mr-2 mb-2">Robots</Button>
          </InstrumentsLink>
          <Link
            href={`/dagger-catcher/${marketInstrument.figi}`}
            passHref>
            <Button
              variant="secondary"
              className="mr-2 mb-2">Dagger Catcher</Button>
          </Link>
          <TinLink figi={marketInstrument.figi} />
        </div>
        <Statistica figi={marketInstrument.figi} status={["Done", "New"]} />
      </Col>
      <Col xl={9} lg={8} md={7} >
        <Card>
          <Card.Body>
            <Chart
              figi={marketInstrument.figi}
              interval="1min"
              dateTimeFormat="%H:%M" />
          </Card.Body>
        </Card>

      </Col>
    </Row>
    <h2>Orders</h2>
    <OrdersCollection figi={marketInstrument.figi} status={["Done", "New"]} />
  </Container>
}

function OperationHistory({ figi }: { figi: string }) {
  const history = useStatefullSuperCandleHistory(figi)
  return <Card>
    <Card.Header>
      Last transactions
    </Card.Header>
    <Table hover size="sm">
      <thead>
        <tr>
          <th>#</th>
          <th>Volume</th>
          <th>Price</th>
        </tr>
      </thead>
      <tbody>
        {
          history.map((item, index) =>
            <tr key={history.length - index}>
              <td>{history.length - index}</td>
              <td>{item.n}</td>
              <td>{item.c}</td>
            </tr>
          )
        }
      </tbody>
      <tfoot>
        <tr>
          <th></th>
          <th></th>
          <th></th>
        </tr>
      </tfoot>
    </Table>
  </Card>
}

const Statistica = ordersProvider((props: OrdersProviderInterface & OrdersSourceUrlProviderOptions & { figi: string }) => {
  const statistics = useStatistica(props.orders)

  return <ListGroup>
    <ListGroup.Item>Всего {statistics.lots}</ListGroup.Item>
    {!!statistics.lots && <ListGroup.Item>Средняя <MarketInstrumentPriceWithCurrency price={statistics.price_per_share} figi={props.figi} /></ListGroup.Item>}
    <ListGroup.Item>Бюджет <MarketInstrumentPriceWithCurrency price={statistics.budget} figi={props.figi} /></ListGroup.Item>
    <ListGroup.Item>Доход <MarketInstrumentPrice figi={props.figi} lots={statistics.lots} adjustment={statistics.budget} /></ListGroup.Item>
  </ListGroup>
})