// routes/auth.js
const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../model/UserModel");
const Doctor = require("../model/DoctorModel");
const Appointment = require("../model/AppointmentModel");
const verifyToken = require("../middleware/AuthMiddleware");

// User signup
router.post("/signup", async (req, res) => {
  try {
    const { email, password, role, name } = req.body;

    // Check if the role is 'doctor'
    if (role === 'doctor') {
      return res.status(400).json({
        error: "Doctors cannot register through this route",
        response: "failure",
      });
    }


    // Check if a user with the same email already exists for the current role
    const existingUser = await User.findOne({ email, role });
    if (existingUser) {
      return res.status(400).json({
        error: "Email already exists for this role",
        response: "failure",
      });
    }

    // Check if a user with the same email already exists for the other role
    const userWithOtherRole = await User.findOne({
      email,
      role: role === "patient" ? "doctor" : "patient",
    });
    if (userWithOtherRole) {
      return res.status(400).json({
        error: "Email already exists for the other role",
        response: "failure",
      });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new user
    const user = new User({ email, password: hashedPassword, role, name });
    await user.save();

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, "your-secret-key");

    res.status(201).json({ token, response: "success" ,user});
  } catch (error) {
    res.status(400).json({ error: error.message, response: "failure" });
  }
});

/// Common login route for both users and doctors
router.post("/login", async (req, res) => {
  const { email, password, role } = req.body;

  try {
    let user;

    // Determine the model based on userType
    if (role === 'patient') {
      user = await User.findOne({ email });
    } else if (role === 'doctor') {
      user = await Doctor.findOne({ email });
    } else {
      return res.status(400).json({ error: "Invalid user type" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, "your-secret-key");

    res.status(200).json({ token ,user});
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});




// Route to get user details by ID
router.get("/:id", verifyToken,async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Exclude sensitive data like password before sending the response
    const { password, ...userData } = user.toObject();

    return res.status(200).json(userData);
  } catch (error) {
    console.error("Error fetching user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
