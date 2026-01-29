import mongoose from "mongoose";

async function connectToMongoDB() {
  try {
    console.log("...conecting database")
    const client = await mongoose.connect(process.env.DATABASE_URL);
    console.log("Connected to MongoDB server");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

export { connectToMongoDB };

