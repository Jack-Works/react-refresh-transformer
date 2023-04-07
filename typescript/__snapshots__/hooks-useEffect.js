var _react_refresh_temp_1;
var _react_refresh_temp_2;
_react_refresh_temp_2 = $RefreshSig$();
// ? should generate signature for built-in hooks
export function EffectTest() {
    _react_refresh_temp_2();
    const rtn = useEffect();
    useEffect(expr, [deps]);
    useEffect(() => {
        do_some();
    });
    useEffect(() => (sideEffect(), () => undo()));
}
_react_refresh_temp_1 = EffectTest;
$RefreshReg$(_react_refresh_temp_1, "EffectTest");
_react_refresh_temp_2(EffectTest, `useEffect{rtn}
useEffect{}
useEffect{}
useEffect{}`);
