// ترتيب سطح المكتب الأصلي (بدون تغيير سلوك الديسكتوب)
const menuItemsDesktop = [
    { id: 'new', label: 'موكل جديد', icon: 'person_add', color: 'blue', description: 'إضافة قضية جديدة' },
    { id: 'search', label: 'البحث والتعديل', icon: 'search', color: 'indigo', description: 'البحث في القضايا' },

    { id: 'sessions', label: 'الجلسات', icon: 'event', color: 'teal', description: 'إدارة الجلسات' },
    { id: 'administrative', label: 'الأعمال الإدارية', icon: 'assignment', color: 'amber', description: 'المهام الإدارية' },
    { id: 'clerk-papers', label: 'أوراق المحضرين', icon: 'description', color: 'sky', description: 'أوراق المحضرين' },
    { id: 'accounts', label: 'الحسابات', icon: 'account_balance', color: 'rose', description: 'إدارة الحسابات' },

    { id: 'expert-sessions', label: 'جلسات الخبراء', icon: 'groups', color: 'orange', description: 'جلسات الخبراء' },
    { id: 'archive', label: 'الأرشيف', icon: 'archive', color: 'fuchsia', description: 'الأرشيف والملفات' },
    { id: 'legal-library', label: 'المكتبة القانونية', icon: 'local_library', color: 'lime', description: 'المراجع القانونية' },
    { id: 'reports', label: 'التقارير', icon: 'bar_chart', color: 'slate', description: 'تقارير شاملة' },

    { id: 'open-clients-folder', label: 'ملفات الموكلين', icon: 'folder_shared', color: 'cyan', description: 'عرض مستندات عملائك' }
];

// ترتيب الهاتف حسب الصورة المرفقة
const menuItemsMobile = [
    { id: 'search', label: 'البحث والتعديل', icon: 'search', color: 'indigo', description: 'البحث في القضايا' },
    { id: 'new', label: 'موكل جديد', icon: 'person_add', color: 'blue', description: 'إضافة قضية جديدة' },

    { id: 'open-clients-folder', label: 'ملفات الموكلين', icon: 'folder_shared', color: 'cyan', description: 'عرض مستندات عملائك' },
    { id: 'accounts', label: 'الحسابات', icon: 'account_balance', color: 'rose', description: 'إدارة الحسابات' },
    { id: 'clerk-papers', label: 'أوراق المحضرين', icon: 'description', color: 'sky', description: 'أوراق المحضرين' },

    { id: 'expert-sessions', label: 'جلسات الخبراء', icon: 'groups', color: 'orange', description: 'جلسات الخبراء' },
    { id: 'administrative', label: 'الأعمال الإدارية', icon: 'assignment', color: 'amber', description: 'المهام الإدارية' },
    { id: 'sessions', label: 'الجلسات', icon: 'event', color: 'teal', description: 'إدارة الجلسات' },

    { id: 'reports', label: 'التقارير', icon: 'bar_chart', color: 'slate', description: 'تقارير شاملة' },
    { id: 'legal-library', label: 'المكتبة القانونية', icon: 'local_library', color: 'lime', description: 'المراجع القانونية' },
    { id: 'archive', label: 'الأرشيف', icon: 'archive', color: 'fuchsia', description: 'الأرشيف والملفات' }
];

function generateMenuItems() {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;
    menuGrid.innerHTML = '';

    // اختيار الترتيب بناءً على عرض الشاشة الحالي
    const isMobile = window.matchMedia && window.matchMedia('(max-width: 768px)').matches;
    const items = isMobile ? menuItemsMobile : menuItemsDesktop;

    // أنشئ صف أول مستقل يحتوي أول زرين (يعمل على الهاتف والديسكتوب)
    const firstRowContainer = document.createElement('div');
    firstRowContainer.id = 'first-row';
    firstRowContainer.className = 'col-span-full grid grid-cols-2 gap-3 md:gap-4';
    menuGrid.appendChild(firstRowContainer);

    // ألوان للأيقونات على الهاتف فقط
    const iconColors = [
        { bg: '#FFE5E5', icon: '#FF4444' },
        { bg: '#FFF4E5', icon: '#FF9500' },
        { bg: '#E5F9F6', icon: '#00C896' },
        { bg: '#E5F0FF', icon: '#4285F4' },
        { bg: '#E8F0FE', icon: '#1976D2' },
        { bg: '#E3F2FD', icon: '#0288D1' },
        { bg: '#FFF3E0', icon: '#FF8F00' },
        { bg: '#F3E5F5', icon: '#9C27B0' },
        { bg: '#F1F8E9', icon: '#689F38' },
        { bg: '#E0F2F1', icon: '#00695C' }
    ];
    
    items.forEach((item, index) => {
        const btn = document.createElement('button');
        btn.type = 'button';
        // كرت موحّد، مع ارتفاع أكبر قليلاً على الديسكتوب فقط
        btn.className = 'menu-card md-elevation-1 rounded-3xl hover:md-elevation-2 flex flex-col items-center justify-center text-center md:min-h-[160px] group p-4 md:p-6';
        btn.style.backgroundColor = '#FFFFFF';
        btn.style.color = '#333333';

        if (isMobile) {
            // موبايل: عنوان فقط + ألوان أيقونة حسب التصميم
            const colors = iconColors[index % iconColors.length];
            btn.innerHTML = `
                <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3" style="background-color: ${colors.bg};">
                    <span class="material-symbols-outlined text-xl" style="color: ${colors.icon};">${item.icon}</span>
                </div>
                <h3 class="font-bold text-base leading-tight">${item.label}</h3>
            `;
        } else {
            // ديسكتوب: حافظ على العنوان + الوصف كما كان
            btn.innerHTML = `
                <div class="w-12 h-12 rounded-xl flex items-center justify-center mb-3 bg-gray-100">
                    <span class="material-symbols-outlined text-xl text-gray-700">${item.icon}</span>
                </div>
                <h3 class="font-bold text-base leading-tight mb-1">${item.label}</h3>
                <p class="text-xs text-gray-500">${item.description || ''}</p>
            `;
        }

        btn.addEventListener('click', () => handleCardClick(item.id));

        // أول زرين دائماً في الصف الأول فقط (بدون تغيير تصميم الديسكتوب)
        if (index < 2) {
            firstRowContainer.appendChild(btn);
        } else {
            menuGrid.appendChild(btn);
        }
    });
}

function handleCardClick(id) {
    if (id === 'new') {
        stateManager.resetCaseState();
        try {
            sessionStorage.removeItem('returnToPage');
            sessionStorage.removeItem('returnToClientId');
            sessionStorage.removeItem('openClientDetailsOnSearch');
        } catch (e) {}
        window.location.href = 'new.html';
    } else if (id === 'search') {
        window.location.href = 'search.html';
    } else if (id === 'sessions') {
        window.location.href = 'sessions.html';
    } else if (id === 'accounts') {
        window.location.href = 'accounts.html';
    } else if (id === 'administrative') {
        window.location.href = 'administrative.html';
    } else if (id === 'clerk-papers') {
        window.location.href = 'clerk-papers.html';
    } else if (id === 'expert-sessions') {
        window.location.href = 'expert-sessions.html';
    } else if (id === 'archive') {
        window.location.href = 'archive.html';
    } else if (id === 'legal-library') {
        window.location.href = 'legal-library.html';
    } else if (id === 'open-clients-folder') {
        if (window.electronAPI && window.electronAPI.openClientsMainFolder) {
            window.electronAPI.openClientsMainFolder();
        } else {
            if (typeof showToast === 'function') {
                showToast('هذه الميزة متاحة فقط في تطبيق سطح المكتب', 'info');
            } else {
                alert('هذه الميزة متاحة فقط في تطبيق سطح المكتب');
            }
        }
    } else if (id === 'reports') {
        window.location.href = 'reports.html';
    } else if (id === 'settings') {
        window.location.href = 'settings.html';
    } else {
        openModalWithView((id) => {
            const modalTitle = document.getElementById('modal-title');
            const modalContent = document.getElementById('modal-content');
            modalTitle.textContent = "قيد التطوير";
            modalContent.innerHTML = '<p class="text-center p-8">هذه الميزة لا تزال قيد التطوير.</p>';
        }, id);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    generateMenuItems();

    // تحديث التاريخ والوقت الحاليين كل ثانية بصيغة منظمة
    function updateCurrentDateTime() {
        const dateLine = document.getElementById('current-date-line');
        const timeEl = document.getElementById('current-time');
        if (!dateLine || !timeEl) return;
        const now = new Date();

        // أسماء الأيام بالعربية
        const days = ['الأحد','الإثنين','الثلاثاء','الأربعاء','الخميس','الجمعة','السبت'];
        const dayName = days[now.getDay()];

        // التاريخ: يوم الأسبوع - اليوم/الشهر/السنة بالعربية
        try {
            const dateFormatter = new Intl.DateTimeFormat('ar-EG', { year: 'numeric', month: 'long', day: 'numeric' });
            dateLine.textContent = `${dayName} - ${dateFormatter.format(now)}`;
        } catch (e) {
            dateLine.textContent = `${dayName} - ${now.getDate()}/${now.getMonth()+1}/${now.getFullYear()}`;
        }

        // الوقت: hh:mm:ss بصيغة 12 ساعة مع (ص/م)
        const pad = (n) => String(n).padStart(2, '0');
        let h24 = now.getHours();
        const suffix = h24 >= 12 ? 'م' : 'ص';
        let h12 = h24 % 12;
        if (h12 === 0) h12 = 12;
        const hh = pad(h12);
        const mm = pad(now.getMinutes());
        const ss = pad(now.getSeconds());
        timeEl.textContent = `${hh}:${mm}:${ss} ${suffix}`;
    }
    updateCurrentDateTime();
    setInterval(updateCurrentDateTime, 1000);

    try {
        await initDB();
        await updateCountersInHeader();

        try {
            const name = await getSetting('officeName');
            const officeEl = document.getElementById('office-name-display');
            const mobileOfficeEl = document.getElementById('mobile-office-name');
            if (name) {
                if (officeEl) officeEl.textContent = name;
                if (mobileOfficeEl) mobileOfficeEl.textContent = name;
            } else {
                if (officeEl) officeEl.textContent = 'أحمد';
                if (mobileOfficeEl) mobileOfficeEl.textContent = 'أحمد';
            }

            // ضبط حجم العنوان ديناميكياً ليبقى في سطر واحد (للديسكتوب)
            try {
                const welcomeTitle = document.getElementById('welcome-title');
                if (welcomeTitle) {
                    const fitTitle = () => {
                        welcomeTitle.style.fontSize = '';
                        const sizes = ['1.25rem', '1.125rem', '1rem', '0.9375rem'];
                        for (const size of sizes) {
                            welcomeTitle.style.fontSize = size;
                            if (welcomeTitle.scrollWidth <= welcomeTitle.clientWidth) break;
                        }
                    };
                    fitTitle();
                    window.addEventListener('resize', fitTitle);
                }
            } catch (e) {}
        } catch (e) {}

        try {
            sessionStorage.removeItem('openClientDetailsOnSearch');
            sessionStorage.removeItem('returnToClientId');
            sessionStorage.removeItem('returnToPage');
        } catch (e) {}
    } catch(error) {
    }
});