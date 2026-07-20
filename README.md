 # 🕉️ Smart 68 Ling Yatra Navigation & Management System

🔗 **Live Demo:** https://smart-68-ling-yatra-navigation-844740188721.asia-southeast1.run.app/


A full-stack smart pilgrimage management platform for the **68 Ling Yatra in Solapur, Maharashtra**.  
This system helps devotees navigate all 68 sacred Shiva Ling temples, track pilgrimage progress, optimize routes, and access safety features such as emergency SOS and crowd monitoring.

---

# 📖 Project Overview

The **68 Ling Yatra** is a sacred pilgrimage in Solapur where devotees visit all 68 Shiva Ling temples.

Currently, pilgrims face several problems:
- Difficulty locating all temples
- No optimized route planning
- Heavy crowd during yatra
- No centralized information
- Limited emergency assistance
- Hard to track completed temple visits

This project digitizes the entire pilgrimage experience using modern web technologies.

---

# ✨ Core Features

## 🔐 Authentication System
Secure user login and registration system.

Features:
- User Signup
- User Login
- Session Management
- Personalized pilgrimage progress

Purpose:
- Each devotee gets a personal pilgrimage record.

---

## 📍 Temple Directory
Complete database of all **68 Ling temples**.

Each temple includes:
- Temple ID
- Temple Name
- Location / Area
- Coordinates
- Temple Details

---

## 🗺️ Smart Navigation
Users can navigate to any temple easily.

Features:
- Google Maps integration
- Temple-wise navigation
- Location-based routing

Benefits:
- Reduces route confusion
- Saves travel time

---

## 📈 Pilgrimage Progress Tracker
Tracks user journey completion.

Features:
- Mark temples as visited
- Track completed temples
- Remaining temples count
- Completion percentage

Example:
34 / 68 completed (50%)

---

## 📷 QR Temple Check-In
Pilgrims can check in using QR scanning.

Features:
- QR code scan at temple
- Auto-mark temple as visited
- Improves visit verification

Benefits:
- Prevents fake check-ins
- Makes tracking seamless

---

## 🧭 Smart Route Optimization
Optimizes temple visiting route.

Considers:
- Current location
- Distance
- Travel efficiency

Benefits:
- Minimizes travel time
- Better pilgrimage planning

---

## 🌡️ Live Crowd Heatmap
Shows crowd density across temples.

Crowd Levels:
- 🟢 Low
- 🟡 Medium
- 🟠 High
- 🔴 Very High

Benefits:
- Avoid overcrowded temples
- Better crowd distribution

---

## 🚨 SOS Emergency Help
Emergency support for devotees.

Available help:
- Ambulance
- Police
- Volunteer Assistance
- Lost & Found

Features:
- Panic alert
- Emergency request logging
- Incident dispatch queue

---

## 👨‍💼 Admin Dashboard
Special dashboard for temple administration.

Admin can:
- Monitor crowd levels
- View emergency alerts
- Handle SOS incidents
- Manage lost & found reports
- Analyze pilgrimage statistics

---

# 🏗️ System Architecture

User  
↓  
Frontend (React + TypeScript)  
↓  
API Requests  
↓  
Backend (Node.js + Express)  
↓  
Database (MongoDB / JSON Storage)  
↓  
Response to UI  

---

# 🛠️ Tech Stack

## Frontend
- React
- TypeScript
- Vite
- HTML5
- CSS3

Used for:
- UI Components
- Navigation
- State Management
- Interactive Dashboard

---

## Backend
- Node.js
- Express.js
- TypeScript

Used for:
- REST APIs
- Authentication
- Data Processing
- Business Logic

---

## Database
Current:
- JSON Storage / In-memory storage

Migrating to:
- MongoDB Atlas

Stores:
- User Data
- Authentication Data
- Pilgrimage Progress
- SOS Reports
- Admin Data

---

## Development Tools
- Visual Studio Code
- GitHub
- Google AI Studio
- npm
- Git

---

# 📂 Project Structure

```bash
smart-68-ling-yatra/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── utils/
│   └── App.tsx
│
├── backend/
│   └── server.ts
│
├── public/
├── package.json
└── README.md
```

---

# 🚀 Installation

## Clone Project
```bash
git clone <repository-url>
```

## Install Dependencies
```bash
npm install
```

## Run Project
```bash
npm run dev
```

---

# 🎯 Key Modules

- Authentication Module
- Temple Directory Module
- Navigation Module
- QR Check-In Module
- Route Optimization Module
- Heatmap Module
- SOS Module
- Admin Analytics Module

---

# 🔮 Future Scope

Planned enhancements:
- AI-based crowd prediction
- Voice navigation
- Multilingual support (Marathi/Hindi/English)
- Digital certificate after 68 completion
- Donation integration
- AI chatbot assistant

---

# 🌟 Uniqueness

What makes this project unique:
- Solves a real local problem
- Strong social impact
- Combines pilgrimage + technology
- Much more than a regular student CRUD project

Unlike common college projects, this system addresses real-world pilgrimage management and safety.

---

# 👨‍💻 Developer

Developed it for the interview purpose project showcase my skills

---

🙏 **Om Namah Shivaya**
