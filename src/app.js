const express = require("express");
const app = express();

//global error handling

const dotenv = require("dotenv");
const connectDatabase = require("../config/database");
const errorMiddleware = require("../middlewares/errors");

//setting up config.env file variables
dotenv.config({ path: "./config/.env" });

//connect to database
connectDatabase();

//setUp body parser
app.use(express.json());

//Importing Routes
const jobs = require("./routes/jobs");

app.use("/api/v1", jobs);

//Middlewares to handle errors
app.use(errorMiddleware);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
