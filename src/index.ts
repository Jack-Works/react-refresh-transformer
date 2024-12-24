// Node wrapper
import core from './core.js'
import ts from 'typescript'
import crypto from 'crypto'
export type { Options } from './core.js'
const nodeWrapper: typeof core = function (option = {}) {
    return core({
        ts,
        hashSignature: (signature) => crypto.createHash('sha1').update(signature).digest('base64'),
        ...option,
    })
}
Object.assign(nodeWrapper, {
    default: nodeWrapper,
    __esModule: true,
})

// Give it a correct typing
export default nodeWrapper
