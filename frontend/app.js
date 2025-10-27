// -----------------------------
// LOGOUT FUNCTION
// -----------------------------
async function logout() {
  try {
    const res = await fetch("https://calviz-server-production.up.railway.app/logout", {
      method: "POST",
      credentials: "include",
    });

    console.log("Logout status:", res.status);
    const data = await res.json().catch(() => ({}));
    console.log("Logout response:", data);

    if (res.ok) {
      await handleLoginState();
      const logoutMenu = document.querySelector(".dropdown-content");
      if (logoutMenu) {
        logoutMenu.classList.remove("show-dropdown");
      }
    } else {
      alert("Logout gagal: " + (data.message || res.status));
    }
  } catch (err) {
    console.error("Logout error:", err);
  }
}

// -----------------------------
// PROFILE CHECK FUNCTION
// -----------------------------
async function handleLoginState() {
  try {
    const res = await fetch("https://calviz-server-production.up.railway.app/profile", {
      method: "GET",
      credentials: "include",
    });
    const data = await res.json().catch(() => ({}));
    const loginLink = document.querySelector(".login");
    const profilePic = document.querySelector("#pp");
    const usernameLabel = document.querySelector("#username");
    const moduleCards = document.querySelectorAll(".module-status-card");

    if (res.ok && data.name) {
      // Logged In State
      if (loginLink) loginLink.style.display = "none";
      if (profilePic) {
        profilePic.style.display = "flex";
        profilePic.querySelector("img").src = data.profile_picture || "assets/default.jpg";
      }
      if (usernameLabel) usernameLabel.textContent = data.name;

      // Tampilkan tombol modul progres
      moduleCards.forEach((card) => card.classList.remove("logged-out-hide"));
      return true;
    } else {
      // Logged Out State
      if (loginLink) loginLink.style.display = "flex";
      if (profilePic) profilePic.style.display = "none";

      // Sembunyikan tombol modul progres
      moduleCards.forEach((card) => card.classList.add("logged-out-hide"));
      return false;
    }
  } catch (err) {
    console.error("Profile fetch error:", err);
    document.querySelectorAll(".module-status-card").forEach((card) => card.classList.add("logged-out-hide"));
    return false;
  }
}

// -----------------------------
// DOM CONTENT LOADED
// -----------------------------
document.addEventListener("DOMContentLoaded", async () => {
  // -----------------------------
  // INITIAL CHECK
  // -----------------------------
  await handleLoginState();

  // -----------------------------
  // NAVIGATION ELEMENTS
  // -----------------------------
  const topnav = document.querySelector(".topnav");
  const hamburgerIcon = document.querySelector(".topnav .icon");
  const profileDropdown = document.querySelector(".profile-dropdown");
  const logoutMenu = document.querySelector(".dropdown-content");
  const logoutBtn = document.getElementById("logoutBtn");

  // Toggle menu hamburger
  if (hamburgerIcon) {
    hamburgerIcon.addEventListener("click", (e) => {
      e.stopPropagation();
      topnav.classList.toggle("responsive");
      if (logoutMenu) logoutMenu.classList.remove("show-dropdown");
    });
  }

  // Toggle dropdown profil
  if (profileDropdown) {
    profileDropdown.addEventListener("click", (e) => {
      e.stopPropagation();
      if (logoutMenu) logoutMenu.classList.toggle("show-dropdown");
      topnav.classList.remove("responsive");
    });
  }

  // Tutup dropdown saat klik di luar
  document.addEventListener("click", () => {
    if (logoutMenu) logoutMenu.classList.remove("show-dropdown");
  });

  // Logout button
  if (logoutBtn) logoutBtn.addEventListener("click", logout);

  // -----------------------------
  // HOVER IMAGE & AUDIO LOGIC
  // -----------------------------
  const img = document.querySelector("#hoverimage img");
  const buttonImages = {
    integral: "assets/profile.png",
    derivative: "assets/derivative.png",
    series: "assets/series.png",
  };

  function changeImage(newSrc) {
    if (!img) return;
    img.classList.add("fade-out");
    setTimeout(() => {
      img.src = newSrc;
      img.classList.remove("fade-out");
    }, 300);
  }

  for (let id in buttonImages) {
    const btn = document.getElementById(id);
    if (btn) btn.addEventListener("mouseenter", () => changeImage(buttonImages[id]));
  }

  const audio = document.getElementById("hoverAudio");
  const muteBtn = document.getElementById("muteBtn");
  const muteIcon = document.getElementById("muteIcon");
  if (muteBtn && audio && muteIcon) {
    muteBtn.addEventListener("click", () => {
      if (audio.paused) audio.play();
      audio.muted = !audio.muted;
      muteIcon.className = audio.muted ? "fa fa-volume-off" : "fa fa-volume-up";
    });
  }
});