import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },
    endsAt: { type: Date, required: true },
    appliedOrderIds: { type: [String], default: [] },
  },
  { timestamps: true },
);
export default mongoose.model("SubscriptionTerm", schema);
