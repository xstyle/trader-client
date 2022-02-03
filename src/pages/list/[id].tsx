import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"
import { Breadcrumb, Button, Card, Col, Container, Nav, Row, Table } from "react-bootstrap"
import { MarketInstrumentField, PreviousDayPrice, PriceChange } from "../../components/Candle"
import Header from "../../components/Header"
import { LinkToTickerPage } from "../../components/Links"
import { listProvider, listsProvider } from "../../components/List/ListProvider"
import { MarketInstrumentPrice } from "../../components/Price"
import { ListProviderInterface, ListSourceUrlProviderInterface, ListsProviderInterface } from "../../types/ListType"
import { defaultGetServerSideProps } from "../../utils"

export const getServerSideProps = defaultGetServerSideProps

function ListsNavView({ lists, id }: ListsProviderInterface & { id: string }) {
    return <Nav
        variant="pills"
        style={{ position: 'sticky', top: '1rem' }}
        className="flex-column">
        {
            lists.map(list =>
                <Link
                    key={list._id}
                    href={`/list/${list._id}`}
                    passHref>
                    <Nav.Link
                        active={list._id === id}
                        className="d-flex flex-row justify-content-between">
                        {list.name}
                    </Nav.Link>
                </Link>
            )
        }
    </Nav>
}

const ListsNav = listsProvider(ListsNavView)

function ListView({ list }: ListProviderInterface & ListSourceUrlProviderInterface) {
    return <>
        <Card className="mb-2">
            <Card.Header>{list.name}</Card.Header>
            <Table hover>
                <thead>
                    <tr>
                        <th>Ticker</th>
                        <th className="text-right">Price</th>
                        <th className="text-right">Historical Price</th>
                        <th className="text-right">Change</th>
                    </tr>
                </thead>
                <tbody>
                    {
                        list.figis.map((figi) =>
                            <tr key={figi}>
                                <th>
                                    <LinkToTickerPage figi={figi}>
                                        <a>
                                            <MarketInstrumentField
                                                figi={figi}
                                                fieldName="ticker" />
                                        </a>
                                    </LinkToTickerPage>
                                </th>
                                <td className="text-right text-nowrap">
                                    <MarketInstrumentPrice figi={figi} />
                                </td>
                                <td className="text-right">
                                    <PreviousDayPrice figi={figi} days_shift={-1} />
                                </td>
                                <td className="text-right">
                                    <PriceChange figi={figi} days_shift={-1} />
                                </td>
                            </tr>
                        )
                    }
                </tbody>
            </Table>
        </Card>
    </>
}

const List = listProvider(ListView)

function Body() {
    const { query: { id } } = useRouter()
    if (typeof id !== "string") return null

    return <Container fluid>
        <Row>
            <Col xl={2} lg={3} md={4} className="d-none d-md-block">
                <ListsNav id={id as string} />
            </Col>
            <Col xl={10} lg={9} md={8} >
                <Breadcrumb>
                    <Link href="/list" passHref>
                        <Breadcrumb.Item>Lists</Breadcrumb.Item>
                    </Link>
                    <Breadcrumb.Item active>List</Breadcrumb.Item>
                </Breadcrumb>
                <div className="d-flex flex-row justify-content-between align-items-center">
                    <h1>List</h1>
                    <Link
                        href={`/list/${id}/edit`}
                        passHref>
                        <Button
                            size="sm"
                            variant="dark" >Edit</Button>
                    </Link>
                </div>
                <List id={id as string} />
            </Col>
        </Row>
    </Container>
}

export default function Page() {
    return <>
        <Head>
            <title>List</title>
        </Head>
        <Header />
        <Body />
    </>
}