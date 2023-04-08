var _react_refresh_temp_1, _react_refresh_temp_2, _react_refresh_temp_3, _react_refresh_temp_4, _react_refresh_temp_5, _react_refresh_temp_6, _react_refresh_temp_7;
// ? registers identifiers used in JSX at definition site
import A from './A';
import Store from './Store';
Store.subscribe();
const Header = styled.div `
    color: red;
`;
_react_refresh_temp_1 = Header;
$RefreshReg$(_react_refresh_temp_1, "Header");
const StyledFactory1 = styled('div') `
    color: hotpink;
`;
_react_refresh_temp_2 = StyledFactory1;
$RefreshReg$(_react_refresh_temp_2, "StyledFactory1");
const StyledFactory2 = styled('div')({ color: 'hotpink' });
_react_refresh_temp_3 = StyledFactory2;
$RefreshReg$(_react_refresh_temp_3, "StyledFactory2");
const StyledFactory3 = styled(A)({ color: 'hotpink' });
_react_refresh_temp_4 = StyledFactory3;
$RefreshReg$(_react_refresh_temp_4, "StyledFactory3");
const FunnyFactory = funny.factory ``;
let Alias1 = A;
let Alias2 = A.Foo;
const Dict = {};
function Foo() {
    return (<div>
            <A />
            <B />
            <StyledFactory1 />
            <StyledFactory2 />
            <StyledFactory3 />
            <Alias1 />
            <Alias2 />
            <Header />
            <Dict.X />
        </div>);
}
_react_refresh_temp_5 = Foo;
$RefreshReg$(_react_refresh_temp_5, "Foo");
const B = hoc(A);
_react_refresh_temp_6 = B;
$RefreshReg$(_react_refresh_temp_6, "B");
// This is currently registered as a false positive:
const NotAComponent = wow(A);
_react_refresh_temp_7 = NotAComponent;
$RefreshReg$(_react_refresh_temp_7, "NotAComponent");
