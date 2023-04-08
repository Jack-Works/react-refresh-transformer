var _react_refresh_temp_1, _react_refresh_temp_2;
// ? registers top-level exported named arrow functions
export const Hello = () => {
    function handleClick() { }
    return <h1 onClick={handleClick}>Hi</h1>;
};
_react_refresh_temp_1 = Hello;
$RefreshReg$(_react_refresh_temp_1, "Hello");
export let Bar = (props) => <Hello />;
_react_refresh_temp_2 = Bar;
$RefreshReg$(_react_refresh_temp_2, "Bar");
export default () => {
    // This one should be ignored.
    // You should name your components.
    return <Hello />;
};
