
import Link from "next/link"
import { useRouter } from "next/router"
import { ChangeEventHandler, ComponentType, FC, FormEventHandler, useState } from "react"
import { Badge, Breadcrumb, Button, Card, Container, Form } from "react-bootstrap"
import Header from "../../components/Header"
import { MarketInstrumentPrice } from "../../components/Price"
import { SelectFigiInput } from "../../components/SelectFigi"
import { CandleFieldValue } from "../../components/Candle"
import { NewDaggerCatcherType } from "../../types/DaggerCatcherType"
import { defaultGetServerSideProps } from "../../utils"
import { HOSTNAME } from "../../utils/env"
import { useFormik } from "formik"

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
                            <MarketInstrumentPrice figi={dagger_catcher.figi} />
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
        const formik = useFormik<NewDaggerCatcherType>({
            initialValues: {
                figi: props.figi || '',
                max: 0,
                min: 0,
            },
            onSubmit: async (values) => {
                const response = await fetch(`http://${HOSTNAME}:3001/dagger-catcher`, {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                const data = await response.json()
                router.replace(`/dagger-catcher/${data._id}/edit`)
            }
        })

        const is_valid: boolean = !!formik.values.figi
            && !!formik.values.min
            && !!formik.values.max
            && formik.values.min > 0
            && formik.values.max > 0
            && formik.values.min < formik.values.max

        return <Component
            {...props}
            dagger_catcher={formik.values}
            is_saving={formik.isSubmitting}
            is_valid={is_valid}
            onChange={formik.handleChange}
            onSubmit={formik.handleSubmit} />
    }
}