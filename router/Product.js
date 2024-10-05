const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware

// Get all products
router.get("/", async (req, res) => {
  try {
    const products = await prisma.product.findMany();
    if (!products || products.length === 0) {
      return res.status(400).send("No products found!");
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).send("Server Error");
  }
});

// Set up Multer storage configuration for product images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the folder where the images will be saved
    cb(null, "./upload/Products");
  },
  filename: function (req, file, cb) {
    // Save the file with its original name, or you can customize it
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

// Post a new Product
router.post("/", auth, admin, upload.single("imgUrl"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send("Title and description are required!");
    }
    const imgUrl = req.file ? req.file.path : null;

    if (!imgUrl) {
      return res.status(400).send("Image file is required");
    }

    const product = await prisma.product.create({
      data: {
        title,
        description,
        imgUrl,
      },
    });

    res.status(201).json({ message: "Product created successfully", product });
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).send("Server Error");
  }
});

// Update a Product
router.put(
  "/update/:id",
  auth,
  admin,
  upload.single("imgUrl"),
  async (req, res) => {
    const { id } = req.params;
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send("Title and description are required!");
    }
    const imgUrl = req.file ? req.file.path : null;

    try {
      const product = await prisma.product.findUnique({
        where: { id: parseInt(id) },
      });
      if (!product) {
        return res.status(404).send("Product not found");
      }

      const updatedProduct = await prisma.product.update({
        where: { id: parseInt(id) },
        data: {
          title: title || product.title,
          description: description || product.description,
          imgUrl: imgUrl || product.imgUrl,
        },
      });

      res
        .status(200)
        .json({ message: "Product updated successfully", updatedProduct });
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).send("Server Error");
    }
  }
);

// Delete a Product
router.delete("/delete/:id", auth, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const product = await prisma.product.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).send("Product deleted successfully");
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
