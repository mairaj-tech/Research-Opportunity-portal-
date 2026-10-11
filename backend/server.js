require('dotenv').config();
const express = require('express');
const cors = require('cors');
const opportunitiesRouter = require('./routes/opportunities');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/opportunities', opportunitiesRouter);

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'Research Opportunity Portal API is running' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
