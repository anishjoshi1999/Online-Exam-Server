const User = require("../Models/User");
const Exam = require("../Models/Exam");
const Result = require("../Models/Result");


const fetchExam = async (req, res) => {
  try {
    try {
     
      return res.status(200).json({ success: true });
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

module.exports = {
  fetchExam,
 
};
