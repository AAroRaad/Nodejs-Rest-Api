const express = require("express");
const { body } = require("express-validator");
const isAuth = require("../middleware/is-auth");

const User = require("../models/user");

const authController = require("../controllers/auth");

const router = express.Router();

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please enter a valid email")
      .custom(async (value, { req }) => {
        const existingUser = await User.findOne({ email: value });
        if (existingUser) {
          throw new Error(
            "E-Mail exists already, please pick a different one."
          );
        }
      })
      .normalizeEmail(),
    body("password").trim().isLength({ min: 5 }),
    body("name").trim().notEmpty(),
  ],
  authController.signup
);

router.post("/login", authController.login);

router.get("/status", isAuth, authController.getUserStatus);

router.patch(
  "/status",
  isAuth,
  [body("status").trim().notEmpty()],
  authController.updateUserStatus
);

module.exports = router;
