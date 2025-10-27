// --- Deklarasi Variabel DOM & State ---
const dropArea = document.getElementById('drop-area');
const preview = document.getElementById('preview');
const fileElem = document.getElementById('fileElem');
const emailInput = document.getElementById('email');
const usernameInput = document.getElementById('username');
const passwordInput = document.getElementById('password');
const passwordConfirmInput = document.getElementById('passwordConfirm');
const submitBtn = document.getElementById('submit');
let file = null;
let image = false;

// --- Helper Functions ---
function validEmail(email) {
    const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return pattern.test(email);
}
function validUsername(username) {
    return username.trim() !== "" && !/\s/.test(username);
}
function isValidLength(str) {
    return str.length >= 8 && str.length <= 16; // Direvisi dari 18 sesuai alert Anda
}
function handleFiles(files) {
    const f = files[0];
    if (!f) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.maxWidth = '120px';
        img.style.maxHeight = '90px';
        img.style.margin = '10px';
        preview.innerHTML = '';
        preview.appendChild(img);
    };

    image = true;
    file = f;
    reader.readAsDataURL(f);
}

// --- Submit Function ---
async function submitform(name, password, email, file) {
    const formData = new FormData();
    formData.append('name', name);
    formData.append('password', password);
    formData.append('email', email);
    formData.append('profile', file);

    try {
        const response = await fetch('https://calviz-server-production.up.railway.app/register', {
            method: "POST",
            body: formData
        });

        let data;
        try {
            data = await response.json();
        } catch (err) {
            const text = await response.text();
            console.error("Response is not JSON:", text);
            alert("Registration failed: server returned invalid response");
            return;
        }

        if (response.ok) {
            console.log(data);
            alert("Registered successfully! Redirecting to login...");
            window.location.href = "login.html"; // Redirect ke halaman login
        } else {
            console.error("Registration failed:", data);
            alert(`Registration failed: ${data.message || response.status}`);
        }

    } catch (e) {
        console.error(e);
        alert(`Registration failed: ${e}`);
    }
}

// --- Validation Logic ---
async function isfilledcorrectly(){
    const nameVal = usernameInput.value;
    const passVal = passwordInput.value;
    const emailVal = emailInput.value;

    if (nameVal === "" || passVal === "" || passwordConfirmInput.value === "" || emailVal === "") {
        alert("Please fill in all fields!");
        return;
    }
    if (!image) {
        alert("Please upload a profile picture!");
        return;
    }
    if (passVal !== passwordConfirmInput.value) {
        alert("Passwords do not match!");
        return;
    }
    if (!validUsername(nameVal) || !validUsername(passVal)) {
        alert("username or password can't include space");
        return;
    }
    if (!isValidLength(nameVal) || !isValidLength(passVal)) {
        alert("username or password have to be between 8 to 16 letters and may include special characters and numbers");
        return;
    }
    if (!validEmail(emailVal)){
        alert("Please Enter the right Email Format!");
        return;
    }
    
    // Jika semua validasi lolos, submit form
    try {
        await submitform(nameVal, passVal, emailVal, file);
    } catch (err) {
        alert(`Error submitting form. Please try again. error : ${err}`);
        console.error(err);
    }
}

// --- Event Listeners ---
document.addEventListener("DOMContentLoaded", () => {

    // Form Submit Listener
    if (submitBtn) {
        submitBtn.addEventListener('click', isfilledcorrectly);
    }

    // Drag & Drop Listeners
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        if(dropArea) dropArea.addEventListener(eventName, e => e.preventDefault());
    });
    dropArea.addEventListener('click', () => fileElem.click());
    fileElem.addEventListener('change', (e) => handleFiles(e.target.files));

    // Drag UI Listeners
    dropArea.addEventListener('dragover', () => { dropArea.style.backgroundColor = '#e0e0e0'; });
    dropArea.addEventListener('dragleave', () => { dropArea.style.backgroundColor = ''; });
    dropArea.addEventListener('drop', (e) => {
        dropArea.style.backgroundColor = '';
        const files = e.dataTransfer.files;
        handleFiles(files);
    });
});