const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const Joi = require("joi"); // Import Joi for validation
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware
const prisma = new PrismaClient();

// Joi validation schema for Info
const infoValidationSchema = Joi.object({
  location: Joi.string().min(3).required(), // Location should be a non-empty string with at least 3 characters
  phoneNumber: Joi.string().min(9).required(), // Ensures phone number is a number and between 10-15 digits
});

// Use the auth middleware for all routes
router.use(auth); // Apply auth middleware to all routes

// Get all info entries
router.get("/", async (req, res) => {
  try {
    const infoEntries = await prisma.info.findMany();
    if (!infoEntries || infoEntries.length === 0) {
      return res.status(400).send("No info entries found!");
    }
    res.status(200).json(infoEntries);
  } catch (error) {
    console.error("Error fetching info entries:", error);
    res.status(500).send("Server Error");
  }
});

// Create a new info entry
router.post("/", admin, async (req, res) => {
  const { location, phoneNumber } = req.body;

  // Validate the request body using Joi
  const { error } = infoValidationSchema.validate({ location, phoneNumber });
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const newInfo = await prisma.info.create({
      data: {
        location,
        phoneNumber,
      },
    });

    res
      .status(201)
      .json({ message: "Info entry created successfully", newInfo });
  } catch (error) {
    // Handle unique constraint error for phoneNumber
    if (error.code === "P2002") {
      return res.status(400).send("Phone number already exists.");
    }
    console.error("Error creating info entry:", error);
    res.status(500).send("Server Error");
  }
});

// Update an info entry by ID
router.put("/update/:id", admin, async (req, res) => {
  const { id } = req.params;
  const { location, phoneNumber } = req.body;

  // Validate the request body using Joi
  const { error } = infoValidationSchema.validate({ location, phoneNumber });
  if (error) {
    return res.status(400).send(error.details[0].message);
  }

  try {
    const existingInfo = await prisma.info.findUnique({
      where: { id: parseInt(id) },
    });

    if (!existingInfo) {
      return res.status(404).send("Info entry not found");
    }

    const updatedInfo = await prisma.info.update({
      where: { id: parseInt(id) },
      data: {
        location,
        phoneNumber,
      },
    });

    res
      .status(200)
      .json({ message: "Info entry updated successfully", updatedInfo });
  } catch (error) {
    // Handle unique constraint error for phoneNumber
    if (error.code === "P2002") {
      return res.status(400).send("Phone number already exists.");
    }
    console.error("Error updating info entry:", error);
    res.status(500).send("Server Error");
  }
});

// Delete an info entry by ID
router.delete("/delete/:id", admin, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.info.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).send("Info entry deleted successfully");
  } catch (error) {
    console.error("Error deleting info entry:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
