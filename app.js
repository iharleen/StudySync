/**
 * StudySync & AttendIQ - Main Application Controller
 * Connects StorageManager, AttendanceEngine, ChartManager, and the DOM UI.
 * Features:
 * - Standalone First-Time Student Onboarding (Zero dashboard leak)
 * - Personalized Dashboard, Time-aware Greeting, and Initials Avatar
 * - Personal Subject Management (Total Conducted + Attended classes with live preview)
 * - Complete StudySync Planner with Task Add/Edit/Delete/Filter/Toggle CRUD
 * - Profile Settings, Academic Info updates, and Confirmed Data Reset
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  studentProfile: null,
  subjects: [],
  overallStats: {},
  currentFilter: 'all',
  currentTaskFilter: 'all',
  searchQuery: '',
  editingSubjectId: null,
  deletingSubjectId: null,
  editingTaskId: null,

  /**
   * Application Initialization
   */
  init() {
    this.initDate();
    this.bindEvents();

    // Check if student profile exists in LocalStorage
    if (StorageManager.hasProfile()) {
      this.studentProfile = StorageManager.getProfile();
      this.showDashboardView();
      this.loadData();
      this.renderProfile();
      this.render();
    } else {
      // First-time student visitor: show ONLY onboarding view
      this.showOnboardingView();
    }
  },

  /**
   * Display only the standalone onboarding screen (Dashboard completely hidden)
   */
  showOnboardingView() {
    const onboardingEl = document.getElementById('onboardingScreen');
    const appContainerEl = document.getElementById('appContainer');

    if (onboardingEl) onboardingEl.style.display = 'flex';
    if (appContainerEl) appContainerEl.style.display = 'none';

    this.clearOnboardingErrors();
    const form = document.getElementById('onboardingForm');
    if (form) form.reset();

    setTimeout(() => {
      const nameInput = document.getElementById('onboardingFullName');
      if (nameInput) nameInput.focus();
    }, 150);
  },

  /**
   * Display the dashboard view (Onboarding completely hidden)
   */
  showDashboardView() {
    const onboardingEl = document.getElementById('onboardingScreen');
    const appContainerEl = document.getElementById('appContainer');

    if (onboardingEl) onboardingEl.style.display = 'none';
    if (appContainerEl) appContainerEl.style.display = 'flex';
  },

  /**
   * Set live date in top navigation bar
   */
  initDate() {
    const dateEl = document.getElementById('currentDateDisplay');
    if (dateEl) {
      const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
      dateEl.textContent = new Date().toLocaleDateString('en-US', options);
    }
  },

  /**
   * Load data from StorageManager
   */
  loadData() {
    this.subjects = StorageManager.getSubjects();
    this.overallStats = AttendanceEngine.calculateOverall(this.subjects);
  },

  /**
   * Generate time-sensitive personalized greeting
   * @param {string} fullName
   * @returns {{ prefix: string, firstName: string, fullGreeting: string }}
   */
  getGreeting(fullName) {
    const hour = new Date().getHours();
    let prefix = 'Good morning';
    if (hour >= 12 && hour < 17) {
      prefix = 'Good afternoon';
    } else if (hour >= 17) {
      prefix = 'Good evening';
    }

    const cleanName = (fullName || 'Student').trim();
    const firstName = cleanName.split(' ')[0] || 'Student';

    return {
      prefix,
      firstName,
      fullGreeting: `${prefix}, ${firstName}`
    };
  },

  /**
   * Compute avatar initials from student's name
   * @param {string} name
   * @returns {string} 1-2 letter initials
   */
  getInitials(name) {
    if (!name || typeof name !== 'string') return 'ST';
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0) return 'ST';
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  },

  /**
   * Render personalized student profile across header, sidebar and modals
   */
  renderProfile() {
    const profile = this.studentProfile || {
      fullName: 'Student Profile',
      college: 'University',
      course: 'Course',
      semester: 'Current Semester',
      section: ''
    };

    const greeting = this.getGreeting(profile.fullName);
    const initials = this.getInitials(profile.fullName);

    // 1. Top Header Greeting
    const greetingTitleEl = document.getElementById('userGreetingTitle');
    if (greetingTitleEl) {
      greetingTitleEl.innerHTML = `${this.escapeHtml(greeting.prefix)}, <span id="userGreetingName">${this.escapeHtml(greeting.firstName)}</span> 👋`;
    }

    const academicMetaEl = document.getElementById('userAcademicMeta');
    if (academicMetaEl) {
      let metaText = `${profile.course} • ${profile.semester}`;
      if (profile.section) {
        metaText += ` (${profile.section})`;
      }
      academicMetaEl.textContent = metaText;
    }

    // 2. Sidebar Profile Card
    const sidebarAvatar = document.getElementById('sidebarUserAvatar');
    if (sidebarAvatar) sidebarAvatar.textContent = initials;

    const sidebarName = document.getElementById('sidebarUserName');
    if (sidebarName) sidebarName.textContent = profile.fullName;

    const sidebarCourse = document.getElementById('sidebarUserCourse');
    if (sidebarCourse) {
      sidebarCourse.textContent = `${profile.course} • ${profile.semester}`;
    }

    // 3. Profile Settings Modal Preview
    const modalAvatar = document.getElementById('profileModalAvatar');
    if (modalAvatar) modalAvatar.textContent = initials;

    const modalName = document.getElementById('profileModalPreviewName');
    if (modalName) modalName.textContent = profile.fullName;

    const modalSub = document.getElementById('profileModalPreviewSub');
    if (modalSub) {
      let subText = `${profile.course} • ${profile.semester}`;
      if (profile.section) subText += ` • ${profile.section}`;
      modalSub.textContent = subText;
    }

    const modalCollege = document.getElementById('profileModalPreviewCollege');
    if (modalCollege) {
      modalCollege.textContent = profile.college || 'College / University';
    }
  },

  /**
   * Bind all DOM event listeners
   */
  bindEvents() {
    // 1. Mobile navigation toggle
    const mobileMenuBtn = document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('appSidebar');
    if (mobileMenuBtn && sidebar) {
      mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
      });

      // Close sidebar when clicking outside on mobile
      document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && sidebar.classList.contains('mobile-open')) {
          if (!sidebar.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('mobile-open');
          }
        }
      });
    }

    // 2. Sidebar Navigation Items
    const navDashboardBtn = document.getElementById('navDashboardBtn');
    if (navDashboardBtn) {
      navDashboardBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActiveNavItem('navDashboardBtn');
        window.scrollTo({ top: 0, behavior: 'smooth' });
        this.closeMobileSidebar();
      });
    }

    const navAttendIQBtn = document.getElementById('navAttendIQBtn');
    if (navAttendIQBtn) {
      navAttendIQBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActiveNavItem('navAttendIQBtn');
        const el = document.getElementById('attendanceSection');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        this.closeMobileSidebar();
      });
    }

    const navStudySyncBtn = document.getElementById('navStudySyncBtn');
    if (navStudySyncBtn) {
      navStudySyncBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.setActiveNavItem('navStudySyncBtn');
        const el = document.getElementById('studySyncSection');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
        this.closeMobileSidebar();
      });
    }

    // 3. Quick Shortcuts in Sidebar
    const sidebarAddSubjectBtn = document.getElementById('sidebarAddSubjectBtn');
    if (sidebarAddSubjectBtn) {
      sidebarAddSubjectBtn.addEventListener('click', () => {
        this.closeMobileSidebar();
        this.openAddModal();
      });
    }

    const navProfileBtn = document.getElementById('openProfileSettingsBtn');
    if (navProfileBtn) {
      navProfileBtn.addEventListener('click', () => {
        this.closeMobileSidebar();
        this.openProfileModal();
      });
    }

    const resetDataBtn = document.getElementById('resetDataBtn');
    if (resetDataBtn) {
      resetDataBtn.addEventListener('click', () => {
        this.closeMobileSidebar();
        this.openResetModal();
      });
    }

    // Sidebar User Profile click triggers Profile modal
    const sidebarProfileCard = document.getElementById('sidebarUserProfile');
    if (sidebarProfileCard) {
      sidebarProfileCard.addEventListener('click', () => this.openProfileModal());
      sidebarProfileCard.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.openProfileModal();
        }
      });
    }

    const sidebarEditBtn = document.getElementById('sidebarEditProfileBtn');
    if (sidebarEditBtn) {
      sidebarEditBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.openProfileModal();
      });
    }

    // 4. Header Action Buttons
    const headerEditProfileBtn = document.getElementById('headerEditProfileBtn');
    if (headerEditProfileBtn) {
      headerEditProfileBtn.addEventListener('click', () => this.openProfileModal());
    }

    const headerAddSubjectBtn = document.getElementById('headerAddSubjectBtn');
    if (headerAddSubjectBtn) {
      headerAddSubjectBtn.addEventListener('click', () => this.openAddModal());
    }

    const headerMarkAttendanceBtn = document.getElementById('headerMarkAttendanceBtn');
    if (headerMarkAttendanceBtn) {
      headerMarkAttendanceBtn.addEventListener('click', () => {
        const el = document.getElementById('attendanceSection');
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      });
    }

    // 5. AttendIQ Section Controls
    const openAddSubjectBtn = document.getElementById('openAddSubjectBtn');
    if (openAddSubjectBtn) {
      openAddSubjectBtn.addEventListener('click', () => this.openAddModal());
    }

    const searchInput = document.getElementById('subjectSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase().trim();
        this.renderSubjectCards();
      });
    }

    const filterSelect = document.getElementById('attendanceFilterSelect');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.currentFilter = e.target.value;
        this.renderSubjectCards();
      });
    }

    // 6. Subject Form Submit & Live Calculations
    const subjectForm = document.getElementById('subjectForm');
    if (subjectForm) {
      subjectForm.addEventListener('submit', (e) => this.handleSubjectFormSubmit(e));
    }

    const formTotalInput = document.getElementById('formTotal');
    const formAttendedInput = document.getElementById('formAttended');
    if (formTotalInput) {
      formTotalInput.addEventListener('input', () => this.updateSubjectFormCalcPreview());
    }
    if (formAttendedInput) {
      formAttendedInput.addEventListener('input', () => this.updateSubjectFormCalcPreview());
    }

    // 7. Delete Subject Confirmation
    const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
    if (confirmDeleteBtn) {
      confirmDeleteBtn.addEventListener('click', () => this.handleDeleteConfirm());
    }

    // 8. Onboarding Form & Demo Load
    const onboardingForm = document.getElementById('onboardingForm');
    if (onboardingForm) {
      onboardingForm.addEventListener('submit', (e) => this.handleOnboardingSubmit(e));
    }

    const onboardingDemoBtn = document.getElementById('onboardingDemoBtn');
    if (onboardingDemoBtn) {
      onboardingDemoBtn.addEventListener('click', () => this.handleOnboardingDemo());
    }

    // 9. Profile Edit Form Submit
    const profileEditForm = document.getElementById('profileEditForm');
    if (profileEditForm) {
      profileEditForm.addEventListener('submit', (e) => this.handleProfileEditSubmit(e));
    }

    const openResetFromProfileBtn = document.getElementById('openResetFromProfileBtn');
    if (openResetFromProfileBtn) {
      openResetFromProfileBtn.addEventListener('click', () => this.openResetModal());
    }

    // 10. Reset Confirmation Actions
    const confirmResetFreshBtn = document.getElementById('confirmResetFreshBtn');
    if (confirmResetFreshBtn) {
      confirmResetFreshBtn.addEventListener('click', () => this.handleResetConfirm('fresh'));
    }

    const confirmResetSampleBtn = document.getElementById('confirmResetSampleBtn');
    if (confirmResetSampleBtn) {
      confirmResetSampleBtn.addEventListener('click', () => this.handleResetConfirm('sample'));
    }

    // 11. StudySync Task Creation & Filters
    const addTaskBtn = document.getElementById('quickAddTaskBtn');
    if (addTaskBtn) {
      addTaskBtn.addEventListener('click', () => this.handleAddTask());
    }

    const newTaskTitleInput = document.getElementById('newTaskTitleInput');
    if (newTaskTitleInput) {
      newTaskTitleInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.handleAddTask();
        }
      });
    }

    // Task Filter Buttons
    document.querySelectorAll('[data-task-filter]').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('[data-task-filter]').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentTaskFilter = btn.getAttribute('data-task-filter') || 'all';
        this.renderStudyTasks();
      });
    });

    // 12. Edit Task Form Submit
    const taskEditForm = document.getElementById('taskEditForm');
    if (taskEditForm) {
      taskEditForm.addEventListener('submit', (e) => this.handleEditTaskSubmit(e));
    }

    // 13. Modal Close Triggers & Escape Key
    document.querySelectorAll('.modal-close-trigger').forEach(btn => {
      btn.addEventListener('click', () => this.closeModals());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeModals();
      }
    });
  },

  /**
   * Helper to set active nav link in sidebar
   */
  setActiveNavItem(btnId) {
    document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => item.classList.remove('active'));
    const target = document.getElementById(btnId);
    if (target) target.classList.add('active');
  },

  /**
   * Helper to close mobile sidebar
   */
  closeMobileSidebar() {
    const sidebar = document.getElementById('appSidebar');
    if (sidebar && sidebar.classList.contains('mobile-open')) {
      sidebar.classList.remove('mobile-open');
    }
  },

  /**
   * Main render coordinator
   */
  render() {
    this.renderKPIStats();
    this.renderSubjectCards();
    this.renderStudyTasks();
    this.populateTaskSubjectDropdown();
    ChartManager.updateCharts(this.subjects, this.overallStats);
  },

  /**
   * Render Top KPI Stat Cards
   */
  renderKPIStats() {
    const stats = this.overallStats;

    // Overall Percentage
    const overallPctEl = document.getElementById('kpiOverallPercentage');
    const overallStatusEl = document.getElementById('kpiOverallStatus');
    const cardOverall = document.getElementById('cardOverallPct');

    if (this.subjects.length === 0) {
      if (overallPctEl) overallPctEl.textContent = '--%';
      if (overallStatusEl) {
        overallStatusEl.innerHTML = '<span style="color: var(--text-muted)">● No subjects added yet</span>';
      }
      if (cardOverall) cardOverall.className = 'stat-card';
    } else {
      if (overallPctEl) overallPctEl.textContent = `${stats.percentage}%`;
      if (overallStatusEl) {
        if (stats.percentage >= 75) {
          overallStatusEl.innerHTML = '<span style="color: var(--success)">● Minimum 75% Met</span>';
          if (cardOverall) cardOverall.className = 'stat-card card-safe';
        } else {
          const diff = Number((75 - stats.percentage).toFixed(1));
          overallStatusEl.innerHTML = `<span style="color: var(--danger)">● ${diff}% Below Target</span>`;
          if (cardOverall) cardOverall.className = 'stat-card card-danger';
        }
      }
    }

    // Attended Classes
    const attendedEl = document.getElementById('kpiAttendedClasses');
    if (attendedEl) attendedEl.textContent = stats.attendedClasses || 0;

    // Missed Classes
    const missedEl = document.getElementById('kpiMissedClasses');
    if (missedEl) missedEl.textContent = stats.missedClasses || 0;

    // Total Classes
    const totalEl = document.getElementById('kpiTotalClasses');
    if (totalEl) totalEl.textContent = stats.totalClasses || 0;

    // Update Doughnut center percentage
    const doughnutPct = document.getElementById('doughnutCenterPct');
    if (doughnutPct) {
      if (this.subjects.length === 0 || stats.totalClasses === 0) {
        doughnutPct.textContent = '--%';
        doughnutPct.style.color = 'var(--text-muted)';
      } else {
        doughnutPct.textContent = `${stats.percentage}%`;
        doughnutPct.style.color = stats.percentage >= 75 ? 'var(--success)' : 'var(--warning)';
      }
    }
  },

  /**
   * Filter and render subject cards
   */
  renderSubjectCards() {
    const container = document.getElementById('subjectsGrid');
    if (!container) return;

    let filtered = this.subjects.filter(sub => {
      // Search match
      const nameMatch = (sub.name || '').toLowerCase().includes(this.searchQuery);
      const codeMatch = (sub.code || '').toLowerCase().includes(this.searchQuery);
      const facultyMatch = (sub.faculty || '').toLowerCase().includes(this.searchQuery);
      const matchesSearch = nameMatch || codeMatch || facultyMatch;

      if (!matchesSearch) return false;

      // Status filter
      const total = Number(sub.total) || (Number(sub.attended) + Number(sub.missed));
      const pct = AttendanceEngine.calculatePercentage(Number(sub.attended), total);
      if (this.currentFilter === 'safe') return pct >= 75;
      if (this.currentFilter === 'critical') return pct < 75;
      return true;
    });

    if (filtered.length === 0) {
      const isSearchActive = this.searchQuery || this.currentFilter !== 'all';
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">${isSearchActive ? '🔍' : '📚'}</div>
          <h3>${isSearchActive ? 'No matching subjects found' : 'No subjects added yet'}</h3>
          <p>${isSearchActive
            ? 'Try adjusting your search query or changing the attendance filter.'
            : 'Start building your personalized attendance tracker by adding your semester subjects.'}
          </p>
          <button class="btn btn-primary btn-sm" onclick="App.openAddModal()">
            <span>+ Add Your First Subject</span>
          </button>
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(sub => {
      const attended = Number(sub.attended) || 0;
      const missed = Number(sub.missed) || 0;
      const total = Number(sub.total) !== undefined ? Number(sub.total) : (attended + missed);
      const pct = AttendanceEngine.calculatePercentage(attended, total);
      const status = AttendanceEngine.getStatus(pct);

      let insightHtml = '';
      if (total === 0) {
        insightHtml = `
          <div class="status-insight-box warning">
            <span>ℹ️</span>
            <span>No classes conducted yet. Ready for your first session.</span>
          </div>
        `;
      } else if (pct < 75) {
        const needed = AttendanceEngine.classesNeededToReachTarget(attended, total);
        insightHtml = `
          <div class="status-insight-box critical">
            <span>⚠️</span>
            <span>Attend <strong>${needed}</strong> consecutive ${needed === 1 ? 'class' : 'classes'} to reach 75% target</span>
          </div>
        `;
      } else {
        const safeMisses = AttendanceEngine.classesCanMiss(attended, total);
        insightHtml = `
          <div class="status-insight-box safe">
            <span>✅</span>
            <span>Attendance safe! You can safely miss <strong>${safeMisses}</strong> ${safeMisses === 1 ? 'class' : 'classes'}.</span>
          </div>
        `;
      }

      return `
        <div class="subject-card" data-id="${sub.id}">
          <div>
            <div class="subject-card-header">
              <div>
                <span class="subject-code-tag">${this.escapeHtml(sub.code || 'COURSE')}</span>
                <h3 class="subject-name">${this.escapeHtml(sub.name)}</h3>
                <p class="subject-faculty">👨‍🏫 ${this.escapeHtml(sub.faculty || 'Course Instructor')}</p>
              </div>
              <div class="percentage-badge ${status}">
                ${pct}%
              </div>
            </div>

            <div class="progress-container">
              <div class="progress-track">
                <div class="progress-bar-fill ${status}" style="width: ${Math.min(100, pct)}%"></div>
              </div>
            </div>

            <div class="subject-stats-row">
              <div>
                <div class="mini-stat-label">Attended</div>
                <div class="mini-stat-val" style="color: var(--success);">${attended}</div>
              </div>
              <div>
                <div class="mini-stat-label">Missed</div>
                <div class="mini-stat-val" style="color: var(--danger);">${missed}</div>
              </div>
              <div>
                <div class="mini-stat-label">Total</div>
                <div class="mini-stat-val">${total}</div>
              </div>
            </div>

            ${insightHtml}
          </div>

          <div class="card-actions-wrapper">
            <div class="attendance-quick-log">
              <button class="btn-log btn-present" onclick="App.markAttendance('${sub.id}', 'present')" title="Attended one class today">
                <span>+ Present</span>
              </button>
              <button class="btn-log btn-absent" onclick="App.markAttendance('${sub.id}', 'absent')" title="Missed one class today">
                <span>+ Absent</span>
              </button>
            </div>
            <div class="card-options">
              <button class="btn-icon" onclick="App.openEditModal('${sub.id}')" title="Edit Subject Details">
                ✏️
              </button>
              <button class="btn-icon delete" onclick="App.openDeleteModal('${sub.id}')" title="Delete Subject">
                🗑️
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  /**
   * Dynamically populate the subject dropdowns in task creation & edit modals
   */
  populateTaskSubjectDropdown() {
    const creationSelect = document.getElementById('newTaskSubjectSelect');
    const editSelect = document.getElementById('editTaskSubject');

    const optionsHtml = [
      '<option value="General">General Coursework</option>',
      ...this.subjects.map(s => `<option value="${this.escapeHtml(s.name)}">${this.escapeHtml(s.name)} (${this.escapeHtml(s.code || 'Course')})</option>`)
    ].join('');

    if (creationSelect) creationSelect.innerHTML = optionsHtml;
    if (editSelect) editSelect.innerHTML = optionsHtml;
  },

  /**
   * Render StudySync Productivity Tasks with Filter Support
   */
  renderStudyTasks() {
    const list = document.getElementById('studyTaskList');
    const pill = document.getElementById('taskStatsPill');
    if (!list) return;

    const allTasks = StorageManager.getTasks();
    const completedCount = allTasks.filter(t => t.completed).length;
    const pendingCount = allTasks.length - completedCount;

    if (pill) {
      pill.textContent = `${pendingCount} ${pendingCount === 1 ? 'Task' : 'Tasks'} Pending (${completedCount} Done)`;
    }

    let filtered = allTasks;
    if (this.currentTaskFilter === 'pending') {
      filtered = allTasks.filter(t => !t.completed);
    } else if (this.currentTaskFilter === 'completed') {
      filtered = allTasks.filter(t => t.completed);
    }

    if (filtered.length === 0) {
      let emptyMsg = 'No study tasks found. Use the toolbar above to schedule assignments and milestones.';
      if (this.currentTaskFilter === 'pending') emptyMsg = 'No pending tasks! You are all caught up.';
      if (this.currentTaskFilter === 'completed') emptyMsg = 'No completed tasks yet.';

      list.innerHTML = `
        <div style="padding: 24px; text-align: center; color: var(--text-muted); font-size: 0.86rem; background: #f8fafc; border-radius: var(--radius-sm); border: 1px dashed var(--border-color);">
          ${emptyMsg}
        </div>
      `;
      return;
    }

    list.innerHTML = filtered.map(task => `
      <div class="task-item" data-task-id="${task.id}">
        <div class="task-left">
          <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''} onchange="App.toggleTask('${task.id}')" title="Mark Task Complete">
          <div style="min-width: 0;">
            <div class="task-title ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.title)}</div>
            <div class="task-meta-row">
              <span class="task-tag">${this.escapeHtml(task.subject || 'General')}</span>
            </div>
          </div>
        </div>
        <div class="task-right">
          <div class="task-due">⏰ ${this.escapeHtml(task.due || 'This Week')}</div>
          <div class="task-actions">
            <button class="btn-icon" onclick="App.openEditTaskModal('${task.id}')" title="Edit Task">
              ✏️
            </button>
            <button class="btn-icon delete" onclick="App.deleteTask('${task.id}')" title="Delete Task">
              🗑️
            </button>
          </div>
        </div>
      </div>
    `).join('');
  },

  /**
   * Toggle task completion status
   */
  toggleTask(taskId) {
    StorageManager.toggleTask(taskId);
    this.renderStudyTasks();
  },

  /**
   * Quick Add Task
   */
  handleAddTask() {
    const titleInput = document.getElementById('newTaskTitleInput');
    const subjectSelect = document.getElementById('newTaskSubjectSelect');
    const dueInput = document.getElementById('newTaskDueInput');

    if (!titleInput || !titleInput.value.trim()) {
      titleInput.focus();
      return;
    }

    const title = titleInput.value.trim();
    const subject = subjectSelect ? subjectSelect.value : 'General';
    const due = dueInput && dueInput.value.trim() ? dueInput.value.trim() : 'This Week';

    StorageManager.addTask(title, subject, due);

    titleInput.value = '';
    if (dueInput) dueInput.value = '';

    this.renderStudyTasks();
    this.showToast('Study task added to your planner!', 'success');
  },

  /**
   * Open Edit Task Modal
   */
  openEditTaskModal(taskId) {
    const tasks = StorageManager.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;

    this.editingTaskId = taskId;
    this.populateTaskSubjectDropdown();

    const idInput = document.getElementById('editTaskId');
    const titleInput = document.getElementById('editTaskTitle');
    const subjectSelect = document.getElementById('editTaskSubject');
    const dueInput = document.getElementById('editTaskDue');
    const titleErr = document.getElementById('errorEditTaskTitle');

    if (idInput) idInput.value = task.id;
    if (titleInput) {
      titleInput.value = task.title;
      titleInput.classList.remove('is-invalid');
    }
    if (subjectSelect) subjectSelect.value = task.subject || 'General';
    if (dueInput) dueInput.value = task.due || '';
    if (titleErr) {
      titleErr.textContent = '';
      titleErr.classList.remove('visible');
    }

    const modal = document.getElementById('taskEditModalBackdrop');
    if (modal) modal.classList.add('active');
  },

  /**
   * Handle Edit Task Form Submit
   */
  handleEditTaskSubmit(e) {
    e.preventDefault();
    if (!this.editingTaskId) return;

    const titleInput = document.getElementById('editTaskTitle');
    const subjectSelect = document.getElementById('editTaskSubject');
    const dueInput = document.getElementById('editTaskDue');
    const titleErr = document.getElementById('errorEditTaskTitle');

    const title = titleInput ? titleInput.value.trim() : '';
    const subject = subjectSelect ? subjectSelect.value : 'General';
    const due = dueInput && dueInput.value.trim() ? dueInput.value.trim() : 'This Week';

    if (!title) {
      if (titleInput) titleInput.classList.add('is-invalid');
      if (titleErr) {
        titleErr.textContent = 'Task title cannot be empty.';
        titleErr.classList.add('visible');
      }
      return;
    }

    StorageManager.updateTask(this.editingTaskId, {
      title,
      subject,
      due
    });

    this.closeModals();
    this.renderStudyTasks();
    this.showToast('Task updated successfully!', 'success');
  },

  /**
   * Delete Task
   */
  deleteTask(taskId) {
    StorageManager.deleteTask(taskId);
    this.renderStudyTasks();
    this.showToast('Task deleted from your planner.', 'info');
  },

  /**
   * Quick Mark Attendance (+1 Present or +1 Absent)
   */
  markAttendance(id, status) {
    const updated = StorageManager.markAttendance(id, status);
    if (!updated) return;

    this.loadData();
    this.render();

    const text = status === 'present' ? 'Marked Present (+1 class attended)' : 'Marked Absent (+1 class missed)';
    const toastType = status === 'present' ? 'success' : 'danger';
    this.showToast(`${updated.code || updated.name}: ${text}`, toastType);
  },

  /**
   * Clear all onboarding form error indicators
   */
  clearOnboardingErrors() {
    ['FullName', 'College', 'Course', 'Semester'].forEach(field => {
      const errEl = document.getElementById(`errorOnboarding${field}`);
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('visible');
      }
      const inputEl = document.getElementById(`onboarding${field}`);
      if (inputEl) inputEl.classList.remove('is-invalid');
    });
  },

  /**
   * FEATURE 1 & 2: Handle Onboarding Form Submit
   */
  handleOnboardingSubmit(e) {
    e.preventDefault();
    this.clearOnboardingErrors();

    const fullNameInput = document.getElementById('onboardingFullName');
    const collegeInput = document.getElementById('onboardingCollege');
    const courseInput = document.getElementById('onboardingCourse');
    const semesterSelect = document.getElementById('onboardingSemester');
    const sectionInput = document.getElementById('onboardingSection');

    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    const college = collegeInput ? collegeInput.value.trim() : '';
    const course = courseInput ? courseInput.value.trim() : '';
    const semester = semesterSelect ? semesterSelect.value.trim() : '';
    const section = sectionInput ? sectionInput.value.trim() : '';

    let hasErrors = false;

    if (!fullName || fullName.length < 2) {
      this.showFieldError('onboardingFullName', 'errorOnboardingFullName', 'Please enter your full name (at least 2 characters).');
      hasErrors = true;
    }

    if (!college || college.length < 2) {
      this.showFieldError('onboardingCollege', 'errorOnboardingCollege', 'Please enter your college or university name.');
      hasErrors = true;
    }

    if (!course || course.length < 2) {
      this.showFieldError('onboardingCourse', 'errorOnboardingCourse', 'Please enter your academic course / branch.');
      hasErrors = true;
    }

    if (!semester) {
      this.showFieldError('onboardingSemester', 'errorOnboardingSemester', 'Please select your current semester.');
      hasErrors = true;
    }

    if (hasErrors) return;

    // Save profile to LocalStorage
    const profile = StorageManager.saveProfile({
      fullName,
      college,
      course,
      semester,
      section
    });

    this.studentProfile = profile;

    // Start with clean personal subjects and clean tasks
    StorageManager.saveSubjects([]);
    StorageManager.saveTasks([]);

    // Transition to dashboard view
    this.showDashboardView();
    this.loadData();
    this.renderProfile();
    this.render();

    this.showToast(`Welcome to StudySync, ${profile.fullName}! Your personal dashboard is ready.`, 'success');
  },

  /**
   * Handle Demo Load from Onboarding Screen
   */
  handleOnboardingDemo() {
    StorageManager.resetApplicationData({ loadSample: true });
    this.studentProfile = StorageManager.getProfile();
    this.showDashboardView();
    this.loadData();
    this.renderProfile();
    this.render();
    this.showToast('Loaded demo engineering dataset with sample subjects & tasks.', 'info');
  },

  /**
   * Helper to display inline field validation error
   */
  showFieldError(inputId, errorId, message) {
    const input = document.getElementById(inputId);
    if (input) input.classList.add('is-invalid');
    const errorEl = document.getElementById(errorId);
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('visible');
    }
  },

  /**
   * Open Profile & Academic Settings Modal
   */
  openProfileModal() {
    this.closeModals();

    const profile = this.studentProfile || StorageManager.getProfile() || {
      fullName: '',
      college: '',
      course: '',
      semester: 'Semester 1',
      section: ''
    };

    const nameInput = document.getElementById('profileEditFullName');
    const collegeInput = document.getElementById('profileEditCollege');
    const courseInput = document.getElementById('profileEditCourse');
    const semesterSelect = document.getElementById('profileEditSemester');
    const sectionInput = document.getElementById('profileEditSection');

    if (nameInput) nameInput.value = profile.fullName || '';
    if (collegeInput) collegeInput.value = profile.college || '';
    if (courseInput) courseInput.value = profile.course || '';
    if (semesterSelect) semesterSelect.value = profile.semester || 'Semester 1';
    if (sectionInput) sectionInput.value = profile.section || '';

    // Clear any previous edit errors
    ['FullName', 'College', 'Course', 'Semester'].forEach(field => {
      const errEl = document.getElementById(`errorProfileEdit${field}`);
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('visible');
      }
      const el = document.getElementById(`profileEdit${field}`);
      if (el) el.classList.remove('is-invalid');
    });

    this.renderProfile();

    const modal = document.getElementById('profileModalBackdrop');
    if (modal) modal.classList.add('active');
  },

  /**
   * Handle Profile Edit Form Submission
   */
  handleProfileEditSubmit(e) {
    e.preventDefault();

    const fullNameInput = document.getElementById('profileEditFullName');
    const collegeInput = document.getElementById('profileEditCollege');
    const courseInput = document.getElementById('profileEditCourse');
    const semesterSelect = document.getElementById('profileEditSemester');
    const sectionInput = document.getElementById('profileEditSection');

    const fullName = fullNameInput ? fullNameInput.value.trim() : '';
    const college = collegeInput ? collegeInput.value.trim() : '';
    const course = courseInput ? courseInput.value.trim() : '';
    const semester = semesterSelect ? semesterSelect.value.trim() : '';
    const section = sectionInput ? sectionInput.value.trim() : '';

    let hasErrors = false;

    // Reset errors
    ['FullName', 'College', 'Course', 'Semester'].forEach(field => {
      const errEl = document.getElementById(`errorProfileEdit${field}`);
      if (errEl) {
        errEl.textContent = '';
        errEl.classList.remove('visible');
      }
      const el = document.getElementById(`profileEdit${field}`);
      if (el) el.classList.remove('is-invalid');
    });

    if (!fullName || fullName.length < 2) {
      this.showFieldError('profileEditFullName', 'errorProfileEditFullName', 'Full name is required.');
      hasErrors = true;
    }
    if (!college || college.length < 2) {
      this.showFieldError('profileEditCollege', 'errorProfileEditCollege', 'College / University name is required.');
      hasErrors = true;
    }
    if (!course || course.length < 2) {
      this.showFieldError('profileEditCourse', 'errorProfileEditCourse', 'Course / Branch is required.');
      hasErrors = true;
    }
    if (!semester) {
      this.showFieldError('profileEditSemester', 'errorProfileEditSemester', 'Please select a semester.');
      hasErrors = true;
    }

    if (hasErrors) return;

    const updated = StorageManager.saveProfile({
      fullName,
      college,
      course,
      semester,
      section
    });

    this.studentProfile = updated;
    this.renderProfile();
    this.closeModals();
    this.showToast('Student profile and academic information updated!', 'success');
  },

  /**
   * Open Reset Confirmation Dialog
   */
  openResetModal() {
    this.closeModals();
    const modal = document.getElementById('resetModalBackdrop');
    if (modal) modal.classList.add('active');
  },

  /**
   * Confirm Reset Application Data
   * @param {'fresh' | 'sample'} type
   */
  handleResetConfirm(type) {
    if (type === 'fresh') {
      StorageManager.resetApplicationData({ loadSample: false });
      this.studentProfile = null;
      this.closeModals();
      this.loadData();
      this.render();
      this.showOnboardingView();
      this.showToast('Application reset. Please set up your student profile.', 'info');
    } else if (type === 'sample') {
      StorageManager.resetApplicationData({ loadSample: true });
      this.studentProfile = StorageManager.getProfile();
      this.closeModals();
      this.showDashboardView();
      this.loadData();
      this.renderProfile();
      this.render();
      this.showToast('Loaded demo engineering dataset with sample profile.', 'info');
    }
  },

  /**
   * Live Attendance Preview Calculation inside Subject Modal
   */
  updateSubjectFormCalcPreview() {
    const totalInput = document.getElementById('formTotal');
    const attendedInput = document.getElementById('formAttended');
    const attendedErr = document.getElementById('errorSubjectAttended');

    const total = Math.max(0, parseInt(totalInput ? totalInput.value : 0, 10) || 0);
    const attended = Math.max(0, parseInt(attendedInput ? attendedInput.value : 0, 10) || 0);

    // Validate attended <= total
    if (attended > total && total > 0) {
      if (attendedInput) attendedInput.classList.add('is-invalid');
      if (attendedErr) {
        attendedErr.textContent = 'Attended classes cannot exceed total classes conducted.';
        attendedErr.classList.add('visible');
      }
    } else {
      if (attendedInput) attendedInput.classList.remove('is-invalid');
      if (attendedErr) {
        attendedErr.textContent = '';
        attendedErr.classList.remove('visible');
      }
    }

    const missed = Math.max(0, total - attended);
    const pct = total > 0 ? Number(((attended / total) * 100).toFixed(1)) : 0;
    const status = AttendanceEngine.getStatus(pct);

    // Update UI elements in preview
    const previewAttended = document.getElementById('modalPreviewAttended');
    const previewTotal = document.getElementById('modalPreviewTotal');
    const previewPctBadge = document.getElementById('modalPreviewPctBadge');
    const previewMissed = document.getElementById('modalPreviewMissed');
    const previewStatusText = document.getElementById('modalPreviewStatusText');
    const previewInsight = document.getElementById('modalPreviewInsight');

    if (previewAttended) previewAttended.textContent = attended;
    if (previewTotal) previewTotal.textContent = total;

    if (previewPctBadge) {
      previewPctBadge.textContent = `${pct}%`;
      previewPctBadge.className = `percentage-badge ${status}`;
    }

    if (previewMissed) {
      previewMissed.textContent = missed;
    }

    if (previewStatusText) {
      if (total === 0) {
        previewStatusText.textContent = 'No Sessions Logged';
        previewStatusText.style.color = 'var(--text-muted)';
      } else if (pct >= 75) {
        previewStatusText.textContent = 'Safe (≥ 75%)';
        previewStatusText.style.color = 'var(--success)';
      } else {
        previewStatusText.textContent = 'Shortage (< 75%)';
        previewStatusText.style.color = 'var(--danger)';
      }
    }

    if (previewInsight) {
      if (total === 0) {
        previewInsight.innerHTML = 'ℹ️ Minimum target is <strong>75%</strong> attendance. Enter your classes to see recovery or safe bunk estimates.';
      } else if (pct >= 75) {
        const safeMisses = AttendanceEngine.classesCanMiss(attended, total);
        previewInsight.innerHTML = `✅ <strong>Attendance Safe!</strong> You can safely miss <strong>${safeMisses}</strong> ${safeMisses === 1 ? 'class' : 'classes'} without falling below 75%.`;
      } else {
        const needed = AttendanceEngine.classesNeededToReachTarget(attended, total);
        previewInsight.innerHTML = `⚠️ <strong>Attendance Shortage!</strong> You need to attend <strong>${needed}</strong> consecutive ${needed === 1 ? 'class' : 'classes'} to reach 75%.`;
      }
    }
  },

  /**
   * Open Modal to Add a new personal subject
   */
  openAddModal() {
    this.editingSubjectId = null;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Add New Subject';

    const form = document.getElementById('subjectForm');
    if (form) form.reset();

    const idInput = document.getElementById('formSubjectId');
    if (idInput) idInput.value = '';

    const nameInput = document.getElementById('formSubjectName');
    const totalInput = document.getElementById('formTotal');
    const attendedInput = document.getElementById('formAttended');

    if (nameInput) nameInput.classList.remove('is-invalid');
    if (totalInput) {
      totalInput.value = 0;
      totalInput.classList.remove('is-invalid');
    }
    if (attendedInput) {
      attendedInput.value = 0;
      attendedInput.classList.remove('is-invalid');
    }

    ['Name', 'Total', 'Attended'].forEach(f => {
      const err = document.getElementById(`errorSubject${f}`);
      if (err) {
        err.textContent = '';
        err.classList.remove('visible');
      }
    });

    this.updateSubjectFormCalcPreview();
    const modal = document.getElementById('modalBackdrop');
    if (modal) modal.classList.add('active');

    setTimeout(() => {
      if (nameInput) nameInput.focus();
    }, 150);
  },

  /**
   * Open Modal to Edit existing subject
   */
  openEditModal(id) {
    const sub = this.subjects.find(s => s.id === id);
    if (!sub) return;

    this.editingSubjectId = id;
    const modalTitle = document.getElementById('modalTitle');
    if (modalTitle) modalTitle.textContent = 'Edit Subject Details';

    const idInput = document.getElementById('formSubjectId');
    const nameInput = document.getElementById('formSubjectName');
    const codeInput = document.getElementById('formSubjectCode');
    const facultyInput = document.getElementById('formFaculty');
    const totalInput = document.getElementById('formTotal');
    const attendedInput = document.getElementById('formAttended');

    if (idInput) idInput.value = sub.id;
    if (nameInput) nameInput.value = sub.name;
    if (codeInput) codeInput.value = sub.code || '';
    if (facultyInput) facultyInput.value = sub.faculty || '';

    const total = sub.total !== undefined ? sub.total : ((sub.attended || 0) + (sub.missed || 0));
    if (totalInput) totalInput.value = total;
    if (attendedInput) attendedInput.value = sub.attended || 0;

    ['Name', 'Total', 'Attended'].forEach(f => {
      const err = document.getElementById(`errorSubject${f}`);
      if (err) {
        err.textContent = '';
        err.classList.remove('visible');
      }
    });

    this.updateSubjectFormCalcPreview();
    const modal = document.getElementById('modalBackdrop');
    if (modal) modal.classList.add('active');
  },

  /**
   * Open Delete Confirmation Modal
   */
  openDeleteModal(id) {
    const sub = this.subjects.find(s => s.id === id);
    if (!sub) return;

    this.deletingSubjectId = id;
    const nameEl = document.getElementById('deleteSubjectName');
    if (nameEl) {
      nameEl.textContent = `${sub.name} (${sub.code || 'N/A'})`;
    }
    const modal = document.getElementById('deleteModalBackdrop');
    if (modal) modal.classList.add('active');
  },

  /**
   * Confirm Delete Subject
   */
  handleDeleteConfirm() {
    if (!this.deletingSubjectId) return;

    const sub = this.subjects.find(s => s.id === this.deletingSubjectId);
    const subName = sub ? sub.name : 'Subject';

    StorageManager.deleteSubject(this.deletingSubjectId);
    this.deletingSubjectId = null;
    this.closeModals();

    this.loadData();
    this.render();
    this.showToast(`Deleted ${subName}`, 'info');
  },

  /**
   * Close all active modals
   */
  closeModals() {
    const backdrops = [
      'modalBackdrop',
      'deleteModalBackdrop',
      'profileModalBackdrop',
      'resetModalBackdrop',
      'taskEditModalBackdrop'
    ];

    backdrops.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('active');
    });

    this.editingSubjectId = null;
    this.deletingSubjectId = null;
    this.editingTaskId = null;
  },

  /**
   * Handle Subject Add / Edit Form submission
   */
  handleSubjectFormSubmit(e) {
    e.preventDefault();

    const nameInput = document.getElementById('formSubjectName');
    const codeInput = document.getElementById('formSubjectCode');
    const facultyInput = document.getElementById('formFaculty');
    const totalInput = document.getElementById('formTotal');
    const attendedInput = document.getElementById('formAttended');

    const name = nameInput ? nameInput.value.trim() : '';
    const code = codeInput ? codeInput.value.trim() : '';
    const faculty = facultyInput ? facultyInput.value.trim() : '';
    const total = parseInt(totalInput ? totalInput.value : 0, 10) || 0;
    const attended = parseInt(attendedInput ? attendedInput.value : 0, 10) || 0;

    let hasErrors = false;

    // Reset errors
    ['Name', 'Total', 'Attended'].forEach(f => {
      const err = document.getElementById(`errorSubject${f}`);
      if (err) {
        err.textContent = '';
        err.classList.remove('visible');
      }
      const inp = document.getElementById(`formSubject${f === 'Name' ? 'Name' : f}`);
      if (inp) inp.classList.remove('is-invalid');
    });

    if (!name) {
      this.showFieldError('formSubjectName', 'errorSubjectName', 'Subject name is required.');
      hasErrors = true;
    }

    if (total < 0) {
      this.showFieldError('formTotal', 'errorSubjectTotal', 'Total classes cannot be negative.');
      hasErrors = true;
    }

    if (attended < 0) {
      this.showFieldError('formAttended', 'errorSubjectAttended', 'Attended classes cannot be negative.');
      hasErrors = true;
    }

    if (attended > total) {
      this.showFieldError('formAttended', 'errorSubjectAttended', 'Attended classes cannot exceed total classes conducted.');
      hasErrors = true;
    }

    if (hasErrors) return;

    if (this.editingSubjectId) {
      // Edit existing subject
      StorageManager.updateSubject(this.editingSubjectId, {
        name,
        code,
        faculty,
        total,
        attended
      });
      this.showToast(`Updated "${name}" details successfully!`, 'success');
    } else {
      // Add new subject
      StorageManager.addSubject({
        name,
        code,
        faculty,
        total,
        attended
      });
      this.showToast(`Added "${name}" to your subject tracker!`, 'success');
    }

    this.closeModals();
    this.loadData();
    this.render();
  },

  /**
   * Show non-intrusive toast notification
   */
  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(20px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  },

  /**
   * Safe string escaping helper
   */
  escapeHtml(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
};
