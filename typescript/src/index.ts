// Node wrapper
import core from './core'
import typescript from 'typescript'
import crypto from 'crypto'
export type { Options } from './core'
const nodeWrapper: typeof core = function (option = {}) {
    return core({
        ts: typescript,
        hashSignature: (signature) => crypto.createHash('sha1').update(signature).digest('base64'),
        ...option,
    })
}

// Our build tool chain doesn't allow use to write export = nodeWrapper
Object.assign(nodeWrapper, { default: nodeWrapper })
module.exports = nodeWrapper
module.exports.__esModule = true
// Give it a correct typing
export default nodeWrapper
