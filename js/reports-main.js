// نظام التقارير - الواجهة الرئيسية
function displayReportsModal() {
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.innerHTML = `
        <div class="flex items-center gap-2">
            <div class="w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-xl flex items-center justify-center shadow-lg">
                <i class="ri-pie-chart-line text-white text-xl"></i>
            </div>
            <span class="text-2xl font-bold text-gray-800">التقارير</span>
        </div>
    `;
    
    modalContent.innerHTML = `
        <div class="flex h-full search-layout">
            <!-- الشريط الجانبي للأزرار -->
            <div class="w-64 bg-gray-50 border-l border-gray-200 p-4 overflow-y-auto search-left-pane">
                                
                <!-- الاطراف -->
                <button class="report-btn w-full text-right p-3 mb-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-purple-300" style="background: linear-gradient(135deg, #8b5cf6, #7c3aed);" data-report="parties-against">
                    <div class="flex items-center gap-3 text-white">
                        <i class="ri-group-line text-xl"></i>
                        <span class="text-base font-bold">الاطراف</span>
                    </div>
                </button>
                
                <!-- القضايا -->
                <button class="report-btn w-full text-right p-3 mb-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-green-300" style="background: linear-gradient(135deg, #10b981, #059669);" data-report="cases">
                    <div class="flex items-center gap-3 text-white">
                        <i class="ri-file-list-3-line text-xl"></i>
                        <span class="text-base font-bold">القضايا</span>
                    </div>
                </button>
                
                <!-- الجلسات -->
                <button class="report-btn w-full text-right p-3 mb-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-orange-300" style="background: linear-gradient(135deg, #f97316, #ea580c);" data-report="sessions">
                    <div class="flex items-center gap-3 text-white">
                        <i class="ri-calendar-event-line text-xl"></i>
                        <span class="text-base font-bold">الجلسات</span>
                    </div>
                </button>
                
                <!-- الحسابات -->
                <button class="report-btn w-full text-right p-3 mb-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-teal-300" style="background: linear-gradient(135deg, #14b8a6, #0d9488);" data-report="accounts">
                    <div class="flex items-center gap-3 text-white">
                        <i class="ri-wallet-3-line text-xl"></i>
                        <span class="text-base font-bold">الحسابات</span>
                    </div>
                </button>
                
                <!-- الاداريه -->
                <button class="report-btn w-full text-right p-3 mb-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-indigo-300" style="background: linear-gradient(135deg, #6366f1, #4f46e5);" data-report="administrative">
                    <div class="flex items-center gap-3 text-white">
                        <i class="ri-briefcase-line text-xl"></i>
                        <span class="text-base font-bold">الاداريه</span>
                    </div>
                </button>
                
                <!-- المحضرين -->
                <button class="report-btn w-full text-right p-3 mb-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-gray-300" style="background: linear-gradient(135deg, #6b7280, #4b5563);" data-report="clerk-papers">
                    <div class="flex items-center gap-3 text-white">
                        <i class="ri-file-paper-line text-xl"></i>
                        <span class="text-base font-bold">المحضرين</span>
                    </div>
                </button>
                
                <!-- الخبراء -->
                <button class="report-btn w-full text-right p-3 mb-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-pink-300" style="background: linear-gradient(135deg, #ec4899, #db2777);" data-report="expert-sessions">
                    <div class="flex items-center gap-3 text-white">
                        <i class="ri-team-line text-xl"></i>
                        <span class="text-base font-bold">الخبراء</span>
                    </div>
                </button>
                
                <!-- الارشيف -->
                <button class="report-btn w-full text-right p-3 mb-2 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 border border-transparent hover:border-cyan-300" style="background: linear-gradient(135deg, #06b6d4, #0891b2);" data-report="archive">
                    <div class="flex items-center gap-3 text-white">
                        <i class="ri-folder-history-line text-xl"></i>
                        <span class="text-base font-bold">الارشيف</span>
                    </div>
                </button>
            </div>
            
            <!-- منطقة المحتوى الرئيسي -->
            <div class="flex-1 py-6 pr-6 pl-0" id="report-content">
                <div class="flex items-center justify-center h-full">
                    <div class="text-center text-gray-500">
                        <i class="ri-file-chart-line text-6xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">مرحباً بك في التقارير</h3>
                        <p class="text-gray-400">اختر نوع التقرير المطلوب من القائمة الجانبية</p>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // إضافة مستمعي الأحداث للأزرار
    document.querySelectorAll('.report-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const reportType = this.dataset.report;
            handleReportClick(reportType);
        });
    });
    
    // إعداد التمرير للتقارير
    try {
        requestAnimationFrame(() => {
            setupReportsScrollBox();
            setupReportsHoverScrollBehavior();
        });
        window.addEventListener('resize', setupReportsScrollBox);
    } catch (e) { 
        console.error(e); 
    }
}

// معالج النقر على أزرار التقارير
function handleReportClick(reportType) {
    const reportNames = {
        'parties-against': 'تقارير الاطراف',
        'cases': 'تقارير القضايا',
        'sessions': 'تقارير عن الجلسات',
        'accounts': 'تقارير عن الحسابات',
        'administrative': 'تقارير عن الاعمال الاداريه',
        'clerk-papers': 'تقارير عن اوراق المحضرين',
        'expert-sessions': 'تقارير عن جلسات الخبراء',
        'archive': 'تقارير عن الارشيف'
    };
    
    const reportName = reportNames[reportType] || 'تقرير غير معروف';
    
    // تحديث منطقة المحتوى
    if (reportType === 'parties-against') {
        updatePartiesReportContent(reportName, reportType);
    } else if (reportType === 'cases') {
        updateCasesReportContent(reportName, reportType);
    } else if (reportType === 'sessions') {
        updateSessionsReportContent(reportName, reportType);
    } else if (reportType === 'accounts') {
        updateAccountsReportContent(reportName, reportType);
    } else if (reportType === 'administrative') {
        updateAdministrativeReportContent(reportName, reportType);
    } else if (reportType === 'clerk-papers') {
        updateClerkPapersReportContent(reportName, reportType);
    } else if (reportType === 'expert-sessions') {
        updateExpertSessionsReportContent(reportName, reportType);
    } else if (reportType === 'archive') {
        updateArchiveReportContent(reportName, reportType);
    } else {
        updateReportContent(reportName, reportType);
    }
    
    // تحديث حالة الأزرار (إضافة تأثير للزر المحدد)
    updateButtonStates(reportType);
}

// تحديث حالة الأزرار
function updateButtonStates(activeReportType) {
    // إزالة التأثير من جميع الأزرار
    document.querySelectorAll('.report-btn').forEach(btn => {
        btn.classList.remove('ring-2', 'ring-white', 'ring-opacity-50');
        btn.style.transform = 'scale(1)';
    });
    
    // إضافة التأثير للزر المحدد
    const activeButton = document.querySelector(`[data-report="${activeReportType}"]`);
    if (activeButton) {
        activeButton.classList.add('ring-2', 'ring-white', 'ring-opacity-50');
        activeButton.style.transform = 'scale(1.02)';
    }
}

// إعداد صندوق التمرير للتقارير
function setupReportsScrollBox() {
    try {
        const rightWrapper = document.querySelector('#report-content');
        if (!rightWrapper) return;
        
        const viewportH = window.innerHeight;
        const wrapperTop = rightWrapper.getBoundingClientRect().top;
        const targetH = Math.max(240, viewportH - wrapperTop - 12);
        
        rightWrapper.style.maxHeight = targetH + 'px';
        rightWrapper.style.overflowY = 'auto';
        
        const leftPane = document.querySelector('.w-64');
        if (leftPane) {
            leftPane.style.maxHeight = targetH + 'px';
            leftPane.style.minHeight = '0px';
            leftPane.style.overflowY = 'auto';
        }
    } catch (e) {}
}

// إعداد سلوك التمرير عند التحويم للتقارير
function setupReportsHoverScrollBehavior() {
    const leftPane = document.querySelector('.w-64');
    const rightContent = document.querySelector('#report-content');
    const mainEl = document.querySelector('main');
    if (!leftPane || !rightContent || !mainEl) return;

    // افتراضي: تمرير الصفحة مفعل
    const enablePageScroll = () => {
        mainEl.style.overflowY = 'auto';
        document.body.style.overflowY = '';
        rightContent.style.overscrollBehavior = 'contain';
    };

    const enableRightContentScrollOnly = () => {
        mainEl.style.overflowY = 'hidden';
        rightContent.style.overscrollBehavior = 'contain';
    };

    // عند التحويم على الجانب الأيسر -> تمرير الصفحة
    leftPane.addEventListener('mouseenter', enablePageScroll);
    leftPane.addEventListener('mouseleave', enableRightContentScrollOnly);

    // عند التحويم على محتوى التقارير -> تمرير داخلي
    rightContent.addEventListener('mouseenter', enableRightContentScrollOnly);
    rightContent.addEventListener('mouseleave', enablePageScroll);

    // تهيئة الحالة بناءً على موضع المؤشر الأولي
    enablePageScroll();
}