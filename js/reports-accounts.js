// تقارير الحسابات

// تحديث محتوى تقرير الحسابات
async function updateAccountsReportContent(reportName, reportType) {
    const reportContent = document.getElementById('report-content');
    
    try {
        // جلب بيانات الحسابات والموكلين
        const accounts = await getAllAccounts();
        const clients = await getAllClients();
        
        const colors = { bg: '#14b8a6', bgHover: '#0d9488', bgLight: '#f0fdfa', text: '#0d9488', textLight: '#7dd3fc' };
        
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <!-- أدوات التقرير -->
                <div class="flex flex-wrap gap-2 mb-2 md:items-center">
                    <!-- مربع البحث -->
                    <div class="relative w-full md:flex-1">
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i class="ri-search-line text-gray-400"></i>
                        </div>
                        <input type="text" id="accounts-search" class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all" placeholder="البحث في ${reportName}..." onfocus="this.style.boxShadow='0 0 0 2px ${colors.bg}40'" onblur="this.style.boxShadow='none'">
                    </div>
                    <div class="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
                        <button onclick="toggleAccountsSort()" class="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            <i class="ri-time-line"></i>
                            <span>الأحدث</span>
                        </button>
                        <button onclick="exportAccountsReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-download-line"></i>
                            <span>تصدير</span>
                        </button>
                        <button onclick="printAccountsReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-printer-line"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
                
                <!-- محتوى التقرير -->
                <div class="bg-white rounded-lg border border-gray-200 pt-0 pb-6 pl-0 pr-0 relative flex-1 overflow-y-auto" id="accounts-report-content">
                    ${generateAccountsReportHTML(accounts, clients)}
                </div>
            </div>
        `;
        
        // إضافة مستمع البحث
        document.getElementById('accounts-search').addEventListener('input', function(e) {
            filterAccountsReport(e.target.value, accounts, clients);
        });
        
    } catch (error) {
        console.error('Error loading accounts data:', error);
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-white rounded-lg border border-gray-200 p-6 flex-1 overflow-y-auto">
                    <div class="text-center text-red-500 py-12">
                        <i class="ri-error-warning-line text-6xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">خطأ في تحميل البيانات</h3>
                        <p class="text-gray-400">حدث خطأ أثناء تحميل بيانات الحسابات</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// توليد HTML لتقرير الحسابات
function generateAccountsReportHTML(accounts, clients, sortOrder = 'desc') {
    if (accounts.length === 0) {
        return `
            <div class="text-center text-gray-500 py-16">
                <div class="mb-6">
                    <i class="ri-wallet-3-line text-8xl text-teal-200"></i>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-gray-700">لا توجد بيانات</h3>
                <p class="text-gray-400 text-lg">لم يتم العثور على بيانات الحسابات</p>
            </div>
        `;
    }
    
    // تجميع الحسابات حسب الموكل
    const clientGroups = {};
    
    for (const account of accounts) {
        const client = clients.find(c => c.id === account.clientId);
        
        if (!client) continue;
        
        if (!clientGroups[client.id]) {
            clientGroups[client.id] = {
                client: client,
                totalFees: 0,
                totalExpenses: 0,
                totalRemaining: 0
            };
        }
        
        clientGroups[client.id].totalFees += account.paidFees || 0;
        clientGroups[client.id].totalExpenses += account.expenses || 0;
        clientGroups[client.id].totalRemaining += account.remaining || 0;
    }
    
    // تحويل إلى مصفوفة وفرز البيانات
    let clientsData = Object.values(clientGroups);
    clientsData.sort((a, b) => {
        const dateA = new Date(a.client.createdAt || a.client.id);
        const dateB = new Date(b.client.createdAt || b.client.id);
        
        if (sortOrder === 'desc') {
            return dateB - dateA; // الأحدث أولاً
        } else {
            return dateA - dateB; // الأقدم أولاً
        }
    });
    
    let tableRows = '';
    clientsData.forEach((clientData, i) => {
        // تحديد لون الصف بالتناوب
        const rowClass = i % 2 === 0 ? 'bg-gradient-to-l from-teal-50 to-cyan-50' : 'bg-white';
        
        // حساب الأرباح (الأتعاب - المصروفات)
        const profits = clientData.totalFees - clientData.totalExpenses;
        
        tableRows += `
            <tr class="${rowClass} border-b border-gray-200 hover:bg-gradient-to-l hover:from-teal-100 hover:to-cyan-100 transition-all duration-300 hover:shadow-sm">
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-lg text-gray-800 hover:text-teal-700 transition-colors duration-200 truncate" title="${clientData.client.name}">${clientData.client.name}</div>
                </td>
                <td class="py-4 px-4 text-center border-l border-gray-200">
                    <div class="font-bold text-base text-blue-600 hover:text-blue-700 transition-colors duration-200">${clientData.totalFees.toLocaleString()}</div>
                </td>
                <td class="py-4 px-4 text-center border-l border-gray-200">
                    <div class="font-bold text-base text-red-600 hover:text-red-700 transition-colors duration-200">${clientData.totalExpenses.toLocaleString()}</div>
                </td>
                <td class="py-4 px-4 text-center">
                    <div class="font-bold text-base ${profits >= 0 ? 'text-green-600 hover:text-green-700' : 'text-red-600 hover:text-red-700'} transition-colors duration-200">
                        ${profits.toLocaleString()}
                        ${profits >= 0 ? '<i class="ri-arrow-up-line text-sm mr-1"></i>' : '<i class="ri-arrow-down-line text-sm mr-1"></i>'}
                    </div>
                </td>
            </tr>
        `;
    });
    
    // حساب الإجماليات
    const grandTotalFees = clientsData.reduce((sum, client) => sum + client.totalFees, 0);
    const grandTotalExpenses = clientsData.reduce((sum, client) => sum + client.totalExpenses, 0);
    const grandTotalProfits = grandTotalFees - grandTotalExpenses;
    
    return `
        <div class="accounts-report-container">
            <!-- إحصائيات سريعة -->
            <style>
                @media (max-width:768px){
                    #report-content .accounts-stats-grid{
                        display:grid !important;
                        grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
                        gap: 8px !important;
                    }
                }
                @media (min-width:769px){
                    #report-content .accounts-stats-grid{
                        display:grid !important;
                        grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
                        gap: 16px !important;
                    }
                }
            </style>
            <div class="accounts-stats-grid mb-6">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-3 rounded-xl border border-blue-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                            <i class="ri-money-dollar-circle-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-blue-600 font-medium">الأتعاب</p>
                            <p class="text-lg font-bold text-blue-700">${grandTotalFees.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-red-50 to-red-100 p-3 rounded-xl border border-red-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                            <i class="ri-shopping-cart-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-red-600 font-medium">المصروفات</p>
                            <p class="text-lg font-bold text-red-700">${grandTotalExpenses.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-green-50 to-green-100 p-3 rounded-xl border border-green-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center">
                            <i class="ri-line-chart-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-green-600 font-medium">الأرباح</p>
                            <p class="text-lg font-bold text-green-700">${grandTotalProfits.toLocaleString()}</p>
                        </div>
                    </div>
                </div>
                
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-3 rounded-xl border border-purple-200">
                    <div class="flex items-center gap-3">
                        <div class="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
                            <i class="ri-group-line text-white text-lg"></i>
                        </div>
                        <div>
                            <p class="text-sm text-purple-600 font-medium">الموكلين</p>
                            <p class="text-lg font-bold text-purple-700">${clientsData.length}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- جدول الحسابات -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
                <table class="w-full border-separate" style="border-spacing: 0;">
                    <thead class="sticky top-0 z-20">
                        <tr class="text-white shadow-lg" style="background-color: #14b8a6 !important;">
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #14b8a6 !important; color: white !important; border-color: #0d9488 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-user-heart-line text-sm"></i>
                                    <span>اسم الموكل</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #14b8a6 !important; color: white !important; border-color: #0d9488 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-money-dollar-circle-line text-sm"></i>
                                    <span>الأتعاب</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #14b8a6 !important; color: white !important; border-color: #0d9488 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-shopping-cart-line text-sm"></i>
                                    <span>المصروفات</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm" style="background-color: #14b8a6 !important; color: white !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-line-chart-line text-sm"></i>
                                    <span>الأرباح</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="accounts-table-body">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// متغير لحفظ حالة فرز الحسابات
let currentAccountsSortOrder = 'desc'; // asc أو desc

// تبديل الفرز بين الأحدث والأقدم للحسابات
async function toggleAccountsSort() {
    try {
        // تبديل نوع الفرز
        currentAccountsSortOrder = currentAccountsSortOrder === 'desc' ? 'asc' : 'desc';
        
        // جلب البيانات
        const accounts = await getAllAccounts();
        const clients = await getAllClients();
        
        // تحديث أيقونة الزر
        const sortButton = document.querySelector('button[onclick="toggleAccountsSort()"]');
        const icon = sortButton.querySelector('i');
        const text = sortButton.querySelector('span');
        
        icon.className = currentAccountsSortOrder === 'desc' ? 'ri-time-line' : 'ri-history-line';
        text.textContent = currentAccountsSortOrder === 'desc' ? 'الأحدث' : 'الأقدم';
        
        // إعادة إنشاء التقرير مع الفرز
        const reportContent = document.getElementById('accounts-report-content');
        reportContent.innerHTML = generateAccountsReportHTML(accounts, clients, currentAccountsSortOrder);
        
    } catch (error) {
        console.error('Error sorting accounts report:', error);
        showToast('حدث خطأ أثناء فرز التقرير', 'error');
    }
}

// تصفية تقرير الحسابات
function filterAccountsReport(searchTerm, accounts, clients) {
    if (!searchTerm.trim()) {
        // إذا كان البحث فارغ، اعرض كل البيانات مع الفرز الحالي
        const reportContent = document.getElementById('accounts-report-content');
        reportContent.innerHTML = generateAccountsReportHTML(accounts, clients, currentAccountsSortOrder);
        return;
    }
    
    // تصفية الموكلين بناءً على البحث
    const filteredClients = clients.filter(client => 
        client.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    
    // تصفية الحسابات بناءً على الموكلين المفلترين
    const filteredAccounts = accounts.filter(account => 
        filteredClients.some(client => client.id === account.clientId)
    );
    
    const reportContent = document.getElementById('accounts-report-content');
    reportContent.innerHTML = generateAccountsReportHTML(filteredAccounts, filteredClients, currentAccountsSortOrder);
}

// طباعة تقرير الحسابات
async function printAccountsReport() {
    try {
        // جلب البيانات لحساب الإحصائيات
        const accounts = await getAllAccounts();
        const clients = await getAllClients();
        
        // تجميع الحسابات حسب الموكل
        const clientGroups = {};
        
        for (const account of accounts) {
            const client = clients.find(c => c.id === account.clientId);
            
            if (!client) continue;
            
            if (!clientGroups[client.id]) {
                clientGroups[client.id] = {
                    client: client,
                    totalFees: 0,
                    totalExpenses: 0,
                    totalRemaining: 0
                };
            }
            
            clientGroups[client.id].totalFees += account.paidFees || 0;
            clientGroups[client.id].totalExpenses += account.expenses || 0;
            clientGroups[client.id].totalRemaining += account.remaining || 0;
        }
        
        // حساب الإجماليات
        const clientsData = Object.values(clientGroups);
        const grandTotalFees = clientsData.reduce((sum, client) => sum + client.totalFees, 0);
        const grandTotalExpenses = clientsData.reduce((sum, client) => sum + client.totalExpenses, 0);
        const grandTotalProfits = grandTotalFees - grandTotalExpenses;
        const clientsCount = clientsData.length;
        
        // إنشاء نسخة من المحتوى بدون الإحصائيات العلوية
        const originalContent = document.getElementById('accounts-report-content');
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
                <title>تقرير الحسابات - ${new Date().toLocaleDateString('ar-EG')}</title>
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
                        border-bottom: 2px solid #14b8a6;
                        height: 20px;
                    }
                    
                    .report-title {
                        color: #14b8a6;
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
                        border: 1px solid #14b8a6;
                        border-radius: 4px;
                        font-size: 9px;
                    }
                    
                    .stat-box {
                        text-align: center;
                        flex: 1;
                        padding: 0 8px;
                        border-left: 1px solid #14b8a6;
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
                        color: #14b8a6;
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
                        background: #14b8a6;
                        color: white;
                        padding: 6px 4px;
                        text-align: center;
                        font-weight: bold;
                        font-size: 9px;
                        border: 1px solid #0d9488;
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
                    <div class="report-title">تقرير الحسابات</div>
                    <div class="print-date">${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
                </div>
                
                <!-- الإحصائيات في سطر واحد -->
                <div class="stats-summary">
                    <div class="stat-box">
                        <div class="stat-label">إجمالي الأتعاب</div>
                        <div class="stat-value">${grandTotalFees.toLocaleString()} جنيه</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">إجمالي المصروفات</div>
                        <div class="stat-value">${grandTotalExpenses.toLocaleString()} جنيه</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">صافي الأرباح</div>
                        <div class="stat-value">${grandTotalProfits.toLocaleString()} جنيه</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-label">عدد الموكلين</div>
                        <div class="stat-value">${clientsCount}</div>
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
        console.error('Error printing accounts report:', error);
        showToast('حدث خطأ أثناء طباعة التقرير', 'error');
    }
}

// تصدير تقرير الحسابات
async function exportAccountsReport() {
    try {
        const accounts = await getAllAccounts();
        const clients = await getAllClients();
        
        // تجميع الحسابات حسب الموكل
        const clientGroups = {};
        
        for (const account of accounts) {
            const client = clients.find(c => c.id === account.clientId);
            
            if (!client) continue;
            
            if (!clientGroups[client.id]) {
                clientGroups[client.id] = {
                    client: client,
                    totalFees: 0,
                    totalExpenses: 0,
                    totalRemaining: 0
                };
            }
            
            clientGroups[client.id].totalFees += account.paidFees || 0;
            clientGroups[client.id].totalExpenses += account.expenses || 0;
            clientGroups[client.id].totalRemaining += account.remaining || 0;
        }
        
        // تحويل إلى مصفوفة وفرز البيانات
        let clientsData = Object.values(clientGroups);
        clientsData.sort((a, b) => {
            const dateA = new Date(a.client.createdAt || a.client.id);
            const dateB = new Date(b.client.createdAt || b.client.id);
            
            if (currentAccountsSortOrder === 'desc') {
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
                                <x:Name>تقرير الحسابات</x:Name>
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
                        background: #14b8a6;
                        background-color: #14b8a6;
                        color: #FFFFFF;
                        border: 2px solid #0d9488;
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
                        <th style="background-color: #14b8a6; color: #FFFFFF; border: 2px solid #0d9488; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">اسم الموكل</th>
                        <th style="background-color: #14b8a6; color: #FFFFFF; border: 2px solid #0d9488; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">الأتعاب</th>
                        <th style="background-color: #14b8a6; color: #FFFFFF; border: 2px solid #0d9488; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">المصروفات</th>
                        <th style="background-color: #14b8a6; color: #FFFFFF; border: 2px solid #0d9488; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">الأرباح</th>
                    </tr>
        `;
        
        // إضافة البيانات
        clientsData.forEach((clientData) => {
            const clientName = clientData.client.name;
            const totalFees = clientData.totalFees.toLocaleString();
            const totalExpenses = clientData.totalExpenses.toLocaleString();
            const profits = (clientData.totalFees - clientData.totalExpenses).toLocaleString();
            
            excelContent += `
                <tr>
                    <td style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;">${clientName}</td>
                    <td style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;">${totalFees}</td>
                    <td style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;">${totalExpenses}</td>
                    <td style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;">${profits}</td>
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
        link.setAttribute('download', `تقرير_الحسابات_${new Date().toISOString().split('T')[0]}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('تم تصدير التقرير بنجاح', 'success');
        
    } catch (error) {
        console.error('Error exporting accounts report:', error);
        showToast('حدث خطأ أثناء تصدير التقرير', 'error');
    }
}