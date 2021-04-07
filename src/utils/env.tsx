import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig()

export const HOSTNAME = publicRuntimeConfig.HOSTNAME