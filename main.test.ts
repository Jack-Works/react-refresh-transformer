import ts, { CompilerOptions } from 'typescript'
import tsTransformer, { Options } from './src/index'
import { toMatchFile } from 'jest-file-snapshot'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { expect, it } from 'vitest'

expect.extend({ toMatchFile })

function transform(input: string, options: Options, compilerOptions?: CompilerOptions) {
    return ts.transpileModule(input, {
        compilerOptions: {
            target: ts.ScriptTarget.ESNext,
            jsx: ts.JsxEmit.Preserve,
            ...(compilerOptions || {}),
        },
        fileName: 'test.jsx',
        transformers: { before: [tsTransformer(options)] },
    }).outputText
}

const sourceFolder = join(__dirname, './tests')
const testFiles = readdirSync(sourceFolder)
for (const fileName of testFiles) {
    const code = readFileSync(join(sourceFolder, fileName), { encoding: 'utf-8' })
    if (code.trim().length === 0) continue
    // match: // ? (description)\n
    const description = code.match(/\/\/ ?\? (.+)\n/)?.[0] ?? 'untitled test'
    it(description.trim().slice(5), () => {
        const snapshotOutput = join(__dirname, './__snapshots__/', fileName)
        expect(transform(code, { emitFullSignatures: true, ts })).toMatchFile(snapshotOutput)
    })
}
