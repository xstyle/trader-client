import Head from "next/head"
import Link from "next/link"
import React, { useState } from "react"
import { Button, Card, Container, ListGroup, Modal, ModalProps, Table, Image } from "react-bootstrap"
import Moment from "react-moment"
import { MarketInstrumentField, PriceChange, useMarketInstrument } from "../../components/Candle"
import { withModal } from "../../components/ChartModal"
import { DaggerCatcherCtrl, DaggerCatcherCtrlInterface } from "../../components/DaggerCatcher/DaggerCatcherController"
import { daggerCatchersProvider } from "../../components/DaggerCatcher/DaggerCatcherProvider"
import { CommentsProviderParams, useComments } from "../../components/entity/Comment"
import Header from "../../components/Header"
import { TinLink } from "../../components/Links"
import { MarketInstrumentPrice } from "../../components/Price"
import { DaggerCatcherProviderInterface, DaggerCatchersProviderInterface } from "../../types/DaggerCatcherType"
import { defaultGetServerSideProps } from "../../utils"

export const getServerSideProps = defaultGetServerSideProps

const ModalChart = withModal(({ onShow }: ModalProps) => (
    <Button variant="secondary" size="sm" onClick={onShow}>
        <i className="fa fa-chart-line" />
    </Button>
))


function Comments(props: CommentsProviderParams) {
    const { data: comments } = useComments({ ticker: props.ticker })
    if (!comments) return <>Comments loading...</>
    return <>
        <ListGroup variant="flush">
            {
                comments.map((comment) =>
                    <ListGroup.Item>
                        <div className="mb-3">
                            <h6 style={{ fontWeight: "bold" }}>{comment.nickname}</h6>
                            <small>
                                <Moment date={comment.inserted} format="HH:mm D MMMM YY" /></small>

                        </div>
                        <div
                            style={{ whiteSpace: "pre-wrap" }}
                            className="mb-3">
                            {comment.text}
                        </div>
                        {
                            comment.postImages.map((image) => 
                                <Image 
                                    rounded
                                    className="mb-3"
                                    fluid 
                                    src={`https://www.tinkoff.ru/api/invest-gw/social/file/v1/cache/post/image/${image.id}?size=original&appName=invest&platform=web`} />
                            )
                        }
                    </ListGroup.Item>
                )
            }
        </ListGroup>
    </>
}

function CommentsModalButton(props: { figi: string }) {
    const [isShow, setShow] = useState(false)
    const { data: instrument } = useMarketInstrument(props.figi)

    return <>
        <Button
            onClick={() => setShow(true)}
            size="sm"
            variant="secondary">Puls</Button>
        <Modal
            show={isShow}
            size="lg"
            scrollable
            onHide={() => setShow(false)}>
            <Modal.Header closeButton>
                <Modal.Title>
                    Comments
                </Modal.Title>
            </Modal.Header>
            
            <Modal.Body className="p-0">

                {instrument ? <Comments ticker={instrument.ticker} /> : null}
            </Modal.Body>
        </Modal>
    </>
}

function TableRowView({ daggerCatcher, onSetPinned }: DaggerCatcherCtrlInterface & DaggerCatcherProviderInterface) {
    return <tr key={daggerCatcher._id}>
        <td>
            <Button variant={daggerCatcher.is_pinned ? "warning" : "secondary"} size="sm" onClick={onSetPinned}>
                <i className="fas fa-thumbtack"></i>
            </Button>
        </td>
        <td>
            <Link
                href={`/dagger-catcher/${daggerCatcher.figi}`}>
                <a>
                    <MarketInstrumentField
                        figi={daggerCatcher.figi}
                        fieldName="ticker" />
                </a>
            </Link>
        </td>
        <td className="text-right">
            <MarketInstrumentPrice figi={daggerCatcher.figi} color currency />
        </td>
        <td className="text-right">
            <PriceChange figi={daggerCatcher.figi} days_shift={-1} />
        </td>
        <td>
            <ModalChart figi={daggerCatcher.figi} />
        </td>
        <td>
            <TinLink figi={daggerCatcher.figi} />
        </td>
        <td>
            <CommentsModalButton figi={daggerCatcher.figi} />
        </td>
        <td>
            <Link
                href={`/dagger-catcher/${daggerCatcher._id}/edit`}
                passHref>
                <Button
                    size="sm"
                    variant="secondary"><i className="fa fa-edit" /></Button>
            </Link>
        </td>
    </tr>
}

const TableRow = DaggerCatcherCtrl(TableRowView)
function View({ daggerCatchers, source_url }: DaggerCatchersProviderInterface) {
    if (daggerCatchers.length === 0) {
        return <div className="alert alert-info">
            You have't created any <b>Dagger Catcher</b>.
        </div>
    }
    return <>
        <Card>
            <Table
                responsive
                striped
                hover
                size="sm">
                <thead>
                    <tr>
                        <th style={{ width: "1px" }}></th>
                        <th style={{ width: "1px" }}>Ticker</th>
                        <th style={{ width: "1px" }} className="text-right">Last Price</th>
                        <th style={{ width: "1px" }} className="text-right">Price Change</th>
                        <th>Charts</th>
                        <th>App</th>
                        <th></th>
                        <th style={{ "width": "1px" }}></th>
                    </tr>
                </thead>
                <tbody>
                    {
                        daggerCatchers.map(daggerCatcher => <TableRow key={daggerCatcher._id} daggerCatcher={daggerCatcher} source_url={source_url} />)
                    }
                </tbody>
            </Table>
        </Card>
    </>
}

const DaggerCatchers = daggerCatchersProvider(View)

function Body() {
    return <Container fluid>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h1>Dagger Catchers</h1>
            <Link
                href="/dagger-catcher/new"
                passHref>
                <Button variant="primary">Create</Button>
            </Link>
        </div>
        <DaggerCatchers isHidden={false} />
    </Container>
}
export default function Page() {
    return <>
        <Head>
            <title>Dagger Catchers</title>
        </Head>
        <Header />
        <Body />
    </>
}