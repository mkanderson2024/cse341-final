const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
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

// GET all books
router.get('/', bookController.getAllBooks);

// GET single book by ID
router.get('/:bookId', bookController.getBookById);

// POST create new book
router.post('/', validateBookCreation,handleValidationErrors,bookController.createBook);

// PUT update book by ID
router.put('/:bookId', validateUpdatingBook,handleValidationErrors,bookController.updateBook);

// DELETE book by ID
router.delete('/:bookId', validateDeletingBook,handleValidationErrors,bookController.deleteBook);

module.exports = router;