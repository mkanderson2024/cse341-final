# Da Book Store API

API Documentation for Da Book Store - CSE 341 Final Project for Team 5

## View Deployed Site

[Click here to test the API](https://cse341-final-56l4.onrender.com)

## Installation

1. Clone the repository:

   ```
   git clone https://github.com/mkanderson2024/cse341-final.git
   cd cse341-final
   ```

2. Install dependencies:

   ```
   npm install
   ```

3. Set up environment variables:

   - Create a `.env` file in the root directory.
   - Add your MongoDB connection URL:
     ```
     MONGODB_URL=your_mongodb_connection_string_here
     ```
   - Add GitHub OAuth credentials (obtain from GitHub Developer Settings):
     ```
     GITHUB_CLIENT_ID=your_github_client_id_here
     GITHUB_CLIENT_SECRET=your_github_client_secret_here
     CALLBACK_URL=http://localhost:3000/github/callback
     ```
   - Optional: Set the base URL for Swagger documentation:
     ```
     BASE_URL=http://localhost:3000
     ```

4. Run the application:
   - Initialize swagger UI: `npm run swagger`
   - For test: `npm run test`
   - For development: `npm run dev`
   - For production: `npm start`

The server will start on `http://localhost:3000` by default.

## Authentication

This API uses GitHub OAuth for authentication. To access protected endpoints (POST, PUT, DELETE for books and audio-books), audio-books must log in via GitHub.

### Login

- Navigate to `http://localhost:3000/auth/github` to initiate GitHub authentication.
- You will be redirected to GitHub to authorize the application.
- After authorization, you will be redirected back to the home page, logged in.

### Protected Endpoints

Endpoints that require authentication are marked with an asterisk (\*) in the API Documentation tables below.

## API Documentation

This is a RESTful API for managing books and audio-books. Below are the available endpoints.

### Endpoints for books

| Method | Endpoint   | Description                  | Parameters                                                               | Response                                                                                                                          |
| ------ | ---------- | ---------------------------- | ------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /books     | Retrieve all books           | None                                                                     | 200 OK: JSON array of books<br>500 Internal Server Error: On failure                                                              |
| GET    | /books/:id | Retrieve a single book by ID | id (string): book ID                                                     | 200 OK: JSON object of the book<br>404 Not Found: If book not found<br>500 Internal Server Error: On failure                      |
| POST   | /books     | Create a new book\*          | None (body: JSON with title, author, pages, genre, printType, publisher) | 201 Created: JSON with message and bookId<br>400 Bad Request: If required fields missing<br>500 Internal Server Error: On failure |
| PUT    | /books/:id | Update a book by ID\*        | id (string): book ID (body: JSON with fields to update)                  | 200 OK: JSON with message<br>404 Not Found: If book not found<br>500 Internal Server Error: On failure                            |
| DELETE | /books/:id | Delete a book by ID\*        | id (string): book ID                                                     | 200 OK: JSON with message<br>404 Not Found: If book not found<br>500 Internal Server Error: On failure                            |

### Endpoints for Audiobooks

| Method | Endpoint         | Description                        | Parameters                                                                                  | Response                                                                                                                               |
| ------ | ---------------- | ---------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /audio-books     | Retrieve all audio-books           | None                                                                                        | 200 OK: JSON array of audio-books<br>500 Internal Server Error: On failure                                                             |
| GET    | /audio-books/:id | Retrieve a single audio-book by ID | id (string): audio-book ID                                                                  | 200 OK: JSON object of the audio-book<br>404 Not Found: If audio-book not found<br>500 Internal Server Error: On failure               |
| POST   | /audio-books     | Create a new audio-book\*          | None (body: JSON with title, author, voiceActor, recordingStudio, genre, audioFormat, time) | 201 Created: JSON with message and audioId<br>400 Bad Request: If required fields missing or invalid data<br>500 Internal Server Error |
| PUT    | /audio-books/:id | Update a audio-book by ID\*        | id (string): audio-book ID (body: JSON with fields to update)                               | 200 OK: JSON with message<br>404 Not Found: If audio-book not found<br>500 Internal Server Error: On failure                           |
| DELETE | /audio-books/:id | Delete a audio-book by ID\*        | id (string): audio-book ID                                                                  | 200 OK: JSON with message<br>404 Not Found: If audio-book not found<br>500 Internal Server Error: On failure                           |

### Endpoints for Orders

| Method | Endpoint    | Description                   | Parameters                                                                                   | Response                                                                                                                               |
| ------ | ----------- | ----------------------------- | -------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /orders     | Retrieve all orders           | None                                                                                         | 200 OK: JSON array of orders<br>500 Internal Server Error: On failure                                                                  |
| GET    | /orders/:id | Retrieve a single order by ID | id (string): order ID                                                                        | 200 OK: JSON object of the order<br>404 Not Found: If order not found<br>500 Internal Server Error: On failure                         |
| POST   | /orders     | Create a new order\*          | None (body: JSON with userId, shippingAddress, date, paymentMethod, trackingNumber, bookIds) | 201 Created: JSON with message and orderId<br>400 Bad Request: If required fields missing or invalid data<br>500 Internal Server Error |
| PUT    | /orders/:id | Update an order by ID\*       | id (string): order ID (body: JSON with fields to update)                                     | 200 OK: JSON with message<br>404 Not Found: If order not found<br>500 Internal Server Error: On failure                                |
| DELETE | /orders/:id | Delete an order by ID\*       | id (string): order ID                                                                        | 200 OK: JSON with message<br>404 Not Found: If order not found<br>500 Internal Server Error: On failure                                |

### Endpoints for Users

| Method | Endpoint   | Description                  | Parameters                                                                      | Response                                                                                                                              |
| ------ | ---------- | ---------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | /users     | Retrieve all users           | None                                                                            | 200 OK: JSON array of users<br>500 Internal Server Error: On failure                                                                  |
| GET    | /users/:id | Retrieve a single user by ID | id (string): User ID                                                            | 200 OK: JSON object of the user<br>404 Not Found: If user not found<br>500 Internal Server Error: On failure                          |
| POST   | /users     | Create a new user\*          | None (body: JSON with type, email, phone, address, password) | 201 Created: JSON with message and userId<br>400 Bad Request: If required fields missing or invalid data<br>500 Internal Server Error |
| PUT    | /users/:id | Update a user by ID\*        | id (string): User ID (body: JSON with fields to update)                         | 200 OK: JSON with message<br>404 Not Found: If user not found<br>500 Internal Server Error: On failure                                |
| DELETE | /users/:id | Delete a user by ID\*        | id (string): User ID                                                            | 200 OK: JSON with message<br>404 Not Found: If user not found<br>500 Internal Server Error: On failure                                |

## API Documentation with Swagger

This project includes interactive API documentation using Swagger UI.

- To view the Swagger UI, navigate to: `http://localhost:3000/api-docs` when the server is running.
- The Swagger UI provides detailed documentation of all API endpoints, request/response schemas, and allows you to test endpoints interactively.

## Technologies Used

- Node.js
- Express.js
- MongoDB
- Express-validator
- Passport.js
- Passport-GitHub2
- Express-session
- Swagger-ui-express
- Swagger-autogen


## Testing

Testing and Mocks
All tests are written using the Jest framework and can be executed using npm test.  Changes made in the project structure, specifically routing the database access through server.js in order to have supertest running

To ensure fast, reliable, and isolated testing (Unit and Integration), this project utilizes Jest's manual mock system located in the __mocks__ directory.

Database Mocking (__mocks__/config/db.js)
We use a custom mock for the MongoDB connection module (config/db.js). This approach achieves test isolation by ensuring that no test executes queries against a live external database.

Purpose: The mock simulates the behavior of the MongoDB driver's methods (e.g., db.collection().find(), .findOne(), .insertOne(), .aggregate()) and controls the data flow.

Behavior: Instead of connecting to a server, the mock returns predefined data (mockUsers, mockOrders) for success scenarios or throws simulated errors for failure scenarios (e.g., status 500 DB errors).

Key Mocked Methods:

getDb().collection(name)

Methods requiring chaining (e.g., .find().toArray() and .aggregate().toArray()) are handled by custom cursor mocks (mockCursorReturn) to maintain the chaining syntax used by the controllers.

## Technologies Used for Testing 
- Jes
- Supertest


## Mocks 
- Jest's manual mock system
## Authors

- Michael Anderson
- Madison Thomas
- Nathan Johnson
- Michael Kazembe
- Sergio Pontes
