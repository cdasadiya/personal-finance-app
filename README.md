# 💳 ChaitanyaFinance — Simple Personal Wealth Tracker

<p align="center">
  <img src="./assets/dashboard-dark.png" alt="ChaitanyaFinance Dark Mode Banner" width="100%" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.08); box-shadow: 0 10px 30px rgba(0,0,0,0.5);" />
</p>

<p align="center">
  <strong>A modern, glassmorphism-styled personal finance tracker served via a Node.js Express server and persistent SQLite storage.</strong>
</p>

<p align="center">
  <a href="https://www.linkedin.com/in/chaitanya-dasadiya">
    <img src="https://img.shields.io/badge/LinkedIn-Chaitanya_Dasadiya-0A66C2?style=for-the-badge&logo=linkedin&logoColor=white" alt="LinkedIn Badge" />
  </a>
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" alt="Node JS Badge" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" alt="SQLite Badge" />
  <img src="https://img.shields.io/badge/Express-000000?style=for-the-badge&logo=express&logoColor=white" alt="Express Badge" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript Badge" />
</p>

---

## 🎨 Visual Showcase

ChaitanyaFinance features a premium design that updates in real time as you manage your transactions.

### 🌓 Theme Customization
Toggle effortlessly between a stunning Slate Dark mode and a clean Light mode directly from the header panel.

| 🌌 Dark Mode (Default) | ☀️ Light Mode |
| :---: | :---: |
| <img src="./assets/dashboard-dark.png" width="100%" style="border-radius: 8px;" /> | <img src="./assets/dashboard-light.png" width="100%" style="border-radius: 8px;" /> |

### 🎬 Interactive DB-backed Simulation
The application is fully backed by an Express server and SQLite. Adding, deleting, sorting, and filtering records automatically updates database rows and updates Chart.js figures.

<p align="center">
  <img src="./assets/demo.webp" alt="Interactive Database Demo" width="100%" style="border-radius: 12px; border: 1px solid rgba(255,255,255,0.08);" />
</p>

---

## ✨ Features

- **Express & SQLite Engine**: Data is saved directly in a local filesystem `database.sqlite` file.
- **Micro-animations**: Elegant page animations, dynamic net balance colorings, and slide-in entry list elements.
- **Doughnut Analytics**: Interactive Chart.js graphs mapping expense category proportions.
- **Dynamic Filters**: Instant client-side search by text matching, category type sorting, or transaction division.
- **Import / Export**: Clean backup tools to download your record logs as a JSON file, or restore databases from JSON files.
- **Client Preferences**: Interface adjustments (such as theme toggles) are kept saved in browser cookies/localStorage namespaces (`chaitanya_theme`).

---

## 🚀 Quick Start

To run this application locally, follow these simple setup steps:

### 1. Install Project Libraries
Ensure Node.js is installed. In your terminal, run:
```bash
npm install
```

### 2. Boot the Express API & Static Server
Start the local server:
```bash
npm start
```

### 3. Open in Browser
Navigate to [http://localhost:8080](http://localhost:8080) to access the finance tracker.

---

## 🛠️ Vibe Coding & Agent-driven Development

ChaitanyaFinance was engineered completely through **Vibe Coding** workflows using **Antigravity**, a powerful AI coding agent. Rather than typing code manually, the creator guided the system through conversational natural language prompts.

### 💡 The Prompt History
Here is the sequence of prompts used to generate the features, databases, themes, and deploy commands:

1. **Requirements Gathering**:
   > *"Please build a simple personal finance application. Before building it, give me requirements. Let's brain storm. I want to keep the application very simple. It should be a web application. Let's not add any complex features. Very simple application"*
2. **Drafting initial codebase**:
   > Approved the PRD setting up pure HTML/CSS/JS, glassmorphism templates, and mock cards.
3. **Drafting Documentation**:
   > *"prepare the readme.md file for the development"*
4. **Improving Visuals & Assets**:
   > *"make the readme.md file make it beautiful and interattive with few screenshots for the showcases over the github repo"*
5. **Connecting DB Persistence (SQLite & Express)**:
   > *"can you store the data into database and how about sqlite ?"*
6. **Setting up Server Backend**:
   > *"go ahead with Option A: Small Node.js (Express) Backend with SQLite"*
7. **Deploying to Repository**:
   > *"Please use this repo to commit the code into github https://github.com/cdasadiya/personal-finance-app.git"*
8. **Polishing & Socials Customization**:
   > *"Rename brand to ChaitanyaFinance, add requirements.txt, update Vibe Coding guide, manage Antigravity documentation, and add LinkedIn page badge."*

### 🤖 The Role of Antigravity AI Agent
The **Antigravity** coding assistant managed the full implementation lifecycle:
* **Research & Planning**: Analyzed system capabilities (Node.js version validation) and formulated clean execution pipelines.
* **Refactoring Code**: Built the database schema, Express endpoints, and refactored client calls to async fetch formats.
* **Autonomous Quality Assurance (QA)**: Spun up automated browser subagents to click inputs, toggle themes, submit new transactions, and confirm that mathematical sums updated perfectly in the browser DOM.
* **Asset Creation**: Captured screenshots and recorded interaction loops automatically during browser validations to produce visual assets for the showcase.
* **Git Versioning**: Initialized local repositories, configured commit details, and pushed code directly to GitHub.

---

## 👤 Author details

This project was developed by **Chaitanya Dasadiya**.

* **LinkedIn**: [linkedin.com/in/chaitanya-dasadiya](https://www.linkedin.com/in/chaitanya-dasadiya)
* **GitHub**: [github.com/cdasadiya](https://github.com/cdasadiya)

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Chaitanya_Dasadiya-0A66C2?style=flat-square&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/chaitanya-dasadiya)

---

## 📜 License
This project is open-source and licensed under the [MIT License](https://opensource.org/licenses/MIT).


