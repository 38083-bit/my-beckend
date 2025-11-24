const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['athlete', 'sponsor'] },
    name: { type: String, required: true },
    dateOfBirth: { type: Date, required: false },
    gender: { type: String, required: false },
    contactNumber: { type: String, required: false }
});

module.exports = mongoose.model("User", userSchema);
