// แอปพลิเคชันหลักระบบการเรียนรู้อิเล็กทรอนิกส์กำลัง (20105-2013)
// จัดการสถานะ ระบบลงทะเบียนผู้เรียน คะแนนเก็บ ตัวแก้ไขเนื้อหา รูปภาพ วิดีโอ และการสำรองข้อมูล

const App = {
  USERS_STORAGE_KEY: "power_elec_users_db_v2",
  CURRENT_USER_ID_KEY: "power_elec_current_user_id_v2",
  CUSTOM_UNITS_KEY: "power_elec_custom_units_v2",

  state: {
    currentView: "overview", // 'overview' | 'unit' | 'gradebook' | 'all-quizzes' | 'simulators' | 'formulas'
    activeUnitId: 1,
    currentUser: null,
    users: [],
    units: [], // Dynamic units merged with custom user edits
    soundEnabled: true,
    searchTerm: "",
    // Synced with currentUser
    userAnswers: {},
    submittedQuizzes: {},
    quizScores: {},
    studentName: ""
  },

  // ข้อมูลนักศึกษาตัวอย่างเริ่มต้น
  DEFAULT_USER: {
    id: "std_6620105001",
    studentId: "6620105001",
    name: "นายสมชาย นักประดิษฐ์",
    department: "สาขาวิชาช่างอิเล็กทรอนิกส์",
    classGroup: "ปวช. 2 กลุ่ม 1",
    pin: "1234",
    email: "somchai.elec@technic.ac.th",
    phone: "081-234-5678",
    bio: "นักศึกษาระดับ ปวช. สาขาวิชาช่างอิเล็กทรอนิกส์ มุ่งมั่นศึกษาเทคโนโลยีระบบแปลงผันกำลังงานไฟฟ้า",
    registeredAt: "1 พ.ย. 2569 08:30 น.",
    lastLogin: "3 พ.ย. 2569 09:15 น.",
    loginCount: 3,
    quizScores: {},
    quizAttempts: {},
    submittedQuizzes: {},
    userAnswers: {},
    quizHistory: [],
    activityLog: [
      {
        type: "system",
        title: "ลงทะเบียนเข้าสู่ระบบสำเร็จ",
        timestamp: "1 พ.ย. 2569 08:30 น.",
        details: "เริ่มต้นใช้งานระบบการเรียนรู้อิเล็กทรอนิกส์กำลัง (20105-2013)"
      },
      {
        type: "login",
        title: "เข้าสู่ระบบ",
        timestamp: "3 พ.ย. 2569 09:15 น.",
        details: "เข้าสู่ระบบผ่านคอมพิวเตอร์ประจำแผนก"
      }
    ]
  },

  init() {
    this.loadUnits();
    this.loadUsersAndSession();
    this.bindEvents();
    this.renderUserHeader();
    this.renderSidebarStudentCard();
    this.renderSidebar();
    this.renderCurrentView();
    this.updateGlobalProgress();

    // เริ่มต้นตัวจำลองเสมือนจริง
    setTimeout(() => {
      if (window.Simulators) {
        Simulators.initScrSimulator();
        Simulators.initDcDcSimulator();
        Simulators.initDimmerSimulator();
      }
      this.renderMath();
    }, 100);
  },

  // โหลดและรวมข้อมูลเนื้อหาบทเรียน (รวมทั้งส่วนที่ผู้ใช้แก้ไขบันทึกไว้)
  loadUnits() {
    // โคลนเนื้อหาเริ่มต้น
    const baseUnits = JSON.parse(JSON.stringify(UNITS_DATA));

    // ตัวอย่างวิดีโอแนะนำประจำแต่ละหน่วย (สามารถแก้ไขหรือใส่ลิงก์ YouTube ได้เอง)
    const defaultVideos = {
      1: "https://www.youtube.com/watch?v=gTshR8z_Wss", // วงจรเรียงกระแส Diode Rectifier
      2: "https://www.youtube.com/watch?v=FqGg2_8v19o", // SCR Controlled Rectifier
      3: "https://www.youtube.com/watch?v=aGZ8s3_qU1k", // AC Voltage Controller TRIAC
      4: "https://www.youtube.com/watch?v=1K53N0q1y_c", // SMPS vs Linear Power Supply
      5: "https://www.youtube.com/watch?v=L2GjH-0qW7A", // Voltage Multiplier Doubler
      6: "https://www.youtube.com/watch?v=q1x0X5J-9yQ", // Inverter H-Bridge & Pure Sine
      7: "https://www.youtube.com/watch?v=ftk308QxZ4E", // DC-DC Buck Boost Converter
      8: "https://www.youtube.com/watch?v=k5q90y_Z09s", // Solid State Relay SSR
      9: "https://www.youtube.com/watch?v=Gj8xY0_T11w", // Filter Circuits C & LC
      10: "https://www.youtube.com/watch?v=p1K82_Y0u_8" // Light Dimmer Phase Control
    };

    baseUnits.forEach((u) => {
      if (!u.videoUrl && defaultVideos[u.id]) {
        u.videoUrl = defaultVideos[u.id];
      }
    });

    try {
      const savedCustom = localStorage.getItem(this.CUSTOM_UNITS_KEY);
      if (savedCustom) {
        const customMap = JSON.parse(savedCustom);
        baseUnits.forEach((u) => {
          if (customMap[u.id]) {
            Object.assign(u, customMap[u.id]);
          }
        });
      }
    } catch (e) {
      console.warn("Could not load custom units:", e);
    }

    this.state.units = baseUnits;
  },

  getUnits() {
    return this.state.units && this.state.units.length > 0 ? this.state.units : UNITS_DATA;
  },

  getUnitById(id) {
    const list = this.getUnits();
    return list.find((u) => u.id === parseInt(id, 10)) || list[0];
  },

  // บันทึกการแก้ไขเนื้อหา รูปภาพ วิดีโอ ของหน่วยการเรียน
  saveUnitCustomData(unitId, data) {
    unitId = parseInt(unitId, 10);
    let customMap = {};
    try {
      const saved = localStorage.getItem(this.CUSTOM_UNITS_KEY);
      if (saved) customMap = JSON.parse(saved);
    } catch (e) {}

    customMap[unitId] = data;
    try {
      localStorage.setItem(this.CUSTOM_UNITS_KEY, JSON.stringify(customMap));
    } catch (e) {
      console.warn("Could not save custom unit to localStorage:", e);
    }

    // อัปเดตใน state ทันที
    const idx = this.state.units.findIndex((u) => u.id === unitId);
    if (idx !== -1) {
      Object.assign(this.state.units[idx], data);
    }

    this.renderSidebar();
    this.renderCurrentView();
    this.closeUnitEditor();

    if (this.state.soundEnabled) this.playSuccessFanfare();
    alert(`บันทึกการแก้ไขเนื้อหาและสื่อของหน่วยที่ ${unitId} เรียบร้อยแล้ว!`);
  },

  // คืนค่าเนื้อหาหน่วยนั้นกลับสู่ค่าเริ่มต้น
  resetUnitToDefault(unitId) {
    unitId = parseInt(unitId, 10);
    if (!confirm(`ท่านต้องการคืนค่าเนื้อหาเริ่มต้นของหน่วยที่ ${unitId} หรือไม่? (ข้อมูลที่เคยแก้ไขจะถูกลบ)`)) return;

    let customMap = {};
    try {
      const saved = localStorage.getItem(this.CUSTOM_UNITS_KEY);
      if (saved) customMap = JSON.parse(saved);
    } catch (e) {}

    delete customMap[unitId];
    localStorage.setItem(this.CUSTOM_UNITS_KEY, JSON.stringify(customMap));

    // โหลดใหม่
    this.loadUnits();
    this.renderSidebar();
    this.renderCurrentView();
    this.closeUnitEditor();
    alert(`คืนค่าเนื้อหาเริ่มต้นของหน่วยที่ ${unitId} สำเร็จ`);
  },

  // จัดการผู้ใช้งานและเซสชัน (Users & Session)
  loadUsersAndSession() {
    try {
      const usersData = localStorage.getItem(this.USERS_STORAGE_KEY);
      if (usersData) {
        this.state.users = JSON.parse(usersData);
      } else {
        this.state.users = [JSON.parse(JSON.stringify(this.DEFAULT_USER))];
        this.saveUsers();
      }

      const currentId = localStorage.getItem(this.CURRENT_USER_ID_KEY);
      let foundUser = this.state.users.find(u => u.id === currentId);
      if (!foundUser && this.state.users.length > 0) {
        foundUser = this.state.users[0];
      }

      this.setCurrentUser(foundUser || JSON.parse(JSON.stringify(this.DEFAULT_USER)));
    } catch (e) {
      console.warn("Could not load users:", e);
      this.setCurrentUser(JSON.parse(JSON.stringify(this.DEFAULT_USER)));
    }
  },

  saveUsers() {
    try {
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(this.state.users));
    } catch (e) {
      console.warn("Could not save users:", e);
    }
  },

  setCurrentUser(user) {
    this.state.currentUser = user;
    localStorage.setItem(this.CURRENT_USER_ID_KEY, user.id);

    // Sync state fields
    this.state.studentName = user.name || "นักศึกษา";
    this.state.quizScores = user.quizScores || {};
    this.state.submittedQuizzes = user.submittedQuizzes || {};
    this.state.userAnswers = user.userAnswers || {};

    const idx = this.state.users.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      this.state.users[idx] = user;
    } else {
      this.state.users.push(user);
    }
    this.saveUsers();
  },

  getTimestampString() {
    const d = new Date();
    return d.toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }) + " น.";
  },

  // ลงทะเบียนผู้เรียนใหม่
  registerNewUser(formData) {
    const studentId = formData.studentId.trim();
    const name = formData.name.trim();
    const department = formData.department.trim();
    const classGroup = formData.classGroup.trim();
    const pin = formData.pin.trim() || "1234";

    if (!studentId || !name) {
      alert("กรุณากรอกรหัสนักศึกษาและชื่อ-นามสกุลให้ครบถ้วน");
      return false;
    }

    const existing = this.state.users.find(u => u.studentId === studentId);
    if (existing) {
      alert(`รหัสนักศึกษา ${studentId} ได้ลงทะเบียนไว้แล้ว ท่านสามารถเลือกเข้าสู่ระบบได้ทันที`);
      return false;
    }

    const nowStr = this.getTimestampString();
    const newUser = {
      id: "std_" + Date.now(),
      studentId: studentId,
      name: name,
      department: department || "สาขาวิชาช่างอิเล็กทรอนิกส์",
      classGroup: classGroup || "ปวช. 2",
      pin: pin,
      email: "",
      phone: "",
      bio: "นักศึกษารายวิชาอิเล็กทรอนิกส์กำลัง",
      registeredAt: nowStr,
      lastLogin: nowStr,
      loginCount: 1,
      quizScores: {},
      quizAttempts: {},
      submittedQuizzes: {},
      userAnswers: {},
      quizHistory: [],
      activityLog: [
        {
          type: "system",
          title: "ลงทะเบียนผู้เรียนใหม่สำเร็จ",
          timestamp: nowStr,
          details: `รหัส: ${studentId} แผนก: ${department || "ช่างอิเล็กทรอนิกส์"}`
        },
        {
          type: "login",
          title: "เข้าสู่ระบบ",
          timestamp: nowStr,
          details: "เข้าใช้งานระบบครั้งแรกหลังลงทะเบียน"
        }
      ]
    };

    this.setCurrentUser(newUser);
    this.renderUserHeader();
    this.renderSidebarStudentCard();
    this.renderSidebar();
    this.updateGlobalProgress();
    this.closeAuthModal();

    if (this.state.soundEnabled) this.playSuccessFanfare();
    alert(`ลงทะเบียนสำเร็จ ยินดีต้อนรับคุณ ${name} เข้าสู่บทเรียนอิเล็กทรอนิกส์กำลัง`);
    this.navigateToView("gradebook");
    return true;
  },

  // เข้าสู่ระบบ
  loginUser(studentId, pin) {
    const user = this.state.users.find(u => u.studentId === studentId.trim());
    if (!user) {
      alert("ไม่พบข้อมูลรหัสนักศึกษานี้ในระบบ กรุณาตรวจสอบหรือลงทะเบียนใหม่");
      return false;
    }

    if (user.pin && pin && user.pin !== pin.trim()) {
      alert("รหัสผ่าน / PIN ไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
      return false;
    }

    const nowStr = this.getTimestampString();
    user.lastLogin = nowStr;
    user.loginCount = (user.loginCount || 1) + 1;
    if (!user.activityLog) user.activityLog = [];
    user.activityLog.unshift({
      type: "login",
      title: "เข้าสู่ระบบ",
      timestamp: nowStr,
      details: `เข้าใช้งานครั้งที่ ${user.loginCount}`
    });

    this.setCurrentUser(user);
    this.renderUserHeader();
    this.renderSidebarStudentCard();
    this.renderSidebar();
    this.updateGlobalProgress();
    this.closeAuthModal();

    if (this.state.soundEnabled) this.playSimpleCompleteSound();
    this.renderCurrentView();
    return true;
  },

  // สลับผู้ใช้งานด่วน
  switchUser(userId) {
    const user = this.state.users.find(u => u.id === userId);
    if (user) {
      const nowStr = this.getTimestampString();
      user.lastLogin = nowStr;
      user.loginCount = (user.loginCount || 1) + 1;
      if (!user.activityLog) user.activityLog = [];
      user.activityLog.unshift({
        type: "login",
        title: "สลับบัญชีเข้าสู่ระบบ",
        timestamp: nowStr,
        details: "เข้าใช้งานในเซสชันใหม่"
      });

      this.setCurrentUser(user);
      this.renderUserHeader();
      this.renderSidebarStudentCard();
      this.renderSidebar();
      this.updateGlobalProgress();
      this.closeAuthModal();
      this.renderCurrentView();
    }
  },

  // อัปเดตข้อมูลโปรไฟล์ผู้ใช้งาน
  saveUserProfile(data) {
    const u = this.state.currentUser;
    if (!u) return;

    u.name = data.name.trim() || u.name;
    u.studentId = data.studentId.trim() || u.studentId;
    u.department = data.department.trim() || u.department;
    u.classGroup = data.classGroup.trim() || u.classGroup;
    u.email = (data.email || "").trim();
    u.phone = (data.phone || "").trim();
    u.bio = (data.bio || "").trim();
    if (data.pin && data.pin.trim()) u.pin = data.pin.trim();

    if (!u.activityLog) u.activityLog = [];
    u.activityLog.unshift({
      type: "system",
      title: "อัปเดตข้อมูลโปรไฟล์",
      timestamp: this.getTimestampString(),
      details: "แก้ไขข้อมูลส่วนตัวและข้อมูลติดต่อในระบบ"
    });

    this.setCurrentUser(u);
    this.renderUserHeader();
    this.renderSidebarStudentCard();
    this.closeProfileEditor();

    if (this.state.soundEnabled) this.playSuccessFanfare();
    alert("บันทึกการอัปเดตข้อมูลโปรไฟล์เรียบร้อยแล้ว!");
    this.renderCurrentView();
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById("search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        this.state.searchTerm = e.target.value.trim().toLowerCase();
        this.handleSearch();
      });
    }

    // Sound toggle
    const soundToggle = document.getElementById("sound-toggle-btn");
    if (soundToggle) {
      soundToggle.addEventListener("click", () => {
        this.state.soundEnabled = !this.state.soundEnabled;
        soundToggle.innerHTML = this.state.soundEnabled
          ? `<i data-lucide="volume-2" class="w-4 h-4 text-emerald-400"></i><span class="text-xs text-slate-300 hidden md:inline">เสียง: เปิด</span>`
          : `<i data-lucide="volume-x" class="w-4 h-4 text-slate-500"></i><span class="text-xs text-slate-400 hidden md:inline">เสียง: ปิด</span>`;
        if (window.lucide) lucide.createIcons();
      });
    }

    // Mobile menu drawer
    const menuBtn = document.getElementById("mobile-menu-btn");
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("mobile-overlay");
    if (menuBtn && sidebar && overlay) {
      menuBtn.addEventListener("click", () => {
        sidebar.classList.toggle("-translate-x-full");
        overlay.classList.toggle("hidden");
      });
      overlay.addEventListener("click", () => {
        sidebar.classList.add("-translate-x-full");
        overlay.classList.add("hidden");
      });
    }
  },

  // แสดง Profile Widget บน Header
  renderUserHeader() {
    const container = document.getElementById("header-user-widget");
    if (!container) return;

    const u = this.state.currentUser;
    if (!u) return;

    container.innerHTML = `
      <div class="flex items-center gap-1 sm:gap-2">
        <button onclick="App.navigateToView('gradebook')" class="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-750 border border-slate-700/80 transition group">
          <div class="w-6 h-6 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold text-xs shrink-0 shadow-sm">
            ${u.name.charAt(0) || 'น'}
          </div>
          <div class="text-left hidden lg:block">
            <div class="text-xs font-bold text-white group-hover:text-sky-300 transition truncate max-w-[130px]">${u.name}</div>
            <div class="text-[10px] text-slate-400 font-mono">${u.studentId}</div>
          </div>
        </button>
        <button onclick="App.openProfileEditor()" title="แก้ไขข้อมูลโปรไฟล์" class="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-amber-300 border border-slate-800 transition">
          <i data-lucide="user-cog" class="w-4 h-4"></i>
        </button>
        <button onclick="App.openAuthModal()" title="ลงทะเบียน / สลับผู้ใช้งาน" class="p-1.5 rounded-xl bg-slate-800/60 hover:bg-slate-700 text-slate-400 hover:text-sky-300 border border-slate-800 transition">
          <i data-lucide="user-check" class="w-4 h-4"></i>
        </button>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  // แสดงการ์ดนักศึกษาที่ Sidebar
  renderSidebarStudentCard() {
    const card = document.getElementById("sidebar-student-card");
    if (!card) return;

    const u = this.state.currentUser;
    if (!u) return;

    let totalScore = 0;
    Object.values(u.quizScores || {}).forEach(s => totalScore += s);

    card.innerHTML = `
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-bold text-base shadow-md shrink-0">
          ${u.name.charAt(0) || 'น'}
        </div>
        <div class="min-w-0 flex-1">
          <div class="text-xs font-bold text-white truncate">${u.name}</div>
          <div class="text-[10px] text-sky-400 font-mono">${u.studentId} • ${u.classGroup || 'ปวช.'}</div>
          <div class="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            <span>คะแนนเก็บ: <strong class="text-amber-300">${totalScore}/100</strong></span>
          </div>
        </div>
      </div>
      <div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 hover:text-amber-300">
        <span class="flex items-center gap-1 font-medium"><i data-lucide="bar-chart-2" class="w-3.5 h-3.5 text-amber-400"></i> ดูสมุดคะแนนเก็บ</span>
        <i data-lucide="chevron-right" class="w-3.5 h-3.5"></i>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  renderSidebar() {
    const list = document.getElementById("sidebar-units-list");
    if (!list) return;

    const units = this.getUnits();
    list.innerHTML = units.map((u) => {
      const isDone = this.state.submittedQuizzes[u.id];
      const score = this.state.quizScores[u.id] || 0;
      const isActive = this.state.currentView === "unit" && this.state.activeUnitId === u.id;

      let badgeHtml = "";
      if (isDone) {
        badgeHtml = `<span class="px-1.5 py-0.5 rounded text-[10px] font-bold ${
          score >= 8 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
        }">${score}/10</span>`;
      }

      return `
        <li>
          <button onclick="App.navigateToUnit(${u.id})" class="w-full text-left px-3 py-2.5 rounded-xl transition flex items-center justify-between text-xs font-medium ${
            isActive
              ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40 shadow-sm'
              : 'text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
          }">
            <div class="flex items-center gap-2.5 truncate">
              <span class="w-6 h-6 rounded-lg flex items-center justify-center text-[11px] font-bold shrink-0 ${
                isActive ? 'bg-sky-500 text-white' : 'bg-slate-800 text-slate-400'
              }">${u.id}</span>
              <span class="truncate">${u.title}</span>
            </div>
            ${badgeHtml}
          </button>
        </li>
      `;
    }).join("");

    if (window.lucide) lucide.createIcons();
  },

  navigateToUnit(unitId) {
    this.state.currentView = "unit";
    this.state.activeUnitId = parseInt(unitId, 10);
    this.closeMobileSidebar();
    this.renderSidebar();
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  navigateToView(viewName) {
    this.state.currentView = viewName;
    this.closeMobileSidebar();
    this.renderSidebar();
    this.renderCurrentView();
    window.scrollTo({ top: 0, behavior: "smooth" });
  },

  closeMobileSidebar() {
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("mobile-overlay");
    if (sidebar && overlay) {
      sidebar.classList.add("-translate-x-full");
      overlay.classList.add("hidden");
    }
  },

  renderCurrentView() {
    const main = document.getElementById("main-content-area");
    if (!main) return;

    if (this.state.currentView === "overview") {
      this.renderOverview(main);
    } else if (this.state.currentView === "unit") {
      this.renderUnitDetail(main, this.state.activeUnitId);
    } else if (this.state.currentView === "gradebook") {
      this.renderGradebook(main);
    } else if (this.state.currentView === "all-quizzes") {
      this.renderAllQuizzesView(main);
    } else if (this.state.currentView === "simulators") {
      this.renderSimulatorsView(main);
    } else if (this.state.currentView === "formulas") {
      this.renderFormulasView(main);
    }

    if (window.lucide) lucide.createIcons();
    this.renderMath();
  },

  // 1. หน้าสรุปภาพรวมรายวิชา
  renderOverview(container) {
    const totalDone = Object.keys(this.state.submittedQuizzes).length;
    let totalScore = 0;
    Object.values(this.state.quizScores).forEach(s => totalScore += s);
    const u = this.state.currentUser;
    const units = this.getUnits();

    container.innerHTML = `
      <div class="space-y-8 animate-fadeIn">
        <!-- Hero Banner -->
        <div class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-sky-950/60 to-slate-900 border border-sky-800/40 p-6 md:p-10 shadow-2xl">
          <div class="absolute -right-10 -bottom-10 w-72 h-72 bg-sky-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div class="relative z-10 max-w-3xl">
            <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-xs font-semibold mb-4">
              <i data-lucide="book-open" class="w-3.5 h-3.5"></i>
              รหัสวิชา 20105-2013 | หลักสูตร ปวช. สาขาวิชาช่างอิเล็กทรอนิกส์และไฟฟ้ากำลัง
            </div>
            <h1 class="text-3xl md:text-5xl font-extrabold text-white tracking-tight mb-4 leading-tight">
              อิเล็กทรอนิกส์กำลัง <span class="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-cyan-300">(Power Electronics)</span>
            </h1>
            <p class="text-slate-300 text-sm md:text-base leading-relaxed mb-6">
              ยินดีต้อนรับ <strong>${u ? u.name : 'ผู้เรียน'}</strong> สู่ระบบการเรียนรู้ดิจิทัลแบบครบวงจร ครอบคลุมทั้ง 10 หน่วยการเรียนรู้ พร้อมระบบแก้ไขเนื้อหา รูปภาพ วิดีโอ บันทึกคะแนนเก็บ และใบประกาศนียบัตร
            </p>
            <div class="flex flex-wrap gap-3">
              <button onclick="App.navigateToUnit(1)" class="px-5 py-3 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-sm shadow-lg shadow-sky-500/25 flex items-center gap-2 transition transform active:scale-95">
                <i data-lucide="play" class="w-4 h-4 fill-slate-950"></i> เริ่มเรียนหน่วยที่ 1
              </button>
              <button onclick="App.navigateToView('gradebook')" class="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 flex items-center gap-2 transition">
                <i data-lucide="bar-chart-2" class="w-4 h-4"></i> ดูคะแนนเก็บ & ผลการเรียน
              </button>
              <button onclick="App.openBackupModal()" class="px-5 py-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-purple-300 font-semibold text-sm border border-slate-700 flex items-center gap-2 transition">
                <i data-lucide="database" class="w-4 h-4 text-purple-400"></i> อัปเดต/สำรองข้อมูล
              </button>
            </div>
          </div>
        </div>

        <!-- Quick Stats Grid -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400 shrink-0">
              <i data-lucide="layers" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xs text-slate-400">เนื้อหาบทเรียน</div>
              <div class="text-lg font-bold text-white">10 หน่วยการเรียน</div>
            </div>
          </div>
          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <i data-lucide="clipboard-check" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xs text-slate-400">ข้อสอบและแบบฝึกหัด</div>
              <div class="text-lg font-bold text-white">100 ข้อ (หน่วยละ 10)</div>
            </div>
          </div>
          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400 shrink-0">
              <i data-lucide="award" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xs text-slate-400">ทำแบบฝึกหัดแล้ว</div>
              <div class="text-lg font-bold text-amber-400">${totalDone} / 10 หน่วย</div>
            </div>
          </div>
          <div class="p-4 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center gap-3">
            <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
              <i data-lucide="percent" class="w-5 h-5"></i>
            </div>
            <div>
              <div class="text-xs text-slate-400">คะแนนเก็บสะสม</div>
              <div class="text-lg font-bold text-purple-300">${totalScore} / 100 คะแนน</div>
            </div>
          </div>
        </div>

        <!-- 10 Units Grid -->
        <div>
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-bold text-white flex items-center gap-2">
              <i data-lucide="book" class="w-5 h-5 text-sky-400"></i>
              รายชื่อหน่วยการเรียนรู้ (10 หน่วย)
            </h2>
            <span class="text-xs text-slate-400">คลิกที่หน่วยเพื่อเข้าสู่บทเรียน สื่อวิดีโอ และแบบฝึกหัด</span>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${units.map((u) => {
              const done = this.state.submittedQuizzes[u.id];
              const score = this.state.quizScores[u.id] || 0;
              return `
                <div class="group p-5 bg-slate-900/70 hover:bg-slate-850 border border-slate-800 hover:border-sky-500/40 rounded-2xl transition duration-200 shadow-sm flex flex-col justify-between">
                  <div>
                    <div class="flex items-center justify-between mb-3">
                      <div class="flex items-center gap-2">
                        <span class="px-2.5 py-1 rounded-lg bg-sky-950/80 text-sky-300 text-xs font-bold border border-sky-800/40">
                          ${u.badge}
                        </span>
                        ${u.videoUrl ? `
                          <span class="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 border border-rose-500/30 text-[10px] flex items-center gap-1">
                            <i data-lucide="play" class="w-2.5 h-2.5 fill-rose-400"></i> มีวิดีโอ
                          </span>
                        ` : ''}
                      </div>
                      ${done ? `
                        <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${score >= 8 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}">
                          คะแนน: ${score}/10
                        </span>
                      ` : `
                        <span class="text-xs text-slate-500 flex items-center gap-1">
                          <i data-lucide="circle" class="w-3 h-3"></i> ยังไม่ทำแบบฝึกหัด
                        </span>
                      `}
                    </div>
                    <h3 onclick="App.navigateToUnit(${u.id})" class="text-base font-bold text-white group-hover:text-sky-300 transition mb-1 cursor-pointer">
                      ${u.title}
                    </h3>
                    <div class="text-xs text-slate-400 italic mb-2">${u.enTitle}</div>
                    <p class="text-xs text-slate-400 line-clamp-2 leading-relaxed">
                      ${u.summary}
                    </p>
                  </div>
                  <div class="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-medium">
                    <button onclick="App.navigateToUnit(${u.id})" class="text-sky-400 group-hover:text-sky-300 flex items-center gap-1">
                      <span>เข้าสู่บทเรียน</span>
                      <i data-lucide="arrow-right" class="w-3.5 h-3.5"></i>
                    </button>
                    <button onclick="App.openUnitEditor(${u.id})" class="text-slate-400 hover:text-amber-300 flex items-center gap-1 text-[11px] px-2 py-1 rounded-lg hover:bg-slate-800">
                      <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> แก้ไขเนื้อหา/วิดีโอ
                    </button>
                  </div>
                </div>
              `;
            }).join("")}
          </div>
        </div>
      </div>
    `;
  },

  // แปลง YouTube URL เป็น Embed Iframe URL
  parseVideoEmbed(url) {
    if (!url) return null;
    url = url.trim();

    // YouTube formats
    const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
    if (ytMatch && ytMatch[1]) {
      return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0&modestbranding=1`;
    }

    // Direct MP4 or other video
    if (url.endsWith(".mp4") || url.endsWith(".webm")) {
      return url;
    }

    return url;
  },

  // 2. หน้ารายละเอียดหน่วยการเรียนรู้เดี่ยว (บทเรียน + วิดีโอ + สูตร + แบบฝึกหัด 10 ข้อ)
  renderUnitDetail(container, unitId) {
    const unit = this.getUnitById(unitId);
    if (!unit) return;

    const quiz = QUIZ_DATA[unitId];
    const isSubmitted = !!this.state.submittedQuizzes[unitId];
    const currentScore = this.state.quizScores[unitId] || 0;
    const embedVideoUrl = this.parseVideoEmbed(unit.videoUrl);

    container.innerHTML = `
      <div class="space-y-8 animate-fadeIn">
        <!-- Breadcrumb & Top Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div class="flex items-center gap-2 text-xs text-slate-400">
            <button onclick="App.navigateToView('overview')" class="hover:text-sky-400 transition">หน้าหลัก</button>
            <span>/</span>
            <span class="text-sky-300 font-medium">${unit.badge}</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openUnitEditor(${unitId})" class="px-3 py-1.5 rounded-lg bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 text-xs flex items-center gap-1.5 border border-amber-500/30 transition">
              <i data-lucide="edit-3" class="w-3.5 h-3.5"></i> แก้ไขเนื้อหา/รูปภาพ/วิดีโอ
            </button>
            ${unitId > 1 ? `
              <button onclick="App.navigateToUnit(${unitId - 1})" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700 transition">
                <i data-lucide="chevron-left" class="w-4 h-4"></i> ก่อนหน้า
              </button>
            ` : ""}
            ${unitId < 10 ? `
              <button onclick="App.navigateToUnit(${unitId + 1})" class="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1.5 border border-slate-700 transition">
                ถัดไป <i data-lucide="chevron-right" class="w-4 h-4"></i>
              </button>
            ` : ""}
          </div>
        </div>

        <!-- Unit Header -->
        <div class="bg-gradient-to-r from-slate-900 via-sky-950/40 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2 text-xs font-bold text-sky-400 uppercase tracking-widest">
              <span>${unit.badge}</span>
              <span>•</span>
              <span>20105-2013 อิเล็กทรอนิกส์กำลัง</span>
            </div>
            <button onclick="App.openUnitEditor(${unitId})" class="text-xs text-amber-400 hover:text-amber-300 flex items-center gap-1">
              <i data-lucide="settings" class="w-3.5 h-3.5"></i> จัดการหน่วยนี้
            </button>
          </div>
          <h1 class="text-2xl md:text-4xl font-extrabold text-white mb-2 leading-tight">${unit.title}</h1>
          <div class="text-sm text-slate-400 italic mb-4 font-mono">${unit.enTitle}</div>
          <p class="text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">${unit.summary}</p>
        </div>

        <!-- Unit Video Lecture Card (วิดีโอสื่อการสอนประจำหน่วย) -->
        <div class="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
          <div class="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div class="flex items-center gap-2.5">
              <div class="w-9 h-9 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shadow-sm">
                <i data-lucide="video" class="w-5 h-5"></i>
              </div>
              <div>
                <h3 class="text-base font-bold text-white">วิดีโอสื่อการสอนและบรรยายประจำหน่วย</h3>
                <div class="text-xs text-slate-400">ศึกษาคำอธิบายทฤษฎีและการทดลองเชิงประจักษ์</div>
              </div>
            </div>
            <button onclick="App.openUnitEditor(${unitId})" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5 transition">
              <i data-lucide="link" class="w-3.5 h-3.5 text-rose-400"></i> ${embedVideoUrl ? 'เปลี่ยนวิดีโอ' : '+ เพิ่มวิดีโอ YouTube'}
            </button>
          </div>

          ${embedVideoUrl ? `
            ${embedVideoUrl.endsWith(".mp4") ? `
              <div class="w-full rounded-2xl overflow-hidden bg-black border border-slate-800">
                <video controls class="w-full max-h-[450px]">
                  <source src="${embedVideoUrl}" type="video/mp4">
                  เบราว์เซอร์ของคุณไม่รองรับการเล่นวิดีโอ
                </video>
              </div>
            ` : `
              <div class="video-responsive-wrapper border border-slate-800 shadow-2xl bg-black">
                <iframe src="${embedVideoUrl}" title="วิดีโอการสอนประจำหน่วยที่ ${unitId}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
              </div>
            `}
          ` : `
            <div class="p-8 border border-dashed border-slate-800 rounded-2xl text-center bg-slate-950/40">
              <div class="w-12 h-12 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-500 mb-3">
                <i data-lucide="film" class="w-6 h-6"></i>
              </div>
              <div class="text-sm font-semibold text-slate-300">ยังไม่ได้ระบุลิงก์วิดีโอสำหรับหน่วยนี้</div>
              <p class="text-xs text-slate-500 max-w-md mx-auto mt-1 mb-4">ครูผู้สอนหรือผู้ใช้งานสามารถเพิ่มลิงก์วิดีโอ YouTube หรือคลิปการสอนประจำหน่วยนี้ได้ทันที</p>
              <button onclick="App.openUnitEditor(${unitId})" class="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center gap-2 mx-auto transition">
                <i data-lucide="plus" class="w-4 h-4"></i> เพิ่มลิงก์วิดีโอ YouTube สำหรับหน่วยนี้
              </button>
            </div>
          `}
        </div>

        <!-- Learning Objectives Box -->
        <div class="p-5 bg-sky-950/30 border border-sky-800/40 rounded-2xl">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-sm font-bold text-sky-300 flex items-center gap-2">
              <i data-lucide="target" class="w-4 h-4"></i>
              สมรรถนะประจำหน่วย (Learning Objectives)
            </h3>
            <button onclick="App.openUnitEditor(${unitId})" class="text-[11px] text-sky-400 hover:underline">แก้ไขสมรรถนะ</button>
          </div>
          <ul class="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-slate-300">
            ${unit.objectives.map((obj) => `
              <li class="flex items-start gap-2">
                <i data-lucide="check" class="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"></i>
                <span>${obj}</span>
              </li>
            `).join("")}
          </ul>
        </div>

        <!-- Main Technical Content (Rich HTML + SVG / Images) -->
        <div class="bg-slate-900/70 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-md relative">
          <div class="flex justify-end mb-4">
            <button onclick="App.openUnitEditor(${unitId})" class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 flex items-center gap-1.5 transition">
              <i data-lucide="edit" class="w-3.5 h-3.5 text-sky-400"></i> แก้ไขเนื้อหาบทเรียนและรูปภาพ
            </button>
          </div>
          ${unit.contentHtml}
        </div>

        <!-- Key Formulas Section -->
        <div class="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-bold text-white flex items-center gap-2">
              <i data-lucide="calculator" class="w-5 h-5 text-amber-400"></i>
              สรุปสูตรคำนวณสำคัญประจำหน่วย
            </h3>
            <button onclick="App.openUnitEditor(${unitId})" class="text-xs text-amber-400 hover:underline">แก้ไขสูตรคำนวณ</button>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            ${unit.formulas.map((f) => `
              <div class="p-4 bg-slate-950 border border-slate-800 rounded-xl">
                <div class="text-xs font-semibold text-slate-400 mb-2">${f.name}</div>
                <div class="text-sm font-bold text-sky-300 py-1 font-mono">\\(${f.formula}\\)</div>
                <div class="text-[11px] text-slate-400 mt-2">${f.note}</div>
              </div>
            `).join("")}
          </div>
        </div>

        <!-- Quiz Section: 10 Questions -->
        <div id="quiz-anchor" class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800 mb-6">
            <div>
              <div class="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-1">แบบฝึกหัดท้ายบทเรียน</div>
              <h3 class="text-xl font-bold text-white flex items-center gap-2">
                <i data-lucide="help-circle" class="w-5 h-5 text-emerald-400"></i>
                แบบทดสอบวัดผลการเรียนรู้ 10 ข้อ
              </h3>
            </div>
            ${isSubmitted ? `
              <div class="flex items-center gap-3">
                <div class="px-4 py-2 rounded-xl text-sm font-bold ${currentScore >= 8 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-400 border border-amber-500/40'}">
                  คะแนนที่ได้: ${currentScore} / 10
                </div>
                <button onclick="App.resetQuiz(${unitId})" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-300 border border-slate-700 transition flex items-center gap-1.5">
                  <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> ทำใหม่
                </button>
              </div>
            ` : `
              <div class="text-xs text-slate-400">
                เลือกคำตอบที่ถูกต้องที่สุดให้ครบทั้ง 10 ข้อ แล้วกดปุ่มตรวจคำตอบ
              </div>
            `}
          </div>

          <!-- Questions List -->
          <div class="space-y-6">
            ${quiz.questions.map((q, idx) => {
              const selectedOpt = this.state.userAnswers[unitId]?.[q.id];
              const isCorrect = isSubmitted && selectedOpt === q.answer;

              return `
                <div class="p-5 rounded-2xl border transition ${
                  isSubmitted
                    ? isCorrect
                      ? 'bg-emerald-950/20 border-emerald-500/40'
                      : 'bg-rose-950/20 border-rose-500/40'
                    : 'bg-slate-950/60 border-slate-800'
                }">
                  <div class="flex items-start gap-3 mb-4">
                    <span class="w-6 h-6 rounded-lg bg-slate-800 text-sky-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ${idx + 1}
                    </span>
                    <p class="text-sm font-semibold text-slate-200 leading-relaxed">${q.question}</p>
                  </div>

                  <!-- Options List -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-2.5 pl-9">
                    ${q.options.map((opt, optIdx) => {
                      const isThisSelected = selectedOpt === optIdx;
                      let optionClasses = "border-slate-800 hover:bg-slate-800/80 text-slate-300";

                      if (isSubmitted) {
                        if (optIdx === q.answer) {
                          optionClasses = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold";
                        } else if (isThisSelected && optIdx !== q.answer) {
                          optionClasses = "bg-rose-500/20 border-rose-500 text-rose-300";
                        } else {
                          optionClasses = "opacity-50 border-slate-800 text-slate-400";
                        }
                      } else if (isThisSelected) {
                        optionClasses = "bg-sky-500/20 border-sky-500 text-sky-300 font-medium";
                      }

                      return `
                        <button
                          type="button"
                          ${isSubmitted ? 'disabled' : ''}
                          onclick="App.selectOption(${unitId}, ${q.id}, ${optIdx})"
                          class="w-full text-left p-3 rounded-xl border text-xs flex items-center gap-3 transition ${optionClasses}">
                          <span class="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold shrink-0 ${
                            isThisSelected ? 'border-sky-400 bg-sky-500/30 text-white' : 'border-slate-700 text-slate-400'
                          }">
                            ${['ก', 'ข', 'ค', 'ง'][optIdx]}
                          </span>
                          <span class="leading-relaxed">${opt}</span>
                        </button>
                      `;
                    }).join("")}
                  </div>

                  <!-- Detailed Explanation Box -->
                  ${isSubmitted ? `
                    <div class="mt-4 pt-3 border-t border-slate-800 pl-9 text-xs">
                      <div class="flex items-center gap-2 mb-1.5 font-bold ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}">
                        <i data-lucide="${isCorrect ? 'check-circle' : 'x-circle'}" class="w-4 h-4"></i>
                        <span>${isCorrect ? 'ถูกต้อง!' : 'เฉลย: ข้อ ' + ['ก', 'ข', 'ค', 'ง'][q.answer]}</span>
                      </div>
                      <p class="text-slate-300 leading-relaxed bg-slate-900/90 p-3 rounded-xl border border-slate-800">
                        <strong>คำอธิบาย:</strong> ${q.explanation}
                      </p>
                    </div>
                  ` : ""}
                </div>
              `;
            }).join("")}
          </div>

          <!-- Submit Button Action Bar -->
          <div class="mt-8 pt-6 border-t border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div class="text-xs text-slate-400">
              สถานะ: ตอบแล้ว <span class="text-sky-400 font-bold">${Object.keys(this.state.userAnswers[unitId] || {}).length}</span> / 10 ข้อ
            </div>
            ${!isSubmitted ? `
              <button onclick="App.submitQuiz(${unitId})" class="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-sm shadow-lg shadow-emerald-500/25 flex items-center gap-2 transition transform active:scale-95">
                <i data-lucide="check" class="w-4 h-4"></i> ตรวจคำตอบและบันทึกคะแนนเก็บ
              </button>
            ` : `
              <div class="flex items-center gap-3">
                <button onclick="App.navigateToView('gradebook')" class="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition">
                  <i data-lucide="bar-chart-2" class="w-4 h-4"></i> ดูคะแนนเก็บทั้งหมด
                </button>
                ${unitId < 10 ? `
                  <button onclick="App.navigateToUnit(${unitId + 1})" class="px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition">
                    ไปเรียนต่อหน่วยที่ ${unitId + 1} <i data-lucide="arrow-right" class="w-4 h-4"></i>
                  </button>
                ` : `
                  <button onclick="App.openCertificateModal()" class="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-2 transition">
                    <i data-lucide="award" class="w-4 h-4"></i> ออกใบประกาศนียบัตร
                  </button>
                `}
              </div>
            `}
          </div>
        </div>
      </div>
    `;
  },

  selectOption(unitId, questionId, optionIdx) {
    if (this.state.submittedQuizzes[unitId]) return;

    if (!this.state.userAnswers[unitId]) {
      this.state.userAnswers[unitId] = {};
    }
    this.state.userAnswers[unitId][questionId] = optionIdx;

    if (this.state.currentUser) {
      if (!this.state.currentUser.userAnswers) this.state.currentUser.userAnswers = {};
      this.state.currentUser.userAnswers[unitId] = this.state.userAnswers[unitId];
      this.saveUsers();
    }

    if (this.state.soundEnabled) this.playTickSound();
    this.renderCurrentView();
  },

  submitQuiz(unitId) {
    const quiz = QUIZ_DATA[unitId];
    if (!quiz) return;

    const answers = this.state.userAnswers[unitId] || {};
    const answeredCount = Object.keys(answers).length;

    if (answeredCount < 10) {
      const confirmSubmit = confirm(`ท่านยังตอบคำถามไม่ครบ (ตอบแล้ว ${answeredCount}/10 ข้อ) ต้องการส่งคำตอบและบันทึกคะแนนเลยหรือไม่?`);
      if (!confirmSubmit) return;
    }

    let score = 0;
    quiz.questions.forEach((q) => {
      if (answers[q.id] === q.answer) score++;
    });

    this.state.submittedQuizzes[unitId] = true;
    this.state.quizScores[unitId] = score;

    const u = this.state.currentUser;
    if (u) {
      if (!u.quizScores) u.quizScores = {};
      if (!u.submittedQuizzes) u.submittedQuizzes = {};
      if (!u.quizAttempts) u.quizAttempts = {};
      if (!u.activityLog) u.activityLog = [];

      u.quizScores[unitId] = score;
      u.submittedQuizzes[unitId] = true;
      u.quizAttempts[unitId] = (u.quizAttempts[unitId] || 0) + 1;

      const nowStr = this.getTimestampString();
      u.activityLog.unshift({
        type: "quiz",
        title: `ทำแบบทดสอบหน่วยที่ ${unitId}: ได้ ${score}/10 คะแนน`,
        timestamp: nowStr,
        details: `${score >= 8 ? 'ผลการเรียนดีเยี่ยม' : score >= 5 ? 'ผ่านเกณฑ์' : 'ไม่ผ่านเกณฑ์'} (ครั้งที่ ${u.quizAttempts[unitId]})`
      });

      this.setCurrentUser(u);
    }

    this.updateGlobalProgress();
    this.renderSidebarStudentCard();
    this.renderSidebar();

    if (this.state.soundEnabled) {
      if (score >= 8) this.playSuccessFanfare();
      else this.playSimpleCompleteSound();
    }

    this.renderCurrentView();

    setTimeout(() => {
      const anchor = document.getElementById("quiz-anchor");
      if (anchor) anchor.scrollIntoView({ behavior: "smooth" });
    }, 100);
  },

  resetQuiz(unitId) {
    if (!confirm("ท่านต้องการรีเซ็ตคำตอบและทำแบบฝึกหัดหน่วยนี้ใหม่อีกครั้งเพื่อปรับปรุงคะแนนหรือไม่?")) return;

    delete this.state.submittedQuizzes[unitId];
    delete this.state.userAnswers[unitId];

    const u = this.state.currentUser;
    if (u) {
      if (u.submittedQuizzes) delete u.submittedQuizzes[unitId];
      if (u.userAnswers) delete u.userAnswers[unitId];
      this.setCurrentUser(u);
    }

    this.updateGlobalProgress();
    this.renderSidebar();
    this.renderCurrentView();
  },

  // 3. หน้าระบบดูคะแนนเก็บและประวัติการเข้าใช้งาน (Gradebook & Student History)
  renderGradebook(container) {
    const u = this.state.currentUser;
    if (!u) return;

    let totalScore = 0;
    const completedUnits = Object.keys(u.submittedQuizzes || {}).length;
    Object.values(u.quizScores || {}).forEach(s => totalScore += s);

    let gradeLabel = "0.0 (ไม่ผ่านเกณฑ์)";
    let gradeColor = "text-rose-400";
    let gradeBg = "bg-rose-950/40 border-rose-800/60";
    if (totalScore >= 80) {
      gradeLabel = "4.0 (ดีเยี่ยม)";
      gradeColor = "text-emerald-400";
      gradeBg = "bg-emerald-950/40 border-emerald-800/60";
    } else if (totalScore >= 75) {
      gradeLabel = "3.5 (ดีมาก)";
      gradeColor = "text-emerald-300";
      gradeBg = "bg-emerald-950/30 border-emerald-800/50";
    } else if (totalScore >= 70) {
      gradeLabel = "3.0 (ดี)";
      gradeColor = "text-sky-400";
      gradeBg = "bg-sky-950/30 border-sky-800/50";
    } else if (totalScore >= 60) {
      gradeLabel = "2.0 (ปานกลาง)";
      gradeColor = "text-amber-400";
      gradeBg = "bg-amber-950/30 border-amber-800/50";
    } else if (totalScore >= 50) {
      gradeLabel = "1.0 (ผ่านเกณฑ์ขั้นต่ำ)";
      gradeColor = "text-amber-300";
      gradeBg = "bg-amber-950/30 border-amber-800/50";
    }

    const units = this.getUnits();

    container.innerHTML = `
      <div class="space-y-8 animate-fadeIn">
        <!-- Header & Action Bar -->
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div class="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">สมุดผลการเรียนและบันทึกกิจกรรม</div>
            <h1 class="text-2xl md:text-3xl font-extrabold text-white flex items-center gap-2">
              <i data-lucide="bar-chart-2" class="w-6 h-6 text-amber-400"></i>
              ระบบคะแนนเก็บและประวัติการเข้าใช้งาน
            </h1>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.openProfileEditor()" class="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5">
              <i data-lucide="user-cog" class="w-4 h-4 text-amber-400"></i> แก้ไขข้อมูลโปรไฟล์
            </button>
            <button onclick="App.printGradeReport()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition shadow-lg shadow-amber-500/20">
              <i data-lucide="printer" class="w-4 h-4"></i> พิมพ์ใบรายงานคะแนนเก็บ (PDF)
            </button>
            <button onclick="App.openAuthModal()" class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 transition flex items-center gap-1.5">
              <i data-lucide="user-plus" class="w-4 h-4 text-sky-400"></i> สลับบัญชี
            </button>
          </div>
        </div>

        <!-- Student Profile Card Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-sky-950/30 to-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
          <div class="flex items-center gap-4">
            <div class="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 to-cyan-400 flex items-center justify-center text-slate-950 font-extrabold text-2xl shadow-lg shrink-0">
              ${u.name.charAt(0) || 'น'}
            </div>
            <div>
              <div class="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full bg-sky-500/10 border border-sky-400/30 text-sky-300 text-[11px] font-semibold mb-1">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> กำลังเข้าใช้งาน
              </div>
              <div class="flex items-center gap-2">
                <h2 class="text-xl md:text-2xl font-bold text-white">${u.name}</h2>
                <button onclick="App.openProfileEditor()" title="แก้ไขข้อมูล" class="p-1 text-slate-400 hover:text-amber-400 transition">
                  <i data-lucide="edit-2" class="w-3.5 h-3.5"></i>
                </button>
              </div>
              <div class="text-xs text-slate-400 font-mono flex flex-wrap items-center gap-2 mt-1">
                <span>รหัสประจำตัว: <strong class="text-sky-300">${u.studentId}</strong></span>
                <span>•</span>
                <span>แผนก: <strong class="text-slate-300">${u.department || 'ช่างอิเล็กทรอนิกส์'}</strong></span>
                <span>•</span>
                <span>ระดับชั้น: <strong class="text-slate-300">${u.classGroup || 'ปวช. 2'}</strong></span>
              </div>
              ${u.email || u.phone ? `
                <div class="text-[11px] text-slate-400 mt-1 flex items-center gap-3">
                  ${u.email ? `<span>อีเมล: ${u.email}</span>` : ''}
                  ${u.phone ? `<span>โทร: ${u.phone}</span>` : ''}
                </div>
              ` : ''}
            </div>
          </div>
          <div class="flex flex-wrap md:flex-col gap-2 text-xs text-slate-400 border-t md:border-t-0 md:border-l border-slate-800 pt-3 md:pt-0 md:pl-6">
            <div>ลงทะเบียนเมื่อ: <span class="text-slate-300">${u.registeredAt || '-'}</span></div>
            <div>เข้าใช้ล่าสุด: <span class="text-sky-300">${u.lastLogin || '-'}</span></div>
            <div>จำนวนครั้งที่เข้าใช้: <span class="font-bold text-emerald-400">${u.loginCount || 1} ครั้ง</span></div>
          </div>
        </div>

        <!-- Key Academic Metrics (4 Cards) -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div class="text-xs text-slate-400 mb-1">คะแนนเก็บรวม</div>
            <div class="text-2xl md:text-3xl font-extrabold text-amber-400">${totalScore} <span class="text-xs font-normal text-slate-500">/ 100</span></div>
            <div class="text-[11px] text-slate-400 mt-2">คิดเป็น ${totalScore}% ของคะแนนเต็ม</div>
          </div>
          <div class="p-5 ${gradeBg} border rounded-2xl">
            <div class="text-xs text-slate-400 mb-1">ระดับผลการเรียนสะสม</div>
            <div class="text-xl md:text-2xl font-extrabold ${gradeColor}">${gradeLabel}</div>
            <div class="text-[11px] text-slate-400 mt-2">${totalScore >= 80 ? 'ผ่านเกณฑ์ระดับยอดเยี่ยม' : totalScore >= 50 ? 'ผ่านเกณฑ์ประเมิน' : 'ต้องทำแบบทดสอบซ้ำ'}</div>
          </div>
          <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div class="text-xs text-slate-400 mb-1">หน่วยที่ทำเสร็จแล้ว</div>
            <div class="text-2xl md:text-3xl font-extrabold text-sky-400">${completedUnits} <span class="text-xs font-normal text-slate-500">/ 10 หน่วย</span></div>
            <div class="text-[11px] text-slate-400 mt-2">${completedUnits === 10 ? 'ครบทั้ง 10 หน่วยการเรียนรู้' : 'เหลืออีก ' + (10 - completedUnits) + ' หน่วย'}</div>
          </div>
          <div class="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
            <div class="text-xs text-slate-400 mb-1">สถานะใบประกาศนียบัตร</div>
            <div class="text-xl md:text-2xl font-extrabold ${totalScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}">
              ${totalScore >= 80 ? 'มีสิทธิ์รับใบประกาศฯ' : 'รอคะแนนถึง 80%'}
            </div>
            <div class="text-[11px] text-slate-400 mt-2">
              ${totalScore >= 80 ? '<button onclick="App.openCertificateModal()" class="text-sky-400 underline font-semibold">คลิกเพื่อรับใบประกาศฯ</button>' : 'ขาดอีก ' + (80 - totalScore) + ' คะแนน'}
            </div>
          </div>
        </div>

        <!-- 10 Units Score Breakdown Table -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <div>
              <h3 class="text-lg font-bold text-white flex items-center gap-2">
                <i data-lucide="list-checks" class="w-5 h-5 text-sky-400"></i>
                ตารางบันทึกคะแนนเก็บ รายหน่วยการเรียนรู้ (10 หน่วย)
              </h3>
              <p class="text-xs text-slate-400">แสดงผลคะแนนและสถานะการประเมินผลของแต่ละหน่วย</p>
            </div>
          </div>

          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs text-slate-300">
              <thead class="bg-slate-950/80 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th class="p-3 w-16 text-center">หน่วยที่</th>
                  <th class="p-3">ชื่อหน่วยการเรียนรู้</th>
                  <th class="p-3 text-center">คะแนนเต็ม</th>
                  <th class="p-3 text-center">คะแนนที่ได้</th>
                  <th class="p-3">ความก้าวหน้า</th>
                  <th class="p-3 text-center">ผลการประเมิน</th>
                  <th class="p-3 text-center">จำนวนครั้งที่ทำ</th>
                  <th class="p-3 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-800/60">
                ${units.map((u) => {
                  const score = this.state.currentUser.quizScores ? (this.state.currentUser.quizScores[u.id] || 0) : 0;
                  const isDone = !!this.state.currentUser.submittedQuizzes[u.id];
                  const attempts = this.state.currentUser.quizAttempts[u.id] || (isDone ? 1 : 0);
                  const pct = isDone ? Math.round((score / 10) * 100) : 0;

                  let statusBadge = `<span class="px-2 py-0.5 rounded-full text-[10px] text-slate-500 bg-slate-800">ยังไม่ทำ</span>`;
                  if (isDone) {
                    if (score >= 8) {
                      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">ผ่านเกณฑ์ดีเยี่ยม</span>`;
                    } else if (score >= 5) {
                      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">ผ่านเกณฑ์</span>`;
                    } else {
                      statusBadge = `<span class="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">ต่ำกว่าเกณฑ์</span>`;
                    }
                  }

                  return `
                    <tr class="hover:bg-slate-850/50 transition">
                      <td class="p-3 text-center font-bold text-sky-400">${u.id}</td>
                      <td class="p-3 font-medium text-white">
                        <div>${u.title}</div>
                        <div class="text-[10px] text-slate-500 italic">${u.enTitle}</div>
                      </td>
                      <td class="p-3 text-center font-mono">10</td>
                      <td class="p-3 text-center font-bold text-base font-mono ${isDone ? (score >= 8 ? 'text-emerald-400' : score >= 5 ? 'text-sky-300' : 'text-rose-400') : 'text-slate-500'}">
                        ${isDone ? score : '-'}
                      </td>
                      <td class="p-3 w-36">
                        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                          <div class="h-full rounded-full ${score >= 8 ? 'bg-emerald-500' : score >= 5 ? 'bg-sky-400' : 'bg-rose-500'}" style="width: ${pct}%;"></div>
                        </div>
                        <div class="text-[10px] text-slate-500 text-right mt-0.5">${pct}%</div>
                      </td>
                      <td class="p-3 text-center">${statusBadge}</td>
                      <td class="p-3 text-center font-mono text-slate-400">${attempts > 0 ? attempts + ' ครั้ง' : '-'}</td>
                      <td class="p-3 text-center">
                        <button onclick="App.navigateToUnit(${u.id}); setTimeout(() => { document.getElementById('quiz-anchor')?.scrollIntoView({behavior: 'smooth'}); }, 200);" class="px-2.5 py-1 rounded-lg text-xs font-semibold ${isDone ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold'} transition">
                          ${isDone ? 'ทำซ้ำ' : 'ทำแบบฝึกหัด'}
                        </button>
                      </td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
          </div>
        </div>

        <!-- Activity Timeline / Access Log -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <h3 class="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <i data-lucide="history" class="w-5 h-5 text-emerald-400"></i>
            ประวัติการเข้าใช้งานและกิจกรรมการเรียนรู้ (Activity Log)
          </h3>
          <div class="space-y-3">
            ${(u.activityLog && u.activityLog.length > 0) ? u.activityLog.slice(0, 15).map((act) => {
              let iconName = "check-circle";
              let iconColor = "text-emerald-400 bg-emerald-500/10";
              if (act.type === "login") {
                iconName = "log-in";
                iconColor = "text-sky-400 bg-sky-500/10";
              } else if (act.type === "system") {
                iconName = "shield";
                iconColor = "text-purple-400 bg-purple-500/10";
              }

              return `
                <div class="p-3 bg-slate-950/70 border border-slate-800/80 rounded-2xl flex items-start gap-3 text-xs">
                  <div class="w-7 h-7 rounded-lg ${iconColor} flex items-center justify-center shrink-0 mt-0.5">
                    <i data-lucide="${iconName}" class="w-4 h-4"></i>
                  </div>
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between gap-2 mb-0.5">
                      <div class="font-bold text-slate-200">${act.title}</div>
                      <div class="text-[10px] text-slate-500 font-mono">${act.timestamp}</div>
                    </div>
                    <div class="text-slate-400 text-[11px]">${act.details}</div>
                  </div>
                </div>
              `;
            }).join("") : `
              <div class="text-xs text-slate-500 text-center py-4">ยังไม่มีบันทึกประวัติกิจกรรม</div>
            `}
          </div>
        </div>

        <!-- Hidden Formal Printable Grade Report Template for window.print() -->
        <div id="printable-grade-report" class="hidden">
          <div class="text-center pb-4 border-b-2 border-slate-900 mb-6 font-serif">
            <div class="text-xs uppercase tracking-widest font-sans font-bold">สำนักงานคณะกรรมการการอาชีวศึกษา (สอศ.)</div>
            <h2 class="text-2xl font-bold font-sans mt-1">ใบรายงานผลคะแนนเก็บรายวิชา (Grade Progress Report)</h2>
            <div class="text-sm font-sans font-semibold mt-1">รายวิชา อิเล็กทรอนิกส์กำลัง (รหัสวิชา 20105-2013)</div>
            <div class="text-xs font-sans text-slate-600">หลักสูตรประกาศนียบัตรวิชาชีพ (ปวช.) สาขาวิชาช่างอิเล็กทรอนิกส์</div>
          </div>

          <div class="grid grid-cols-2 gap-4 text-xs font-sans mb-6 p-4 border border-slate-300 rounded-lg bg-slate-50">
            <div><strong>ชื่อ-นามสกุล ผู้เรียน:</strong> ${u.name}</div>
            <div><strong>รหัสประจำตัวนักศึกษา:</strong> ${u.studentId}</div>
            <div><strong>แผนกวิชา:</strong> ${u.department || 'ช่างอิเล็กทรอนิกส์'}</div>
            <div><strong>ระดับชั้น / กลุ่ม:</strong> ${u.classGroup || 'ปวช. 2'}</div>
            <div><strong>วันที่พิมพ์รายงาน:</strong> ${this.getTimestampString()}</div>
            <div><strong>สถานะผลการเรียน:</strong> ${gradeLabel}</div>
          </div>

          <table class="w-full text-xs font-sans border-collapse border border-slate-400 mb-6">
            <thead>
              <tr class="bg-slate-200">
                <th class="border border-slate-400 p-2 text-center w-12">หน่วย</th>
                <th class="border border-slate-400 p-2 text-left">ชื่อหน่วยการเรียนรู้</th>
                <th class="border border-slate-400 p-2 text-center w-20">คะแนนเต็ม</th>
                <th class="border border-slate-400 p-2 text-center w-20">คะแนนที่ได้</th>
                <th class="border border-slate-400 p-2 text-center w-28">ผลการประเมิน</th>
              </tr>
            </thead>
            <tbody>
              ${units.map((uItem) => {
                const s = this.state.currentUser.quizScores[uItem.id] || 0;
                const done = !!this.state.currentUser.submittedQuizzes[uItem.id];
                return `
                  <tr>
                    <td class="border border-slate-400 p-2 text-center font-bold">${uItem.id}</td>
                    <td class="border border-slate-400 p-2">${uItem.title}</td>
                    <td class="border border-slate-400 p-2 text-center">10</td>
                    <td class="border border-slate-400 p-2 text-center font-bold">${done ? s : '-'}</td>
                    <td class="border border-slate-400 p-2 text-center">${done ? (s >= 8 ? 'ดีเยี่ยม' : s >= 5 ? 'ผ่าน' : 'ไม่ผ่าน') : 'ยังไม่ทำ'}</td>
                  </tr>
                `;
              }).join("")}
              <tr class="bg-slate-100 font-bold">
                <td colspan="2" class="border border-slate-400 p-2 text-right">รวมคะแนนเก็บสะสม (10 หน่วย):</td>
                <td class="border border-slate-400 p-2 text-center">100</td>
                <td class="border border-slate-400 p-2 text-center text-sm font-bold">${totalScore}</td>
                <td class="border border-slate-400 p-2 text-center">${gradeLabel}</td>
              </tr>
            </tbody>
          </table>

          <div class="grid grid-cols-2 gap-12 pt-8 text-center font-sans text-xs">
            <div>
              <div class="w-44 border-b border-slate-800 mx-auto mb-1.5"></div>
              <div class="font-bold">ลงชื่อ .....................................................</div>
              <div>(ครูผู้สอนประจำรายวิชา)</div>
            </div>
            <div>
              <div class="w-44 border-b border-slate-800 mx-auto mb-1.5"></div>
              <div class="font-bold">ลงชื่อ .....................................................</div>
              <div>(หัวหน้าแผนกวิชาช่างอิเล็กทรอนิกส์)</div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  printGradeReport() {
    document.body.classList.remove("printing-certificate");
    document.body.classList.add("printing-gradebook");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-gradebook");
    }, 1000);
  },

  // 4. หน้าต่างแก้ไขเนื้อหา รูปภาพ วิดีโอ แต่ละหน่วยการเรียน (Unit Content & Media CMS)
  openUnitEditor(unitId) {
    unitId = parseInt(unitId, 10);
    const unit = this.getUnitById(unitId);
    if (!unit) return;

    const modal = document.getElementById("unit-editor-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const modalBody = document.getElementById("unit-editor-modal-body");
    if (!modalBody) return;

    const objectivesText = (unit.objectives || []).join("\n");

    modalBody.innerHTML = `
      <div class="space-y-6">
        <!-- Header -->
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <span class="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold text-sm">
              ${unit.id}
            </span>
            <div>
              <h3 class="text-base font-bold text-white">แก้ไขเนื้อหา รูปภาพ และวิดีโอ (หน่วยที่ ${unit.id})</h3>
              <p class="text-xs text-slate-400">${unit.title}</p>
            </div>
          </div>
          <button onclick="App.closeUnitEditor()" class="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <!-- Tabs -->
        <div class="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button id="uedit-tab-media" onclick="App.switchUnitEditTab('media')" class="flex-1 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold transition">ข้อมูลและวิดีโอ</button>
          <button id="uedit-tab-content" onclick="App.switchUnitEditTab('content')" class="flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition">เนื้อหาบทเรียน & รูปภาพ</button>
          <button id="uedit-tab-objectives" onclick="App.switchUnitEditTab('objectives')" class="flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition">สมรรถนะการเรียนรู้</button>
        </div>

        <form id="unit-edit-form" onsubmit="event.preventDefault(); App.handleSaveUnitForm(${unit.id});" class="space-y-4 text-xs">
          <!-- Tab 1: ข้อมูลและวิดีโอ -->
          <div id="uedit-pane-media" class="space-y-4">
            <div>
              <label class="block text-slate-300 font-semibold mb-1">ชื่อหน่วยการเรียนรู้ (ภาษาไทย):</label>
              <input id="uedit-title" type="text" value="${unit.title}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400 text-sm font-semibold" />
            </div>

            <div>
              <label class="block text-slate-300 font-semibold mb-1">ชื่อภาษาอังกฤษ (English Title):</label>
              <input id="uedit-entitle" type="text" value="${unit.enTitle || ''}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-sky-400 italic" />
            </div>

            <div class="p-4 bg-slate-950/70 border border-slate-800 rounded-2xl space-y-3">
              <div class="flex items-center gap-2">
                <i data-lucide="video" class="w-4 h-4 text-rose-400"></i>
                <label class="font-bold text-white">ลิงก์วิดีโอสื่อการสอน (YouTube URL หรือ MP4):</label>
              </div>
              <input id="uedit-video" type="url" placeholder="เช่น https://www.youtube.com/watch?v=..." value="${unit.videoUrl || ''}" class="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-rose-400" />
              <div class="text-[11px] text-slate-400 leading-relaxed">
                รองรับลิงก์ YouTube ทุกรูปแบบ เช่น <code>https://www.youtube.com/watch?v=...</code> หรือ <code>https://youtu.be/...</code> ระบบจะแปลงเป็นเครื่องเล่นวิดีโอ 16:9 อัตโนมัติ
              </div>
            </div>

            <div>
              <label class="block text-slate-300 font-semibold mb-1">คำอธิบายย่อประจำหน่วย (Summary):</label>
              <textarea id="uedit-summary" rows="3" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-sky-400 leading-relaxed">${unit.summary || ''}</textarea>
            </div>
          </div>

          <!-- Tab 2: เนื้อหาบทเรียนและแทรกรูปภาพ -->
          <div id="uedit-pane-content" class="space-y-3 hidden">
            <!-- Toolbar for Quick Inserters -->
            <div class="flex flex-wrap items-center gap-2 p-2 bg-slate-950 rounded-xl border border-slate-800">
              <span class="text-[11px] text-slate-400 font-semibold pl-1">ตัวช่วยแทรก:</span>
              <button type="button" onclick="App.insertImageSnippet()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-300 text-[11px] flex items-center gap-1">
                <i data-lucide="image" class="w-3 h-3"></i> + แทรกรูปภาพ URL
              </button>
              <button type="button" onclick="App.insertHeadingSnippet()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] flex items-center gap-1">
                <i data-lucide="heading" class="w-3 h-3"></i> + แทรกหัวข้อย่อย
              </button>
              <button type="button" onclick="App.insertAlertSnippet()" class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 text-[11px] flex items-center gap-1">
                <i data-lucide="alert-circle" class="w-3 h-3"></i> + แทรกกล่องเน้นข้อความ
              </button>
            </div>

            <div>
              <label class="block text-slate-300 font-semibold mb-1">เนื้อหาบทเรียน (HTML / Markdown):</label>
              <textarea id="uedit-content" rows="14" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 font-mono text-xs focus:outline-none focus:border-sky-400 leading-relaxed resize-y">${unit.contentHtml || ''}</textarea>
            </div>
          </div>

          <!-- Tab 3: สมรรถนะการเรียนรู้ -->
          <div id="uedit-pane-objectives" class="space-y-3 hidden">
            <div>
              <label class="block text-slate-300 font-semibold mb-1">สมรรถนะประจำหน่วย (1 ข้อต่อ 1 บรรทัด):</label>
              <textarea id="uedit-objectives" rows="6" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-3 text-slate-200 focus:outline-none focus:border-sky-400 leading-relaxed">${objectivesText}</textarea>
              <div class="text-[11px] text-slate-400 mt-1">พิมพ์สมรรถนะการเรียนรู้โดยเคาะขึ้นบรรทัดใหม่เพื่อแยกแต่ละข้อ</div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <button type="button" onclick="App.resetUnitToDefault(${unit.id})" class="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center gap-1.5 transition">
              <i data-lucide="rotate-ccw" class="w-3.5 h-3.5"></i> คืนค่าเริ่มต้นของหน่วยนี้
            </button>
            <div class="flex items-center gap-2">
              <button type="button" onclick="App.closeUnitEditor()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition">
                ยกเลิก
              </button>
              <button type="submit" class="px-5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 transition">
                <i data-lucide="save" class="w-4 h-4"></i> บันทึกการเปลี่ยนแปลง
              </button>
            </div>
          </div>
        </form>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  switchUnitEditTab(tab) {
    const tabs = ["media", "content", "objectives"];
    tabs.forEach((t) => {
      const btn = document.getElementById(`uedit-tab-${t}`);
      const pane = document.getElementById(`uedit-pane-${t}`);
      if (btn && pane) {
        if (t === tab) {
          btn.classList.add("bg-sky-500", "text-slate-950", "font-bold");
          btn.classList.remove("text-slate-400");
          pane.classList.remove("hidden");
        } else {
          btn.classList.remove("bg-sky-500", "text-slate-950", "font-bold");
          btn.classList.add("text-slate-400");
          pane.classList.add("hidden");
        }
      }
    });
  },

  insertImageSnippet() {
    const url = prompt("กรุณาวาง URL รูปภาพ (เช่น https://example.com/image.png):", "https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800");
    if (!url) return;
    const caption = prompt("คำอธิบายภาพ (Caption):", "รูปภาพวงจรอิเล็กทรอนิกส์กำลังและการทดสอบ");
    const snippet = `\n<div class="my-6 text-center">\n  <img src="${url}" alt="${caption || 'รูปภาพ'}" class="max-w-full mx-auto rounded-2xl border border-slate-700 shadow-xl" />\n  <div class="text-xs text-slate-400 mt-2 italic">${caption || 'คำอธิบายรูปภาพ'}</div>\n</div>\n`;

    const area = document.getElementById("uedit-content");
    if (area) {
      area.value += snippet;
      area.focus();
    }
  },

  insertHeadingSnippet() {
    const title = prompt("กรุณาระบุหัวข้อย่อยใหม่:", "การวิเคราะห์การทำงานของวงจร");
    if (!title) return;
    const snippet = `\n<section class="mb-6">\n  <h3 class="text-xl font-bold text-sky-400 mb-3 flex items-center gap-2">\n    <span class="w-2 h-6 bg-sky-500 rounded-full inline-block"></span>\n    ${title}\n  </h3>\n  <p class="text-slate-300 leading-relaxed mb-3">\n    เพิ่มเนื้อหาและรายละเอียดที่นี่...\n  </p>\n</section>\n`;

    const area = document.getElementById("uedit-content");
    if (area) {
      area.value += snippet;
      area.focus();
    }
  },

  insertAlertSnippet() {
    const text = prompt("ข้อความเน้นย้ำหรือข้อควรระวัง:", "ข้อควรระวัง: ตรวจสอบพิกัดแรงดัน PIV ของอุปกรณ์ก่อนจ่ายไฟเสมอ");
    if (!text) return;
    const snippet = `\n<div class="my-4 p-4 bg-amber-950/40 border border-amber-500/40 rounded-xl text-amber-200 text-xs leading-relaxed">\n  <strong>ข้อสังเกตสำคัญ:</strong> ${text}\n</div>\n`;

    const area = document.getElementById("uedit-content");
    if (area) {
      area.value += snippet;
      area.focus();
    }
  },

  handleSaveUnitForm(unitId) {
    const title = document.getElementById("uedit-title")?.value || "";
    const enTitle = document.getElementById("uedit-entitle")?.value || "";
    const videoUrl = document.getElementById("uedit-video")?.value || "";
    const summary = document.getElementById("uedit-summary")?.value || "";
    const contentHtml = document.getElementById("uedit-content")?.value || "";
    const objectivesRaw = document.getElementById("uedit-objectives")?.value || "";

    const objectives = objectivesRaw
      .split("\n")
      .map(o => o.trim())
      .filter(o => o.length > 0);

    const updatedData = {
      title,
      enTitle,
      videoUrl,
      summary,
      contentHtml,
      objectives
    };

    this.saveUnitCustomData(unitId, updatedData);
  },

  closeUnitEditor() {
    const modal = document.getElementById("unit-editor-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  // 5. หน้าต่างแก้ไขข้อมูลโปรไฟล์ผู้ใช้งาน (Profile Editor)
  openProfileEditor() {
    const u = this.state.currentUser;
    if (!u) return;

    const modal = document.getElementById("profile-editor-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const modalBody = document.getElementById("profile-editor-modal-body");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6 md:p-8 space-y-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-amber-500/20 flex items-center justify-center text-amber-400">
              <i data-lucide="user-cog" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">แก้ไขข้อมูลโปรไฟล์ผู้ใช้งาน</h3>
              <p class="text-[11px] text-slate-400">ข้อมูลนี้จะปรากฏในสมุดคะแนนและใบประกาศนียบัตร</p>
            </div>
          </div>
          <button onclick="App.closeProfileEditor()" class="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <form onsubmit="event.preventDefault(); App.saveUserProfile({
          name: document.getElementById('prof-name').value,
          studentId: document.getElementById('prof-id').value,
          department: document.getElementById('prof-dept').value,
          classGroup: document.getElementById('prof-class').value,
          email: document.getElementById('prof-email').value,
          phone: document.getElementById('prof-phone').value,
          bio: document.getElementById('prof-bio').value,
          pin: document.getElementById('prof-pin').value
        });" class="space-y-3 text-xs">
          <div>
            <label class="block text-slate-300 mb-1 font-semibold">คำนำหน้า ชื่อ - สกุล <span class="text-rose-400">*</span>:</label>
            <input id="prof-name" type="text" value="${u.name}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-semibold text-sm" />
          </div>

          <div>
            <label class="block text-slate-300 mb-1 font-semibold">รหัสประจำตัวนักศึกษา / ผู้สอน <span class="text-rose-400">*</span>:</label>
            <input id="prof-id" type="text" value="${u.studentId}" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-amber-400" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-300 mb-1 font-semibold">แผนกวิชา:</label>
              <input id="prof-dept" type="text" value="${u.department || 'สาขาวิชาช่างอิเล็กทรอนิกส์'}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label class="block text-slate-300 mb-1 font-semibold">ระดับชั้น / กลุ่ม:</label>
              <input id="prof-class" type="text" value="${u.classGroup || 'ปวช. 2'}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="block text-slate-300 mb-1">อีเมลติดต่อ:</label>
              <input id="prof-email" type="email" placeholder="example@mail.com" value="${u.email || ''}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400" />
            </div>
            <div>
              <label class="block text-slate-300 mb-1">เบอร์โทรศัพท์:</label>
              <input id="prof-phone" type="text" placeholder="08x-xxx-xxxx" value="${u.phone || ''}" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono" />
            </div>
          </div>

          <div>
            <label class="block text-slate-300 mb-1">รหัสผ่าน / PIN (4-6 หลัก):</label>
            <input id="prof-pin" type="password" value="${u.pin || '1234'}" maxlength="6" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-400 font-mono" />
          </div>

          <div>
            <label class="block text-slate-300 mb-1">บันทึกย่อ / เกี่ยวกับตนเอง:</label>
            <textarea id="prof-bio" rows="2" class="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-slate-200 focus:outline-none focus:border-amber-400">${u.bio || ''}</textarea>
          </div>

          <div class="pt-3 border-t border-slate-800 flex justify-end gap-2">
            <button type="button" onclick="App.closeProfileEditor()" class="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold transition">
              ยกเลิก
            </button>
            <button type="submit" class="px-5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 transition">
              บันทึกข้อมูลโปรไฟล์
            </button>
          </div>
        </form>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  closeProfileEditor() {
    const modal = document.getElementById("profile-editor-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  // 6. หน้าต่างสำรองข้อมูล นำเข้า และอัปเดต (Data Backup & Sync Modal)
  openBackupModal() {
    const modal = document.getElementById("backup-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const modalBody = document.getElementById("backup-modal-body");
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div class="p-6 md:p-8 space-y-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <i data-lucide="database" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">การอัปเดตและสำรองข้อมูลระบบ</h3>
              <p class="text-[11px] text-slate-400">สำรองเนื้อหาบทเรียน สื่อวิดีโอ และคะแนนเก็บ หรือนำเข้าจากเครื่องอื่น</p>
            </div>
          </div>
          <button onclick="App.closeBackupModal()" class="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="space-y-4 text-xs">
          <!-- 1. Export Data -->
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div class="flex items-center gap-2">
              <i data-lucide="download" class="w-4 h-4 text-emerald-400"></i>
              <div class="font-bold text-white text-sm">ส่งออกไฟล์สำรองข้อมูล (Export JSON)</div>
            </div>
            <p class="text-slate-400 leading-relaxed">
              ดาวน์โหลดเนื้อหาบทเรียนที่แก้ไข ลิงก์วิดีโอ รายชื่อผู้เรียน และประวัติคะแนนเก็บทั้งหมดเป็นไฟล์ <code>.json</code> สำหรับสำรองไว้หรือนำไปส่งต่อให้เครื่องอื่น
            </p>
            <button onclick="App.exportCourseData()" class="px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold transition flex items-center gap-1.5">
              <i data-lucide="file-down" class="w-4 h-4"></i> ดาวน์โหลดไฟล์สำรองข้อมูล (JSON)
            </button>
          </div>

          <!-- 2. Import Data -->
          <div class="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
            <div class="flex items-center gap-2">
              <i data-lucide="upload" class="w-4 h-4 text-sky-400"></i>
              <div class="font-bold text-white text-sm">นำเข้าข้อมูลจากไฟล์ (Import JSON)</div>
            </div>
            <p class="text-slate-400 leading-relaxed">
              อัปเดตหลักสูตร วิดีโอ หรือเรียกคืนคะแนนเก็บ โดยเลือกไฟล์สำรองข้อมูล <code>.json</code> ที่เคยส่งออกไว้
            </p>
            <button onclick="document.getElementById('import-json-input').click()" class="px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold transition flex items-center gap-1.5">
              <i data-lucide="file-up" class="w-4 h-4"></i> เลือกไฟล์เพื่อนำเข้าข้อมูล
            </button>
          </div>

          <!-- 3. Reset All -->
          <div class="p-4 bg-rose-950/20 border border-rose-900/40 rounded-2xl space-y-2">
            <div class="flex items-center gap-2">
              <i data-lucide="alert-triangle" class="w-4 h-4 text-rose-400"></i>
              <div class="font-bold text-rose-300 text-sm">คืนค่าระบบทั้งหมดเป็นค่าเริ่มต้น (Reset All)</div>
            </div>
            <p class="text-slate-400 leading-relaxed">
              ล้างเนื้อหาที่เคยแก้ไขและรีเซ็ตคะแนนทั้งหมดให้กลับสู่สภาพเริ่มต้นจากโรงงาน
            </p>
            <button onclick="App.resetAllData()" class="px-3.5 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/30 font-semibold transition">
              คืนค่าทั้งหมดเป็นค่าเริ่มต้น
            </button>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  closeBackupModal() {
    const modal = document.getElementById("backup-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  // ส่งออกข้อมูลทั้งหมดเป็น JSON
  exportCourseData() {
    const customUnits = localStorage.getItem(this.CUSTOM_UNITS_KEY) || "{}";
    const users = localStorage.getItem(this.USERS_STORAGE_KEY) || "[]";

    const exportBundle = {
      version: "2.0",
      exportedAt: new Date().toISOString(),
      courseCode: "20105-2013",
      courseName: "อิเล็กทรอนิกส์กำลัง (Power Electronics)",
      customUnits: JSON.parse(customUnits),
      users: JSON.parse(users)
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportBundle, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `power_elec_backup_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    if (this.state.soundEnabled) this.playSuccessFanfare();
    alert("ส่งออกไฟล์สำรองข้อมูลเรียบร้อยแล้ว!");
  },

  // นำเข้าข้อมูลจากไฟล์ JSON
  handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);
        if (data.customUnits) {
          localStorage.setItem(this.CUSTOM_UNITS_KEY, JSON.stringify(data.customUnits));
        }
        if (data.users && Array.isArray(data.users)) {
          localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(data.users));
        }

        alert("นำเข้าข้อมูลจากไฟล์สำเร็จ! กำลังรีโหลดหน้าเว็บเพื่อปรับใช้ข้อมูล...");
        window.location.reload();
      } catch (err) {
        alert("ไฟล์ JSON ไม่ถูกต้องหรือเสียหาย กรุณาตรวจสอบไฟล์อีกครั้ง");
      }
    };
    reader.readAsText(file);
  },

  resetAllData() {
    if (!confirm("⚠️ คำเตือน: การคืนค่าเริ่มต้นจะล้างเนื้อหาที่เคยแก้ไขและคะแนนเก็บทั้งหมด ท่านต้องการดำเนินการต่อหรือไม่?")) return;
    localStorage.removeItem(this.CUSTOM_UNITS_KEY);
    localStorage.removeItem(this.USERS_STORAGE_KEY);
    localStorage.removeItem(this.CURRENT_USER_ID_KEY);
    alert("รีเซ็ตระบบเป็นค่าเริ่มต้นเรียบร้อยแล้ว กำลังเริ่มระบบใหม่...");
    window.location.reload();
  },

  // 7. หน้าศูนย์รวมแบบฝึกหัดครบ 10 หน่วย (100 ข้อ)
  renderAllQuizzesView(container) {
    const units = this.getUnits();
    container.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
              <i data-lucide="clipboard-list" class="w-5 h-5"></i>
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-white">ศูนย์แบบฝึกหัดท้ายบทเรียน (100 ข้อ)</h1>
              <p class="text-xs text-slate-400">แบบฝึกหัดวัดผลการเรียนรู้ 10 หน่วยการเรียนรู้ หน่วยละ 10 ข้อ รวม 100 ข้อ</p>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          ${units.map((u) => {
            const isDone = this.state.submittedQuizzes[u.id];
            const score = this.state.quizScores[u.id] || 0;
            return `
              <div class="p-5 bg-slate-900/80 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                <div class="flex items-center gap-3">
                  <span class="w-9 h-9 rounded-xl bg-slate-800 text-sky-400 font-bold text-sm flex items-center justify-center shrink-0">
                    ${u.id}
                  </span>
                  <div>
                    <h4 class="text-sm font-bold text-white">${u.title}</h4>
                    <div class="text-xs text-slate-400">10 ข้อ • ปรนัย 4 ตัวเลือก</div>
                  </div>
                </div>
                <div class="flex items-center gap-3 shrink-0">
                  ${isDone ? `
                    <span class="px-2.5 py-1 rounded-lg text-xs font-bold ${score >= 8 ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-400 border border-amber-800'}">
                      ${score}/10 คะแนน
                    </span>
                  ` : `
                    <span class="text-xs text-slate-500">ยังไม่ทำ</span>
                  `}
                  <button onclick="App.navigateToUnit(${u.id}); setTimeout(() => { document.getElementById('quiz-anchor')?.scrollIntoView({behavior: 'smooth'}); }, 200);" class="px-3 py-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs transition">
                    ${isDone ? 'ดูผล / ทำใหม่' : 'ทำข้อสอบ'}
                  </button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      </div>
    `;
  },

  // 8. หน้าห้องทดลองจำลองวงจรเสมือนจริง (Interactive Lab)
  renderSimulatorsView(container) {
    container.innerHTML = `
      <div class="space-y-8 animate-fadeIn">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
              <i data-lucide="cpu" class="w-5 h-5"></i>
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-white">ห้องทดลองเสมือนจริง (Interactive Simulators)</h1>
              <p class="text-xs text-slate-400">ทดลองปรับค่าพารามิเตอร์ของวงจรอิเล็กทรอนิกส์กำลังแบบเรียลไทม์ พร้อมดูรูปคลื่นและผลการคำนวณ</p>
            </div>
          </div>
        </div>

        <!-- 1. SCR Firing Angle Simulator -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span class="text-xs font-bold text-sky-400 uppercase tracking-wider">แบบจำลองที่ 1</span>
              <h3 class="text-lg font-bold text-white">การควบคุมมุมจุดชนวน SCR (Firing Angle Control : α)</h3>
            </div>
            <div class="flex items-center gap-4 text-xs">
              <div>มุมจุดชนวน α: <span id="scr-alpha-val" class="font-bold text-amber-400 text-sm">60°</span></div>
              <div>มุมนำกระแส θ: <span id="scr-theta-val" class="font-bold text-sky-400 text-sm">120°</span></div>
              <div>แรงดันเฉลี่ย Vdc: <span id="scr-vdc-val" class="font-bold text-emerald-400 text-sm">74.2 V</span></div>
              <div>แรงดัน RMS: <span id="scr-vrms-val" class="font-bold text-purple-400 text-sm">137.5 V</span></div>
            </div>
          </div>

          <div class="bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-4 flex justify-center">
            <canvas id="scr-canvas" width="600" height="180" class="w-full max-w-2xl h-44 rounded-lg bg-slate-950"></canvas>
          </div>

          <div class="space-y-2 max-w-xl mx-auto">
            <div class="flex justify-between text-xs text-slate-400">
              <span>0° (นำกระแสเต็มคลื่น)</span>
              <span>ปรับมุมจุดชนวน (α)</span>
              <span>180° (ไม่นำกระแสเลย)</span>
            </div>
            <input id="scr-alpha-slider" type="range" min="0" max="180" value="60" class="w-full accent-sky-400 cursor-pointer" />
          </div>
        </div>

        <!-- 2. DC-DC Converter Simulator -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span class="text-xs font-bold text-emerald-400 uppercase tracking-wider">แบบจำลองที่ 2</span>
              <h3 class="text-lg font-bold text-white">แบบจำลอง DC-DC Buck / Boost Converter</h3>
            </div>
            <div class="flex items-center gap-4 text-xs">
              <div>Duty Cycle (D): <span id="dcdc-duty-val" class="font-bold text-sky-400 text-sm">50%</span></div>
              <div>แรงดันเอาต์พุต Vout: <span id="dcdc-vout-val" class="font-bold text-emerald-400 text-sm">12.0 V</span></div>
              <div>อัตราขยายแรงดัน: <span id="dcdc-gain-val" class="font-bold text-purple-400 text-sm">0.50x</span></div>
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <label class="block text-xs text-slate-400 mb-1">เลือกชนิดโทโปโลยี (Topology)</label>
              <select id="dcdc-type" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200">
                <option value="buck">Buck Converter (Step-Down ลดแรงดัน)</option>
                <option value="boost">Boost Converter (Step-Up เพิ่มแรงดัน)</option>
                <option value="buck-boost">Buck-Boost Converter (กลับขั้ว)</option>
              </select>
            </div>
            <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <label class="block text-xs text-slate-400 mb-1">แรงดันอินพุต (Vin : โวลต์)</label>
              <input id="dcdc-vin" type="number" value="24" class="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-xs text-slate-200" />
            </div>
            <div class="p-3 bg-slate-950 border border-slate-800 rounded-xl">
              <label class="block text-xs text-slate-400 mb-1">สูตรคำนวณที่ใช้</label>
              <div id="dcdc-formula" class="font-mono text-xs font-bold text-sky-300 pt-1">Vout = D × Vin</div>
            </div>
          </div>

          <div class="bg-slate-950 rounded-2xl p-4 border border-slate-800 mb-4 flex justify-center">
            <canvas id="dcdc-canvas" width="600" height="150" class="w-full max-w-2xl h-36 rounded-lg bg-slate-950"></canvas>
          </div>

          <div class="space-y-2 max-w-xl mx-auto">
            <div class="flex justify-between text-xs text-slate-400">
              <span>0% (สวิตช์ปิดตลอด)</span>
              <span>ปรับ Duty Cycle (D)</span>
              <span>90% (สวิตช์เปิดนานสุด)</span>
            </div>
            <input id="dcdc-duty" type="range" min="5" max="90" value="50" class="w-full accent-emerald-400 cursor-pointer" />
          </div>
        </div>

        <!-- 3. Light Dimmer Interactive Simulation -->
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
          <div class="flex flex-wrap items-center justify-between gap-4 mb-4">
            <div>
              <span class="text-xs font-bold text-amber-400 uppercase tracking-wider">แบบจำลองที่ 3</span>
              <h3 class="text-lg font-bold text-white">แบบจำลองการหรี่แสงหลอดไฟด้วยวงจรตัดมุมเฟส (Dimmer)</h3>
            </div>
            <div class="flex items-center gap-4 text-xs">
              <div>ความสว่างหลอดไฟ: <span id="dimmer-power-percent" class="font-bold text-amber-400 text-sm">70%</span></div>
              <div>มุมตัดคลื่นเฟส (α): <span id="dimmer-cut-angle" class="font-bold text-sky-400 text-sm">54°</span></div>
            </div>
          </div>

          <div class="flex flex-col md:flex-row items-center justify-center gap-8 py-6">
            <div class="flex flex-col items-center">
              <div id="dimmer-lamp-glow" class="w-24 h-24 rounded-full border-2 border-amber-500/50 bg-amber-400/70 flex items-center justify-center transition-all duration-150" style="box-shadow: 0 0 35px 18px rgba(245, 158, 11, 0.7);">
                <i data-lucide="lightbulb" class="w-12 h-12 text-slate-950"></i>
              </div>
              <span class="text-xs font-semibold text-slate-300 mt-3">หลอดไส้ 220V 100W</span>
            </div>

            <div class="w-full max-w-md space-y-3">
              <label class="block text-xs text-slate-300 font-medium">หมุนโพเทนชิโอมิเตอร์ปรับความสว่าง (VR Knob):</label>
              <input id="dimmer-slider" type="range" min="0" max="100" value="70" class="w-full accent-amber-400 cursor-pointer" />
              <div class="flex justify-between text-[11px] text-slate-500">
                <span>0% (ดับสนิท α=180°)</span>
                <span>50%</span>
                <span>100% (สว่างจ้า α=0°)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    setTimeout(() => {
      Simulators.initScrSimulator();
      Simulators.initDcDcSimulator();
      Simulators.initDimmerSimulator();
    }, 50);
  },

  // 9. หน้ารวมสูตรคำนวณสรุป (Formula Cheat Sheet)
  renderFormulasView(container) {
    const units = this.getUnits();
    container.innerHTML = `
      <div class="space-y-6 animate-fadeIn">
        <div class="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8">
          <div class="flex items-center gap-3 mb-2">
            <div class="w-10 h-10 rounded-xl bg-purple-500/20 flex items-center justify-center text-purple-400">
              <i data-lucide="calculator" class="w-5 h-5"></i>
            </div>
            <div>
              <h1 class="text-2xl md:text-3xl font-extrabold text-white">คลังสูตรคำนวณวิศวกรรมอิเล็กทรอนิกส์กำลัง</h1>
              <p class="text-xs text-slate-400">สรุปสูตรคำนวณสำคัญครบทั้ง 10 หน่วยการเรียนรู้สำหรับเตรียมสอบและปฏิบัติงานจริง</p>
            </div>
          </div>
        </div>

        <div class="space-y-6">
          ${units.map((u) => `
            <div class="bg-slate-900/80 border border-slate-800 rounded-2xl p-5">
              <div class="flex items-center gap-2 mb-3">
                <span class="w-6 h-6 rounded-lg bg-sky-500/20 text-sky-400 text-xs font-bold flex items-center justify-center">${u.id}</span>
                <h3 class="text-base font-bold text-white">${u.title}</h3>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                ${(u.formulas || []).map((f) => `
                  <div class="p-3 bg-slate-950 border border-slate-800/80 rounded-xl">
                    <div class="text-[11px] font-semibold text-slate-400 mb-1">${f.name}</div>
                    <div class="text-sm font-bold text-sky-300 py-1 font-mono">\\(${f.formula}\\)</div>
                    <div class="text-[10px] text-slate-500 mt-1">${f.note}</div>
                  </div>
                `).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  },

  // 10. หน้าต่างลงทะเบียน / เข้าสู่ระบบ (Auth Modal)
  openAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const modalBody = document.getElementById("auth-modal-body");
    if (!modalBody) return;

    const currentU = this.state.currentUser;

    modalBody.innerHTML = `
      <div class="p-6 md:p-8 space-y-6">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-xl bg-sky-500/20 flex items-center justify-center text-sky-400">
              <i data-lucide="user" class="w-4 h-4"></i>
            </div>
            <div>
              <h3 class="text-base font-bold text-white">ระบบลงทะเบียนและเข้าใช้งาน</h3>
              <p class="text-[11px] text-slate-400">บันทึกข้อมูลเพื่อติดตามคะแนนเก็บและประวัติการเรียน</p>
            </div>
          </div>
          <button onclick="App.closeAuthModal()" class="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition">
            <i data-lucide="x" class="w-4 h-4"></i>
          </button>
        </div>

        <div class="flex p-1 bg-slate-950 rounded-xl border border-slate-800 text-xs font-semibold">
          <button id="auth-tab-login" onclick="App.switchAuthTab('login')" class="flex-1 py-2 rounded-lg bg-sky-500 text-slate-950 font-bold transition">เข้าสู่ระบบ / สลับบัญชี</button>
          <button id="auth-tab-register" onclick="App.switchAuthTab('register')" class="flex-1 py-2 rounded-lg text-slate-400 hover:text-white transition">ลงทะเบียนผู้เรียนใหม่</button>
        </div>

        <div id="auth-pane-login" class="space-y-4">
          <div>
            <label class="block text-xs font-semibold text-slate-300 mb-2">เลือกบัญชีที่บันทึกไว้ในเครื่องนี้:</label>
            <div class="space-y-2 max-h-44 overflow-y-auto pr-1">
              ${this.state.users.map((u) => {
                const isCurrent = currentU && currentU.id === u.id;
                let userScore = 0;
                Object.values(u.quizScores || {}).forEach(s => userScore += s);

                return `
                  <div class="p-3 rounded-xl border flex items-center justify-between gap-3 transition ${
                    isCurrent ? 'bg-sky-500/10 border-sky-500/40 text-white' : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  }">
                    <div class="flex items-center gap-2.5 truncate">
                      <div class="w-7 h-7 rounded-lg bg-gradient-to-tr from-sky-500 to-cyan-400 text-slate-950 font-bold text-xs flex items-center justify-center shrink-0">
                        ${u.name.charAt(0) || 'น'}
                      </div>
                      <div class="truncate">
                        <div class="text-xs font-bold truncate">${u.name}</div>
                        <div class="text-[10px] text-slate-400 font-mono">${u.studentId} • คะแนน: <span class="text-amber-400 font-bold">${userScore}/100</span></div>
                      </div>
                    </div>
                    <div>
                      ${isCurrent ? `
                        <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">กำลังใช้งาน</span>
                      ` : `
                        <button onclick="App.switchUser('${u.id}')" class="px-2.5 py-1 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 text-[11px] font-bold transition">สลับ</button>
                      `}
                    </div>
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <div class="relative flex py-1 items-center">
            <div class="flex-grow border-t border-slate-800"></div>
            <span class="flex-shrink mx-3 text-[10px] text-slate-500 uppercase">หรือเข้าสู่ระบบด้วยรหัสนักศึกษา</span>
            <div class="flex-grow border-t border-slate-800"></div>
          </div>

          <form onsubmit="event.preventDefault(); App.loginUser(document.getElementById('login-id').value, document.getElementById('login-pin').value);" class="space-y-3">
            <div>
              <label class="block text-xs text-slate-300 mb-1">รหัสประจำตัวนักศึกษา (Student ID):</label>
              <input id="login-id" type="text" placeholder="เช่น 6620105001" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono" />
            </div>
            <div>
              <label class="block text-xs text-slate-300 mb-1">รหัสผ่าน / PIN 4 หลัก (ค่าเริ่มต้น 1234):</label>
              <input id="login-pin" type="password" placeholder="1234" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-sky-400 font-mono" />
            </div>
            <button type="submit" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-sky-500 to-cyan-500 hover:from-sky-400 hover:to-cyan-400 text-slate-950 font-bold text-xs transition">
              เข้าสู่ระบบ
            </button>
          </form>
        </div>

        <div id="auth-pane-register" class="space-y-3 hidden">
          <form onsubmit="event.preventDefault(); App.registerNewUser({
            studentId: document.getElementById('reg-id').value,
            name: document.getElementById('reg-name').value,
            department: document.getElementById('reg-dept').value,
            classGroup: document.getElementById('reg-class').value,
            pin: document.getElementById('reg-pin').value
          });" class="space-y-3 text-xs">
            <div>
              <label class="block text-slate-300 mb-1 font-semibold">รหัสประจำตัวนักศึกษา <span class="text-rose-400">*</span>:</label>
              <input id="reg-id" type="text" placeholder="เช่น 6620105002" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono" />
            </div>
            <div>
              <label class="block text-slate-300 mb-1 font-semibold">คำนำหน้า ชื่อ - สกุล <span class="text-rose-400">*</span>:</label>
              <input id="reg-name" type="text" placeholder="เช่น นายวีรภัทร ช่างไฟฟ้า" required class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400" />
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-slate-300 mb-1 font-semibold">แผนกวิชา:</label>
                <select id="reg-dept" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-2 py-2 text-white focus:outline-none focus:border-sky-400">
                  <option value="สาขาวิชาช่างอิเล็กทรอนิกส์">ช่างอิเล็กทรอนิกส์</option>
                  <option value="สาขาวิชาช่างไฟฟ้ากำลัง">ช่างไฟฟ้ากำลัง</option>
                  <option value="สาขาวิชาช่างเทคนิคคอมพิวเตอร์">ช่างเทคนิคคอมพิวเตอร์</option>
                  <option value="สาขาวิชาเมคคาทรอนิกส์">เมคคาทรอนิกส์</option>
                </select>
              </div>
              <div>
                <label class="block text-slate-300 mb-1 font-semibold">ระดับชั้น / กลุ่ม:</label>
                <input id="reg-class" type="text" placeholder="เช่น ปวช. 2 กลุ่ม 1" value="ปวช. 2 กลุ่ม 1" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400" />
              </div>
            </div>
            <div>
              <label class="block text-slate-300 mb-1 font-semibold">รหัสผ่าน / PIN 4 หลัก:</label>
              <input id="reg-pin" type="password" value="1234" maxlength="6" class="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-sky-400 font-mono" />
            </div>
            <button type="submit" class="w-full py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs transition mt-2">
              ยืนยันการลงทะเบียนผู้เรียนใหม่
            </button>
          </form>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  switchAuthTab(tab) {
    const tabLogin = document.getElementById("auth-tab-login");
    const tabRegister = document.getElementById("auth-tab-register");
    const paneLogin = document.getElementById("auth-pane-login");
    const paneRegister = document.getElementById("auth-pane-register");

    if (!tabLogin || !tabRegister || !paneLogin || !paneRegister) return;

    if (tab === "login") {
      tabLogin.classList.add("bg-sky-500", "text-slate-950", "font-bold");
      tabLogin.classList.remove("text-slate-400");
      tabRegister.classList.remove("bg-sky-500", "text-slate-950", "font-bold");
      tabRegister.classList.add("text-slate-400");

      paneLogin.classList.remove("hidden");
      paneRegister.classList.add("hidden");
    } else {
      tabRegister.classList.add("bg-sky-500", "text-slate-950", "font-bold");
      tabRegister.classList.remove("text-slate-400");
      tabLogin.classList.remove("bg-sky-500", "text-slate-950", "font-bold");
      tabLogin.classList.add("text-slate-400");

      paneRegister.classList.remove("hidden");
      paneLogin.classList.add("hidden");
    }
  },

  closeAuthModal() {
    const modal = document.getElementById("auth-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  // 11. หน้าต่างใบประกาศนียบัตร (Certificate of Completion Modal)
  openCertificateModal() {
    const u = this.state.currentUser;
    let totalScore = 0;
    const totalDone = Object.keys(this.state.submittedQuizzes).length;
    Object.values(this.state.quizScores).forEach(s => totalScore += s);

    const modal = document.getElementById("certificate-modal");
    if (!modal) return;

    modal.classList.remove("hidden");
    modal.classList.add("flex");

    const modalBody = document.getElementById("certificate-modal-body");
    if (!modalBody) return;

    const isQualified = totalScore >= 80;
    const currentDate = new Date().toLocaleDateString("th-TH", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });

    modalBody.innerHTML = `
      <div class="p-6 md:p-8 space-y-6">
        <div class="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div class="flex items-center gap-3">
            <label class="text-xs text-slate-300 font-semibold">ชื่อ-นามสกุล ผู้รับใบประกาศฯ:</label>
            <input id="cert-student-name" type="text" value="${u ? u.name : this.state.studentName}" onchange="App.updateStudentName(this.value)" class="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-medium focus:border-amber-400 focus:outline-none" />
          </div>
          <div class="flex items-center gap-2">
            <button onclick="App.printCertificate()" class="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition">
              <i data-lucide="printer" class="w-4 h-4"></i> พิมพ์ / บันทึก PDF
            </button>
            <button onclick="App.closeCertificateModal()" class="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition">
              <i data-lucide="x" class="w-4 h-4"></i>
            </button>
          </div>
        </div>

        ${!isQualified ? `
          <div class="p-4 bg-amber-950/40 border border-amber-500/50 rounded-2xl text-xs text-amber-200">
            <strong>คำแนะนำ:</strong> ปัจจุบันท่านทำแบบฝึกหัดได้ <strong>${totalScore} / 100 คะแนน</strong> (ทำแล้ว ${totalDone}/10 หน่วย) เกณฑ์ในการได้รับใบรับรองสมรรถนะมาตรฐานคือ <strong>80 คะแนนขึ้นไป</strong> ท่านยังสามารถฝึกฝนและทำแบบฝึกหัดซ้ำในแต่ละหน่วยเพื่อปรับคะแนนให้ถึงเกณฑ์ได้
          </div>
        ` : ""}

        <!-- Printable Certificate Card -->
        <div id="printable-certificate" class="relative bg-white text-slate-900 p-8 md:p-12 rounded-3xl border-8 border-amber-600/40 shadow-2xl overflow-hidden font-serif">
          <div class="absolute top-2 left-2 w-12 h-12 border-t-4 border-l-4 border-amber-600 pointer-events-none"></div>
          <div class="absolute top-2 right-2 w-12 h-12 border-t-4 border-r-4 border-amber-600 pointer-events-none"></div>
          <div class="absolute bottom-2 left-2 w-12 h-12 border-b-4 border-l-4 border-amber-600 pointer-events-none"></div>
          <div class="absolute bottom-2 right-2 w-12 h-12 border-b-4 border-r-4 border-amber-600 pointer-events-none"></div>

          <div class="text-center space-y-4">
            <div class="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500 to-amber-700 flex items-center justify-center text-white shadow-lg">
              <i data-lucide="award" class="w-9 h-9"></i>
            </div>

            <div class="text-xs uppercase tracking-widest text-amber-800 font-sans font-bold">
              สำนักงานคณะกรรมการการอาชีวศึกษา • ศูนย์ประเมินสมรรถนะวิชาชีพ
            </div>

            <h2 class="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-wide font-sans">
              ใบประกาศนียบัตรสำเร็จการศึกษา
            </h2>
            <div class="text-xs text-slate-600 font-sans">
              CERTIFICATE OF VOCATIONAL COMPETENCY COMPLETION
            </div>

            <div class="py-4">
              <p class="text-xs text-slate-600 font-sans">ใบประกาศนียบัตรฉบับนี้มอบให้แก่</p>
              <div id="cert-display-name" class="text-2xl md:text-3xl font-bold text-amber-900 border-b-2 border-slate-400 inline-block px-8 py-1 my-2">
                ${u ? u.name : this.state.studentName}
              </div>
              <div class="text-xs text-slate-500 font-sans font-mono mb-2">รหัสประจำตัว: ${u ? u.studentId : ''}</div>
              <p class="text-xs text-slate-600 font-sans max-w-lg mx-auto leading-relaxed mt-1">
                ได้ผ่านการศึกษาและประเมินผลการเรียนรู้ครบถ้วนทั้ง 10 หน่วยการเรียนรู้
                <br><strong>รายวิชา อิเล็กทรอนิกส์กำลัง (รหัสวิชา 20105-2013)</strong>
                <br>หลักสูตรประกาศนียบัตรวิชาชีพ (ปวช.) ${u ? u.department : 'สาขาวิชาช่างอิเล็กทรอนิกส์'}
              </p>
            </div>

            <div class="inline-flex items-center gap-6 p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs font-sans">
              <div>ผลคะแนนรวม: <strong class="text-amber-800 text-sm">${totalScore} / 100</strong></div>
              <div class="w-px h-4 bg-amber-300"></div>
              <div>ระดับผลการเรียน: <strong class="text-emerald-700 text-sm">${totalScore >= 80 ? 'เกรด 4.0 (ดีเยี่ยม)' : 'เกรด 3.0 (ดี)'}</strong></div>
              <div class="w-px h-4 bg-amber-300"></div>
              <div>วันที่ออกใบประกาศฯ: <strong class="text-slate-700">${currentDate}</strong></div>
            </div>

            <div class="grid grid-cols-2 gap-8 pt-8 font-sans text-xs text-slate-600">
              <div class="text-center">
                <div class="w-36 border-b border-slate-500 mx-auto mb-1"></div>
                <div class="font-bold text-slate-800">หัวหน้าแผนกวิชาช่างอิเล็กทรอนิกส์</div>
                <div class="text-[10px] text-slate-500">กรรมการประเมินมาตรฐานวิชาชีพ</div>
              </div>
              <div class="text-center">
                <div class="w-36 border-b border-slate-500 mx-auto mb-1"></div>
                <div class="font-bold text-slate-800">ผู้อำนวยการวิทยาลัย</div>
                <div class="text-[10px] text-slate-500">ประธานคณะกรรมการสถานศึกษา</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    if (window.lucide) lucide.createIcons();
  },

  printCertificate() {
    document.body.classList.remove("printing-gradebook");
    document.body.classList.add("printing-certificate");
    window.print();
    setTimeout(() => {
      document.body.classList.remove("printing-certificate");
    }, 1000);
  },

  updateStudentName(name) {
    const cleanName = name.trim() || "นักศึกษา";
    this.state.studentName = cleanName;
    if (this.state.currentUser) {
      this.state.currentUser.name = cleanName;
      this.saveUsers();
      this.renderUserHeader();
      this.renderSidebarStudentCard();
    }
    const displayName = document.getElementById("cert-display-name");
    if (displayName) displayName.textContent = cleanName;
  },

  closeCertificateModal() {
    const modal = document.getElementById("certificate-modal");
    if (modal) {
      modal.classList.add("hidden");
      modal.classList.remove("flex");
    }
  },

  updateGlobalProgress() {
    const totalDone = Object.keys(this.state.submittedQuizzes).length;
    const percent = Math.round((totalDone / 10) * 100);

    const progressBar = document.getElementById("global-progress-bar");
    const progressText = document.getElementById("global-progress-text");

    if (progressBar) progressBar.style.width = percent + "%";
    if (progressText) progressText.textContent = `${percent}% (${totalDone}/10 หน่วย)`;
  },

  handleSearch() {
    const query = this.state.searchTerm;
    if (!query) {
      this.renderSidebar();
      return;
    }

    const units = this.getUnits();
    const matchedUnits = units.filter((u) => {
      return (
        u.title.toLowerCase().includes(query) ||
        u.enTitle.toLowerCase().includes(query) ||
        u.summary.toLowerCase().includes(query) ||
        (u.objectives || []).some(o => o.toLowerCase().includes(query))
      );
    });

    const list = document.getElementById("sidebar-units-list");
    if (!list) return;

    if (matchedUnits.length === 0) {
      list.innerHTML = `<li class="p-3 text-xs text-slate-500 text-center">ไม่พบบทเรียนที่ตรงกับ "${query}"</li>`;
      return;
    }

    list.innerHTML = matchedUnits.map((u) => `
      <li>
        <button onclick="App.navigateToUnit(${u.id})" class="w-full text-left px-3 py-2 rounded-xl text-xs flex items-center gap-2 hover:bg-slate-800 text-slate-300">
          <span class="w-5 h-5 rounded bg-sky-500/20 text-sky-400 font-bold flex items-center justify-center text-[10px] shrink-0">${u.id}</span>
          <span class="truncate">${u.title}</span>
        </button>
      </li>
    `).join("");
  },

  renderMath() {
    if (window.renderMathInElement) {
      try {
        renderMathInElement(document.body, {
          delimiters: [
            { left: "$$", right: "$$", display: true },
            { left: "\\[", right: "\\]", display: true },
            { left: "\\(", right: "\\)", display: false },
            { left: "$", right: "$", display: false }
          ],
          throwOnError: false
        });
      } catch (err) {
        console.warn("KaTeX render error:", err);
      }
    }
  },

  // Web Audio Synthesizer Sounds
  playTickSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    } catch (e) {}
  },

  playSuccessFanfare() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const notes = [523.25, 659.25, 783.99, 1046.50];
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.06, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + idx * 0.1 + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.35);
      });
    } catch (e) {}
  },

  playSimpleCompleteSound() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.2);
    } catch (e) {}
  }
};

// Start application when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  App.init();
});

window.addEventListener("load", () => {
  App.renderMath();
  if (window.lucide) lucide.createIcons();
});
