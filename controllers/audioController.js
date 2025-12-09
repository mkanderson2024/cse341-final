const mongodb = require('../config/db');
const { ObjectId } = require('mongodb');

const collectionName = 'audioBook';

// GET all audiobooks
const getAllAudio = async (req, res) => {
  try {
    const db = mongodb.getDb();
    const audio = await db.collection(collectionName).find().toArray();
    res.status(200).json(audio);
  } catch (error) {
    console.error('Error fetching audiobooks:', error);
    res.status(500).json({ message: 'Failed to fetch audiobooks', error: error.message });
  }
};

// GET single audiobook by ID
const getAudioById = async (req, res) => {
  try {
    const audioId = req.params.audioId;
    
    if (!ObjectId.isValid(audioId)) {
      return res.status(400).json({ message: 'Invalid audiobook ID format' });
    }

    const db = mongodb.getDb();
    const audio = await db.collection(collectionName).findOne({ _id: new ObjectId(audioId) });
    
    if (!audio) {
      return res.status(404).json({ message: 'Audiobook not found' });
    }
    
    res.status(200).json(audio);
  } catch (error) {
    console.error('Error fetching audiobook:', error);
    res.status(500).json({ message: 'Failed to fetch audiobook', error: error.message });
  }
};

// POST create new audiobook
const createAudio = async (req, res) => {
  // #swagger.security = [{ "oauth2": [] }]
  try {
    const db = mongodb.getDb();

    // Check if associated book exists
    const bookId = req.body.bookId || null;
    if (bookId) {
      if (!ObjectId.isValid(bookId)) {
        return res.status(400).json({ message: 'Invalid book ID format' });
      }
      const book = await db.collection('books').findOne({ _id: new ObjectId(bookId) });
      if (!book) {
        return res.status(404).json({ message: 'Associated book not found' });
      }
    }
    const audio = {
      title: req.body.title,
      type: req.body.type,
      author: req.body.author,
      voiceActor: req.body.voiceActor,
      recordingStudio: req.body.recordingStudio,
      genre: req.body.genre,
      audioFormat: req.body.audioFormat,
      time: req.body.time,
      bookId: bookId ? new ObjectId(bookId) : null
    };
    const result = await db.collection(collectionName).insertOne(audio);

    // Update associated book hasAudiobook field if needed
    if (bookId) {
      await db.collection('books').updateOne(
        { _id: new ObjectId(bookId) },
        { $set: { hasAudiobook: true } }
      );
    }

    if (req.body.type === "audiodrama" && newBookId) {
      return res.status(400).json({ 
        message: "Audiodramas cannot be linked to a book" 
      });
    }

    if (result.acknowledged) {
      res.status(201).json({ 
        message: 'Audiobook created successfully', 
        audioId: result.insertedId 
      });
    } else {
      res.status(500).json({ message: 'Failed to create audiobook' });
    }
  } catch (error) {
    console.error('Error creating audiobook:', error);
    res.status(500).json({ message: 'Failed to create audiobook', error: error.message });
  }
};

// PUT update audiobook by ID
const updateAudio = async (req, res) => {
  // #swagger.security = [{ "oauth2": [] }]
  try {
    const audioId = req.params.audioId;
    if (!ObjectId.isValid(audioId)) {
      return res.status(400).json({ message: 'Invalid audiobook ID format' });
    }

    const db = mongodb.getDb();
    const existingAudio = await db.collection(collectionName)
      .findOne({ _id: new ObjectId(audioId) });

    if (!existingAudio) {
      return res.status(404).json({ message: "Audiobook not found" });
    }
    const newBookId = req.body.bookId || null;

    // Validate bookId if provided and check if associated book exists
    if (newBookId) {
      if (!ObjectId.isValid(newBookId)) {
        return res.status(400).json({ message: "Invalid bookId format" });
      }
      const book = await db.collection("books")
        .findOne({ _id: new ObjectId(newBookId) });
      if (!book) {
        return res.status(404).json({ message: "Associated book not found" });
      }
    }

    const updatedAudio = {
      _id: existingAudio._id, // Preserve the original _id
      title: req.body.title,
      author: req.body.author,
      voiceActor: req.body.voiceActor,
      recordingStudio: req.body.recordingStudio,
      genre: req.body.genre,
      audioFormat: req.body.audioFormat,
      time: req.body.time,
      type: req.body.type,
      bookId: newBookId ? new ObjectId(newBookId) : null
    };
    await db.collection(collectionName).updateOne(
      { _id: new ObjectId(audioId) },
      { $set: updatedAudio }
    );
    
    // If audiobook is being removed from book
    if (existingAudio.bookId && (!newBookId || existingAudio.bookId.toString() !== newBookId)) {
      // check for other audiobooks associated with the book
      const remainingCount = await db.collection(collectionName).countDocuments({ bookId: existingAudio.bookId });
      // update book hasAudiobook field to false if there are no other audiobooks
      if (remainingCount === 0) {
        await db.collection("books").updateOne(
          { _id: existingAudio.bookId },
          { $set: { hasAudiobook: false } }
        );
      }
    }
    
    // If audiobook is being added to book
    if (newBookId) {
      await db.collection("books").updateOne(
        { _id: new ObjectId(newBookId) },
        { $set: { hasAudiobook: true } }
      );
    }

    res.status(200).json({ message: 'Audiobook updated successfully' });
  } catch (error) {
    console.error('Error updating Audiobook:', error);
    res.status(500).json({ message: 'Failed to update Audiobook', error: error.message });
  }
};

// DELETE audiobook by ID
const deleteAudio = async (req, res) => {
  // #swagger.security = [{ "oauth2": [] }]
  try {
    const audioId = req.params.audioId;
    
    if (!ObjectId.isValid(audioId)) {
      return res.status(400).json({ message: 'Invalid audiobook ID format' });
    }

    const db = mongodb.getDb();
    const audio = await db.collection(collectionName).findOne({ _id: new ObjectId(audioId) });
    if (!audio) {
      return res.status(404).json({ message: 'Audiobook not found' });
    }
    
    await db.collection(collectionName).deleteOne({ _id: new ObjectId(audioId) });
    
    // If audiobook is associated with a book, check if there are any other audiobooks, and update book hasAudiobook field
    if (audio.bookId) {
      const remainingCount = await db.collection(collectionName).countDocuments({ bookId: audio.bookId });
      if (remainingCount === 0) {
        await db.collection("books").updateOne(
          { _id: audio.bookId },
          { $set: { hasAudiobook: false } }
        );
      }
    }

    res.status(200).json({ message: 'Audiobook deleted successfully' });
  } catch (error) {
    console.error('Error deleting audiobook:', error);
    res.status(500).json({ message: 'Failed to delete audiobook', error: error.message });
  }
};

module.exports = {
    getAllAudio,
    getAudioById,
    createAudio,
    updateAudio,
    deleteAudio
};