
import mongoose from "mongoose";

async function connectDB(): Promise<void> {
  try {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
      throw new Error("MONGODB_URI is missing from the .env file");
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
    });

    console.log("✅ MongoDB connected successfully");
    console.log("Database:", mongoose.connection.name);
  } catch (error: unknown) {
    console.error("❌ MongoDB connection failed:");
    console.error(error instanceof Error ? error.message : "Unknown error");
    throw error;
  }
}

export default connectDB;
