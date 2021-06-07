import { Formik, useFormik } from "formik"
import Head from "next/head"
import Link from "next/link"
import { useRouter } from "next/router"
import React, { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, useEffect, useState } from "react"
import { Breadcrumb, Button, Card, Container, Form } from "react-bootstrap"
import { mutate } from "swr"
import Header from "../../../components/Header"
import { listProvider } from "../../../components/List/ListProvider"
import { ListProviderInterface } from "../../../types/ListType"
import { HOSTNAME } from "../../../utils/env"
import { defaultGetServerSideProps } from "../../../utils/index"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>List editor</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    const { query } = useRouter()
    const { id } = query
    if (!id || Array.isArray(id)) return null
    return <Container fluid>
        <Breadcrumb>
            <Link href="/list" passHref>
                <Breadcrumb.Item>Lists</Breadcrumb.Item>
            </Link>
            <Link href={`/list/${id}`} passHref>
                <Breadcrumb.Item>List</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>Edit</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Edit List</h1>
        <ListEditor id={id} />
    </Container>
}

const ListEditor = listProvider(ListEditorCtrl(ListEditorView))

interface ListEditorCtrlInterface {
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
    is_saving: boolean
    is_valid: boolean
}

function ListEditorCtrl<TProps extends ListProviderInterface>(Component: React.ComponentType<TProps & ListEditorCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const { source_url } = props
        const { values: list, handleChange, handleSubmit, isSubmitting, setValues } = useFormik({
            initialValues: props.list,
            onSubmit: async (values) => {
                await fetch(`http://${HOSTNAME}:3001/list/${list._id}`, {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                await mutate(source_url)
            }
        })
        useEffect(() => { setValues(props.list) }, [props.list])

        const is_valid = !!list.name

        return <Component
            {...props}
            list={list}
            is_valid={is_valid}
            is_saving={isSubmitting}
            onChange={handleChange}
            onSubmit={handleSubmit} />
    }
}

function ListEditorView({ onSubmit, onChange, list, is_saving, is_valid }: ListEditorCtrlInterface & ListProviderInterface) {
    return <Card>
        <Card.Body>
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        name="name"
                        type="text"
                        onChange={onChange}
                        value={list.name}
                    />
                </Form.Group>
                <Form.Group>
                    <Button
                        type="submit"
                        disabled={!is_valid}
                        variant={is_valid ? "success" : "light"}>{is_saving ? "Saving..." : "Save"}</Button>
                </Form.Group>
            </Form>
        </Card.Body>

    </Card>
}