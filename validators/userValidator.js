const { body, validationResult } = require("express-validator");

// Validator for Audio Book data
const userValidationRules = () => {
  return [
    body("type")
      .notEmpty()
      .withMessage("Type field cannot be empty")
      .isIn(["buyer", "seller"])
      .withMessage(`Account type must be either "buyer" or "seller"`),
    body("email")
      .notEmpty()
      .withMessage("Email field cannot be empty")
      .isEmail()
      .normalizeEmail()
      .withMessage("Email must be a valid email address"),
    body("phone")
      .notEmpty()
      .withMessage("Phone number field cannot be empty")
      .isLength({ min: 10 })
      .withMessage("Phone number must be at least 10 characters long")
      .isNumeric()
      .withMessage("Please enter only numbers for the phone number"),
    body("address")
      .notEmpty()
      .withMessage("Address field cannot be empty") 
      .isLength({ min: 10 })
      .withMessage("Address must be at least 10 characters long"),
    body("password")
      .notEmpty()
      .withMessage("Please enter a valid password")
      .isLength({ min: 8 })
      .withMessage("Password must be at least 8 characters long")
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/)
      .withMessage(
        "Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character"
      ),
  ];
};

// Middleware to ValidationAudioBook request body
const validateUser = (req, res, next) => {
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
    userValidationRules,
    validateUser
};
