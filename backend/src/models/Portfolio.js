import mongoose from "mongoose";
const item = new mongoose.Schema(
  {
    title: { type: String, trim: true, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 4000 },
    institution: String,
    startDate: String,
    endDate: String,
    technologies: [String],
    imageUrl: String,
    liveUrl: String,
    githubUrl: String,
    featured: { type: Boolean, default: false },
  },
  { _id: true },
);
const portfolioSchema = new mongoose.Schema(
  {
    ownerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    username: {
      type: String,
      lowercase: true,
      trim: true,
      sparse: true,
      unique: true,
    },
    profile: {
      fullName: { type: String, trim: true, maxlength: 100 },
      contactNumber: { type: String, trim: true, maxlength: 30 },
      showContact: { type: Boolean, default: false },
      title: { type: String, trim: true, maxlength: 120 },
      intro: { type: String, trim: true, maxlength: 280 },
      bio: { type: String, trim: true, maxlength: 4000 },
      location: String,
      email: String,
      profileImage: String,
      coverImage: String,
    },
    skills: [String],
    education: [item],
    experience: [item],
    certifications: [item],
    achievements: [item],
    projects: [item],
    socials: { type: Map, of: String, default: {} },
    templateId: {
      type: String,
      enum: ["minimal", "developer", "creative"],
      default: "minimal",
    },
    status: {
      type: String,
      enum: ["draft", "published", "unpublished"],
      default: "draft",
    },
    onboardingStep: { type: Number, default: 0, min: 0, max: 9 },
    publishedAt: Date,
  },
  { timestamps: true, strict: "throw" },
);

export default mongoose.model("Portfolio", portfolioSchema);
