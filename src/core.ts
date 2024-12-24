import type {
    ArrowFunction,
    Block,
    CallExpression,
    CaseClause,
    ConciseBody,
    DefaultClause,
    Expression,
    FunctionDeclaration,
    FunctionExpression,
    Identifier,
    ModuleBlock,
    Node,
    NodeArray,
    SourceFile,
    Statement,
    TransformerFactory,
    VisitResult,
} from 'typescript'

/**
 * Create a ReactRefresh transformer for TypeScript.
 *
 * This transformer should run in the before stage.
 *
 * This transformer requires TypeScript to be at least 4.0.
 */
export default function (opts: Options = {}): TransformerFactory<SourceFile> {
    const ts = opts.ts!
    if (!ts) throw new Error('Please provide typescript by options.ts')
    {
        const [major] = ts.version.split('.')
        if (parseInt(major) < 4) throw new Error('TypeScript should be at least 4.0')
    }
    return (context) => {
        const { factory } = context
        const refreshReg = factory.createIdentifier(opts.refreshReg || '$RefreshReg$')
        const refreshSig = factory.createIdentifier(opts.refreshSig || '$RefreshSig$')
        return (file) => {
            if (file.isDeclarationFile) return file
            const containHooksLikeOrJSX = file.languageVariant === ts.LanguageVariant.JSX || file.text.includes('use')
            if (!containHooksLikeOrJSX) return file
            // TODO: change to scan comment?
            const globalRequireForceRefresh = file.text.includes('@refresh reset')

            const topLevelDeclaredName = new Set<string>()
            // Collect top level local declarations
            for (const node of file.statements) {
                if (ts.isFunctionDeclaration(node) && node.name) topLevelDeclaredName.add(node.name.text)
                if (ts.isVariableStatement(node)) {
                    for (const decl of node.declarationList.declarations) {
                        if (ts.isIdentifier(decl.name)) {
                            topLevelDeclaredName.add(decl.name.text)
                        }
                        // ? skip for deconstructing pattern
                    }
                }
            }
            // track all JSX usage and transform non-top level hooks
            const { nextFile, usedAsJSXElement, hooksSignatureMap } = visitDeep(
                file,
                topLevelDeclaredName,
                globalRequireForceRefresh
            )
            file = nextFile

            return updateStatements(file, (statements) =>
                ts.visitLexicalEnvironment(
                    statements,
                    (node) => visitTopLevel(usedAsJSXElement, hooksSignatureMap, node),
                    context
                )
            )
        }

        // Only visit top level declaration to find possible components
        function visitTopLevel(
            usedAsJSXElement: ReadonlySet<string>,
            hooksSignatureMap: Map<HandledFunction, CallExpression>,
            node: Node
        ): VisitResult<Node> {
            if (ts.isFunctionDeclaration(node)) {
                if (!node.name || !node.body) return node
                return [node, ...registerComponent(node.name)]
            } else if (ts.isVariableStatement(node)) {
                const deferredStatements: Statement[] = []
                const nextDeclarationList = ts.visitEachChild(
                    node.declarationList,
                    (declaration) => {
                        if (!ts.isVariableDeclaration(declaration)) return declaration
                        const init = declaration.initializer
                        // Not handle complex declaration. e.g. [a, b] = [() => ..., () => ...]
                        // or declaration without initializer
                        if (!ts.isIdentifier(declaration.name) || !init) return declaration
                        const declarationUsedAsJSX = usedAsJSXElement.has(declaration.name.text)
                        if (declarationUsedAsJSX || isFunctionExpressionLikeOrFunctionDeclaration(init)) {
                            if (!unwantedComponentLikeDefinition(init)) {
                                deferredStatements.push(...registerComponent(declaration.name))
                            }
                            if (isFunctionExpressionLikeOrFunctionDeclaration(init) && hooksSignatureMap.has(init)) {
                                /**
                                 * const Comp = () => <Comp />
                                 * const Comp2 = function () { return <Comp /> }
                                 *
                                 * Reserve the function name
                                 *
                                 * See https://tc39.es/ecma262/multipage/ecmascript-language-expressions.html#sec-assignment-operators-runtime-semantics-evaluation
                                 */
                                // this is a workaround to https://github.com/Jack-Works/react-refresh-transformer/issues/8
                                // I don't have time to refactor it yet.
                                let oneShot: any = false
                                const sig = ts.visitEachChild(
                                    hooksSignatureMap.get(init)!,
                                    (node) =>
                                        oneShot
                                            ? node
                                            : ts.isFunctionLike(node)
                                            ? (oneShot = declaration.name as Identifier)
                                            : node,
                                    context
                                )
                                deferredStatements.push(factory.createExpressionStatement(sig))
                            }
                            return declaration
                        }
                        if (isHigherOrderComponentLike(init)) {
                            const { registers, call } = registerHigherOrderComponent(
                                hooksSignatureMap,
                                init,
                                declaration.name.text
                            )
                            deferredStatements.push(...registers, ...registerComponent(declaration.name))
                            return factory.updateVariableDeclaration(
                                declaration,
                                declaration.name,
                                undefined,
                                declaration.type,
                                call
                            )
                        }
                        return declaration
                    },
                    context
                )
                return [
                    factory.updateVariableStatement(node, node.modifiers, nextDeclarationList),
                    ...deferredStatements,
                ]
            } else if (ts.isExportAssignment(node)) {
                if (isHigherOrderComponentLike(node.expression)) {
                    const { registers, call } = registerHigherOrderComponent(
                        hooksSignatureMap,
                        node.expression,
                        '%default%'
                    )
                    const temp = createTempVariable()
                    return [
                        factory.updateExportAssignment(node, node.modifiers, factory.createAssignment(temp, call)),
                        createComponentRegisterCall(temp, '%default%'),
                        ...registers,
                    ]
                } else if (isFunctionExpressionLikeOrFunctionDeclaration(node.expression)) {
                    const expr = hooksSignatureMap.get(node.expression)
                    if (expr) {
                        return factory.updateExportAssignment(node, node.modifiers, expr)
                    }
                }
            }
            return node
        }

        function registerComponent(name: Identifier) {
            if (!startsWithLowerCase(name.text)) {
                const temp = createTempVariable()
                // uniq = name
                const assignment = factory.createAssignment(temp, name)
                // $reg$(uniq, "name")
                return [factory.createExpressionStatement(assignment), createComponentRegisterCall(temp, name.text)]
            }
            return []
        }
        /**
         * Please call isHOCLike before call this function
         */
        function registerHigherOrderComponent(
            hooksSignatureMap: ReadonlyMap<HandledFunction, CallExpression>,
            callExpr: CallExpression,
            nameHint: string
        ): { call: CallExpression; registers: Statement[] } {
            // Recursive case, if it is x(y(...)), recursive with y(...) to get inner expr
            const arg0 = callExpr.arguments[0]
            if (ts.isCallExpression(arg0)) {
                const tempVar = createTempVariable()
                const nextNameHint = nameHint + '$' + printNode(callExpr.expression)
                const { registers, call: innerResult } = registerHigherOrderComponent(
                    hooksSignatureMap,
                    arg0,
                    nextNameHint
                )
                return {
                    call: factory.updateCallExpression(callExpr, callExpr.expression, void 0, [
                        factory.createAssignment(tempVar, innerResult),
                        ...callExpr.arguments.slice(1),
                    ]),
                    registers: registers.concat(createComponentRegisterCall(tempVar, nextNameHint)),
                }
            }

            // Base case, it is x(function () {...}) or x(() => ...) or x(Identifier)
            if (!isFunctionExpressionLikeOrFunctionDeclaration(arg0) && !ts.isIdentifier(arg0)) {
                throw new Error(
                    'This is an error of react-refresh/typescript. Please report this problem: Call isHOC before register it'
                )
            }
            if (ts.isIdentifier(arg0)) return { call: callExpr, registers: [] }
            const tempVar = createTempVariable()
            return {
                call: factory.updateCallExpression(callExpr, callExpr.expression, void 0, [
                    factory.createAssignment(tempVar, hooksSignatureMap.get(arg0) || arg0),
                    ...callExpr.arguments.slice(1),
                ]),
                registers: [createComponentRegisterCall(tempVar, nameHint + '$' + printNode(callExpr.expression))],
            }
        }
        function createTempVariable() {
            const tempVariable = factory.createUniqueName('_react_refresh_temp')
            context.hoistVariableDeclaration(tempVariable)
            return tempVariable
        }
        function visitDeep(
            file: SourceFile,
            topLevelDeclaredName: ReadonlySet<string>,
            globalRequireForceRefresh: boolean
        ) {
            const usedAsJSXElement = new Set<string>()
            const containingHooksOldMap = new Map<HandledFunction, CallExpression[]>()
            const hooksSignatureMap = new Map<HandledFunction, CallExpression>()
            function trackHooks(comp: HandledFunction, call: CallExpression) {
                const arr = containingHooksOldMap.get(comp) || []
                arr.push(call)
                containingHooksOldMap.set(comp, arr)
            }
            function visitor(node: Node) {
                // Collect JSX create info
                // <abc /> or <abc>
                if (ts.isJsxOpeningLikeElement(node)) {
                    const tag = node.tagName
                    if (ts.isIdentifier(tag) && !isIntrinsicElement(tag)) {
                        const name = tag.text
                        if (topLevelDeclaredName.has(name)) usedAsJSXElement.add(name)
                    }
                    // Not tracking other kinds of tagNames like <A.B /> or <A:B />
                } else if (isJSXConstructingCallExpr(node)) {
                    const arg0 = node.arguments[0]
                    if (arg0 && ts.isIdentifier(arg0)) {
                        const name = arg0.text
                        if (topLevelDeclaredName.has(name)) usedAsJSXElement.add(name)
                    }
                }
                if (isReactHooksCall(node)) {
                    const parent = findAncestor(node, isFunctionExpressionLikeOrFunctionDeclaration) as HandledFunction
                    if (parent) trackHooks(parent, node)
                }
                const oldNode = node as HandledFunction
                // Collect hooks
                node = ts.visitEachChild(node, visitor, context)
                const hooksCalls = containingHooksOldMap.get(oldNode)
                if (hooksCalls && isFunctionExpressionLikeOrFunctionDeclaration(node) && node.body) {
                    const hooksTracker = createTempVariable()
                    const createHooksTracker = factory.createExpressionStatement(
                        factory.createBinaryExpression(
                            hooksTracker,
                            factory.createToken(ts.SyntaxKind.EqualsToken),
                            factory.createCallExpression(refreshSig, undefined, [])
                        )
                    )
                    // @ts-ignore This is a private API.
                    context.addInitializationStatement(createHooksTracker)
                    const callTracker = factory.createCallExpression(hooksTracker, void 0, [])
                    const nextBody = ts.isBlock(node.body)
                        ? updateStatements(node.body, (r) => [factory.createExpressionStatement(callTracker), ...r])
                        : factory.createComma(callTracker, node.body)
                    const newFunction = updateBody(node, nextBody)
                    const hooksSignature = hooksCallsToSignature(hooksCalls)
                    const { force: forceRefresh, hooks: hooksArray } = needForceRefresh(hooksCalls)
                    const requireForceRefresh = forceRefresh || globalRequireForceRefresh
                    if (ts.isFunctionDeclaration(newFunction)) {
                        if (newFunction.name) {
                            hooksSignatureMap.set(
                                newFunction,
                                createHooksRegisterCall(
                                    hooksTracker,
                                    newFunction.name,
                                    hooksSignature,
                                    requireForceRefresh,
                                    hooksArray
                                )
                            )
                        }
                        node = newFunction
                    } else {
                        const wrapped = createHooksRegisterCall(
                            hooksTracker,
                            newFunction,
                            hooksSignature,
                            requireForceRefresh,
                            hooksArray
                        )
                        hooksSignatureMap.set(newFunction, wrapped)
                        node = newFunction
                        // if it is an inner decl, we can update it safely
                        if (findAncestor(oldNode.parent, ts.isFunctionLike)) node = wrapped
                    }
                }
                return updateStatements(node, addSignatureReport)
            }
            function addSignatureReport(statements: ReadonlyArray<Statement>) {
                const next: Statement[] = []
                for (const statement of statements) {
                    // Don't want to do a type guard here cause it is safe
                    const signatureReport = hooksSignatureMap.get(statement as any)
                    next.push(statement)
                    if (signatureReport) next.push(factory.createExpressionStatement(signatureReport))
                }
                return next
            }

            const nextFile = updateStatements(ts.visitEachChild(file, visitor, context), addSignatureReport)
            return {
                nextFile,
                usedAsJSXElement,
                hooksSignatureMap,
            }
        }

        function printNode(node: Node) {
            try {
                return node.getText()
            } catch {
                return ''
            }
        }
        function hooksCallsToSignature(calls: CallExpression[]) {
            const signature = calls
                .map((x) => {
                    let assignTarget = ''
                    if (x.parent && ts.isVariableDeclaration(x.parent)) {
                        assignTarget = printNode(x.parent.name)
                    }

                    let hooksName = printNode(x.expression)
                    let shouldCaptureArgs = 0 // bit-wise parameter position
                    if (ts.isPropertyAccessExpression(x.expression)) {
                        const left = x.expression.expression
                        if (ts.isIdentifier(left) && left.text === 'React') {
                            hooksName = printNode(x.expression.name)
                        }
                    }
                    if (hooksName === 'useState') shouldCaptureArgs = 1 << 0
                    else if (hooksName === 'useReducer') shouldCaptureArgs = 1 << 1

                    const args = x.arguments.reduce((last, val, index) => {
                        if ((1 << index) & shouldCaptureArgs) {
                            if (last) last += ','
                            last += printNode(val)
                        }
                        return last
                    }, '')
                    return `${hooksName}{${assignTarget}${args ? `(${args})` : ''}}`
                })
                .join('\n')

            if (opts.emitFullSignatures !== true && opts.hashSignature) {
                try {
                    return opts.hashSignature(signature)
                } catch (e) {}
            }
            return signature
        }
        function needForceRefresh(calls: CallExpression[]) {
            const externalHooks: Expression[] = []
            return {
                hooks: externalHooks,
                force: calls.some((x) => {
                    const ownerFunction = findAncestor(x, isFunctionExpressionLikeOrFunctionDeclaration)
                    const callee = x.expression
                    if (!ownerFunction) return true
                    if (ts.isPropertyAccessExpression(callee)) {
                        const left = callee.expression
                        if (ts.isIdentifier(left)) {
                            if (left.text === 'React') return false
                            const hasDecl = hasDeclarationInScope(ownerFunction, left.text)
                            if (hasDecl) externalHooks.push(callee)
                            return !hasDecl
                        }
                        return true
                    } else if (ts.isIdentifier(callee)) {
                        if (isBuiltinHook(callee.text)) return false
                        const hasDecl = hasDeclarationInScope(ownerFunction, callee.text)
                        if (hasDecl) externalHooks.push(callee)
                        return !hasDecl
                    }
                    return true
                }),
            }
        }
        /**
         * @param instance The identifier of the sig instance
         * @param component The binding component
         * @param signature The signature of the function
         * @param forceRefresh Does forceRefresh enabled?
         * @param trackers A list of custom hooks references
         */
        function createHooksRegisterCall(
            instance: Identifier,
            component: Expression,
            signature: string,
            forceRefresh: boolean,
            trackers: Expression[]
        ) {
            const args = [component]
            if (signature.includes('\n')) args.push(factory.createNoSubstitutionTemplateLiteral(signature, signature))
            else args.push(factory.createStringLiteral(signature))

            if (forceRefresh || trackers.length) args.push(forceRefresh ? factory.createTrue() : factory.createFalse())
            if (trackers.length)
                args.push(
                    factory.createArrowFunction(
                        void 0,
                        void 0,
                        [],
                        void 0,
                        factory.createToken(ts.SyntaxKind.EqualsGreaterThanToken),
                        factory.createArrayLiteralExpression(trackers)
                    )
                )
            return factory.createCallExpression(instance, void 0, args)
        }
        function createComponentRegisterCall(id: Identifier, name: string) {
            return factory.createExpressionStatement(
                factory.createCallExpression(refreshReg, void 0, [id, factory.createStringLiteral(name)])
            )
        }
        function updateStatements<T extends Node>(node: T, f: (s: NodeArray<Statement>) => readonly Statement[]): T {
            if (ts.isSourceFile(node)) {
                const sf = factory.updateSourceFile(
                    node,
                    f(node.statements),
                    node.isDeclarationFile,
                    node.referencedFiles,
                    node.typeReferenceDirectives,
                    node.hasNoDefaultLib,
                    node.libReferenceDirectives
                )
                return sf as T & SourceFile
            }
            if (ts.isCaseClause(node)) {
                const caseClause = factory.updateCaseClause(node, node.expression, f(node.statements))
                return caseClause as T & CaseClause
            }
            if (ts.isDefaultClause(node)) {
                const defaultClause = factory.updateDefaultClause(node, f(node.statements))
                return defaultClause as T & DefaultClause
            }
            if (ts.isModuleBlock(node)) {
                const modBlock = factory.updateModuleBlock(node, f(node.statements))
                return modBlock as T & ModuleBlock
            }
            if (ts.isBlock(node)) {
                const block = factory.updateBlock(node, f(node.statements))
                return block as T & Block
            }
            return node
        }
        function updateBody(node: HandledFunction, nextBody: Block | ConciseBody): HandledFunction {
            if (ts.isFunctionDeclaration(node)) {
                if (!ts.isBlock(nextBody)) throw new TypeError()
                return factory.updateFunctionDeclaration(
                    node,
                    node.modifiers,
                    node.asteriskToken,
                    node.name,
                    node.typeParameters,
                    node.parameters,
                    node.type,
                    nextBody
                )
            } else if (ts.isFunctionExpression(node)) {
                if (!ts.isBlock(nextBody)) throw new TypeError()
                return factory.updateFunctionExpression(
                    node,
                    node.modifiers,
                    node.asteriskToken,
                    node.name,
                    node.typeParameters,
                    node.parameters,
                    node.type,
                    nextBody
                )
            } else if (ts.isArrowFunction(node)) {
                return factory.updateArrowFunction(
                    node,
                    node.modifiers,
                    node.typeParameters,
                    node.parameters,
                    node.type,
                    node.equalsGreaterThanToken,
                    nextBody
                )
            }
            return node
        }
    }

    function isBuiltinHook(hookName: string) {
        switch (hookName) {
            case 'useState':
            case 'useReducer':
            case 'useEffect':
            case 'useLayoutEffect':
            case 'useMemo':
            case 'useCallback':
            case 'useRef':
            case 'useContext':
            case 'useImperativeHandle':
            case 'useDebugValue':
            case 'useId':
            case 'useDeferredValue':
            case 'useTransition':
            case 'useInsertionEffect':
            case 'useSyncExternalStore':
            case 'useFormState':
            case 'useActionState':
            case 'useOptimistic':
                return true
            default:
                return false
        }
    }

    function hasDeclarationInScope(node: Node, name: string) {
        while (node) {
            if (ts.isSourceFile(node) && hasDeclaration(node.statements, name)) return true
            if (ts.isBlock(node) && hasDeclaration(node.statements, name)) return true
            node = node.parent
        }
        return false
    }
    // This function does not consider uncommon and unrecommended practice like declare use var in a inner scope
    function hasDeclaration(nodes: readonly Statement[], name: string) {
        for (const node of nodes) {
            if (ts.isVariableStatement(node)) {
                for (const decl of node.declarationList.declarations) {
                    // binding pattern not checked
                    if (ts.isIdentifier(decl.name) && decl.name.text === name) return true
                }
            } else if (ts.isImportDeclaration(node)) {
                const clause = node.importClause
                const defaultImport = clause && clause.name
                const namedImport = clause && clause.namedBindings
                if (defaultImport && defaultImport.text === name) return true
                if (namedImport && ts.isNamespaceImport(namedImport)) {
                    if (namedImport.name.text === name) return true
                } else if (namedImport && ts.isNamedImports(namedImport)) {
                    const hasBinding = namedImport.elements.some((x) => x.name.text === name)
                    if (hasBinding) return true
                }
            } else if (ts.isFunctionDeclaration(node)) {
                if (!node.body) continue
                if (node.name && node.name.text === name) return true
            }
        }
        return false
    }

    function isIntrinsicElement(id: Identifier) {
        return id.text.includes('-') || startsWithLowerCase(id.text) || id.text.includes(':')
    }

    function isImportOrRequireLike(expr: Expression) {
        if (!ts.isCallExpression(expr)) return false
        const callee = expr.expression
        if (callee.kind === ts.SyntaxKind.ImportKeyword) return true
        if (ts.isIdentifier(callee) && callee.text.includes('require')) return true
        return false
    }

    function isReactHooksCall(expr: Node): expr is CallExpression {
        if (!ts.isCallExpression(expr)) return false
        const callee = expr.expression
        if (ts.isIdentifier(callee) && callee.text.startsWith('use')) return true
        if (ts.isPropertyAccessExpression(callee) && callee.name.text.startsWith('use')) return true
        return false
    }

    function findAncestor(node: Node, callback: (element: Node) => boolean | 'quit') {
        while (node) {
            const result = callback(node)
            if (result === 'quit') {
                return undefined
            } else if (result) {
                return node
            }
            node = node.parent
        }
        return undefined
    }

    /**
     * If it return true, don't track it even it is used as JSX component
     */
    function unwantedComponentLikeDefinition(expr: Expression): boolean {
        if (isImportOrRequireLike(expr)) return true
        // `const A = B.X` or `const A = X`
        if (ts.isIdentifier(expr) || ts.isPropertyAccessExpression(expr)) return true
        if (ts.isConditionalExpression(expr))
            return (
                unwantedComponentLikeDefinition(expr.condition) ||
                unwantedComponentLikeDefinition(expr.whenFalse) ||
                unwantedComponentLikeDefinition(expr.whenTrue)
            )
        return false
    }

    function isHigherOrderComponentLike(outExpr: Expression): outExpr is CallExpression {
        let expr = outExpr
        if (!ts.isCallExpression(outExpr)) return false
        while (ts.isCallExpression(expr) && !isImportOrRequireLike(expr)) {
            const callee = expr.expression
            // x.y() or x()
            const isValidCallee = ts.isPropertyAccessExpression(callee) || ts.isIdentifier(callee)
            if (isValidCallee) {
                expr = expr.arguments[0] // check if arg is also a HOC
                if (!expr) return false
            } else return false
        }
        const isValidHOCArg =
            isFunctionExpressionLikeOrFunctionDeclaration(expr) ||
            (ts.isIdentifier(expr) && !startsWithLowerCase(expr.text))
        return isValidHOCArg
    }

    function isFunctionExpressionLikeOrFunctionDeclaration(node: Node): node is HandledFunction {
        if (ts.isFunctionDeclaration(node)) return true
        if (ts.isArrowFunction(node)) return true
        if (ts.isFunctionExpression(node)) return true
        return false
    }
    /**
     * If the call expression seems like "jsx(...)" or "xyz.jsx(...)"
     */
    function isJSXConstructingCallExpr(call: Node): call is CallExpression {
        if (!ts.isCallExpression(call)) return false
        const callee = call.expression
        let f = ''
        if (ts.isIdentifier(callee)) f = callee.text
        if (ts.isPropertyAccessExpression(callee)) f = callee.name.text
        if (['createElement', 'jsx', 'jsxs', 'jsxDEV'].includes(f)) return true
        return false
    }
}

function startsWithLowerCase(str: string) {
    return str[0].toLowerCase() === str[0]
}

export type Options = {
    /** @default "$RefreshReg$" */
    readonly refreshReg?: string
    /** @default "$RefreshSig$" */
    readonly refreshSig?: string
    /** @default false */
    readonly emitFullSignatures?: boolean
    /** Provide your own TypeScript instance. */
    readonly ts?: typeof import('typescript')
    /** Provide your own hash function when `emitFullSignatures` is `false` */
    readonly hashSignature?: (signature: string) => string
}
type HandledFunction = FunctionDeclaration | FunctionExpression | ArrowFunction
