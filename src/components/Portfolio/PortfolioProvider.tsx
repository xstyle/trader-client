import useSWR from "swr"
import { PortfolioProviderInterface, Position } from "../../types/PositioinType"
import { HOSTNAME } from "../../utils/env"
import useSuperCandle from "../Candle"

export function portfolioProvider<TProps extends {}>(Component: React.ComponentType<TProps & PortfolioProviderInterface>): React.FC<TProps> {
    return (props) => {
        const source_url = `http://${HOSTNAME}:3001/robot/portfolio`
        const { data, error } = useSWR<Position[]>(source_url, { initialData: [], revalidateOnMount: true })
        const usd_candle = useSuperCandle('BBG0013HGFT4')

        if (error) return <div>Error Portfolio</div>
        if (!data) return <div>Portfolio loading...</div>
        if (typeof usd_candle === "undefined") return <span>USD loading...</span>

        data.sort((a, b) => a.ticker > b.ticker ? 1 : a.ticker < b.ticker ? -1 : 0)

        return <Component
            {...props}
            positions={data}
            usd_candle={usd_candle} />
    }
}