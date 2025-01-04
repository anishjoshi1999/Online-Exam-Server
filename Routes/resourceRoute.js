const express = require("express");
const router = express.Router();
const resourceController = require("../Controllers/resourceController");
const { authenticateToken } = require("../Middleware/auth");
const multer = require("multer");
require("dotenv").config();

// Configure multer for video uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/")) {
      cb(null, true);
    } else {
      cb(new Error("Not a video file!"), false);
    }
  },
});

// Routes
router.post(
  "/upload-lectures",
  authenticateToken,
  upload.single("file"),
  resourceController.uploadLectures
);
router.post(
  "/upload-subject",
  authenticateToken,
  resourceController.uploadSubject
);
router.get(
  "/get-one-subject-notes",
  authenticateToken,
  resourceController.fetchSubjectNotes
);
router.get(
  "/get-one-subject-lectures",
  authenticateToken,
  resourceController.fetchSubjectLectures
);
router.get("/get-all-notes", authenticateToken, resourceController.fetchNotes);
router.get(
  "/get-all-lectures",
  authenticateToken,
  resourceController.fetchLectures
);
router.get(
  "/get-all-subjects",
  authenticateToken,
  resourceController.fetchSubjects
);
router.post("/upload-notes", authenticateToken, resourceController.uploadNotes);

module.exports = router;
