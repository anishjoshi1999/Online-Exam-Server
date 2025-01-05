const mongoose = require("mongoose");
const User = require("./User");

const ParticipantSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    slug: {
        type: String,
        required: true,
      },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    invited: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const Participant = mongoose.models.Participant || mongoose.model("Participant", ParticipantSchema);
module.exports = Participant;


