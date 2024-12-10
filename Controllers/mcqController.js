const User = require("../Models/User");
const Exam = require("../Models/Exam");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");
const moment = require('moment-timezone')
const create = async (req, res) => {
  try {
    console.log("Inside create method")
    // let { username } = req.user;
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
      username: "anishjoshi1999@gmail.com",
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
        console.log("Exam created successfully!")
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

module.exports = {
  create,
};
