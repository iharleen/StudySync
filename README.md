# StudySync – Smart Student Academic Management System

StudySync is a professional, client-side academic management web application engineered for university students. It combines three focused modules:
1. **Personal Student Onboarding & Profile**: Personalized student dashboard with real-time greetings, student credentials, academic semester metadata, avatar generation, and live profile editing.
2. **AttendIQ**: Smart Subject-Wise Attendance Tracker with 75% minimum attendance enforcement, consecutive class recovery calculations, safe bunk estimations, total conducted class metrics, and live log updates.
3. **StudySync Planner**: Academic productivity workspace for study task planning, assignment deadlines, and milestone management.

---

## 📁 Project File Structure

```text
StudySync/
│
├── index.html               # Main layout: onboarding overlay, dashboard, sidebar, & modals
├── README.md                # Documentation, features & verification guide
│
├── css/
│   └── style.css            # Responsive design, theme variables, onboarding & preview cards
│
└── js/
    ├── attendance.js        # Mathematical calculation engine (75% rule & recovery)
    ├── storage.js           # LocalStorage CRUD manager (profiles, subjects, tasks)
    ├── charts.js            # Chart.js visualization manager (doughnut & bar charts)
    └── app.js               # Main UI event coordinator, forms, modals & live calculations
```

---

## 🚀 How to Run the Application

Because this application uses standard HTML5, CSS3, Vanilla JavaScript, and LocalStorage, **no installation or complex build tools are required**.

### Method 1: Direct File Launch (Quickest)
1. Navigate to the project folder:
   `c:\Users\harle\OneDrive\Desktop\StudySync`
2. Double-click **`index.html`** or right-click `index.html` → **Open with** → **Google Chrome** (or Edge/Brave/Firefox).
3. If opening for the first time, the **Student Profile Onboarding** welcome screen will automatically appear.

### Method 2: VS Code Live Server (Recommended for Development)
1. Open the `StudySync` folder in Visual Studio Code.
2. If you have the **Live Server** extension installed:
   - Right-click `index.html` and click **"Open with Live Server"**.
3. The app will launch at `http://127.0.0.1:5500/index.html`.

### Method 3: Any Lightweight Local Web Server
You can also run a simple local web server from the terminal in this directory:
- **Python**: `python -m http.server 8000` (then visit `http://localhost:8000`)
- **Node**: `npx serve .`

---

## 🌟 Key Features

### 1. Standalone First-Time Student Onboarding (Feature 1)
- **Zero Dashboard Leak**: When a new student opens the website, **ONLY** the onboarding page is shown. The dashboard is completely hidden until profile creation is completed.
- No fictional demo attendance data is shown as if it belongs to the user. New students begin with a clean, personal subject list and a helpful empty state.
- Collects:
  - **Full Name**
  - **College / University Name**
  - **Course / Branch**
  - **Current Semester**
  - **Section** *(Optional)*
- Comprehensive form validation with field-level error messages and smooth transition.
- Includes a 1-click **"⚡ Load Demo CS Engineering Dataset"** button for instant evaluation and demonstration.

### 2. Personalized Dashboard (Feature 2)
- Dynamic greeting tailored to the time of day (`Good morning, [Name]`, `Good afternoon, [Name]`, or `Good evening, [Name]`).
- Prominently displays the student's name, college, course, and current semester.
- Dynamically generated avatar showing the student's initials.
- Replaced all hardcoded profile fixtures (`Alex Rivera`).

### 3. Personal Subject Management (Feature 3)
- Enables students to add and track their own subjects.
- Collects:
  - **Subject Name**
  - **Course Code** *(Optional)*
  - **Faculty / Instructor** *(Optional)*
  - **Total Classes Conducted**
  - **Classes Attended**
- **Live Attendance Preview Box**: Automatically calculates missed classes (`Total - Attended`), attendance percentage, target status (Safe vs. Shortage), and recovery/bunk estimates as numbers are typed.
- Full 75% target enforcement and attendance math preserved.

### 4. StudySync Planner & Task CRUD
- **Add Tasks**: Specify task title, associated subject (dynamically populated from student's subjects), and due date/timeline.
- **Edit Tasks**: Click `✏️` to modify title, subject, or due date via a dedicated modal.
- **Delete Tasks**: Remove tasks with 1-click `🗑️` and instant UI update.
- **Toggle Completion**: Interactive checkbox with smooth strikethrough styling and live task counter pill updates (`e.g. 2 Tasks Pending (1 Done)`).
- **Filter Tabs**: Filter by `All Tasks`, `Pending`, or `Completed`.
- **LocalStorage Persistence**: All tasks survive page reloads and browser restarts.

### 5. Data Persistence (Feature 4)
- Uses browser `LocalStorage` to save:
  - Student Profile (`studysync_profile_v1`)
  - Subjects & Attendance logs (`studysync_subjects_v1`)
  - Study Planner tasks (`studysync_tasks_v1`)
- Data is restored automatically upon page refresh or browser restart.
- Existing saved subjects and tasks are preserved.

### 6. Profile Settings & Data Management (Feature 5)
- Accessible via the sidebar profile card, the `⚙️ Profile & Settings` nav item, or the header `⚙️ Profile` button.
- Modify full name, college, course, semester, and section anytime.
- **Reset Application Data Dialog**:
  - **Option A (Reset & Start Fresh)**: Clears all browser storage and reopens the first-time onboarding screen.
  - **Option B (Load Sample Data)**: Loads 5 demo computer science subjects with realistic attendance distribution.

---

## 🧪 Testing & Verification Guide

### 1. How to Test First-Time Onboarding
1. Click **Reset Application Data** in the sidebar or under Profile Settings.
2. Select **"Reset & Start Fresh"**.
3. The welcome onboarding screen will appear.
4. Try submitting with empty fields to verify inline validation indicators.
5. Fill in your details (e.g., Name: *Sophia Patel*, College: *National University*, Course: *B.Sc Data Science*, Semester: *Semester 3*).
6. Click **"Continue to Dashboard →"**.
7. Confirm that the dashboard immediately greets you by name (`Good morning/afternoon/evening, Sophia 👋`), updates the avatar to `SP`, and shows your course/semester.

### 2. How to Test Profile Editing
1. Click the sidebar profile card, the `⚙️ Profile & Settings` sidebar link, or the header `⚙️ Profile` button.
2. Change your name or semester (e.g., change name to *Sophia Reed* and semester to *Semester 4*).
3. Click **"Save Profile Changes"**.
4. Confirm that the top greeting, sidebar card, and avatar initials update instantly.

### 3. How to Verify LocalStorage Persistence
1. Add a subject or mark attendance (`+ Present` or `+ Absent`) on an existing subject.
2. Add a new study task in the planner.
3. Refresh the browser tab (`F5` or `Ctrl+R`) or close and reopen the browser.
4. Verify that:
   - Your profile name, course, semester, and avatar remain intact.
   - All subjects, conducted classes, attended classes, and percentages remain preserved.
   - All study tasks remain intact.

### 4. How to Test Attendance Calculations & Charts
1. Click **"+ Add Subject"**.
2. Enter Total Conducted: `40`, Attended: `30` (75.0% - Safe). Check the live preview.
3. Change Attended to `25` (62.5% - Shortage). Check that the live preview reports: *"Attend 20 consecutive classes to reach 75%"*.
4. Enter Attended: `45` (> Total: 40). Notice that the form flags an error: *"Attended classes cannot exceed total classes conducted."*
5. Save the subject and verify that the Doughnut chart and Bar comparison chart update in real time.

---

## 🧮 Mathematical Engine & Features

### 1. 75% Minimum Target Indicator
- **Safe ($\ge 75\%$)**: Highlighted with an emerald green badge and progress bar.
- **Shortage ($< 75\%$)**: Highlighted with a warning amber / critical red badge and alert status.

### 2. Recovery Calculation (When Attendance $< 75\%$)
Calculates the exact number of consecutive classes a student must attend to cross the 75% threshold:
$$\text{Consecutive Classes Needed} = \max(0, \lceil 3 \times \text{Total} - 4 \times \text{Attended} \rceil)$$

### 3. Safe Miss Allowance (When Attendance $\ge 75\%$)
Calculates how many classes can be safely missed without dropping below 75%:
$$\text{Safe Misses} = \max\left(0, \left\lfloor \frac{4 \times \text{Attended} - 3 \times \text{Total}}{3} \right\rfloor\right)$$

### 4. Interactive Quick Actions
- **`+ Present` Button**: Logs a class attended today (+1 Attended, +1 Total) and immediately updates percentages, recovery predictions, and charts.
- **`+ Absent` Button**: Logs an absence (+1 Missed, +1 Total) and recalculates metrics in real time.
- **Full CRUD**: Add new subjects, edit existing subject numbers/details, or delete subjects.
- **LocalStorage Auto-Persistence**: Data is saved automatically on every action.
- **Reset Button**: Easily reset back to the default 5 sample subjects anytime.
- **Dynamic Search & Filters**: Search subjects by name, course code, or professor, and filter by "Safe" or "Shortage".
- **StudySync Task List**: Mark study tasks as completed or add new study goals.

---

## 📊 Pre-Loaded Sample Subjects

| Code | Subject Name | Attended | Missed | Total | Attendance % | Status |
| :--- | :--- | :---: | :---: | :---: | :---: | :---: |
| **CS301** | Data Structures & Algorithms | 34 | 6 | 40 | **85.0%** | Safe (Can miss 5) |
| **CS302** | Database Management Systems | 28 | 10 | 38 | **73.7%** | Shortage (Need 2 classes) |
| **CS303** | Computer Networks | 22 | 10 | 32 | **68.8%** | Shortage (Need 8 classes) |
| **CS304** | Operating Systems | 32 | 4 | 36 | **88.9%** | Safe (Can miss 6) |
| **CS305** | Software Engineering | 24 | 6 | 30 | **80.0%** | Safe (Can miss 2) |
