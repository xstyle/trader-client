import Head from "next/head";
import Link from "next/link";
import React from "react";
import { Button, Card, Container, Table } from "react-bootstrap";
import Header from "../../components/Header";
import { LinkToTickerPage } from "../../components/Links";
import { TickerPrice } from "../../components/Price";
import { TickerInfo } from "../../components/Ticker";
import { WatchDogCtrl, WatchdogCtrlInterface, watchdogsProvider } from "../../components/WatchDog/WatchDogProvider";
import { WatchdogProviderInterface, WatchdogsProviderInterface } from "../../types/WatchdogType";

export default function Page() {
    return <>
        <Head>
            <title>WatchDogs</title>
        </Head>
        <Header />
        <Body />
    </>
}

function Body() {
    return <Container fluid>
        <div className="d-flex flex-row justify-content-between align-items-center">
            <h1>WatchDogs</h1>
            <Link href='/watchdog/new'>
                <Button variant="primary">Create</Button>
            </Link>
        </div>
        <ContentLoader />
    </Container>
}

const ContentLoader = watchdogsProvider(WatchdogsView)

function WatchdogsView({ watchdogs, source_url }: WatchdogsProviderInterface) {
    return <Card>
        <Table hover className="card-table" responsive size="sm">
            <thead>
                <tr>
                    <th>State</th>
                    <th>Name</th>
                    <th>Ticker</th>
                    <th className="text-right">Price</th>
                    <th>Treshold</th>
                </tr>
            </thead>
            <tbody>
                {
                    watchdogs.map(watchdog =>
                        <WatchDog
                            key={watchdog._id}
                            watchdog={watchdog}
                            source_url={source_url} />
                    )
                }
            </tbody>
        </Table>
    </Card>
}

const WatchDog = WatchDogCtrl(WatchdogView)

function WatchdogView({ watchdog, onToogle }: WatchdogCtrlInterface & WatchdogProviderInterface) {
    return <tr>
        <th>
            <Button
                variant={watchdog.is_enabled ? "success" : "danger"}
                size="sm"
                onClick={onToogle}>{watchdog.is_enabled ? 'On' : 'Off'}</Button></th>
        <th>
            <Link href={`/watchdog/${watchdog._id}`}>
                <a>
                    <TickerInfo
                        figi={watchdog.figi}
                        fieldName="name" />
                </a>
            </Link>
        </th>
        <td>
            <LinkToTickerPage figi={watchdog.figi}>
                <a>
                    <TickerInfo
                        figi={watchdog.figi}
                        fieldName="ticker" />
                </a>
            </LinkToTickerPage>
        </td>
        <td className="text-right text-nowrap">
            <TickerPrice figi={watchdog.figi} />
        </td>
        <td>{watchdog.threshold}</td>
    </tr>
}