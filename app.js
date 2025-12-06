const express = require('express');
const session = require('express-session');
const MongoStore = require('connect-mongo').default;
const passport = require('./config/passport');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1); // trust proxy for render

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

// Session configuration
console.log('MongoStore:', MongoStore);
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions',
    ttl: 14 * 24 * 60 * 60 // 14 days
  }),
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 14 * 24 * 60 * 60 * 1000 // 14 days
  }
}));

app.use(passport.initialize());
app.use(passport.session());

// Swagger documentation
if (process.env.NODE_ENV !== "test") {
  const swaggerUi = require('swagger-ui-express');
  const swaggerDocument = require('./swagger-output.json');
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
}
// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/authRoutes'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Code to start server when not running tests
if (process.env.NODE_ENV !== 'test') {
  const PORT = process.env.PORT || 3000

  // Initialize MongoDB
  mongodb.initDb((err) => {
    if (err) {
      console.error('Failed to connect to database:', err);
      process.exit(1);
    }
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
};


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
//the app ill be imported by Jest and Supertest \
module.exports = app;