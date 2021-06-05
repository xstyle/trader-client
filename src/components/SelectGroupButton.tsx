import React from "react";
import { ButtonGroup, Button } from "react-bootstrap";

interface SelectButtonGroupViewProps<T = any> {
    options: {
        name: string,
        value?: T
    }[]
    onSelect(value?: T): void
    value?: T
}

export function SelectButtonGroupView<T>(props: SelectButtonGroupViewProps<T>) {
    return <ButtonGroup className="mb-3">
        {
            props.options.map((option) => (
                <Button
                    active={option.value === props.value}
                    variant="outline-primary"
                    size="sm"
                    onClick={() => props.onSelect(option.value)}>{option.name}</Button>
            ))
        }
    </ButtonGroup>
}