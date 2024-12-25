const User = require("../Models/User");
const Exam = require("../Models/Exam");
const Result = require("../Models/Result");
const { redis } = require("../utils/redis");
const QUEUE_KEY = "submissionQueue";
const BULK_WRITE_THRESHOLD = 1;

const fetchExam = async (req, res) => {
  try {
    try {
      // Save the new exam to the database
      const exam = await Exam.findOne({
        slug: req.params.slug,
        isDeleted: false,
      });
      if (!exam) {
        return res
          .status(404)
          .json({ success: false, message: "Exam not found." });
      }
      let user = await User.findById(req.user.userId).select("email");
      let hasAccess = exam.access.includes(user.email);
      if (hasAccess) {
        // User has access
        console.log("User has access to the exam.");
        const result = await Result.findOne({
          examName: req.params.slug,
          examTakenBy: req.user.userId,
        });
        if (
          result &&
          result.userEnrolledInExam === true &&
          result.paperSubmittedInExam === true
        ) {
          return res.status(423).json({
            success: false,
            message: "You have already taken the exam",
          });
        }
        return res.status(200).json({ success: true, exam, result });
      } else {
        // User does not have access
        console.log("User does not have access to the exam.");
        return res.status(401).json({
          success: false,
          message: "User does not have access to the exam.",
        });
      }
    } catch (error) {
      console.error(error); // Improved error logging
      return res.status(400).json({ success: false, error: error.message });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error during fetching the exam code",
      error: error.message,
    });
  }
};
async function bulkWriteSubmissions(submissions) {
  // Perform a bulk write to MongoDB
  const bulkOps = submissions.map((submission) => ({
    updateOne: {
      filter: {
        examName: submission.examName,
        examTakenBy: submission.examTakenBy,
      },
      update: {
        timeTaken: submission.timeTaken,
        answers: submission.answers,
        userEnrolledInExam: true,
        paperSubmittedInExam: true,
        violences: submission.violences,
      },
      upsert: true,
    },
  }));

  try {
    await Result.bulkWrite(bulkOps);
    console.log("Bulk write successful for submissions");
  } catch (error) {
    console.error("Error in bulk writing submissions:", error);
  }
}
const submitExam = async (req, res) => {
  try {
    const { examName, timeTaken, answers, violences } = req.body;
    if (!examName || !timeTaken || !answers) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }
    if (!req.user || !req.user.userId) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const submission = {
      examName,
      timeTaken,
      answers,
      examTakenBy: req.user.userId,
      violences: {
        cursorViolence: {
          cursorCount: violences.cursorViolence.cursorCount,
          tabSwitchTimestamps: violences.cursorViolence.tabSwitchTimestamps.map(
            (item) => ({
              timestamp: new Date(item.timestamp),
              tab: item.tab,
            })
          ),
        },
      },
    };
    try {
      // Push submission to Redis queue
      await redis.rpush(QUEUE_KEY, JSON.stringify(submission));
      const queueLength = await redis.llen(QUEUE_KEY);

      if (queueLength >= BULK_WRITE_THRESHOLD) {
        const submissionsToWrite = await redis.lrange(
          QUEUE_KEY,
          0,
          BULK_WRITE_THRESHOLD - 1
        );

        // Remove written items from the queue
        await redis.ltrim(QUEUE_KEY, BULK_WRITE_THRESHOLD, -1);

        // Convert stored strings to JSON objects
        const parsedSubmissions = submissionsToWrite.map((item) =>
          JSON.parse(item)
        );

        // Perform bulk write
        await bulkWriteSubmissions(parsedSubmissions);
      }
      return res
        .status(201)
        .json({ success: true, message: "Submission queued successfully!" });
    } catch (error) {}
  } catch (error) {
    console.error("Error queuing submission:", error);
    return res
      .status(500)
      .json({ success: false, message: "Error processing submission." });
  }
};

module.exports = {
  fetchExam,
  submitExam,
};
