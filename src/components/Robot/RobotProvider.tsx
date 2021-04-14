import useSWR from "swr";
import { HOSTNAME } from "../../utils/env";
import { RobotProviderInterface, RobotSourceUrlProviderInterface, RobotsProviderInterface, RobotsSourceUrlProviderInterface, RobotType } from "../../types/RobotType";

export function robotProvider<TProps extends RobotSourceUrlProviderInterface>(Component: React.ComponentType<TProps & RobotProviderInterface>): React.FC<TProps> {
    return function (props) {
        const source_url = `http://${HOSTNAME}:3001/robot/${props.id}`;
        const { data: instrument, error } = useSWR<RobotType>(source_url);
        if (error)
            return <div>Error</div>;
        if (!instrument)
            return <div>Loading...</div>;
        return <Component
            {...props}
            robot={instrument}
            source_url={source_url} />;
    };
}

export function robotsProvider<TProps extends RobotsSourceUrlProviderInterface>(Component: React.ComponentType<TProps & RobotsProviderInterface>): React.FC<TProps> {
    return (props) => {
        const source_url = RobotsSourceUrlProvider(props)
        const { data: instruments, error } = useSWR(source_url, {
            refreshInterval: 5000
        });

        if (error) return <div>Failed to load</div>
        if (!instruments) return <div>Loading...</div>
        return <Component
            {...props}
            robots={instruments}
            source_url={source_url} />
    }
}

export function RobotsSourceUrlProvider(params: RobotsSourceUrlProviderInterface): string {
    const { tag, figi } = params
    const url = new URL('/robot', `http://${HOSTNAME}:3001`)

    tag && (Array.isArray(tag) ? tag : [tag]).map(_tag => url.searchParams.append('tag', _tag))
    figi && (Array.isArray(figi) ? figi : [figi]).map(_figi => url.searchParams.append('figi', _figi))

    return url.href
}