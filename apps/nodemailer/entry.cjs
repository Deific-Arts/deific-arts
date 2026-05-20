const { app, PORT, loadRoutes } = require('./dist/server.cjs');

// Load routes before starting server
loadRoutes().then(() => {
  // Start server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Visit http://localhost:${PORT} to test the email functionality`);
  });
}).catch(err => {
  console.error('Failed to load routes:', err);
  process.exit(1);
});

module.exports = app;
