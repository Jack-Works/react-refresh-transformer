var _react_refresh_temp_1;
var _react_refresh_temp_2, _react_refresh_temp_3, _react_refresh_temp_4;
_react_refresh_temp_2 = $RefreshSig$();
_react_refresh_temp_3 = $RefreshSig$();
_react_refresh_temp_4 = $RefreshSig$();
// ? includes custom hooks into the signatures
function useFancyState() {
    _react_refresh_temp_2();
    const [foo, setFoo] = React.useState(0);
    useFancyEffect();
    return foo;
}
_react_refresh_temp_2(useFancyState, `useState{[foo, setFoo](0)}
useFancyEffect{}`, false, () => [useFancyEffect]);
const useFancyEffect = () => {
    _react_refresh_temp_3();
    React.useEffect(() => { });
};
_react_refresh_temp_3(useFancyEffect, "useEffect{}");
export default function App() {
    _react_refresh_temp_4();
    const bar = useFancyState();
    return <h1>{bar}</h1>;
}
_react_refresh_temp_1 = App;
$RefreshReg$(_react_refresh_temp_1, "App");
_react_refresh_temp_4(App, "useFancyState{bar}", false, () => [useFancyState]);
