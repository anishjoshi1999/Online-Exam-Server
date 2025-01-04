const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const accessController = require("../Controllers/accessController");
const { validateRequest } = require("../Middleware/validator");
const { authenticateToken } = require("../Middleware/auth");

// Routes

router.get("/get-all-students",authenticateToken, accessController.getAllStudents);

router.post("/provide-student-access",authenticateToken, accessController.provideStudentAccess);

module.exports = router;
