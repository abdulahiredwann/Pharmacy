const express = require("express");
const router = express.Router();
const Joi = require("joi"); // Import Joi for validation
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware
const pool = require("../Model/database"); // Assuming you've exported your pool from your main server file

// Joi validation schema for Message
const messageValidationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(9).required(), // Ensures phone is a number and between 10-15 digits
  message: Joi.string().min(5).max(500).required(),
});

// Get all messages (No auth required)
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM messages"; // Replace messages with your actual table name
    pool.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching messages:", err);
        return res.status(500).send("Server Error");
      }
      if (!results || results.length === 0) {
        return res.status(400).send("No messages found!");
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Server Error");
  }
});

// Create a new message (Auth and admin required)
router.post("/", auth, async (req, res) => {
  const { name, email, phone, message } = req.body;

  // Validate the request body using Joi
  const { error } = messageValidationSchema.validate({
    name,
    email,
    phone,
    message,
  });
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const createQuery =
      "INSERT INTO messages (name, email, phone, message) VALUES (?, ?, ?, ?)"; // Replace messages with your actual table name
    pool.query(createQuery, [name, email, phone, message], (err) => {
      if (err) {
        console.error("Error creating message:", err);
        return res.status(500).send("Server Error");
      }
      res.status(201).send("Message created successfully");
    });
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).send("Server Error");
  }
});

// Update a message by ID (Auth and admin required)
router.put("/update/:id", auth, admin, async (req, res) => {
  const { id } = req.params;
  const { name, email, phone, message } = req.body;

  // Validate the request body using Joi
  const { error } = messageValidationSchema.validate({
    name,
    email,
    phone,
    message,
  });
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const findQuery = "SELECT * FROM messages WHERE id = ?"; // Replace messages with your actual table name
    pool.query(findQuery, [id], (err, results) => {
      if (err) {
        console.error("Error finding message:", err);
        return res.status(500).send("Server Error");
      }
      if (results.length === 0) {
        return res.status(404).send("Message not found");
      }

      const updateQuery =
        "UPDATE messages SET name = ?, email = ?, phone = ?, message = ? WHERE id = ?"; // Replace messages with your actual table name
      pool.query(updateQuery, [name, email, phone, message, id], (err) => {
        if (err) {
          console.error("Error updating message:", err);
          return res.status(500).send("Server Error");
        }
        res.status(200).send("Message updated successfully");
      });
    });
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).send("Server Error");
  }
});

// Delete a message by ID (Auth and admin required)
router.delete("/delete/:id", auth, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = "DELETE FROM messages WHERE id = ?"; // Replace messages with your actual table name
    pool.query(deleteQuery, [id], (err) => {
      if (err) {
        console.error("Error deleting message:", err);
        return res.status(500).send("Server Error");
      }
      res.status(200).send("Message deleted successfully");
    });
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
