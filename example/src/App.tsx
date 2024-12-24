import { useEffect } from 'react'
import { Component } from './Component'

export const App = () => {
    useEffect(() => {
        console.log('render')
    }, [])

    return (
        <div>
            <Component />
        </div>
    )
}
