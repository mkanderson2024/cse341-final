const express = require('express');
//const mongodb = require('./config/db');
require('dotenv').config();

const app = express();
//const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});

// Swagger documentation
if (process.env.NODE_ENV !== "test") {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./swagger-output.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
// Home route
app.use('/', require('./routes/index'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

////////////////START SERVER & DB ////////////////// This part must transformed in comments
// Initialize DB and start server
/*mongodb.initDb((err) => {
  if (err) {
    console.error('Failed to connect to database:', err);
    process.exit(1);
  }
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});*/
/////////////////////////////////////////////////////
//Line of code must be inserted
//the app ill be imported by Jest and Supertest 
module.exports = app;