import express from "express";
import cors from "cors";
import router from "./routes/index.js";
import path from "path";
import { fileURLToPath } from "url";

const app = express();

// Konfigurasi pembacaan __dirname untuk ES Modules (TypeScript)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// 2. Melayani file statis hasil build frontend (HTML, CSS, JS)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// 3. PERBAIKAN DI SINI: Menggunakan (.*) untuk Express 5 catch-all route
app.get("(.*)", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

export default app;