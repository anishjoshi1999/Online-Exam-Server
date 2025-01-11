const User = require("../Models/User");
const Exam = require("../Models/Exam");
const Result = require("../Models/Result");
const { CheckIfUserIsAdmin } = require("../utils/CheckIfUserIsAdmin");
const fetch = async (req, res) => {
  try {
    try {
      if (!(await CheckIfUserIsAdmin(req.user.userId))) {
        return res
          .status(401)
          .json({ message: "You are not authorized to Fetch Exam" });
      }
      const results = await Result.find({ examName: req.params.slug });
      if (!results) {
        return res
          .status(404)
          .json({ success: false, message: "Exam not found." });
      }
      return res.status(200).json({ success: true, results });
    } catch (error) {
      console.error(error); // Improved error logging
      return res.status(400).json({ success: false, error: error.message });
    }
  } catch (error) {
    res.status(500).json({
      message: "Error during fetching the exam participation",
      error: error.message,
    });
  }
};
const fetchResult = async (req, res) => {
  try {
    if (!(await CheckIfUserIsAdmin(req.user.userId))) {
      return res
        .status(401)
        .json({ message: "You are not authorized to Fetch Exam" });
    }
    const { examName, username } = req.body; // Get the username from the authenticated request
    // Find the result for this exam slug and user
    const result = await Result.findOne({
      examName: examName,
      examTakenBy: username,
    });
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Result not found for this exam." });
    }
    // Fetch the exam details as well to show questions
    const exam = await Exam.findOne({ slug: examName });
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found." });
    }
    // Combine the result and exam data
    const results = {
      examName: exam.examName,
      questions: exam.questions,
      answers: result.answers, // From Result schema
      timeTaken: result.timeTaken, // From Result schema
      violences: result.violences,
      startDate: exam.startDate,
      endDate: exam.endDate,
    };
    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error fetching performance:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};
module.exports = {
  fetch,
  fetchResult,
};
