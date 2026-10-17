import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["pending", "active", "expired", "cancelled", "failed"],
      default: "pending",
    },
    provider: {
      type: String,
      enum: ["simulation", "razorpay"],
      required: true,
    },
    orderId: { type: String, unique: true, sparse: true },
    paymentId: String,
    planId: String,
    planName: String,
    amount: Number,
    currency: String,
    periodDays: Number,
    renewal: { type: Boolean, default: false },
    validityAppliedAt: Date,
    startsAt: Date,
    endsAt: Date,
    processedEvents: { type: [String], default: [] },
  },
  { timestamps: true },
);
export default mongoose.model("Subscription", schema);
