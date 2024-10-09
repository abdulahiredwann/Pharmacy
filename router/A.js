const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {
  registrationValidationSchema,
  validateLogin,
} = require("../Model/Admin");
const pool = require("../Model/database"); // Assuming you've exported your pool from your main server file

// Create admin
router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const { error } = registrationValidationSchema(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    // Check if the email already exists
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

// Login Admin
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const loginQuery = "SELECT * FROM Admin WHERE email = ?";
    pool.query(loginQuery, [email], async (err, results) => {
      if (err) {
        return res.status(500).send("Server Error");
      }
      if (results.length === 0) {
        return res.status(400).send("Email or Password is not Valid!");
      }

      const admin = results[0];
      const validatePassword = await bcrypt.compare(password, admin.password);
      if (!validatePassword) {
        return res.status(400).send("Email or Password is not Valid!");
      }

      const token = jwt.sign(
        { id: admin.id, email: admin.email, isAdmin: true },
        process.env.JWT_SECRET
      );
      res.status(200).send({ token });
    });
  } catch (error) {
    console.log("Error Logging in Admin: " + error);
    res.status(500).send("Server Error");
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
