var mongoose = require("mongoose");
var User = require("./User");

var ResultSchema = new mongoose.Schema(
  {
    examName: { type: String, required: true }, // Name of the exam
    userEnrolledInExam: { type: Boolean, default: false, required: true },
    paperSubmittedInExam: { type: Boolean, default: false, required: true },
    examTakenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }, // User ID of the exam taker

    timeTaken: { type: Number, default: 0 }, // Total time taken to complete the exam in seconds
    answers: [
      {
        // Array of answers given by the user
        question: { type: String, required: true }, // Question text
        userAnswer: { type: String }, // User's answer
        correctAnswer: { type: String }, // Correct answer
        isCorrect: { type: Boolean }, // Flag indicating if the answer is correct
      },
    ],
    violences: {
      cursorViolence: {
        cursorCount: { type: Number, default: 0 }, // Number of warning counts for cursor-related violence
        tabSwitchTimestamps: [
          {
            timestamp: { type: Date },
            tab: { type: String },
          },
        ],
      },
    },
  },
  { timestamps: true }
); // Automatically add createdAt and updatedAt fields

// Middleware to check answers and set isCorrect before saving
ResultSchema.pre("save", function (next) {
  this.answers.forEach(function (answer) {
    // Check if the user's answer matches the correct answer
    answer.isCorrect = answer.userAnswer === answer.correctAnswer;
  });

  // Set the updatedAt field
  this.updatedAt = Date.now();

  next();
});

var Result = mongoose.models.Result || mongoose.model("Result", ResultSchema);
module.exports = Result;
