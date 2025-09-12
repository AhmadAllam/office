// تقارير أوراق المحضرين

// تحديث محتوى تقرير أوراق المحضرين
async function updateClerkPapersReportContent(reportName, reportType) {
    const reportContent = document.getElementById('report-content');
    
    try {
        // جلب بيانات أوراق المحضرين والموكلين
        const clerkPapers = await getAllClerkPapers();
        const clients = await getAllClients();
        
        const colors = { bg: '#059669', bgHover: '#047857', bgLight: '#f0fdf4', text: '#059669', textLight: '#86efac' };
        
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <!-- أدوات التقرير -->
                <div class="flex flex-wrap gap-2 mb-2 md:items-center">
                    <!-- مربع البحث -->
                    <div class="relative w-full md:flex-1">
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i class="ri-search-line text-gray-400"></i>
                        </div>
                        <input type="text" id="clerk-papers-search" class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all" placeholder="البحث في ${reportName}..." onfocus="this.style.boxShadow='0 0 0 2px ${colors.bg}40'" onblur="this.style.boxShadow='none'">
                    </div>
                    
                    <div class="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
                        <button onclick="toggleClerkPapersFilter()" class="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors" id="clerk-papers-filter-btn">
                            <i class="ri-filter-3-line"></i>
                            <span>الكل - الأحدث</span>
                        </button>
                        <button onclick="exportClerkPapersReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-download-line"></i>
                            <span>تصدير</span>
                        </button>
                        <button onclick="printClerkPapersReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-printer-line"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
                
                <!-- محتوى التقرير -->
                <div class="bg-white rounded-lg border border-gray-200 pt-0 pb-6 pl-0 pr-0 relative flex-1 overflow-y-auto" id="clerk-papers-report-content">
                    ${generateClerkPapersReportHTML(clerkPapers, clients)}
                </div>
            </div>
        `;
        
        // إضافة مستمع البحث
        document.getElementById('clerk-papers-search').addEventListener('input', function(e) {
            filterClerkPapersReport(e.target.value, clerkPapers, clients);
        });
        
    } catch (error) {
        console.error('Error loading clerk papers data:', error);
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-white rounded-lg border border-gray-200 p-6 flex-1 overflow-y-auto">
                    <div class="text-center text-red-500 py-12">
                        <i class="ri-error-warning-line text-6xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">خطأ في تحميل البيانات</h3>
                        <p class="text-gray-400">حدث خطأ أثناء تحميل بيانات أوراق المحضرين</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// توليد HTML لتقرير أوراق المحضرين
function generateClerkPapersReportHTML(clerkPapers, clients, sortOrder = 'desc', typeFilter = 'all') {
    if (clerkPapers.length === 0) {
        return `
            <div class="text-center text-gray-500 py-16">
                <div class="mb-6">
                    <i class="ri-file-paper-line text-8xl text-green-200"></i>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-gray-700">لا توجد بيانات</h3>
                <p class="text-gray-400 text-lg">لم يتم العثور على أوراق محضرين</p>
            </div>
        `;
    }
    
    // تصفية البيانات حسب النوع
    let filteredPapers = clerkPapers;
    if (typeFilter !== 'all') {
        filteredPapers = clerkPapers.filter(paper => paper.paperType === typeFilter);
    }
    
    // فرز البيانات
    filteredPapers.sort((a, b) => {
        const dateA = new Date(a.paperDate || a.createdAt);
        const dateB = new Date(b.paperDate || b.createdAt);
        
        if (sortOrder === 'desc') {
            return dateB - dateA; // الأحدث أولاً
        } else {
            return dateA - dateB; // الأقدم أولاً
        }
    });
    
    let tableRows = '';
    filteredPapers.forEach((paper, i) => {
        // تحديد لون الصف بالتناوب
        const rowClass = i % 2 === 0 ? 'bg-gradient-to-l from-green-50 to-emerald-50' : 'bg-white';
        
        // العثور على الموكل
        const client = paper.clientId ? clients.find(c => c.id === paper.clientId) : null;
        const clientName = client ? client.name : 'غير محدد';
        
        // تنسيق التاريخ
        const paperDate = paper.paperDate ? new Date(paper.paperDate).toLocaleDateString('ar-EG') : '-';
        
        // نوع الورقة مع أيقونة
        let typeIcon = 'ri-file-paper-line';
        let typeColor = 'text-green-600';
        
        switch(paper.paperType) {
            case 'إعلان':
                typeIcon = 'ri-notification-line';
                typeColor = 'text-blue-600';
                break;
            case 'إنذار':
            case 'انذار':
                typeIcon = 'ri-alarm-warning-line';
                typeColor = 'text-red-600';
                break;
            case 'تنفيذ':
                typeIcon = 'ri-hammer-line';
                typeColor = 'text-orange-600';
                break;
            case 'تبليغ':
                typeIcon = 'ri-mail-send-line';
                typeColor = 'text-purple-600';
                break;
            case 'حجز':
                typeIcon = 'ri-lock-line';
                typeColor = 'text-gray-600';
                break;
            default:
                typeIcon = 'ri-file-paper-line';
                typeColor = 'text-green-600';
        }
        
        tableRows += `
            <tr class="${rowClass} border-b border-gray-200 hover:bg-gradient-to-l hover:from-green-100 hover:to-emerald-100 transition-all duration-300 hover:shadow-sm">
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-base text-gray-800 hover:text-green-700 transition-colors duration-200">${clientName}</div>
                </td>
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="flex items-center justify-center gap-2 font-medium text-sm ${typeColor}">
                        <i class="${typeIcon}"></i>
                        <span>${paper.paperType || '-'}</span>
                    </div>
                </td>
                <td class="py-4 px-6 text-center">
                    <div class="font-bold text-sm text-gray-700">${paper.paperNumber || '-'}</div>
                </td>
            </tr>
        `;
    });
    
    // حساب الإحصائيات
    const totalPapers = clerkPapers.length;
    
    // حساب الإعلانات
    const totalNotifications = clerkPapers.filter(paper => 
        paper.paperType === 'إعلان'
    ).length;
    
    // حساب الإنذارات
    const totalWarnings = clerkPapers.filter(paper => 
        paper.paperType === 'إنذار' || paper.paperType === 'انذار'
    ).length;
    
    // حساب الأوراق الأخرى (كل شيء عدا الإعلانات والإنذارات)
    const otherPapers = clerkPapers.filter(paper => 
        paper.paperType !== 'إعلان' && 
        paper.paperType !== 'إنذار' && 
        paper.paperType !== 'انذار'
    ).length;
    
    return `
        <div class="clerk-papers-report-container">
            <!-- إحصائيات سريعة -->
            <style>
                @media (max-width:768px){
                    #report-content .clerk-papers-stats-grid{
                        display:grid !important;
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 8px !important;
                    }
                }
                @media (min-width:769px){
                    #report-content .clerk-papers-stats-grid{
                        display:grid !important;
                        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                        gap: 16px !important;
                    }
                }
            </style>
            <div class="clerk-papers-stats-grid mb-6">
                <div class="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <i class="ri-file-paper-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-green-600 font-medium">إجمالي الأوراق</p>
                            <p class="text-lg font-bold text-green-700">${totalPapers}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <i class="ri-notification-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-blue-600 font-medium">إجمالي الإعلانات</p>
                            <p class="text-lg font-bold text-blue-700">${totalNotifications}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-xl border border-red-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <i class="ri-alarm-warning-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-red-600 font-medium">إجمالي الإنذارات</p>
                            <p class="text-lg font-bold text-red-700">${totalWarnings}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 p-3 rounded-xl border border-gray-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center">
                            <i class="ri-file-list-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-gray-600 font-medium">أوراق أخرى</p>
                            <p class="text-lg font-bold text-gray-700">${otherPapers}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- جدول أوراق المحضرين -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
                <table class="w-full border-separate" style="border-spacing: 0;">
                    <thead class="sticky top-0 z-20">
                        <tr class="text-white shadow-lg" style="background-color: #059669 !important;">
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #059669 !important; color: white !important; border-color: #047857 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-user-heart-line text-sm"></i>
                                    <span>الموكل</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #059669 !important; color: white !important; border-color: #047857 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-file-paper-line text-sm"></i>
                                    <span>نوع الورقة</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm" style="background-color: #059669 !important; color: white !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-hashtag text-sm"></i>
                                    <span>رقم الورقة</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="clerk-papers-table-body">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// متغيرات لحفظ حالة فرز وتصفية أوراق المحضرين
let currentClerkPapersSortOrder = 'desc'; // asc أو desc
let currentClerkPapersTypeFilter = 'all'; // all, إعلان, تنفيذ, تبليغ, حجز

// حالات الفرز المدمجة لأوراق المحضرين
const clerkPapersFilterStates = [
    { type: 'all', sort: 'desc', text: 'الكل - الأحدث', icon: 'ri-filter-3-line', color: 'green' },
    { type: 'all', sort: 'asc', text: 'الكل - الأقدم', icon: 'ri-filter-3-line', color: 'green' },
    { type: 'إعلان', sort: 'desc', text: 'إعلان - الأحدث', icon: 'ri-notification-line', color: 'blue' },
    { type: 'إعلان', sort: 'asc', text: 'إعلان - الأقدم', icon: 'ri-notification-line', color: 'blue' },
    { type: 'إنذار', sort: 'desc', text: 'إنذار - الأحدث', icon: 'ri-alarm-warning-line', color: 'red' },
    { type: 'إنذار', sort: 'asc', text: 'إنذار - الأقدم', icon: 'ri-alarm-warning-line', color: 'red' },
    { type: 'تنفيذ', sort: 'desc', text: 'تنفيذ - الأحدث', icon: 'ri-hammer-line', color: 'orange' },
    { type: 'تنفيذ', sort: 'asc', text: 'تنفيذ - الأقدم', icon: 'ri-hammer-line', color: 'orange' },
    { type: 'تبليغ', sort: 'desc', text: 'تبليغ - الأحدث', icon: 'ri-mail-send-line', color: 'purple' },
    { type: 'تبليغ', sort: 'asc', text: 'تبليغ - الأقدم', icon: 'ri-mail-send-line', color: 'purple' }
];

let currentClerkPapersFilterIndex = 0;

// دالة الفرز المدمجة لأوراق المحضرين
async function toggleClerkPapersFilter() {
    try {
        // الانتقال للحالة التالية
        currentClerkPapersFilterIndex = (currentClerkPapersFilterIndex + 1) % clerkPapersFilterStates.length;
        const currentState = clerkPapersFilterStates[currentClerkPapersFilterIndex];
        
        // تحديث المتغيرات
        currentClerkPapersTypeFilter = currentState.type;
        currentClerkPapersSortOrder = currentState.sort;
        
        // جلب البيانات
        const clerkPapers = await getAllClerkPapers();
        const clients = await getAllClients();
        
        // تحديث الزر
        const filterButton = document.getElementById('clerk-papers-filter-btn');
        const icon = filterButton.querySelector('i');
        const text = filterButton.querySelector('span');
        
        icon.className = currentState.icon;
        text.textContent = currentState.text;
        
        // تحديث ألوان الزر
        const colorClasses = {
            green: 'bg-green-100 text-green-700 hover:bg-green-200',
            blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            red: 'bg-red-100 text-red-700 hover:bg-red-200',
            orange: 'bg-orange-100 text-orange-700 hover:bg-orange-200',
            purple: 'bg-purple-100 text-purple-700 hover:bg-purple-200'
        };
        
        filterButton.className = `flex items-center gap-2 px-4 py-2 ${colorClasses[currentState.color]} rounded-lg transition-colors`;
        
        // إعادة إنشاء التقرير
        const reportContent = document.getElementById('clerk-papers-report-content');
        reportContent.innerHTML = generateClerkPapersReportHTML(clerkPapers, clients, currentClerkPapersSortOrder, currentClerkPapersTypeFilter);
        
    } catch (error) {
        console.error('Error toggling clerk papers filter:', error);
        showToast('حدث خطأ أثناء تغيير الفرز', 'error');
    }
}

// تصفية تقرير أوراق المحضرين
function filterClerkPapersReport(searchTerm, clerkPapers, clients) {
    if (!searchTerm.trim()) {
        // إذا كان البحث فارغ، اعرض كل البيانات مع الفرز والتصفية الحالية
        const reportContent = document.getElementById('clerk-papers-report-content');
        reportContent.innerHTML = generateClerkPapersReportHTML(clerkPapers, clients, currentClerkPapersSortOrder, currentClerkPapersTypeFilter);
        return;
    }
    
    // تصفية الأوراق بناءً على البحث
    const filteredPapers = clerkPapers.filter(paper => {
        const client = paper.clientId ? clients.find(c => c.id === paper.clientId) : null;
        const clientName = client ? client.name.toLowerCase() : '';
        const paperType = paper.paperType ? paper.paperType.toLowerCase() : '';
        const paperNumber = paper.paperNumber ? paper.paperNumber.toLowerCase() : '';
        const clerkOffice = paper.clerkOffice ? paper.clerkOffice.toLowerCase() : '';
        const notes = paper.notes ? paper.notes.toLowerCase() : '';
        
        const searchLower = searchTerm.toLowerCase();
        
        return clientName.includes(searchLower) || 
               paperType.includes(searchLower) || 
               paperNumber.includes(searchLower) || 
               clerkOffice.includes(searchLower) || 
               notes.includes(searchLower);
    });
    
    const reportContent = document.getElementById('clerk-papers-report-content');
    reportContent.innerHTML = generateClerkPapersReportHTML(filteredPapers, clients, currentClerkPapersSortOrder, currentClerkPapersTypeFilter);
}

// طباعة تقرير أوراق المحضرين
async function printClerkPapersReport() {
    try {
        // جلب البيانات لحساب الإحصائيات
        const clerkPapers = await getAllClerkPapers();
        const clients = await getAllClients();
        
        // حساب الإحصائيات
        const totalPapers = clerkPapers.length;
        
        // حساب الإعلانات
        const totalNotifications = clerkPapers.filter(paper => 
            paper.paperType === 'إعلان'
        ).length;
        
        // حساب الإنذارات
        const totalWarnings = clerkPapers.filter(paper => 
            paper.paperType === 'إنذار' || paper.paperType === 'انذار'
        ).length;
        
        // حساب الأوراق الأخرى
        const otherPapers = clerkPapers.filter(paper => 
            paper.paperType !== 'إعلان' && 
            paper.paperType !== 'إنذار' && 
            paper.paperType !== 'انذار'
        ).length;
        
        // إنشاء نسخة من المحتوى بدون الإحصائيات العلوية
        const originalContent = document.getElementById('clerk-papers-report-content');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalContent.innerHTML;
        
        // إزالة الإحصائيات العلوية من المحتوى
        const statsGrid = tempDiv.querySelector('.grid');
        if (statsGrid) {
            statsGrid.remove();
        }
        
        const printContent = tempDiv.innerHTML;
        const printWindow = window.open('', '_blank');
        
        // جلب اسم المكتب من localStorage أو استخدام اسم افتراضي
        const officeName = localStorage.getItem('officeName') || 'مكتب المحاماة';
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>تقرير أوراق المحضرين - ${new Date().toLocaleDateString('ar-EG')}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 0.5cm 0.7cm;
                    }
                    
                    body {
                        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                        direction: rtl;
                        text-align: right;
                        margin: 0;
                        padding: 0;
                        background: white;
                        color: #333;
                        line-height: 1.2;
                        font-size: 10px;
                    }
                    
                    .print-header {
                        display: flex;
                        justify-content: space-between;
                        align-items: center;
                        margin-bottom: 8px;
                        padding: 3px 0;
                        border-bottom: 2px solid #059669;
                        height: 20px;
                    }
                    
                    .report-title {
                        color: #059669;
                        font-size: 14px;
                        margin: 0;
                        font-weight: bold;
                    }
                    
                    .print-date {
                        color: #666;
                        font-size: 9px;
                        text-align: left;
                    }
                    
                    .stats-summary {
                        display: flex;
                        justify-content: space-between;
                        margin: 8px 0 12px 0;
                        padding: 8px;
                        background: #f8f9fa;
                        border: 1px solid #059669;
                        border-radius: 4px;
                        font-size: 9px;
                    }
                    
                    .stat-box {
                        text-align: center;
                        flex: 1;
                        padding: 0 8px;
                        border-left: 1px solid #059669;
                    }
                    
                    .stat-box:last-child {
                        border-left: none;
                    }
                    
                    .stat-label {
                        color: #666;
                        font-size: 8px;
                        margin-bottom: 2px;
                        font-weight: normal;
                    }
                    
                    .stat-value {
                        color: #059669;
                        font-size: 10px;
                        font-weight: bold;
                    }
                    
                    table {
                        width: 100%;
                        border-collapse: collapse;
                        margin: 5px 0;
                        font-size: 9px;
                        border: 1px solid #333;
                    }
                    
                    th {
                        background: #059669;
                        color: white;
                        padding: 6px 4px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 9px;
                        border: 1px solid #047857;
                    }
                    
                    td {
                        padding: 4px 4px;
                        border: 1px solid #ccc;
                        text-align: center;
                        font-size: 8px;
                        color: #333;
                    }
                    
                    tr:nth-child(even) td {
                        background: #f9f9f9;
                    }
                    
                    .print-footer {
                        position: fixed;
                        bottom: 0.3cm;
                        left: 0;
                        right: 0;
                        text-align: center;
                        font-size: 7px;
                        color: #666;
                        height: 12px;
                        padding: 1px 0;
                        border-top: 1px solid #ddd;
                    }
                    
                    .office-name {
                        font-weight: bold;
                        margin-bottom: 1px;
                        color: #333;
                        font-size: 7px;
                    }
                    
                    .page-number {
                        font-size: 6px;
                        color: #999;
                    }
                    
                    @media print {
                        body { 
                            -webkit-print-color-adjust: exact;
                            print-color-adjust: exact;
                        }
                        
                        .stats-summary {
                            break-inside: avoid;
                        }
                        
                        table {
                            break-inside: auto;
                        }
                        
                        tr {
                            break-inside: avoid;
                            break-after: auto;
                        }
                        
                        thead {
                            display: table-header-group;
                        }
                        
                        tfoot {
                            display: table-footer-group;
                        }
                    }
                </style>
            </head>
            <body>
                <div class="print-header">
                    <div class="report-title">تقرير أوراق المحضرين</div>
                    <div class="print-date">${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                
                <!-- الإحصائيات في سطر واحد -->
                <div class="stats-summary">
                    <div class="stat-box">
                        <div class="stat-label">إجمالي الأوراق</div>
                        <div class="stat-value">${totalPapers}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">إجمالي الإعلانات</div>
                        <div class="stat-value">${totalNotifications}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">إجمالي الإنذارات</div>
                        <div class="stat-value">${totalWarnings}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">أوراق أخرى</div>
                        <div class="stat-value">${otherPapers}</div>
                    </div>
                </div>
                
                ${printContent}
                
                <div class="print-footer">
                    <div class="office-name">${officeName}</div>
                    <div class="page-number">صفحة <span id="page-number">1</span></div>
                </div>
            </body>
            </html>
        `);
        
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
            printWindow.print();
            printWindow.close();
        }, 500);
        
    } catch (error) {
        console.error('Error printing clerk papers report:', error);
        showToast('حدث خطأ أثناء طباعة التقرير', 'error');
    }
}

// تصدير تقرير أوراق المحضرين
async function exportClerkPapersReport() {
    try {
        const clerkPapers = await getAllClerkPapers();
        const clients = await getAllClients();
        
        // تصفية البيانات حسب النوع الحالي
        let filteredPapers = clerkPapers;
        if (currentClerkPapersTypeFilter !== 'all') {
            filteredPapers = clerkPapers.filter(paper => paper.paperType === currentClerkPapersTypeFilter);
        }
        
        // فرز البيانات
        filteredPapers.sort((a, b) => {
            const dateA = new Date(a.paperDate || a.createdAt);
            const dateB = new Date(b.paperDate || b.createdAt);
            
            if (currentClerkPapersSortOrder === 'desc') {
                return dateB - dateA;
            } else {
                return dateA - dateB;
            }
        });
        
        // إنشاء ملف Excel بتنسيق بسيط
        let excelContent = `
            <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
            <head>
                <meta charset="UTF-8">
                <meta name="ProgId" content="Excel.Sheet">
                <meta name="Generator" content="Microsoft Excel 15">
                <!--[if gte mso 9]>
                <xml>
                    <x:ExcelWorkbook>
                        <x:ExcelWorksheets>
                            <x:ExcelWorksheet>
                                <x:Name>تقرير أوراق المحضرين</x:Name>
                                <x:WorksheetOptions>
                                    <x:DisplayGridlines/>
                                    <x:Print>
                                        <x:ValidPrinterInfo/>
                                        <x:PaperSizeIndex>9</x:PaperSizeIndex>
                                    </x:Print>
                                </x:WorksheetOptions>
                            </x:ExcelWorksheet>
                        </x:ExcelWorksheets>
                    </x:ExcelWorkbook>
                </xml>
                <![endif]-->
                <style>
                    table {
                        border-collapse: collapse;
                        direction: rtl;
                        font-family: Arial, sans-serif;
                        font-size: 18px;
                        mso-table-lspace: 0pt;
                        mso-table-rspace: 0pt;
                    }
                    th {
                        background: #059669;
                        background-color: #059669;
                        color: #FFFFFF;
                        border: 2px solid #047857;
                        padding: 10px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 21px;
                        width: auto;
                        mso-background-source: auto;
                    }
                    td {
                        border: 1px solid #cccccc;
                        padding: 8px;
                        text-align: center;
                        vertical-align: middle;
                        width: auto;
                        background: #FFFFFF;
                        background-color: #FFFFFF;
                    }
                    .empty-cell {
                        color: #999999;
                        font-style: italic;
                        text-align: center;
                        background: #F8F8F8;
                        background-color: #F8F8F8;
                    }
                </style>
            </head>
            <body>
                <table>
                    <tr>
                        <th style="background-color: #059669; color: #FFFFFF; border: 2px solid #047857; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">الموكل</th>
                        <th style="background-color: #059669; color: #FFFFFF; border: 2px solid #047857; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">نوع الورقة</th>
                        <th style="background-color: #059669; color: #FFFFFF; border: 2px solid #047857; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">رقم الورقة</th>
                    </tr>
        `;
        
        // إضافة البيانات
        filteredPapers.forEach((paper) => {
            const client = paper.clientId ? clients.find(c => c.id === paper.clientId) : null;
            const clientName = client ? client.name : 'غير محدد';
            const paperType = paper.paperType || 'غير محدد';
            const paperNumber = paper.paperNumber || 'غير محدد';
            
            const clientStyle = client ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            const typeStyle = paper.paperType ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            const numberStyle = paper.paperNumber ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            excelContent += `
                <tr>
                    <td ${clientStyle}>${clientName}</td>
                    <td ${typeStyle}>${paperType}</td>
                    <td ${numberStyle}>${paperNumber}</td>
                </tr>
            `;
        });
        
        excelContent += `
                </table>
            </body>
            </html>
        `;
        
        // تحميل الملف
        const blob = new Blob([excelContent], { 
            type: 'application/vnd.ms-excel;charset=utf-8;' 
        });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `تقرير_أوراق_المحضرين_${new Date().toISOString().split('T')[0]}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('تم تصدير التقرير بنجاح', 'success');
        
    } catch (error) {
        console.error('Error exporting clerk papers report:', error);
        showToast('حدث خطأ أثناء تصدير التقرير', 'error');
    }
}