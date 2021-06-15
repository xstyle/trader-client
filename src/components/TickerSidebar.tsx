import Link from "next/link";
import React, { CSSProperties } from "react";
import { Col, Nav, Navbar } from "react-bootstrap";
import { MarketInstrumentField } from "./Candle";
import { MarketInstrumentPrice } from "./Price";

const style: CSSProperties = { marginTop: "-20px", height: "calc(100vh - 95px)" };

interface TickerSidebarViewProps {
    id?: string
    tickers: { figi: string, _id: string }[]
    href(figi: string): string
}

export function TickerSidebarView({ id, tickers, href }: TickerSidebarViewProps) {
    return <Navbar
        variant="dark"
        bg="secondary"
        style={style}
        className="align-items-start mb-0"
        lg={1}
        as={Col}>
        <Nav
            className="flex-column"
            style={{ width: "100%", position: "sticky", top: "50px" }}>
            {
                tickers.map(ticker =>
                    <Link
                        key={ticker._id}
                        href={href(ticker.figi)}
                        passHref>
                        <Nav.Link
                            active={ticker.figi === id}
                            className="d-flex justify-content-between">
                            <b>
                                <MarketInstrumentField
                                    figi={ticker.figi}
                                    fieldName="ticker" />
                            </b>
                            <div>
                                <MarketInstrumentPrice figi={ticker.figi} currency color className="small" />
                            </div>
                        </Nav.Link>
                    </Link>
                )
            }
        </Nav>
    </Navbar>
}