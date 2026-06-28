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

// 2. Tambahkan ini untuk melayani file statis hasil build frontend (HTML, CSS, JS)
// Jalur ini keluar dari backend/src (atau backend/dist) ke root, lalu masuk ke folder frontend/dist
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// 3. Tambahkan catch-all route agar semua rute navigasi diarahkan ke index.html frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

export default app;