const mongoose = require("mongoose");
require("dotenv").config();
const connectDatabase = () => {
  mongoose
    .connect(process.env.DB_URI, {
      useUnifiedTopology: true,
    })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    });
};

module.exports = connectDatabase;
