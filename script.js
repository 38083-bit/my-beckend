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
    const dob = document.getElementById("signup-dob").value;
    const gender = document.getElementById("signup-gender").value;
    const contact = document.getElementById("signup-contact").value.trim();
    const state = document.getElementById("signup-state").value.trim();
    const role = document.getElementById("signup-role").value;

    const response = await fetch("https://my-beckend-qqqo.onrender.com/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, dob, gender, contact, state, role })
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

// Populate profile form and show role-specific fields
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
            document.getElementById('profile-email').value = profile.email || '';
            document.getElementById('profile-role').value = profile.role || '';
            document.getElementById('profile-name').value = profile.name || '';
            document.getElementById('profile-dob').value = profile.dob ? profile.dob.substring(0,10) : '';
            document.getElementById('profile-gender').value = profile.gender || '';
            document.getElementById('profile-contact').value = profile.contact || '';
            document.getElementById('profile-state').value = profile.state || '';

            // Role specific fields
            if (profile.role === 'athlete') {
                document.getElementById('profile-athlete-fields').style.display = 'block';
                document.getElementById('profile-sponsor-fields').style.display = 'none';
                document.getElementById('profile-sports').value = profile.sports || '';
                document.getElementById('profile-level').value = profile.level || '';
                document.getElementById('profile-disability').value = profile.disability || 'none';
                document.getElementById('profile-achievements').value = profile.achievements || '';
                // Certificate upload field left empty, user can upload new if desired
                document.getElementById('profile-coach').value = profile.coach || '';
            } else if (profile.role === 'sponsor') {
                document.getElementById('profile-athlete-fields').style.display = 'none';
                document.getElementById('profile-sponsor-fields').style.display = 'block';
                document.getElementById('profile-occupation').value = profile.occupation || '';
                document.getElementById('profile-organization').value = profile.organization || '';
                document.getElementById('profile-authenticity').value = profile.authenticity || '';
                document.getElementById('profile-sponsorshipType').value = profile.sponsorshipType || '';
                document.getElementById('profile-experience').value = profile.experience || '';
            } else {
                document.getElementById('profile-athlete-fields').style.display = 'none';
                document.getElementById('profile-sponsor-fields').style.display = 'none';
            }
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

// Handle profile update form submission
async function handleProfileUpdate(event) {
    event.preventDefault();
    const token = localStorage.getItem('token');
    if (!token) {
        showPage('login');
        return;
    }

    const form = document.getElementById('profile-form');
    const formData = new FormData(form);

    // Prepare a plain object for JSON body, excluding file for certificate (upload handling omitted)
    const updateData = {};

    formData.forEach((value, key) => {
        if (key === 'certificate') {
            // Skip file input for now
            return;
        }
        if (key === 'dob') {
            updateData['dob'] = value ? new Date(value) : null;
        } else {
            updateData[key] = value;
        }
    });

    try {
        const response = await fetch('https://my-beckend-qqqo.onrender.com/api/profile', {
            method: 'PUT',
            headers: {
                //'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            //body: JSON.stringify(updateData)
            body:formData
        });

        //const data = await response.json();
        const text = await response.text(); // Read raw response
        console.log(text);

        let data;
        try {
            data = JSON.parse(text);
        } catch {
            alert("Server returned non-JSON:\n" + text);
            return;
        }

        if (response.ok) {
            alert('Profile updated successfully.');
            await loadProfile();
        } else {
            alert(data.message || 'Failed to update profile.');
        }
    } catch (error) {
        alert('Error updating profile: ' + error.message);
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
