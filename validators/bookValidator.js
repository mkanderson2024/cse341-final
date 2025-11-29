const { body, param } = require('express-validator');
const { ObjectId } = require('mongodb');

const isValidObjectId = (value) => {
    if (!ObjectId.isValid(value)) {
        throw new Error('Invalid book ID format');
    }
    return true;
};

// Validation for creating a new book (POST)
const validateBookCreation = [
    body('title')
        .notEmpty().withMessage('Title is required')   
        .matches(/^[A-Za-z0-9\s\-\:\'\",&]+$/).withMessage('Title contains invalid characters'),
    body('author')
        .notEmpty().withMessage('Author is required')
        .matches(/^[A-Za-z\s]+$/).withMessage('Author must contain only letters'),
    body('pages')
        .notEmpty().withMessage('Pages are required')
        .isInt({ min: 1}).withMessage('Pages must be a positive integer'),
    body('genre')
        .notEmpty().withMessage('Genre is required')
        .matches(/^[A-Za-z\s]+$/).withMessage('Genre must contain only letters'),
    body('printType')
        .notEmpty().withMessage('Print type required')
        .isIn(['Paper', 'Hardback', 'Digital']).withMessage('Print type must be: Paper, Hardback, or Digital'),
    body('publisher')
        .notEmpty().withMessage('Publisher is required')
        .matches(/^[A-Za-z\s]+$/).withMessage('Publisher must contain only letters')
]

// Validation for updating a book (PUT)
const validateUpdatingBook = [
    param('bookId').custom(isValidObjectId),
    body('title')
        .notEmpty().withMessage('Title is required')   
        .matches(/^[A-Za-z0-9\s\-\:\'\",&]+$/).withMessage('Title contains invalid characters'),
    body('author')
        .notEmpty().withMessage('Author is required')
        .matches(/^[A-Za-z\s]+$/).withMessage('Author must contain only letters'),
    body('pages')
        .notEmpty().withMessage('Pages are required')
        .isInt({ min: 1}).withMessage('Pages must be a positive integer'),
    body('genre')
        .notEmpty().withMessage('Genre is required')
        .matches(/^[A-Za-z\s]+$/).withMessage('Genre must contain only letters'),
    body('printType')
        .notEmpty().withMessage('Print type required')
        .isIn(['Paper', 'Hardback', 'Digital']).withMessage('Print type must be: Paper, Hardback, or Digital'),
    body('publisher')
        .notEmpty().withMessage('Publisher is required')
        .matches(/^[A-Za-z\s]+$/).withMessage('Publisher must contain only letters')
]

// Validation for deleting a book (DELETE)
const validateDeletingBook = [
    param('bookId').custom(isValidObjectId)
];

module.exports= {
    validateBookCreation,
    validateUpdatingBook,
    validateDeletingBook
}