import { useFormik } from "formik";
import { ChangeEventHandler, useState } from "react";
import { Button, ButtonGroup, Form, Modal, Table, ToggleButton } from "react-bootstrap";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import Moment from "react-moment";
import { Operation, OperationsProvider, OperationsProviderParams } from "../types/OperationType";
import { operationsProvider } from "./Operation/OperationProvider";

export function SelectOperation({
    figi,
    onClose,
    onSelect,
    show,
    exclude = []
}: {
    onClose(): void,
    onSelect(operation: Operation): Promise<void>
    show: boolean,
    exclude: string[],
    figi: string
}) {
    return <Modal
        show={show}
        onHide={onClose}
        size="lg">
        <Modal.Header closeButton>
            <Modal.Title>Select Operation</Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Body
                figi={figi}
                exclude={exclude}
                onSelect={onSelect} />
        </Modal.Body>
    </Modal>
}

const Body = BodyCtrl(BodyView)

interface BodyCtrlInterface {
    start_date?: Date,
    end_date?: Date,
    onDateRangeChange(range: [Date, Date]): void
}

function BodyCtrl<TProps extends {}>(Component: React.ComponentType<TProps & BodyCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const [start_date, setStartDate] = useState<Date>()
        const [end_date, setEndDate] = useState<Date>()
        function handleDateRangeChange([start, end]: [Date, Date]) {
            start && start.setHours(0, 0, 0, 0)
            end && end.setHours(23, 59, 59, 999)
            setStartDate(start)
            setEndDate(end)
        }
        return <Component
            {...props}
            start_date={start_date}
            end_date={end_date}
            onDateRangeChange={handleDateRangeChange}
        />
    }
}

function BodyView(props: BodyCtrlInterface & { exclude: string[], onSelect(operation: Operation): Promise<void>, figi: string }) {
    const { onDateRangeChange, start_date, end_date } = props
    return <>
        <Form.Group className="text-center">
            <ReactDatePicker
                selected={start_date}
                onChange={onDateRangeChange}
                startDate={start_date}
                endDate={end_date}
                monthsShown={1}
                selectsRange
                inline
            />
            <Form.Text>
                {!start_date && <span>Select date range. First, select start date of the range...</span>}
                {start_date && !end_date && <span>Now select end date of the range</span>}
                {start_date && end_date && <span>You can choose another date range. First, select new start date of the new range...</span>}
            </Form.Text>
        </Form.Group>
        {start_date && end_date && <Loader {...props} start_date={start_date.toString()} end_date={end_date.toString()} />}
    </>
}

const Loader = operationsProvider(OperationsSelectorCtrl(OperationSelectorView))

export interface OperationsSelectorCtrlInterface {
    amount: number,
    onChange: ChangeEventHandler<HTMLInputElement>,
    filter: "all" | "unselected"
    status: "all" | "done"
}

function OperationsSelectorCtrl<TProps extends OperationsProviderParams & OperationsProvider & { exclude: string[], onSelect(operation: Operation): Promise<void> }>(Component: React.ComponentType<TProps & OperationsSelectorCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const formik = useFormik<{ filter: "all" | "unselected", status: "all" | "done" }>({
            initialValues: {
                filter: "all",
                status: "all"
            },
            onSubmit: ()=> {}
        })
        const { operations } = props
        operations.sort((a, b) => a.date > b.date ? 1 : a.date < b.date ? -1 : 0)
        const filtered_operation = operations
            .filter(operation => {
                switch (operation.operationType) {
                    case 'Sell':
                    case 'Buy':
                    case 'BuyCard':
                        return true
                    default:
                        return false
                }
            })
            .filter(operation => {
                switch (formik.values.filter) {
                    case "unselected":
                        return props.exclude.indexOf(operation.id) < 0
                        break;
                    default:
                        return true
                        break;
                }
            })
            .filter(operation => {
                switch (formik.values.status) {
                    case "done":
                        return operation.status === "Done"
                        break;
                    default:
                        return true
                        break;
                }
            })

        const amount = filtered_operation.reduce((sum, operation) => {
            switch (operation.operationType) {
                case "Sell":
                    sum -= operation.quantityExecuted
                    break;
                case "Buy":
                    sum += operation.quantityExecuted
                default:
                    break;
            }
            return sum
        }, 0)

        return <Component
            {...props}
            {...formik.values}
            onChange={formik.handleChange}
            operations={filtered_operation}
            amount={amount} />
    }
}
const radios = [
    { value: "all", name: "All" },
    { value: "unselected", name: "Unselected" },
]
const statuses = [
    { value: "all", name: "All" },
    { value: "done", name: "Done" }
]
function OperationSelectorView({ operations, onSelect, exclude, onChange, filter, status, amount }: OperationsSelectorCtrlInterface & OperationsProvider & { exclude: string[], onSelect(operation: Operation): Promise<void> }) {
    return <>
        <Form inline className="mb-2">
            <i className="fa fa-filter mr-4" />
            <Form.Group className="mr-4">
                <Form.Label className="mr-2">Selected:</Form.Label>
                <ButtonGroup toggle size="sm">
                    {radios.map((radio, idx) => (
                        <ToggleButton
                            key={idx}
                            type="radio"
                            variant="secondary"
                            name="filter"
                            value={radio.value}
                            checked={filter === radio.value}
                            onChange={onChange}>
                            {radio.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
            </Form.Group>
            <Form.Group className="mr-4">
                <Form.Label className="mr-2">Status:</Form.Label>
                <ButtonGroup toggle size="sm">
                    {statuses.map((radio, index) => (
                        <ToggleButton
                            key={index}
                            type="radio"
                            variant="secondary"
                            name="status"
                            value={radio.value}
                            checked={status === radio.value}
                            onChange={onChange}>
                            {radio.name}
                        </ToggleButton>
                    ))}
                </ButtonGroup>
            </Form.Group>
        </Form>

        <Table
            size="sm"
            hover
            responsive>
            {/* <thead>
            <tr>
                <th></th>
                <th>Date</th>
                <th>Type</th>
                <th>Lots</th>
                <th>Price</th>
                <th>Status</th>
                <th>ID</th>
            </tr>
        </thead> */}
            <tbody>
                {
                    operations.map(operation => {
                        const excluded = exclude.indexOf(operation.id) >= 0
                        const disabled = excluded
                        return <tr
                            key={operation.id}
                            className={operation.status === "Decline" ? "text-muted" : ""}>
                            <td>
                                <Button
                                    size="sm"
                                    variant={disabled ? "light" : "success"}
                                    disabled={disabled}
                                    onClick={() => onSelect(operation)}>{excluded ? "Selected" : "Select"}</Button>
                            </td>
                            <td>{operation.operationType}</td>
                            <td>
                                <Moment format="DD MMM YY HH:mm:ss">{operation.date}</Moment>
                            </td>
                            <td>{operation.quantity}</td>
                            <td>{operation.quantityExecuted}</td>
                            <td className="text-right text-monospace">{operation.price.toFixed(2)}</td>
                            <td>{operation.status}</td>
                            <td>{operation.id}</td>
                        </tr>
                    })
                }
                <tr>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th></th>
                    <th>{amount}</th>
                    <th></th>
                    <th></th>
                    <th></th>
                </tr>
            </tbody>
        </Table></>
}