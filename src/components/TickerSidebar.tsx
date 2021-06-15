import Link from "next/link";
import React, { CSSProperties } from "react";
import { Col, Nav, Navbar } from "react-bootstrap";
import { MarketInstrumentField } from "./Candle";
import { MarketInstrumentPrice } from "./Price";

const style: CSSProperties = { width: "180px", marginTop: "-20px" , height: "calc(100vh - 95px)"};

export function TickerSidebarView({ id, tickers, href }: { id?: string, tickers: { figi: string, _id: string }[], href(figi: string): string }) {
    return <Navbar variant="dark" bg="secondary" style={style} className="align-items-start pl-2 pr-2 mb-0" as={Col}>
        <Nav
            className="flex-column" style={{ width: "100%", position: "sticky", top: "50px" }}>
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