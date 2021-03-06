// Deno wrapper
// @ts-ignore
import core from './core.ts'
// @ts-ignore
import { Md5 } from 'https://deno.land/std@0.76.0/hash/md5.ts'
import ts from 'typescript'
export default (function (option = {}) {
    const hash = new Md5()
    return core({
        ts,
        hashSignature: (signature: string) => hash.update(signature).toString('base64'),
        ...option,
    })
} as typeof core)
