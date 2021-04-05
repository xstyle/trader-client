import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, useState } from "react"
import { Breadcrumb, Button, Card, Container, Form } from "react-bootstrap"
import Header from '../../components/Header'
import { SelectFigiInput } from "../../components/SelectFigi"
import { NewRobotType } from "../../types/RobotType"
import { defaultGetServerSideProps } from "../../utils"
import { applyChangeToData, getValueFromInput } from "../../utils/defaultTypePath"
import { HOSTNAME } from "../../utils/env"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>Create New Robot</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    return <Container fluid>
        <Breadcrumb>
            <Link
                href={`/robot`}
                passHref>
                <Breadcrumb.Item>Instruments</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>New</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Create Robot</h1>
        <Instrument />
    </Container>
}

const Instrument = InstrumentCtrl(InstrumentView)

interface InstrumentCtrlInterface {
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
    is_valid: boolean
    is_saving: boolean
    robot: NewRobotType
}

function InstrumentCtrl<TProps extends {}>(Component: React.ComponentType<TProps & InstrumentCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const router = useRouter()
        const { ticker, buy_price, name, figi } = router.query
        const [robot, setRobot] = useState<NewRobotType>({
            figi: !figi ? "" : Array.isArray(figi) ? "" : figi,
            name: !name ? "" : Array.isArray(name) ? "" : name,
            buy_price: !buy_price ? 0 : Array.isArray(buy_price) ? 0 : parseFloat(buy_price) == NaN ? 0 : parseFloat(buy_price),
            sell_price: !buy_price ? 0 : Array.isArray(buy_price) ? 0 : parseFloat(buy_price) == NaN ? 0 : parseFloat(buy_price),
            max_shares_number: 1,
            min_shares_number: 0,
            initial_max_shares_number: 1,
            initial_min_shares_number: 0,
            budget: 0,
            strategy: ''
        })
        const [is_saving, setSaving] = useState(false)

        async function handleSubmit(event: FormEvent<HTMLFormElement>) {
            setSaving(true)
            event.preventDefault()
            const response = await fetch(`http://${HOSTNAME}:3001/robot`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(robot)
            })
            const data = await response.json()
            router.replace(`/robot/${data._id}/edit`)
        }

        function handleChange({ target }: ChangeEvent<HTMLInputElement>) {
            const { name } = target
            const value = getValueFromInput(target)
            setRobot(applyChangeToData(robot, name, value))
        }
        const is_valid = true
        return <Component
            {...props}
            robot={robot}
            is_valid={is_valid}
            is_saving={is_saving}
            onChange={handleChange}
            onSubmit={handleSubmit} />
    }
}

function InstrumentView({ onSubmit, onChange, robot, is_valid, is_saving }: InstrumentCtrlInterface) {
    return <Card>
        <Card.Body>
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label>FIGI</Form.Label>
                    <SelectFigiInput
                        name="figi"
                        placeholder="Type for select FIGI"
                        value={robot.figi}
                        onChange={onChange} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        type="text"
                        name="name"
                        onChange={onChange}
                        value={robot.name} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Buy Price</Form.Label>
                    <Form.Control
                        name="buy_price"
                        type="number"
                        step="0.01"
                        onChange={onChange}
                        value={robot.buy_price} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Sell Price</Form.Label>
                    <Form.Control
                        name="sell_price"
                        type="number"
                        step="0.01"
                        onChange={onChange}
                        value={robot.sell_price} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Budget</Form.Label>
                    <Form.Control
                        name="budget"
                        type="number"
                        step="0.01"
                        onChange={onChange}
                        value={robot.budget} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Min Shares Number</Form.Label>
                    <Form.Control
                        name="min_shares_number"
                        type="number"
                        step="1"
                        max={robot.max_shares_number}
                        onChange={onChange}
                        value={robot.min_shares_number} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Initial Min Shares Number</Form.Label>
                    <Form.Control
                        name="initial_min_shares_number"
                        type="number"
                        step="1"
                        max={robot.initial_max_shares_number}
                        onChange={onChange}
                        value={robot.initial_min_shares_number} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Max Shares Number</Form.Label>
                    <Form.Control
                        name="max_shares_number"
                        type="number"
                        step="1"
                        min={robot.min_shares_number}
                        onChange={onChange}
                        value={robot.max_shares_number} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Initial Max Shares Number</Form.Label>
                    <Form.Control
                        name="initial_max_shares_number"
                        type="number"
                        step="1"
                        min={robot.initial_min_shares_number}
                        onChange={onChange}
                        value={robot.initial_max_shares_number} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Strategy</Form.Label>
                    <Form.Control
                        name="strategy"
                        type="text"
                        onChange={onChange}
                        value={robot.strategy} />
                </Form.Group>
                <Form.Group>
                    <Button
                        variant={is_valid ? "success" : "light"}
                        disabled={!is_valid || is_saving}
                        type="submit">
                        {is_saving ? "Creating..." : "Create"}
                    </Button>
                </Form.Group>
            </Form>
        </Card.Body>
    </Card>
}