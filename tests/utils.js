export function expectVectorClose(actual, expected, digits = 12) {
    const tol = 10 ** -digits;
    if (Math.abs(actual.x - expected.x) > tol || Math.abs(actual.y - expected.y) > tol) {
        const err = new Error(
            `Expected (${expected.x}, ${expected.y}) but got (${actual.x}, ${actual.y})`
        );
        if (Error.captureStackTrace)
            Error.captureStackTrace(err, expectVectorClose);
        throw err;
    }
}
