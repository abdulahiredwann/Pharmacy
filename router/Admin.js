const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  registrationValidationSchema,
  validateLogin,
} = require("../Model/Admin");
const pool = require("../Model/database"); // Assuming you've exported your pool from your main server file

// Login Admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = validateLogin(req.body);

    // If validation fails
    if (error) {
      return res.status(400).json({
        status: "error",
        message: error.details[0].message,
      });
    }

    const loginQuery = "SELECT * FROM Admin WHERE email = ?";
    pool.query(loginQuery, [email], async (err, results) => {
      // If there is a database error
      if (err) {
        return res.status(500).json({
          status: "error",
          message: "Server Error",
        });
      }

      // If no admin found with the given email
      if (results.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "Email or Password is not Valid!",
        });
      }

      const admin = results[0];
      // Validate the password
      const validatePassword = await bcrypt.compare(password, admin.password);

      // If password is incorrect
      if (!validatePassword) {
        return res.status(400).json({
          status: "error",
          message: "Email or Password is not Valid!",
        });
      }

      // Generate token on successful login
      const token = jwt.sign(
        { id: admin.id, email: admin.email, isAdmin: true },
        process.env.JWT_SECRET
      );
      res.status(200).json({
        status: "success",
        token,
      });
    });
  } catch (error) {
    console.error("Error Logging in Admin: ", error);
    res.status(500).json({
      status: "error",
      message: "Server Error",
    });
  }
});
// Register new Admin by recent admin
router.post("/newadmin", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const { error } = registrationValidationSchema(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const checkEmailQuery = "SELECT * FROM Admin WHERE email = ?";
    pool.query(checkEmailQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).send("Server Error!");
      }
      if (results.length > 0) {
        return res.status(400).send("Email Already Registered!");
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const createAdminQuery = `
        INSERT INTO Admin (firstName, lastName, email, password) 
        VALUES (?, ?, ?, ?)`;
      pool.query(
        createAdminQuery,
        [firstName, lastName, email, hashedPassword],
        (err, results) => {
          if (err) {
            return res.status(500).send("Server Error!");
          }
          res.status(201).send("Admin Registered successfully");
        }
      );
    });
  } catch (error) {
    res.status(500).send("Server Error!");
    console.log("Error Registering Admin: " + error);
  }
});

module.exports = router;
