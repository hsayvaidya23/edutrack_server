// app.js
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const classRoutes = require('./routes/classRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const studentRoutes = require('./routes/studentRoutes');
const authMiddleware = require('./middleware/authMiddleware');
const dotenv = require('dotenv');

dotenv.config();


const app = express();

const corsOptions = {
  origin: ['http://localhost:5173', 'https://edutrack-crm.vercel.app/'], // Add localhost for development
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

// Middleware
app.use(cors({
  origin: 'https://edutrack-server.vercel.app/'
}));

// app.use(cors()); 
app.use(cors(corsOptions));

app.use((req, res, next) => {
  const allowedOrigins = ['http://localhost:5173', 'https://edutrack-crm.vercel.app/'];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});



mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));


app.use('/api/auth', authRoutes); 
app.use('/api/classes', classRoutes); 
app.use('/api/teachers', teacherRoutes); 
app.use('/api/students', studentRoutes); 


app.get('/', (req, res) => {
  res.send('EduTrack Backend is running!');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

module.exports = app;