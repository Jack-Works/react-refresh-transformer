var _react_refresh_temp_1;
var _react_refresh_temp_2;
_react_refresh_temp_2 = $RefreshSig$();
// ? should generate signature for built-in hooks
export function StateTest() {
    _react_refresh_temp_2();
    const a = useState(0, extra);
    const [b] = useState(complex + expression.f());
    const [c, d] = React.useState();
    const [[e], f] = useState([0]);
    const { 0: y, 1: z, length } = useState(() => {
        a();
        multiple();
        line();
        expression();
    });
}
_react_refresh_temp_1 = StateTest;
$RefreshReg$(_react_refresh_temp_1, "StateTest");
_react_refresh_temp_2(StateTest, `useState{a(0)}
useState{[b](complex + expression.f())}
useState{[c, d]}
useState{[[e], f]([0])}
useState{{ 0: y, 1: z, length }(() => {
        a()
        multiple()
        line()
        expression()
    })}`);
