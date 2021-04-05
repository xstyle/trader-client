import useSWR from "swr"
import { ListProviderInterface, ListSourceUrlProviderInterface, ListsProviderInterface, ListType } from "../../types/ListType"
import { HOSTNAME } from "../../utils/env"

export function listProvider<TProps extends ListSourceUrlProviderInterface>(Component: React.ComponentType<TProps & ListProviderInterface>): React.FC<TProps> {
    return (props) => {
        const url = new URL(`/list/${props.id}`, `http://${HOSTNAME}:3001`)
        const source_url = url.href
        const { data, error } = useSWR(source_url)
        if (error) return <div>Error</div>
        if (!data) return <div>Loading...</div>
        return <Component
            {...props}
            list={data}
            source_url={source_url} />
    }
}

export function listsProvider<TProps extends {}>(Component: React.ComponentType<TProps & ListsProviderInterface>): React.FC<TProps> {
    return (props) => {
        const url = new URL('/list', `http://${HOSTNAME}:3001`)
        const source_url = url.href
        const { data: lists, error } = useSWR<ListType[]>(source_url)
        if (error) return <div>Error</div>
        if (!lists) return <div>Loading...</div>
        return <Component
            {...props as TProps}
            lists={lists}
            source_url={source_url} />
    }
}