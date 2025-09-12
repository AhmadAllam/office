// تقارير القضايا

// تحديث محتوى تقرير القضايا
async function updateCasesReportContent(reportName, reportType) {
    const reportContent = document.getElementById('report-content');
    
    try {
        // جلب بيانات القضايا والموكلين والخصوم
        const cases = await getAllCases();
        const clients = await getAllClients();
        const opponents = await getAllOpponents();
        
        const colors = { bg: '#10b981', bgHover: '#059669', bgLight: '#f0fdf4', text: '#059669', textLight: '#86efac' };
        
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <!-- أدوات التقرير -->
                <div class="flex flex-wrap gap-2 mb-2 md:items-center">
                    <!-- مربع البحث -->
                    <div class="relative w-full md:flex-1">
                        <div class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                            <i class="ri-search-line text-gray-400"></i>
                        </div>
                        <input type="text" id="cases-search" class="w-full pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:border-transparent transition-all" placeholder="البحث في ${reportName}..." onfocus="this.style.boxShadow='0 0 0 2px ${colors.bg}40'" onblur="this.style.boxShadow='none'">
                    </div>
                    <div class="flex items-center justify-center md:justify-start gap-2 w-full md:w-auto">
                        <button onclick="toggleCasesSort()" class="flex items-center gap-2 px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            <i class="ri-time-line"></i>
                            <span>الأحدث</span>
                        </button>
                        <button onclick="exportCasesReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-download-line"></i>
                            <span>تصدير</span>
                        </button>
                        <button onclick="printCasesReport()" class="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
                            <i class="ri-printer-line"></i>
                            <span>طباعة</span>
                        </button>
                    </div>
                </div>
                
                <!-- محتوى التقرير -->
                <div class="bg-white rounded-lg border border-gray-200 pt-0 pb-6 pl-0 pr-0 relative flex-1 overflow-y-auto" id="cases-report-content">
                    ${generateCasesReportHTML(cases, clients, opponents)}
                </div>
            </div>
        `;
        
        // إضافة مستمع البحث
        document.getElementById('cases-search').addEventListener('input', function(e) {
            filterCasesReport(e.target.value, cases, clients, opponents);
        });
        
    } catch (error) {
        console.error('Error loading cases data:', error);
        reportContent.innerHTML = `
            <div class="h-full flex flex-col">
                <div class="bg-white rounded-lg border border-gray-200 p-6 flex-1 overflow-y-auto">
                    <div class="text-center text-red-500 py-12">
                        <i class="ri-error-warning-line text-6xl mb-4"></i>
                        <h3 class="text-xl font-bold mb-2">خطأ في تحميل البيانات</h3>
                        <p class="text-gray-400">حدث خطأ أثناء تحميل بيانات القضايا</p>
                    </div>
                </div>
            </div>
        `;
    }
}

// توليد HTML لتقرير القضايا
function generateCasesReportHTML(cases, clients, opponents, sortOrder = 'desc') {
    if (cases.length === 0) {
        return `
            <div class="text-center text-gray-500 py-16">
                <div class="mb-6">
                    <i class="ri-file-list-3-line text-8xl text-green-200"></i>
                </div>
                <h3 class="text-2xl font-bold mb-3 text-gray-700">لا توجد بيانات</h3>
                <p class="text-gray-400 text-lg">لم يتم العثور على بيانات القضايا</p>
            </div>
        `;
    }
    
    // إعداد بيانات القضايا مع أسماء الموكلين والخصوم
    let casesData = cases.map(caseItem => {
        const client = clients.find(c => c.id === caseItem.clientId);
        const opponent = opponents.find(o => o.id === caseItem.opponentId);
        
        return {
            ...caseItem,
            clientName: client ? client.name : 'غير محدد',
            opponentName: opponent ? opponent.name : 'غير محدد'
        };
    });
    
    // فرز البيانات حسب التاريخ
    casesData.sort((a, b) => {
        const dateA = new Date(a.createdAt || a.id);
        const dateB = new Date(b.createdAt || b.id);
        
        if (sortOrder === 'desc') {
            return dateB - dateA; // الأحدث أولاً
        } else {
            return dateA - dateB; // الأقدم أولاً
        }
    });
    
    let tableRows = '';
    casesData.forEach((caseItem, i) => {
        // تحديد لون الصف بالتناوب
        const rowClass = i % 2 === 0 ? 'bg-gradient-to-l from-green-50 to-emerald-50' : 'bg-white';
        
        tableRows += `
            <tr class="${rowClass} border-b border-gray-200 hover:bg-gradient-to-l hover:from-green-100 hover:to-emerald-100 transition-all duration-300 hover:shadow-sm">
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-lg text-gray-800 hover:text-green-700 transition-colors duration-200">${caseItem.caseNumber || 'غير محدد'} / ${caseItem.caseYear || 'غير محدد'}</div>
                </td>
                <td class="py-4 px-6 text-center border-l border-gray-200">
                    <div class="font-bold text-base text-gray-800 hover:text-green-700 transition-colors duration-200">${caseItem.appealNumber || 'غير محدد'} / ${caseItem.appealYear || 'غير محدد'}</div>
                </td>
                <td class="py-4 px-6 text-center">
                    <div class="font-bold text-base text-gray-800 hover:text-green-700 transition-colors duration-200">${caseItem.cassationNumber || 'غير محدد'} / ${caseItem.cassationYear || 'غير محدد'}</div>
                </td>
            </tr>
        `;
    });
    
    return `
        <div class="cases-report-container">
            <!-- جدول القضايا -->
            <div class="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-visible">
                <table class="w-full border-separate" style="border-spacing: 0;">
                    <thead class="sticky top-0 z-20">
                        <tr class="bg-green-600 text-white shadow-lg">
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm bg-green-700 border-l-2 border-green-400">
                                <div class="flex items-center justify-center gap-2">
                                    <div class="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <i class="ri-hashtag text-sm"></i>
                                    </div>
                                    <span>رقم القضية</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm bg-green-700 border-l-2 border-green-400">
                                <div class="flex items-center justify-center gap-2">
                                    <div class="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <i class="ri-file-list-2-line text-sm"></i>
                                    </div>
                                    <span>رقم الاستئناف</span>
                                </div>
                            </th>
                            <th class="sticky top-0 z-20 py-2 px-3 text-center font-semibold text-sm bg-green-700">
                                <div class="flex items-center justify-center gap-2">
                                    <div class="w-6 h-6 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                                        <i class="ri-scales-3-line text-sm"></i>
                                    </div>
                                    <span>رقم النقض</span>
                                </div>
                            </th>
                        </tr>
                    </thead>
                    <tbody id="cases-table-body">
                        ${tableRows}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// متغير لحفظ حالة فرز القضايا
let currentCasesSortOrder = 'desc'; // asc أو desc

// تبديل الفرز بين الأحدث والأقدم للقضايا
async function toggleCasesSort() {
    try {
        // تبديل نوع الفرز
        currentCasesSortOrder = currentCasesSortOrder === 'desc' ? 'asc' : 'desc';
        
        // جلب البيانات
        const cases = await getAllCases();
        const clients = await getAllClients();
        const opponents = await getAllOpponents();
        
        // تحديث أيقونة الزر
        const sortButton = document.querySelector('button[onclick="toggleCasesSort()"]');
        const icon = sortButton.querySelector('i');
        const text = sortButton.querySelector('span');
        
        icon.className = currentCasesSortOrder === 'desc' ? 'ri-time-line' : 'ri-history-line';
        text.textContent = currentCasesSortOrder === 'desc' ? 'الأحدث' : 'الأقدم';
        
        // إعادة إنشاء التقرير مع الفرز
        const reportContent = document.getElementById('cases-report-content');
        reportContent.innerHTML = generateCasesReportHTML(cases, clients, opponents, currentCasesSortOrder);
        
    } catch (error) {
        console.error('Error sorting cases report:', error);
        showToast('حدث خطأ أثناء فرز التقرير', 'error');
    }
}

// تصفية تقرير القضايا
function filterCasesReport(searchTerm, cases, clients, opponents) {
    if (!searchTerm.trim()) {
        // إذا كان البحث فارغ، اعرض كل البيانات مع الفرز الحالي
        const reportContent = document.getElementById('cases-report-content');
        reportContent.innerHTML = generateCasesReportHTML(cases, clients, opponents, currentCasesSortOrder);
        return;
    }
    
    const filteredCases = cases.filter(caseItem => {
        return (
            (caseItem.caseNumber && caseItem.caseNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (caseItem.caseYear && caseItem.caseYear.toString().includes(searchTerm)) ||
            (caseItem.appealNumber && caseItem.appealNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (caseItem.appealYear && caseItem.appealYear.toString().includes(searchTerm)) ||
            (caseItem.cassationNumber && caseItem.cassationNumber.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (caseItem.cassationYear && caseItem.cassationYear.toString().includes(searchTerm))
        );
    });
    
    const reportContent = document.getElementById('cases-report-content');
    reportContent.innerHTML = generateCasesReportHTML(filteredCases, clients, opponents, currentCasesSortOrder);
}

// طباعة تقرير القضايا
function printCasesReport() {
    // إنشاء نسخة من المحتوى بدون الرؤوس المكررة
    const originalContent = document.getElementById('cases-report-content');
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
            <title>تقرير القضايا - ${new Date().toLocaleDateString('ar-EG')}</title>
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
                <div class="report-title">تقرير القضايا</div>
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

// تصدير تقرير القضايا
async function exportCasesReport() {
    try {
        const cases = await getAllCases();
        const clients = await getAllClients();
        const opponents = await getAllOpponents();
        
        // إعداد بيانات القضايا مع أسماء الموكلين والخصوم
        let casesData = cases.map(caseItem => {
            const client = clients.find(c => c.id === caseItem.clientId);
            const opponent = opponents.find(o => o.id === caseItem.opponentId);
            
            return {
                ...caseItem,
                clientName: client ? client.name : 'غير محدد',
                opponentName: opponent ? opponent.name : 'غير محدد'
            };
        });
        
        // فرز البيانات حسب الإعداد الحالي
        casesData.sort((a, b) => {
            const dateA = new Date(a.createdAt || a.id);
            const dateB = new Date(b.createdAt || b.id);
            
            if (currentCasesSortOrder === 'desc') {
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
                                <x:Name>تقرير القضايا</x:Name>
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
                        background: #10b981;
                        background-color: #10b981;
                        color: #FFFFFF;
                        border: 2px solid #059669;
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
                        <th style="background-color: #10b981; color: #FFFFFF; border: 2px solid #059669; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">رقم القضية</th>
                        <th style="background-color: #10b981; color: #FFFFFF; border: 2px solid #059669; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">رقم الاستئناف</th>
                        <th style="background-color: #10b981; color: #FFFFFF; border: 2px solid #059669; padding: 10px; text-align: center; font-weight: bold; font-size: 21px;">رقم النقض</th>
                    </tr>
        `;
        
        // إضافة البيانات
        casesData.forEach((caseItem) => {
            const caseNumberYear = `${caseItem.caseNumber || 'غير محدد'} / ${caseItem.caseYear || 'غير محدد'}`;
            const appealNumberYear = `${caseItem.appealNumber || 'غير محدد'} / ${caseItem.appealYear || 'غير محدد'}`;
            const cassationNumberYear = `${caseItem.cassationNumber || 'غير محدد'} / ${caseItem.cassationYear || 'غير محدد'}`;
            
            const caseStyle = (caseItem.caseNumber && caseItem.caseYear) ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            const appealStyle = (caseItem.appealNumber && caseItem.appealYear) ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            const cassationStyle = (caseItem.cassationNumber && caseItem.cassationYear) ? 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #FFFFFF; font-size: 18px;"' : 
                'style="border: 1px solid #cccccc; padding: 8px; text-align: center; background-color: #F8F8F8; color: #999999; font-style: italic; font-size: 18px;"';
            
            excelContent += `
                <tr>
                    <td ${caseStyle}>${caseNumberYear}</td>
                    <td ${appealStyle}>${appealNumberYear}</td>
                    <td ${cassationStyle}>${cassationNumberYear}</td>
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
        link.setAttribute('download', `تقرير_القضايا_${new Date().toISOString().split('T')[0]}.xls`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        showToast('تم تصدير التقرير بنجاح', 'success');
        
    } catch (error) {
        console.error('Error exporting cases report:', error);
        showToast('حدث خطأ أثناء تصدير التقرير', 'error');
    }
}