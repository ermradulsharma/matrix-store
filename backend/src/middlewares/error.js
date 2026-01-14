const ErrorHandler = require('../utils/errorHandler');

module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.message = err.message || "Internal Server Error";

    let response = {
        success: false,
        message: err.message,
    };

    if (res.headersSent) {
        return next(err); // Forward the error to the default error handler
    }

    // Handle Mongoose Connection Error
    if (
        err.name === 'MongooseServerSelectionError' ||
        err.name === 'MongoNetworkError' ||
        (err.message && (err.message.includes('ECONNREFUSED') || err.message.includes('connection timed out') || err.message.includes('buffering timed out')))
    ) {
        response.message = "Database connection failed. Please ensure MongoDB is running.";
        err.statusCode = 503; // Service Unavailable
    }

    // Add error name for debugging
    response.errorName = err.name;

    if (err.name === "ValidationError") {
        // Handle validation errors
        const validationErrors = [];
        const keysWithNullValue = [];
        const missingKeys = [];

        for (const field in err.errors) {
            validationErrors.push(field);
            if (err.errors[field].value === null || err.errors[field].value === '') {
                keysWithNullValue.push(field);
            }
        }

        // Check for missing keys
        const reqKeys = Object.keys(req.body);
        missingKeys.push(...validationErrors.filter(key => !reqKeys.includes(key)));
        if (missingKeys.length > 0 || keysWithNullValue.length > 0) {
            const errorMessageParts = [];

            if (missingKeys.length > 0) {
                errorMessageParts.push(missingKeys.join(', ') + " key(s) don't exist in request");
            }

            if (keysWithNullValue.length > 0) {
                errorMessageParts.push(keysWithNullValue.join(', ') + " key(s) have null value");
            }

            response.message = errorMessageParts.join(' and ');
            res.status(400).json(response);
        } else {
            next(err); // Pass the error to the default error handling mechanism
        }
    }

    // Cast Error
    if (err.name === 'CastError') {
        response.message = `Resource not found. Invalid: ${err.path}`;
        res.status(404).json(response); // Use 404 status for not found errors

    }

    // Handle MongoDB Duplicate Key Error
    if (err.code === 11000) {
        const field = Object.keys(err.keyValue)[0];
        const value = err.keyValue[field];

        // Customize the message based on the field
        switch (field) {
            case 'mobile_no':
                response.message = `${value} is already associated with an account. Please enter a different mobile number.`;
                break;
            case 'email':
                response.message = `${value} is already registered. Please use a different email address.`;
                break;
            case 'username':
                response.message = `${value} is already taken. Please choose a different username.`;
                break;
            default:
                response.message = `${value} already exists in record. Please enter another value.`;
                break;
        }

        return res.status(400).json(response); // Ensure response ends here
    }

    // Invaild Json Web Token Error
    if (err.name === 'JsonWebTokenError') {
        response.message = `This token is invaild. Please Try Again.`;
        res.status(404).json(response); // Use 404 status for not found errors

    }

    // Token Expire Error
    if (err.name === 'TokenExpiredError') {
        response.message = `This token is expired. Please Try Again`;
        res.status(404).json(response); // Use 404 status for not found errors

    }

    // Final Response
    if (!res.headersSent) {
        return res.status(err.statusCode).json(response);
    }
};
