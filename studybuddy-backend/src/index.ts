
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import dns from "node:dns";
import authRoutes from "./routes/authRoutes";
import subjectRoutes from "./routes/subjectRoutes";
import assignmentRoutes from "./routes/assignmentRoutes";
import dashboardRoutes from "./routes/dashboardRoutes";
import courseworkRoutes from "./routes/courseworkRoutes";
import studyPreferenceRoutes from "./routes/studyPreferenceRoutes";
import studyPlanRoutes from "./routes/studyPlanRoutes";
import discussionRoutes from "./routes/discussionRoutes";
import discussionReplyRoutes from "./routes/discussionReplyRoutes";
import { createServer } from "node:http";
import { Server } from "socket.io";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4"]);

const app = express();

const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

app.use(cors());
app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static("src/uploads"));


app.use("/api/auth", authRoutes);
app.use("/api/subjects", subjectRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/coursework", courseworkRoutes);
app.use("/api/study-preferences", studyPreferenceRoutes);
app.use("/api/study-plans", studyPlanRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/discussion-replies", discussionReplyRoutes);



app.get("/", (_req, res) => {
  res.status(200).json({
    message: "StudyBuddy API is running!",
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async (): Promise<void> => {
  try {
    const mongoURI = process.env.MONGODB_URI;

    if (!mongoURI) {
      throw new Error("MONGODB_URI is missing in .env");
    }

    await mongoose.connect(mongoURI);
    console.log("MongoDB connected successfully!");

   httpServer.listen(PORT, () => {
  console.log(`StudyBuddy server running on port ${PORT}`);
});
  } catch (error) {
    console.error("Server startup failed:", error);
    process.exit(1);
  }
};

startServer();
