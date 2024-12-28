const User = require("../Models/User");
const { Resource, Subject } = require("../Models/Resource");

const uploadNotes = async (req, res) => {
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
      resourceLink: googleDriveLink,
      createdBy: req.user.userId,
      resourceType: "notes",
    });

    // Save the new resource instance
    await newResource.save();
    return res.status(201).json({ message: "Lectures uploaded successfully!" });
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
const uploadLectures = async (req, res) => {
  try {
    console.log(req.body);
    const { title, description, youtubeLink, subjectName } = req.body;
    // Validate the incoming data structure
    if (!title || !description || !youtubeLink || !subjectName) {
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
      category: "others",
      resourceLink: youtubeLink,
      createdBy: req.user.userId,
      resourceType: "lectures",
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

const fetchNotes = async (req, res) => {
  try {
    // Check if the subject exists or create a new one
    let resources = await Resource.find({
      createdBy: req.user.userId,
      resourceType: "notes",
    }).populate("subjectName", "name");
    // Step 2: Create a count of notes grouped by subject
    const subjectCount = resources.reduce((acc, resource) => {
      const subjectName = resource.subjectName?.name || "Unknown"; // Ensure subject name exists
      if (!acc[subjectName]) {
        acc[subjectName] = 0;
      }
      acc[subjectName]++;
      return acc;
    }, {});
    // Step 3: Transform subjectCount into an array of objects with subjectName and count
    const result = Object.keys(subjectCount).map((subjectName) => ({
      subjectName,
      count: subjectCount[subjectName],
    }));
    console.log(result);
    if (!resources) {
      return res.status(404).json({ message: "No notes found" });
    }
    return res.status(200).json({ result });
  } catch (error) {
    console.error(error); // Improved error logging
    return res
      .status(500)
      .json({ message: "Error while fetching notes", error: error.message });
  }
};
const fetchLectures = async (req, res) => {
  try {
    // Check if the subject exists or create a new one
    let lectures = await Resource.find({
      createdBy: req.user.userId,
      resourceType: "lectures",
    }).populate("subjectName", "name");
    // Step 2: Create a count of notes grouped by subject
    const lectureCount = lectures.reduce((acc, resource) => {
      const subjectName = resource.subjectName?.name || "Unknown"; // Ensure subject name exists
      if (!acc[subjectName]) {
        acc[subjectName] = 0;
      }
      acc[subjectName]++;
      return acc;
    }, {});
    // Step 3: Transform subjectCount into an array of objects with subjectName and count
    const result = Object.keys(lectureCount).map((subjectName) => ({
      subjectName,
      count: lectureCount[subjectName],
    }));
    if (!lectures) {
      return res.status(404).json({ message: "No lectures found" });
    }
    return res.status(200).json({ result });
  } catch (error) {
    console.error(error); // Improved error logging
    return res.status(500).json({
      message: "Error while fetching all lectures",
      error: error.message,
    });
  }
};
const fetchSubjectNotes = async (req, res) => {
  try {
    // Grab the subjectName parameter from req.query
    const { subjectName } = req.query;
    // Check if the subject exists or create a new one
    let resources = await Resource.find({
      createdBy: req.user.userId,
      resourceType: "notes",
    }).populate("subjectName", "name");
    if (!resources) {
      return res.status(404).json({ message: "No notes found" });
    }

    // Filter the resources based on the subjectName
    let filteredResources = resources.filter(
      (resource) =>
        resource.subjectName.name.toLowerCase() === subjectName.toLowerCase()
    );
    return res.status(200).json({ resources: filteredResources });
  } catch (error) {
    console.error(error); // Improved error logging
    return res.status(500).json({
      message: "Error while fetching all lectures",
      error: error.message,
    });
  }
};

const fetchSubjectLectures = async (req, res) => {
  try {
    // Grab the subjectName parameter from req.query
    const { subjectName } = req.query;
    // Check if the subject exists or create a new one
    let resources = await Resource.find({
      createdBy: req.user.userId,
      resourceType: "lectures",
    }).populate("subjectName", "name");
    if (!resources) {
      return res.status(404).json({ message: "No lectures found" });
    }

    // Filter the resources based on the subjectName
    let filteredResources = resources.filter(
      (resource) =>
        resource.subjectName.name.toLowerCase() === subjectName.toLowerCase()
    );
    return res.status(200).json({ resources: filteredResources });
  } catch (error) {
    console.error(error); // Improved error logging
    return res.status(500).json({
      message: "Error while fetching all lectures",
      error: error.message,
    });
  }
};
module.exports = {
  uploadNotes,
  fetchSubjects,
  uploadLectures,
  fetchNotes,
  fetchLectures,
  fetchSubjectNotes,
  fetchSubjectLectures
};
