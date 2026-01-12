const express = require("express");
const app = express();
const errorMiddleware = require("./middlewares/error");
const cookieParser = require("cookie-parser");
const cors = require("cors");

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

const webRoutes = require("./routes/web");
app.use("/api/v1", webRoutes);
app.use(errorMiddleware);

module.exports = app;
