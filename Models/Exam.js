const mongoose = require("mongoose");
const slugify = require("slugify"); // Import slugify package
const User = require("./User");

var QuestionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  options: { type: [String], required: true },
  correctAnswer: {
    type: String,
    required: true,
    set: function (value) {
      return value.toLowerCase(); // Set method to convert to lowercase
    },
  },
  weight: { type: Number, default: 1 },
  explanation: { type: String, default: "" },
});

var ExamSchema = new mongoose.Schema(
  {
    examName: { type: String, required: true },
    slug: { type: String, unique: true }, // Slug field
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    totalMarks: { type: Number, required: true },
    passMarks: { type: Number, required: true },
    questions: [QuestionSchema], // Embed the questions schema
    timezone: { type: String, required: true },
    showResult: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Pre-save middleware to generate slug
ExamSchema.pre("save", async function (next) {
  let self = this;
  if (this.examName || this.isModified("examName")) {
    try {
      const count = await mongoose.models.Exam.countDocuments({});
      self.slug = slugify(self.examName + " " + (count + 1), {
        lower: true,
        strict: true,
      });
      next();
    } catch (err) {
      next(err); // Handle any errors
    }
  } else {
    next();
  }
});

const Exam = mongoose.models.Exam || mongoose.model("Exam", ExamSchema);
module.exports = Exam;
