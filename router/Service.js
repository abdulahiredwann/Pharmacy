const express = require("express");
const router = express.Router();
const pool = require("../Model/database"); // Import the pool from your db.js file
const multer = require("multer");
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware

// Set up Multer storage configuration for service images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/Services");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

// Get all services
router.get("/", async (req, res) => {
  try {
    const [services] = await pool.promise().query("SELECT * FROM Service");

    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).send("Server Error");
  }
});

// Post a new Service
router.post("/", upload.single("imgUrl"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send("Title and description are required!");
    }
    const imgUrl = req.file ? req.file.path : null;

    if (!imgUrl) {
      return res.status(400).send("Image file is required");
    }

    const [result] = await pool
      .promise()
      .query(
        "INSERT INTO Service (title, description, imgUrl) VALUES (?, ?, ?)",
        [title, description, imgUrl]
      );

    res.status(201).json({
      message: "Service created successfully",
      serviceId: result.insertId,
    });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).send("Server Error");
  }
});

// Update a Service
router.put(
  "/update/:id",

  upload.single("imgUrl"),
  async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const imgUrl = req.file ? req.file.path : null;

    try {
      const [existingService] = await pool
        .promise()
        .query("SELECT * FROM Service WHERE id = ?", [id]);

      if (existingService.length === 0) {
        return res.status(404).send("Service not found");
      }

      await pool
        .promise()
        .query(
          "UPDATE Service SET title = ?, description = ?, imgUrl = ? WHERE id = ?",
          [
            title || existingService[0].title,
            description || existingService[0].description,
            imgUrl || existingService[0].imgUrl,
            id,
          ]
        );

      res.status(200).json({ message: "Service updated successfully" });
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).send("Server Error");
    }
  }
);

// Delete a Service
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    await pool.promise().query("DELETE FROM Service WHERE id = ?", [id]);
    res.status(200).send("Service deleted successfully");
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
