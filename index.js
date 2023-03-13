const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();
mongoose.connect(`${process.env.DB_URL}`);
const con = mongoose.connection;
con.on("open", () => {
  console.log("Database connected successfully...");
});
con.on("error", () => {
  console.log("error in connecting...");
});
app.use(express.json());
const router = require("./routes");
app.use("/api", router);

app.listen(6000, () => {
  console.log(`server is running in port ${process.env.PORT_NUMBER}`);
});
