# 🌌 OrbitWatch — Satellite Collision Alert System

**OrbitWatch** is a real-time, high-performance web application designed to monitor satellite telemetry, visualize orbital trajectories in 3D, and predict collision risks using live physics-based simulated tracking.

## 🚀 Features

- **Interactive 3D Space Visualization:** Powered by **React Three Fiber**, rendering a photorealistic Earth globe alongside fast, smooth 60fps satellite movements.
- **Collision Detection & Predictive Engine:** A custom physics script running on a **Node.js/Express** backend using `satellite.js` to parse Two-Line Elements (TLEs) and emit live collision warnings via **Socket.io**.
- **Real-Time Dashboard:** An immersive, neon-glow cyberpunk UI built with **React** and **TailwindCSS**, tracking live telemetry (speed, altitude, coordinates) and active risk threats.
- **Historical Analysis:** Stores "High Risk" trajectory alerts utilizing an embedded in-memory **MongoDB** dataset (Mongoose).

## 🛠️ Technology Stack

- **Frontend:** React.js, Vite, TailwindCSS (v4), Three.js, React Three Fiber, Socket.io-client
- **Backend:** Node.js, Express, Socket.io, Mongoose/MongoDB, satellite.js
- **Language:** TypeScript

## 🕹️ Getting Started

To run OrbitWatch locally, follow these steps. The project is split into a `frontend` and `backend` directory.

### 1. Start the Backend API

1. Navigate to the `backend` directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the developmental server (runs on Port 4000):
   ```bash
   npm run start
   # or
   npx nodemon src/index.ts
   ```

### 2. Start the Frontend UI

1. Open a new terminal tab and navigate to the `frontend` directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite server (runs on Port 5173):
   ```bash
   npm run dev
   ```

Open up your browser to `http://localhost:5173` to view OrbitWatch.

## 📝 License

This project is open-source and available under the [MIT License](LICENSE).
