import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Badge, Col, Container, Form, Nav, Row } from 'react-bootstrap'
import Header from '../../components/Header'
import { TickerPrice } from '../../components/Price'
import { robotsProvider } from '../../components/Robot/RobotProvider'
import Robots from '../../components/Robots'
import State from '../../components/State'
import { TickerInfo } from '../../components/Ticker'
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

const Sidebar = robotsProvider(SidebarCtrl(SidebarView))

function Body() {
    const { query } = useRouter()
    return <Container fluid>
        <Row>
            <Col lg="2">
                <Sidebar id={query.figi as string} />
            </Col>
            <Col lg="10">
                <Main query={query} />
            </Col>
        </Row>
    </Container>
}

interface SidebarCtrlInterface {
    items: { figi: string }[]
}

function SidebarCtrl<TProps extends { id: string }>(Component: React.ComponentType<TProps & SidebarCtrlInterface>): React.FC<TProps & RobotsProviderInterface & RobotsSourceUrlProviderInterface> {
    return (props) => {
        const index = props.robots.reduce((index, { figi }) => {
            if (!index[figi]) index[figi] = { figi }
            return index
        }, {} as { [id: string]: { figi: string } })
        const items = Object.values(index)
        return <Component
            {...props}
            items={items} />
    }
}

function SidebarView({ id, items = [] }: { id: string } & SidebarCtrlInterface) {
    return <Nav
        variant="pills"
        style={{ position: 'sticky', top: '1rem' }}
        className="flex-column">
        {
            items.map(item =>
                <Link
                    key={item.figi}
                    href={`/robot?figi=${item.figi}`}
                    scroll={false}
                    passHref>
                    <Nav.Link
                        active={item.figi === id}
                        className="d-flex flex-row justify-content-between">
                        <TickerInfo
                            figi={item.figi}
                            fieldName="ticker" />
                        <div>
                            <Badge
                                pill
                                variant="light">
                                <TickerPrice figi={item.figi} placeholder={0} />
                            </Badge>
                        </div>
                    </Nav.Link>
                </Link>
            )
        }
    </Nav>
}

function Main({ query }: { query: { tag?: string, figi?: string } }) {
    return <>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h1>Robots</h1>
            <State />
        </div>

        {(query.tag || query.figi) &&
            <Form.Group>
                {query.tag &&
                    <Link href={{
                        pathname: '/robot',
                        query: {
                            ...query,
                            tag: undefined
                        }
                    }}>
                        <a className="badge badge-primary">{query.tag} <span aria-hidden="true">&times;</span></a>
                    </Link>
                }
                {query.figi &&
                    <Link href={{
                        pathname: '/robot',
                        query: {
                            ...query,
                            figi: undefined
                        }
                    }}>
                        <a className="badge badge-primary"><TickerInfo figi={query.figi} fieldName="name" /> <span aria-hidden="true">&times;</span></a>
                    </Link>
                }
            </Form.Group>
        }
        <Robots figi={query.figi} tag={query.tag} />
    </>
}