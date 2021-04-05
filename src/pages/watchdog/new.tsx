import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { ChangeEventHandler, FormEventHandler, useState } from "react"
import { Breadcrumb, Button, Card, Container, Form } from "react-bootstrap"
import Header from "../../components/Header"
import { SelectFigiInput } from "../../components/SelectFigi"
import { NewWatchdogType } from "../../types/WatchdogType"
import { defaultGetServerSideProps } from "../../utils"
import { applyChangeToData, getValueFromInput } from "../../utils/defaultTypePath"
import { HOSTNAME } from "../../utils/env"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>WatchDog creator</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    return <Container fluid>
        <Breadcrumb>
            <Link href="/watchdog" passHref>
                <Breadcrumb.Item>WatchDogs</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>New</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Create WatchDog</h1>
        <WatchDogCreator />
    </Container>
}

const WatchDogCreator = WatchDogCreatorCtrl(WatchDogCreatorView)

interface WatchDogCreatorCtrlInterface {
    watchdog: NewWatchdogType
    is_valid: boolean
    is_loading: boolean
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
}

function WatchDogCreatorCtrl<TProps extends object>(Component: React.ComponentType<TProps & WatchDogCreatorCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const router = useRouter()
        const [watchdog, setData] = useState<NewWatchdogType>({
            figi: (router.query.figi || "") as string,
            threshold: 1
        })
        const [is_loading, setLoading] = useState(false)

        const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
            event.preventDefault()
            setLoading(true)
            const url = new URL('/watchdog', `http://${HOSTNAME}:3001`)

            const response = await fetch(url.href, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(watchdog)
            })
            const data = await response.json()
            router.replace(`/watchdog/${data._id}`)
        }

        const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
            const { name } = target
            const value = getValueFromInput(target)
            setData(applyChangeToData(watchdog, name, value))
        }
        const is_valid = !!watchdog.figi
        return <Component
            {...props}
            watchdog={watchdog}
            is_valid={is_valid}
            is_loading={is_loading}
            onChange={handleChange}
            onSubmit={handleSubmit} />
    }
}

function WatchDogCreatorView({ onSubmit, onChange, watchdog, is_valid, is_loading }: WatchDogCreatorCtrlInterface) {
    return <Card>
        <Card.Body>
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label>FIGI</Form.Label>
                    <SelectFigiInput
                        placeholder="Select FIGI..."
                        value={watchdog.figi}
                        name="figi"
                        onChange={onChange} />
                </Form.Group>
                <Form.Group>
                    <Button
                        disabled={!is_valid || is_loading}
                        variant={is_valid ? "success" : "light"}
                        type="submit">{is_loading ? "Saving..." : "Save"}</Button>
                </Form.Group>
            </Form>
        </Card.Body>
    </Card>
}