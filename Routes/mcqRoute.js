const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const mcqController = require("../Controllers/mcqController");

// Routes
router.post("/", mcqController.create);

module.exports = router;
