import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Col, Container, Form, Row } from 'react-bootstrap'
import { MarketInstrumentField } from '../../components/Candle'
import Header from '../../components/Header'
import { robotsProvider } from '../../components/Robot/RobotProvider'
import Robots from '../../components/Robots'
import State from '../../components/State'
import { TickerNavbar } from '../../components/TickerNavbar'
import { TickerSidebarView } from '../../components/TickerSidebar'
import { RobotsProviderInterface, RobotsSourceUrlProviderInterface } from '../../types/RobotType'
import { defaultGetServerSideProps } from '../../utils'

export const getServerSideProps = defaultGetServerSideProps

export default function Instruments() {
    return <>
        <Head>
            <title>Robots</title>
        </Head>
        <Header />
        <Body />
    </>
}

const Sidebar = robotsProvider((props: { id?: string } & RobotsProviderInterface & RobotsSourceUrlProviderInterface) => {
    const index = props.robots.reduce((index, { figi }) => {
        if (!index[figi]) index[figi] = { figi, _id: figi }
        return index
    }, {} as { [id: string]: { figi: string, _id: string } })
    const items = Object.values(index)
    return <TickerSidebarView
        id={props.id}
        tickers={items}
        href={(figi) => `/robot?figi=${figi}`} />
})

function Body() {
    const { query: { figi, tag } } = useRouter()
    const id = Array.isArray(figi) || !figi ? undefined : figi
    return <>
        {id ? <TickerNavbar figi={id} activeKey="robots" /> : null}
        <Container fluid>
            <Row>
                <Sidebar id={id} />
                <Col lg="10">
                    <MainView query={{ figi, tag }} />
                </Col>
            </Row>
        </Container>
    </>
}

interface SidebarCtrlInterface {
    items: {
        figi: string
        _id: string
    }[]
}

function MainView({ query }: { query: { tag?: string | string[], figi?: string | string[] } }) {
    const { figi, tag } = query
    const figis: string[] = !figi ? [] : Array.isArray(figi) ? figi : [figi]
    const tags: string[] = !tag ? [] : Array.isArray(tag) ? tag : [tag]

    return <>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h1>Robots</h1>
            <State />
        </div>

        {(query.tag || query.figi) &&
            <Form.Group>
                {
                    tags.map((tag, index) => (
                        <Link
                            key={tag + index}
                            href={{
                                pathname: '/robot',
                                query: {
                                    ...query,
                                    tag: undefined
                                }
                            }}>
                            <a className="badge badge-primary">
                                {tag} <span aria-hidden="true">&times;</span>
                            </a>
                        </Link>
                    ))
                }
                {
                    figis.map((figi, index) => (
                        <Link
                            key={figi + index}
                            href={{
                                pathname: '/robot',
                                query: {
                                    ...query,
                                    figi: undefined
                                }
                            }}>
                            <a className="badge badge-primary">
                                <MarketInstrumentField figi={figi} fieldName="name" /> <span aria-hidden="true">&times;</span>
                            </a>
                        </Link>
                    ))
                }
            </Form.Group>
        }
        <Robots figi={query.figi} tag={query.tag} />
    </>
}