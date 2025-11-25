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

//const User = mongoose.model("User", UserSchema);
const User = mongoose.models.User || mongoose.model("User", UserSchema);

// JWT middleware for auth
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Token missing' });

    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: 'Invalid token' });
        req.user = user;
        next();
    });
}

const multer = require('multer');
const path = require('path');

// Configure where files should be stored
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, 'uploads/'); // folder where files are stored
  },
  filename: function(req, file, cb) {
    // Make filename unique by adding timestamp
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Create Multer upload object
const upload = multer({ storage: storage });


// 🔹 SIGNUP API
app.post('/api/signup', async (req, res) => {
    const { email, password, role, name, dob, gender, contact, state } = req.body;

    if (!['athlete', 'sponsor'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ email, password: hashedPassword, role, name, dob, gender, contact, state });
    await newUser.save();

    res.json({ message: 'Signup successful! Please login.' });
});
// upload.single('certificate') means we expect a single file with field name 'certificate'
app.post('/signup', upload.single('certificate'), async (req, res) => {
    // Access file using req.file
    console.log(req.file); // info about uploaded file

    // You can now save req.file.path in the database
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

// Profile API - Get current user's profile info
app.get('/api/profile', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId).select('-password -__v');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
});

// Profile API - Update current user's profile info
app.put('/api/profile', authenticateToken, async (req, res) => {
    console.log("PUT /api/profile called");
    console.log("User ID:", req.user?.id);
    console.log("Data received:", req.body);

    try {
        const userId = req.user.id;
        const updateData = req.body;

        // Prevent updating email and password via this endpoint for now
        delete updateData.email;
        delete updateData.password;

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select('-password -__v');
        console.log("After update:", updatedUser);

        if (!updatedUser) {
            console.log("User not found");
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
        console.error("ERROR IN PUT ROUTE:", error);
        res.status(500).json({ message: 'Server error', error });
    }
});

// Start Server
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));
