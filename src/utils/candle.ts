import { Candle, CandleResolution } from '@tinkoff/invest-openapi-js-sdk/build/domain.d'
import { socket } from './io'

export function subscribeToCandle({ figi, interval = '1min' }: Subscriber, cb: (x: Candle, y?: Candle) => void): () => void {
    const event_name = `candle:${figi}:${interval}`
    const old_candle = getOldCandle(event_name)
    if (old_candle) cb(old_candle[0], old_candle[1])

    const has_listeners = socket.hasListeners(event_name)
    const cb_wrapper = (x: Candle) => {
        const old_candle = setOldCandle(event_name, x)
        cb(x, old_candle?.[1])
    }
    socket.on(event_name, cb_wrapper)
    if (!has_listeners) socket.emit('candle:subscribe', { figi, interval })

    return () => {
        socket.off(event_name, cb_wrapper)
        const has_listeners = socket.hasListeners(event_name)
        if (!has_listeners) socket.emit('candle:unsubscribe', { figi, interval })
    }
}

const old_candles_index: {
    [id: string]: [Candle, Candle]
} = {}

function setOldCandle(name: string, x: Candle): [Candle, Candle] | undefined {
    const tmp = old_candles_index[name]
    return old_candles_index[name] = [x, tmp?.[0]]
}

function getOldCandle(name: string): [Candle, Candle] | undefined {
    return old_candles_index[name]
}
interface Subscriber {
    figi: string,
    interval?: CandleResolution
}