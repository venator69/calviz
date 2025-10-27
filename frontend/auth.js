// --- Fungsi loginUser yang tadi dihapus dari app.js ---
async function loginUser(name, password) {
  if (!name || !password) return alert("Name dan password wajib diisi");

  try {
    const res = await fetch("https://calviz-server-production.up.railway.app/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, password }),
      credentials: "include" // penting untuk session cookie
    });

    const data = await res.json().catch(() => ({}));
    if (res.ok) {
      console.log("Login sukses", data);
      document.body.classList.add('logged-in');
      alert("Login berhasil!");
      // Gunakan window.location.href untuk redirect, seperti kode asli
      window.location.href = "index.html"; // Mengarahkan ke index.html
    } else {
      alert(`Login gagal: ${data.message || res.status}`);
    }
  } catch (err) {
    console.error("Login error:", err);
    alert("Login error: " + err.message);
  }
}


// --- DOMContentLoaded Listener untuk Form ---
document.addEventListener("DOMContentLoaded", () => {
  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");
  const submitBtn = document.getElementById("submit");

  if (submitBtn && usernameInput && passwordInput) {
    submitBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        
        const nameVal = usernameInput.value.trim();
        const passVal = passwordInput.value.trim();
      
        if (!nameVal || !passVal) return alert("Please fill in all fields!");
        await loginUser(nameVal, passVal);
    });
  }
});