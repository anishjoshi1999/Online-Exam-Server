const User = require("../Models/User");
const Exam = require("../Models/Exam");
const { sendInviteViaEmail } = require("../utils/email");
const { isEmail, normalizeEmail } = require("validator");
const { v4: uuidv4 } = require("uuid");
const {
  uniqueNamesGenerator,
  names,
  starWars,
} = require("unique-names-generator");

const fetchNotification = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. User ID not found.",
      });
    }

    // Fetch notifications for the logged-in user
    // const notifications = await Notification.find({ userId }).sort({ createdAt: -1 });

    // if (!notifications || notifications.length === 0) {
    //   return res.status(404).json({
    //     success: false,
    //     message: "No notifications found for the user.",
    //   });
    // }

    return res.status(200).json({
      success: true,
      message: "Notifications fetched successfully.",
      data: [
        {
          id: "63f1e7c2d5b9c2a1a5bcd123",
          userId: "user12345",
          title: "Exam Access Granted",
          message: "You have been granted access to the Math 101 exam.",
          type: "exam_access",
          isRead: false,
          createdAt: "2025-01-01T10:15:30Z",
          updatedAt: "2025-01-01T10:15:30Z",
        },
        {
          id: "63f1e7c2d5b9c2a1a5bcd124",
          userId: "user12345",
          title: "New Announcement",
          message:
            "The final project submission deadline has been extended to January 15th.",
          type: "announcement",
          isRead: true,
          createdAt: "2025-01-02T08:00:00Z",
          updatedAt: "2025-01-02T08:00:00Z",
        },
        {
          id: "63f1e7c2d5b9c2a1a5bcd125",
          userId: "user12345",
          title: "Reminder",
          message: "Your scheduled Math 101 exam is tomorrow at 10:00 AM.",
          type: "reminder",
          isRead: false,
          createdAt: "2025-01-03T12:45:00Z",
          updatedAt: "2025-01-03T12:45:00Z",
        },
      ],
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);

    res.status(500).json({
      success: false,
      message: "An error occurred while fetching notifications.",
      error: error.message,
    });
  }
};

module.exports = {
  fetchNotification,
};
