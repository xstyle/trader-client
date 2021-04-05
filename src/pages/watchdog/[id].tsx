import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import React from "react"
import { Breadcrumb, Button, Card, Form } from "react-bootstrap"
import Header from "../../components/Header"
import { SelectFigiInput } from "../../components/SelectFigi"
import { WatchDogCtrl, WatchdogCtrlInterface, watchdogProvider } from "../../components/WatchDog/WatchDogProvider"
import { WatchdogProviderInterface } from "../../types/WatchdogType"
import { defaultGetServerSideProps } from "../../utils"
export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>WatchDog editor</title>
        </Head>
        <Header />
        <Body />
    </>
}
function Body() {
    const { query } = useRouter()
    if (!query.id) return null
    return <div className="container-fluid">
        <Breadcrumb>
            <Link href="/watchdog" passHref>
                <Breadcrumb.Item>WatchDogs</Breadcrumb.Item>
            </Link>
            <Link href={`/watchdog/${query.id}`} passHref>
                <Breadcrumb.Item>WatchDog</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>Edit</Breadcrumb.Item>
        </Breadcrumb>
        <h1>WatchDog</h1>
        <WatchDog id={query.id as string} />
    </div>
}

const WatchDog = watchdogProvider(WatchDogCtrl(WatchDogView))

function WatchDogView({ watchdog, onChange, onRun, onStop, onSubmit, is_saving, is_valid }: WatchdogProviderInterface & WatchdogCtrlInterface) {
    return <>
        <Form.Group>
            {!watchdog.is_enabled
                ? <Button
                    onClick={onRun}
                    variant="danger">Disabled</Button>
                : <Button
                    onClick={onStop}
                    variant="success">Enabled</Button>}
        </Form.Group>
        <Card>
            <Card.Body>
                <Form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>FIGI</Form.Label>
                        <SelectFigiInput
                            name="figi"
                            onChange={onChange}
                            value={watchdog.figi} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Threshold</Form.Label>
                        <Form.Control
                            className="form-control"
                            name="threshold"
                            type="number"
                            step="0.01"
                            onChange={onChange}
                            value={watchdog.threshold} />
                    </Form.Group>
                    <Form.Group>
                        <Button
                            type="submit"
                            disabled={is_saving || !is_valid}
                            variant="success">{is_saving ? "Saving..." : "Save"}</Button>
                    </Form.Group>
                </Form>
            </Card.Body>
        </Card>

    </>
}