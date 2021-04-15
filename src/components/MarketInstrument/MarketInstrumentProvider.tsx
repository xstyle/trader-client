import { MarketInstrument } from "@tinkoff/invest-openapi-js-sdk/build/domain.d"
import useSWR from "swr"

import { HOSTNAME } from "../../utils/env"

export interface MarketInstrumentProviderInterface {
    marketInstrument: MarketInstrument
}

export const marketInstrumentProvider = <TProps extends { figi: string }>(Component: React.ComponentType<TProps & MarketInstrumentProviderInterface>): React.FC<TProps> => {
    return (props) => {
        const source_url = `http://${HOSTNAME}:3001/ticker/${props.figi}`
        const { data, error } = useSWR<MarketInstrument>(source_url)
        if (error) return <div>Error</div>
        if (!data) return <div>Loading...</div>

        return <Component
            {...props}
            marketInstrument={data} />
    }
}
