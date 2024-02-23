const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const databaseConnection = require("./config/database")
const errorMiddleware = require("./middleware/error")
const path = require("path")
const cors = require("cors")
// database connection
databaseConnection();


app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
const configCors = {
    origin: [`http://localhost:3002`, 'https://backend-lovat-beta.vercel.app','http://localhost:3000', "http://192.168.1.74:8081", 'http://192.168.101.36:3002', 'http://192.168.101.36:3000'],
    credentials: true,
    
  }
  
app.use(cors(configCors))

// Route Imports
const user = require("./routes/userRoute");
const book = require("./routes/bookRoute");
const rating = require('./routes/like-ratingRoute')
const purchase = require("./routes/payment-purchaseRoute")
const uploadRoute = require("./routes/fileUploadRoute")
const cupon = require("./routes/couponRoute")
const cart = require("./routes/cartRoute")
const report = require("./routes/reportRoute")

app.use("/api/v1", user);
app.use("/api/v1",book);
app.use("/api/v1" , rating);
app.use("/api/v1" , purchase)
app.use("/api/v1" , uploadRoute)
app.use("/api/v1" , cupon)
app.use("/api/v1" , cart)
app.use("/api/v1" , report)
// Middleware for Errors
app.use(errorMiddleware);

module.exports = app;

 
 

 





  
