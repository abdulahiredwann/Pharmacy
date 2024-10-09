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

// Create a MySQL connection pool
const pool = mysql.createPool({
  host: "MYSQL8002.site4now.net",
  user: "aad665_abdred",
  password: "pirate47219930",
  database: "db_aad665_pharma",
  port: 3306,
  connectionLimit: 10, // Adjust as needed
});

// Route to check database connection
app.get("/checkdb", (req, res) => {
  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error connecting to Database: " + err.stack);
      return res.status(500).send("Error connecting to Database: " + err.stack);
    }
    res.send("Successfully connected to the Database!");

    connection.release(); // Release the connection back to the pool
  });
});

app.get("/", (req, res) => {
  res.send("Welcome to Nebel Dental Clinic! We are here to serve you.");
});

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
