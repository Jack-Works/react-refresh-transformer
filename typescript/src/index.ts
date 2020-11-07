// Node wrapper
import core from './core'
import typescript from 'typescript'
import crypto from 'crypto'
export default (function (option = {}) {
    return core({
        ts: typescript,
        hashSignature: (signature) => crypto.createHash('sha1').update(signature).digest('base64'),
        ...option,
    })
} as typeof core)
