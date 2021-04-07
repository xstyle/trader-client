import Head from "next/head"
import Link from "next/link"
import React from "react"
import { Button, Card, Container, Table } from "react-bootstrap"
import Header from "../../components/Header"
import { listsProvider } from "../../components/List/ListProvider"
import { ListsProviderInterface } from "../../types/ListType"
import { defaultGetServerSideProps } from "../../utils"

export const getServerSideProps = defaultGetServerSideProps

function Page() {
    return <>
        <Head>
            <title>Lists</title>
        </Head>
        <Header />
        <Body />
    </>
}

const Lists = listsProvider(ListsView)

function Body() {
    return <Container fluid>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h1>Lists</h1>
            <Link href="/list/new" passHref>
                <Button variant="primary">Create</Button>
            </Link>
        </div>
        <Lists />
    </Container>
}

function ListsView({ lists }: ListsProviderInterface) {
    return <Card>
        <Table hover responsive size="sm">
            <thead className="thead-sticky">
                <tr>
                    <th>Name</th>
                    <th>Tickers amount</th>
                    <th></th>
                </tr>
            </thead>
            <tbody>
                {
                    lists.map(list =>
                        <tr key={list._id}>
                            <th>
                                <Link href={`/list/${list._id}`}>
                                    <a>
                                        {list.name}
                                    </a>
                                </Link>
                            </th>
                            <td>{list.figis.length}</td>
                            <td>
                                <Link href={`/list/${list._id}/edit`}>
                                    <Button
                                        variant="dark"
                                        size="sm">edit</Button>
                                </Link>
                            </td>
                        </tr>
                    )
                }
            </tbody>
        </Table>
    </Card>
}

export default Page