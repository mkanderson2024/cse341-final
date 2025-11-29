const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');

// GET all books
router.get('/', bookController.getAllBooks);

// GET single book by ID
router.get('/:bookId', bookController.getBookById);

// POST create new book
router.post('/', bookController.createBook);

// PUT update book by ID
router.put('/:bookId', bookController.updateBook);

// DELETE book by ID
router.delete('/:bookId', bookController.deleteBook);

module.exports = router;