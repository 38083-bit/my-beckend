const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;
const JWT_SECRET = 'your-secret-key';  // Change this in production

// Middleware
app.use(cors());  // Allow frontend requests
app.use(express.json());  // Parse JSON bodies
app.use(express.static(path.join(__dirname, 'public')));  // Serve static files (put your HTML in 'public' folder)

// In-memory user storage (replace with DB in production)
let users = [
    // Sample users (passwords are hashed for 'password123')
    { id: 1, email: 'athlete@example.com', password: '$2a$10$example.hash.for.athlete', role: 'athlete' },
    { id: 2, email: 'sponsor@company.com', password: '$2a$10$example.hash.for.sponsor', role: 'sponsor' }
];

// Helper to hash passwords (for future registration)
async function hashPassword(password) {
    return await bcrypt.hash(password, 10);
}

// API Routes
app.post('/api/login/:role', async (req, res) => {
    const { role } = req.params;
    const { email, password } = req.body;

    // Validate role
    if (!['athlete', 'sponsor'].includes(role)) {
        return res.status(400).json({ message: 'Invalid role' });
    }

    // Find user
    const user = users.find(u => u.email === email && u.role === role);
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Login successful', token });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));  // Assuming your HTML is named 'index.html'
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});