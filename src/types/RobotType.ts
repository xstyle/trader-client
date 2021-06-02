export interface RobotSourceUrlProviderInterface {
    id: string;
}

export type NewRobotType = {
    figi: string
    name: string
    buy_price: number
    sell_price: number
    min_shares_number: number
    max_shares_number: number
    initial_min_shares_number: number
    initial_max_shares_number: number
    budget: number
    strategy: string
}

export type RobotType = NewRobotType & {
    _id: string
    ticker: string
    shares_number: number
    tags: string[]
    price_for_placing_buy_order: number
    price_for_placing_sell_order: number
    is_enabled: boolean
    stop_after_sell: boolean
    start_shares_number: number
    is_removed: boolean
    lot: number
    is_locked: boolean
}

export interface RobotsSourceUrlProviderInterface {
    tag?: string | string[]
    figi?: string | string[]
}

export interface RobotsProviderInterface {
    robots: RobotType[]
    source_url: string
}

export interface RobotProviderInterface {
    robot: RobotType
    source_url: string
}