const router = require("express").Router();
const userController = require("../controllers/userController");
const { userValidationRules, validateUser } = require("../validators/userValidator");

router.get("/", userController.getAllUsers);
router.get("/:userId", userController.getUserById);
router.post("/", userValidationRules(), validateUser, userController.createUser);
router.put("/:userId", userValidationRules(), validateUser, userController.updateUser);
router.delete("/:userId", userController.deleteUser);

module.exports = router;
