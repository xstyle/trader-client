import { TickerData } from '../types/TickerType'
import { socket } from './io'

export type Interval = "1min" | "1day"
interface Subscriber {
    figi: string,
    interval: Interval
}
type RootSubscriberCallback = (data: TickerData) => void
type SubscriberCallback = (data: TickerData, last_data?: TickerData) => void

interface Subscribtion extends Subscriber {
    cb: SubscriberCallback
}

class SubscribeService {
    constructor() {
        socket.on("connect", () => {
            this.attempt_amount++
            console.log(`I connected ${this.attempt_amount}`)
            if (this.attempt_amount > 1) this.resubscribe()
        })
    }

    connected = false
    attempt_amount = 0
    subscribers: { [id: string]: { [id in Interval]?: SubscriberCallback[] } } = {}
    socket_subscriber: { [id: string]: { [id in Interval]?: RootSubscriberCallback } } = {}
    old_values: { [id: string]: { [id in Interval]?: TickerData } } = {}

    resubscribe() {
        this.getAllRootSubscribers()
            .forEach(({ figi, interval }) => {
                console.log(`Resubscribe ${figi} ${interval} after reconnect`)
                socket.emit('subscribe', { figi, interval })
            })
    }

    subscribe({ figi, interval = '1min' }: { figi: string, interval?: Interval }, cb: SubscriberCallback) {
        //console.log(`Subscribe to ${figi} ${interval}`)
        this.addSubscriber({ figi, interval, cb })

        const is_first = this.getSubscribers({ figi, interval }).length === 1

        if (is_first) {
            socket.emit('subscribe', { figi, interval })
            socket.on(`TICKER:${figi}:${interval}`, this.broadcast({ figi, interval }))
        } else {
            const old_value = this.getOldValue({ figi, interval })
            if (typeof old_value !== 'undefined') {
                cb(old_value)
            }
        }

        return () => {
            //console.log(`Unsubscribe from ${figi} ${interval}`)
            const subscribers = this.getSubscribers({ figi, interval })
            const index = subscribers.indexOf(cb)
            if (index < 0) throw new Error('Subscriber not found')
            subscribers.splice(index, 1)
            const is_last = subscribers.length === 0
            //console.log(is_last, figi, interval, subscribers)
            if (is_last) {
                socket.emit('unsubscribe', { figi, interval })
                socket.off(`TICKER:${figi}:${interval}`, this.broadcast({ figi, interval }))
            }
        }
    }

    // один callback на всех. Вызывающий другие callbacks
    broadcast({ figi, interval }: Subscriber): RootSubscriberCallback {
        if (!this.getRootSubscriber({ figi, interval })) {
            // вот непосредственно как выглядит эта функция перебора callbacks
            this.setRootSubscriber({
                figi,
                interval,
                cb: (data) => {
                    const last_data = this.getOldValue({ figi, interval })
                    this.setOldValue({ figi, interval, data })
                    this.getSubscribers({ figi, interval }).forEach((cb) => cb(data, last_data))
                }
            })
        }
        const rootSubscriberCallback = this.getRootSubscriber({ figi, interval })
        if (!rootSubscriberCallback) throw new Error("Root ubscriber undefined");

        return rootSubscriberCallback
    }

    setOldValue({ figi, interval, data }: { figi: string, interval: Interval, data: TickerData }): void {
        if (!this.old_values[figi]) this.old_values[figi] = { [interval]: data }
        this.old_values[figi][interval] = data
    }

    getOldValue({ figi, interval }: Subscriber): TickerData | undefined {
        if (!this.old_values[figi]) return
        if (!this.old_values[figi][interval]) return
        return this.old_values[figi][interval]
    }

    getSubscribers({ figi, interval }: Subscriber): SubscriberCallback[] {
        if (typeof this.subscribers[figi] === 'undefined') {
            return []
        }

        if (typeof this.subscribers[figi][interval] !== 'undefined') {
            return this.subscribers[figi][interval] as SubscriberCallback[]
        } else {
            return []
        }
    }

    getAllRootSubscribers(): Subscriber[] {
        const rootSubscribers: Subscriber[] = []
        for (const figi of Object.keys(this.subscribers)) {
            for (const interval of Object.keys(this.subscribers[figi]) as Interval[]) {
                rootSubscribers.push({ figi, interval })
            }
        }
        return rootSubscribers
    }

    addSubscriber({ figi, interval, cb }: Subscribtion): void {
        if (!this.subscribers[figi]) this.subscribers[figi] = {}
        if (!this.subscribers[figi][interval]) this.subscribers[figi][interval] = []
        this.subscribers[figi][interval]?.push(cb)
    }

    setRootSubscriber({ figi, interval, cb }: { figi: string, interval: Interval, cb: RootSubscriberCallback }): void {
        if (!this.socket_subscriber[figi]) this.socket_subscriber[figi] = { [interval]: cb }
        else this.socket_subscriber[figi][interval] = cb
    }

    getRootSubscriber({ figi, interval }: Subscriber): RootSubscriberCallback | undefined {
        if (!this.socket_subscriber[figi]) return
        if (!this.socket_subscriber[figi][interval]) return
        return this.socket_subscriber[figi][interval]
    }
}
const subscribeService = new SubscribeService()
export default subscribeService