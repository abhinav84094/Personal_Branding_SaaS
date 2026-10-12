import mongoose from "mongoose";
const schema = new mongoose.Schema(
  {
    username: { type: String, required: true, index: true },
    day: { type: String, required: true },
    views: { type: Number, default: 0 },
  },
  { timestamps: true },
);
schema.index({ username: 1, day: 1 }, { unique: true });
export default mongoose.model("PortfolioView", schema);
