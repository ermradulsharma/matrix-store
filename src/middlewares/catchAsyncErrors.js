module.exports = tryCatchError => (req, res, next) => {
    Promise.resolve(tryCatchError(req, res, next)).catch(error => {
        // Add the stack trace to the error object
        error.stack = error.stack || new Error().stack;
        next(error);
    });
}