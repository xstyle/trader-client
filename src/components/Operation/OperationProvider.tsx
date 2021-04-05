import { constants } from "buffer"
import { useEffect, useState } from "react"
import useSWR from "swr"
import { OperationsProviderInterface, OperationsSourceUrlProviderInterface, Operation } from "../../types/OperationType"
import { HOSTNAME } from "../../utils/env"


export function operationsSourceUrlProvider({ figi, start_date, end_date, status }: OperationsSourceUrlProviderInterface) {
    const url = new URL('/operation', `http://${HOSTNAME}:3001`)

    figi && url.searchParams.set('figi', figi)
    start_date && url.searchParams.set('start_date', start_date)
    end_date && url.searchParams.set('end_date', end_date)
    if (status) {
        status.forEach(status => url.searchParams.append('status', status))
    }
    return url.href
}

export function operationsProvider<TProps extends OperationsSourceUrlProviderInterface>(Component: React.ComponentType<TProps & OperationsProviderInterface>): React.FC<TProps> {
    return (props) => {
        const [cache, setCache] = useState<Operation[]>([]);
        const source_url = operationsSourceUrlProvider(props);
        const { data: operations, error } = useSWR<Operation[]>(source_url, {
            initialData: cache,
            revalidateOnMount: true
        });
        useEffect(() => operations && setCache(operations), [operations]);

        if (error) return <div>Error</div>;
        if (!operations) return <div>Loding...</div>;
        const filtered_operations = operations
            .filter((operation) => props.status ? props.status.indexOf(operation.status) > -1 : true)
            .filter((operation) => props.types ? props.types.indexOf(operation.operationType) > -1 : true)
        return <Component
            {...props}
            source_url={source_url}
            operations={filtered_operations} />;
    };
}
