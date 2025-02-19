const mongoose = require("mongoose");
const User = require("./User");

const ParticipantSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
// Add unique compound index for email and slug
ParticipantSchema.index({ email: 1, slug: 1 }, { unique: true });
const Participant =
  mongoose.models.Participant ||
  mongoose.model("Participant", ParticipantSchema);
module.exports = Participant;
