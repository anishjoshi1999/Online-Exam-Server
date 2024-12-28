const express = require("express");
const router = express.Router();
const resourceController = require("../Controllers/resourceController");
const { authenticateToken } = require("../Middleware/auth");

// Routes
router.get("/get-one-subject-notes", authenticateToken, resourceController.fetchSubjectNotes); 
router.get("/get-one-subject-lectures", authenticateToken, resourceController.fetchSubjectLectures); 
router.get("/get-all-notes", authenticateToken, resourceController.fetchNotes); 
router.get("/get-all-lectures", authenticateToken, resourceController.fetchLectures);
router.get("/get-all-subjects", authenticateToken, resourceController.fetchSubjects);
router.post("/upload-notes", authenticateToken, resourceController.uploadNotes);
router.post("/upload-lectures", authenticateToken, resourceController.uploadLectures);

module.exports = router;
