const mongoose = require("mongoose");
const User = require("./User");

const IsInvitedSchema = new mongoose.Schema(
  {
    slug: {
      type: String,
    },
    accessList: [
      {
        email: {
          type: String,
          required: true,
        },
        IsInvited: {
          type: Boolean,
          required: true,
          default: false,
        },
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);
const IsInvited =
  mongoose.models.IsInvited || mongoose.model("IsInvited", IsInvitedSchema);
module.exports = IsInvited;
