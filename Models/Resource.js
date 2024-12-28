const mongoose = require("mongoose");
const User = require("./User");

// Define the Subject Schema
const SubjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model to track who created the subject
      required: true,
    }
  },
  { timestamps: true }
);

const Subject = mongoose.models.Subject || mongoose.model("Subject", SubjectSchema);

// Define the Resource Schema
const ResourceSchema = new mongoose.Schema(
  {
    subjectName: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject", // Referencing Subject model
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      enum: ["notes", "ppt", "assignments", "others"],
      default: "others",
    },
    googleDriveLink: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model to track who uploaded the resource
      required: true,
    },
  },
  { timestamps: true }
);

const Resource = mongoose.models.Resource || mongoose.model("Resource", ResourceSchema);

module.exports = { Resource, Subject };
