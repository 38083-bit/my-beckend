const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    // Common fields
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    dob: { type: Date, required: true },
    gender: { type: String, required: true },
    contact: { type: String, required: true },
    state: { type: String, required: true },
    role: { type: String, required: true },

    // Athlete-specific fields
    sports: String,
    level: String,
    disability: String,
    achievements: String,
    certificate: String, // file path
    coach: String,

    // Sponsor-specific fields
    occupation: String,
    organization: String,
    authenticity: String,
    sponsorshipType: String,
    experience: Number
}, { timestamps: true });
module.exports = mongoose.model("User", userSchema);
