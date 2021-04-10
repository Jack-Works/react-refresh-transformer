var _a;
_a = $RefreshSig$();
// ? works with IIFE
while (item) {
    ;
    (_a((item) => {
        _a();
        useFoo();
    }, "useFoo{}", true))(item);
}
