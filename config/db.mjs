import mongoose from "mongoose";

async function connectToMongoDB() {
  try {
    console.log(process.env.TEST_SECRET, '===============process.env.TEST_SECRET');
    console.log(process.env.TEST_VARIABLE, '===============process.env.TEST_VARIABLE');
    const client = await mongoose.connect(process.env.DATABASE_URL);

    console.log("Connected to MongoDB server");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

export { connectToMongoDB };

