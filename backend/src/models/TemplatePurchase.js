import mongoose from "mongoose";
import { TEMPLATE_IDS } from "../config/templates.js";
const schema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    templateId: { type: String, enum: TEMPLATE_IDS, required: true },
    status: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },
    provider: {
      type: String,
      enum: ["razorpay", "simulation"],
      required: true,
    },
    orderId: { type: String, required: true, unique: true },
    paymentId: String,
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, required: true },
    paidAt: Date,
  },
  { timestamps: true },
);
schema.index({ ownerId: 1, templateId: 1, status: 1 });
export default mongoose.model("TemplatePurchase", schema);
