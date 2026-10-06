import "dotenv/config";
import path from "node:path";
import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth";
import productRoutes from "./routes/products";
import brandRoutes from "./routes/brands";
import newsRoutes from "./routes/news";
import uploadRoutes from "./routes/uploads";

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || "*" }));
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (_req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/news", newsRoutes);
app.use("/api/uploads", uploadRoutes);

app.use((_req, res) => res.status(404).json({ error: "Not found" }));

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
