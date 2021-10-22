require("dotenv").config;

const express = require("express");
const mongoose = require("mongoose");

const app = express();

const indexRoute = require("./routes/index");
const usersRoute = require("./routes/users.js");

const PORT = 3000

mongoose.connect("mongodb://localhost:27017/cryptoTransact")
.then(() => {
    console.log("Mongodb connected");
})
.catch(err => {
    console.error("Failed to connect: " + err);
})

// middelware
app.use(express.json());
app.use("/", indexRoute);
app.use("/v1", usersRoute);

app.listen(3000, () => {
    console.log(`Server started at port: ${process.env.PORT}`);
})