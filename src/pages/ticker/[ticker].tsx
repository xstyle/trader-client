import Link from "next/link"
import { useRouter } from "next/router"
import { useState } from "react"
import { Button, Card, Col, Container, ListGroup, Row, Table } from "react-bootstrap"
import useSWR from "swr"
import Chart from "../../components/Chart"
import { PageWithHeader } from "../../components/Header"
import { InstrumentsLink, TinLink } from "../../components/Links"
import { ordersProvider, OrdersProviderInterface, OrdersSourceUrlProviderOptions } from "../../components/Orders"
import { OrdersCollection } from "../../components/OrdersCollection"
import { ColorPriceView, TickerPrice, TickerPriceWithCurrency } from "../../components/Price"
import { useStatistica } from "../../components/Statistic/Statistic"
import useTicker, { useStatefullTicker } from "../../components/Ticker"
import { TickerInfoType } from "../../types/TickerType"
import { defaultGetServerSideProps } from "../../utils"
import { HOSTNAME } from "../../utils/env"

export const getServerSideProps = defaultGetServerSideProps

const Page = () => (<PageWithHeader>
  <Body />
</PageWithHeader>)

export default Page

function Body() {
  const router = useRouter()
  const { ticker } = router.query
  const { data, error } = useSWR<TickerInfoType>(`http://${HOSTNAME}:3001/ticker/${ticker}`)
  if (error) return <div>Error</div>
  if (!data) return <div>Loading...</div>
  return <TickerInfo ticker={data} />
}

interface TickerCtrlInterface {
  ticker: TickerInfoType,
  is_importing: boolean,
  onImportAllOrder: () => Promise<void>
}

const TickerCtrl = <TProps extends { ticker: TickerInfoType }>(Component: React.ComponentType<TProps & TickerCtrlInterface>): React.FC<TProps> => (props) => {
  const [is_importing, setImportStatus] = useState<boolean>(false)
  async function handleImportAllOrders() {
    setImportStatus(true)
    const response = await fetch(`http://${HOSTNAME}:3001/ticker/${props.ticker.figi}/import_orders`)
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

const TickerInfo = TickerCtrl(TickerInfoView)

function TickerInfoView({ ticker, onImportAllOrder, is_importing }: TickerCtrlInterface) {
  const state = useTicker(ticker.figi)
  if (!state) return <div>Waiting update of Ticker {ticker.ticker}...</div>
  return <Container fluid>
    <h1>{ticker.name}</h1>
    <Row>
      <Col lg={2} xs={12} className="mb-3">
        <p className="text-monospace display-3 text-center">
          <ColorPriceView ticker={state} />
        </p>
        <p>Value {state.v}</p>
        <p>Number {state.n}</p>
        <div className="form-group">
          <Link
            passHref
            href={{
              pathname: '/robot/new',
              query: {
                figi: ticker.figi,
                buy_price: state.c,
                name: ticker.name
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
          <InstrumentsLink figi={ticker.figi}>
            <Button
              variant="secondary"
              className="mr-2 mb-2">Robots</Button>
          </InstrumentsLink>
          <Link
            href={`/dagger-catcher/${ticker.figi}`}
            passHref>
            <Button
              variant="secondary"
              className="mr-2 mb-2">Dagger Catcher</Button>
          </Link>
          <TinLink figi={ticker.figi} />
        </div>
        <Statistica figi={ticker.figi} status={["Done", "New"]} />
      </Col>
      <Col lg={10} xs={12}>
        <Card>
          <Card.Body>
            <Chart
              figi={ticker.figi}
              interval="1min"
              dateTimeFormat="%H:%M" />
          </Card.Body>
        </Card>

      </Col>
    </Row>
    <h2>Orders</h2>
    <OrdersCollection figi={ticker.figi} status={["Done", "New"]} />
    <TickerOperationHistory figi={ticker.figi} />
  </Container>
}

function TickerOperationHistory({ figi }: { figi: string }) {
  const history = useStatefullTicker(figi)
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
    {!!statistics.lots && <ListGroup.Item>Средняя <TickerPriceWithCurrency price={statistics.price_per_share} figi={props.figi} /></ListGroup.Item>}
    <ListGroup.Item>Бюджет <TickerPriceWithCurrency price={statistics.budget} figi={props.figi} /></ListGroup.Item>
    <ListGroup.Item>Доход <TickerPrice figi={props.figi} lots={statistics.lots} adjustment={statistics.budget} /></ListGroup.Item>
  </ListGroup>
})