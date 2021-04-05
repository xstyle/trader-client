import React from "react"
import { Button, Form } from "react-bootstrap"
import { ordersProvider, OrdersCtrl, OrdersCtrlInterface, OrdersProviderInterface, OrdersTable } from "./Orders"
import { Reports } from "./Reports"

export const OrdersCollection = ordersProvider(OrdersCtrl(OrdersView))

function OrdersView(props: OrdersCtrlInterface & OrdersProviderInterface) {
    return <>
        <Form.Group className="text-right">
            <Button
                variant="dark"
                size="sm"
                onClick={props.onSelectOrders}>Add Orders</Button>
        </Form.Group>
        <OrdersTable {...props} />
        <h2>Report</h2>
        <Reports orders={props.orders} />
    </>
}