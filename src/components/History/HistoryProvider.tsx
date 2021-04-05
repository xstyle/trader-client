import useSWR from "swr";
import { HistoryProviderInterface, HistoryType } from "../../types/HistoryType";
import { HOSTNAME } from "../../utils/env";

export function historyProvider<TProps extends {}>(Component: React.ComponentType<TProps & HistoryProviderInterface>): React.FC<TProps & { id: string }> {
    return (props) => {
        const source_url = `http://${HOSTNAME}:3001/history/${props.id}`;
        const { data: history, error } = useSWR<HistoryType>(source_url)
        if (error) return <div>Error</div>
        if (!history) return <div>Loading...</div>
        return <Component
            {...props}
            history={history}
            source_url={source_url} />
    }
}

export interface HistoriesProviderInterface {
    histories: HistoryType[]
    source_url: string
}

export function historiesProvider<TProps extends {}>(Component: React.ComponentType<TProps & HistoriesProviderInterface>): React.FC<TProps> {
    return function (props) {
        const source_url = `http://${HOSTNAME}:3001/history`
        const { data: histories, error } = useSWR(source_url)
        if (error) return <div>Error</div>
        if (!histories) return <div>Loading...</div>
        return <Component
            {...props}
            histories={histories}
            source_url={source_url} />
    }
}