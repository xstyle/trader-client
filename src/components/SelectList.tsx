import { ComponentType } from "react"
import { Button, Modal, Table } from "react-bootstrap"
import useSWR, { mutate } from "swr"
import { ListsProviderInterface, ListType } from "../types/ListType"
import { HOSTNAME } from '../utils/env'
import { listsProvider } from "./List/ListProvider"

export const SelectList = listsProvider(SelectListCtrl(SelectListView))

function SelectListView({ show, figi, onClose, lists, onAdd, onRemove }: SelectList & SelectListModal) {
    return <Modal
        show={show}
        onHide={onClose}>
        <Modal.Header closeButton>
            <Modal.Title>Select Lists</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <p>Please choose list for {figi}</p>
        </Modal.Body>
        <Table
            hover
            responsive>
            <thead>
                <tr>
                    <th>List name</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {
                    lists.map(list => {
                        const contains = list.figis.indexOf(figi) > -1
                        return <tr key={list._id}>
                            <th>{list.name}</th>
                            <td>
                                {contains
                                    ? <Button
                                        variant="danger"
                                        size="sm"
                                        onClick={() => onRemove(list)}>Remove</Button>
                                    : <Button
                                        variant="success"
                                        size="sm"
                                        onClick={() => onAdd(list)}>Add</Button>}
                            </td>
                        </tr>
                    })
                }
            </tbody>
        </Table>
    </Modal>
}

interface SelectList {
    onAdd: (list: ListType) => Promise<void>,
    onRemove: (list: ListType) => Promise<void>,
    lists: ListType[],
    figi: string
}

interface SelectListModal {
    onClose: () => void,
    show: boolean,
}

function SelectListCtrl<P extends ListsProviderInterface & SelectListModal & { figi: string }>(Component: ComponentType<P & SelectList>): React.FC<P> {
    return (props) => {
        const { figi, source_url } = props
        async function handleAdd(list: ListType) {
            const url = new URL(`/list/${list._id}/add`, `http://${HOSTNAME}:3001`)
            url.searchParams.set('figi', figi)
            await fetch(url.href)
            mutate(source_url)
        }

        async function handleRemove(list: ListType) {
            const url = new URL(`/list/${list._id}/remove`, `http://${HOSTNAME}:3001`)
            url.searchParams.set('figi', figi)
            await fetch(url.href)
            mutate(source_url)
        }
        return <Component
            {...props}
            onAdd={handleAdd}
            onRemove={handleRemove} />
    }
}

