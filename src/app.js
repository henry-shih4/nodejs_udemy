const express = require("express");
const app = express();

//global error handling

const dotenv = require("dotenv");
const connectDatabase = require("../config/database");
const errorMiddleware = require("../middlewares/errors");
const ErrorHandler = require("./utils/errorHandler");

//setting up config.env file variables
dotenv.config({ path: "./config/.env" });

//Handing uncaught exception error
process.on("uncaughtException", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Server shutting down due to uncaught exception");
  process.exit(1);
});

//connect to database
connectDatabase();

//setUp body parser
app.use(express.json());

//Importing Routes
const jobs = require("./routes/jobs");

app.use("/api/v1", jobs);

//Handle unhandled routes *make sure under app.use
app.all("*", (req, res, next) => {
  next(new ErrorHandler(`${req.originalUrl}, route not found`, 404));
});

//Middlewares to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT;

const server = app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
});

//handling unhandled promise rejection
process.on("unhandledRejection", (err) => {
  console.log(`Error: ${err.message}`);
  console.log("Shutting down server due to unhandled promise rejection");
  server.close(() => {
    process.exit(1);
  });
});
/////////
