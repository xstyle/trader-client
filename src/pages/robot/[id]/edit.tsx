import Head from 'next/head'
import Link from 'next/link'
import { useRouter } from 'next/router'
import React, { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, useEffect, useState } from 'react'
import { Alert, Badge, Breadcrumb, Button, Card, Col, Container, Form, Toast } from 'react-bootstrap'
import { mutate } from "swr"
import Header from '../../../components/Header'
import { MarketInstrumentPrice } from '../../../components/Price'
import { robotProvider } from "../../../components/Robot/RobotProvider"
import { RobotProviderInterface } from '../../../types/RobotType'
import { defaultGetServerSideProps } from '../../../utils'
import { applyChangeToData, getValueFromInput } from '../../../utils/defaultTypePath'
import { HOSTNAME } from '../../../utils/env'

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>Edit Robot</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    const router = useRouter()
    const { id } = router.query
    if (!id || Array.isArray(id)) return null
    return <Container fluid>
        <Breadcrumb>
            <Link
                href={`/robot`}
                passHref>
                <Breadcrumb.Item>Instruments</Breadcrumb.Item>
            </Link>
            <Link
                href={`/robot/${id}`}
                passHref>
                <Breadcrumb.Item>Instrument</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>Edit</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Edit Instrument</h1>
        <InstrumentEditor id={id} />
    </Container>
}

const typePath = {
    text: 'value',
    number: 'valueAsNumber',
    checkbox: 'checked',
}

const InstrumentEditor = robotProvider(InstrumentEditorCtrl(InstrumentEditorView))

interface RobotEditorCtrlInterface {
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
    alert: { success: boolean, error: boolean }
    onRemove(): Promise<void>
    onRemoveTag(index: number): void
    onAddTag(): void
}

function InstrumentEditorCtrl<TProps extends RobotProviderInterface>(Component: React.ComponentType<TProps & RobotEditorCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const { source_url } = props
        const [robot, setRobot] = useState(props.robot)
        useEffect(() => setRobot(props.robot), [props.robot])

        const [alert, setAlert] = useState({
            error: false,
            success: false
        })
        async function handleSubmit(event: FormEvent<HTMLFormElement>) {
            event.preventDefault()

            const response = await fetch(source_url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(robot)
            })
            mutate(source_url)
            if (response.statusText === "OK") {
                showAlert('success')
            } else {
                showAlert('error')
            }
        }

        function showAlert(name: keyof { error: boolean, success: boolean }, timeout = 5000) {
            setAlert({
                ...alert,
                [name]: true
            })
            setTimeout(() => setAlert({
                ...alert,
                [name]: false
            }), timeout)
        }

        function handleChange({ target }: ChangeEvent<HTMLInputElement>) {
            const { name } = target
            const value = getValueFromInput(target)
            setRobot(applyChangeToData(robot, name, value))
        }

        function handleAddTag() {
            console.log(robot.tags)
            setRobot({ ...robot, tags: [...robot.tags, ''] })
        }

        function handleRemoveTag(index: number) {
            const tags = [...robot.tags]
            tags.splice(index, 1)
            setRobot({ ...robot, tags })
        }

        async function handleRemove() {
            await fetch(`http://${HOSTNAME}:30001/robot/${robot._id}`, {
                method: 'DELETE'
            })
            mutate(source_url)
        }
        return <Component
            {...props}
            robot={robot}
            alert={alert}
            onChange={handleChange}
            onSubmit={handleSubmit}
            onRemove={handleRemove}
            onAddTag={handleAddTag}
            onRemoveTag={handleRemoveTag} />
    }
}

function InstrumentEditorView({ robot, onChange, onSubmit, alert, onRemove, onRemoveTag, onAddTag }: RobotEditorCtrlInterface & RobotProviderInterface) {
    const max_buy_price = Math.floor(robot.sell_price * (1 - 0.0005 * 2) * 100) / 100
    const min_sell_price = Math.ceil(robot.buy_price * (1 + 0.0005 * 2) * 100) / 100

    const sell = Math.floor((robot.sell_price - robot.sell_price * 0.0005) * 100) / 100
    const buy = Math.ceil((robot.buy_price + robot.buy_price * 0.0005) * 100) / 100

    const interest = Math.round(((sell - buy) / buy) * 10000) / 100

    return <Card>
        <Card.Body>
            <Form
                onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        name="name"
                        value={robot.name}
                        type="text"
                        onChange={onChange} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Budget</Form.Label>
                    <Form.Control
                        value={robot.budget}
                        name="budget"
                        type="number"
                        onChange={onChange}
                        step="0.01" />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Lot</Form.Label>
                    <Form.Control
                        value={robot.lot}
                        name="lot"
                        type="number"
                        min="1"
                        step="1"
                        onChange={onChange} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Start Shares Number</Form.Label>
                    <Form.Control
                        value={robot.start_shares_number}
                        name="start_shares_number"
                        type="number"
                        onChange={onChange} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Current Shares Number</Form.Label>
                    <Form.Control
                        value={robot.shares_number}
                        name="shares_number"
                        type="number"
                        onChange={onChange} />
                </Form.Group>
                <Form.Check>
                    <Form.Check.Input
                        checked={robot.stop_after_sell}
                        type="checkbox"
                        name="stop_after_sell"
                        onChange={onChange} />
                    <Form.Check.Label>Stop after Sell</Form.Check.Label>
                </Form.Check>
                <Form.Row>
                    <Col>
                        <Form.Group>
                            <Form.Label>Price of Buy</Form.Label>
                            <Form.Control
                                value={robot.buy_price}
                                type="number"
                                max={max_buy_price}
                                name="buy_price"
                                onChange={onChange}
                                step="0.01" />
                            <Form.Text muted>
                                Current price <Badge variant="primary">
                                    <MarketInstrumentPrice figi={robot.figi} />
                                </Badge>
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Label>Price for placing a buy order</Form.Label>
                            <Form.Control
                                value={robot.price_for_placing_buy_order}
                                type="number"
                                name="price_for_placing_buy_order"
                                onChange={onChange}
                                step="0.01" />
                        </Form.Group>
                    </Col>

                </Form.Row>
                <Form.Row>
                    <Col>
                        <Form.Group>
                            <Form.Label>Price of Sell</Form.Label>
                            <Form.Control
                                value={robot.sell_price}
                                min={min_sell_price}
                                type="number"
                                name="sell_price"
                                onChange={onChange}
                                step="0.01" />
                            <Form.Text muted>
                                Интерес <Badge variant="primary">{interest}%</Badge>
                            </Form.Text>
                        </Form.Group>
                    </Col>
                    <Col>
                        <Form.Group>
                            <Form.Label>Price for placing a sell order</Form.Label>
                            <Form.Control
                                value={robot.price_for_placing_sell_order}
                                type="number"
                                name="price_for_placing_sell_order"
                                onChange={onChange}
                                step="0.01" />
                        </Form.Group>
                    </Col>

                </Form.Row>

                <Form.Group>
                    <Form.Label>Min number</Form.Label>
                    <Form.Control
                        value={robot.min_shares_number}
                        type="number"
                        name="min_shares_number"
                        max={robot.max_shares_number}
                        onChange={onChange} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Initial Min number</Form.Label>
                    <Form.Control
                        value={robot.initial_min_shares_number}
                        type="number"
                        name="initial_min_shares_number"
                        max={robot.initial_max_shares_number}
                        onChange={onChange} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Max number</Form.Label>
                    <Form.Control
                        value={robot.max_shares_number}
                        type="number"
                        name="max_shares_number"
                        min={robot.min_shares_number}
                        onChange={onChange} />
                    <Form.Text>
                        Бюджет на покупку <Badge variant="primary">{(robot.sell_price * robot.max_shares_number).toFixed(2)}</Badge>
                    </Form.Text>
                </Form.Group>
                <Form.Group>
                    <Form.Label>Initial Max number</Form.Label>
                    <Form.Control
                        value={robot.initial_max_shares_number}
                        type="number"
                        name="initial_max_shares_number"
                        min={robot.initial_min_shares_number}
                        onChange={onChange} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Strategy</Form.Label>
                    <Form.Control
                        value={robot.strategy}
                        type="text"
                        name="strategy"
                        onChange={onChange} />
                </Form.Group>

                {
                    robot.tags.map((tag, index) =>
                        <Form.Group
                            key={index}>
                            {!index && <label>Tags</label>}
                            <Form.Control
                                type="text"
                                value={tag}
                                name={`tags.${index}`}
                                onChange={onChange} />
                        </Form.Group>
                    )
                }
                {
                    !robot.is_removed && <div
                        className="bg-dark pb-2 pt-2"
                        style={{ position: 'sticky', bottom: 0 }}>
                        <div className="d-flex">
                            <Button
                                variant="success"
                                type="submit">Save</Button>
                            <Button
                                variant="primary"
                                onClick={onAddTag}
                                type="button">Add Tag</Button>
                            <Button
                                variant="danger"
                                disabled={robot.is_enabled}
                                onClick={onRemove}
                                type="button">Remove</Button>
                        </div>
                    </div>
                }
                <Alert
                    show={robot.is_removed}
                    variant="danger">Instrument was removed!</Alert>
                <Toast
                    show={alert.success}
                    style={{
                        position: 'fixed',
                        top: '1rem',
                        right: '1rem',
                    }}>
                    <Toast.Body>Instument was updated successull!</Toast.Body>
                </Toast>
            </Form>
        </Card.Body>
    </Card>

}