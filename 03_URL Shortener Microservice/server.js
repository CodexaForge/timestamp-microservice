const express = require("express");
const mongoose = require("mongoose");
const dns = require("dns");
const urlParser = require("url");

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/mydb');

// Define schema and model
const urlSchema = new mongoose.Schema({
  original_url: String,
  short_url: Number,
});
const Url = mongoose.model("Url", urlSchema);

// Serve homepage (optional)
app.get("/", (req, res) => {
  res.send(`<h2>URL Shortener Microservice</h2>
            <p>Use POST /api/shorturl with a 'url' parameter to shorten a URL.</p>`);
});

// POST endpoint to shorten URL
let counter = 1;

app.post("/api/shorturl", async (req, res) => {
  const originalUrl = req.body.url;
  const parsedUrl = urlParser.parse(originalUrl);

  dns.lookup(parsedUrl.hostname, async (err, address) => {
    if (err || !address) {
      return res.json({ error: "invalid url" });
    }

    let found = await Url.findOne({ original_url: originalUrl });
    if (found) {
      return res.json({
        original_url: found.original_url,
        short_url: found.short_url,
      });
    }

    const newUrl = new Url({ original_url: originalUrl, short_url: counter++ });
    await newUrl.save();

    res.json({
      original_url: newUrl.original_url,
      short_url: newUrl.short_url,
    });
  });
});

// GET endpoint to redirect to original URL
app.get("/api/shorturl/:short_url", async (req, res) => {
  const shortUrl = parseInt(req.params.short_url);

  const found = await Url.findOne({ short_url: shortUrl });
  if (found) {
    return res.redirect(found.original_url);
  } else {
    return res.json({ error: "No short URL found" });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
