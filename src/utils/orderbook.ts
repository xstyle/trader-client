import { Depth, OrderbookStreaming } from "../types/OrderbookType"

import { socket } from "./io"

export function subscribeToOrderBook({ figi, depth = 3 }: { figi: string, depth?: Depth }, cb: (x: OrderbookStreaming) => void): ()=> void {
    const event_name = `orderbook:${figi}:${depth}`
    const has_listeners = socket.hasListeners(event_name)
    socket.on(event_name, cb)
    if (!has_listeners) socket.emit(`orderbook:subscribe`, { figi, depth })
    return () => {
        socket.off(event_name, cb)
        const has_listeners = socket.hasListeners(event_name)
        if (!has_listeners) socket.emit(`orderbook:unsubscribe`, { figi, depth })
    }
}