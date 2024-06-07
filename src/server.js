import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/user.route.mjs";
import { info } from "./helpers/logger.mjs";
import { connectToMongoDB } from "../config/db.mjs";
import { MongoClient } from "mongodb";

const app = express();

connectToMongoDB();



// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api", userRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  const startTime = Date.now();
  let connectTime = null;

  try {
    // Check database connection
    const client = new MongoClient(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true });
    connectTime = Date.now();
    await client.connect();
    connectTime = Date.now() - connectTime;
    client.close();

    const responseTime = Date.now() - startTime;

    res.status(200).json({
      status: 'UP',
      responseTime: responseTime + 'ms',
      connectTime: connectTime + 'ms'
    });
  } catch (error) {
    console.error('Error checking database health:', error);
    res.status(500).json({ status: 'DOWN', message: 'Error checking database health' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server
const PORT = process.env.PORT;
app.listen(PORT, () => {
  info(`Server is running on port ${PORT}`);
});
