import { useFormik } from "formik"
import { ChangeEventHandler, ComponentType, FC, useEffect } from "react"
import { mutate } from "swr"
import { DaggerCatcherProviderInterface } from "../../types/DaggerCatcherType"
import { HOSTNAME } from "../../utils/env"
import { MutateOrders } from "../Orders"

export interface DaggerCatcherCtrlInterface {
    state: {
        price: number,
        min: number,
        max: number,
        step: number,
        lots: number
    },
    onChange: ChangeEventHandler<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    onSubmit(operation: "Sell" | "Buy"): void,
    onSetPinned(): Promise<void>
}

export function DaggerCatcherCtrl<TProps extends DaggerCatcherProviderInterface>(Component: ComponentType<TProps & DaggerCatcherCtrlInterface>): FC<TProps> {
    return (props) => {
        const initialState = {
            price: Math.round((props.daggerCatcher.max + props.daggerCatcher.min) * 100 / 2) / 100,
            min: props.daggerCatcher.min,
            max: props.daggerCatcher.max,
            step: 0.1,
            lots: 1,
        };

        useEffect(() => {
            formik.setValues(initialState)
        }, [props.daggerCatcher])

        const formik = useFormik({
            initialValues: initialState,
            onSubmit: () => {}
        })

        async function handleSubmit(operation: "Sell" | "Buy") {
            try {
                await fetch(`${props.source_url}/order`, {
                    method: 'POST',
                    body: JSON.stringify({ ...formik.values, operation }),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                MutateOrders({
                    figi: props.daggerCatcher.figi,
                    collection: props.daggerCatcher._id
                })
            } catch (err) {
                console.error(err)
            }
        }

        async function handleSetPinned() {
            await fetch(`http://${HOSTNAME}:3001/dagger-catcher/${props.daggerCatcher._id}/pinned`)
            mutate(props.source_url)
        }

        return <Component
            {...props}
            state={formik.values}
            onSubmit={handleSubmit}
            onChange={formik.handleChange}
            // candle={candle}
            // marketInstrument={marketInstrument}
            onSetPinned={handleSetPinned} />
    }
}