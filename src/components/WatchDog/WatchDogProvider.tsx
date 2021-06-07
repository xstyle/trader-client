import { useFormik } from "formik";
import { ChangeEventHandler, FormEventHandler, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { WatchdogProviderInterface, WatchdogsProviderInterface, WatchdogType } from "../../types/WatchdogType";
import { HOSTNAME } from "../../utils/env";

export function watchdogsProvider<TProps extends {}>(Component: React.ComponentType<TProps & WatchdogsProviderInterface>): React.FC<TProps> {
    return (props) => {
        const source_url = `http://${HOSTNAME}:3001/watchdog`;
        const { data: watchdogs, error } = useSWR<WatchdogType[]>(source_url)
        if (error) return <div>Error</div>
        if (!watchdogs) return <div>Loading...</div>
        return <Component
            {...props}
            source_url={source_url}
            watchdogs={watchdogs} />
    }
}

export function watchdogProvider<TProps extends { id: string }>(Component: React.ComponentType<TProps & WatchdogProviderInterface>): React.FC<TProps> {
    return (props) => {
        const source_url = `http://${HOSTNAME}:3001/watchdog/${props.id}`
        const { data, error } = useSWR(source_url)
        if (error) return <div>Error</div>
        if (!data) return <div>Loading...</div>
        return <Component
            {...props as TProps}
            watchdog={data}
            source_url={source_url} />
    }
}

export interface WatchdogCtrlInterface {
    onToogle(): void
    onChange: ChangeEventHandler<HTMLInputElement>
    onSubmit: FormEventHandler<HTMLFormElement>
    onRun(): void
    onStop(): void
    is_saving: boolean
    is_valid: boolean
}

export function WatchDogCtrl<TProps extends WatchdogProviderInterface>(Component: React.ComponentType<TProps & WatchdogCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const { source_url } = props

        const formik = useFormik({
            initialValues: props.watchdog,
            onSubmit: async (values) => {
                await fetch(`http://${HOSTNAME}:3001/watchdog/${values._id}`, {
                    method: 'POST',
                    body: JSON.stringify(values),
                    headers: {
                        'Content-Type': 'application/json'
                    }
                })
                mutate(source_url)
            }
        })
        useEffect(() => {
            formik.setValues(props.watchdog)
        }, [props.watchdog])

        async function handleRun() {
            await fetch(`http://${HOSTNAME}:3001/watchdog/${props.watchdog._id}/run`)
            mutate(source_url)
        }
        async function handleStop() {
            await fetch(`http://${HOSTNAME}:3001/watchdog/${props.watchdog._id}/stop`)
            mutate(source_url)
        }
        async function handleToogle() {
            props.watchdog.is_enabled ? await handleStop() : await handleRun()
        }

        const is_valid = formik.values.threshold > 0 && !!formik.values.figi
        return <Component
            {...props}
            watchdog={formik.values}
            is_saving={formik.isSubmitting}
            is_valid={is_valid}
            onToogle={handleToogle}
            onRun={handleRun}
            onStop={handleStop}
            onChange={formik.handleChange}
            onSubmit={formik.handleSubmit} />
    }
}