// ? works with IIFE
while (item) {
    ;((item) => {
        useFoo()
    })(item)
}
