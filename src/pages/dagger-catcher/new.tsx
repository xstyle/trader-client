
import Link from "next/link"
import { useRouter } from "next/router"
import { ChangeEventHandler, ComponentType, FC, FormEventHandler, useState } from "react"
import { Badge, Breadcrumb, Button, Card, Container, Form } from "react-bootstrap"
import Header from "../../components/Header"
import { TickerPrice } from "../../components/Price"
import { SelectFigiInput } from "../../components/SelectFigi"
import { Ticker } from "../../components/Ticker"
import { NewDaggerCatcherType } from "../../types/DaggerCatcherType"
import { defaultGetServerSideProps } from "../../utils"
import { applyChangeToData, getValueFromInput } from "../../utils/defaultTypePath"
import { HOSTNAME } from "../../utils/env"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Header />
        <Body />
    </>
}

function Body() {
    const { query } = useRouter()

    return <Container fluid>
        <Breadcrumb>
            <Link href="/dagger-catcher" passHref>
                <Breadcrumb.Item>Dagger Catchers</Breadcrumb.Item>
            </Link>
            <Breadcrumb.Item active>Create</Breadcrumb.Item>
        </Breadcrumb>
        <h1>Create Dagger Catcher</h1>
        <DaggerCatcherCreator figi={query.figi as string} />
    </Container>
}

const DaggerCatcherCreator = DaggerCatcherCreatorCtrl(DaggerCatcherCreatorView)

function DaggerCatcherCreatorView({ onChange, onSubmit, dagger_catcher, is_saving, is_valid }: DaggerCatcherCreatorCtrlInterface) {
    const showTickerPrice = dagger_catcher.figi.length > 0
    return <Card>
        <Card.Body>
            <Form onSubmit={onSubmit}>
                <Form.Group>
                    <Form.Label>FIGI</Form.Label>
                    <SelectFigiInput
                        name="figi"
                        value={dagger_catcher.figi}
                        onChange={onChange}
                        placeholder="Click here to select..." />
                    {showTickerPrice && <Form.Text muted>
                        Current price <Badge variant="primary">
                            <TickerPrice figi={dagger_catcher.figi} />
                        </Badge>
                    </Form.Text>}
                </Form.Group>
                <Form.Group>
                    <Form.Label>Min Price</Form.Label>
                    <Form.Control
                        name="min"
                        placeholder=""
                        value={dagger_catcher.min}
                        onChange={onChange}
                        type="number"
                        max={dagger_catcher.max}
                    />
                </Form.Group>
                <Form.Group>
                    <Form.Label>Max Price</Form.Label>
                    <Form.Control
                        name="max"
                        placeholder=""
                        value={dagger_catcher.max}
                        onChange={onChange}
                        type="number"
                        min={dagger_catcher.min}
                    />
                </Form.Group>
                <Form.Group>
                    <Button
                        variant={is_valid ? "success" : "dark"}
                        disabled={is_saving || !is_valid}
                        type="submit">Create</Button>
                </Form.Group>
            </Form>
        </Card.Body>
    </Card>
}
type FormControlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement

interface DaggerCatcherCreatorCtrlInterface {
    onChange: React.ChangeEventHandler<FormControlElement>
    onSubmit: FormEventHandler<HTMLFormElement>
    is_saving: boolean
    is_valid: boolean
    dagger_catcher: NewDaggerCatcherType
}

function DaggerCatcherCreatorCtrl<TProps extends { figi: string }>(Component: ComponentType<TProps & DaggerCatcherCreatorCtrlInterface>): FC<TProps> {
    return (props) => {
        const router = useRouter()
        const [dagger_catcher, setData] = useState<NewDaggerCatcherType>({
            figi: props.figi || '',
            max: 0,
            min: 0,
        })
        const [is_saving, setSaving] = useState(false)

        const handleChange: ChangeEventHandler<FormControlElement> = ({ target }) => {
            const { name } = target
            const value = getValueFromInput(target)
            setData(applyChangeToData(dagger_catcher, name, value))
        }

        const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
            setSaving(true)
            event.preventDefault()
            const response = await fetch(`http://${HOSTNAME}:3001/dagger-catcher`, {
                method: 'POST',
                body: JSON.stringify(dagger_catcher),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            const data = await response.json()
            router.replace(`/dagger-catcher/${data._id}/edit`)
        }
        const is_valid: boolean = !!dagger_catcher.figi
            && !!dagger_catcher.min
            && !!dagger_catcher.max
            && dagger_catcher.min > 0
            && dagger_catcher.max > 0
            && dagger_catcher.min < dagger_catcher.max

        return <Component
            {...props}
            dagger_catcher={dagger_catcher}
            is_saving={is_saving}
            is_valid={is_valid}
            onChange={handleChange}
            onSubmit={handleSubmit} />
    }

}