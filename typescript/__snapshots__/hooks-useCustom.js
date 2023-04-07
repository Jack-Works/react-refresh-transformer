var _react_refresh_temp_1;
var _react_refresh_temp_2;
_react_refresh_temp_2 = $RefreshSig$();
// ? should generate signature for custom hooks
function A() {
    _react_refresh_temp_2();
    const [x] = useCustom(1, 2, 3);
    useCustom();
}
_react_refresh_temp_1 = A;
$RefreshReg$(_react_refresh_temp_1, "A");
_react_refresh_temp_2(A, `useCustom{[x]}
useCustom{}`, true);
