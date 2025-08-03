const express = require('express');
const app = express();

// Enable CORS for testing on freeCodeCamp
const cors = require('cors');
app.use(cors());

// Basic index route
app.get('/', (req, res) => {
  res.send('Timestamp Microservice');
});

// API route
app.get('/api/:date?', (req, res) => {
  let dateParam = req.params.date;

  let date;
  // If no date param, use current date
  if (!dateParam) {
    date = new Date();
  } else {
    // If it's a number (Unix timestamp), parse it
    if (!isNaN(dateParam)) {
      date = new Date(parseInt(dateParam));
    } else {
      date = new Date(dateParam);
    }
  }

  // Check if the date is valid
  if (date.toString() === "Invalid Date") {
    return res.json({ error: "Invalid Date" });
  }

  res.json({
    unix: date.getTime(),
    utc: date.toUTCString()
  });
});

// Listen on port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
