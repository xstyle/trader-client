import '@fortawesome/fontawesome-free/css/all.css'
import Head from 'next/head'
import App, { AppContext } from 'next/app'
import '../styles/bootstrap.css'
import '../styles/style.css'


function MyApp<TProps extends {}>({ Component, pageProps }: { Component: React.ComponentType<TProps>, pageProps: TProps }) {
    return <>
        <Head>
            < meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0,user-scalable=0" />
        </Head>
        <Component {...pageProps} />
    </>
}

export default MyApp