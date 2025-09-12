// التقارير العامة (الإدارية، المحضرين، الخبراء، الأرشيف)

// تحديث محتوى التقرير العام
function updateReportContent(reportName, reportType) {
    const reportContent = document.getElementById('report-content');
    
    const reportIcons = {
        'parties-against': 'ri-group-line',
        'cases': 'ri-file-list-3-line',
        'sessions': 'ri-calendar-event-line',
        'accounts': 'ri-wallet-3-line',
        'administrative': 'ri-briefcase-line',
        'clerk-papers': 'ri-file-paper-line',
        'expert-sessions': 'ri-team-line',
        'archive': 'ri-folder-history-line'
    };
    
    const reportColors = {
        'parties-against': { bg: '#8b5cf6', bgHover: '#7c3aed', bgLight: '#f3f4f6', text: '#7c3aed', textLight: '#c4b5fd' },
        'cases': { bg: '#10b981', bgHover: '#059669', bgLight: '#f0fdf4', text: '#059669', textLight: '#86efac' },
        'sessions': { bg: '#f97316', bgHover: '#ea580c', bgLight: '#fff7ed', text: '#ea580c', textLight: '#fdba74' },
        'accounts': { bg: '#14b8a6', bgHover: '#0d9488', bgLight: '#f0fdfa', text: '#0d9488', textLight: '#7dd3fc' },
        'administrative': { bg: '#6366f1', bgHover: '#4f46e5', bgLight: '#f8fafc', text: '#4f46e5', textLight: '#a5b4fc' },
        'clerk-papers': { bg: '#6b7280', bgHover: '#4b5563', bgLight: '#f8fafc', text: '#4b5563', textLight: '#9ca3af' },
        'expert-sessions': { bg: '#ec4899', bgHover: '#db2777', bgLight: '#fdf2f8', text: '#db2777', textLight: '#f9a8d4' },
        'archive': { bg: '#06b6d4', bgHover: '#0891b2', bgLight: '#f0f9ff', text: '#0891b2', textLight: '#7dd3fc' }
    };
    
    const icon = reportIcons[reportType] || 'ri-file-chart-line';
    const colors = reportColors[reportType] || { bg: '#3b82f6', bgHover: '#2563eb', bgLight: '#eff6ff', text: '#2563eb', textLight: '#93c5fd' };
    
    reportContent.innerHTML = `
        <div class="h-full flex flex-col">
            <!-- أدوات التقرير -->
            <div class="flex flex-wrap gap-3 mb-6">
                <!-- مربع البحث -->
                <div class="flex-1 relative">
                    <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <i class="ri-search-line text-gray-400"></i>
                    </div>
                    <input type="text" class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all" placeholder="البحث في ${reportName}..." onfocus="this.style.boxShadow='0 0 0 2px ${colors.bg}40'" onblur="this.style.boxShadow='none'">
                </div>
                
                <button class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <i class="ri-filter-line"></i>
                    <span>تصفية</span>
                </button>
                <button class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <i class="ri-download-line"></i>
                    <span>تصدير</span>
                </button>
                <button class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                    <i class="ri-printer-line"></i>
                    <span>طباعة</span>
                </button>
            </div>
            
            <!-- محتوى التقرير -->
            <div class="bg-white rounded-lg border border-gray-200 p-6 flex-1 overflow-y-auto">
                <div class="text-center text-gray-500 py-12">
                    <i class="${icon} text-6xl mb-4" style="color: ${colors.textLight};"></i>
                    <h3 class="text-xl font-bold mb-2">لا توجد بيانات</h3>
                    <p class="text-gray-400 mb-4">لم يتم العثور على بيانات في ${reportName}</p>
                    <button class="px-6 py-2 text-white rounded-lg transition-colors" style="background-color: ${colors.bg};" onmouseover="this.style.backgroundColor='${colors.bgHover}'" onmouseout="this.style.backgroundColor='${colors.bg}'">
                        <i class="ri-refresh-line ml-2"></i>
                        تحديث البيانات
                    </button>
                </div>
            </div>
        </div>
    `;
}