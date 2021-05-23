import { useState } from 'react'

export function Component() {
    const [state, setState] = useState(0)
    return (
        <>
            Current count {state}
            <button onClick={() => setState((x) => x + 1)}>Add</button>
        </>
    )
}
