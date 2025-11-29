const mongodb = require('../config/db');
const { ObjectId } = require('mongodb');

const collectionName = 'audio'; // Replace with actual collection name

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
  try {
    const audio = {
        title: req.body.title,
        author: req.body.author,
        voiceActor: req.body.voiceActor,
        recordingStudio: req.body.recordingStudio,
        genre: req.body.genre,
        time: req.body.time,
    };

    const db = mongodb.getDb();
    const result = await db.collection(collectionName).insertOne(audio);
    
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
  try {
    const audioId = req.params.audioId;
    
    if (!ObjectId.isValid(audioId)) {
      return res.status(400).json({ message: 'Invalid audiobook ID format' });
    }

    const updatedAudio = {
        title: req.body.title,
        author: req.body.author,
        voiceActor: req.body.voiceActor,
        recordingStudio: req.body.recordingStudio,
        genre: req.body.genre,
        time: req.body.time,
    };

    const db = mongodb.getDb();
    const result = await db.collection(collectionName).replaceOne(
      { _id: new ObjectId(audioId) },
      updatedAudio
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

// DELETE audiobook by ID
const deleteAudio = async (req, res) => {
  try {
    const audioId = req.params.audioId;
    
    if (!ObjectId.isValid(audioId)) {
      return res.status(400).json({ message: 'Invalid audiobook ID format' });
    }

    const db = mongodb.getDb();
    const result = await db.collection(collectionName).deleteOne({ _id: new ObjectId(audioId) });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Audiobook not found' });
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