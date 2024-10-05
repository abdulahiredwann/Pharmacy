require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const mysql = require("mysql2");
const path = require("path");
const admin = require("./router/Admin");
const aboutUs = require("./router/AboutUs");
const banner = require("./router/Banner");
const product = require("./router/Product");
const service = require("./router/Service");
const staff = require("./router/Staff");
const message = require("./router/Message");
const info = require("./router/Info");

app.use("/upload", express.static(path.join(__dirname, "upload")));
app.use(express.static("public"));

app.use(cors());
app.use(express.json());

// const connection = mysql.createConnection({
//   host: "MYSQL8002.site4now.net", // The server hosting your MySQL DB
//   user: "aad665_abedb", // Your database username
//   password: "ABEDB@2024", // Your database password
//   database: "db_aad665_abedb", // The database name
// });
// connection.connect((err) => {
//   if (err) {
//     console.error("Error connecting to Database: " + err.stack);
//     return;
//   }
//   console.log("Connected to DB ");
// });

app.use("/api/admin", admin);
app.use("/api/aboutus", aboutUs);
app.use("/api/banner", banner);
app.use("/api/product", product);
app.use("/api/service", service);
app.use("/api/staff", staff);
app.use("/api/message", message);
app.use("/api/info", info);

app.listen(3000, () => {
  console.log("Servier Listening 3000");
});
