//? Makes sure render props that uses hooks generate valid code

function Test() {
    const [foo, setFoo] = useState("");

    return (
        <Foo>
            {() => (
                <Bar label="testLabel">
                    {() => {
                        useEffect(() => {
                            setFoo(foo => foo + "a")
                        }, [setFoo]);
                        return <div>{foo}</div>
                    }}
                </Bar>
            )}
        </Foo>
    )
}

function Foo(props) {
    const { children } = props;
    return (
        <>{typeof children === "function" ? children(props) : children}</>
    );
}

function Bar () {
    const { label, children } = props;
    return (
        <div>
        <label>{label}</label>
        {typeof children === "function" ? children(props) : children}
        </div>
    );
}