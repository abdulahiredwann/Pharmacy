const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const Joi = require("joi"); // Import Joi for validation
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware
const prisma = new PrismaClient();

// Joi validation schema for Message
const messageValidationSchema = Joi.object({
  name: Joi.string().min(3).max(100).required(),
  email: Joi.string().email().required(),
  phone: Joi.string().min(9).required(), // Ensures phone is a number and between 10-15 digits
  message: Joi.string().min(5).max(500).required(),
});

// Use the auth middleware for all routes
router.use(auth); // Apply auth middleware to all routes

// Get all messages
router.get("/", admin, async (req, res) => {
  // Only admins can access this route
  try {
    const messages = await prisma.message.findMany();
    if (!messages || messages.length === 0) {
      return res.status(400).send("No messages found!");
    }
    res.status(200).json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).send("Server Error");
  }
});

// Create a new message
router.post("/", async (req, res) => {
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
    const newMessage = await prisma.message.create({
      data: {
        name,
        email,
        phone,
        message,
      },
    });

    res.status(201).send("Message created successfully");
  } catch (error) {
    console.error("Error creating message:", error);
    res.status(500).send("Server Error");
  }
});

// Update a message by ID
router.put("/update/:id", admin, async (req, res) => {
  // Only admins can update messages
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
    const existingMessage = await prisma.message.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingMessage) {
      return res.status(404).send("Message not found");
    }

    const updatedMessage = await prisma.message.update({
      where: { id: parseInt(id) },
      data: {
        name,
        email,
        phone,
        message,
      },
    });

    res.status(200).send("Message updated successfully");
  } catch (error) {
    console.error("Error updating message:", error);
    res.status(500).send("Server Error");
  }
});

// Delete a message by ID
router.delete("/delete/:id", admin, async (req, res) => {
  // Only admins can delete messages
  const { id } = req.params;

  try {
    await prisma.message.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).send("Message deleted successfully");
  } catch (error) {
    console.error("Error deleting message:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
