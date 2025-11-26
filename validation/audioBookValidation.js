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
    body("length")
      .notEmpty()
      .withMessage("Length field cannot be empty")
      .isInt({ min: 1 })
      .withMessage("Length must be a positive integer"),
    body("genre")
      .notEmpty()
      .withMessage("Genre field cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Genre must be at least 10 characters long"),
    body("actor")
      .notEmpty()
      .withMessage("Actor field cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Actor must be at least 10 characters long"),
    body("format")
      .notEmpty()
      .withMessage("Format field cannot be empty")
      .isIn(["mp3", "aac", "wav"])
      .withMessage("Format must be one of mp3, aac, wav"),
    body("publisher")
      .notEmpty()
      .withMessage("Publisher field cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Publisher must be at least 10 characters long"),
    body("studio")
      .notEmpty()
      .withMessage("Studio field cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Studio must be at least 10 characters long"),
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
