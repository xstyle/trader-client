export type NewWatchdogType = {
    figi: string,
    threshold: number
}

export type WatchdogType = NewWatchdogType & {
    _id: string,
    is_enabled: boolean
}

export interface WatchdogProviderInterface {
    watchdog: WatchdogType;
    source_url: string;
}

export interface WatchdogsProviderInterface {
    watchdogs: WatchdogType[]
    source_url: string
}