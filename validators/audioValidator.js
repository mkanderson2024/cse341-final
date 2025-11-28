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
    body("isbn")
      .notEmpty()
      .withMessage("ISBN field cannot be empty")
      .isISBN()
      .withMessage("ISBN must be a valid ISBN"),
    body("audioFormat")
      .notEmpty()
      .withMessage("Format field cannot be empty")
      .isIn(["mp3", "aac", "wav"])
      .withMessage("Format must be one of mp3, aac, wav"),
    body("price")
      .notEmpty()
      .withMessage("Price field cannot be empty")
      .isFloat()
      .withMessage("Price must be a valid number"),
    body("publishedDate")
      .notEmpty()
      .withMessage("Published date field cannot be empty")
      .isISO8601()
      .withMessage("Published date must be a valid date"),
    body("description")
      .notEmpty()
      .withMessage("Description field cannot be empty"),
    body("time")
      .notEmpty()
      .withMessage("Time field cannot be empty")
      .isNumeric()
      .withMessage("Time must be a number"),
    body("inStock")
      .notEmpty()
      .withMessage("In stock field cannot be empty")
      .isBoolean()
      .withMessage("In stock must be true or false"),
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
