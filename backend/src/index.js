const app = require('./app');
const dotenv = require('dotenv');
const connectDatabase = require('./config/database');

// uncaughtException
process.on('uncaughtException', err => {
    console.log(err.message);
    server.close(() => {
        process.exit(1);
    });
});

dotenv.config({ path: './.env' });

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is listening on http://localhost:${PORT}`);
});
connectDatabase();


// Unhandled Promise Rejection
process.on("unhandledRejection", err => {
    console.log(err.message);
    server.close(() => {
        process.exit(1);
    }); 
});

// uncaughtExceptionMonitor
process.on("uncaughtExceptionMonitor", err => {
    console.log(err.message);
    server.close(() => {
        process.exit(1);
    });
});

