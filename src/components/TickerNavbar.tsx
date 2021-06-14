import Link from "next/link";
import React from "react";
import { Nav, Navbar } from "react-bootstrap";
import { MarketInstrumentField } from "./Candle";

interface TickerNavbarProps {
    figi: string
    activeKey: "dagger" | "robots" | "ticker" | "operations"
}

export function TickerNavbar(props: TickerNavbarProps) {
    return <Navbar bg="secondary" variant="dark" sticky="top" style={{marginTop: "-20px"}}>
        <Navbar.Brand style={{width: "132px"}}>
            <b><MarketInstrumentField figi={props.figi} fieldName="ticker" /></b>
        </Navbar.Brand>
        <Nav activeKey={props.activeKey}>
            <Link href={`/dagger-catcher/${props.figi}`} passHref>
                <Nav.Link eventKey="dagger">Catcher</Nav.Link>
            </Link>
            <Link href={{ pathname: `/robot`, query: { figi: props.figi } }} passHref>
                <Nav.Link eventKey="robots">Robots</Nav.Link>
            </Link>
            <Link href={{ pathname: `/ticker/${props.figi}` }} passHref>
                <Nav.Link eventKey="ticker">Ticker</Nav.Link>
            </Link>
            <Link href={{ pathname: `/operations`, query: { figi: props.figi } }} passHref>
                <Nav.Link eventKey="operations">Operations</Nav.Link>
            </Link>
        </Nav>
    </Navbar>
}