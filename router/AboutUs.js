const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const multer = require("multer");
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware

const prisma = new PrismaClient();

// Use the auth middleware for all routes
router.use(auth); // This will apply the auth middleware to all subsequent routes

// Get About Us information
router.get("/", async (req, res) => {
  try {
    const aboutus = await prisma.aboutUs.findMany();
    if (!aboutus || aboutus.length === 0) {
      return res.status(400).send("No About Us information found!");
    }
    res.status(200).json(aboutus);
  } catch (error) {
    console.error("Error fetching About Us information:", error);
    res.status(500).send("Server Error");
  }
});

// Post About Us
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./upload/AboutUs");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
const upload = multer({ storage: storage });

// Apply admin middleware for POST, PUT, DELETE routes
router.post("/", admin, upload.single("imgUrl"), async (req, res) => {
  try {
    const { title, description } = req.body;
    if (!title || !description) {
      return res.status(400).send("Require title and description!");
    }
    const imgUrl = req.file ? req.file.path : null; // Get the file path if uploaded

    if (!imgUrl) {
      return res.status(400).send("Image file is required");
    }

    const aboutUs = await prisma.aboutUs.create({
      data: {
        title,
        description,
        imgUrl, // Store the image URL/path in the database
      },
    });

    res.status(201).json({ message: "About Us created successfully", aboutUs });
  } catch (error) {
    console.error("Error creating About Us entry:", error);
    res.status(500).send("Server Error");
  }
});

// Update About Us
router.put("/update/:id", admin, upload.single("imgUrl"), async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  if (!title || !description) {
    return res.status(400).send("Require title and description!");
  }
  const imgUrl = req.file ? req.file.path : null;

  try {
    const aboutUs = await prisma.aboutUs.findUnique({
      where: { id: parseInt(id) },
    });
    if (!aboutUs) {
      return res.status(404).send("About Us entry not found");
    }

    const updatedAboutUs = await prisma.aboutUs.update({
      where: { id: parseInt(id) },
      data: {
        title: title || aboutUs.title,
        description: description || aboutUs.description,
        imgUrl: imgUrl || aboutUs.imgUrl,
      },
    });

    res.status(200).json({
      message: "About Us updated successfully",
      updatedAboutUs,
    });
  } catch (error) {
    console.error("Error updating About Us:", error);
    res.status(500).send("Server Error");
  }
});

// Delete About Us
router.delete("/delete/:id", admin, async (req, res) => {
  const { id } = req.params;

  try {
    const aboutUsEntry = await prisma.aboutUs.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).send("About Us entry deleted successfully");
  } catch (error) {
    console.error("Error deleting About Us entry:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
