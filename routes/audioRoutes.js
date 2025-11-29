const express = require('express');
const router = express.Router();
const audioController = require('../controllers/audioController');
const {
    audioBookValidationRules,
    ValidationAudioBook
    } = require('../validators/audioValidator')

// GET all audiobooks
router.get('/', audioController.getAllAudio);

// GET single audiobook by ID
router.get('/:audioId', audioController.getAudioById);

// POST create new audiobook
router.post('/', audioBookValidationRules(), ValidationAudioBook, audioController.createAudio);

// PUT update audiobook by ID
router.put('/:audioId', audioBookValidationRules(), ValidationAudioBook, audioController.updateAudio);

// DELETE audiobook by ID
router.delete('/:audioId', audioController.deleteAudio);

module.exports = router;