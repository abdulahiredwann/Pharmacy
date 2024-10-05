const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const multer = require("multer");
const { auth, admin } = require("../Middleware/Admin"); // Import your middleware

// Get all services
router.get("/", async (req, res) => {
  try {
    const services = await prisma.service.findMany();
    if (!services || services.length === 0) {
      return res.status(400).send("No services found!");
    }
    res.status(200).json(services);
  } catch (error) {
    console.error("Error fetching services:", error);
    res.status(500).send("Server Error");
  }
});

// Set up Multer storage configuration for service images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Specify the folder where the images will be saved
    cb(null, "./upload/Services");
  },
  filename: function (req, file, cb) {
    // Save the file with its original name, or you can customize it
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// Initialize multer with the defined storage configuration
const upload = multer({ storage: storage });

// Post a new Service
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

    const service = await prisma.service.create({
      data: {
        title,
        description,
        imgUrl,
      },
    });

    res.status(201).json({ message: "Service created successfully", service });
  } catch (error) {
    console.error("Error creating service:", error);
    res.status(500).send("Server Error");
  }
});

// Update a Service
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
      const service = await prisma.service.findUnique({
        where: { id: parseInt(id) },
      });
      if (!service) {
        return res.status(404).send("Service not found");
      }

      const updatedService = await prisma.service.update({
        where: { id: parseInt(id) },
        data: {
          title: title || service.title,
          description: description || service.description,
          imgUrl: imgUrl || service.imgUrl,
        },
      });

      res
        .status(200)
        .json({ message: "Service updated successfully", updatedService });
    } catch (error) {
      console.error("Error updating service:", error);
      res.status(500).send("Server Error");
    }
  }
);

// Delete a Service
router.delete("/delete/:id", auth, admin, async (req, res) => {
  const { id } = req.params;

  try {
    const service = await prisma.service.delete({
      where: { id: parseInt(id) },
    });

    res.status(200).send("Service deleted successfully");
  } catch (error) {
    console.error("Error deleting service:", error);
    res.status(500).send("Server Error");
  }
});

module.exports = router;
