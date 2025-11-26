const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const apiRoutes = require('./routes/api');
const pollingService = require('./services/pollingService');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api', apiRoutes);

// Start Polling Service
pollingService.start();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
