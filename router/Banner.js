const express = require("express");
const router = express.Router();
const multer = require("multer");
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware
const pool = require("../Model/database"); // Assuming you've exported your pool from your main server file

// Get all Banners (no middleware applied here)
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM Banner";
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).send("Server Error");
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error fetching banners:", error);
    res.status(500).send("Server Error");
  }
});

// Set up Multer storage configuration for banner images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/Banners");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

// Post a new Banner (using auth and admin middleware)
router.post("/", auth, admin, upload.single("imgUrl"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send("Require title and description!");
    }
    const imgUrl = req.file ? req.file.path : null;

    if (!imgUrl) {
      return res.status(400).send("Image file is required");
    }

    const createQuery =
      "INSERT INTO Banner (title, description, imgUrl) VALUES (?, ?, ?)";
    pool.query(createQuery, [title, description, imgUrl], (err, results) => {
      if (err) {
        console.error("Error creating Banner entry:", err);
        return res.status(500).send("Server Error");
      }
      res.status(201).json({
        message: "Banner created successfully",
        banner: { id: results.insertId, title, description, imgUrl },
      });
    });
  } catch (error) {
    console.error("Error creating Banner entry:", error);
    res.status(500).send("Server Error");
  }
});

// Update a Banner (using auth and admin middleware)
router.put(
  "/update/:id",
  auth,
  admin,
  upload.single("imgUrl"),
  async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    const imgUrl = req.file ? req.file.path : null;

    if (!title || !description) {
      return res.status(400).send("Require title and description!");
    }

    try {
      const findQuery = "SELECT * FROM Banner WHERE id = ?";
      pool.query(findQuery, [id], (err, results) => {
        if (err) {
          return res.status(500).send("Server Error");
        }
        if (results.length === 0) {
          return res.status(404).send("Banner not found");
        }

        const updateQuery =
          "UPDATE Banner SET title = ?, description = ?, imgUrl = ? WHERE id = ?";
        pool.query(
          updateQuery,
          [
            title || results[0].title,
            description || results[0].description,
            imgUrl || results[0].imgUrl,
            id,
          ],
          (err, results) => {
            if (err) {
              console.error("Error updating Banner entry:", err);
              return res.status(500).send("Server Error");
            }
            res.status(200).json({ message: "Banner updated successfully" });
          }
        );
      });
    } catch (error) {
      console.error("Error updating Banner:", error);
      res.status(500).send("Server Error");
    }
  }
);

// Delete a Banner (using auth and admin middleware)
router.delete("/delete/:id", auth, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = "DELETE FROM Banner WHERE id = ?";
    pool.query(deleteQuery, [id], (err, results) => {
      if (err) {
        console.error("Error deleting Banner entry:", err);
        return res.status(500).send("Server Error");
      }
      if (results.affectedRows === 0) {
        return res.status(404).send("Banner entry not found");
      }
      res.status(200).send("Banner deleted successfully");
    });
  } catch (error) {
    console.error("Error deleting Banner entry:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
