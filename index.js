if(process.env.NODE_ENV !== "production"){
    require("dotenv").config();
}

const config = require("./Config/config");
const express = require("express");
const mongoose = require("mongoose");

const app = express();

const indexRoute = require("./routes/index");
const usersRoute = require("./routes/users.js");

const MONGO_DB = config.MONGO_DB;
// const DB = process.env.MONGO_DB || MONGO_DB;
const DB = process.env.MONGO_URI1

mongoose.connect(DB)
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

const { API_PORT } = process.env;
const PORT = process.env.PORT || API_PORT;

app.listen(PORT, () => {
    console.log(`Server started at port: ${PORT}`);
})