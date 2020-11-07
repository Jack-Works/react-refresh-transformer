# react-refresh-typescript

This package implements the plugin to integrate Fast Refresh into bundlers. Fast Refresh is a feature that lets you edit React components in a running application without losing their state.

This package is primarily aimed at developers of bundler plugins. If you’re working on one, here is [a rough guide](https://github.com/facebook/react/issues/16604#issuecomment-528663101) for Fast Refresh integration using this package.

## Minimal requirement

-   TypeScript 4.0

## Example (with ts-loader)

```js
{
    test: /\.tsx?$/,
    loader: 'ts-loader',
    exclude: /node_modules/,
    options: {
        getCustomTransformers: () => ({
            before: [require('react-refresh/typescript')()]
        }),
    }
}
```

## Example (with raw TypeScript transpileModule API)

```js
import refresh from 'react-refresh/typescript';
const out = ts.transpileModule('const App = () => <Something />', {
    compilerOptions: {
        target: ts.ScriptTarget.ESNext,
        jsx: ts.JsxEmit.Preserve,
    },
    fileName: 'test.jsx',
    transformers: {before: [refresh(options)]},
}).outputText,
```

## Import from Deno

The entry point is `src/deno.ts`.

You must have [an import map for deno](https://deno.land/manual/linking_to_external_code/import_maps) that specify `typescript` as a peer dependency.

For example:

```json
{
    "imports": {
        "typescript": "https://esm.sh/typescript"
    }
}
```

## Options

```ts
export type Options = {
    /** @default "$RefreshReg$" */
    refreshReg?: string
    /** @default "$RefreshSig$" */
    refreshSig?: string
    /** @default false */
    emitFullSignatures?: boolean
    /** Provide your own TypeScript instance. */
    ts?: typeof import('typescript')
    /** Provide your own hash function when `emitFullSignatures` is `false` */
    hashSignature?: (signature: string) => string
}
```
