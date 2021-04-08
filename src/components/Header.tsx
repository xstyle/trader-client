import Link from 'next/link'
import { useRouter } from 'next/router'
import { useEffect, useState } from 'react'
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
        pathname: "/portfolio",
        name: "Portfolio"
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
    const router = useRouter()
    const { pathname } = router
    const [state, setState] = useState<string>()
    useEffect(() => {
        if (state) {
            if (state != pathname) {
                const timeoutid = setTimeout(go(state), 300)
                return () => {
                    clearTimeout(timeoutid)
                }
            }
        }
    })
    function handleMouseEnter(page: Page) {
        setState(page.pathname)
    }
    const handleMouseLeave = (page: Page) => () => {
        setState(pathname)
    }
    const go = (pathname: string) => () => {
        console.log('go triggered', pathname)
        router.push(pathname)
    }

    return <Navbar bg="primary" variant="dark" expand="lg" >
        <Navbar.Toggle aria-controls="responsive-navbar-nav" />
        <Link href="/" passHref>
            <Navbar.Brand>Robots <Badge variant="success">{VERSION}</Badge></Navbar.Brand>
        </Link>        
        <Navbar.Collapse id="responsive-navbar-nav">
            <Nav className="mr-auto">
                {
                    pages.map(page => (
                        <Link href={page.pathname} passHref key={page.pathname}>
                            <Nav.Link
                                active={pathname === page.pathname}
                                onMouseEnter={() => handleMouseEnter(page)}
                                onMouseLeave={handleMouseLeave(page)}>{page.name}</Nav.Link>
                        </Link>
                    ))
                }
            </Nav>
        </Navbar.Collapse>
        <Navbar.Text><PortfolioAmount /></Navbar.Text>
    </Navbar>
}

export function PageWithHeader<P extends {}>(props: React.PropsWithChildren<P>) {
    return <>
        <Header />
        {props.children}
    </>
}