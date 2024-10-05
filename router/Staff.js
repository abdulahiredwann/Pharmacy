const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware

// Get all staff
router.get("/", async (req, res) => {
  try {
    const staff = await prisma.staff.findMany();
    if (!staff || staff.length === 0) {
      return res.status(400).send("No staff members found!");
    }
    res.status(200).json(staff);
  } catch (error) {
    console.error("Error fetching staff members:", error);
    res.status(500).send("Server Error");
  }
});

// Create new staff member
router.post("/", auth, admin, async (req, res) => {
  const { name, position, facebook, telegram } = req.body;

  if (!name || !position) {
    return res.status(400).send("Name and position are required!");
  }

  try {
    const newStaff = await prisma.staff.create({
      data: {
        name,
        position,
        facebook: facebook || "", // Optional field, default to empty string if not provided
        telegram: telegram || "", // Optional field, default to empty string if not provided
      },
    });

    res
      .status(201)
      .json({ message: "Staff member created successfully", newStaff });
  } catch (error) {
    console.error("Error creating staff member:", error);
    res.status(500).send("Server Error");
  }
});

// Update staff member by ID
router.put("/update/:id", auth, admin, async (req, res) => {
  const { id } = req.params;
  const { name, position, facebook, telegram } = req.body;

  if (!name || !position) {
    return res.status(400).send("Name and position are required!");
  }

  try {
    const staff = await prisma.staff.findUnique({
      where: { id: parseInt(id) },
    });

    if (!staff) {
      return res.status(404).send("Staff member not found");
    }

    const updatedStaff = await prisma.staff.update({
      where: { id: parseInt(id) },
      data: {
        name: name || staff.name,
        position: position || staff.position,
        facebook: facebook || staff.facebook,
        telegram: telegram || staff.telegram,
      },
    });

    res
      .status(200)
      .json({ message: "Staff member updated successfully", updatedStaff });
  } catch (error) {
    console.error("Error updating staff member:", error);
    res.status(500).send("Server Error");
  }
});

// Delete staff member by ID
router.delete("/delete/:id", auth, admin, async (req, res) => {
  const { id } = req.params;

  try {
    await prisma.staff.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).send("Staff member deleted successfully");
  } catch (error) {
    console.error("Error deleting staff member:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
