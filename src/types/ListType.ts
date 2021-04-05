export type NewListType = {
    name: string,
}

export type ListType = NewListType & {
    _id: string,
    figis: string[]
}

export interface ListSourceUrlProviderInterface {
    id: string
}

export interface ListProviderInterface {
    list: ListType
    source_url: string
}

export interface ListsProviderInterface {
    lists: ListType[],
    source_url: string
}