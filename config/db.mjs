import { MongoClient } from "mongodb";

async function connectToMongoDB() {
  const client = new MongoClient(process.env.DATABASE_URL);

  try {
    await client.connect();

    console.log("Connected to MongoDB server");
  } catch (err) {
    console.error("Error connecting to MongoDB:", err);
    throw err;
  }
}

export { connectToMongoDB };
