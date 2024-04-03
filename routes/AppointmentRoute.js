const express = require("express");
const router = express.Router();
const Appointment = require("../model/AppointmentModel");
const verifyToken = require("../middleware/AuthMiddleware");

// Book appointment
router.post("/book",verifyToken, async (req, res) => {
  try {
    const { patientId, doctorId, date, time } = req.body;

    // Check if the appointment date and time are valid
    const appointmentDate = new Date(date);
    const appointmentTime = time; // Assuming time is provided as a string
    if (isNaN(appointmentDate) || !appointmentTime) {
      return res.status(400).json({
        error: "Invalid appointment date or time",
        response: "failure",
      });
    }

    // Check if an appointment already exists for the same date and time
    const existingAppointment = await Appointment.findOne({ doctorId, date: appointmentDate, time: appointmentTime });
    if (existingAppointment) {
      return res.status(400).json({
        error: "Appointment already exists for this doctor at the same date and time",
        response: "failure",
      });
    }

    // Create a new appointment
    const newAppointment = new Appointment({
      patientId,
      doctorId,
      date: appointmentDate,
      time: appointmentTime
    });

    // Save the appointment to the database
    await newAppointment.save();

    // Return success response
    return res.status(200).json({
      message: "Appointment booked successfully",
      response: "success",
      appointment: newAppointment
    });

  } catch (error) {
    console.error("Error booking appointment:", error);
    return res.status(500).json({
      error: "An internal server error occurred",
      response: "failure"
    });
  }
});


// Route to accept appointment by doctor
router.put('accept/:id', verifyToken,async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ error: 'Appointment is not pending' });
    }

    // Update appointment status to confirmed
    appointment.status = 'confirmed';
    await appointment.save();

    return res.status(200).json({ message: 'Appointment accepted successfully' });
  } catch (error) {
    console.error('Error accepting appointment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Route to reject appointment by doctor
router.put('/reject/:id', verifyToken,async (req, res) => {
  try {
    const { date, time } = req.body; // Extract date and time from request body
    const appointment = await Appointment.findById(req.params.id);
    if (!appointment) {
      return res.status(404).json({ error: 'Appointment not found' });
    }

    if (appointment.status !== 'pending') {
      return res.status(400).json({ error: 'Appointment is not pending' });
    }

    // Check if date and time are provided in the request body
    if (!date || !time) {
      return res.status(400).json({ error: 'Date and time are required' });
    }

    // Update appointment status to cancelled
    appointment.date = date;
    appointment.time = time;
    appointment.status = 'cancelled';
    await appointment.save();

    return res.status(200).json({ message: 'Appointment rejected successfully' });
  } catch (error) {
    console.error('Error rejecting appointment:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});


// Cancel appointment by user
router.put("/cancel/:id", verifyToken, async (req, res) => {
  const appointmentId = req.params.id;
  const userId = req.user.userId; // Extract user ID from JWT token

  try {
    // Find appointment by ID
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ error: "Appointment not found" });
    }

    // Check if the appointment belongs to the user
    if (appointment.patientId.toString() !== userId) {
      return res.status(403).json({ error: "Unauthorized access" });
    }

    // Check if the appointment status is pending or confirmed
    if (appointment.status !== 'pending' && appointment.status !== 'confirmed') {
      return res.status(400).json({ error: "Appointment cannot be cancelled" });
    }

    // Update appointment status to cancelled
    appointment.status = 'cancelled';
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully" });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});


// Route to get all appointments for a user
router.get("/:userId", verifyToken,async (req, res) => {
  try {
    const userId = req.params.userId;
    const appointments = await Appointment.find({ patientId: userId });
    return res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

// Route to get all appointments for a specific doctor
router.get("/:doctorId", verifyToken, async (req, res) => {
  try {
    const doctorId = req.params.doctorId;
    const appointments = await Appointment.find({ doctorId });
    return res.status(200).json(appointments);
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});


module.exports = router;
