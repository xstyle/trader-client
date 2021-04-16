import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React from 'react'
import { Badge, Col, Container, Form, Nav, Row } from 'react-bootstrap'
import Header from '../../components/Header'
import { MarketInstrumentPrice } from '../../components/Price'
import { robotsProvider } from '../../components/Robot/RobotProvider'
import Robots from '../../components/Robots'
import State from '../../components/State'
import { MarketInstrumentField } from '../../components/Candle'
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
    const { query: { figi, tag } } = useRouter()
    const id = Array.isArray(figi) || !figi ? undefined : figi
    return <Container fluid>
        <Row>
            <Col lg="2" className="d-none d-sm-block">
                <Sidebar id={id} />
            </Col>
            <Col lg="10">
                <MainView query={{ figi, tag }} />
            </Col>
        </Row>
    </Container>
}

interface SidebarCtrlInterface {
    items: { figi: string }[]
}

function SidebarCtrl<TProps extends {}>(Component: React.ComponentType<TProps & SidebarCtrlInterface>): React.FC<TProps & RobotsProviderInterface & RobotsSourceUrlProviderInterface> {
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

function SidebarView({ id, items = [] }: { id: string | undefined } & SidebarCtrlInterface) {
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
                        <MarketInstrumentField
                            figi={item.figi}
                            fieldName="ticker" />
                        <div>
                            <Badge
                                pill
                                variant="light">
                                <MarketInstrumentPrice figi={item.figi} placeholder={0} />
                            </Badge>
                        </div>
                    </Nav.Link>
                </Link>
            )
        }
    </Nav>
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