import { Candle, CandleResolution } from '@tinkoff/invest-openapi-js-sdk/build/domain.d'
import { socket } from './io'

export function subscribeToCandle({ figi, interval = '1min' }: Subscriber, cb: (x: Candle, y?: Candle) => void): () => void {
    const event_name = `candle:${figi}:${interval}`
    const has_listeners = socket.hasListeners(event_name)
    const cb_wrapper = (x: Candle) => {
        const old_data = setOldData(event_name, x)
        cb(x, old_data)
    }
    socket.on(event_name, cb_wrapper)
    if (!has_listeners) socket.emit('candle:subscribe', { figi, interval })
    return () => {
        socket.off(event_name, cb_wrapper)
        const has_listeners = socket.hasListeners(event_name)
        if (!has_listeners) socket.emit('candle:unsubscribe', { figi, interval })
    }
}

const old_data: {
    [id: string]: Candle
} = {}

function setOldData(name: string, x: Candle): Candle | undefined {
    const tmp = old_data[name]
    old_data[name] = x
    return tmp
}
interface Subscriber {
    figi: string,
    interval?: CandleResolution
}