const express = require("express");
const app = express();

//global error handling

const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");
const fileUpload = require("express-fileupload");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xssClean = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");

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

//Setup security headers
app.use(helmet());

//setUp body parser
app.use(express.json());

//Set cookie parser
app.use(cookieParser());

//handle file upload
app.use(fileUpload());

//sanitize data
app.use(mongoSanitize());

//prevent XSS attacks
app.use(xssClean());

//prevent parameter pollution
app.use(
  hpp({
    whitelist: ["positions"],
  })
);

//rate limiting
const limiter = rateLimit({
  windowsMs: 10 * 60 * 1000, //10 min
  max: 100,
});
app.use(limiter);

//setting up cors - access from other domains
app.use(cors());

//Importing Routes
const jobs = require("./routes/jobs");
const auth = require("./routes/auth");
const user = require("./routes/user");
app.use("/api/v1", jobs);
app.use("/api/v1", auth);
app.use("/api/v1", user);

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

app.get("/", (req, res) => res.send("Welcome to Job API"));
