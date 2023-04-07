var _react_refresh_temp_1, _react_refresh_temp_2, _react_refresh_temp_3;
var _react_refresh_temp_4;
_react_refresh_temp_4 = $RefreshSig$();
//? Makes sure render props that uses hooks generate valid code
function Test() {
    _react_refresh_temp_4();
    const [foo, setFoo] = useState("");
    return (<Foo>
            {() => {
            var _react_refresh_temp_5;
            _react_refresh_temp_5 = $RefreshSig$();
            return (<Bar label="testLabel">
                    {_react_refresh_temp_5(() => {
                    _react_refresh_temp_5();
                    useEffect(() => {
                        setFoo(foo => foo + "a");
                    }, [setFoo]);
                    return <div>{foo}</div>;
                }, "useEffect{}")}
                </Bar>);
        }}
        </Foo>);
}
_react_refresh_temp_1 = Test;
$RefreshReg$(_react_refresh_temp_1, "Test");
_react_refresh_temp_4(Test, "useState{[foo, setFoo](\"\")}");
function Foo(props) {
    const { children } = props;
    return (<>{typeof children === "function" ? children(props) : children}</>);
}
_react_refresh_temp_2 = Foo;
$RefreshReg$(_react_refresh_temp_2, "Foo");
function Bar() {
    const { label, children } = props;
    return (<div>
        <label>{label}</label>
        {typeof children === "function" ? children(props) : children}
        </div>);
}
_react_refresh_temp_3 = Bar;
$RefreshReg$(_react_refresh_temp_3, "Bar");
