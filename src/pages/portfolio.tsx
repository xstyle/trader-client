import Head from "next/head"
import React from "react"
import { Container } from "react-bootstrap"
import Header from "../components/Header"
import { Portfolio } from "../components/Portfolio"
import { defaultGetServerSideProps } from "../utils"

export const getServerSideProps = defaultGetServerSideProps

export default function Page() {
    return <>
        <Head>
            <title>My Portfolio</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    return <Container fluid>
        <h1>Portfolio</h1>
        <Portfolio />
    </Container>
}