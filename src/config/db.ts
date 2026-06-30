import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/ChildGuard"
    );
    console.log("Connected to DB");
  } catch (error) {
    console.error("MongoDB connection error:", error);
  }
};
