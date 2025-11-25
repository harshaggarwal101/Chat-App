const emailEl = document.getElementById("email");
const otpEl = document.getElementById("otp");
const nameEl = document.getElementById("name");
const passwordEl = document.getElementById("password");

const otpContainer = document.getElementById("otpContainer");
const nameContainer = document.getElementById("nameContainer");
const passwordContainer = document.getElementById("passwordContainer");

const signupBtn = document.getElementById("signupBtn");

let step = 1; // 1 = Send OTP, 2 = Enter OTP, 3 = Create Account


signupBtn.addEventListener("click", async () => {
    const email = emailEl.value.trim();
    const otp = otpEl.value.trim();
    const name = nameEl.value.trim();
    const password = passwordEl.value.trim();

    // STEP 1 → SEND OTP
    if (step === 1) {

        if (!email) {
            alert("Enter email");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email })
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.message || "Error sending OTP");
                return;
            }

            alert("OTP sent to your email!");

            otpContainer.classList.remove("hidden");
            signupBtn.innerText = "Verify OTP";
            step = 2;

        } catch (err) {
            console.error(err);
            alert("Something went wrong sending OTP");
        }
        return;
    }



    // STEP 2 → OTP ENTERED? SHOW NAME + PASSWORD FIELDS
    if (step === 2) {

        if (!otp) {
            alert("Enter the OTP");
            return;
        }

        // OTP is entered → show next fields
        nameContainer.classList.remove("hidden");
        passwordContainer.classList.remove("hidden");
        signupBtn.innerText = "Create Account";
        step = 3;
        return;
    }



    // STEP 3 → CREATE ACCOUNT (VERIFY OTP + SIGNUP)
    if (step === 3) {

        if (!name || !password) {
            alert("Enter name and password");
            return;
        }

        try {
            const res = await fetch("http://localhost:8080/api/auth/verify-otp", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ email, otp, name, password })
            });

            const data = await res.json();

            if (!data.success) {
                alert(data.message || "OTP verification failed");
                return;
            }

            alert("Signup successful!");
            window.location.href = "login.html";

        } catch (err) {
            console.error(err);
            alert("Something went wrong creating account");
        }
    }
});
