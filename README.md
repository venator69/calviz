# 🧮 Calculus Virtual Lab — Calviz

**Calviz** is a web-based virtual laboratory developed as part of the **Midterm Exam** for  
**II3140 – Web and Mobile Application Development**.

The platform provides **interactive materials and visualizations** designed to help students grasp fundamental **Calculus** concepts through direct, hands-on exploration.

🌐 **Live Website:** [https://calviz.vercel.app](https://calviz.vercel.app)  
👥 **Team 23**
- Dennis Hubert — 13222018  
- Nurul Na’im Natifah — 18223106  

---

## 🧩 Project Overview

**Calviz** is a secure, full-stack application that transforms abstract Calculus topics into engaging visual experiences.  
The system adopts a **modular and extensible architecture**, complete with **persistent user progress tracking** for personalized learning continuity.

---

## ⚙️ Technology Stack

| **Component** | **Technology Used** |
|----------------|---------------------|
| Front-end (FE) | HTML5, CSS3, Vanilla JavaScript, Math.js |
| Back-end (BE) | Node.js (Express.js) |
| Database | PostgreSQL |
| Deployment | Vercel (FE) and Railway (BE) |

---

## 💡 Core Features and Implementation

### 1. Interactive Visualization Modules (Front-end)

The website includes **three main modules**, each utilizing the `<canvas>` API for real-time, client-side rendering.

| **Module** | **Concept** | **Key Interactions** |
|-------------|--------------|----------------------|
| Riemann Integral | Area under a curve | Adjust partition count (`n`) and sampling methods (Left, Right, Midpoint) to observe convergence toward the exact integral. |
| Derivative | Limit definition of derivative | Use a slider to vary Δt and visualize the secant line approaching the tangent line. |
| Taylor Series | Power series approximation | Modify the number of terms to see how the function’s approximation improves within its radius of convergence. |

---

### 2. Advanced Server-Side Implementation

The back-end introduces several **advanced, session-based functionalities**:

- **Session-Based Authentication:**  
  Implemented via Express Sessions, with persistent session data stored in PostgreSQL.  
  Supports both **standard login** and **Google OAuth** authentication.

- **User Progress Persistence:**  
  Authenticated users can **save and retrieve** their completion status for each module through secure API endpoints:  
  - `POST /api/progress/save`  
  - `GET /api/progress/get`

---

