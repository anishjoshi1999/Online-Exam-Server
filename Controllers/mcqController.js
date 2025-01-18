const User = require("../Models/User");
const Exam = require("../Models/Exam");
const Result = require("../Models/Result");
const moment = require("moment-timezone");
const {
  calculateExamStatistics,
} = require("../utils/manage-exams/calculateExamStatistics");
const { CheckIfUserIsAdmin } = require("../utils/CheckIfUserIsAdmin");
const createOne = async (req, res) => {
  try {
    const { examDetails, questions } = req.body;

    // Validate incoming data
    if (!examDetails || !questions) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    // Check if the user is an admin
    if (!(await CheckIfUserIsAdmin(req.user.userId))) {
      return res.status(401).json({ message: "Unauthorized to create exam" });
    }

    const { startDate, endDate, timezone, examName, totalMarks, passMarks } =
      examDetails;

    // Convert dates to UTC
    const startDateUTC = moment.tz(startDate, timezone).utc();
    const endDateUTC = moment.tz(endDate, timezone).utc();

    // Validate date consistency
    if (endDateUTC.isBefore(startDateUTC)) {
      return res.status(400).json({
        success: false,
        message: "End date must not be earlier than start date",
      });
    }
    // Prepare questions data
    const formattedQuestions = questions.map(
      ({ question, options, correctAnswer, weight, explanation }) => ({
        question,
        options,
        correctAnswer,
        weight,
        explanation,
      })
    );
    // Create a new exam instance
    const newExam = new Exam({
      examName,
      startDate: startDateUTC,
      endDate: endDateUTC,
      totalMarks,
      passMarks,
      timezone,
      userId: req.user.userId,
      questions: formattedQuestions,
    });

    // Save exam to the database
    await newExam.save();

    return res.status(201).json({
      success: true,
      message: "Exam created successfully!",
      slug: newExam.slug,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error during exam creation",
      error: error.message,
    });
  }
};

const findAll = async (req, res) => {
  try {
    const { page = 1, limit = 3 } = req.query; // Default to page 1 and limit 10
    if (!CheckIfUserIsAdmin(req.user.userId)) {
      return res
        .status(401)
        .json({ message: "You are not authorized to Create Exam" });
    }

    const exams = await Exam.find({ userId: req.user.userId, isDeleted: false })
      .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
      .skip((page - 1) * limit)
      .limit(parseInt(limit)); // Use `skip` and `limit` for pagination

    const examsInformation = await Exam.find({
      userId: req.user.userId,
      isDeleted: false,
    })
      .select("startDate endDate")
      .exec();
    const examStatistics = calculateExamStatistics(examsInformation);

    return res.status(200).json({
      success: true,
      exams,
      totalPages: Math.ceil(examStatistics.total / limit),
      currentPage: parseInt(page),
      examStatistics,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

const findOne = async (req, res) => {
  try {
    if (!(await CheckIfUserIsAdmin(req.user.userId))) {
      return res
        .status(401)
        .json({ message: "You are not authorized to Search Exam" });
    }
    // Find the exam by slug
    const exam = await Exam.findOne({
      userId: req.user.userId,
      slug: req.params.slug,
      isDeleted: false,
    });
    const formattedStartTime = moment
      .utc(exam.startDate)
      .tz(exam.timezone)
      .format();
    const formattedEndTime = moment
      .utc(exam.endDate)
      .tz(exam.timezone)
      .format();
    exam.startDate = formattedStartTime;
    exam.endDate = formattedEndTime;
    if (!exam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found." });
    }
    return res.status(200).json({ success: true, exam });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

const findOneAndUpdate = async (req, res) => {
  try {
    if (!(await CheckIfUserIsAdmin(req.user.userId))) {
      return res
        .status(401)
        .json({ message: "You are not authorized to Update Exam" });
    }
    console.log("fetchOneUpdate method invoked");
    // const { username } = req.user;
    const { startDate, endDate, timezone, ...updateData } = req.body;
    const startDateUTC = moment.tz(startDate, timezone).utc().format();
    const endDateUTC = moment.tz(endDate, timezone).utc().format();
    // Convert date fields to Date objects
    updateData.startDate = startDateUTC;
    updateData.endDate = endDateUTC;
    updateData.timezone = timezone;
    // Update the exam based on the slug
    const updatedExam = await Exam.findOneAndUpdate(
      { userId: req.user.userId, slug: req.params.slug, isDeleted: false },
      updateData,
      { new: true, runValidators: true } // Return the updated document
    );

    if (!updatedExam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found." });
    }
    res.status(200).json({
      success: true,
      message: "Exam updated successfully!",
      updatedExam,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};

const findOneAndDelete = async (req, res) => {
  try {
    if (!(await CheckIfUserIsAdmin(req.user.userId))) {
      return res
        .status(401)
        .json({ message: "You are not authorized to Delete Exam" });
    }
    // Soft delete the exam by updating the `isDeleted` flag
    const deletedExam = await Exam.findOneAndUpdate(
      {
        userId: req.user.userId,
        slug: req.params.slug,
        isDeleted: false,
      },
      { isDeleted: true }, // Set the `isDeleted` flag to `true`
      { new: true } // Return the updated document
    );

    if (!deletedExam) {
      return res
        .status(404)
        .json({ success: false, message: "Exam not found." });
    }
    const deletedResult = await Result.deleteMany({
      examName: req.params.slug,
    });

    return res.status(200).json({
      success: true,
      message: "Exam and associated results deleted successfully.",
      deletedResultCount: deletedResult.deletedCount,
    });
  } catch (error) {
    return res.status(400).json({ success: false, error: error.message });
  }
};
module.exports = {
  createOne,
  findAll,
  findOne,
  findOneAndUpdate,
  findOneAndDelete,
};
