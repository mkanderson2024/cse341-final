const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const {
    validateBookCreation,
    validateUpdatingBook,
    validateDeletingBook } = require('../validators/bookValidator')

const { validationResult } = require('express-validator')

// Middleware to handle validation errors in results
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        // Return 400 Bad Request with array of the error messages
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

// PUBLIC ROUTES (no authentication required)
// GET all books
router.get('/', bookController.getAllBooks);

// GET single book by ID
router.get('/:bookId', bookController.getBookById);

// PROTECTED ROUTES (authentication required)
// POST create new book - requires login
router.post('/', 
    isAuthenticated, 
    validateBookCreation, 
    handleValidationErrors, 
    bookController.createBook
);

// PUT update book by ID - requires login
router.put('/:bookId', 
    isAuthenticated, 
    validateUpdatingBook, 
    handleValidationErrors, 
    bookController.updateBook
);

// DELETE book by ID - requires login
router.delete('/:bookId', 
    isAuthenticated, 
    validateDeletingBook, 
    handleValidationErrors, 
    bookController.deleteBook
);

module.exports = router;