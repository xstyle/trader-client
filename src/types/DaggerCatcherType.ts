export type NewDaggerCatcherType = {
    figi: string
    max: number
    min: number
}

export type DaggerCatcherType = NewDaggerCatcherType & {
    _id: string
    is_pinned: boolean
    is_hidden: boolean
}

export interface DaggerCatcherSourceUrlProviderInterface {
    id: string;
}

export interface DaggerCatcherProviderInterface {
    daggerCatcher: DaggerCatcherType
    source_url: string
}

export interface DaggerCatchersProviderInterface {
    daggerCatchers: DaggerCatcherType[]
    source_url: string
}

export interface DaggerCatcherProviderParams {
    isHidden?: boolean
}