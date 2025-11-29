const mongodb = require('../config/db');
const { ObjectId } = require('mongodb');

const collectionName = 'books';

// GET all books
const getAllBooks = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const books = await db.collection(collectionName).find().toArray();
    res.status(200).json(books);
  } catch (error) {
    console.error('Error fetching books:', error);
    res.status(500).json({ message: 'Failed to fetch books', error: error.message });
  }
};

// GET single book by ID
const getBookById = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }

    const db = mongodb.getDb();
    const book = await db.collection(collectionName).findOne({ _id: new ObjectId(bookId) });
    
    if (!book) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(200).json(book);
  } catch (error) {
    console.error('Error fetching book:', error);
    res.status(500).json({ message: 'Failed to fetch book', error: error.message });
  }
};

// POST create new book
const createBook = async (req, res) => {
  try {
    const book = {
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
      genre: req.body.genre,
      printType: req.body.printType, // Paper, Hardback, or Digital
      publisher: req.body.publisher
    };

    const db = mongodb.getDb();
    const result = await db.collection(collectionName).insertOne(book);
    
    if (result.acknowledged) {
      res.status(201).json({ 
        message: 'Book created successfully', 
        bookId: result.insertedId 
      });
    } else {
      res.status(500).json({ message: 'Failed to create book' });
    }
  } catch (error) {
    console.error('Error creating book:', error);
    res.status(500).json({ message: 'Failed to create book', error: error.message });
  }
};

// PUT update book by ID
const updateBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }

    const updatedBook = {
      title: req.body.title,
      author: req.body.author,
      pages: req.body.pages,
      genre: req.body.genre,
      printType: req.body.printType, // Paper, Hardback, or Digital
      publisher: req.body.publisher
    };

    const db = mongodb.getDb();
    const result = await db.collection(collectionName).replaceOne(
      { _id: new ObjectId(bookId) },
      updatedBook
    );
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(200).json({ message: 'Book updated successfully' });
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ message: 'Failed to update book', error: error.message });
  }
};

// DELETE book by ID
const deleteBook = async (req, res) => {
  try {
    const bookId = req.params.bookId;
    
    if (!ObjectId.isValid(bookId)) {
      return res.status(400).json({ message: 'Invalid book ID format' });
    }

    const db = mongodb.getDb();
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(bookId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Book not found' });
    }
    
    res.status(200).json({ message: 'Book deleted successfully' });
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ message: 'Failed to delete book', error: error.message });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};