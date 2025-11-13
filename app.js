require("dotenv").config();
const path = require("path");

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const multer = require("multer");
const { v4: uuidv4 } = require("uuid");
const { createServer } = require("node:http");

const feedRoutes = require("./routes/feed");
const authRoutes = require("./routes/auth");
const socket = require("./socket");

const app = express();
const server = createServer(app);

// ------------------ Multer Config ------------------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, uuidv4() + ext);
  },
});

const fileFilter = (req, file, cb) => {
  if (["image/png", "image/jpg", "image/jpeg"].includes(file.mimetype))
    cb(null, true);
  else cb(null, false);
};

// ------------------ Middlewares ------------------
app.use(express.json());
app.use(multer({ storage, fileFilter }).single("image"));
app.use("/images", express.static(path.join(__dirname, "images")));
app.use(cors());

// ------------------ Routes ------------------
app.use("/feed", feedRoutes);
app.use("/auth", authRoutes);

// ------------------ Error Handling ------------------
app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  const data = error.data;
  res.status(status).json({ message, data });
});

// ------------------ MongoDB & Server ------------------
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    const io = socket.init(server);
    io.on("connection", (socket) => {
      console.log("🟢 Client connected");
      // socket.on("disconnect", () => console.log("🔴 Client disconnected"));
    });
    server.listen(8080, () => {
      console.log("🚀 Server running on port 8080");
    });
  })
  .catch((err) => console.log(err));
