const express = require('express');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = 'your-secret-key'; // Change this later

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose.connect("mongodb+srv://38083_db_user:Athlete2025@cluster0.9hqwsbq.mongodb.net/athleteConnectDB?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch(err => console.error("MongoDB connection error:", err));

// MongoDB User Schema
const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, required: true }
});

const User = mongoose.model("User", UserSchema);

// 🔹 SIGNUP API
app.post('/api/signup', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        if (!['athlete', 'sponsor'].includes(role)) {
            return res.status(400).json({ message: "Invalid role" });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        await User.create({ email, password: hashedPassword, role });

        res.json({ message: "Signup successful! Please login." });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// 🔹 LOGIN API
app.post('/api/login/:role', async (req, res) => {
    try {
        const { role } = req.params;
        const { email, password } = req.body;

        const user = await User.findOne({ email, role });
        if (!user) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            return res.status(401).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, role: user.role },
            JWT_SECRET,
            { expiresIn: "1h" }
        );

        res.json({ message: "Login successful", token });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
