const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const pollingService = require('./services/pollingService');
const db = require('./config/db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const salesRoutes = require('./routes/sales');

// Routes
app.use('/api', apiRoutes);
app.use('/api/sales', salesRoutes);

// Connect to Database and start server
db.connectDB().then(() => {
  // Start Polling Service
  pollingService.start();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
