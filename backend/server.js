const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/shieldgig')
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('MongoDB connection error:', err));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/claims', require('./routes/claims'));
app.use('/api/admin', require('./routes/admin'));

// Start monitoring environmental triggers
require('./services/triggerEngine');

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
