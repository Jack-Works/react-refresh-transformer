var _react_refresh_temp_1;
var _react_refresh_temp_2;
_react_refresh_temp_2 = $RefreshSig$();
// ? should generate signature for built-in hooks
export function CallbackTest() {
    _react_refresh_temp_2();
    const x = useCallback(() => { });
    const [p] = [useCallback(a, [a, b])];
}
_react_refresh_temp_1 = CallbackTest;
$RefreshReg$(_react_refresh_temp_1, "CallbackTest");
_react_refresh_temp_2(CallbackTest, `useCallback{x}
useCallback{}`);
