const express = require("express");
const router = express.Router();
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware
const pool = require("../Model/database"); // Assuming you've exported your pool from your main server file
const Joi = require("joi"); // Import Joi for validation

// Joi validation schema for Info
const infoValidationSchema = Joi.object({
  location: Joi.string().min(3).required(), // Location should be a non-empty string with at least 3 characters
  phoneNumber: Joi.string().min(9).required(), // Ensures phone number is a number and between 10-15 digits
});

// Use the auth middleware for all routes

// Get all info entries
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM Info"; // Replace Info with your actual table name
    pool.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching info entries:", err);
        return res.status(500).send("Server Error");
      }
      if (results.length === 0) {
        return res.status(400).send("No info entries found!");
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error fetching info entries:", error);
    res.status(500).send("Server Error");
  }
});

// Create a new info entry
router.post("/", async (req, res) => {
  const { location, phoneNumber } = req.body;

  // Validate the request body using Joi
  const { error } = infoValidationSchema.validate({ location, phoneNumber });
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const createQuery =
      "INSERT INTO Info (location, phoneNumber) VALUES (?, ?)"; // Replace Info with your actual table name
    pool.query(createQuery, [location, phoneNumber], (err, results) => {
      if (err) {
        // Handle unique constraint error for phoneNumber
        if (err.code === "ER_DUP_ENTRY") {
          return res.status(400).send("Phone number already exists.");
        }
        console.error("Error creating info entry:", err);
        return res.status(500).send("Server Error");
      }
      res.status(201).json({
        message: "Info entry created successfully",
        newInfo: { id: results.insertId, location, phoneNumber },
      });
    });
  } catch (error) {
    console.error("Error creating info entry:", error);
    res.status(500).send("Server Error");
  }
});

// Update an info entry by ID
router.put("/update/:id", async (req, res) => {
  const { id } = req.params;
  const { location, phoneNumber } = req.body;

  // Validate the request body using Joi
  const { error } = infoValidationSchema.validate({ location, phoneNumber });
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const findQuery = "SELECT * FROM Info WHERE id = ?"; // Replace Info with your actual table name
    pool.query(findQuery, [id], (err, results) => {
      if (err) {
        console.error("Error finding info entry:", err);
        return res.status(500).send("Server Error");
      }
      if (results.length === 0) {
        return res.status(404).send("Info entry not found");
      }

      const updateQuery =
        "UPDATE Info SET location = ?, phoneNumber = ? WHERE id = ?"; // Replace Info with your actual table name
      pool.query(updateQuery, [location, phoneNumber, id], (err) => {
        if (err) {
          // Handle unique constraint error for phoneNumber
          if (err.code === "ER_DUP_ENTRY") {
            return res.status(400).send("Phone number already exists.");
          }
          console.error("Error updating info entry:", err);
          return res.status(500).send("Server Error");
        }
        res.status(200).json({ message: "Info entry updated successfully" });
      });
    });
  } catch (error) {
    console.error("Error updating info entry:", error);
    res.status(500).send("Server Error");
  }
});

// Delete an info entry by ID
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = "DELETE FROM Info WHERE id = ?"; // Replace Info with your actual table name
    pool.query(deleteQuery, [id], (err, results) => {
      if (err) {
        console.error("Error deleting info entry:", err);
        return res.status(500).send("Server Error");
      }
      if (results.affectedRows === 0) {
        return res.status(404).send("Info entry not found");
      }
      res.status(200).send("Info entry deleted successfully");
    });
  } catch (error) {
    console.error("Error deleting info entry:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
