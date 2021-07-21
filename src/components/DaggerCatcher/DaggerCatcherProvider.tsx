import { ComponentType, FC } from "react"
import useSWR from "swr"
import { DaggerCatcherProviderInterface, DaggerCatcherProviderParams, DaggerCatcherSourceUrlProviderInterface, DaggerCatchersProviderInterface, DaggerCatcherType } from "../../types/DaggerCatcherType"
import { HOSTNAME } from "../../utils/env"

export function daggerCatcherProvider<TProps extends DaggerCatcherSourceUrlProviderInterface>(Component: React.ComponentType<TProps & DaggerCatcherProviderInterface>): React.FC<TProps> {
    return (props) => {
        const source_url = daggerCatcherSourceUrlProvider({ id: props.id })
        const { data: daggerCatcher, error } = useSWR<DaggerCatcherType>(source_url)

        if (error) return <div>Error</div>
        if (!daggerCatcher) return <div>Loading...</div>

        return <Component
            {...props}
            daggerCatcher={daggerCatcher}
            source_url={source_url} />
    }
}

export function daggerCatcherSourceUrlProvider({ id }: DaggerCatcherSourceUrlProviderInterface) {
    return `http://${HOSTNAME}:3001/dagger-catcher/${id}`
}

export function daggerCatchersProvider<TProps extends {}>(Component: ComponentType<TProps & DaggerCatchersProviderInterface>): FC<TProps & DaggerCatcherProviderParams> {
    return (props) => {
        const url = new URL('/dagger-catcher', `http://${HOSTNAME}:3001`)
        if (typeof props.isHidden === "boolean") url.searchParams.set("is_hidden", props.isHidden.toString())

        const source_url = url.href
        const { data, error } = useSWR<DaggerCatcherType[]>(source_url)
        if (error) return <div>Error</div>
        if (!data) return <div>Loading...</div>
        return <Component
            {...props}
            daggerCatchers={data}
            source_url={source_url} />
    }
}