import { useState } from 'react'

export function Component() {
    const [state, setState] = useState(0)
    console.log('source map test')
    return (
        <>
            Current count {state}
            <button onClick={() => setState((x) => x + 1)}>Add</button>
        </>
    )
}
