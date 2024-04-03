// routes/doctorRoute.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/UserModel");
const Doctor = require("../model/DoctorModel"); // Ensure correct capitalization
const verifyToken = require("../middleware/AuthMiddleware");

// doctor signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name, specialty } = req.body;

    // Check if a doctor with the same email already exists
    const existingDoctor = await Doctor.findOne({ email });
    if (existingDoctor) {
      return res.status(400).json({
        error: "Email already exists for a doctor",
        response: "failure",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new doctor
    const doctor = new Doctor({
      email,
      password: hashedPassword,
      name,
      specialty,
    });
    await doctor.save();

    // Generate JWT token
    const token = jwt.sign({ userId: doctor._id }, "your-secret-key");

    res.status(201).json({ token, response: "success", doctor });
  } catch (error) {
    res.status(400).json({ error: error.message, response: "failure" });
  }
});

// Route to get a doctor by ID
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const doctorId = req.params.id;
    const doctor = await Doctor.getDoctorById(doctorId);
    if (!doctor) {
      return res.status(404).json({ error: "Doctor not found" });
    }
    return res.status(200).json(doctor);
  } catch (error) {
    console.error("Error fetching doctor by ID:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// / Route to get all doctors
router.get("/", verifyToken,async (req, res) => {
  try {
    const doctors = await Doctor.getAllDoctors();
    return res.status(200).json(doctors);
  } catch (error) {
    console.error("Error fetching all doctors:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router; // Export the router
