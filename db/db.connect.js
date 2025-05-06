import mongoose from "mongoose"
import dotenv from "dotenv"
dotenv.config()

let isConnected = false;

export const connectToDB = async () => {
  if (isConnected) return;

  if (!process.env.DB_CONNECTION) {
    throw new Error("DB_CONNECTION not defined in environment");
  }

  try {
    await mongoose.connect(process.env.DB_CONNECTION, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log("✅ MongoDB connected");
  } catch (err) {
    console.error("❌ MongoDB connection error:", err);
    throw err;
  }
};