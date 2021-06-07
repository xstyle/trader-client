import { useFormik } from "formik";
import Head from "next/head";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { ChangeEvent, ChangeEventHandler, FormEvent, FormEventHandler, useEffect, useState } from "react";
import { Breadcrumb, Button, Card, Container, Form } from "react-bootstrap";
import { mutate } from "swr";
import Header from "../../../components/Header";
import { historyProvider } from "../../../components/History/HistoryProvider";
import { HistoryProviderInterface } from "../../../types/HistoryType";
import { defaultGetServerSideProps } from "../../../utils";
import { HOSTNAME } from "../../../utils/env"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>History editor</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    const { query } = useRouter()
    if (!query.id || Array.isArray(query.id)) return null
    return <Container fluid>
        <Breadcrumb>
            <Link
                href="/history"
                passHref>
                <Breadcrumb.Item>Histories</Breadcrumb.Item>
            </Link>
            <Link
                href={`/history/${query.id}`}
                passHref>
                <Breadcrumb.Item>History</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>Edit</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Editor history</h1>
        <Editor id={query.id} />
    </Container>
}

const Editor = historyProvider(HistoryEditorCtrl(HistoryEditorView))

interface HistoryEditorCtrlInterface {
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
    is_saving: boolean
    is_valid: boolean
}

function HistoryEditorCtrl<TProps extends HistoryProviderInterface>(Component: React.ComponentType<TProps & HistoryEditorCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const formik = useFormik({
            initialValues: props.history,
            onSubmit: async (values) => {

                await fetch(`http://${HOSTNAME}:3001/history/${values._id}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(values)
                })
                mutate(props.source_url)
            }
        })

        useEffect(() => { formik.setValues(props.history) }, [props.history])

        const is_valid = !!formik.values.title && !!formik.values.figi

        return <Component
            {...props}
            history={formik.values}
            is_saving={formik.isSubmitting}
            is_valid={is_valid}
            onChange={formik.handleChange}
            onSubmit={formik.handleSubmit} />
    }
}

function HistoryEditorView({ history, onChange, onSubmit, is_saving }: HistoryEditorCtrlInterface & HistoryProviderInterface) {
    return <>
        <Card>
            <Card.Body>
                <Form onSubmit={onSubmit}>
                    <Form.Group>
                        <Form.Label>Title</Form.Label>
                        <Form.Control name="title" value={history.title} onChange={onChange} />
                    </Form.Group>
                    <Form.Group>
                        <Form.Label>Description</Form.Label>
                        <Form.Control name="description" as="textarea" rows={3} value={history.description} onChange={onChange} />
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
    </>
}