var _react_refresh_temp_1, _react_refresh_temp_2;
var _react_refresh_temp_3, _react_refresh_temp_4;
_react_refresh_temp_3 = $RefreshSig$();
_react_refresh_temp_4 = $RefreshSig$();
// ? should recognize reset comment
// @refresh reset
function App() {
    _react_refresh_temp_3();
    useState(0);
}
_react_refresh_temp_1 = App;
$RefreshReg$(_react_refresh_temp_1, "App");
_react_refresh_temp_3(App, "useState{(0)}", true);
// Should not be reset?
function Not() {
    _react_refresh_temp_4();
    useState(0);
}
_react_refresh_temp_2 = Not;
$RefreshReg$(_react_refresh_temp_2, "Not");
_react_refresh_temp_4(Not, "useState{(0)}", true);
