import Link from "next/link"
import { useRouter } from "next/router"
import React, { useState } from "react"
import { Button, ButtonToolbar, Card, Col, Container, ListGroup, Row, Table } from "react-bootstrap"
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
import { OrderbookTable } from "../../components/Orderbook"
import { TickerNavbar } from "../../components/TickerNavbar"

export const getServerSideProps = defaultGetServerSideProps

const Page = () => (<PageWithHeader>
  <Body />
</PageWithHeader>)

export default Page

function Body() {
  const router = useRouter()
  const figi = router.query.figi as string
  return <>
    <TickerNavbar figi={figi} activeKey="ticker" />
    <MarketInstrumentInfo figi={figi} />
  </>
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
      <Col xl={3} lg={4} md={5} >
        <p className="text-monospace display-3 text-center">
          <ColorPriceView candle={candle} />
        </p>
        <p>Value {candle.v}</p>
        <p>Number {candle.n}</p>
        <ButtonToolbar>
          <Button
            className="mr-2 mb-2"
            variant={"secondary"}
            disabled={is_importing}
            onClick={onImportAllOrder}>{is_importing ? "Importing..." : "Import"}</Button>
        </ButtonToolbar>
        <Statistica figi={marketInstrument.figi} status={["Done", "New"]} />
      </Col>
      <Col xl={7} lg={8} md={7} >
        <Card className="mb-4">
          <Card.Body>
            <Chart
              figi={marketInstrument.figi}
              interval="1min"
              dateTimeFormat="%H:%M" />
          </Card.Body>
        </Card>
      </Col>
      <Col xl={2}>
        <Card className="mb-4">
          <Card.Body>
            <Card.Title>OrderBook</Card.Title>
            <OrderbookTable figi={marketInstrument.figi} depth={3} />
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
  const candle = useSuperCandle(props.figi)

  return <ListGroup className="mb-4">
    <ListGroup.Item>?????????? ?????????? {statistics.lots}</ListGroup.Item>
    <ListGroup.Item>???????????? <MarketInstrumentPriceWithCurrency price={statistics.budget} figi={props.figi} currency /></ListGroup.Item>
    {!!statistics.lots ? <ListGroup.Item>?????????????? <MarketInstrumentPriceWithCurrency price={statistics.price_per_share} figi={props.figi} currency /></ListGroup.Item> : null}
    <ListGroup.Item>?????????????????? <MarketInstrumentPriceWithCurrency price={statistics.lots * (candle?.c ?? 0)} figi={props.figi} currency /></ListGroup.Item>
    <ListGroup.Item>?????????? <MarketInstrumentPrice figi={props.figi} lots={statistics.lots} adjustment={statistics.budget} currency /></ListGroup.Item>
  </ListGroup>
})