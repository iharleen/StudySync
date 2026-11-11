/**
 * Storage Manager for StudySync & AttendIQ
 * Handles LocalStorage persistence with realistic sample datasets.
 */

const StorageManager = {
  PROFILE_KEY: 'studysync_profile_v1',
  SUBJECTS_KEY: 'studysync_subjects_v1',
  TASKS_KEY: 'studysync_tasks_v1',

  /**
   * Default sample profile (used only if user opts to load demo dataset)
   */
  sampleProfile: {
    fullName: 'Alex Rivera',
    college: 'Metro State University',
    course: 'Computer Science & Engineering',
    semester: 'Semester 5',
    section: 'Section A',
    updatedAt: new Date().toISOString()
  },

  /**
   * Five realistic engineering subjects with realistic attendance distribution.
   */
  defaultSubjects: [
    {
      id: 'sub-cs301',
      code: 'CS301',
      name: 'Data Structures & Algorithms',
      faculty: 'Dr. Sarah Mitchell',
      attended: 34,
      missed: 6,
      total: 40,
      color: '#4f46e5', // indigo
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sub-cs302',
      code: 'CS302',
      name: 'Database Management Systems',
      faculty: 'Prof. Robert Jenkins',
      attended: 28,
      missed: 10,
      total: 38,
      color: '#0284c7', // sky
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sub-cs303',
      code: 'CS303',
      name: 'Computer Networks',
      faculty: 'Dr. Elena Rostova',
      attended: 22,
      missed: 10,
      total: 32,
      color: '#e11d48', // rose
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sub-cs304',
      code: 'CS304',
      name: 'Operating Systems',
      faculty: 'Prof. Marcus Chen',
      attended: 32,
      missed: 4,
      total: 36,
      color: '#059669', // emerald
      updatedAt: new Date().toISOString()
    },
    {
      id: 'sub-cs305',
      code: 'CS305',
      name: 'Software Engineering',
      faculty: 'Dr. Ananya Sharma',
      attended: 24,
      missed: 6,
      total: 30,
      color: '#7c3aed', // violet
      updatedAt: new Date().toISOString()
    }
  ],

  defaultTasks: [
    { id: 'task-1', title: 'Complete DSA Tree Traversal Assignment', subject: 'Data Structures & Algorithms', due: 'Tomorrow', completed: false },
    { id: 'task-2', title: 'Review DBMS Normalization 3NF & BCNF', subject: 'Database Management Systems', due: 'In 2 days', completed: true },
    { id: 'task-3', title: 'Lab Record preparation: TCP/UDP simulation', subject: 'Computer Networks', due: 'Friday', completed: false }
  ],

  /**
   * Retrieve student profile from LocalStorage.
   * @returns {Object|null}
   */
  getProfile() {
    try {
      const data = localStorage.getItem(this.PROFILE_KEY);
      if (!data) return null;
      const parsed = JSON.parse(data);
      if (parsed && typeof parsed === 'object' && parsed.fullName) {
        return parsed;
      }
      return null;
    } catch (e) {
      console.error('Failed reading student profile from LocalStorage:', e);
      return null;
    }
  },

  /**
   * Save student profile to LocalStorage.
   * @param {Object} profile
   * @returns {Object}
   */
  saveProfile(profile) {
    try {
      const sanitized = {
        fullName: (profile.fullName || '').trim(),
        college: (profile.college || '').trim(),
        course: (profile.course || '').trim(),
        semester: (profile.semester || '').trim(),
        section: (profile.section || '').trim(),
        updatedAt: new Date().toISOString()
      };
      localStorage.setItem(this.PROFILE_KEY, JSON.stringify(sanitized));
      return sanitized;
    } catch (e) {
      console.error('Failed saving student profile to LocalStorage:', e);
      return profile;
    }
  },

  /**
   * Check whether student has already completed onboarding.
   * @returns {boolean}
   */
  hasProfile() {
    return Boolean(this.getProfile());
  },

  /**
   * Remove student profile from LocalStorage.
   */
  clearProfile() {
    try {
      localStorage.removeItem(this.PROFILE_KEY);
    } catch (e) {
      console.error('Failed clearing profile from LocalStorage:', e);
    }
  },

  /**
   * Retrieve all subjects from LocalStorage.
   * Returns saved subjects, or an empty array if none have been created yet.
   * Sample subjects are loaded only when explicitly requested by the user.
   * @returns {Array} List of subjects
   */
  getSubjects() {
    try {
      const data = localStorage.getItem(this.SUBJECTS_KEY);
      if (data !== null) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      console.error('Failed reading subjects from LocalStorage:', e);
      return [];
    }
  },

  /**
   * Save subjects array to LocalStorage.
   * @param {Array} subjects
   */
  saveSubjects(subjects) {
    try {
      localStorage.setItem(this.SUBJECTS_KEY, JSON.stringify(subjects || []));
    } catch (e) {
      console.error('Failed saving subjects to LocalStorage:', e);
    }
  },

  /**
   * Add a new subject.
   * Supports both total classes conducted + attended, and attended + missed.
   * @param {Object} data
   * @returns {Object} Newly created subject
   */
  addSubject(data) {
    const subjects = this.getSubjects();

    let total = 0;
    let attended = 0;
    let missed = 0;

    if (data.total !== undefined) {
      total = Math.max(0, parseInt(data.total, 10) || 0);
      attended = Math.max(0, parseInt(data.attended, 10) || 0);
      if (attended > total) attended = total;
      missed = Math.max(0, total - attended);
    } else {
      attended = Math.max(0, parseInt(data.attended, 10) || 0);
      missed = Math.max(0, parseInt(data.missed, 10) || 0);
      total = attended + missed;
    }

    const newSubject = {
      id: 'sub-' + Date.now(),
      code: (data.code || '').trim().toUpperCase(),
      name: (data.name || '').trim(),
      faculty: (data.faculty || '').trim(),
      attended: attended,
      missed: missed,
      total: total,
      color: data.color || '#4f46e5',
      updatedAt: new Date().toISOString()
    };

    subjects.push(newSubject);
    this.saveSubjects(subjects);
    return newSubject;
  },

  /**
   * Update an existing subject by ID.
   * @param {string} id
   * @param {Object} updatedFields
   * @returns {Object|null}
   */
  updateSubject(id, updatedFields) {
    const subjects = this.getSubjects();
    const index = subjects.findIndex(s => s.id === id);
    if (index === -1) return null;

    const current = subjects[index];
    let total = current.total;
    let attended = current.attended;
    let missed = current.missed;

    if (updatedFields.total !== undefined) {
      total = Math.max(0, parseInt(updatedFields.total, 10) || 0);
      attended = updatedFields.attended !== undefined
        ? Math.max(0, parseInt(updatedFields.attended, 10) || 0)
        : current.attended;
      if (attended > total) attended = total;
      missed = Math.max(0, total - attended);
    } else {
      attended = updatedFields.attended !== undefined
        ? Math.max(0, parseInt(updatedFields.attended, 10) || 0)
        : current.attended;
      missed = updatedFields.missed !== undefined
        ? Math.max(0, parseInt(updatedFields.missed, 10) || 0)
        : current.missed;
      total = attended + missed;
    }

    subjects[index] = {
      ...current,
      ...updatedFields,
      code: updatedFields.code !== undefined ? updatedFields.code.trim().toUpperCase() : current.code,
      name: updatedFields.name !== undefined ? updatedFields.name.trim() : current.name,
      faculty: updatedFields.faculty !== undefined ? updatedFields.faculty.trim() : current.faculty,
      attended,
      missed,
      total,
      updatedAt: new Date().toISOString()
    };

    this.saveSubjects(subjects);
    return subjects[index];
  },

  /**
   * Delete a subject by ID.
   * @param {string} id
   * @returns {boolean}
   */
  deleteSubject(id) {
    const subjects = this.getSubjects();
    const filtered = subjects.filter(s => s.id !== id);
    if (filtered.length !== subjects.length) {
      this.saveSubjects(filtered);
      return true;
    }
    return false;
  },

  /**
   * Quick mark attendance: increment present or absent.
   * @param {string} id
   * @param {'present' | 'absent'} status
   * @returns {Object|null}
   */
  markAttendance(id, status) {
    const subjects = this.getSubjects();
    const subject = subjects.find(s => s.id === id);
    if (!subject) return null;

    if (status === 'present') {
      subject.attended = (subject.attended || 0) + 1;
    } else if (status === 'absent') {
      subject.missed = (subject.missed || 0) + 1;
    }
    subject.total = (subject.attended || 0) + (subject.missed || 0);
    subject.updatedAt = new Date().toISOString();

    this.saveSubjects(subjects);
    return subject;
  },

  /**
   * Reset all data back to original default sample data.
   */
  resetToDefaults() {
    this.saveProfile(this.sampleProfile);
    this.saveSubjects(this.defaultSubjects);
    this.saveTasks(this.defaultTasks);
    return [...this.defaultSubjects];
  },

  /**
   * Reset application data.
   * If loadSample is true, restores the demo profile and sample engineering subjects.
   * If loadSample is false, clears all stored keys so student onboarding starts fresh.
   * @param {{ loadSample?: boolean }} options
   * @returns {{ profile: Object|null, subjects: Array, tasks: Array }}
   */
  resetApplicationData(options = { loadSample: false }) {
    if (options && options.loadSample) {
      const profile = this.saveProfile(this.sampleProfile);
      this.saveSubjects(this.defaultSubjects);
      this.saveTasks(this.defaultTasks);
      return {
        profile,
        subjects: [...this.defaultSubjects],
        tasks: [...this.defaultTasks]
      };
    } else {
      this.clearProfile();
      localStorage.removeItem(this.SUBJECTS_KEY);
      localStorage.removeItem(this.TASKS_KEY);
      return {
        profile: null,
        subjects: [],
        tasks: []
      };
    }
  },

  /**
   * StudySync Tasks helpers
   */
  getTasks() {
    try {
      const data = localStorage.getItem(this.TASKS_KEY);
      if (data !== null) {
        const parsed = JSON.parse(data);
        return Array.isArray(parsed) ? parsed : [];
      }
      return [];
    } catch (e) {
      return [];
    }
  },

  saveTasks(tasks) {
    try {
      localStorage.setItem(this.TASKS_KEY, JSON.stringify(tasks || []));
    } catch (e) {
      console.error('Failed saving tasks:', e);
    }
  },

  toggleTask(taskId) {
    const tasks = this.getTasks();
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.saveTasks(tasks);
    }
    return tasks;
  },

  addTask(title, subject, due) {
    const tasks = this.getTasks();
    const newTask = {
      id: 'task-' + Date.now(),
      title: (title || '').trim(),
      subject: (subject || 'General').trim(),
      due: (due || 'This Week').trim(),
      completed: false,
      createdAt: new Date().toISOString()
    };
    tasks.unshift(newTask);
    this.saveTasks(tasks);
    return newTask;
  },

  updateTask(taskId, updatedFields) {
    const tasks = this.getTasks();
    const index = tasks.findIndex(t => t.id === taskId);
    if (index === -1) return null;

    tasks[index] = {
      ...tasks[index],
      ...updatedFields,
      title: updatedFields.title !== undefined ? updatedFields.title.trim() : tasks[index].title,
      subject: updatedFields.subject !== undefined ? updatedFields.subject.trim() : tasks[index].subject,
      due: updatedFields.due !== undefined ? updatedFields.due.trim() : tasks[index].due,
      updatedAt: new Date().toISOString()
    };

    this.saveTasks(tasks);
    return tasks[index];
  },

  deleteTask(taskId) {
    const tasks = this.getTasks();
    const filtered = tasks.filter(t => t.id !== taskId);
    if (filtered.length !== tasks.length) {
      this.saveTasks(filtered);
      return true;
    }
    return false;
  }
};

// Export for module or browser environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = StorageManager;
}
