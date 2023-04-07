var _react_refresh_temp_1;
var _react_refresh_temp_2;
_react_refresh_temp_2 = $RefreshSig$();
// ? should generate signature for built-in hooks
export function ContextTest() {
    _react_refresh_temp_2();
    const ctx = useContext(expr);
    const { val } = useContext(expr2, extra);
    useContext(expr3);
}
_react_refresh_temp_1 = ContextTest;
$RefreshReg$(_react_refresh_temp_1, "ContextTest");
_react_refresh_temp_2(ContextTest, `useContext{ctx}
useContext{{ val }}
useContext{}`);
