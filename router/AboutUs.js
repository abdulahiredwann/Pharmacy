const express = require("express");
const router = express.Router();
const multer = require("multer");
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware
const pool = require("../Model/database"); // Assuming you've exported your pool from your main server file

// Get About Us information
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM AboutUs";
    pool.query(query, (err, results) => {
      if (err) {
        return res.status(500).send("Server Error");
      }
      if (results.length === 0) {
        return res.status(400).send("No About Us information found!");
      }
      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error fetching About Us information:", error);
    res.status(500).send("Server Error");
  }
});

// Setup multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/AboutUs");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Post About Us
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
      "INSERT INTO AboutUs (title, description, imgUrl) VALUES (?, ?, ?)";
    pool.query(createQuery, [title, description, imgUrl], (err, results) => {
      if (err) {
        console.error("Error creating About Us entry:", err);
        return res.status(500).send("Server Error");
      }
      res
        .status(201)
        .json({
          message: "About Us created successfully",
          aboutUs: { id: results.insertId, title, description, imgUrl },
        });
    });
  } catch (error) {
    console.error("Error creating About Us entry:", error);
    res.status(500).send("Server Error");
  }
});

// Update About Us
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
      const findQuery = "SELECT * FROM AboutUs WHERE id = ?";
      pool.query(findQuery, [id], (err, results) => {
        if (err) {
          return res.status(500).send("Server Error");
        }
        if (results.length === 0) {
          return res.status(404).send("About Us entry not found");
        }

        const updateQuery =
          "UPDATE AboutUs SET title = ?, description = ?, imgUrl = ? WHERE id = ?";
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
              console.error("Error updating About Us entry:", err);
              return res.status(500).send("Server Error");
            }
            res.status(200).json({ message: "About Us updated successfully" });
          }
        );
      });
    } catch (error) {
      console.error("Error updating About Us:", error);
      res.status(500).send("Server Error");
    }
  }
);

// Delete About Us
router.delete("/delete/:id", auth, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = "DELETE FROM AboutUs WHERE id = ?";
    pool.query(deleteQuery, [id], (err, results) => {
      if (err) {
        console.error("Error deleting About Us entry:", err);
        return res.status(500).send("Server Error");
      }
      if (results.affectedRows === 0) {
        return res.status(404).send("About Us entry not found");
      }
      res.status(200).send("About Us entry deleted successfully");
    });
  } catch (error) {
    console.error("Error deleting About Us entry:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
