function showSignup() {
    document.getElementById("selection-view").style.display = "none";
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById("signup-form").classList.add('active');
}

function showSelection() {
    document.getElementById("selection-view").style.display = "contents";
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
    });
}

async function handleSignup(event) {
    event.preventDefault();

    const name = document.getElementById("signup-name").value.trim();
    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const dateOfBirth = document.getElementById("signup-dob").value;
    const gender = document.getElementById("signup-gender").value;
    const contactNumber = document.getElementById("signup-contact").value.trim();
    const role = document.getElementById("signup-role").value;

    const response = await fetch("https://my-beckend-qqqo.onrender.com/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, dateOfBirth, gender, contactNumber, role })
    });

    const data = await response.json();

    if (response.ok) {
        alert("Signup successful! Please login now.");
        showSelection(); // Go back to login page
    } else {
        alert(data.message || "Signup failed");
    }
}

function showPage(pageId) {
    document.querySelectorAll('.page').forEach(page => {
        page.classList.remove('active');
    });
    document.getElementById(pageId).classList.add('active');
    window.scrollTo(0, 0);
}

function showLogin(type) {
    showPage('login');
    showLoginForm(type);
}

function showLoginForm(type) {
    document.getElementById('selection-view').style.display = 'none';
    document.querySelectorAll('.login-form').forEach(form => {
        form.classList.remove('active');
    });
    document.getElementById(type + '-form').classList.add('active');
}

async function handleLogin(event, type) {
    event.preventDefault();
    const email = document.getElementById(type + '-email').value;
    const password = document.getElementById(type + '-password').value;

    try {
        const response = await fetch('https://my-beckend-qqqo.onrender.com/api/login/' + type, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();
        if (response.ok) {
            localStorage.setItem('token', data.token);
            updateNavLinks();
            showPage('profile');
            await loadProfile();
        } else {
            alert(data.message);
        }
    } catch (error) {
        alert('Error: ' + error.message);
    }
}

function updateNavLinks() {
    const navLinksContainer = document.querySelector('.nav-links');
    const token = localStorage.getItem('token');
    navLinksContainer.innerHTML = '';
    if (token) {
        navLinksContainer.innerHTML = `
            <a href="#" onclick="showPage('home')">Home</a>
            <a href="#" onclick="showPage('profile')">Profile</a>
            <a href="#" onclick="handleLogout()">Logout</a>
        `;
    } else {
        navLinksContainer.innerHTML = `
            <a href="#" onclick="showPage('home')">Home</a>
            <a href="#" onclick="showPage('login')">Login</a>
        `;
    }
}

async function loadProfile() {
    const token = localStorage.getItem('token');
    if (!token) {
        showPage('login');
        return;
    }
    try {
        const response = await fetch('https://my-beckend-qqqo.onrender.com/api/profile', {
            headers: { 'Authorization': 'Bearer ' + token }
        });
        const profile = await response.json();
        if (response.ok) {
            document.getElementById('profile-email').textContent = profile.email || '';
            document.getElementById('profile-role').textContent = profile.role || '';
            document.getElementById('profile-name').textContent = profile.name || '';
            document.getElementById('profile-dob').textContent = profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '';
            document.getElementById('profile-occupation').textContent = profile.occupation || '';
        } else {
            alert(profile.message || 'Failed to load profile');
            if (response.status === 401) {
                handleLogout();
            }
        }
    } catch (error) {
        alert('Error loading profile: ' + error.message);
    }
}

function handleLogout() {
    localStorage.removeItem('token');
    updateNavLinks();
    showPage('home');
}

// Initial navigation update on page load
document.addEventListener('DOMContentLoaded', () => {
    updateNavLinks();
});
