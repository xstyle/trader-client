import Link from "next/link"
import { useRouter } from "next/router"
import { ChangeEventHandler, FormEventHandler, useState } from "react"
import { Breadcrumb, Button, Card, Container, Form } from "react-bootstrap"
import Header from "../../components/Header"
import { NewListType } from "../../types/ListType"
import { applyChangeToData, getValueFromInput } from "../../utils/defaultTypePath"
import { HOSTNAME } from "../../utils/env"
import { defaultGetServerSideProps } from "../../utils"

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
        const [list, setList] = useState<NewListType>({
            name: ''
        })

        const [is_saving, setSaving] = useState(false)

        const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
            const { name } = target
            const value = getValueFromInput(target)
            setList(applyChangeToData(list, name, value))
        }

        const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
            setSaving(true)
            event.preventDefault()
            const response = await fetch(`http://${HOSTNAME}:3001/list`, {
                method: 'POST',
                body: JSON.stringify(list),
                headers: {
                    'Content-Type': 'application/json'
                },
            })
            const body = await response.json()
            router.replace(`/list/${body._id}`)
        }

        const is_valid = !!list.name
        return <Component
            {...props}
            list={list}
            is_valid={is_valid}
            is_saving={is_saving}
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