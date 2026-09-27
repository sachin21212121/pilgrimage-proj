# DivyaPath: Smart Pilgrimage Ecosystem

**DivyaPath** is a modern, AI-powered web platform designed to streamline pilgrimage route mapping, manage temple queue waiting times, promote local tourism economies, and enforce sustainable practices. 

This project aligns with SIH (Tourism), SDG 11 (Sustainable Cities and Communities), and SDG 12 (Responsible Consumption and Production) guidelines.

---

## 📂 Project Directory Structure

```text
pilgrimage-ecosystem/
├── README.md                  # Project overview, workflow, and installation instructions (This file)
├── backend/                   # Python FastAPI Backend & Agentic AI Layer
│   ├── .env                   # Local configuration for GEMINI_API_KEY
│   ├── database.py            # Local JSON database models and CRUD operations
│   ├── db.json                # Lightweight JSON state database (Auto-generated)
│   ├── main.py                # FastAPI routes, CORS configuration, and Google Antigravity Agent definition
│   ├── requirements.txt       # Python backend package dependencies
│   └── verify_agent.py        # Automated backend tool testing and verification script
├── frontend/                  # React + Vite Frontend Client
│   ├── index.html             # Client HTML entry point and browser config
│   ├── package.json           # Frontend scripts and npm package dependencies
│   ├── vite.config.js         # Vite bundler parameters
│   └── src/
│       ├── App.jsx            # Main React UI component, state router, and client simulations
│       ├── index.css          # Premium theme styling, glassmorphism, and layouts
│       └── main.jsx           # React app renderer and DOM entry point
└── venv/                      # Python Virtual Environment (Local dependencies)
```

---

## 📄 File Index & Importance

### 1. Backend Components

- **[backend/main.py](file:///Users/nikhiljha/.gemini/antigravity/scratch/pilgrimage-ecosystem/backend/main.py)** (Core AI Controller)
  - **Importance**: The central execution file. It sets up the FastAPI application and holds the configuration for the **Google Antigravity SDK Agent** (Dharma AI). 
  - It exposes a stateful `/api/chat` route and registers custom Python functions as *autonomous agent tools* (allowing the AI to inspect live queues, book seats, claim eco-rewards, and query database nodes based on natural language). It also contains a robust keyword-based parser fallback if no Gemini API Key is configured.
  
- **[backend/database.py](file:///Users/nikhiljha/.gemini/antigravity/scratch/pilgrimage-ecosystem/backend/database.py)** (State Database Manager)
  - **Importance**: Represents the data persistence layer of the system. It handles reading and writing records in `db.json` (such as active bookings, crowd statuses, user points, reports, and local vendor listings). It abstracts database operations away from the AI agent.
  
- **[backend/verify_agent.py](file:///Users/nikhiljha/.gemini/antigravity/scratch/pilgrimage-ecosystem/backend/verify_agent.py)** (Quality Assurance)
  - **Importance**: Run this to verify the integrity of backend hooks. It fires mock triggers representing ticket bookings, crowd queries, and eco logging, and assert-checks that the databases have been correctly modified.

- **[backend/requirements.txt](file:///Users/nikhiljha/.gemini/antigravity/scratch/pilgrimage-ecosystem/backend/requirements.txt)** (Dependency Ledger)
  - **Importance**: Declares the Python packages required for execution (`fastapi`, `uvicorn`, `google-antigravity`, `python-dotenv`, `pydantic`).

- **[backend/.env](file:///Users/nikhiljha/.gemini/antigravity/scratch/pilgrimage-ecosystem/backend/.env)** (Configuration)
  - **Importance**: Stores sensitive configuration keys. Paste your `GEMINI_API_KEY` here to transition from simulation mode to live agentic LLM parsing.

---

### 2. Frontend Components

- **[frontend/src/App.jsx](file:///Users/nikhiljha/.gemini/antigravity/scratch/pilgrimage-ecosystem/frontend/src/App.jsx)** (UI Router & Controller)
  - **Importance**: Renders the complete web interface. It coordinates tab routing (Dashboard, Chat, Booking, Swachh Vision, Rewards, Community Directory, Admin Panel). 
  - It houses the simulated **Swachh Vision** scanner logic (processing simulated camera captures), the gamified **Punya points manager**, and coordinates API synchronization with the FastAPI server. It also has a client-side database simulation module that triggers if the backend server is offline, making demos bulletproof.

- **[frontend/src/index.css](file:///Users/nikhiljha/.gemini/antigravity/scratch/pilgrimage-ecosystem/frontend/src/index.css)** (Theme & Design System)
  - **Importance**: The design framework of the app. It imports premium fonts (*Outfit* and *Plus Jakarta Sans*) and establishes variables for a midnight slate theme (`#090d16`) with saffron glows (`#f97316`) and teal sustainability indicators (`#0d9488`). Features advanced glassmorphic templates and keyframe animations.

- **[frontend/index.html](file:///Users/nikhiljha/.gemini/antigravity/scratch/pilgrimage-ecosystem/frontend/index.html)** (Client Entry Point)
  - **Importance**: Serves the root viewport and loads SEO variables, title meta tags, and the core modular script (`main.jsx`).

---

## 🔄 System Workflow & Data Flow

DivyaPath operates on a stateful, event-driven architecture. The diagram below illustrates the exact workflow when a pilgrim requests a booking via voice or text chat:

```text
[ Pilgrim Client (React App) ]
            │
            ▼ 1. User inputs: "Book a slot for Kedarnath at 10 AM"
    [ FastAPI Server ] ──► (Instantiates Google Antigravity Agent)
            │
            ▼ 2. Agent parses message using gemini-3.5-flash
    [ Dharma AI Agent ] ──► (Detects booking intent)
            │
            ▼ 3. Decides to call registered Python tools
   [ book_darshan_pass() ] 
            │
            ▼ 4. Invokes DB operations
    [ database.py (JSON DB) ] ──► (Writes new ticket to db.json)
            │
            ▼ 5. Returns ticket confirmation dictionary
   [ book_darshan_pass() ]
            │
            ▼ 6. Agent formats response: "Confirmed! Ticket ID: TX_0719..."
    [ FastAPI Server ]
            │
            ▼ 7. Transmits response back to browser client
[ Pilgrim Client (React App) ] ──► (Dynamically updates tickets tab to display QR code)
```

---

## 🚀 Setup & Installation Instructions

Follow these commands to get both servers up and running in a few simple steps:

### Prerequisite Checklist
- **Python 3.10+** installed.
- **Node.js 18+** installed.

### 1. Run the Backend API
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Activate the pre-configured virtual environment:
   ```bash
   source ../venv/bin/activate
   ```
3. *(Optional)* Add your Gemini API key inside `.env` to enable live LLM agent calls:
   ```ini
   GEMINI_API_KEY="AIzaSyYourKeyHere..."
   ```
4. Fire up the backend Uvicorn server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```
   *The backend will run at [http://localhost:8000](http://localhost:8000).*

### 2. Run the Frontend App
1. Open a new terminal tab and navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Launch the Vite development server:
   ```bash
   npm run dev
   ```
   *Open your browser and navigate to [http://localhost:5173](http://localhost:5173).*
