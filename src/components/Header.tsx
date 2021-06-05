import Link from 'next/link'
import { useRouter } from 'next/router'
import { Badge, Nav, Navbar } from 'react-bootstrap'
import { VERSION } from '../utils/env'
import { PortfolioAmount } from "./Portfolio"

type Page = {
    pathname: string, name: string
}

const pages: Page[] = [
    {
        pathname: "/dagger-catcher",
        name: "Dagger Catchers"
    },
    {
        pathname: "/robot",
        name: "Robots"
    },
    {
        pathname: "/list",
        name: "Lists"
    },
    {
        pathname: "/orders",
        name: "Active orders"
    },
    {
        pathname: "/operations",
        name: "Operations"
    },
    {
        pathname: "/watchdog",
        name: "Watchdogs"
    },
    {
        pathname: "/stocks",
        name: "Stocks"
    },
    {
        pathname: "/history",
        name: "Histories"
    }
]

export default function Header() {
    const { pathname } = useRouter()

    return <Navbar bg="primary" variant="dark" expand="lg" >
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Link
            href="/"
            passHref>
            <Navbar.Brand>Robots <Badge variant="success">{VERSION}</Badge></Navbar.Brand>
        </Link>
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
                {
                    pages.map(page => (
                        <Link
                            key={page.pathname}
                            href={page.pathname}
                            passHref>
                            <Nav.Link active={pathname === page.pathname}>{page.name}</Nav.Link>
                        </Link>
                    ))
                }
            </Nav>
        </Navbar.Collapse>
        <Nav>
            <Link
                href="/portfolio"
                passHref>
                <Nav.Link active={pathname === "/portfolio"}>
                    <PortfolioAmount />
                </Nav.Link>
            </Link>
        </Nav>
    </Navbar>
}

export function PageWithHeader<P extends {}>(props: React.PropsWithChildren<P>) {
    return <>
        <Header />
        {props.children}
    </>
}