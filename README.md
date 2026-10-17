# OS-Based Job Queue Management System & CPU Scheduling Simulator

> A comprehensive, modern web application and operating system simulation engine designed to demonstrate CPU scheduling algorithms, multi-queue process transitions, Gantt chart execution, and comparative performance analysis.

Developed for **College Mini-Project / Final-Year Project Demonstration**.

---

## 🚀 Key Features

### 1. 📊 Executive OS Dashboard
- Real-time system telemetry:
  - Total registered processes
  - Jobs waiting in Job Queue and Ready Queue
  - Currently running process on CPU core
  - Completed and Blocked processes
  - **CPU Utilization percentage**
  - **Average Waiting Time (AWT)**
  - **Average Turnaround Time (ATAT)**
- Dynamic Recharts charts: Workload distribution, Burst vs Turnaround analysis, and Queue breakdown doughnut.

### 2. 📋 Process & Job Management
- Full CRUD capabilities for OS jobs:
  - Job ID (unique, e.g. `P1`, `P2`)
  - Process Name (e.g. `Compiler`, `DB Query`)
  - Arrival Time ($AT \ge 0$)
  - Burst Time ($BT > 0$)
  - Priority Level ($1 = \text{Highest Priority}$)
  - Target Completion Deadline
  - Process Gantt Color
- Input validation: Rejects duplicate IDs, negative arrival times, and non-positive burst times.
- Searchable & sortable table with status filters (`Waiting`, `Ready`, `Running`, `Blocked`, `Completed`) and priority filters.
- Preloaded with the standardized benchmark workload (P1–P5) and 1-click reload/clear.

### 3. 🔄 5-Queue OS Pipeline Visualizer
Simulates real operating system queue transitions:
1. **Job Queue (Submitted):** Jobs submitted to the system awaiting arrival clock time ($t < AT$).
2. **Ready Queue:** Arrived jobs queued in memory waiting for CPU dispatcher allocation.
3. **Running Process:** Central glowing CPU core showcasing active execution, percentage burst progress, and animated clock pulses.
4. **Waiting / Blocked Queue:** Jobs suspended waiting for simulated I/O events. Includes interactive **"Simulate I/O Block"** and **"Resume / Unblock"** triggers!
5. **Completed Queue:** Terminated jobs with computed completion times and metrics.

### 4. ⚙️ CPU Scheduling Simulator
Implements 5 core OS algorithms (with both preemptive and non-preemptive variants):
- **FCFS** (First-Come, First-Served)
- **SJF** (Shortest Job First, Non-Preemptive)
- **SRTF** (Shortest Remaining Time First, Preemptive SJF)
- **Priority Scheduling** (Non-Preemptive & Preemptive modes)
- **Round Robin (RR)** with configurable Time Quantum ($q$)

### 5. ⏱️ Interactive Gantt Chart
- Time-scaled execution blocks with process IDs, durations, and color coding.
- Automatic CPU Idle period visualization (diagonal hatch pattern).
- Live vertical cursor indicator synchronized with the simulated OS clock ($t$).
- Tooltip inspection of exact start, end, and duration slices.
- Zoom slider ($60\% - 250\%$) and horizontal scrolling for long workloads.

### 6. 📈 Algorithm Benchmarking & Comparison
- Side-by-side comparison matrix evaluating all algorithms on the **exact same job set**.
- Compares:
  - Average Waiting Time ($AWT$)
  - Average Turnaround Time ($ATAT$)
  - Average Response Time ($ART$)
  - CPU Utilization percentage
  - Total Context Switches
- **Optimal Algorithm Recommendation Badge** identifying the most efficient algorithm for the active workload.
- Multi-bar comparison charts powered by Recharts.

### 7. 🔍 Process Deep Inspection & Telemetry
- Detailed drawer for every process showing all 10 scheduling parameters:
  $AT$, $BT$, Remaining Time, Priority, Deadline, First Start Time ($ST$), Completion Time ($CT$), Turnaround Time ($TAT$), Waiting Time ($WT$), and Response Time ($RT$).
- Individual CPU execution slice breakdown.

---

## 📐 Mathematical Formulas

$$\text{Turnaround Time (TAT)} = \text{Completion Time (CT)} - \text{Arrival Time (AT)}$$

$$\text{Waiting Time (WT)} = \text{Turnaround Time (TAT)} - \text{Burst Time (BT)}$$

$$\text{Response Time (RT)} = \text{First CPU Start Time (ST)} - \text{Arrival Time (AT)}$$

$$\text{CPU Utilization (\%)} = \left(\frac{\text{Total Time} - \text{Idle Time}}{\text{Total Time}}\right) \times 100$$

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite 6, Tailwind CSS 3, Lucide React Icons |
| **Data Visualization** | Recharts (Bar Charts, Pie Charts, Cartesian Grids) |
| **Audio Synthesis** | Web Audio API (procedural ticks, context-switch tones, completion chords) |
| **Backend API** | Node.js, Express.js, CORS |
| **Database** | MongoDB with Mongoose (with automatic LocalStorage / In-Memory fallback) |
| **Testing** | Node.js Native Test Runner (`node --test`) |

---

## 📁 Project Structure

```
Job queue management/
├── client/                     # Vite + React + Tailwind CSS Frontend
│   ├── index.html              # HTML entry with custom typography & OS favicon
│   ├── vite.config.js          # Vite config
│   ├── tailwind.config.js      # Tailwind CSS design system & custom OS tokens
│   ├── package.json            # Client scripts and dependencies
│   ├── tests/                  # Unit tests for scheduling algorithms & edge cases
│   │   └── scheduling.test.js  # 8 comprehensive edge case tests
│   └── src/
│       ├── algorithms/         # Pure algorithmic scheduling engine
│       │   └── scheduling.js   # FCFS, SJF, SRTF, Priority, Round Robin implementations
│       ├── components/
│       │   ├── common/         # StatCard, Badge, Modal, NotificationToast
│       │   ├── layout/         # Sidebar, Topbar
│       │   ├── dashboard/      # DashboardPage with 8 OS metrics & Recharts
│       │   ├── jobs/           # JobManagementPage, JobModal
│       │   ├── queues/         # QueueVisualizerPage (5-Queue interactive visualizer)
│       │   ├── simulator/      # SimulatorPage (step-by-step controls & metrics)
│       │   ├── gantt/          # InteractiveGanttChart & GanttChartPage
│       │   ├── comparison/     # ComparisonPage & benchmark bar charts
│       │   └── process/        # ProcessDetailPage (telemetry & trace)
│       ├── context/            # JobContext & SimulationContext
│       ├── services/           # api.js (Dual mode: REST API + LocalStorage fallback)
│       ├── utils/              # sound.js (procedural audio synthesizer)
│       ├── App.jsx             # Main application layout orchestrator
│       └── main.jsx
├── server/                     # Node.js + Express + MongoDB Backend
│   ├── index.js                # Express app entry & route mounting
│   ├── package.json
│   ├── .env.example
│   ├── config/
│   │   └── db.js               # MongoDB connector with graceful in-memory fallback
│   ├── models/
│   │   └── Job.model.js        # Mongoose Schema with strict validation
│   ├── controllers/
│   │   ├── jobs.controller.js  # CRUD controller + sample data resets
│   │   └── simulation.controller.js
│   ├── routes/
│   │   ├── jobs.routes.js      # /api/jobs endpoints
│   │   └── simulation.routes.js# /api/simulation/run & /api/simulation/compare
│   └── algorithms/             # Backend scheduling engine
│       └── scheduling.js
├── package.json                # Root orchestration package.json
└── README.md                   # Complete documentation
```

---

## 🚦 How to Run Locally

### Prerequisites
- Node.js (v18 or higher recommended)
- npm (v9 or higher)

### Option 1: Run Frontend Directly (Fastest Demo)
The application is built with a resilient dual-mode architecture: if the backend server is not running, the frontend automatically and transparently operates using local storage and instant in-browser algorithmic computation!

```bash
cd client
npm run dev
```

Open your browser at `http://localhost:5173`.

### Option 2: Run Full-Stack (Frontend + Backend Server)

1. **Start Backend Server:**
   ```bash
   cd server
   npm run dev
   ```
   *The server runs on `http://localhost:5000`. If MongoDB is not running locally, it gracefully operates in in-memory mode without crashing.*

2. **Start Frontend in a separate terminal:**
   ```bash
   cd client
   npm run dev
   ```

3. **Or run both from the project root:**
   ```bash
   npm run dev
   ```

---

## 🧪 Running Algorithm Correctness Tests

The project includes an automated test suite verifying edge cases:
- Empty job lists
- Jobs arriving simultaneously at $t=0$
- CPU idle intervals between job arrivals
- Equal burst times and tie-breaking
- Preemption behavior under SRTF
- Round Robin multi-time slices with arrival order precedence
- Preloaded sample workload verification ($TAT = CT - AT$, $WT = TAT - BT$)

To execute the test suite:
```bash
cd client
npm test
```

Expected output:
```
✔ handles empty job lists gracefully
✔ correctly calculates metrics for a single job with initial idle time
✔ accurately inserts CPU IDLE intervals when jobs arrive with gaps
✔ correctly schedules simultaneous arrivals at t=0
✔ resolves equal burst times deterministically with tie-breaking
✔ preempts running process when a shorter burst arrives in SRTF
✔ slices CPU time correctly with Round Robin and enforces FIFO arrival order
✔ verifies standard sample jobs metrics and formula consistency
ℹ tests 8 | pass 8 | fail 0
```

---

## 🌐 REST API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Health check & database connection status |
| `GET` | `/api/jobs` | Retrieve all jobs |
| `POST` | `/api/jobs` | Create a new job (validates ID, AT $\ge 0$, BT $>0$, Pri $\ge 1$) |
| `GET` | `/api/jobs/:id` | Get job by ID |
| `PUT` | `/api/jobs/:id` | Update job parameters |
| `DELETE` | `/api/jobs/:id` | Delete job |
| `POST` | `/api/jobs/action/reset` | Restore preloaded sample processes (P1–P5) |
| `POST` | `/api/jobs/action/clear` | Clear all jobs |
| `POST` | `/api/simulation/run` | Run simulation algorithm & generate timeline frames |
| `POST` | `/api/simulation/compare`| Compare all 6 algorithms on current job set |

---

## 🎯 Preloaded Demonstration Workload

The system comes preloaded with the standardized benchmark workload:

| Process ID | Process Name | Arrival Time (AT) | Burst Time (BT) | Priority |
|:---:|:---:|:---:|:---:|:---:|
| **P1** | Compiler | 0 | 5 | 2 |
| **P2** | DB Query | 1 | 3 | 1 |
| **P3** | Video Encoder | 2 | 8 | 4 |
| **P4** | Network Sync | 3 | 2 | 3 |
| **P5** | File Compression | 4 | 4 | 2 |

---

## 👨‍💻 Project Demonstration Checklist

- [x] **Dashboard:** Shows all 8 core metrics + responsive workload & queue distribution charts.
- [x] **Job Management:** Add, edit, delete, search, sort, and filter jobs with strict validation.
- [x] **5-Queue Visualizer:** Visualizes Job, Ready, Running (CPU), Waiting/Blocked (I/O), and Completed queues.
- [x] **Simulate I/O Interrupt:** Interactive button to send processes to the Blocked queue and resume them.
- [x] **CPU Scheduler:** Step-by-step playback, speed control (0.25x to 4x), discrete OS clock ticker.
- [x] **Gantt Chart:** Interactive timeline with zoom, hover details, idle intervals, and synchronized clock cursor.
- [x] **Algorithm Comparison:** Side-by-side table & Recharts bar graphs showing the best algorithm for the workload.
- [x] **Process Inspection:** Detailed telemetry showing $ST, CT, TAT, WT, RT$ and execution slices.
- [x] **Aesthetics:** Dark navy OS theme with glowing cyan, blue, and violet accents, glassmorphic cards, and procedural audio effects.
