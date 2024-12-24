var _react_refresh_temp_1, _react_refresh_temp_2, _react_refresh_temp_3, _react_refresh_temp_4, _react_refresh_temp_5, _react_refresh_temp_6;
var _react_refresh_temp_7, _react_refresh_temp_8;
_react_refresh_temp_7 = $RefreshSig$();
_react_refresh_temp_8 = $RefreshSig$();
// ? generates signatures for function expressions calling hooks
export const A = React.memo(_react_refresh_temp_1 = React.forwardRef(_react_refresh_temp_2 = _react_refresh_temp_7((props, ref) => {
    _react_refresh_temp_7();
    const [foo, setFoo] = useState(0);
    React.useEffect(() => { });
    return <h1 ref={ref}>{foo}</h1>;
}, `useState{[foo, setFoo](0)}
useEffect{}`)));
$RefreshReg$(_react_refresh_temp_2, "A$React.memo$React.forwardRef");
$RefreshReg$(_react_refresh_temp_1, "A$React.memo");
_react_refresh_temp_3 = A;
$RefreshReg$(_react_refresh_temp_3, "A");
export const B = React.memo(_react_refresh_temp_4 = React.forwardRef(_react_refresh_temp_5 = _react_refresh_temp_8(function (props, ref) {
    _react_refresh_temp_8();
    const [foo, setFoo] = useState(0);
    React.useEffect(() => { });
    return <h1 ref={ref}>{foo}</h1>;
}, `useState{[foo, setFoo](0)}
useEffect{}`)));
$RefreshReg$(_react_refresh_temp_5, "B$React.memo$React.forwardRef");
$RefreshReg$(_react_refresh_temp_4, "B$React.memo");
_react_refresh_temp_6 = B;
$RefreshReg$(_react_refresh_temp_6, "B");
function hoc() {
    var _react_refresh_temp_9;
    _react_refresh_temp_9 = $RefreshSig$();
    return _react_refresh_temp_9(function Inner() {
        _react_refresh_temp_9();
        const [foo, setFoo] = useState(0);
        React.useEffect(() => { });
        return <h1 ref={ref}>{foo}</h1>;
    }, `useState{[foo, setFoo](0)}
useEffect{}`);
}
export let C = hoc();
