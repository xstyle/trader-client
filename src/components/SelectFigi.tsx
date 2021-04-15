import { ChangeEvent, ChangeEventHandler, FormEvent, useState } from "react";
import { Form, ListGroup, Modal, ModalProps } from "react-bootstrap";
import { StocksProviderInterface, StocksSourceUrlProvider } from "../types/StockType";
import { getValueFromInput } from "../utils/defaultTypePath";
import { stocksProdiver } from "./Stock/StockProvider";

export function SelectFigiInput({
    name,
    value,
    onChange,
    placeholder = "",
    className = ""
}: {
    name: string,
    value: string,
    onChange: ChangeEventHandler<HTMLInputElement>
    placeholder?: string,
    className?: string
}) {
    const [show, setShow] = useState(false)
    function toogleShow() { setShow(!show) }
    function handleSelect(figi: string) {
        onChange({
            target: {
                name,
                value: figi,
                type: 'text'
            }
        } as ChangeEvent<HTMLInputElement>)
        toogleShow()
    }
    return <>
        <Form.Control
            className={className}
            value={value}
            readOnly
            placeholder={placeholder}
            name={name}
            onClick={toogleShow} />
        <SelectFigi
            show={show}
            onClose={toogleShow}
            onSelect={handleSelect} />
    </>
}

export function SelectFigi({ onClose, onSelect, show }: ModalProps & { onSelect(figi: string): void }) {
    const [search, setSearch] = useState('')
    function handleChange({ target }: ChangeEvent<HTMLInputElement>) {
        const { name } = target
        const value = getValueFromInput(target)
        setSearch(value)
    }
    return <Modal
        autoFocus={true}
        show={show}
        onHide={onClose}
        size="lg">
        <Modal.Header closeButton>
            <Modal.Title>Select Instrument</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Form>
                <Form.Group>
                    <Form.Control
                        name="search"
                        as="input"
                        autoFocus
                        value={search}
                        placeholder="Type text to search Instrument..."
                        onChange={handleChange}
                        type="text" />
                </Form.Group>
            </Form>
            <StocksList
                search={search}
                onSelect={onSelect} />
        </Modal.Body>
    </Modal>
}

const StocksList = stocksProdiver(StocksListView)

function StocksListView({ instruments, onSelect }: StocksProviderInterface & StocksSourceUrlProvider & { onSelect(figi: string): void }) {
    return <ListGroup>
        {
            instruments.map((instrument) =>
                <ListGroup.Item
                    key={instrument.figi}
                    action
                    as="button"
                    onClick={() => onSelect(instrument.figi)}>{instrument.name}</ListGroup.Item>
            )
        }
    </ListGroup>
}