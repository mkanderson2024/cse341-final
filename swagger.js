const swaggerAutogen = require('swagger-autogen')();

const doc = {
  info: {
    title: 'Da Book Store API',
    description: 'API Documentation for Da Book Store - CSE 341 Final Project for Team 5',
  },
    host: 'cse341-final-56l4.onrender.com',
    schemes: ['https']
};

const outputFile = './swagger-output.json';
const routes = ['./routes/index.js'];

/* NOTE: If you are using the express Router, you must pass in the 'routes' only the 
root file where the route starts, such as index.js, app.js, routes.js, etc ... */

swaggerAutogen(outputFile, routes, doc);