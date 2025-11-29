const { body, validationResult } = require("express-validator");

// Validator for Audio Book data
const audioBookValidationRules = () => {
  return [
    body("title")
      .notEmpty()
      .withMessage("Title field cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Title must be at least 10 characters long"),
    body("author")
      .notEmpty()
      .withMessage("Author field cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Author must be at least 10 characters long"),
    body("VoiceActor")
      .notEmpty()
      .withMessage("Actor field cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Actor must be at least 10 characters long"),
    body("recordingStudio")
      .notEmpty()
      .withMessage("Recording studio field cannot be empty")
      .isLength({ min: 3 })
      .withMessage("Recording studio must be at least 3 characters long"),
    body("genre")
      .notEmpty()
      .withMessage("Genre field cannot be empty")
      .isLength({ min: 1 })
      .withMessage("Genre must be at least 1 character long"),
    body("audioFormat")
      .notEmpty()
      .withMessage("Format field cannot be empty")
      .isIn(["mp3", "aac", "wav"])
      .withMessage("Format must be one of mp3, aac, wav"),
    body("time")
      .notEmpty()
      .withMessage("Time field cannot be empty")
      .matches(/^([01]\d|2[0-3]):([0-5]\d)$/)
      .withMessage("Time must be in hh:mm format"),
  ];
};

// Middleware to ValidationAudioBook request body
const ValidationAudioBook = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res
      .status(400)
      .json({ errors: errors.array().map((err) => err.msg) });
  }
  next();
};

// Export the validator middleware

module.exports = {
  audioBookValidationRules,
  ValidationAudioBook,
};
