const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');
const { isAuthenticated } = require('../middleware/authMiddleware');
const {
    audioBookValidationRules,
    ValidationAudioBook
    } = require('../validators/audioValidator')

// PUBLIC ROUTES (no authentication required)
// GET all audiobooks
router.get('/', audioController.getAllAudio);

// GET single audiobook by ID
router.get('/:audioId', audioController.getAudioById);

// PROTECTED ROUTES (authentication required)
// POST create new audiobook - requires login
router.post('/', 
    isAuthenticated, 
    audioBookValidationRules(), 
    ValidationAudioBook, 
    audioController.createAudio
);

// PUT update audiobook by ID - requires login
router.put('/:audioId', 
    isAuthenticated, 
    audioBookValidationRules(), 
    ValidationAudioBook, 
    audioController.updateAudio
);

// DELETE audiobook by ID - requires login
router.delete('/:audioId', 
    isAuthenticated, 
    audioController.deleteAudio
);

module.exports = router;