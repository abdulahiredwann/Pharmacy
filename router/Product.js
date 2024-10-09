const express = require("express");
const router = express.Router();
const multer = require("multer");
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware
const pool = require("../Model/database"); // Assuming you've exported your pool from your main server file

// Set up Multer storage configuration for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the folder where the images will be saved
    cb(null, "./upload/Products");
  },
  filename: function (req, file, cb) {
    // Save the file with a timestamp and its original name
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

// Get all products (No auth required)
router.get("/", async (req, res) => {
  try {
    const query = "SELECT * FROM products"; // Replace products with your actual table name
    pool.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching products:", err);
        return res.status(500).send("Server Error");
      }

      res.status(200).json(results);
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server Error");
  }
});

// Post a new Product (Auth and admin required)
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

    const createQuery =
      "INSERT INTO products (title, description, imgUrl) VALUES (?, ?, ?)"; // Replace products with your actual table name
    pool.query(createQuery, [title, description, imgUrl], (err, result) => {
      if (err) {
        console.error("Error creating product:", err);
        return res.status(500).send("Server Error");
      }
      res.status(201).json({
        message: "Product created successfully",
        product: { id: result.insertId, title, description, imgUrl },
      });
    });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send("Server Error");
  }
});

// Update a Product (Auth and admin required)
router.put(
  "/update/:id",

  upload.single("imgUrl"),
  async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send("Title and description are required!");
    }
    const imgUrl = req.file ? req.file.path : null;

    try {
      const findQuery = "SELECT * FROM products WHERE id = ?"; // Replace products with your actual table name
      pool.query(findQuery, [id], (err, results) => {
        if (err) {
          console.error("Error finding product:", err);
          return res.status(500).send("Server Error");
        }
        if (results.length === 0) {
          return res.status(404).send("Product not found");
        }

        const updateQuery =
          "UPDATE products SET title = ?, description = ?, imgUrl = ? WHERE id = ?"; // Replace products with your actual table name
        pool.query(
          updateQuery,
          [title, description, imgUrl || results[0].imgUrl, id],
          (err) => {
            if (err) {
              console.error("Error updating product:", err);
              return res.status(500).send("Server Error");
            }
            res.status(200).json({ message: "Product updated successfully" });
          }
        );
      });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Server Error");
    }
  }
);

// Delete a Product (Auth and admin required)
router.delete("/delete/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const deleteQuery = "DELETE FROM products WHERE id = ?"; // Replace products with your actual table name
    pool.query(deleteQuery, [id], (err) => {
      if (err) {
        console.error("Error deleting product:", err);
        return res.status(500).send("Server Error");
      }
      res.status(200).send("Product deleted successfully");
    });
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
