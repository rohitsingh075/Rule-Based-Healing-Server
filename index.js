// server.js
import express from 'express';
import path from 'path';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import { fileURLToPath } from 'url';

// Import your modules
import connectDB from './config/db.js';
import userRouter from './routes/user.router.js';
import eventRoutes from './routes/event.route.js';
import noticeRoutes from './routes/notice.route.js';
import studentRoutes from './routes/student.route.js';
import galleryRoutes from './routes/gallery.route.js';
import verifyUser from './routes/verify.route.js';

// Load environment variables
dotenv.config({ path: './.env' });

// Initialize Express app
const app = express();

// Get __dirname in ES module scope
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const clientUrl = process.env.CLIENT_URL;

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://ncrcollegetdledu.org.in",
      "https://www.ncrcollegetdledu.org.in",
    ],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/", userRouter);
app.use("/user", verifyUser);
app.use("/events", eventRoutes);
app.use("/notices", noticeRoutes);
app.use("/students", studentRoutes);
app.use("/gallery", galleryRoutes);

// Connect to DB and start server
connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.log("Some Error Happened in server.js before listening to app");
    });

    const PORT = process.env.PORT || 8080;
    app.listen(PORT, () => {
      console.log({
        serverStatus: "Server is Running",
        URL: `http://localhost:${PORT}`,
      });
    });
  })
  .catch((error) => {
    console.log("DB connection Failed from server.js", error);
  });
