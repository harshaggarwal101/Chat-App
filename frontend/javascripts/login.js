document.getElementById("loginBtn").addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!email || !password) {
        alert("Please enter all fields");
        return;
    }

    try {
        const res = await fetch("http://localhost:8080/api/auth/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();

        if (!data.success) {
            alert(data.message || "Login failed");
            return;
        }

        // redirect to chat page
        window.location.href = "chat.html";

    } catch (err) {
        console.error(err);
        alert("Something went wrong");
    }
});
