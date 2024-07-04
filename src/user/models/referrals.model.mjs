import mongoose from "mongoose";

const referralSchema = new mongoose.Schema({
  code: {
    type: String,
    require: true,
  },

  appliedOn: {
    type: [
      {
        userId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        timestamp: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    _id: false,
    default: [],
  },
});

// Pre-save hook to convert the pushed element to an object with a timestamp
referralSchema.pre("save", function (next) {
  // Check if any new element is being pushed to the appliedOn array
  if (this.isModified("appliedOn")) {
    const index = this.appliedOn.length - 1;
    const lastApplied = this.appliedOn[index];

    // Extract userId from the last pushed element
    const userId = lastApplied.userId;

    // Convert the last pushed element to an object with a timestamp
    this.appliedOn[index] = {
      userId: userId,
      timestamp: Date.now(),
    };
  }
  next();
});

const Referral = mongoose.model("Referral", referralSchema);

export { Referral };
