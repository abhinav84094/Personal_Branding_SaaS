import mongoose from "mongoose";
import bcrypt from "bcryptjs";
const schema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    password: { type: String, required: true, minlength: 8 },
    passwordConfigured: { type: Boolean, default: true },
    googleId: { type: String, sparse: true, unique: true },
    tokenVersion: { type: Number, default: 0 },
  },
  { timestamps: true },
);
schema.pre("save", async function () {
  if (this.isModified("password"))
    this.password = await bcrypt.hash(this.password, 12);
});
schema.methods.comparePassword = function (value) {
  return bcrypt.compare(value, this.password);
};
export default mongoose.model("User", schema);
