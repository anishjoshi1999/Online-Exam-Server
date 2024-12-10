const User = require("../Models/User");
const Exam = require("../Models/Exam");
const Result = require("../Models/Result");

const fetchAll = async (req, res) => {
  try {
    console.log("fetch all method invoked");
    const { page = 1, limit = 3 } = req.query;

    const results = await Result.find({ examTakenBy: req.user.userId })
      .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const totalResults = await Result.countDocuments({
      examTakenBy: req.user.userId,
    });
    return res.status(200).json({
      success: true,
      results,
      totalPages: Math.ceil(totalResults / limit),
      currentPage: parseInt(page),
    });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

// const findOne = async (req, res) => {
//   try {
//     console.log("fetch One method invoked");
//     const { examName } = req.body; // Get the username from the authenticated request
//     // Find the result for this exam slug and user
//     const result = await Result.findOne({
//       examName: examName,
//       examTakenBy: req.user.userId,
//     });
//     console.log(result);
//     if (!result) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Result not found for this exam." });
//     }
//     // Fetch the exam details as well to show questions
//     const exam = await Exam.findOne({ slug: examName });
//     if (!exam) {
//       return res
//         .status(404)
//         .json({ success: false, message: "Exam not found." });
//     }
//     // Combine the result and exam data
//     const results = {
//       examName: exam.examName,
//       questions: exam.questions,
//       answers: result.answers, // From Result schema
//       timeTaken: result.timeTaken, // From Result schema
//       violences: result.violences,
//       startDate: exam.startDate,
//       endDate: exam.endDate,
//     };
//     return res.status(200).json({ success: true, results });
//   } catch (error) {
//     console.error("Error fetching performance:", error);
//     return res.status(400).json({ success: false, error: error.message });
//   }
// };

const findOneResult = async (req, res) => {
  try {
    console.log("fetch One Result method invoked");
    // Find the result for this exam slug and user
    const result = await Result.findOne({
      examName: req.params.slug,
      examTakenBy: req.user.userId,
    });
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Result not found for this exam." });
    }
    // Fetch the exam details as well to show questions
    const exam = await Exam.findOne({ slug: req.params.slug });
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
    };
    return res.status(200).json({ success: true, results });
  } catch (error) {
    console.error("Error fetching performance:", error);
    return res.status(400).json({ success: false, error: error.message });
  }
};

module.exports = {
  fetchAll,
  // findOne,
  findOneResult,
};
