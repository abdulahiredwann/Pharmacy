const express = require("express");
const router = express.Router();
const { PrismaClient } = require("@prisma/client");

const bcrypt = require("bcrypt");
// const _ = require("lodash");
const jwt = require("jsonwebtoken");
const {
  registrationValidationSchema,
  validateLogin,
} = require("../Model/Admin");

const prisma = new PrismaClient();

//Create admin

router.post("/", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const { error } = registrationValidationSchema(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const checkEmail = await prisma.admin.findUnique({
      where: { email },
    });

    if (checkEmail) {
      return res.status(400).send("Email Alredy Registred!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
      },
    });

    res.status(201).send("Admin Registred successfully ");
  } catch (error) {
    res.status(500).send("Server Error!");
    console.log("Error Registre Admin" + error);
  }
});

// Login Admin
router.use("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const { error } = validateLogin(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    if (!admin) {
      return res.status(400).send("Email or Password is not Valid!");
    }

    const validatePassword = await bcrypt.compare(password, admin.password);
    if (!validatePassword) {
      return res.status(400).send("Email or Password is not Valid!");
    }
    const token = jwt.sign(
      { id: admin.id, email: admin.email, isAdmin: true },
      process.env.JWT_SECRET
    );
    res.status(200).send({ token });
  } catch (error) {
    console.log("Error Login Admin" + error);
    res.status(500).send("Server Error");
  }
});

// Register new Admin by recent admin
router.post("/newadmin", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;
    const { error } = registrationValidationSchema(req.body);
    if (error) {
      return res.status(400).send(error.details[0].message);
    }

    const checkEmail = await prisma.admin.findUnique({
      where: { email },
    });

    if (checkEmail) {
      return res.status(400).send("Email Alredy Registred!");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const admin = await prisma.admin.create({
      data: {
        email,
        firstName,
        lastName,
        password: hashedPassword,
      },
    });

    res.status(201).send("Admin Registred successfully ");
  } catch (error) {
    res.status(500).send("Server Error!");
    console.log("Error Registre Admin" + error);
  }
});
module.exports = router;
