import { ChangeEventHandler, FormEventHandler, useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { WatchdogProviderInterface, WatchdogsProviderInterface, WatchdogType } from "../../types/WatchdogType";
import { applyChangeToData, getValueFromInput } from "../../utils/defaultTypePath";
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
        const [is_saving, setSaving] = useState(false)
        const [watchdog, setWatchdog] = useState(props.watchdog)
        useEffect(() => setWatchdog(props.watchdog), [props.watchdog])

        async function handleRun() {
            await fetch(`http://${HOSTNAME}:3001/watchdog/${watchdog._id}/run`)
            mutate(source_url)
        }
        async function handleStop() {
            await fetch(`http://${HOSTNAME}:3001/watchdog/${watchdog._id}/stop`)
            mutate(source_url)
        }
        async function handleToogle() {
            watchdog.is_enabled ? await handleStop() : await handleRun()
        }
        const handleChange: ChangeEventHandler<HTMLInputElement> = ({ target }) => {
            const { name } = target
            const value = getValueFromInput(target)
            setWatchdog(applyChangeToData(watchdog, name, value))
        }
        const handleSubmit: FormEventHandler<HTMLFormElement> = async (event) => {
            event.preventDefault()
            setSaving(true)
            await fetch(`http://${HOSTNAME}:3001/watchdog/${watchdog._id}`, {
                method: 'POST',
                body: JSON.stringify(watchdog),
                headers: {
                    'Content-Type': 'application/json'
                }
            })
            mutate(source_url)
            setSaving(false)
        }

        const is_valid = watchdog.threshold > 0 && !!watchdog.figi
        return <Component
            {...props}
            watchdog={watchdog}
            is_saving={is_saving}
            is_valid={is_valid}
            onToogle={handleToogle}
            onRun={handleRun}
            onStop={handleStop}
            onChange={handleChange}
            onSubmit={handleSubmit} />
    }
}