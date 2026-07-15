# Knowledge Tracker (Trainee Program Milestone System)

**Project Code:** Knowledge Tracker  
**Development Team:** Antigravity  

A knowledge management and training tracker single-page web application designed. It tracks the training rotation learning objectives, field observation logs, and milestone accomplishments for Management Trainees (MAs).

---

## 🌟 Key Features

1. **Role Simulation Panel (Simulator)**:
   - Quickly switch between MAs (**Diane**, **Mark**, **Jairuz**), **Field Supervisors** (Jade, Yu-Shan, Ken, Maria), and the **Lead Mentor** (Chef Antonio) to see how the system operates from different user perspectives.
   - Restricts view tabs dynamically according to permissions.
2. **Dashboard & Weekly Schedule**:
   - Shows rotation departments and daily checklists/CCP objectives.
   - Mentors can dynamically update or assign new schedules by clicking calendar slots.
3. **Structured Field Observation Form**:
   - Structured inputs (Key Observations, Actionable Ideas for PH context, photo references).
   - **Mermaid.js Workflow Editor**: Write Mermaid code and see interactive process flowcharts compile live in the preview pane.
   - Private submission structure protecting trainees from peer comparisons.
4. **Gamified Milestone Tracker**:
   - Overall progress bar based on training actions.
   - Complete checklists for each department (Observation Submitted, Supervisor Signed Off, QA rating >= 4, and Mentor Review logged).
5. **Supervisor Dual Sign-off & Comments**:
   - Supervisors review submissions under their department, rate from 1 to 5 stars, and sign off.
   - Mentors provide final comments and lock reviews.
6. **Multi-language Support (i18n)**:
   - English, Traditional Chinese (繁體中文), and Tagalog.
7. **Premium Responsive Design**:
   - Custom Glassmorphism UI cards, dark/light theme, custom stars, and fully responsive layout (RWD) for plant walkthroughs on mobile/tablet.
   - Data persists automatically in `localStorage`.

---

## 📂 Project Structure

```
MA Program/
├── index.html          # Main HTML structure and layouts
├── package.json        # Declares npm scripts for dev server
├── README.md           # Documentation guide
├── css/
│   └── styles.css      # Dark/Light theme, glassmorphic layout, RWD, micro-animations
└── js/
    ├── data.js         # Initial mock data and localStorage management
    ├── i18n.js         # Translation dictionary (English, Chinese, Tagalog)
    └── app.js          # Core routing, form callbacks, and calculations
```

---

## 🚀 How to Run

### Option 1: Direct File Launch (No Setup)
Simply open `index.html` directly in any modern web browser (Chrome, Safari, Edge, Firefox). The application loads all libraries via CDN and runs entirely in-browser.

### Option 2: Using the Dev Server (Local Server)
Ensure you have Node.js installed, then run in your terminal:
```bash
# Install lightweight server
npm install

# Start the dev server
npm run dev
```
Then navigate to `http://localhost:3000` in your browser.

### Option 3: Python Server
If python is installed, run:
```bash
python3 -m http.server 3000
```
Then navigate to `http://localhost:3000` in your browser.

---

## 🎮 Simulation Walkthrough Guide

To experience the full capability of the system, follow this end-to-end workflow:

1. **Submit Log (Trainee)**:
   - Select **Diane** as the role from the top selector.
   - Go to the **Observation Form** tab, fill in a key observation, write a custom Mermaid flowchart (or keep the default one), and hit **Submit Field Log**.
2. **Approve Log (Field Supervisor)**:
   - Switch role to **Jade (Pre-processing Supervisor)**.
   - Go to the **Review & Sign-off** tab (you will only see Pre-processing entries).
   - Find Diane's entry, click **4 stars**, add comments, and click **Dual Sign-off & Approve**.
3. **Lock & Complete (Mentor)**:
   - Switch role to **Chef Antonio (Lead Mentor)**.
   - Go to the **Review & Sign-off** tab, find Diane's signed-off card, read the supervisor feedback, type final mentoring comments, and click **Submit Final Mentor Comment**.
4. **Check Progress**:
   - Switch back to **Diane** (or keep Chef Antonio and select Diane under the progress view).
   - Go to **Milestone Tracker** and notice the Pre-processing completion bar is now at **100%**, with all criteria checked!
