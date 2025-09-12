// تقارير الأعمال الإدارية

// تحديث محتوى تقرير الأعمال الإدارية
async function updateAdministrativeReportContent(reportName, reportType) {
    const reportContent = document.getElementById('report-content');
    
    try {
        // جلب بيانات الأعمال الإدارية والموكلين
        const administrative = await getAllAdministrative();
        const clients = await getAllClients();
        
        const colors = { bg: '#6366f1', bgHover: '#4f46e5', bgLight: '#f8fafc', text: '#4f46e5', textLight: '#a5b4fc' };
        
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <!-- أدوات التقرير -->
                <div class="flex flex-wrap gap-2 mb-2 md:items-center">
                    <!-- مربع البحث -->
                    <div class="relative w-full md:flex-1">
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i class="ri-search-line text-gray-400"></i>
                        </div>
                        <input type="text" id="administrative-search" class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all" placeholder="البحث في ${reportName}..." onfocus="this.style.boxShadow='0 0 0 2px ${colors.bg}40'" onblur="this.style.boxShadow='none'">
                    </div>
                    <div class="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
                        <button onclick="toggleAdministrativeFilter()" class="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors" id="administrative-filter-btn">
                            <i class="ri-filter-3-line"></i>
                            <span>الكل - الأحدث</span>
                        </button>
                        <button onclick="exportAdministrativeReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-download-line"></i>
                            <span>تصدير</span>
                        </button>
                        <button onclick="printAdministrativeReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-printer-line"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
                
                <!-- محتوى التقرير -->
                <div class="bg-white rounded-lg border border-gray-200 pt-0 pb-6 pl-0 pr-0 relative flex-1 overflow-y-auto" id="administrative-report-content">
                    ${generateAdministrativeReportHTML(administrative, clients)}
                </div>
            </div>
        `;
        
        // إضافة مستمع البحث
        document.getElementById('administrative-search').addEventListener('input', function(e) {
            filterAdministrativeReport(e.target.value, administrative, clients);
        });
        
    } catch (error) {
        console.error('Error loading administrative data:', error);
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-white rounded-lg border border-gray-200 p-6 flex-1 overflow-y-auto">
                    <div class="text-center text-red-500 py-12">
                        <i class="ri-error-warning-line text-6xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">خطأ في تحميل البيانات</h3>
                        <p class="text-gray-400">حدث خطأ أثناء تحميل بيانات الأعمال الإدارية</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// توليد HTML لتقرير الأعمال الإدارية
function generateAdministrativeReportHTML(administrative, clients, sortOrder = 'desc', statusFilter = 'all') {
    if (administrative.length === 0) {
        return `
            <div class="text-center text-gray-500 py-16">
                <div class="mb-6">
                    <i class="ri-briefcase-line text-8xl text-indigo-200"></i>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-gray-700">لا توجد بيانات</h3>
                <p class="text-gray-400 text-lg">لم يتم العثور على أعمال إدارية</p>
            </div>
        `;
    }
    
    // تصفية البيانات حسب الحالة
    let filteredAdministrative = administrative;
    if (statusFilter === 'completed') {
        filteredAdministrative = administrative.filter(work => work.completed === true);
    } else if (statusFilter === 'pending') {
        filteredAdministrative = administrative.filter(work => work.completed === false);
    }
    
    // فرز البيانات
    filteredAdministrative.sort((a, b) => {
        const dateA = new Date(a.dueDate || a.createdAt);
        const dateB = new Date(b.dueDate || b.createdAt);
        
        if (sortOrder === 'desc') {
            return dateB - dateA; // الأحدث أولاً
        } else {
            return dateA - dateB; // الأقدم أولاً
        }
    });
    
    let tableRows = '';
    filteredAdministrative.forEach((work, i) => {
        // تحديد لون الصف بالتناوب
        const rowClass = i % 2 === 0 ? 'bg-gradient-to-l from-indigo-50 to-blue-50' : 'bg-white';
        
        // العثور على الموكل
        const client = work.clientId ? clients.find(c => c.id === work.clientId) : null;
        const clientName = client ? client.name : 'عام';
        
        // تنسيق التاريخ
        const dueDate = work.dueDate ? new Date(work.dueDate).toLocaleDateString('ar-EG') : '-';
        
        // حالة الإنجاز
        const statusIcon = work.completed ? 
            '<i class="ri-checkbox-circle-fill text-green-600"></i>' : 
            '<i class="ri-time-line text-orange-600"></i>';
        const statusText = work.completed ? 'مكتمل' : 'قيد التنفيذ';
        const statusColor = work.completed ? 'text-green-600' : 'text-orange-600';
        
        // تحديد لون الأولوية حسب تاريخ الاستحقاق
        let priorityColor = 'text-gray-600';
        let priorityIcon = 'ri-calendar-line';
        if (work.dueDate && !work.completed) {
            const today = new Date();
            const due = new Date(work.dueDate);
            const diffDays = Math.ceil((due - today) / (1000 * 60 * 60 * 24));
            
            if (diffDays < 0) {
                priorityColor = 'text-red-600';
                priorityIcon = 'ri-alarm-warning-line';
            } else if (diffDays <= 3) {
                priorityColor = 'text-orange-600';
                priorityIcon = 'ri-time-line';
            } else if (diffDays <= 7) {
                priorityColor = 'text-yellow-600';
                priorityIcon = 'ri-calendar-check-line';
            } else {
                priorityColor = 'text-green-600';
                priorityIcon = 'ri-calendar-line';
            }
        }
        
        // تحديد نص المهمة
        const taskText = work.description || 'مهمة إدارية';
        
        tableRows += `
            <tr class="${rowClass} border-b border-gray-200 hover:bg-gradient-to-l hover:from-indigo-100 hover:to-blue-100 transition-all duration-300 hover:shadow-sm">
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-base text-gray-800 hover:text-indigo-700 transition-colors duration-200" title="${taskText}">${taskText}${work.notes ? ` - ${work.notes}` : ''}</div>
                </td>
                <td class="py-4 px-6 text-center">
                    <div class="flex items-center justify-center gap-2 font-bold text-sm ${statusColor}">
                        ${statusIcon}
                        <span>${statusText}${work.dueDate ? ` (${dueDate})` : ''}</span>
                    </div>
                </td>
            </tr>
        `;
    });
    
    // حساب الإحصائيات
    const totalWorks = administrative.length;
    const completedWorks = administrative.filter(work => work.completed === true).length;
    const pendingWorks = administrative.filter(work => work.completed === false).length;
    const overdueWorks = administrative.filter(work => {
        if (work.completed || !work.dueDate) return false;
        const today = new Date();
        const due = new Date(work.dueDate);
        return due < today;
    }).length;
    
    return `
        <div class="administrative-report-container">
            <!-- إحصائيات سريعة -->
            <style>
                @media (max-width:768px){
                    #report-content .administrative-stats-grid{
                        display:grid !important;
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 8px !important;
                    }
                }
                @media (min-width:769px){
                    #report-content .administrative-stats-grid{
                        display:grid !important;
                        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                        gap: 16px !important;
                    }
                }
            </style>
            <div class="administrative-stats-grid mb-6">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <i class="ri-briefcase-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-blue-600 font-medium">إجمالي الأعمال</p>
                            <p class="text-lg font-bold text-blue-700">${totalWorks}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <i class="ri-checkbox-circle-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-green-600 font-medium">مكتملة</p>
                            <p class="text-lg font-bold text-green-700">${completedWorks}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-yellow-50 to-yellow-100 p-3 rounded-xl border border-yellow-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-yellow-600 rounded-full flex items-center justify-center">
                            <i class="ri-time-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-yellow-600 font-medium">قيد التنفيذ</p>
                            <p class="text-lg font-bold text-yellow-700">${pendingWorks}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-xl border border-red-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <i class="ri-alarm-warning-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-red-600 font-medium">متأخرة</p>
                            <p class="text-lg font-bold text-red-700">${overdueWorks}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- جدول الأعمال الإدارية -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
                <table class="w-full border-separate" style="border-spacing: 0;">
                    <thead class="sticky top-0 z-20">
                        <tr class="text-white shadow-lg" style="background-color: #6366f1 !important;">
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #6366f1 !important; color: white !important; border-color: #4f46e5 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-task-line text-sm"></i>
                                    <span>المهمة</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm" style="background-color: #6366f1 !important; color: white !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-checkbox-circle-line text-sm"></i>
                                    <span>الحالة</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="administrative-table-body">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// متغيرات لحفظ حالة فرز وتصفية الأعمال الإدارية
let currentAdministrativeSortOrder = 'desc'; // asc أو desc
let currentAdministrativeStatusFilter = 'all'; // all, completed, pending

// حالات الفرز المدمجة
const administrativeFilterStates = [
    { status: 'all', sort: 'desc', text: 'الكل - الأحدث', icon: 'ri-filter-3-line', color: 'blue' },
    { status: 'all', sort: 'asc', text: 'الكل - الأقدم', icon: 'ri-filter-3-line', color: 'blue' },
    { status: 'completed', sort: 'desc', text: 'مكتملة - الأحدث', icon: 'ri-checkbox-circle-fill', color: 'green' },
    { status: 'completed', sort: 'asc', text: 'مكتملة - الأقدم', icon: 'ri-checkbox-circle-fill', color: 'green' },
    { status: 'pending', sort: 'desc', text: 'قيد التنفيذ - الأحدث', icon: 'ri-time-line', color: 'yellow' },
    { status: 'pending', sort: 'asc', text: 'قيد التنفيذ - الأقدم', icon: 'ri-time-line', color: 'yellow' }
];

let currentAdministrativeFilterIndex = 0;

// دالة الفرز المدمجة للأعمال الإدارية
async function toggleAdministrativeFilter() {
    try {
        // الانتقال للحالة التالية
        currentAdministrativeFilterIndex = (currentAdministrativeFilterIndex + 1) % administrativeFilterStates.length;
        const currentState = administrativeFilterStates[currentAdministrativeFilterIndex];
        
        // تحديث المتغيرات
        currentAdministrativeStatusFilter = currentState.status;
        currentAdministrativeSortOrder = currentState.sort;
        
        // جلب البيانات
        const administrative = await getAllAdministrative();
        const clients = await getAllClients();
        
        // تحديث الزر
        const filterButton = document.getElementById('administrative-filter-btn');
        const icon = filterButton.querySelector('i');
        const text = filterButton.querySelector('span');
        
        icon.className = currentState.icon;
        text.textContent = currentState.text;
        
        // تحديث ألوان الزر
        const colorClasses = {
            blue: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
            green: 'bg-green-100 text-green-700 hover:bg-green-200',
            yellow: 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
        };
        
        filterButton.className = `flex items-center gap-2 px-4 py-2 ${colorClasses[currentState.color]} rounded-lg transition-colors`;
        
        // إعادة إنشاء التقرير
        const reportContent = document.getElementById('administrative-report-content');
        reportContent.innerHTML = generateAdministrativeReportHTML(administrative, clients, currentAdministrativeSortOrder, currentAdministrativeStatusFilter);
        
    } catch (error) {
        console.error('Error toggling administrative filter:', error);
        showToast('حدث خطأ أثناء تغيير الفرز', 'error');
    }
}

// تصفية تقرير الأعمال الإدارية
function filterAdministrativeReport(searchTerm, administrative, clients) {
    if (!searchTerm.trim()) {
        // إذا كان البحث فارغ، اعرض كل البيانات مع الفرز والتصفية الحالية
        const reportContent = document.getElementById('administrative-report-content');
        reportContent.innerHTML = generateAdministrativeReportHTML(administrative, clients, currentAdministrativeSortOrder, currentAdministrativeStatusFilter);
        return;
    }
    
    // تصفية الأعمال بناءً على البحث
    const filteredAdministrative = administrative.filter(work => {
        const client = work.clientId ? clients.find(c => c.id === work.clientId) : null;
        const clientName = client ? client.name.toLowerCase() : 'عام';
        const description = work.description ? work.description.toLowerCase() : '';
        const notes = work.notes ? work.notes.toLowerCase() : '';
        
        const searchLower = searchTerm.toLowerCase();
        
        return clientName.includes(searchLower) || 
               description.includes(searchLower) || 
               notes.includes(searchLower);
    });
    
    const reportContent = document.getElementById('administrative-report-content');
    reportContent.innerHTML = generateAdministrativeReportHTML(filteredAdministrative, clients, currentAdministrativeSortOrder, currentAdministrativeStatusFilter);
}

// طباعة تقرير الأعمال الإدارية
async function printAdministrativeReport() {
    try {
        // جلب البيانات لحساب الإحصائيات
        const administrative = await getAllAdministrative();
        const clients = await getAllClients();
        
        // حساب الإحصائيات
        const totalWorks = administrative.length;
        const completedWorks = administrative.filter(work => work.completed === true).length;
        const pendingWorks = administrative.filter(work => work.completed === false).length;
        const overdueWorks = administrative.filter(work => {
            if (work.completed || !work.dueDate) return false;
            const today = new Date();
            const due = new Date(work.dueDate);
            return due < today;
        }).length;
        
        // إنشاء نسخة من المحتوى بدون الإحصائيات العلوية
        const originalContent = document.getElementById('administrative-report-content');
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = originalContent.innerHTML;
        
        // إزالة الإحصائيات العلوية من المحتوى (سنضعها في مكان آخر)
        const statsGrid = tempDiv.querySelector('.grid');
        if (statsGrid) {
            statsGrid.remove();
        }
        
        // إزالة العناوين والتواريخ المكررة من المحتوى
        const headers = tempDiv.querySelectorAll('.print-header, .report-title, .print-date');
        headers.forEach(header => header.remove());
        
        const printContent = tempDiv.innerHTML;
        const printWindow = window.open('', '_blank');
        
        // جلب اسم المكتب من localStorage أو استخدام اسم افتراضي
        const officeName = localStorage.getItem('officeName') || 'مكتب المحاماة';
        
        printWindow.document.write(`
            <!DOCTYPE html>
            <html dir="rtl" lang="ar">
            <head>
                <meta charset="UTF-8">
                <title>تقرير الأعمال الإدارية - ${new Date().toLocaleDateString('ar-EG')}</title>
                <style>
                    @page {
                        size: A4;
                        margin: 0.5cm 0.7cm;
                        @top-left { content: ""; }
                        @top-center { content: ""; }
                        @top-right { content: ""; }
                        @bottom-left { content: ""; }
                        @bottom-center { content: ""; }
                        @bottom-right { content: ""; }
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
                        border-bottom: 2px solid #6366f1;
                        height: 20px;
                    }
                    
                    .report-title {
                        color: #6366f1;
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
                        border: 1px solid #6366f1;
                        border-radius: 4px;
                        font-size: 9px;
                    }
                    
                    .stat-box {
                        text-align: center;
                        flex: 1;
                        padding: 0 8px;
                        border-left: 1px solid #6366f1;
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
                        color: #6366f1;
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
                        background: #6366f1;
                        color: white;
                        padding: 6px 4px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 9px;
                        border: 1px solid #4f46e5;
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
                    <div class="report-title">تقرير الأعمال الإدارية</div>
                    <div class="print-date">${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                
                <!-- الإحصائيات في سطر واحد -->
                <div class="stats-summary">
                    <div class="stat-box">
                        <div class="stat-label">إجمالي الأعمال</div>
                        <div class="stat-value">${totalWorks}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">مكتملة</div>
                        <div class="stat-value">${completedWorks}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">قيد التنفيذ</div>
                        <div class="stat-value">${pendingWorks}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">متأخرة</div>
                        <div class="stat-value">${overdueWorks}</div>
                    </div>
                </div>
                
                ${printContent}
                
                <div class="print-footer">
                    <div class="office-name">${officeName}</div>
                    <div class="page-number">صفحة <span id="page-number">1</span></div>
                </div>
                
                <script>
                    // إضافة أرقام الصفحات
                    window.onload = function() {
                        let pageNumber = 1;
                        const pageElements = document.querySelectorAll('#page-number');
                        pageElements.forEach(el => {
                            el.textContent = pageNumber++;
                        });
                    };
                </script>
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
        console.error('Error printing administrative report:', error);
        showToast('حدث خطأ أثناء طباعة التقرير', 'error');
    }
}

// تصدير تقرير الأعمال الإدارية
async function exportAdministrativeReport() {
    try {
        const administrative = await getAllAdministrative();
        const clients = await getAllClients();
        
        // تصفية البيانات حسب الحالة الحالية
        let filteredAdministrative = administrative;
        if (currentAdministrativeStatusFilter === 'completed') {
            filteredAdministrative = administrative.filter(work => work.completed === true);
        } else if (currentAdministrativeStatusFilter === 'pending') {
            filteredAdministrative = administrative.filter(work => work.completed === false);
        }
        
        // فرز البيانات
        filteredAdministrative.sort((a, b) => {
            const dateA = new Date(a.dueDate || a.createdAt);
            const dateB = new Date(b.dueDate || b.createdAt);
            
            if (currentAdministrativeSortOrder === 'desc') {
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
                                <x:Name>تقرير الأعمال الإدارية</x:Name>
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
                        background: #6366f1;
                        background-color: #6366f1;
                        color: #FFFFFF;
                        border: 2px solid #4f46e5;
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
                        <th style="background-color: #6366f1; color: #FFFFFF; border: 2px solid #4f46e5; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">المهمة</th>
                        <th style="background-color: #6366f1; color: #FFFFFF; border: 2px solid #4f46e5; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">الحالة</th>
                        <th style="background-color: #6366f1; color: #FFFFFF; border: 2px solid #4f46e5; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">تاريخ الاستحقاق</th>
                        <th style="background-color: #6366f1; color: #FFFFFF; border: 2px solid #4f46e5; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">الملاحظات</th>
                    </tr>
        `;
        
        // إضافة البيانات
        filteredAdministrative.forEach((work) => {
            const taskText = work.description || 'مهمة إدارية';
            const status = work.completed ? 'مكتمل' : 'قيد التنفيذ';
            const dueDate = work.dueDate ? new Date(work.dueDate).toLocaleDateString('ar-EG') : '-';
            const notes = work.notes || '-';
            
            excelContent += `
                <tr>
                    <td style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;">${taskText}</td>
                    <td style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;">${status}</td>
                    <td style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;">${dueDate}</td>
                    <td style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;">${notes}</td>
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
        link.setAttribute('download', `تقرير_الأعمال_الإدارية_${new Date().toISOString().split('T')[0]}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('تم تصدير التقرير بنجاح', 'success');
        
    } catch (error) {
        console.error('Error exporting administrative report:', error);
        showToast('حدث خطأ أثناء تصدير التقرير', 'error');
    }
}