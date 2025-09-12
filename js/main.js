const menuItems = [
    { id: 'new', label: 'موكل جديد', icon: 'ri-add-circle-line', color: 'blue', description: 'إضافة قضية جديدة' },
    { id: 'search', label: 'البحث والتعديل', icon: 'ri-search-2-line', color: 'yellow', description: 'البحث في القضايا' },
    { id: 'sessions', label: 'الجلسات', icon: 'ri-calendar-event-line', color: 'green', description: 'إدارة الجلسات' },
    { id: 'administrative', label: 'الأعمال الإدارية', icon: 'ri-briefcase-line', color: 'purple', description: 'المهام الإدارية' },
    { id: 'accounts', label: 'الحسابات', icon: 'ri-wallet-3-line', color: 'blue', description: 'إدارة الحسابات' },
    { id: 'clerk-papers', label: 'أوراق المحضرين', icon: 'ri-file-paper-line', color: 'yellow', description: 'أوراق المحضرين' },
    { id: 'expert-sessions', label: 'جلسات الخبراء', icon: 'ri-team-line', color: 'indigo', description: 'جلسات الخبراء' },
    { id: 'archive', label: 'الأرشيف', icon: 'ri-folder-history-line', color: 'blue', description: 'الأرشيف والملفات' },
    { id: 'legal-library', label: 'المكتبة القانونية', icon: 'ri-book-open-line', color: 'green', description: 'المراجع القانونية' },
    { id: 'open-clients-folder', label: 'ملفات الموكلين', icon: 'ri-folder-open-line', color: 'green', description: 'عرض مستندات عملائك' },
    { id: 'reports', label: 'التقارير', icon: 'ri-pie-chart-line', color: 'red', description: 'التقارير والإحصائيات' },
    { id: 'settings', label: 'الإعدادات', icon: 'ri-settings-3-line', color: 'indigo', description: 'إعدادات النظام' }
];

function generateMenuItems() {
    const menuGrid = document.getElementById('menu-grid');
    if (!menuGrid) return;
    menuGrid.innerHTML = '';
    
    const colorClasses = {
        blue: { bg: 'bg-gradient-to-br from-blue-900 to-gray-900', border: 'border-2 border-green-600', icon: 'text-white', iconBg: 'bg-blue-600', title: 'text-white', desc: 'text-blue-300 group-hover:text-white', hover: 'hover:from-blue-600 hover:to-gray-600 hover:border-green-300 hover:ring-1 hover:ring-green-300' },
        yellow: { bg: 'bg-gradient-to-br from-blue-900 to-gray-900', border: 'border-2 border-green-600', icon: 'text-white', iconBg: 'bg-blue-600', title: 'text-white', desc: 'text-blue-300 group-hover:text-white', hover: 'hover:from-blue-600 hover:to-gray-600 hover:border-green-300 hover:ring-1 hover:ring-green-300' },
        green: { bg: 'bg-gradient-to-br from-blue-900 to-gray-900', border: 'border-2 border-green-600', icon: 'text-white', iconBg: 'bg-blue-600', title: 'text-white', desc: 'text-blue-300 group-hover:text-white', hover: 'hover:from-blue-600 hover:to-gray-600 hover:border-green-300 hover:ring-1 hover:ring-green-300' },
        purple: { bg: 'bg-gradient-to-br from-blue-900 to-gray-900', border: 'border-2 border-green-600', icon: 'text-white', iconBg: 'bg-blue-600', title: 'text-white', desc: 'text-blue-300 group-hover:text-white', hover: 'hover:from-blue-600 hover:to-gray-600 hover:border-green-300 hover:ring-1 hover:ring-green-300' },
        gray: { bg: 'bg-gradient-to-br from-blue-900 to-gray-900', border: 'border-2 border-green-600', icon: 'text-white', iconBg: 'bg-blue-600', title: 'text-white', desc: 'text-blue-300 group-hover:text-white', hover: 'hover:from-blue-600 hover:to-gray-600 hover:border-green-300 hover:ring-1 hover:ring-green-300' },
        indigo: { bg: 'bg-gradient-to-br from-blue-900 to-gray-900', border: 'border-2 border-green-600', icon: 'text-white', iconBg: 'bg-blue-600', title: 'text-white', desc: 'text-blue-300 group-hover:text-white', hover: 'hover:from-blue-600 hover:to-gray-600 hover:border-green-300 hover:ring-1 hover:ring-green-300' },
        red: { bg: 'bg-gradient-to-br from-blue-900 to-gray-900', border: 'border-2 border-green-600', icon: 'text-white', iconBg: 'bg-blue-600', title: 'text-white', desc: 'text-blue-300 group-hover:text-white', hover: 'hover:from-blue-600 hover:to-gray-600 hover:border-green-300 hover:ring-1 hover:ring-green-300' }
    };
    
    menuItems.forEach(item => {
        const colors = colorClasses[item.color] || colorClasses.gray;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = `menu-card group ${colors.bg} ${colors.border} ${colors.hover} border rounded-xl p-4 text-center transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`;
        btn.innerHTML = `
            <div class="flex flex-col items-center justify-center h-full">
                <div class="${colors.iconBg} w-12 h-12 rounded-lg flex items-center justify-center mb-3">
                    <i class="${item.icon} ${colors.icon} text-2xl"></i>
                </div>
                <h3 class="font-semibold text-base ${colors.title} mb-1">${item.label}</h3>
                <p class="text-sm ${colors.desc} leading-tight">${item.description}</p>
            </div>
        `;
        btn.addEventListener('click', () => handleCardClick(item.id));
        menuGrid.appendChild(btn);
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

    try {
        await initDB();
        await updateCountersInHeader();

        try {
            const name = await getSetting('officeName');
            const officeEl = document.getElementById('office-name-display');
            if (name && officeEl) officeEl.textContent = name;
        } catch (e) {}

        try {
            sessionStorage.removeItem('openClientDetailsOnSearch');
            sessionStorage.removeItem('returnToClientId');
            sessionStorage.removeItem('returnToPage');
        } catch (e) {}
    } catch(error) {
    }
});