const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const crypto = require("crypto");
const User = require("./models/user.model");
const Todo = require("./models/todo.model");
const cors = require("cors");
const jwt = require("jsonwebtoken");
const moment = require("moment");


require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((error) => {
    console.log("Error connection to mongoDb", error);
  });

app.listen(port, () => {
  console.log("Server is running on port 3000");
});

