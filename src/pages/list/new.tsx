import Link from "next/link"
import { useRouter } from "next/router"
import { ChangeEventHandler, FormEventHandler, useState } from "react"
import { Breadcrumb, Button, Card, Container, Form } from "react-bootstrap"
import Header from "../../components/Header"
import { NewListType } from "../../types/ListType"
import { HOSTNAME } from "../../utils/env"
import { defaultGetServerSideProps } from "../../utils"
import { useFormik } from "formik"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Header />
        <Body />
    </>
}

function Body() {
    return <Container fluid>
        <Breadcrumb>
            <Link href="/list" passHref>
                <Breadcrumb.Item>Lists</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>New</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Create List</h1>
        <ListCreator />
    </Container>
}

interface ListCreatorCtrlInterface {
    list: NewListType
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
    is_valid: boolean
    is_saving: boolean
}

function ListCreatorCtrl<TProps extends {}>(Component: React.ComponentType<TProps & ListCreatorCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const router = useRouter()

        const { values: list, handleChange, handleSubmit, isSubmitting } = useFormik({
            initialValues: {
                name: ''
            },
            onSubmit: async (values) => {
                const response = await fetch(`http://${HOSTNAME}:3001/list`, {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: {
                        'Content-Type': 'application/json'
                    },
                })
                const body = await response.json()
                router.replace(`/list/${body._id}`)
            }
        })

        const is_valid = !!list.name
        return <Component
            {...props}
            list={list}
            is_valid={is_valid}
            is_saving={isSubmitting}
            onSubmit={handleSubmit}
            onChange={handleChange} />
    }
}

function ListCreatorView({ list, onSubmit, onChange, is_valid, is_saving }: ListCreatorCtrlInterface) {
    return <Card>
        <Card.Body>
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label>Name</Form.Label>
                    <Form.Control
                        name="name"
                        placeholder="Type name of new list"
                        value={list.name}
                        onChange={onChange} />
                </Form.Group>
                <Form.Group>
                    <Button
                        variant={is_valid ? "success" : "light"}
                        disabled={!is_valid || is_saving}
                        type="submit">{is_saving ? "Saving..." : "Save"}</Button>
                </Form.Group>
            </Form>
        </Card.Body>
    </Card>
}

const ListCreator = ListCreatorCtrl(ListCreatorView)