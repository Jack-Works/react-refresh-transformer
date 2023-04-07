var _react_refresh_temp_1;
var _react_refresh_temp_2;
_react_refresh_temp_2 = $RefreshSig$();
// ? includes custom hooks into the signatures when commonjs target is used
// Not applicable for TypeScript. TypeScript one requires runs _before_ the module transformer.
import { useFancyState } from './hooks';
export default function App() {
    _react_refresh_temp_2();
    const bar = useFancyState();
    return <h1>{bar}</h1>;
}
_react_refresh_temp_1 = App;
$RefreshReg$(_react_refresh_temp_1, "App");
_react_refresh_temp_2(App, "useFancyState{bar}", false, () => [useFancyState]);
