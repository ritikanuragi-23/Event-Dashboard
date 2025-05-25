const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
app.use(express.json());
app.use(cors());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Ensure uploads directory exists
if (!fs.existsSync('./uploads')) fs.mkdirSync('./uploads');

// Multer setup for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({ storage });

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/eventDB")
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("Connection failed:", err));

const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  date: { type: Date, required: true },
  location: String,
  participants: { type: Number, default: 0, min: 0 },
  type: { type: String, required: true, enum: ["Free", "Paid"] },
  image: String // Store image URL or path
});

const Event = mongoose.model("Event", eventSchema);

// POST: Add a new event with image
app.post("/add-event", upload.single("image"), async (req, res) => {
  try {
    const { name, date, location, participants, type } = req.body;
    const image = req.file ? `/uploads/${req.file.filename}` : "";
    const event = new Event({ name, date, location, participants, type, image });
    await event.validate();
    await event.save();
    res.status(201).send(event);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// PUT: Update event (including optional new image)
app.put("/update-event/:id", upload.single("image"), async (req, res) => {
  try {
    const { name, date, location, participants, type } = req.body;
    let updateData = { name, date, location, participants, type };
    if (req.file) updateData.image = `/uploads/${req.file.filename}`;
    const event = await Event.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
    res.send(event);
  } catch (err) {
    res.status(400).send({ error: err.message });
  }
});

// GET: Retrieve all events
app.get("/events", async (req, res) => {
  const events = await Event.find();
  res.send(events);
});

// DELETE: Remove an event by ID
app.delete("/delete-event/:id", async (req, res) => {
  await Event.findByIdAndDelete(req.params.id);
  res.send({ message: "Event deleted" });
});

app.listen(5000, () => console.log("Server running on port 5000"));
