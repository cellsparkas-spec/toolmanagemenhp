import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import path from "path";

const app = express();

const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:5173", "http://localhost:4173"];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// 1. Rute API utama Anda (Biarkan tetap di atas)
app.use("/api", router);

console.log("Current directory:", process.cwd());
const frontendPath = path.join(process.cwd(), "frontend", "dist");

console.log("Frontend path:", frontendPath);

app.use(express.static(frontendPath));

app.get("*", (req, res) => {
  if (req.path.startsWith("/api")) {
    return res.status(404).json({ message: "API route not found" });
  }

  res.sendFile(path.join(frontendPath, "index.html"));
});

export default app;