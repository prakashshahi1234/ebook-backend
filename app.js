const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const databaseConnection = require("./config/database")
const errorMiddleware = require("./middleware/error")
  

// database connection
databaseConnection();




app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));

// Route Imports
const user = require("./routes/userRoute");
const book = require("./routes/bookRoute");

app.use("/api/v1", user);
app.use("/api/v1",book)



// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;