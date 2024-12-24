import { useState } from 'react'

export const Component = () => {
    const [state, setState] = useState(0)
    console.log('source map test')
    return (
        <>
            Current foobar {state}
            <button onClick={() => setState((x) => x + 1)}>Add</button>
        </>
    )
}
