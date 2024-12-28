const User = require("../Models/User");
const { Resource, Subject } = require("../Models/Resource");

const uploadOne = async (req, res) => {
  try {
    const { title, description, category, googleDriveLink, subjectName } =
      req.body;
    // Validate the incoming data structure
    if (
      !title ||
      !description ||
      !category ||
      !googleDriveLink ||
      !subjectName
    ) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }

    let userInfo = await User.findById(req.user.userId);
    if (userInfo.role !== "admin") {
      return res
        .status(401)
        .json({ message: "You are not authorized to create a resource" });
    }

    // Check if the subject exists or create a new one
    let subject = await Subject.findOne({
      name: subjectName,
      createdBy: req.user.userId,
    });
    if (!subject) {
      // Create new subject if it doesn't exist
      subject = new Subject({ name: subjectName, createdBy: req.user.userId });
      await subject.save();
    }

    // Create a new resource instance with the received data
    const newResource = new Resource({
      subjectName: subject._id, // Reference to the Subject model
      title: title,
      description: description,
      category: category,
      googleDriveLink: googleDriveLink,
      createdBy: req.user.userId,
    });

    // Save the new resource instance
    await newResource.save();
    return res.status(201).json({ message: "Resource uploaded successfully!" });
  } catch (error) {
    console.error(error); // Improved error logging
    return res
      .status(500)
      .json({ message: "Error during resource upload", error: error.message });
  }
};

const fetchSubjects = async (req, res) => {
  try {
    // Check if the subject exists or create a new one
    let subjects = await Subject.find({ createdBy: req.user.userId });
    if (!subjects) {
      return res.status(404).json({ message: "No subjects found" });
    }
    return res.status(200).json({ subjects });
  } catch (error) {
    console.error(error); // Improved error logging
    return res
      .status(500)
      .json({ message: "Error while fetching subjects", error: error.message });
  }
};

module.exports = {
  uploadOne,
  fetchSubjects,
};
