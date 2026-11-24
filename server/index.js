const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const userRoutes = require('./routes/userRoutes');
const blogRoutes = require('./routes/blogRoutes');
const cors = require("cors");

const app = express();
const port = process.env.PORT || 4000;
const mongoUri = process.env.MONGODB_URI;

if (!mongoUri) {
	throw new Error("Missing MONGODB_URI environment variable");
}

// DB:
mongoose.connect(mongoUri);
let db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection Error!"));
db.once("open", () => console.log("We're connected to the cloud database!"));

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);

if (require.main === module) {
	app.listen(port, () => {
		console.log(`API is now online on port ${port}`);
	});
}

module.exports = { app, mongoose };