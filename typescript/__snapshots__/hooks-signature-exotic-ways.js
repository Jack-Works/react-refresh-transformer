var _react_refresh_temp_1;
var _react_refresh_temp_2;
_react_refresh_temp_2 = $RefreshSig$();
// ? generates valid signature for exotic ways to call Hooks
import FancyHook from 'fancy';
export default function App() {
    _react_refresh_temp_2();
    var _react_refresh_temp_3;
    _react_refresh_temp_3 = $RefreshSig$();
    function useFancyState() {
        _react_refresh_temp_3();
        const [foo, setFoo] = React.useState(0);
        useFancyEffect();
        return foo;
    }
    _react_refresh_temp_3(useFancyState, `useState{[foo, setFoo](0)}
useFancyEffect{}`, true);
    const bar = useFancyState();
    const baz = FancyHook.useThing();
    React.useState();
    useThePlatform();
    return (<h1>
            {bar}
            {baz}
        </h1>);
}
_react_refresh_temp_1 = App;
$RefreshReg$(_react_refresh_temp_1, "App");
_react_refresh_temp_2(App, `useFancyState{bar}
FancyHook.useThing{baz}
useState{}
useThePlatform{}`, true);
