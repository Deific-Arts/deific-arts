const { app, PORT, loadRoutes, setup404Handler } = require('./dist/server.cjs');

// Load routes before starting server
loadRoutes().then(() => {
  // Setup 404 handler after routes are loaded
  setup404Handler();

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
