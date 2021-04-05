import { useState } from "react"
import { Modal } from "react-bootstrap"
import Chart from "./Chart"

interface ModalChartProps {
    figi: string
}

export const withModal = <Tprops extends ModalChartProps>(Component: React.ComponentType<Tprops>): React.FC<Tprops> =>
    (props) => {
        const [show, setShow] = useState(false)
        function handleShow() {
            setShow(true)
        }
        function handleHide() {
            setShow(false)
        }
        return <>
            <Component {...props} onShow={handleShow} />
            <Modal show={show} onHide={handleHide} size="lg">
                <Modal.Body>
                    <Chart figi={props.figi} interval={"1min"} dateTimeFormat="%H:%M"/>
                </Modal.Body>
            </Modal>
        </>
    }
