const Notification = require("../Models/Notification");

const bulkNotification = async (users, message) => {
  try {
    // Validate input
    if (!Array.isArray(users) || users.length === 0) {
      throw new Error(
        "User ID list is required and must be a non-empty array."
      );
    }

    if (!message) {
      throw new Error("Notification message is required.");
    }

    // Create an array of notification objects
    const notifications = users.map((user) => ({
      userId: user._id,
      message,
    }));

    // Bulk write the notifications
    const result = await Notification.insertMany(notifications);

    // Return success response
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error("Error creating bulk notifications:", error);

    // Return error details
    return {
      success: false,
      message: "An error occurred while creating the notifications.",
      error: error.message,
    };
  }
};

module.exports = bulkNotification;
