export type Depth = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;
export type OrderbookStreaming = {
    figi: string;
    depth: Depth;
    bids: Array<[number, number]>;
    asks: Array<[number, number]>;
};