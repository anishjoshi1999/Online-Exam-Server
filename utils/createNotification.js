const Notification = require("../Models/Notification");
const createNotification = async (userId, message) => {
  try {
    // Validate input
    if (!userId) {
      throw new Error("User ID is required.");
    }

    if (!message) {
      throw new Error("Notification message is required.");
    }

    // Create and save the notification
    const notification = new Notification({ userId, message });
    await notification.save();

    // Return the created notification
    return {
      success: true,
      data: notification,
    };
  } catch (error) {
    console.error("Error creating notification:", error);

    // Return error details
    return {
      success: false,
      message: "An error occurred while creating the notification.",
      error: error.message,
    };
  }
};

module.exports = createNotification;
