<div align="center">

# ⚡ DriftLift Frontend

### *Elevate Your Form. Master Your Fitness.*

Next-generation biometric tracking, 3D anatomical recovery heatmaps, computer vision rep counting & form checking, HD workout video tutorials, and metabolic profiling—engineered for high-performance health optimization.

[![Next.js](https://img.shields.io/badge/Next.js-15.0-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Three.js](https://img.shields.io/badge/Three.js-WebGL-black?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![MediaPipe](https://img.shields.io/badge/MediaPipe-Pose%20AI-06b6d4?style=for-the-badge&logo=google&logoColor=white)](https://developers.google.com/mediapipe)
[![MUI](https://img.shields.io/badge/MUI%20X--Charts-6.19-007FFF?style=for-the-badge&logo=mui&logoColor=white)](https://mui.com/x/react-charts/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)](LICENSE)

[Features](#-key-features) • [Tech Stack](#-tech-stack) • [Getting Started](#-getting-started) • [Environment Variables](#-environment-variables) • [Project Structure](#-project-structure) • [Contributing](#-contributing)

---

</div>

## 📖 Overview

**DriftLift** is a cutting-edge web platform uniting computer vision AI, real-time 3D anatomical biometrics, and guided exercise science. Built on **Next.js 15 App Router**, **TypeScript**, **Three.js**, and **Google MediaPipe**, the application delivers a cyber-dark, glassmorphic experience that empowers lifters with hands-free optical form correction, 3D muscle recovery heatmaps, and metabolic analytics.

---

## ✨ Key Features

### 👁️ 1. Computer Vision Rep Counter & Form Checker *(AI Pose Engine)*
- **Optical Landmark Tracking**: Harnesses **Google MediaPipe Pose** running 100% client-side via WebAssembly & WebGL (zero server latency, complete video privacy).
- **Trigonometric Joint Angle Detection**: Computes flexion/extension angles (knee, elbow, shoulder, hip) at 60 FPS.
- **Exercise State Machines**:
  - 🏋️‍♂️ **Barbell & Bodyweight Squats**: Tracks knee angle depth (< 90° parallel/deep check) and warns against excessive torso forward lean.
  - 💪 **Bicep Curls**: Measures peak contraction (< 45°) and full bottom extension (> 155°).
  - 🤸 **Chest Push-ups**: Enforces 90° elbow bend and monitors spinal plank alignment to detect sagging hips.
  - 🏋️ **Overhead Shoulder Press**: Tracks full overhead lockouts without lower lumbar arching.
  - 🦅 **Dumbbell Lateral Raises**: Monitors shoulder abduction and tempo control.
- **Synthesizer Chimes & AI Voice Coach**:
  - Web Audio API procedural sound cues trigger on every valid rep.
  - Web Speech API announces rep counts aloud (*"1"*, *"2"*, *"3"...*) and provides live diagnostic coaching cues (*"Sink deeper"*, *"Full extension"*).
- **Dual-Mode System**:
  - 📹 **Live Camera Mode**: Mirrors your webcam with a glowing neon cyber-skeleton and real-time degree plaque on the pivot joint.
  - ⚡ **Kinetic Simulator Mode**: Built-in procedural lifter demo allows testing without standing in front of a camera.
- **Automated Rest Countdown**: Completing a set triggers an automated 60-second recovery timer and logs set performance directly to your profile.

---

### 🧬 2. 3D Interactive Muscle Fatigue & Recovery Heatmap
- **Procedural Anatomical 3D Mannequin**: Engineered with **Three.js** and smooth OrbitControls (rotate, zoom, pan).
- **Segmented Muscle Geometries**: Covers Pectorals, Lats, Traps, Erectors, Rectus Abdominis (6-pack), Obliques, Deltoids, Biceps, Triceps, Forearms, Glutes, Quads, Hamstrings, and Calves.
- **Real-Time Biometric Heatmap Shaders**:
  - 🟢 **0–25% (Emerald)**: Fully Recovered & Primed
  - 🔵 **26–50% (Cyan)**: Optimal Training Capacity
  - 🟡 **51–70% (Amber)**: Stimulated / Active Recovery
  - 🟠 **71–85% (Orange)**: High Fatigue / DOMS Warning
  - 🔴 **86–100% (Laser Crimson)**: Exhausted / Rest Needed
- **Raycast Hover & Muscle Intel**:
  - Hovering displays a floating HUD tooltip near the cursor.
  - Clicking any muscle opens its **Muscle Intelligence Card**, detailing biomechanical role, estimated recovery countdown (e.g. `~36 Hours`), top exercises, and active recovery stretches.
- **Simulation Scenarios & Real-Time Sync**:
  - Quick presets: 🔥 *Push Day*, ⚡ *Pull Day*, 🦵 *Leg Day*, ✨ *Full Reset*.
  - Live calibration slider to test muscle glow sensitivity.
  - One-click sync with recent workout logs (`/workouttrack/getworkoutbylimit`).

---

### 🥗 3. "Snap & Log" Multi-Modal AI Food Scanner
- **Camera Snapshot & Photo Upload**: Capture food plate photos or upload meal images with circular reticle guidance and audio shutter feedback.
- **Dual Multimodal Recognition Engine**:
  - ⚡ **Google Gemini 1.5 Flash Vision**: Direct structured JSON multimodal analysis breaking down dish components, grams, calories, and macros.
  - ✨ **Smart Culinary Heuristic AI**: Fast built-in nutritional recognition engine with a library of common healthy fitness dishes.
- **Live Barcode Scanner**:
  - Scan packaged goods with automated red laser crosshair line.
  - Instant lookup in the **OpenFoodFacts global database** (3M+ products) retrieving exact Nutri-Score, calories, protein, carbs, fats, and fiber.
- **Interactive Component & Portion Tuning**:
  - Fine-tune portion sizes (+ / - 20g) per recognized item with real-time automatic macro recalculation.
- **1-Tap Direct Logging**:
  - Directly syncs meal calorie totals to the user's DriftLift profile (`/calorieintake/addcalorieintake`).
- **One-Click Demo Meals**: 4 curated athletic sample dishes to test the scanner instantly.

---

### ⚡ 4. Multiplayer Workout Squad Rooms (Real-Time WebSockets)
- **Synchronized Rest Cadence**: Sub-10ms synchronized rest countdown dials across all squad mates powered by RFC 6455 WebSockets.
- **Shared Session Telemetry**: Real-time broadcast of current exercise, live status tags (`LIFTING`, `RESTING`, `HYDRATING`), and completed set logs (`100kg × 8 reps`).
- **Hype Reaction Engine**: Interactive cheer reactions (`🔥`, `💪`, `⚡`, `👏`, `🦾`, `🚀`) trigger floating physics particle bursts and synthesized Web Audio sound effects on every peer's screen.
- **AI Gym Buddies Simulation**: Built-in autonomous virtual peers (Elena, Marcus, Tariq) can lift alongside solo users when training alone or offline.
- **Zero-Dependency Architecture**: Built on native browser WebSocket API and Node.js native `crypto` & `http` upgrade pipeline (no heavy socket packages required).

---

### 🍱 5. Interactive Bento Showcase Grid
- Balanced interactive navigation console on the landing page hero:
  - 📹 **AI Vision Coach** (`/vision-coach`)
  - 🥗 **AI Food Scanner** (`/food-scanner`)
  - 🧬 **3D Muscle Heatmap** (`/heatmap`)
  - ⚡ **Multiplayer Squad Rooms** (`/squad-rooms`)
  - 🎬 **HD Form Tutorials** (`/workout/chest`)
  - 📊 **Smart Tracking** (`/report/calorie`)
- Designed with subtle glassmorphic reflections, themed glowing icon badges, and smooth hover lift micro-animations.

---

### 🏋️ 6. Guided Workout Hub & Form Execution
- **Targeted Muscle Categories**: Comprehensive routines for **Chest**, **Back**, **Abs & Core**, **Shoulders**, **Arms**, and **Legs**.
- **HD Video Tutorials**: Embedded high-definition video demonstrations with targeted muscle cues and execution tips.
- **Smart Rest Interval Timer**: Live rest timers between sets with audio feedback to maximize workout intensity.
- **Direct Workout Logging**: Record completed sets, reps, and workout duration directly to your profile.

---

### 📊 7. Biometric Analytics & Dynamic Reports
- **MUI X-Charts Visualizations**: Interactive trend lines and graphs for tracking progress over daily, weekly, or monthly periods.
- **Track 6 Core Health Vectors**:
  - 💧 **Hydration Tracker** (Daily water intake vs. dynamic hydration goals in mL)
  - 🌙 **Sleep Quality** (Sleep duration in hours and recovery insights)
  - 🔥 **Calorie & Macro Intake** (Daily caloric tracking with nutritional goal monitoring)
  - 👟 **Step Progression** (Step count vs. 10,000 daily targets)
  - ⚖️ **Weight Tracking** (Body mass progression curve)
  - ⏱️ **Workout Duration** (Session length and consistency tracking)

---

### 🧮 8. Metabolic & TDEE Calculator
- **Mifflin-St Jeor Equation**: Computes **BMR (Basal Metabolic Rate)** and **TDEE (Total Daily Energy Expenditure)** based on age, gender, height, weight, and activity multiplier.
- **Goal-Adaptive Targets**: Tailors recommended daily caloric targets for **Weight Loss** (-500 kcal deficit), **Maintenance**, and **Muscle Hypertrophy** (+300 kcal surplus).
- **Instant BMI Breakdown**: Real-time BMI calculation and classification.

---

### 🔐 7. Secure Authentication & Quick Log
- Modal-based **JWT Cookie Authentication** (Login & Registration with interactive calendar birthdate selection).
- Persistent user sessions and cross-origin synchronization with the Express backend.
- Quick Log popover to record metrics in seconds from any page.

---

## 🛠 Tech Stack

| Domain | Technology | Purpose |
|---|---|---|
| **Framework** | [Next.js 15](https://nextjs.org/) (App Router, Turbopack) | Server & Client Components, Dynamic Routing |
| **Language** | [TypeScript 5](https://www.typescriptlang.org/) | End-to-end type safety |
| **3D Graphics** | [Three.js](https://threejs.org/) | 3D procedural anatomical mannequin, WebGL shaders |
| **Computer Vision** | [Google MediaPipe Pose](https://developers.google.com/mediapipe) | Optical 33-point skeletal pose tracking & rep counter |
| **UI & Charts** | [MUI Joy](https://mui.com/joy-ui/) & [MUI X-Charts](https://mui.com/x/react-charts/) | High-performance interactive metric visualization |
| **Date Pickers** | [MUI X-Date-Pickers](https://mui.com/x/react-date-pickers/) & [Day.js](https://day.js.org/) | Calendar birthdate and date range pickers |
| **Audio Synthesis** | Web Audio API & Web Speech API | Procedural sound chimes & spoken rep counts |
| **Styling** | Emotion, CSS Modules & Custom Glassmorphic Tokens | Cyber-dark aesthetic, responsive design |
| **Icons & Media** | [React Icons](https://react-icons.github.io/react-icons/) (Ionicons 5), [Swiper](https://swiperjs.com/) | UI iconography and responsive sliders |
| **Notifications** | [React Toastify](https://fkhadra.github.io/react-toastify/) | Non-blocking user feedback alerts |

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed on your machine:
- **Node.js** (v18.17.0 or higher recommended)
- **npm**, **pnpm**, or **yarn**
- Running **DriftLift Backend API** (defaults to `http://localhost:8000`)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Uday-Shakya/driftlift-front.git
   cd driftlift-front
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up Environment Variables**:
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_BACKEND_API=http://localhost:8000
   ```

4. **Run the development server**:
   ```bash
   npm run dev
   ```

5. **Open in Browser**:
   Navigate to [http://localhost:3000](http://localhost:3000) to view the application.

---

## 📂 Project Structure

```text
driftlift-front/
├── public/                 # Static assets (favicons, images, vectors)
├── src/
│   ├── app/
│   │   ├── about/          # About DriftLift team & mission
│   │   ├── components/     # Reusable modular UI components
│   │   │   ├── AuthPopup/       # Login / Signup modal with calendar DOB picker
│   │   │   ├── Footer/          # Application footer
│   │   │   ├── Homebanner1/     # Biometric highlight cards & quick metrics
│   │   │   ├── HomeBanner2/     # Muscle category exercise carousels (Swiper)
│   │   │   ├── Navbar.tsx       # Navigation bar with responsive drawer & quick-log
│   │   │   ├── QuickLogModal/   # Instant metric logging popover
│   │   │   ├── ReportFormPopup/ # Biometric entry form modal
│   │   │   └── ToastProvider.tsx# Global toast notification container
│   │   ├── food-scanner/   # Multi-Modal AI Food & Barcode Scanner (Gemini Vision)
│   │   │   ├── foodScannerService.ts # Gemini 1.5 Flash Vision API & OpenFoodFacts lookup
│   │   │   ├── food-scanner.css # Viewfinder targeting reticle & macro telemetry HUD
│   │   │   └── page.tsx         # Camera stream, barcode scanner, portion tuner & 1-tap logger
│   │   ├── heatmap/        # 3D Interactive Muscle Fatigue & Recovery Heatmap (Three.js)
│   │   │   ├── HeatmapCanvas.tsx# Procedural anatomical mannequin & WebGL shaders
│   │   │   ├── heatmap.css      # Cyberpunk HUD & responsive styling
│   │   │   └── page.tsx         # Heatmap control center & muscle intelligence
│   │   ├── vision-coach/   # Computer Vision Rep Counter & Form Checker
│   │   │   ├── VisionEngine.tsx # MediaPipe Pose optical tracking & audio synthesis
│   │   │   ├── vision.css       # Biometric camera HUD & live telemetry gauges
│   │   │   └── page.tsx         # Vision Coach set controller & rest modal
│   │   ├── profile/        # User profile, BMR & TDEE metabolic calculators
│   │   ├── report/
│   │   │   └── [type]/     # Dynamic biometric report views (charts, trends, history)
│   │   ├── workout/
│   │   │   └── [type]/     # Muscle category video workouts with live rest timers
│   │   ├── globals.css     # Global variables, tokens, cyber-dark theme definitions
│   │   ├── layout.tsx      # Root application layout
│   │   ├── page.tsx        # Landing / Home page with Bento Feature Showcase
│   │   └── page.module.css # Landing page scoped styles
├── tsconfig.json           # TypeScript configuration
└── package.json            # Scripts & project dependencies
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the Next.js development server at [http://localhost:3000](http://localhost:3000) |
| `npm run build` | Compiles and optimizes the app for production deployment |
| `npm run start` | Starts the production server after running `npm run build` |
| `npm run lint` | Runs ESLint to identify code quality and syntax issues |

---

## 🔗 Related Repositories

- **Backend API**: [driftlift_backend](https://github.com/Uday-Shakya/driftlift_backend) (Node.js / Express / MongoDB)

---

## 📄 License

Distributed under the **MIT License**. See `LICENSE` for more information.

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/Uday-Shakya">Uday Shakya</a> & the DriftLift Team.</sub>
</div>