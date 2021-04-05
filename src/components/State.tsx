import Link from "next/link";
import { Button } from "react-bootstrap";
import useSWR, { mutate } from "swr"
import { HOSTNAME } from '../utils/env'

type StateType = {
    is_running: boolean
}

interface StateProviderInterface {
    state: StateType
    source_url: string
}

function stateProdider<TProps extends {}>(Component: React.ComponentType<TProps & StateProviderInterface>): React.FC<TProps> {
    return (props) => {
        const source_url = `http://${HOSTNAME}:3001/state`

        const { data, error } = useSWR(source_url, {
            refreshInterval: 5000
        })

        if (error) return <div>Error loading State.</div>
        if (!data) return <div>Loading State ...</div>

        return <Component
            {...props}
            state={data}
            source_url={source_url} />
    }
}

const State = stateProdider(StateCtrl(StateView))
export default State

interface StateCtrlInterface {
    onStart(): Promise<void>
    onStop(): Promise<void>
}

function StateCtrl<TProps extends StateProviderInterface>(Component: React.ComponentType<TProps & StateCtrlInterface>): React.FC<TProps> {
    return (props) => {
        const { source_url, state } = props

        async function handleStart() {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...state,
                    is_running: true
                })
            }
            await fetch(source_url, options)
            mutate(source_url)
        }

        async function handleStop() {
            const options = {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    ...state,
                    is_running: false
                })
            }
            await fetch(source_url, options)
            mutate(source_url)
        }
        return <Component
            {...props}
            onStart={handleStart}
            onStop={handleStop} />
    }
}

function StateView({ state, onStart, onStop }: StateCtrlInterface & StateProviderInterface) {
    return <>
        <div>
            {state.is_running
                ? <Button
                    onClick={onStop}
                    variant="success">Enabled</Button>
                : <Button
                    onClick={onStart}
                    variant="danger">Disabled</Button>}
            &nbsp;
            <Link
                href="/robot/new"
                passHref>
                <Button variant="primary">Create</Button>
            </Link>
        </div>
    </>
}