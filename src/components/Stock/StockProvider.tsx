import useSWR from "swr"
import { StockType, StocksProviderInterface, StocksSourceUrlProvider } from "../../types/StockType"
import { HOSTNAME } from "../../utils/env"

export function stocksProdiver<TProps extends StocksSourceUrlProvider>(Component: React.ComponentType<TProps & StocksProviderInterface>): React.FC<TProps> {
    return (props) => {
        const { search } = props
        const source_url = `http://${HOSTNAME}:3001/ticker`
        const { data, error } = useSWR<StockType[]>(source_url)
        if (error) return <div>Error</div>
        if (!data) return <div>Loading...</div>
        let instruments = data

        if (search) {
            const searchRegexp = new RegExp(search, 'i')
            instruments = instruments.filter((instrument) =>
                `${instrument.ticker} ${instrument.name}`.search(searchRegexp) > -1
            )
        }
        return <Component
            {...props}
            instruments={instruments}
            source_url={source_url}
        />
    }
}