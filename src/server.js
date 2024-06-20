import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./routes/user.route.mjs";
import inspection from "./routes/inspection.route.mjs"
// import { info } from "./helpers/logger.mjs";
import { connectToMongoDB } from "../config/db.mjs";
import { MongoClient } from "mongodb";
import subscriberRoutes from "./routes/newsletter.route.mjs";
import property from "./routes/property.route.mjs";
import cors from "cors";
import walletRoutes from "./routes/wallet.route.mjs";
import rentApplication from './routes/rentApplication.route.mjs'

import { fileURLToPath } from "url";
import path from "path";


const app = express();

app.use(express.json());

app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (if applicable)
app.use(bodyParser.json());

const corsOptions = {
  origin: "*", // Allows requests from any origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  allowedHeaders: "Content-Type,Authorization",
};

app.use(cors(corsOptions));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the directory for static files
app.use("/property", express.static(path.join(__dirname, "../uploads")));



app.use("/ids" , express.static(path.join(__dirname , "../uploads/RentApplicationDocs")) )

connectToMongoDB();

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api", userRoutes);
app.use("/api", subscriberRoutes);
app.use("/api", property);
app.use("/api", walletRoutes);
app.use("/api" , inspection);
app.use("/api" , rentApplication )





// Health check endpoint
app.get("/api/health", async (req, res) => {
  const startTime = Date.now();
  let connectTime = null;

  try {
    // Check database connection
    const client = new MongoClient(process.env.DATABASE_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    connectTime = Date.now();
    await client.connect();
    connectTime = Date.now() - connectTime;
    client.close();

    const responseTime = Date.now() - startTime;

    res.status(200).json({
      status: "UP",
      responseTime: responseTime + "ms",
      connectTime: connectTime + "ms",
    });
  } catch (error) {
    console.error("Error checking database health:", error);
    res
      .status(500)
      .json({ status: "DOWN", message: "Error checking database health" });
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
  console.log(`Server is running on port ${PORT}`);
});
