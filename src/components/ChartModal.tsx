import { CandleResolution } from "@tinkoff/invest-openapi-js-sdk/build/domain.d"
import React, { useState } from "react"
import { Button, ButtonGroup, ButtonToolbar, Modal } from "react-bootstrap"
import Chart from "./Chart"

interface ModalChartProps {
    figi: string
}

const candleResolutions: CandleResolution[] = ["1min", "hour", "day", "week", "month"]

export const withModal = <Tprops extends ModalChartProps>(Component: React.ComponentType<Tprops>): React.FC<Tprops> => (props) => {
    const [show, setShow] = useState(false)
    const [interval, setInterval] = useState<CandleResolution>("1min")
    function handleShow() {
        setShow(true)
    }
    function handleHide() {
        setShow(false)
    }

    function handleSetInteval(interval: CandleResolution) {
        setInterval(interval)
    }
    return <>
        <Component
            {...props}
            onShow={handleShow} />
        <Modal
            show={show}
            onHide={handleHide}
            size="lg">
            <Modal.Body>
                <Chart
                    figi={props.figi}
                    interval={interval}
                    dateTimeFormat="%H:%M" />
            </Modal.Body>
            <Modal.Footer>
                <ButtonToolbar>
                    <ButtonGroup className="mr-2" size="sm">
                        {
                            candleResolutions.map(_interval => (
                                <Button
                                    key={_interval}
                                    onClick={() => { handleSetInteval(_interval) }}
                                    active={_interval === interval}>{_interval}</Button>
                            ))
                        }
                    </ButtonGroup>
                </ButtonToolbar>
                <Button
                    size={"sm"}
                    variant={"secondary"}
                    onClick={handleHide}>Close</Button>
            </Modal.Footer>
        </Modal>
    </>
}
