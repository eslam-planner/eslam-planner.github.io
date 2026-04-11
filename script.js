// 1. PWA & Update Notification
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferredPrompt = e; const installBtn = document.getElementById('installAppBtn'); if(installBtn) installBtn.style.display = 'inline-flex'; });
document.addEventListener('DOMContentLoaded', () => { 
    const installBtn = document.getElementById('installAppBtn'); 
    if(installBtn) { installBtn.addEventListener('click', async () => { if (deferredPrompt) { deferredPrompt.prompt(); const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') installBtn.style.display = 'none'; deferredPrompt = null; } }); } 
});
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').then(reg => { reg.onupdatefound = () => { const installingWorker = reg.installing; installingWorker.onstatechange = () => { if (installingWorker.state === 'installed' && navigator.serviceWorker.controller) { document.getElementById('updateToast').classList.add('show'); } }; }; }).catch(e=>console.log(e)); }

// 2. Firebase Cloud Sync
const firebaseConfig = {
    apiKey: "AIzaSyA2Vx78wtKKzQ0dcWkIRw2Jl-mjHyWdp5A",
    authDomain: "eslam-planner.firebaseapp.com",
    projectId: "eslam-planner",
    storageBucket: "eslam-planner.appspot.com",
    messagingSenderId: "334354781516",
    appId: "1:334354781516:web:d7d3b13ba7157d617d2be9",
};

let useCloud = false, auth, db, currentUser = null;
if (firebaseConfig.apiKey && firebaseConfig.apiKey.length > 10 && firebaseConfig.apiKey !== "ضع_مفتاحك_هنا") {
    firebase.initializeApp(firebaseConfig); auth = firebase.auth(); db = firebase.firestore(); useCloud = true;
    db.enablePersistence().catch(err => console.log("Offline error:", err));
    auth.onAuthStateChanged(user => {
        const cloudStatus = document.getElementById('cloudStatus');
        if (user) {
            currentUser = user;
            if(cloudStatus) cloudStatus.innerHTML = `<span style="color:var(--success); font-weight:bold;"><i class="fa-solid fa-cloud-check"></i> ${currentLang === 'ar' ? 'متصل كـ:' : 'Connected as:'} ${user.email}</span> <button onclick="logoutCloud()" class="btn btn-secondary" style="padding:5px 10px; font-size:0.8rem; color: var(--danger);">${currentLang === 'ar' ? 'خروج آمن' : 'Logout'}</button>`;
            loadFromCloud();
        } else {
            currentUser = null;
            if(cloudStatus) cloudStatus.innerHTML = `<span style="color:var(--text-muted);"><i class="fa-solid fa-cloud-arrow-up"></i> ${currentLang === 'ar' ? 'غير متصل' : 'Offline'}</span> <button onclick="document.getElementById('authModal').classList.add('show')" class="btn btn-primary" style="padding:5px 10px; font-size:0.85rem;">${currentLang === 'ar' ? 'دخول للمزامنة' : 'Login to Sync'}</button>`;
        }
    });
}

// ----------------------------------------
// قاموس الترجمة المحدث (شامل لكل النوافذ والأزرار)
// ----------------------------------------
const i18n = {
    ar: {
        nav_dash: "لوحة التحكم", nav_month: "خطة الشهر", nav_today: "اليوم", nav_pomodoro: "مؤقت التركيز", nav_kanban: "المشاريع", nav_habits: "متتبع العادات", nav_finance: "المتتبع المالي", nav_lib: "مكتبة المراجع", nav_notes: "الملاحظات", nav_settings: "الإعدادات والمزامنة",
        btn_invite: "دعوة", btn_install: "تثبيت التطبيق",
        title_dash: "لوحة التحكم والإحصائيات", btn_clear_comp: "مسح المكتملة", btn_clear_today: "مسح مهام اليوم", btn_hide_dash: "إخفاء مهام اليوم", btn_reset_stats: "تصفير الإحصائيات",
        card_tasks: "المهام اليوم", card_bal: "الرصيد المتاح", card_habits: "إنجاز العادات",
        title_finance: "المتتبع المالي", btn_add_trans: "معاملة", fin_inc: "الدخل", fin_exp: "المصروفات", fin_bal: "الرصيد", btn_edit_trans: "تعديل المعاملة",
        title_lib: "المراجع والأصول", btn_add_ref: "إضافة مرجع", lib_dictate_hint: "المحتوى",
        btn_prev: "السابق", btn_next: "التالي",
        title_today: "جدول اليوم", btn_add: "إضافة", btn_edit_task: "تعديل المهمة", btn_update: "تحديث",
        title_pom: "مؤقت التركيز (Pomodoro)", btn_work: "عمل", btn_break: "استراحة", btn_start: "ابدأ", btn_pause: "إيقاف مؤقت", btn_reset: "إعادة", btn_stop_alarm: "إيقاف الرنين",
        title_kanban: "لوحة المشاريع", kb_todo: "💡 أفكار/مهام", kb_inprog: "⏳ التنفيذ", kb_done: "✅ مكتملة",
        title_habits: "متتبع العادات", 
        title_notes: "الملاحظات", btn_add_note: "إضافة ملاحظة",
        title_settings: "الإعدادات والمزامنة", label_name: "الاسم", btn_save_local: "حفظ البيانات محلياً",
        title_appearance: "المظهر والألوان 🎨",
        title_sync: "المزامنة السحابية الحية ☁️", sync_desc: "عند تسجيل الخروج سيتم مسح بياناتك من هذا الجهاز لضمان السرية، وستبقى آمنة في حسابك.",
        title_backup: "النسخ الاحتياطي اليدوي", btn_download: "تنزيل البيانات", btn_restore: "استرجاع ملف",
        chart_done: "مكتملة", chart_pend: "غير مكتملة", btn_cancel: "إلغاء", btn_save: "حفظ", title_login: "تسجيل الدخول للمزامنة"
    },
    en: {
        nav_dash: "Dashboard", nav_month: "Monthly Plan", nav_today: "Today", nav_pomodoro: "Focus Timer", nav_kanban: "Projects", nav_habits: "Habit Tracker", nav_finance: "Finance", nav_lib: "Library", nav_notes: "Notes", nav_settings: "Settings & Sync",
        btn_invite: "Invite", btn_install: "Install App",
        title_dash: "Dashboard & Stats", btn_clear_comp: "Clear Completed", btn_clear_today: "Clear Today", btn_hide_dash: "Hide from Dash", btn_reset_stats: "Reset Stats",
        card_tasks: "Today's Tasks", card_bal: "Available Balance", card_habits: "Habits Rate",
        title_finance: "Finance Tracker", btn_add_trans: "Transaction", fin_inc: "Income", fin_exp: "Expense", fin_bal: "Balance", btn_edit_trans: "Edit Transaction",
        title_lib: "Library & Assets", btn_add_ref: "Add Reference", lib_dictate_hint: "Content",
        btn_prev: "Previous", btn_next: "Next",
        title_today: "Today's Schedule", btn_add: "Add Task", btn_edit_task: "Edit Task", btn_update: "Update",
        title_pom: "Focus Timer (Pomodoro)", btn_work: "Work", btn_break: "Break", btn_start: "Start", btn_pause: "Pause", btn_reset: "Reset", btn_stop_alarm: "Stop Alarm",
        title_kanban: "Projects Board", kb_todo: "💡 Ideas / To-Do", kb_inprog: "⏳ In Progress", kb_done: "✅ Done",
        title_habits: "Habit Tracker", 
        title_notes: "Notes", btn_add_note: "Add Note",
        title_settings: "Settings & Sync", label_name: "Name", btn_save_local: "Save Locally",
        title_appearance: "Appearance & Colors 🎨",
        title_sync: "Live Cloud Sync ☁️", sync_desc: "Logging out will securely wipe data from this device. It remains safe in your cloud account.",
        title_backup: "Manual Backup", btn_download: "Download Data", btn_restore: "Restore File",
        chart_done: "Completed", chart_pend: "Pending", btn_cancel: "Cancel", btn_save: "Save", title_login: "Login to Sync"
    }
};

let currentLang = localStorage.getItem('fp_lang') || 'ar';
function setLanguage(lang) {
    currentLang = lang; localStorage.setItem('fp_lang', lang);
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { const key = el.getAttribute('data-i18n'); if(i18n[lang][key]) el.innerHTML = i18n[lang][key]; });
    const toggleBtn = document.getElementById('langToggleBtn'); if(toggleBtn) toggleBtn.innerHTML = lang === 'ar' ? '<i class="fa-solid fa-language"></i> <span>EN</span>' : '<i class="fa-solid fa-language"></i> <span>AR</span>';
    const kbInp = document.getElementById('newKbItem'); if(kbInp) kbInp.placeholder = lang === 'ar' ? 'اكتب اسم المشروع / المهمة هنا...' : 'Type project / task name here...';
    const hbInp = document.getElementById('newHabitInput'); if(hbInp) hbInp.placeholder = lang === 'ar' ? 'عادة جديدة...' : 'New habit...';
    renderViews(); 
}

function initColorTheme() {
    let savedTheme = localStorage.getItem('fp_color_theme') || 'theme-green';
    if(savedTheme !== 'theme-green') document.documentElement.classList.add(savedTheme);
    document.querySelectorAll('.color-btn').forEach(btn => {
        if(btn.dataset.theme === savedTheme) btn.classList.add('active');
        btn.onclick = () => {
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            document.documentElement.classList.remove('theme-blue', 'theme-purple', 'theme-orange', 'theme-rose');
            let newTheme = btn.dataset.theme;
            if(newTheme !== 'theme-green') document.documentElement.classList.add(newTheme);
            localStorage.setItem('fp_color_theme', newTheme);
            renderDashboard();
        };
    });
}

let tasks = JSON.parse(localStorage.getItem('fp_tasks')) || []; let notes = JSON.parse(localStorage.getItem('fp_notes')) || []; let profile = JSON.parse(localStorage.getItem('fp_profile')) || { name: '', phone: '' }; let kanbanTasks = JSON.parse(localStorage.getItem('fp_kanban')) || { todo: [], inprogress: [], done: [] }; let habits = JSON.parse(localStorage.getItem('fp_habits')) || []; let finances = JSON.parse(localStorage.getItem('fp_finance')) || []; let library = JSON.parse(localStorage.getItem('fp_library')) || [];
const getTodayStr = () => { const d = new Date(); return new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; };
let currentTodayStr = getTodayStr(); let currentDailyDate = currentTodayStr; let currentMonthView = new Date().getMonth(); let currentYearView = new Date().getFullYear();
const monthNamesAr = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"]; const monthNamesEn = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
let myChart = null;

setInterval(() => { let checkDate = getTodayStr(); if (checkDate !== currentTodayStr) { currentTodayStr = checkDate; if(currentDailyDate === currentTodayStr) { document.getElementById('viewDailyDate').value = currentTodayStr; renderViews(); } } }, 60000);

function saveAll() {
    localStorage.setItem('fp_tasks', JSON.stringify(tasks)); localStorage.setItem('fp_notes', JSON.stringify(notes)); localStorage.setItem('fp_kanban', JSON.stringify(kanbanTasks)); localStorage.setItem('fp_habits', JSON.stringify(habits)); localStorage.setItem('fp_finance', JSON.stringify(finances)); localStorage.setItem('fp_library', JSON.stringify(library)); localStorage.setItem('fp_profile', JSON.stringify(profile));
    if (useCloud && currentUser) { let monthlyData = {}; for(let i=0; i<localStorage.length; i++) { let k = localStorage.key(i); if(k.startsWith('PlannerMonthData_')) monthlyData[k] = localStorage.getItem(k); } db.collection('users').doc(currentUser.uid).set({ tasks, notes, kanbanTasks, habits, finances, library, profile, monthlyData }, {merge: true}).catch(e => console.log(e)); }
}
function loadFromCloud() { db.collection('users').doc(currentUser.uid).get().then(doc => { if (doc.exists) { const data = doc.data(); if(data.tasks) tasks = data.tasks; if(data.notes) notes = data.notes; if(data.kanbanTasks) kanbanTasks = data.kanbanTasks; if(data.habits) habits = data.habits; if(data.finances) finances = data.finances; if(data.library) library = data.library; if(data.profile) profile = data.profile; if(data.monthlyData) { for(let k in data.monthlyData) localStorage.setItem(k, data.monthlyData[k]); } saveAll(); renderViews(); } }); }

// ----------------------------------------
// دوال الفتح وتفريغ النوافذ (تعمل الآن بنجاح 100%)
// ----------------------------------------
window.openTaskModal = () => {
    document.getElementById('taskTitle').value = '';
    document.getElementById('taskDate').value = currentDailyDate;
    document.getElementById('taskModal').classList.add('show');
};
window.openNoteModal = () => {
    document.getElementById('noteTitle').value = '';
    document.getElementById('noteContent').value = '';
    document.getElementById('noteDate').value = currentTodayStr;
    document.getElementById('noteModal').classList.add('show');
};
window.openLibModal = () => {
    document.getElementById('libTitle').value = '';
    document.getElementById('libCategory').value = '';
    document.getElementById('libContent').value = '';
    document.getElementById('libraryModal').classList.add('show');
};
window.openFinModal = () => {
    document.getElementById('finDesc').value = '';
    document.getElementById('finAmount').value = '';
    document.getElementById('finDate').value = currentTodayStr;
    document.getElementById('financeModal').classList.add('show');
};

window.clearDailyTasks = (type) => { 
    if(type === 'completed') { if(confirm(currentLang==='ar'?'مسح المهام المكتملة لهذا اليوم فقط؟':'Clear completed tasks for today?')) { tasks = tasks.filter(t => !(t.completed && t.date === currentTodayStr)); saveAll(); renderViews(); } } 
    else if (type === 'today') { if(confirm(currentLang==='ar'?'حذف جميع مهام اليوم نهائياً؟':'Delete all tasks for today permanently?')) { tasks = tasks.filter(t => t.date !== currentTodayStr); saveAll(); renderViews(); } } 
};
window.archiveDashboardToday = () => { if(confirm(currentLang==='ar'?'إخفاء مهام اليوم من لوحة الإحصائيات؟':'Hide today\'s tasks from Dashboard?')) { localStorage.setItem('fp_dash_cleared', currentTodayStr); renderDashboard(); } };
window.resetStats = () => { if(confirm(currentLang==='ar'?'تصفير الإحصائيات والرسم البياني؟':'Reset dashboard stats?')) { localStorage.setItem('fp_stats_reset', getTodayStr()); renderDashboard(); } };
window.handleAuth = async (action) => { const email = document.getElementById('authEmail').value, pass = document.getElementById('authPassword').value, errEl = document.getElementById('authError'); errEl.innerText = ''; if(!email || !pass) return; try { if(action === 'login') await auth.signInWithEmailAndPassword(email, pass); else await auth.createUserWithEmailAndPassword(email, pass); document.getElementById('authModal').classList.remove('show'); } catch(err) { errEl.style.color = 'var(--danger)'; errEl.innerText = err.message; } };
window.resetPassword = async () => { const email = document.getElementById('authEmail').value; const errEl = document.getElementById('authError'); if(!email) { errEl.style.color = 'var(--warning)'; errEl.innerText = currentLang === 'ar' ? 'يرجى كتابة البريد الإلكتروني.' : 'Please enter email.'; return; } try { await auth.sendPasswordResetEmail(email); errEl.style.color = 'var(--success)'; errEl.innerText = currentLang === 'ar' ? 'تم إرسال رابط الاستعادة!' : 'Reset link sent!'; } catch(err) { errEl.style.color = 'var(--danger)'; errEl.innerText = err.message; } };
window.logoutCloud = () => { auth.signOut().then(() => { localStorage.clear(); location.reload(); }); };

function linkify(text) { const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%Sub=~_|])/ig; const phoneRegex = /(\b\d{10,14}\b)/g; return text.replace(urlRegex, url => `<a href="${url}" target="_blank">${url}</a>`).replace(phoneRegex, phone => `<a href="tel:${phone}">${phone}</a>`); }

let dictationRecognition = null; let isDictating = false; let currentDictationTarget = null;
function initDictation() {
    const dictateLibBtn = document.getElementById('dictateLibBtn');
    const dictateNoteBtn = document.getElementById('dictateNoteBtn');
    if (('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition; 
        dictationRecognition = new SpeechRecognition(); dictationRecognition.continuous = true; dictationRecognition.interimResults = false;
        dictationRecognition.onstart = function() { isDictating = true; let btn = currentDictationTarget === 'lib' ? dictateLibBtn : dictateNoteBtn; let status = document.getElementById(currentDictationTarget === 'lib' ? 'dictateStatusLib' : 'dictateStatusNote'); if(btn) { btn.classList.add('recording'); btn.innerHTML = '<i class="fa-solid fa-stop"></i>'; } if(status) { status.innerText = currentLang === 'ar' ? 'جاري الاستماع...' : 'Listening...'; status.style.color = 'var(--danger)'; } };
        dictationRecognition.onresult = function(event) { let transcript = event.results[event.results.length - 1][0].transcript; let targetInput = document.getElementById(currentDictationTarget === 'lib' ? 'libContent' : 'noteContent'); if(targetInput) { targetInput.value = targetInput.value + (targetInput.value ? ' ' : '') + transcript; } };
        dictationRecognition.onend = function() { if(isDictating) dictationRecognition.start(); else stopDictation(); };
        const startDictation = (target) => { if (isDictating) { isDictating = false; dictationRecognition.stop(); } else { currentDictationTarget = target; let langSelect = document.getElementById(target === 'lib' ? 'dictateLangLib' : 'dictateLangNote'); dictationRecognition.lang = langSelect ? langSelect.value : (currentLang === 'ar' ? 'ar-EG' : 'en-US'); dictationRecognition.start(); } };
        if(dictateLibBtn) dictateLibBtn.onclick = () => startDictation('lib');
        if(dictateNoteBtn) dictateNoteBtn.onclick = () => startDictation('note');
    }
}
function stopDictation() { isDictating = false; if(dictationRecognition) dictationRecognition.stop(); }

document.addEventListener('DOMContentLoaded', () => {
    initTheme(); initColorTheme(); initModals(); initProfile(); initBackup(); initDictation(); setLanguage(currentLang);
    
    // تفعيل زر الدعوة/المشاركة
    document.getElementById('shareEmptyBtn').onclick = () => {
        const text = currentLang === 'ar' ? "جربت تطبيق Planner Pro Max لتنظيم الوقت وإدارة المهام وكان ممتاز! جربه مجاناً من هنا: https://eslam-planner.github.io/" : "Try out Planner Pro Max for free: https://eslam-planner.github.io/";
        if (navigator.share) {
            navigator.share({ title: 'Planner Pro Max', text: text, url: 'https://eslam-planner.github.io/' }).catch(console.error);
        } else {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        }
    };

    const viewDailyDate = document.getElementById('viewDailyDate');
    if(viewDailyDate) { viewDailyDate.value = currentDailyDate; viewDailyDate.addEventListener('change', (e) => { currentDailyDate = e.target.value; renderDaily(); }); }
    
    const taskHour = document.getElementById('taskHour'); taskHour.innerHTML = ''; 
    for(let i = 6; i <= 23; i++) { let opt = document.createElement('option'); opt.value = i; if(i === 12) opt.textContent = '12 PM'; else if(i > 12) opt.textContent = `${i - 12} PM`; else opt.textContent = `${i} AM`; taskHour.appendChild(opt); }
    
    document.getElementById('prevMonthBtn').onclick = () => { currentMonthView--; if(currentMonthView < 0) { currentMonthView = 11; currentYearView--; } renderViews(); };
    document.getElementById('nextMonthBtn').onclick = () => { currentMonthView++; if(currentMonthView > 11) { currentMonthView = 0; currentYearView++; } renderViews(); };
    
    document.querySelectorAll('.nav-item').forEach(link => { link.addEventListener('click', (e) => { e.preventDefault(); document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active')); document.querySelectorAll('.view-section').forEach(v => v.classList.remove('active')); e.currentTarget.classList.add('active'); let target = e.currentTarget.getAttribute('data-target'); document.getElementById(target).classList.add('active'); renderViews(); }); });
    initPomodoro(); renderViews();
});

function renderViews() { renderDashboard(); renderMonthly(); renderDaily(); renderKanban(); renderHabits(); renderFinance(); renderLibrary(); renderNotes(); }

function renderDaily() { 
    const container = document.getElementById('plannerContainer'); container.innerHTML = ''; 
    const todayTasks = tasks.filter(t => t.date === currentDailyDate); 
    for(let hour = 6; hour <= 23; hour++) { 
        const hourTasks = todayTasks.filter(t => t.hour == hour); 
        let timeLabel = hour === 12 ? '12 PM' : (hour > 12 ? `${hour - 12} PM` : `${hour} AM`);
        let html = hourTasks.map(t => `
            <div class="daily-task-item ${t.completed ? 'completed' : ''}" onclick="editTask(${t.id})" style="display:flex; justify-content:space-between; padding:10px; border:1px solid var(--border-color); border-radius:8px; margin-bottom:5px; background:var(--card-bg); cursor:pointer;">
                <div style="flex:1;"><input type="checkbox" ${t.completed ? 'checked' : ''} onclick="event.stopPropagation()" onchange="toggleTask(${t.id})"> <span style="text-decoration:${t.completed?'line-through':'none'}">${t.title}</span></div>
                <button onclick="event.stopPropagation(); delTask(${t.id})" class="no-print icon-btn" style="color:var(--danger);"><i class="fa-solid fa-trash"></i></button>
            </div>
        `).join(''); 
        container.innerHTML += `<div style="display:flex; margin-bottom:1rem; gap:1rem; align-items:flex-start;"><div style="width:60px; font-weight:bold; color:var(--primary); margin-top:10px;">${timeLabel}</div><div style="flex:1; min-height:45px;">${html||`<span style="color:var(--text-muted); font-size:0.8rem; display:block; padding:10px; opacity: 0.5;">...</span>`}</div></div>`; 
    } 
}

document.getElementById('saveTaskBtn').onclick = () => { const t = document.getElementById('taskTitle').value; if(!t) return; tasks.push({ id: Date.now(), title: t, date: document.getElementById('taskDate').value, hour: document.getElementById('taskHour').value, completed: false }); saveAll(); document.getElementById('taskModal').classList.remove('show'); renderDaily(); renderDashboard(); };
window.toggleTask = id => { tasks = tasks.map(t => t.id === id ? {...t, completed: !t.completed} : t); saveAll(); renderDaily(); renderDashboard(); }
window.delTask = id => { tasks = tasks.filter(t => t.id !== id); saveAll(); renderDaily(); renderDashboard(); }

window.editTask = (id) => {
    let task = tasks.find(t => t.id === id); if(!task) return;
    document.getElementById('editTaskId').value = task.id; document.getElementById('editTaskTitle').value = task.title; document.getElementById('editTaskDate').value = task.date;
    let hourSelect = document.getElementById('editTaskHour'); hourSelect.innerHTML = '';
    for(let i = 6; i <= 23; i++) { let opt = document.createElement('option'); opt.value = i; opt.textContent = i === 12 ? '12 PM' : (i > 12 ? `${i - 12} PM` : `${i} AM`); if(i == task.hour) opt.selected = true; hourSelect.appendChild(opt); }
    document.getElementById('editTaskModal').classList.add('show');
};

document.getElementById('updateTaskBtn').onclick = () => {
    let id = parseInt(document.getElementById('editTaskId').value); let title = document.getElementById('editTaskTitle').value; let dateStr = document.getElementById('editTaskDate').value; let hour = document.getElementById('editTaskHour').value;
    if(!title) return; let task = tasks.find(t => t.id === id);
    if(task) {
        let oldDate = task.date; task.title = title; task.date = dateStr; task.hour = hour;
        if(dateStr !== oldDate) { let [y, m, d] = dateStr.split('-'); let storageKey = `PlannerMonthData_${parseInt(y)}_${parseInt(m)-1}_${parseInt(d)}`; let currentText = localStorage.getItem(storageKey) || ""; let timeTxt = hour == 12 ? '12 PM' : (hour > 12 ? (hour-12)+' PM' : hour+' AM'); localStorage.setItem(storageKey, currentText ? currentText + '\n- ' + title + ' ('+timeTxt+')' : '- ' + title + ' ('+timeTxt+')'); }
        saveAll(); renderViews(); document.getElementById('editTaskModal').classList.remove('show');
    }
};

function renderNotes() { 
    const container = document.getElementById('notesContainer'); 
    container.innerHTML = notes.length === 0 ? `<p style="text-align:center; color:var(--text-muted); grid-column: 1/-1;">${currentLang==='ar'?'لا توجد ملاحظات.':'No notes.'}</p>` : ''; 
    notes.forEach(note => { container.innerHTML += `<div class="note-card"><button class="delete-note no-print" onclick="deleteNote(${note.id})"><i class="fa-solid fa-trash"></i></button><span class="note-date"><i class="fa-solid fa-calendar"></i> ${note.date}</span><h3 style="margin-bottom: 0.5rem;">${note.title}</h3><p style="color:var(--text-muted); font-size:0.95rem; white-space: pre-wrap;">${note.content}</p></div>`; }); 
}

document.getElementById('saveNoteBtn').onclick = () => { const t = document.getElementById('noteTitle').value, c = document.getElementById('noteContent').value, d = document.getElementById('noteDate').value; if(!t && !c) return; notes.push({ id: Date.now(), title: t || (currentLang==='ar'?'ملاحظة جديدة':'New Note'), content: c, date: d }); saveAll(); document.getElementById('noteModal').classList.remove('show'); renderNotes(); };
window.deleteNote = id => { notes = notes.filter(n => n.id !== id); saveAll(); renderNotes(); }

function renderMonthly() { 
    const container = document.getElementById('monthlyContainer'); container.innerHTML = ''; 
    const mNames = currentLang === 'ar' ? monthNamesAr : monthNamesEn; document.getElementById('monthlyTitle').innerText = `${mNames[currentMonthView]} ${currentYearView}`; 
    const daysInMonth = new Date(currentYearView, currentMonthView + 1, 0).getDate(); 
    let dayText = currentLang === 'ar' ? 'اليوم:' : 'Day:';
    let placeholderText = currentLang === 'ar' ? 'اكتب خطتك (الروابط تعمل تلقائياً)' : 'Type your plan (links work automatically)';
    for(let i = 1; i <= daysInMonth; i++) { 
        let storageKey = `PlannerMonthData_${currentYearView}_${currentMonthView}_${i}`; let savedText = localStorage.getItem(storageKey) || ""; 
        const dayDiv = document.createElement('div'); dayDiv.className = 'month-day-card'; 
        dayDiv.innerHTML = `<div class="month-day-header"><span>${dayText} ${i} ${mNames[currentMonthView]}</span></div><textarea class="multi-line-input no-print" rows="3" data-key="${storageKey}" placeholder="${placeholderText}">${savedText}</textarea><div class="render-area">${linkify(savedText)}</div>`; container.appendChild(dayDiv); 
    } 
    document.querySelectorAll('.multi-line-input').forEach(ta => { ta.oninput = e => { e.target.nextElementSibling.innerHTML = linkify(e.target.value); }; ta.onchange = e => { localStorage.setItem(e.target.dataset.key, e.target.value); saveAll(); }; }); 
}

let pomTimer, targetTime = 0, pomTimeLeft = 25 * 60, isPomRunning = false, pomMode = 'work', workDuration = 25;
function initPomodoro() { 
    const d = document.getElementById('timerDisplay'); 
    const wd = document.getElementById('pomWorkDuration'); 
    const alarm = document.getElementById('pomAlarmSound');
    const stopBtn = document.getElementById('stopAlarmBtn');
    const startBtn = document.getElementById('pomStart');
    const pauseBtn = document.getElementById('pomPause');

    const updateTimeDisplay = () => { d.innerText = `${Math.floor(pomTimeLeft/60).toString().padStart(2,'0')}:${(pomTimeLeft%60).toString().padStart(2,'0')}`; }; 
    
    document.getElementById('pomMinus').onclick = () => { if(!isPomRunning && workDuration > 15) { workDuration -= 5; if(pomMode==='work'){ pomTimeLeft = workDuration*60; updateTimeDisplay();} wd.innerText = workDuration; } }; 
    document.getElementById('pomPlus').onclick = () => { if(!isPomRunning && workDuration < 60) { workDuration += 5; if(pomMode==='work'){ pomTimeLeft = workDuration*60; updateTimeDisplay();} wd.innerText = workDuration; } }; 
    
    const setMode = (m, mins) => { 
        clearInterval(pomTimer); isPomRunning=false; pomMode=m; pomTimeLeft=mins*60; updateTimeDisplay(); 
        document.getElementById('pomWork').classList.toggle('active', m==='work'); 
        document.getElementById('pomBreak').classList.toggle('active', m==='break'); 
        startBtn.style.display = 'inline-flex'; pauseBtn.style.display = 'inline-flex'; stopBtn.style.display = 'none';
        alarm.pause(); alarm.currentTime = 0;
    }; 
    
    document.getElementById('pomWork').onclick = () => setMode('work', workDuration); 
    document.getElementById('pomBreak').onclick = () => setMode('break', 5); 
    
    startBtn.onclick = () => { 
        if(isPomRunning) return; 
        alarm.play().then(()=>alarm.pause()).catch(e=>{}); 
        isPomRunning = true; 
        targetTime = Date.now() + (pomTimeLeft * 1000); 
        
        pomTimer = setInterval(() => { 
            let remaining = Math.round((targetTime - Date.now()) / 1000);
            if(remaining <= 0) { 
                clearInterval(pomTimer); 
                isPomRunning=false; 
                pomTimeLeft=0; 
                updateTimeDisplay(); 
                alarm.play(); 
                startBtn.style.display = 'none'; pauseBtn.style.display = 'none'; stopBtn.style.display = 'inline-flex';
            } else {
                pomTimeLeft = remaining;
                updateTimeDisplay();
            }
        }, 1000); 
    }; 
    
    pauseBtn.onclick = () => { clearInterval(pomTimer); isPomRunning=false; }; 
    document.getElementById('pomReset').onclick = () => setMode(pomMode, pomMode==='work'?workDuration:5); 
    
    stopBtn.onclick = () => {
        alarm.pause(); alarm.currentTime = 0;
        setMode(pomMode === 'work' ? 'break' : 'work', pomMode === 'work' ? 5 : workDuration);
    };
    
    updateTimeDisplay(); 
}

function renderKanban() { ['todo', 'inprogress', 'done'].forEach(col => { document.querySelector(`.kanban-items[data-status="${col}"]`).innerHTML = kanbanTasks[col].map(i => `<div class="kb-card" draggable="true" ondragstart="drag(event, ${i.id}, '${col}')">${i.text}<div class="kb-card-actions no-print"><button class="kb-move-btn" onclick="moveKb(${i.id}, '${col}', -1)"><i class="fa-solid fa-arrow-right"></i></button><button class="kb-move-btn" style="color:var(--danger)" onclick="delKb(${i.id}, '${col}')"><i class="fa-solid fa-trash"></i></button><button class="kb-move-btn" onclick="moveKb(${i.id}, '${col}', 1)"><i class="fa-solid fa-arrow-left"></i></button></div></div>`).join(''); }); }
window.addKanbanItem = () => { const inp = document.getElementById('newKbItem'); if(inp.value.trim()) { kanbanTasks.todo.push({id:Date.now(), text:inp.value}); inp.value = ''; saveAll(); renderKanban(); } }
window.delKb = (id, c) => { kanbanTasks[c] = kanbanTasks[c].filter(i => i.id !== id); saveAll(); renderKanban(); }
window.moveKb = (id, c, d) => { const cols=['todo','inprogress','done']; let idx=cols.indexOf(c), n=idx+d; if(n>=0 && n<cols.length){ let i=kanbanTasks[c].find(x=>x.id===id); kanbanTasks[c]=kanbanTasks[c].filter(x=>x.id!==id); kanbanTasks[cols[n]].push(i); saveAll(); renderKanban(); } }
window.drag = (ev, id, col) => { ev.dataTransfer.setData("id", id); ev.dataTransfer.setData("col", col); }
window.allowDrop = ev => ev.preventDefault();
window.drop = ev => { ev.preventDefault(); let tc = ev.target.closest('.kanban-items').getAttribute('data-status'), id = parseInt(ev.dataTransfer.getData("id")), sc = ev.dataTransfer.getData("col"); if(sc!==tc){ let i=kanbanTasks[sc].find(x=>x.id===id); kanbanTasks[sc]=kanbanTasks[sc].filter(x=>x.id!==id); kanbanTasks[tc].push(i); saveAll(); renderKanban(); } }

function renderDashboard() {
    let dashClearedStr = localStorage.getItem('fp_dash_cleared');
    let activeTasks = (dashClearedStr === currentTodayStr) ? [] : tasks.filter(t => t.date === currentTodayStr);
    let completed = activeTasks.filter(t => t.completed).length; 
    document.getElementById('dashTasks').innerText = `${completed} / ${activeTasks.length}`;
    let tHC = 0; let dHC = 0; habits.forEach(h => { for(let i=1; i<=30; i++) { tHC++; if(h.days[`${currentYearView}-${currentMonthView}-${i}`]) dHC++; } }); document.getElementById('dashHabits').innerText = `${tHC === 0 ? 0 : Math.round((dHC/tHC)*100)}%`;
    let balance = finances.reduce((acc, curr) => curr.type === 'income' ? acc + Number(curr.amount) : acc - Number(curr.amount), 0); document.getElementById('dashBalance').innerText = `${balance}`;
    let resetDate = localStorage.getItem('fp_stats_reset') || "2000-01-01";
    const ctx = document.getElementById('tasksChart').getContext('2d'); if(myChart) myChart.destroy();
    let labels = []; let dataDone = []; let dataPending = []; 
    for(let i=6; i>=0; i--) { let d = new Date(); d.setDate(d.getDate() - i); let dateStr = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString().split('T')[0]; labels.push(d.toLocaleDateString(currentLang==='ar'?'ar-EG':'en-US', {weekday: 'short'})); let dayTasks = tasks.filter(t => t.date === dateStr && t.date >= resetDate); dataDone.push(dayTasks.filter(t => t.completed).length); dataPending.push(dayTasks.filter(t => !t.completed).length); }
    let primaryColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#25D366';
    myChart = new Chart(ctx, { type: 'bar', data: { labels: labels, datasets: [ { label: i18n[currentLang].chart_done, data: dataDone, backgroundColor: primaryColor }, { label: i18n[currentLang].chart_pend, data: dataPending, backgroundColor: '#ef4444' } ] }, options: { responsive: true, scales: { y: { beginAtZero: true, ticks: {stepSize: 1} } } } });
}

function renderFinance() { 
    const container = document.getElementById('financeContainer'); let inc = 0, exp = 0; 
    let html = finances.sort((a,b) => new Date(b.date) - new Date(a.date)).map(f => { if(f.type === 'income') inc += Number(f.amount); else exp += Number(f.amount); let icon = f.type === 'income' ? '<i class="fa-solid fa-arrow-trend-up"></i>' : '<i class="fa-solid fa-arrow-trend-down"></i>'; return `<div class="fin-item" style="cursor:pointer;" onclick="editFin(${f.id})"><div><small>${f.date}</small><br><b>${f.desc}</b></div><div style="display:flex; align-items:center; gap:15px;"><span class="fin-amt ${f.type === 'income' ? 'inc' : 'exp'}">${icon} ${f.amount}</span><button class="icon-btn no-print" onclick="event.stopPropagation(); delFin(${f.id})"><i class="fa-solid fa-trash"></i></button></div></div>`; }).join(''); 
    document.getElementById('totalIncome').innerText = inc; document.getElementById('totalExpense').innerText = exp; document.getElementById('netBalance').innerText = inc - exp; 
    container.innerHTML = html || `<p style="text-align:center; color:var(--text-muted);">${currentLang==='ar'?'لا توجد معاملات.':'No transactions yet.'}</p>`; 
}

document.getElementById('saveFinBtn').onclick = () => { let desc = document.getElementById('finDesc').value; let amt = document.getElementById('finAmount').value; if(!desc || !amt) return; finances.push({ id: Date.now(), desc: desc, amount: amt, type: document.getElementById('finType').value, date: document.getElementById('finDate').value }); saveAll(); document.getElementById('financeModal').classList.remove('show'); renderFinance(); renderDashboard(); };

window.editFin = (id) => {
    let f = finances.find(x => x.id === id); if(!f) return;
    document.getElementById('editFinId').value = f.id; document.getElementById('editFinDesc').value = f.desc; document.getElementById('editFinAmount').value = f.amount; document.getElementById('editFinType').value = f.type; document.getElementById('editFinDate').value = f.date;
    document.getElementById('editFinModal').classList.add('show');
};

document.getElementById('updateFinBtn').onclick = () => {
    let id = parseInt(document.getElementById('editFinId').value); let desc = document.getElementById('editFinDesc').value; let amt = document.getElementById('editFinAmount').value;
    if(!desc || !amt) return; let f = finances.find(x => x.id === id);
    if(f) { f.desc = desc; f.amount = amt; f.type = document.getElementById('editFinType').value; f.date = document.getElementById('editFinDate').value; saveAll(); renderFinance(); renderDashboard(); document.getElementById('editFinModal').classList.remove('show'); }
};

window.delFin = id => { finances = finances.filter(f => f.id !== id); saveAll(); renderFinance(); renderDashboard(); }

function renderLibrary() { 
    const container = document.getElementById('libraryContainer'); 
    container.innerHTML = library.map(l => `<div class="lib-card"><button class="icon-btn no-print" style="position:absolute; top:10px; left:10px; color:var(--danger);" onclick="delLib(${l.id})"><i class="fa-solid fa-trash"></i></button><span class="lib-cat">${l.category}</span><h3>${l.title}</h3><div class="render-area">${linkify(l.content)}</div></div>`).join('') || `<p style="text-align:center; color:var(--text-muted); grid-column: 1/-1;">${currentLang==='ar'?'أضف مرجعك الأول.':'Add your first reference.'}</p>`; 
}

document.getElementById('saveLibBtn').onclick = () => { let t = document.getElementById('libTitle').value, c = document.getElementById('libCategory').value, text = document.getElementById('libContent').value; if(!t) return; library.push({ id: Date.now(), title: t, category: c || 'عام', content: text }); saveAll(); document.getElementById('libraryModal').classList.remove('show'); renderLibrary(); };
window.delLib = id => { library = library.filter(l => l.id !== id); saveAll(); renderLibrary(); }

function renderHabits() { 
    let dim = new Date(currentYearView, currentMonthView + 1, 0).getDate(); 
    let habitText = currentLang === 'ar' ? 'العادة' : 'Habit';
    let html = `<table class="habit-table"><thead><tr><th>${habitText}</th>`; 
    for(let i=1; i<=dim; i++) html += `<th>${i}</th>`; html += `</tr></thead><tbody>`; 
    habits.forEach(h => { html += `<tr><td class="habit-name"><button class="icon-btn no-print" style="color:red;" onclick="delHabit(${h.id})">x</button> ${h.name}</td>`; for(let i=1; i<=dim; i++) { let k = `${currentYearView}-${currentMonthView}-${i}`; html += `<td><div class="habit-check ${h.days[k]?'done':''}" onclick="toggleHabit(${h.id}, '${k}')">✓</div></td>`; } html += `</tr>`; }); 
    document.getElementById('habitsContainer').innerHTML = html + `</tbody></table>`; 
}

window.addNewHabit = () => { const inp = document.getElementById('newHabitInput'); if(inp.value.trim()){ habits.push({id:Date.now(), name:inp.value, days:{}}); saveAll(); inp.value=''; renderHabits(); renderDashboard(); } }
window.toggleHabit = (id, k) => { let h = habits.find(x=>x.id===id); h.days[k] = !h.days[k]; saveAll(); renderHabits(); renderDashboard(); }
window.delHabit = id => { habits = habits.filter(h=>h.id!==id); saveAll(); renderHabits(); renderDashboard(); }

function initProfile() { document.getElementById('profileName').value = profile.name; document.getElementById('saveProfileBtn').onclick = () => { profile.name = document.getElementById('profileName').value; saveAll(); alert(currentLang === 'ar' ? "تم الحفظ!" : "Saved!"); }; }
function initBackup() { document.getElementById('backupBtn').onclick = () => { let d = {}; for(let i=0;i<localStorage.length;i++) d[localStorage.key(i)] = localStorage.getItem(localStorage.key(i)); const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(d)], {type:"application/json"})); a.download = `Backup.json`; a.click(); }; document.getElementById('restoreFile').onchange = e => { const r = new FileReader(); r.onload = ev => { const d = JSON.parse(ev.target.result); for(let k in d) localStorage.setItem(k, d[k]); location.reload(); }; r.readAsText(e.target.files[0]); }; }
function initModals() { document.querySelectorAll('.close-modal').forEach(b => b.onclick = () => { document.querySelectorAll('.modal').forEach(m => m.classList.remove('show')); stopDictation(); }); }
function initTheme() { if(localStorage.getItem('dark_mode')==='true') document.body.classList.add('dark-mode'); document.getElementById('themeToggle').onclick = () => { document.body.classList.toggle('dark-mode'); localStorage.setItem('dark_mode', document.body.classList.contains('dark-mode')); }; }