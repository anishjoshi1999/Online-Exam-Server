const Notification = require("../Models/Notification");

const fetchNotification = async (req, res) => {
  try {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized access. User ID not found.",
      });
    }
    const notifications = await Notification.find({
      userId: userId,
    })
      .sort({ createdAt: -1 }) // Sort by createdAt in descending order
      .limit(5); // Limit to the latest 5 results

    res.status(200).json(notifications);
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
