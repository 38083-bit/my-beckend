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

    const email = document.getElementById("signup-email").value.trim();
    const password = document.getElementById("signup-password").value.trim();
    const role = document.getElementById("signup-role").value;

    const response = await fetch("https://my-beckend-qqqo.onrender.com/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
    });

    const data = await response.json();

    if (response.ok) {
        alert("Signup successful! Please login now.");
        showSelection(); // Go back to login page
    } else {
        alert(data.message || "Signup failed");
    }
}
