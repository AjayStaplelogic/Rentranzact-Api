import express from 'express';
import bodyParser from 'body-parser'
import userRoutes from './routes/User.mjs'
import { info } from './helpers/logger.mjs';
import {connectToMongoDB} from '../config/db.mjs'

const app = express();

connectToMongoDB();
//hhkjhkjhjkh

// Middleware
app.use(bodyParser.json());

// Routes
app.use("/api", userRoutes);


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
