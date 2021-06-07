import { useFormik } from "formik"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { ChangeEventHandler, FormEventHandler, useState } from "react"
import { Breadcrumb, Button, Container, Form } from "react-bootstrap"
import Header from "../../components/Header"
import { SelectFigiInput } from "../../components/SelectFigi"
import { NewHistoryType } from "../../types/HistoryType"
import { defaultGetServerSideProps } from "../../utils"
import { HOSTNAME } from "../../utils/env"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>History creator</title>
        </Head>
        <Header />
        <Body />
    </>
}
const NewHistory = HistoryCreatorCtrl(View)
function Body() {
    return <Container fluid>
        <Breadcrumb>
            <Link href="/history" passHref>
                <Breadcrumb.Item>Histories</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>Create</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Create history</h1>
        <NewHistory />
    </Container>
}

interface HistoryCreatorCtrlInterface {
    history: NewHistoryType
    is_valid: boolean
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
}

function HistoryCreatorCtrl<TProps extends {}>(Component: React.ComponentType<TProps & HistoryCreatorCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const router = useRouter()
        const { values: history, handleChange, handleSubmit } = useFormik({
            initialValues: {
                title: '',
                description: '',
                figi: ''
            },
            onSubmit: async (values) => {
                const response = await fetch(`http://${HOSTNAME}:3001/history`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(values)
                })
                const data = await response.json()
                router.replace(`/history/${data._id}`)
            }
        })

        const is_valid = !!history.title && !!history.figi

        return <Component
            {...props}
            history={history}
            is_valid={is_valid}
            onChange={handleChange}
            onSubmit={handleSubmit} />
    }
}

function View({ onChange, history, onSubmit, is_valid }: HistoryCreatorCtrlInterface) {
    console.log('Render view()');
    return <Form onSubmit={onSubmit}>
        <Form.Group>
            <Form.Label>Title</Form.Label>
            <Form.Control
                type="text"
                name="title"
                value={history.title}
                onChange={onChange} />
        </Form.Group>
        <Form.Group>
            <Form.Label>Description</Form.Label>
            <Form.Control
                as="textarea"
                rows={3}
                name="description"
                value={history.description}
                onChange={onChange} />
        </Form.Group>
        <Form.Group>
            <Form.Label>FIGI</Form.Label>
            <SelectFigiInput
                name="figi"
                value={history.figi}
                onChange={onChange} />
        </Form.Group>
        <Form.Group>
            <Button
                type="submit"
                variant={is_valid ? "success" : "secondary"}
                disabled={!is_valid}>Create</Button>
        </Form.Group>
    </Form>
}