
import mongoose, { Schema, type InferSchemaType } from "mongoose";

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    role: {
      type: String,
      default: "Member",
      trim: true,
      maxlength: 50,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema>;

const User =
  mongoose.models.User ||
  mongoose.model("User", userSchema);

export default User;
