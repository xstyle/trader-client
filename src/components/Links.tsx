import Link from "next/link";
import { useMarketInstrument } from "./Candle";

export function LinkToTickerPage(props: { figi: string, children: React.ReactChild }) {
    return <Link href={`/ticker/${props.figi}`}>
        {props.children}
    </Link>
}

export function TinLink({ figi }: { figi: string }): JSX.Element {
    const { data, error } = useMarketInstrument(figi)
    if (error) return <>"Error"</>
    if (!data) return <>"Loading..."</>
    return <a
        href={`https://www.tinkoff.ru/invest/stocks/${data.ticker}`}
        target="_blank"
        rel="noreferrer" >
        App <i className="fa fa-external-link-alt"/>
    </a>
}

export function InstrumentsLink(props: { figi?: string, children: React.ReactNode }) {
    return <Link
        href={{
            pathname: '/robot',
            query: {
                figi: props.figi
            }
        }}
        passHref>
        {props.children}
    </Link>
}

export function OrdersLink({ children = null }: { children: React.ReactNode }) {
    return <Link href={{
        pathname: '/orders'
    }}>
        {children}
    </Link>
}

// export function DaggerCatcherLink({figi, children = null}: { children: React.ReactNode }) {
//     const const { error, data: tickerInfo } = useTickerInfo(figi)
//     if (error) return children
//     if (!data) return children
//     return <Link href={`/dagger-catcher/${data._id}`}>
//         {children}
//     </Link>
// }