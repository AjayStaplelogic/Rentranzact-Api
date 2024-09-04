import express from "express";
import bodyParser from "body-parser";
import userRoutes from "./user/routes/user.route.mjs";
import inspection from "./user/routes/inspection.route.mjs"
// import { info } from "./helpers/logger.mjs";
import { connectToMongoDB } from "../config/db.mjs";
import { MongoClient } from "mongodb";
import subscriberRoutes from "./user/routes/newsletter.route.mjs";
import property from "./user/routes/property.route.mjs";
import cors from "cors";
import walletRoutes from "./user/routes/wallet.route.mjs";
import rentApplication from './user/routes/rentApplication.route.mjs'
import webhookRoutes from "./user/routes/webhook.route.mjs"
import stripeRoutes from "./user/routes/stripe.route.mjs"
import dashboardRoutes from "./user/routes/dashboard.route.mjs"
import notificationRoutes from "./user/routes/notification.route.mjs"
import transactionRoutes from "./user/routes/transaction.route.mjs"
import rentingHistoryRoutes from "./user/routes/rentingHistory.route.mjs";
import maintenanceRoutes from "./user/routes/maintenance.route.mjs"
import dummyRoutes from "./user/routes/dummy.route.mjs"
import calenderRoutes from "./user/routes/calender.route.mjs"
import reviewRoutes from "./user/routes/review.route.mjs"
import uploadRoutes from "./user/routes/upload.route.mjs"
import userBlogRoutes from "./user/routes/blog.route.mjs"
import userNewsLetterSubscription from "./user/routes/newlettersubscription.route.mjs";
import userCardRoutes from "./user/routes/cards.route.mjs";
import electricityRoutes from "./user/routes/electricity.route.mjs"

//admin imports
import adminRoutes from "./admin/routes/admin.route.mjs"
import adminDashboardRoutes from "./admin/routes/dashboard.route.mjs"
import manageuserRoutes from "./admin/routes/manageruser.route.mjs"
import propertyRoutes from "./admin/routes/properties.route.mjs"
import roleRoutes from "./admin/routes/role.route.mjs"
import employeeRoutes from "./admin/routes/manageemployee.route.mjs"
import transactionAdminRoutes from "./admin/routes/transaction.route.mjs"
import financeRoute from "./admin/routes/finance.route.mjs";
import activityRoute from "./admin/routes/activity.route.mjs"
import adminBlogRoutes from "./admin/routes/blog.route.mjs";
import adminSiteContentRoutes from "./admin/routes/sitecontents.route.mjs"
import adminCareerRoutes from "./admin/routes/careers.route.mjs";
import adminNewsLetterSubscriptions from "./admin/routes/newslettersubscription.route.mjs"
import adminTestimonialRoutes from "./admin/routes/testimonials.route.mjs";
import adminFaqRoutes from "./admin/routes/faq.route.mjs";
import adminSocialMediaIconRoutes from "./admin/routes/socialmediaicons.route.mjs"

import { fileURLToPath } from "url";
import path from "path";
import http from "http";

import admin from 'firebase-admin'
import serviceAccount from "./user/helpers/serviceAccount.js";
import io from "./user/services/socket.service.mjs"
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Parse JSON bodies (if applicable)
app.use(bodyParser.json());

const corsOptions = {
  origin: "*", // Allows requests from any origin
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  // allowedHeaders: "Content-Type,Authorization",
};

app.use(cors());


// app.use(cors(corsOptions));

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Define the directory for static files
app.use("/property", express.static(path.join(__dirname, "../uploads")));

app.use(express.static(path.join(__dirname, "../apidoc")))

app.use("/ids", express.static(path.join(__dirname, "../uploads/RentApplicationDocs")))
app.use(express.static(path.join(__dirname, "../uploads")))

connectToMongoDB();

// Middleware
app.use(bodyParser.json());

// user Routes
app.use("/api", userRoutes);
app.use("/api", subscriberRoutes);
app.use("/api", property);
app.use("/api", walletRoutes);
app.use("/api", inspection);
app.use("/api", rentApplication)
app.use("/api/webhook", webhookRoutes)
app.use("/api", stripeRoutes)
app.use("/api", dashboardRoutes)
app.use("/api", notificationRoutes)
app.use("/api", transactionRoutes)
app.use("/api", rentingHistoryRoutes)
app.use("/api", maintenanceRoutes)
app.use("/api", calenderRoutes)
app.use("/api/dummy", dummyRoutes)
app.use("/api", reviewRoutes)
app.use("/api", uploadRoutes)
app.use("/api", userBlogRoutes)
app.use("/api", userNewsLetterSubscription)
app.use("/api", userCardRoutes)
app.use("/api" , electricityRoutes)


//admin
app.use("/api/admin", adminRoutes)
app.use("/api/admin", adminDashboardRoutes)
app.use("/api/admin", manageuserRoutes)
app.use("/api/admin", propertyRoutes)
app.use("/api/admin", roleRoutes)
app.use("/api/admin", employeeRoutes)
app.use("/api/admin", transactionAdminRoutes)
app.use("/api/admin", financeRoute)
app.use("/api/admin", activityRoute)
app.use("/api/admin", adminBlogRoutes)
app.use("/api/admin", adminSiteContentRoutes)
app.use("/api/admin", adminCareerRoutes)
app.use("/api/admin", adminNewsLetterSubscriptions)
app.use("/api/admin", adminTestimonialRoutes)
app.use("/api/admin", adminFaqRoutes)
app.use("/api/admin", adminSocialMediaIconRoutes)

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
  console.log(`[Server] : ${err}`)
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Start the server

const server = http.createServer(app);
io.attach(server, {
  rejectUnauthorized: false,
  cors: {
    origin: '*',
  }
});

const PORT = process.env.PORT;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});


export default admin;