const express = require("express");
const app = express();
const dotenv = require("dotenv");
const connectDatabase = require("../config/database");

//setting up config.env file variables
dotenv.config({ path: "./config/.env" });

//connect to database
connectDatabase();

//setUp body parser
app.use(express.json());


//Importing Routes
const jobs = require("./routes/jobs");

app.use("/api/v1", jobs);

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT} in ${process.env.NODE_ENV} mode`);
});
