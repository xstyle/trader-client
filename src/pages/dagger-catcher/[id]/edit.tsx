import Link from "next/link"
import { useRouter } from "next/router"
import { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, useEffect, useState } from "react"
import { Breadcrumb, Button, Card, Container, Form } from "react-bootstrap"
import { mutate } from "swr"
import { daggerCatcherProvider } from "../../../components/DaggerCatcher/DaggerCatcherProvider"
import Header from "../../../components/Header"
import { DaggerCatcherProviderInterface } from "../../../types/DaggerCatcherType"
import { defaultGetServerSideProps } from "../../../utils"
import { applyChangeToData, getValueFromInput } from "../../../utils/defaultTypePath"
import { HOSTNAME } from "../../../utils/env"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Header />
        <Body />
    </>
}

function Body() {
    const { query: { id } } = useRouter()
    if (!id || Array.isArray(id)) return null
    return <Container fluid>
        <Breadcrumb>
            <Link
                href="/dagger-catcher"
                passHref>
                <Breadcrumb.Item>Dagger Catchers</Breadcrumb.Item>
            </Link>
            <Link
                href={`/dagger-catcher/${id}`}
                passHref>
                <Breadcrumb.Item>Dagger Catcher</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>Edit</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Dagger Catcher</h1>
        <DaggerCatcherLoader id={id} />
    </Container>
}

const DaggerCatcherLoader = daggerCatcherProvider(DaggerCatcherEditorCtrl(DaggerCatcherEditorView))

interface DaggerCatcherEditorCtrlInterface {
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
    is_saving: boolean
}

function DaggerCatcherEditorCtrl<TProps extends DaggerCatcherProviderInterface>(Component: React.ComponentType<TProps & DaggerCatcherEditorCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const [daggerCatcher, setDaggerCatcher] = useState(props.daggerCatcher)
        const [is_saving, setSaving] = useState(false)

        function handleChange({ target }: ChangeEvent<HTMLInputElement>) {
            const { name } = target
            const value = getValueFromInput(target)
            setDaggerCatcher(applyChangeToData(daggerCatcher, name, value))
        }

        useEffect(() => setDaggerCatcher(props.daggerCatcher), [props.daggerCatcher])

        async function handleSubmit(event: FormEvent<HTMLFormElement>) {
            setSaving(true)
            event.preventDefault()
            await fetch(`http://${HOSTNAME}:3001/dagger-catcher/${daggerCatcher._id}`, {
                method: 'POST',
                body: JSON.stringify(daggerCatcher),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            mutate(props.source_url)
            setSaving(false)
        }
        return <Component
            {...props}
            daggerCatcher={daggerCatcher}
            is_saving={is_saving}
            onChange={handleChange}
            onSubmit={handleSubmit} />
    }
}

function DaggerCatcherEditorView({ daggerCatcher, onChange, onSubmit, is_saving }: DaggerCatcherEditorCtrlInterface & DaggerCatcherProviderInterface) {
    return <Card>
        <Card.Body>
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label>Min</Form.Label>
                    <Form.Control
                        type="text"
                        name="min"
                        onChange={onChange}
                        value={daggerCatcher.min} />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Max</Form.Label>
                    <Form.Control
                        type="text"
                        name="max"
                        onChange={onChange}
                        value={daggerCatcher.max} />
                </Form.Group>
                <Form.Group>
                    <Button
                        disabled={is_saving}
                        variant="success"
                        type="submit">{is_saving ? "Saving..." : "Save"}</Button>
                </Form.Group>
            </Form>
        </Card.Body>
    </Card>
}