const express = require('express');
const app = express();
const errorMiddleware = require('./middlewares/error');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

const webRoutes = require('./routes/web');
app.use('/api/v1', webRoutes);
app.use(errorMiddleware);

module.exports = app
