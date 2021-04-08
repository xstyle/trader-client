import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const HOSTNAME: string = publicRuntimeConfig.HOSTNAME
export const VERSION: string = publicRuntimeConfig.VERSION