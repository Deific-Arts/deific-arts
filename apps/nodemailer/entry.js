const { app, PORT } = require('./dist/server.js');

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Visit http://localhost:${PORT} to test the email functionality`);
});

module.exports = app;
