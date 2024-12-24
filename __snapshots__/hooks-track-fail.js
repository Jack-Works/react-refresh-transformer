var _react_refresh_temp_1;
var _react_refresh_temp_2;
_react_refresh_temp_2 = $RefreshSig$();
// ? should track custom hooks
function App() {
    _react_refresh_temp_2();
    var _react_refresh_temp_3, _react_refresh_temp_4;
    _react_refresh_temp_3 = $RefreshSig$();
    _react_refresh_temp_4 = $RefreshSig$();
    function useLocal() {
        _react_refresh_temp_3();
        return useState(0);
    }
    _react_refresh_temp_3(useLocal, "useState{(0)}");
    const useLocal2 = _react_refresh_temp_4(() => (_react_refresh_temp_4(), useLocal()), "useLocal{}", false, () => [useLocal]);
    useLocal(useLocal2());
}
_react_refresh_temp_1 = App;
$RefreshReg$(_react_refresh_temp_1, "App");
_react_refresh_temp_2(App, `useLocal{}
useLocal2{}`, true);
