require("dotenv").config();
const User = require("../Models/User");
const Exam = require("../Models/Exam");
const Result = require("../Models/Result");
const Participant = require("../Models/Participant");
const { redis } = require("../utils/redis");

const fetchExam = async (req, res) => {
  try {
    // Fetch the exam by slug and ensure it's not deleted
    const exam = await Exam.findOne({
      slug: req.params.slug,
      isDeleted: false,
    });

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found.",
      });
    }

    // Fetch user email
    const user = await User.findById(req.user.userId).select("email");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found.",
      });
    }

    // Check if the user is invited to the exam
    const access = await Participant.findOne({
      slug: req.params.slug,
      email: user.email,
    }).select("invited");

    if (!access?.invited) {
      return res.status(401).json({
        success: false,
        message: "User does not have access to the exam.",
      });
    }

    // Check the result to determine if the user has already taken the exam
    const result = await Result.findOne({
      examName: req.params.slug,
      examTakenBy: req.user.userId,
    });

    if (result?.userEnrolledInExam && result?.paperSubmittedInExam) {
      return res.status(423).json({
        success: false,
        message: "You have already taken the exam.",
      });
    }

    // Return the exam and result if the user has access
    return res.status(200).json({
      success: true,
      exam,
      result,
    });
  } catch (error) {
    console.error("Error fetching the exam:", error.message);
    return res.status(500).json({
      success: false,
      message: "An error occurred while fetching the exam.",
      error: error.message,
    });
  }
};

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
      await redis.rpush(process.env.QUEUE_KEY, JSON.stringify(submission));
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
