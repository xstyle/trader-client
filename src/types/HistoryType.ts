export type NewHistoryType = {
    title: string,
    description: string,
    figi: string,
}

export type HistoryType = NewHistoryType & {
    _id: string,
    type: string,
    created_at: string,
    collection_id: string,
}

export interface HistoryProviderInterface {
    history: HistoryType
    source_url: string
}