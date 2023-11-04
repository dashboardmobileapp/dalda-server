import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userid: {
      type: Number,
      required: true,
      unique: true,
    },
    fcmToken: {
      type: String,
      required: false,
    },
    username: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    designation: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    firstLineManager: {
      type: Number,
      ref: "users",
      required: true,
    },
    secondLineManager: {
      type: Number,
      ref: "users",
      required: true,
    },
    lineDirector: {
      type: Number,
      ref: "users",
      required: true,
    },
    role: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

// Use a virtual field to populate the firstLineManager's details
userSchema.virtual("firstLineManagerDetails", {
  ref: "users",
  localField: "firstLineManager",
  foreignField: "userid",
  justOne: true,
});

// Use a virtual field to populate the secondLineManager's details
userSchema.virtual("secondLineManagerDetails", {
  ref: "users",
  localField: "secondLineManager",
  foreignField: "userid",
  justOne: true,
});
userSchema.virtual("lineDirectorDetails", {
  ref: "users",
  localField: "lineDirector",
  foreignField: "userid",
  justOne: true,
});

// Apply the virtual fields when converting the schema to JSON
userSchema.set("toJSON", { virtuals: true });

export default mongoose.model("users", userSchema);