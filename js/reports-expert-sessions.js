// تقارير جلسات الخبراء

// تحديث محتوى تقرير جلسات الخبراء
async function updateExpertSessionsReportContent(reportName, reportType) {
    const reportContent = document.getElementById('report-content');
    
    try {
        // جلب بيانات جلسات الخبراء والموكلين
        const expertSessions = await getAllExpertSessions();
        const clients = await getAllClients();
        
        const colors = { bg: '#ec4899', bgHover: '#db2777', bgLight: '#fdf2f8', text: '#db2777', textLight: '#f9a8d4' };
        
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <!-- أدوات التقرير -->
                <div class="flex flex-wrap gap-2 mb-2 md:items-center">
                    <!-- مربع البحث -->
                    <div class="relative w-full md:flex-1">
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i class="ri-search-line text-gray-400"></i>
                        </div>
                        <input type="text" id="expert-sessions-search" class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all" placeholder="البحث في ${reportName}..." onfocus="this.style.boxShadow='0 0 0 2px ${colors.bg}40'" onblur="this.style.boxShadow='none'">
                    </div>
                    <div class="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
                        <button onclick="toggleExpertSessionsSort()" class="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            <i class="ri-time-line"></i>
                            <span>الأحدث</span>
                        </button>
                        <button onclick="exportExpertSessionsReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-download-line"></i>
                            <span>تصدير</span>
                        </button>
                        <button onclick="printExpertSessionsReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-printer-line"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
                
                <!-- محتوى التقرير -->
                <div class="bg-white rounded-lg border border-gray-200 pt-0 pb-6 pl-0 pr-0 relative flex-1 overflow-y-auto" id="expert-sessions-report-content">
                    ${generateExpertSessionsReportHTML(expertSessions, clients)}
                </div>
            </div>
        `;
        
        // إضافة مستمع البحث
        document.getElementById('expert-sessions-search').addEventListener('input', function(e) {
            filterExpertSessionsReport(e.target.value, expertSessions, clients);
        });
        
    } catch (error) {
        console.error('Error loading expert sessions data:', error);
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-white rounded-lg border border-gray-200 p-6 flex-1 overflow-y-auto">
                    <div class="text-center text-red-500 py-12">
                        <i class="ri-error-warning-line text-6xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">خطأ في تحميل البيانات</h3>
                        <p class="text-gray-400">حدث خطأ أثناء تحميل بيانات جلسات الخبراء</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// توليد HTML لتقرير جلسات الخبراء
function generateExpertSessionsReportHTML(expertSessions, clients, sortOrder = 'desc') {
    if (expertSessions.length === 0) {
        return `
            <div class="text-center text-gray-500 py-16">
                <div class="mb-6">
                    <i class="ri-team-line text-8xl text-pink-200"></i>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-gray-700">لا توجد بيانات</h3>
                <p class="text-gray-400 text-lg">لم يتم العثور على بيانات جلسات الخبراء</p>
            </div>
        `;
    }
    
    // فرز البيانات حسب التاريخ
    let sessionsData = [...expertSessions];
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
        const rowClass = i % 2 === 0 ? 'bg-gradient-to-l from-pink-50 to-rose-50' : 'bg-white';
        
        // البحث عن بيانات الموكل
        const client = clients.find(c => c.id === session.clientId);
        const clientName = client ? client.name : 'غير محدد';
        
        // تنسيق التاريخ
        const sessionDate = session.sessionDate || 'غير محدد';
        
        tableRows += `
            <tr class="${rowClass} border-b border-gray-200 hover:bg-gradient-to-l hover:from-pink-100 hover:to-rose-100 transition-all duration-300 hover:shadow-sm">
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-lg text-gray-800 hover:text-pink-700 transition-colors duration-200 truncate" title="${clientName}">${clientName}</div>
                </td>
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-base text-gray-800 hover:text-pink-700 transition-colors duration-200">${session.outgoingNumber || 'غير محدد'}</div>
                </td>
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-base text-gray-800 hover:text-pink-700 transition-colors duration-200">${session.incomingNumber || 'غير محدد'}</div>
                </td>
                <td class="py-4 px-6 text-center">
                    <div class="font-bold text-base text-gray-800 hover:text-pink-700 transition-colors duration-200">${sessionDate}</div>
                </td>
            </tr>
        `;
    });
    
    return `
        <div class="expert-sessions-report-container">
            <!-- جدول جلسات الخبراء -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
                <table class="w-full border-separate" style="border-spacing: 0;">
                    <thead class="sticky top-0 z-20">
                        <tr class="text-white shadow-lg" style="background-color: #db2777 !important;">
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #db2777 !important; color: white !important; border-color: #ec4899 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-user-line text-sm"></i>
                                    <span>اسم الموكل</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #db2777 !important; color: white !important; border-color: #ec4899 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-file-upload-line text-sm"></i>
                                    <span>رقم الصادر</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm border-l-2" style="background-color: #db2777 !important; color: white !important; border-color: #ec4899 !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-file-download-line text-sm"></i>
                                    <span>رقم الوارد</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm" style="background-color: #db2777 !important; color: white !important; white-space: nowrap;">
                                <div class="flex items-center justify-center gap-2">
                                    <i class="ri-calendar-line text-sm"></i>
                                    <span>تاريخ الجلسة</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="expert-sessions-table-body">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// متغير لحفظ حالة فرز جلسات الخبراء
let currentExpertSessionsSortOrder = 'desc'; // asc أو desc

// تبديل الفرز بين الأحدث والأقدم لجلسات الخبراء
async function toggleExpertSessionsSort() {
    try {
        // تبديل نوع الفرز
        currentExpertSessionsSortOrder = currentExpertSessionsSortOrder === 'desc' ? 'asc' : 'desc';
        
        // جلب البيانات
        const expertSessions = await getAllExpertSessions();
        const clients = await getAllClients();
        
        // تحديث أيقونة الزر
        const sortButton = document.querySelector('button[onclick="toggleExpertSessionsSort()"]');
        const icon = sortButton.querySelector('i');
        const text = sortButton.querySelector('span');
        
        icon.className = currentExpertSessionsSortOrder === 'desc' ? 'ri-time-line' : 'ri-history-line';
        text.textContent = currentExpertSessionsSortOrder === 'desc' ? 'الأحدث' : 'الأقدم';
        
        // إعادة إنشاء التقرير مع الفرز
        const reportContent = document.getElementById('expert-sessions-report-content');
        reportContent.innerHTML = generateExpertSessionsReportHTML(expertSessions, clients, currentExpertSessionsSortOrder);
        
    } catch (error) {
        console.error('Error sorting expert sessions report:', error);
        showToast('حدث خطأ أثناء فرز التقرير', 'error');
    }
}

// تصفية تقرير جلسات الخبراء
function filterExpertSessionsReport(searchTerm, expertSessions, clients) {
    if (!searchTerm.trim()) {
        // إذا كان البحث فارغ، اعرض كل البيانات مع الفرز الحالي
        const reportContent = document.getElementById('expert-sessions-report-content');
        reportContent.innerHTML = generateExpertSessionsReportHTML(expertSessions, clients, currentExpertSessionsSortOrder);
        return;
    }
    
    const filteredSessions = expertSessions.filter(session => {
        // البحث عن بيانات الموكل
        const client = clients.find(c => c.id === session.clientId);
        const clientName = client ? client.name : '';
        
        const sessionDate = session.sessionDate || '';
        const outgoingNumber = session.outgoingNumber || '';
        const incomingNumber = session.incomingNumber || '';
        
        return (
            clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            sessionDate.includes(searchTerm) ||
            outgoingNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            incomingNumber.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });
    
    const reportContent = document.getElementById('expert-sessions-report-content');
    reportContent.innerHTML = generateExpertSessionsReportHTML(filteredSessions, clients, currentExpertSessionsSortOrder);
}

// طباعة تقرير جلسات الخبراء
function printExpertSessionsReport() {
    // إنشاء نسخة من المحتوى بدون الرؤوس المكررة
    const originalContent = document.getElementById('expert-sessions-report-content');
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
            <title>تقرير جلسات الخبراء - ${new Date().toLocaleDateString('ar-EG')}</title>
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
                    font-size: 8px;
                    color: #666;
                    border-top: 1px solid #ddd;
                    padding-top: 2px;
                }
                
                @media print {
                    body { -webkit-print-color-adjust: exact; }
                    .no-print { display: none !important; }
                }
            </style>
        </head>
        <body>
            <div class="print-header">
                <h1 class="report-title">${officeName} - تقرير جلسات الخبراء</h1>
                <div class="print-date">تاريخ الطباعة: ${new Date().toLocaleDateString('ar-EG')} - ${new Date().toLocaleTimeString('ar-EG')}</div>
            </div>
            
            ${printContent}
            
            <div class="print-footer">
                ${officeName} - تقرير جلسات الخبراء - صفحة 1
            </div>
            
            <script>
                window.onload = function() {
                    window.print();
                    window.onafterprint = function() {
                        window.close();
                    };
                };
            </script>
        </body>
        </html>
    `);
    
    printWindow.document.close();
}

// تصدير تقرير جلسات الخبراء
async function exportExpertSessionsReport() {
    try {
        const expertSessions = await getAllExpertSessions();
        const clients = await getAllClients();
        
        // فرز البيانات حسب الإعداد الحالي
        let sessionsData = [...expertSessions];
        sessionsData.sort((a, b) => {
            const dateA = new Date(a.sessionDate || a.createdAt || a.id);
            const dateB = new Date(b.sessionDate || b.createdAt || b.id);
            
            if (currentExpertSessionsSortOrder === 'desc') {
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
                                <x:Name>تقرير جلسات الخبراء</x:Name>
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
                        background: #db2777;
                        background-color: #db2777;
                        color: #FFFFFF;
                        border: 2px solid #ec4899;
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
                        <th style="background-color: #db2777; color: #FFFFFF; border: 2px solid #ec4899; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">اسم الموكل</th>
                        <th style="background-color: #db2777; color: #FFFFFF; border: 2px solid #ec4899; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">رقم الصادر</th>
                        <th style="background-color: #db2777; color: #FFFFFF; border: 2px solid #ec4899; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">رقم الوارد</th>
                        <th style="background-color: #db2777; color: #FFFFFF; border: 2px solid #ec4899; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">تاريخ الجلسة</th>
                    </tr>
        `;
        
        // إضافة البيانات
        sessionsData.forEach((session) => {
            const client = clients.find(c => c.id === session.clientId);
            const clientName = client ? client.name : 'غير محدد';
            const outgoingNumber = session.outgoingNumber || 'غير محدد';
            const incomingNumber = session.incomingNumber || 'غير محدد';
            const sessionDate = session.sessionDate || 'غير محدد';
            
            const clientStyle = client ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            const outgoingStyle = session.outgoingNumber ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            const incomingStyle = session.incomingNumber ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            const dateStyle = session.sessionDate ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            excelContent += `
                <tr>
                    <td ${clientStyle}>${clientName}</td>
                    <td ${outgoingStyle}>${outgoingNumber}</td>
                    <td ${incomingStyle}>${incomingNumber}</td>
                    <td ${dateStyle}>${sessionDate}</td>
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
        link.setAttribute('download', `تقرير_جلسات_الخبراء_${new Date().toISOString().split('T')[0]}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('تم تصدير التقرير بنجاح', 'success');
        
    } catch (error) {
        console.error('Error exporting expert sessions report:', error);
        showToast('حدث خطأ أثناء تصدير التقرير', 'error');
    }
}