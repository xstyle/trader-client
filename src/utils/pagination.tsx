import { ComponentType, FC, useState } from "react"

export interface PaginatorInterface {
    onNextPage(): void,
    onPrevPage(): void,
    onSelectPage(page_size: number): void,
    onShowAllPage(): void,
    onSelectPageSize(page_size: number): void,
    onSelectFirstPage(): void,
    onSelectLastPage(): void,
    page: number,
    page_size: number,
    pages_number: number,
    offset: number,
    limit: number,
    first_item_on_page_index: number,
    last_item_on_page_index: number,
    next_page_disabled: boolean,
    prev_page_disabled: boolean,
    first_page_disabled: boolean,
    last_page_disabled: boolean,
}

export function PagingationCtrl<TProps extends PaginatorItemsNumber>(Component: ComponentType<TProps & PaginatorInterface>): FC<TProps> {
    return (props) => {
        const { items_number } = props
        const [page, setPage] = useState(0)
        const [page_size, setPageSize] = useState(10)

        const pages_number = Math.ceil(items_number / page_size)
        const offset = page * page_size
        const limit = page_size

        const last_page = pages_number - 1
        const next_page_disabled = page >= last_page
        const prev_page_disabled = page <= 0
        const first_page_disabled = page === 0
        const last_page_disabled = page === last_page
        const first_item_on_page_index = page * page_size
        const last_item_on_page_index = Math.min((page + 1) * page_size - 1, items_number - 1)

        function handleNextPage() {
            setPage(page + 1)
        }

        function handlePrevPage() {
            setPage(page - 1)
        }

        function handleShowAllPage() {
            setPage(0)
            setPageSize(items_number)
        }

        function handleSelectPage(page: number) {
            setPage(page)
        }

        function handleSelectFirstPage() {
            setPage(0)
        }

        function handleSelectLastPage() {
            setPage(last_page)
        }

        function handleSelectPageSize(page_size: number) {
            const page = Math.floor(offset / page_size)
            setPage(page)
            setPageSize(page_size)
        }

        return <Component
            {...props}
            onNextPage={handleNextPage}
            onPrevPage={handlePrevPage}
            onSelectPage={handleSelectPage}
            onShowAllPage={handleShowAllPage}
            onSelectPageSize={handleSelectPageSize}
            onSelectFirstPage={handleSelectFirstPage}
            onSelectLastPage={handleSelectLastPage}
            page={page}
            page_size={page_size}
            pages_number={pages_number}
            offset={offset}
            limit={limit}
            first_item_on_page_index={first_item_on_page_index}
            last_item_on_page_index={last_item_on_page_index}
            next_page_disabled={next_page_disabled}
            prev_page_disabled={prev_page_disabled}
            first_page_disabled={first_page_disabled}
            last_page_disabled={last_page_disabled} />
    }
}

interface PaginatorItemsNumber {
    items_number: number
}

export function Paginator<TProps extends {}>(Component: ComponentType<TProps & PaginatorItemsNumber & PaginatorInterface>, name: Exclude<keyof TProps, keyof PaginatorInterface>): FC<TProps> {
    return PaginationConfig(
        PagingationCtrl(
            IteratorCtrl((props) => {
                return <Component {...props} />
            }, name)
        ),
        name
    )
}

function IteratorCtrl<TProps extends PaginatorInterface & PaginatorItemsNumber>(Component: ComponentType<TProps>, name: keyof TProps): FC<TProps> {
    return (props) => {
        const { offset, limit } = props
        const items: any = props[name]

        if (isArray(items)) {
            const _items = items.slice(offset, offset + limit)
            return <Component
                {...props}
                {...{ [name]: _items }} />
        } else {
            return null
        }
    }
}

function PaginationConfig<TProps extends {}>(Component: ComponentType<TProps & PaginatorItemsNumber>, name: keyof TProps): FC<TProps> {
    return (props) => {
        const items: any = props[name]
        if (isArray(items)) {
            return <Component
                {...props}
                items_number={items.length} />
        } else {
            return null
        }
    }
}

function isArray<T>(array: T | T[]): array is T[] {
    return Array.isArray(array)
}