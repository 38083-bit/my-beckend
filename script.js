function showSignup() {
    document.getElementById("athlete-form").style.display = "none";
    document.getElementById("sponsor-form").style.display = "none";
    document.getElementById("signup-form").style.display = "block";
}

function showSelection() {
    document.getElementById("signup-form").style.display = "none";
    document.getElementById("athlete-form").style.display = "none";
    document.getElementById("sponsor-form").style.display = "none";
    document.getElementById("role-selection").style.display = "block";
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
