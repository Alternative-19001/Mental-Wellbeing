const express = require("express");
const path = require("path");
const app = express();
const port = 3001;

// Serve static files from the root directory
app.use(express.static(__dirname));

// Route for all pages
app.get("*", (req, res) => {
  // Check if the request is for a specific HTML file
  if (req.path.endsWith(".html")) {
    res.sendFile(path.join(__dirname, req.path));
  } else {
    // Default to index.html
    res.sendFile(path.join(__dirname, "index.html"));
  }
});

// Start the server
app.listen(port, "0.0.0.0", () => {
  console.log(`Frontend server running at http://0.0.0.0:${port}`);
});
