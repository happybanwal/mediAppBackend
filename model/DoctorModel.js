const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  specialty: { type: String, required: true },
  role: { type: String, enum: ['doctor'], default: 'doctor' }
});

// Method to get a doctor by ID
doctorSchema.statics.getDoctorById = async function (doctorId) {
  try {
    const doctor = await this.findById(doctorId);
    return doctor;
  } catch (error) {
    throw new Error('Error getting doctor by ID');
  }
};

// Method to get all doctors
doctorSchema.statics.getAllDoctors = async function () {
  try {
    const doctors = await this.find();
    return doctors;
  } catch (error) {
    throw new Error('Error getting all doctors');
  }
};

module.exports = mongoose.model('Doctor', doctorSchema);
