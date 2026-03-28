import cors from "cors";
import express from "express";
import fs from "node:fs";
import path from "node:path";
import multer from "multer";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.join(__dirname, "public", "uploads");

fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, callback) => {
    callback(null, uploadsDir);
  },
  filename: (_req, file, callback) => {
    const ext = path.extname(file.originalname) || ".png";
    const safeBase = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9-_]/g, "-")
      .slice(0, 40);
    callback(null, `${Date.now()}-${safeBase || "upload"}${ext.toLowerCase()}`);
  },
});

const upload = multer({ storage });
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(uploadsDir));

function resolveUploadPath(uploadPath) {
  if (typeof uploadPath !== "string" || !uploadPath.startsWith("/uploads/")) {
    return null;
  }

  const relativePath = uploadPath.replace("/uploads/", "");
  const resolvedPath = path.resolve(uploadsDir, relativePath);

  if (!resolvedPath.startsWith(uploadsDir)) {
    return null;
  }

  return resolvedPath;
}

function deleteUploadFile(uploadPath) {
  const filePath = resolveUploadPath(uploadPath);
  if (!filePath || !fs.existsSync(filePath)) {
    return;
  }

  fs.unlinkSync(filePath);
}

app.post("/api/upload", upload.single("image"), (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: "No file uploaded." });
    return;
  }

  const previousImagePath = req.body.previousImagePath;
  if (previousImagePath) {
    deleteUploadFile(previousImagePath);
  }

  res.json({
    path: `/uploads/${req.file.filename}`,
    filename: req.file.filename,
  });
});

app.post("/api/delete", (req, res) => {
  const paths = Array.isArray(req.body?.paths) ? req.body.paths : [];

  for (const uploadPath of paths) {
    deleteUploadFile(uploadPath);
  }

  res.json({ ok: true });
});

app.listen(port, () => {
  console.log(`Upload server running at http://localhost:${port}`);
});
