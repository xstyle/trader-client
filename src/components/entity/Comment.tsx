import useSWR from "swr"
import { HOSTNAME } from "../../utils/env"

type InstrumentComment = {
    "type": "share",
    "ticker": string,
    "lastPrice": number,
    "currency": "usd",
    "image": string,
    "briefName": string,
    "dailyYield": null,
    "relativeDailyYield": number,
    "price": number,
    "relativeYield": number
}

export type Comment = {
    "id": string,
    "text": string,
    "likesCount": number,
    "commentsCount": number,
    "isLiked": boolean,
    "inserted": string,
    "isEditable": boolean,
    "instruments": InstrumentComment[],
    "profiles": [],
    "serviceTags": [],
    "profileId": string,
    "nickname": string,
    "image": null,
    "postImages": [],
    "hashtags": [],
    "owner": {
        "id": string,
        "nickname": string,
        "image": null,
        "donationActive": boolean,
        "block": boolean,
        "serviceTags": string[]
    },
    "reactions": {
        "totalCount": number,
        "myReaction": null,
        "counters": any[]
    },
    "content": {
        "type": "simple",
        "text": string,
        "instruments": InstrumentComment[],
        "hashtags": string[],
        "profiles": string[],
        "images": string[],
        "strategies": string[]
    },
    "baseTariffCategory": "unauthorized",
    "isBookmarked": boolean,
    "status": "published"
}

export interface CommentsProviderParams {
    ticker: string
}

export function useComments(params: CommentsProviderParams) {
    const url = new URL('/comment', `http://${HOSTNAME}:3001`)
    url.searchParams.set('ticker', params.ticker)
    return useSWR<Comment[]>(url.href)
}