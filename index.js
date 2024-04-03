// index.js
require('dotenv').config();
const express = require('express');
const { connect } = require('mongoose');
const { json } = require('body-parser');

const winston = require('winston');
const { logAPIMiddleware } = require('./logger');



const app = express();
const PORT = process.env.PORT || 3000;


app.use(json());

app.use(logAPIMiddleware);

// Connect to MongoDB
connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.error('Error connecting to MongoDB:', error);
  });


// auth Routes
app.use('/api/auth/user', require('./routes/UserRoute'));
app.use('/api/auth/doctor', require('./routes/DoctorRoute'));
app.use('/api/auth', require('./routes/UserRoute'));


// user Route
app.use('/api/user', require('./routes/UserRoute')); 

app.use('/api/doctor', require('./routes/DoctorRoute')); 

// doc route

// apointment [patient : book,cancel]
app.use('/api/apointment',require('./routes/AppointmentRoute'))



app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
