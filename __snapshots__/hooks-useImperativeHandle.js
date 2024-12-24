var _react_refresh_temp_1, _react_refresh_temp_2, _react_refresh_temp_3;
var _react_refresh_temp_4, _react_refresh_temp_5;
_react_refresh_temp_4 = $RefreshSig$();
_react_refresh_temp_5 = $RefreshSig$();
// ? should generate signature for built-in hooks
function ImperativeHandle(props, ref) {
    _react_refresh_temp_4();
    const v = useImperativeHandle(ref, () => ({ a }));
}
_react_refresh_temp_1 = ImperativeHandle;
$RefreshReg$(_react_refresh_temp_1, "ImperativeHandle");
_react_refresh_temp_4(ImperativeHandle, "useImperativeHandle{v}");
ImperativeHandle = forwardRef(ImperativeHandle);
const HOC = forwardRef(_react_refresh_temp_2 = _react_refresh_temp_5(function (props, ref) {
    _react_refresh_temp_5();
    const v = useImperativeHandle(ref, () => ({ a }));
}, "useImperativeHandle{v}"));
$RefreshReg$(_react_refresh_temp_2, "HOC$forwardRef");
_react_refresh_temp_3 = HOC;
$RefreshReg$(_react_refresh_temp_3, "HOC");
