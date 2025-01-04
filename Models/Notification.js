const mongoose = require("mongoose");
const User = require("./User");
const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  message: { type: String, required: true },
  isRead: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});
const Notification =
  mongoose.models.Notification ||
  mongoose.model("Notification", NotificationSchema);
module.exports = Notification;
