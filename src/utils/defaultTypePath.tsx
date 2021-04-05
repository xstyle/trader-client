export function getValueFromInput<T extends HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>(element: T): any {
    let nameField: keyof T = 'value';
    switch (element.type) {
        case 'range':
        case 'number':
            nameField = 'valueAsNumber' as keyof T
            break
        case 'date':
            nameField = 'valueAsDate' as keyof T
            break
        case 'checkbox':
            nameField = 'checked' as keyof T
            break
        default:
    }
    return element[nameField]
}
export function applyChangeToData<T extends string | number, T2 extends {}>(data: T2, path: string, value: T | T[]) {
    const pathArray = path.split('.')
    const new_data = iterator7(data, pathArray, value)
    return new_data
}

function guard<T extends {}>(obj: T, attribute: string | number | symbol): attribute is keyof T {
    return obj.hasOwnProperty(attribute)
}

function iterator7<T extends {} | Array<T2>, T2>(obj: T, [attribute, ...attributes]: string[], value: any): T {
    if (!attribute) return obj;

    if (Array.isArray(obj)) {
        const index = parseInt(attribute)
        if (index >= 0 && obj.length > index) {
            if (!attributes.length) {
                obj[index] = value
            } else {
                iterator7(obj[index], attributes, value)
            }
            obj = [...obj] as T
        } else {
            throw new Error("attribute undefined");
        }
    } else {
        if (guard(obj, attribute)) {
            if (!attributes.length) {
                obj[attribute] = value
            } else {
                iterator7(obj[attribute], attributes, value)
            }
            obj = { ...obj }
        } else {
            throw new Error("attribute undefined");
        }
    }
    return obj
}