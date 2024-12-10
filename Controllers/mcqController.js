const User = require("../Models/User");
const Exam = require("../Models/Exam");
const Result = require("../Models/Result");
const moment = require("moment-timezone");
const {
  calculateExamStatistics,
} = require("../utils/manage-exams/calculateExamStatistics");
const createOne = async (req, res) => {
  try {
    console.log("Inside create method");

    const { examDetails, questions } = req.body;
    // Validate the incoming data structure
    if (!examDetails || !questions) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    const startDateUTC = moment
      .tz(examDetails.startDate, examDetails.timezone)
      .utc()
      .format();
    const endDateUTC = moment
      .tz(examDetails.endDate, examDetails.timezone)
      .utc()
      .format();
    // Create a new exam instance with the received data
    const newExam = new Exam({
      examName: examDetails.examName, // Ensure this is provided
      startDate: startDateUTC, // Ensure it's a Date object
      endDate: endDateUTC, // Ensure it's a Date object
      totalMarks: examDetails.totalMarks,
      timezone: examDetails.timezone,
      passMarks: examDetails.passMarks,
      userId: req.user.userId,
      questions: questions.map((question) => ({
        question: question.question,
        options: question.options,
        correctAnswer: question.correctAnswer,
        weight: question.weight,
        explanation: question.explanation,
      })),
    });
    try {
      // Save the new exam to the database
      await newExam.save(); // Save the exam with the generated slug
      console.log("Exam created successfully!");
      return res
        .status(201)
        .json({ message: "Exam created successfully!", slug: newExam.slug });
    } catch (error) {
      console.error(error); // Improved error logging
      return res.status(400).json({ success: false, error: error.message });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error during registration", error: error.message });
  }
};

const findAll = async (req, res) => {
  try {
    const { page = 1, limit = 3 } = req.query; // Default to page 1 and limit 10

    const exams = await Exam.find({ userId: req.user.userId, isDeleted: false })
      .sort({ createdAt: -1 }) // Sort by `createdAt` in descending order
      .skip((page - 1) * limit)
      .limit(parseInt(limit)); // Use `skip` and `limit` for pagination

    const examsInformation = await Exam.find({ userId: req.user.userId })
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
    // Find the exam by slug
    const exam = await Exam.findOne({
      userId: req.user.userId,
      slug: req.params.slug,
      isDeleted: false
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
      { userId: req.user.userId, slug: req.params.slug,isDeleted: false },
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
