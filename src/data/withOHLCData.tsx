import { tsvParse } from "d3-dsv";
import { timeParse } from "d3-time-format";
import * as React from "react";
import { IOHLCData } from "./iOHLCData";

import { HOSTNAME } from "../utils/env"
import  subscribeService, { Interval } from "../utils/subscribe.service"
import moment from "moment";

const parseDate = timeParse("%Y-%m-%d");

interface WithOHLCDataProps {
    readonly data: IOHLCData[];
    readonly figi: string;
    readonly interval?: Interval;
}

interface WithOHLCState {
    data?: IOHLCData[];
    message: string;
}

export function withOHLCData(dataSet = "DAILY") {
    return <TProps extends WithOHLCDataProps>(OriginalComponent: React.ComponentClass<TProps>) => {
        return class WithOHLCData extends React.Component<Omit<TProps, "data">, WithOHLCState> {
            public constructor(props: Omit<TProps, "data">) {
                super(props);
                this.state = {
                    message: `Loading ${dataSet} data...`,
                };
            }
            public subscribtion?: ()=> void
            subscribe() {
                this.subscribtion = subscribeService.subscribe(this.props, (obj: { time: string, o: number, h: number, l: number, c: number, v: number }) => {
                    const updated_item = driver(obj)
                    updated_item.date = moment(updated_item.date).toDate()

                    if (typeof this.state.data === "object") {
                        const data = [...this.state.data];
                        //console.log(data[data.length - 1], updated_item)
                        const index = data.findIndex(item => item.date.toISOString() === updated_item.date.toISOString())

                        if (index >= 0) data[index] = updated_item
                        else data?.push(updated_item)

                        this.setState({ data })
                    }
                    console.log(this.props.figi)

                })
            }
            unsubscribe() {
                if (this.subscribtion) {
                    this.subscribtion()
                }
            }
            loadDataAndSubscribe() {
                const url = new URL(`/ticker/${this.props.figi}/candles`, `http://${HOSTNAME}:3001`)

                if (typeof this.props.interval !== "undefined") {
                    url.searchParams.set('interval', this.props.interval as string)
                }

                const source_url = url.href

                fetch(source_url)
                    .then(response => response.json())
                    .then((data) => {
                        this.unsubscribe()
                        this.setState({
                            data: data.candles.map(driver),
                        });
                        this.subscribe()
                    })
                    .catch(() => {
                        this.setState({
                            message: `Failed to fetch data.`,
                        });
                    });
            }

            public componentDidMount() {
                this.loadDataAndSubscribe()
            }

            public componentWillUnmount() {
                this.unsubscribe()
            }

            componentDidUpdate(prevProps: { figi: string }) {
                if (this.props.figi !== prevProps.figi) {
                    return this.loadDataAndSubscribe();
                }
            }

            public render() {
                const { data, message } = this.state;
                if (data === undefined) {
                    return <div className="center">{message}</div>;
                }

                return <OriginalComponent {...(this.props as TProps)} data={data} />;
            }
        };
    };
}

function driver(item: { time: string, o: number, h: number, l: number, c: number, v: number }) {
    return {
        date: new Date(item.time),
        open: item.o,
        high: item.h,
        low: item.l,
        close: item.c,
        volume: item.v
    }
}

