import React from "react"
import { Button, Col, Form, Row } from "react-bootstrap"
import { OrdersCtrl, OrdersCtrlInterface, ordersProvider, OrdersProviderInterface, OrdersTable } from "./Orders"
import { Reports } from "./Reports"

export const OrdersCollection = ordersProvider(OrdersCtrl(OrdersView))

function OrdersView(props: OrdersCtrlInterface & OrdersProviderInterface) {
    return <>
        <Row className="align-items-end mb-3 mt-5">
            <Col>
                <h2 className="mb-0">Orders</h2>
            </Col>
            <Col xs="auto">
                <Button
                    variant="dark"
                    size="sm"
                    onClick={props.onSelectOrders}>Add Orders</Button>
            </Col>
        </Row>
        <OrdersTable {...props} />
        <h2 className="mb-3 mt-5">Report</h2>
        <Reports orders={props.orders} />
    </>
}