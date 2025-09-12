// تقارير الجلسات

// تحديث محتوى تقرير الجلسات
async function updateSessionsReportContent(reportName, reportType) {
    const reportContent = document.getElementById('report-content');
    
    try {
        // جلب بيانات الجلسات
        const sessions = await getAllSessions();
        
        const colors = { bg: '#f97316', bgHover: '#ea580c', bgLight: '#fff7ed', text: '#ea580c', textLight: '#fdba74' };
        
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <!-- أدوات التقرير -->
                <div class="flex flex-wrap gap-2 mb-2 md:items-center">
                    <!-- مربع البحث -->
                    <div class="relative w-full md:flex-1">
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i class="ri-search-line text-gray-400"></i>
                        </div>
                        <input type="text" id="sessions-search" class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all" placeholder="البحث في ${reportName}..." onfocus="this.style.boxShadow='0 0 0 2px ${colors.bg}40'" onblur="this.style.boxShadow='none'">
                    </div>
                    <div class="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
                        <button onclick="toggleSessionsSort()" class="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            <i class="ri-time-line"></i>
                            <span>الأحدث</span>
                        </button>
                        <button onclick="exportSessionsReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-download-line"></i>
                            <span>تصدير</span>
                        </button>
                        <button onclick="printSessionsReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-printer-line"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
                
                <!-- محتوى التقرير -->
                <div class="bg-white rounded-lg border border-gray-200 pt-0 pb-6 pl-0 pr-0 relative flex-1 overflow-y-auto" id="sessions-report-content">
                    ${generateSessionsReportHTML(sessions)}
                </div>
            </div>
        `;
        
        // إضافة مستمع البحث
        document.getElementById('sessions-search').addEventListener('input', function(e) {
            filterSessionsReport(e.target.value, sessions);
        });
        
    } catch (error) {
        console.error('Error loading sessions data:', error);
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-white rounded-lg border border-gray-200 p-6 flex-1 overflow-y-auto">
                    <div class="text-center text-red-500 py-12">
                        <i class="ri-error-warning-line text-6xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">خطأ في تحميل البيانات</h3>
                        <p class="text-gray-400">حدث خطأ أثناء تحميل بيانات الجلسات</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// توليد HTML لتقرير الجلسات
function generateSessionsReportHTML(sessions, sortOrder = 'desc') {
    if (sessions.length === 0) {
        return `
            <div class="text-center text-gray-500 py-16">
                <div class="mb-6">
                    <i class="ri-calendar-event-line text-8xl text-orange-200"></i>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-gray-700">لا توجد بيانات</h3>
                <p class="text-gray-400 text-lg">لم يتم العثور على بيانات الجلسات</p>
            </div>
        `;
    }
    
    // فرز البيانات حسب التاريخ
    let sessionsData = [...sessions];
    sessionsData.sort((a, b) => {
        const dateA = new Date(a.sessionDate || a.createdAt || a.id);
        const dateB = new Date(b.sessionDate || b.createdAt || b.id);
        
        if (sortOrder === 'desc') {
            return dateB - dateA; // الأحدث أولاً
        } else {
            return dateA - dateB; // الأقدم أولاً
        }
    });
    
    let tableRows = '';
    sessionsData.forEach((session, i) => {
        // تحديد لون الصف بالتناوب
        const rowClass = i % 2 === 0 ? 'bg-gradient-to-l from-orange-50 to-amber-50' : 'bg-white';
        
        // تنسيق التاريخ
        const sessionDate = session.sessionDate || 'غير محدد';
        
        tableRows += `
            <tr class="${rowClass} border-b border-gray-200 hover:bg-gradient-to-l hover:from-orange-100 hover:to-amber-100 transition-all duration-300 hover:shadow-sm">
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-lg text-gray-800 hover:text-orange-700 transition-colors duration-200">${sessionDate}</div>
                </td>
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-base text-gray-800 hover:text-orange-700 transition-colors duration-200">${session.decision || 'غير محدد'}</div>
                </td>
                <td class="py-4 px-6 text-center">
                    <div class="font-bold text-base text-gray-800 hover:text-orange-700 transition-colors duration-200">${session.inventoryNumber || 'غير محدد'}</div>
                </td>
            </tr>
        `;
    });
    
    return `
        <div class="sessions-report-container">
            <!-- جدول الجلسات -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
                <table class="w-full border-separate" style="border-spacing: 0;">
                    <thead class="sticky top-0 z-20">
                        <tr class="text-white shadow-lg" style="background-color: #ea580c !important;">
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #ea580c !important; color: white !important; border-color: #f97316 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-calendar-line text-sm"></i>
                                    <span>تاريخ الجلسة</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #ea580c !important; color: white !important; border-color: #f97316 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-gavel-line text-sm"></i>
                                    <span>القرار</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm" style="background-color: #ea580c !important; color: white !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-file-list-line text-sm"></i>
                                    <span>رقم الحصر</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="sessions-table-body">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// متغير لحفظ حالة فرز الجلسات
let currentSessionsSortOrder = 'desc'; // asc أو desc

// تبديل الفرز بين الأحدث والأقدم للجلسات
async function toggleSessionsSort() {
    try {
        // تبديل نوع الفرز
        currentSessionsSortOrder = currentSessionsSortOrder === 'desc' ? 'asc' : 'desc';
        
        // جلب البيانات
        const sessions = await getAllSessions();
        
        // تحديث أيقونة الزر
        const sortButton = document.querySelector('button[onclick="toggleSessionsSort()"]');
        const icon = sortButton.querySelector('i');
        const text = sortButton.querySelector('span');
        
        icon.className = currentSessionsSortOrder === 'desc' ? 'ri-time-line' : 'ri-history-line';
        text.textContent = currentSessionsSortOrder === 'desc' ? 'الأحدث' : 'الأقدم';
        
        // إعادة إنشاء التقرير مع الفرز
        const reportContent = document.getElementById('sessions-report-content');
        reportContent.innerHTML = generateSessionsReportHTML(sessions, currentSessionsSortOrder);
        
    } catch (error) {
        console.error('Error sorting sessions report:', error);
        showToast('حدث خطأ أثناء فرز التقرير', 'error');
    }
}

// تصفية تقرير الجلسات
function filterSessionsReport(searchTerm, sessions) {
    if (!searchTerm.trim()) {
        // إذا كان البحث فارغ، اعرض كل البيانات مع الفرز الحالي
        const reportContent = document.getElementById('sessions-report-content');
        reportContent.innerHTML = generateSessionsReportHTML(sessions, currentSessionsSortOrder);
        return;
    }
    
    const filteredSessions = sessions.filter(session => {
        const sessionDate = session.sessionDate || '';
        
        return (
            (sessionDate && sessionDate.includes(searchTerm)) ||
            (session.decision && session.decision.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (session.inventoryNumber && session.inventoryNumber.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });
    
    const reportContent = document.getElementById('sessions-report-content');
    reportContent.innerHTML = generateSessionsReportHTML(filteredSessions, currentSessionsSortOrder);
}

// طباعة تقرير الجلسات
function printSessionsReport() {
    // إنشاء نسخة من المحتوى بدون الرؤوس المكررة
    const originalContent = document.getElementById('sessions-report-content');
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = originalContent.innerHTML;
    
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
            <title>تقرير الجلسات - ${new Date().toLocaleDateString('ar-EG')}</title>
            <style>
                @page {
                    size: A4;
                    margin: 0.7cm 0.8cm;
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
                    line-height: 1.3;
                    font-size: 11px;
                }
                
                .print-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 3px;
                    padding: 2px 0;
                    border-bottom: 1px solid #ddd;
                    height: 15px;
                }
                
                .report-title {
                    color: #333;
                    font-size: 11px;
                    margin: 0;
                    font-weight: bold;
                }
                
                .print-date {
                    color: #666;
                    font-size: 8px;
                    text-align: left;
                }
                
                table {
                    width: 100%;
                    border-collapse: collapse;
                    margin: 5px 0;
                    font-size: 11px;
                    border: 1px solid #333;
                }
                
                th {
                    background: #f5f5f5;
                    color: #333;
                    padding: 6px 8px;
                    text-align: center;
                    font-weight: bold;
                    font-size: 11px;
                    border: 1px solid #333;
                }
                
                td {
                    padding: 4px 6px;
                    border: 1px solid #ccc;
                    text-align: center;
                    font-size: 10px;
                    color: #333;
                }
                
                tr:nth-child(even) td {
                    background: #f9f9f9;
                }
                
                .empty-cell {
                    color: #999;
                    font-style: italic;
                    font-size: 9px;
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
                    
                    .stats-grid {
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
                <div class="report-title">تقرير الجلسات</div>
                <div class="print-date">${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</div>
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
}

// تصدير تقرير الجلسات
async function exportSessionsReport() {
    try {
        const sessions = await getAllSessions();
        
        // فرز البيانات حسب الإعداد الحالي
        let sessionsData = [...sessions];
        sessionsData.sort((a, b) => {
            const dateA = new Date(a.sessionDate || a.createdAt || a.id);
            const dateB = new Date(b.sessionDate || b.createdAt || b.id);
            
            if (currentSessionsSortOrder === 'desc') {
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
                                <x:Name>تقرير الجلسات</x:Name>
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
                        background: #ea580c;
                        background-color: #ea580c;
                        color: #FFFFFF;
                        border: 2px solid #f97316;
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
                        <th style="background-color: #ea580c; color: #FFFFFF; border: 2px solid #f97316; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">تاريخ الجلسة</th>
                        <th style="background-color: #ea580c; color: #FFFFFF; border: 2px solid #f97316; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">القرار</th>
                        <th style="background-color: #ea580c; color: #FFFFFF; border: 2px solid #f97316; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">رقم الحصر</th>
                    </tr>
        `;
        
        // إضافة البيانات
        sessionsData.forEach((session) => {
            const sessionDate = session.sessionDate || 'غير محدد';
            const decision = session.decision || 'غير محدد';
            const inventoryNumber = session.inventoryNumber || 'غير محدد';
            
            const dateStyle = session.sessionDate ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            const decisionStyle = session.decision ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            const inventoryStyle = session.inventoryNumber ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            excelContent += `
                <tr>
                    <td ${dateStyle}>${sessionDate}</td>
                    <td ${decisionStyle}>${decision}</td>
                    <td ${inventoryStyle}>${inventoryNumber}</td>
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
        link.setAttribute('download', `تقرير_الجلسات_${new Date().toISOString().split('T')[0]}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('تم تصدير التقرير بنجاح', 'success');
        
    } catch (error) {
        console.error('Error exporting sessions report:', error);
        showToast('حدث خطأ أثناء تصدير التقرير', 'error');
    }
}