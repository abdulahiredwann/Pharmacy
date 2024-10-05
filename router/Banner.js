const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware

// Use the auth middleware for all routes
router.use(auth); // This will apply the auth middleware to all subsequent routes

// Get all Banners
router.get("/", async (req, res) => {
  try {
    const banners = await prisma.banner.findMany();
    if (!banners || banners.length === 0) {
      return res.status(400).send("No banners found!");
    }
    res.status(200).json(banners);
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

// Post a new Banner
router.post("/", admin, upload.single("imgUrl"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send("Require title and description!");
    }
    const imgUrl = req.file ? req.file.path : null;

    if (!imgUrl) {
      return res.status(400).send("Image file is required");
    }

    const banner = await prisma.banner.create({
      data: {
        title,
        description,
        imgUrl,
      },
    });

    res.status(201).json({ message: "Banner created successfully", banner });
  } catch (error) {
    console.error("Error creating Banner entry:", error);
    res.status(500).send("Server Error");
  }
});

// Update a Banner
router.put("/update/:id", admin, upload.single("imgUrl"), async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).send("Require title and description!");
  }
  const imgUrl = req.file ? req.file.path : null;

  try {
    const banner = await prisma.banner.findUnique({
      where: { id: parseInt(id) },
    });
    if (!banner) {
      return res.status(404).send("Banner not found");
    }

    const updatedBanner = await prisma.banner.update({
      where: { id: parseInt(id) },
      data: {
        title: title || banner.title,
        description: description || banner.description,
        imgUrl: imgUrl || banner.imgUrl,
      },
    });

    res
      .status(200)
      .json({ message: "Banner updated successfully", updatedBanner });
  } catch (error) {
    console.error("Error updating Banner entry:", error);
    res.status(500).send("Server Error");
  }
});

// Delete a Banner
router.delete("/delete/:id", admin, async (req, res) => {
  const { id } = req.params;

  try {
    const bannerEntry = await prisma.banner.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).send("Banner deleted successfully");
  } catch (error) {
    console.error("Error deleting Banner entry:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
