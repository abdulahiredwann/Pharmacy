const express = require("express");
const router = express.Router();
const pool = require("../Model/database"); // Import the pool from your db.js file
const multer = require("multer");
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware

// Set up Multer storage configuration for staff images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/Staff");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Get all staff members
router.get("/", async (req, res) => {
  try {
    const [staff] = await pool.promise().query("SELECT * FROM staff");

    res.status(200).json(staff);
  } catch (error) {
    console.error("Error fetching staff members:", error);
    res.status(500).send("Server Error");
  }
});

// Create new staff member
router.post("/", upload.single("imgUrl"), async (req, res) => {
  const { name, position, facebook, telegram } = req.body;

  if (!name || !position) {
    return res.status(400).send("Name and position are required!");
  }

  const imgUrl = req.file ? req.file.path : null;

  if (!imgUrl) {
    return res.status(400).send("Image file is required");
  }

  try {
    const [result] = await pool
      .promise()
      .query(
        "INSERT INTO staff (name, position, facebook, telegram, imgUrl) VALUES (?, ?, ?, ?, ?)",
        [name, position, facebook || "", telegram || "", imgUrl]
      );

    res.status(201).json({
      message: "Staff member created successfully",
      staffId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating staff member:", error);
    res.status(500).send("Server Error");
  }
});

// Update staff member by ID
router.put(
  "/update/:id",

  upload.single("imgUrl"),
  async (req, res) => {
    const { id } = req.params;
    const { name, position, facebook, telegram } = req.body;
    const imgUrl = req.file ? req.file.path : null;

    try {
      const [existingStaff] = await pool
        .promise()
        .query("SELECT * FROM staff WHERE id = ?", [id]);

      if (existingStaff.length === 0) {
        return res.status(404).send("Staff member not found");
      }

      await pool
        .promise()
        .query(
          "UPDATE staff SET name = ?, position = ?, facebook = ?, telegram = ?, imgUrl = ? WHERE id = ?",
          [
            name || existingStaff[0].name,
            position || existingStaff[0].position,
            facebook || existingStaff[0].facebook,
            telegram || existingStaff[0].telegram,
            imgUrl || existingStaff[0].imgUrl,
            id,
          ]
        );

      res.status(200).json({ message: "Staff member updated successfully" });
    } catch (error) {
      console.error("Error updating staff member:", error);
      res.status(500).send("Server Error");
    }
  }
);

// Delete staff member by ID
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.promise().query("DELETE FROM staff WHERE id = ?", [id]);
    res.status(200).send("Staff member deleted successfully");
  } catch (error) {
    console.error("Error deleting staff member:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
