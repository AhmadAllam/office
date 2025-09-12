// إضافة CSS للمحاذاة
if (!document.getElementById('administrative-custom-css')) {
    const style = document.createElement('style');
    style.id = 'administrative-custom-css';
    style.textContent = `
        /* تخصيص محاذاة تاريخ الإنجاز */
        #due-date {
            text-align: right !important;
            direction: rtl;
        }
        
        /* تحسين عرض التاريخ في المتصفحات المختلفة */
        #due-date::-webkit-calendar-picker-indicator {
            margin-left: 0;
            margin-right: auto;
        }
        
        #due-date::-webkit-inner-spin-button,
        #due-date::-webkit-outer-spin-button {
            margin-left: 0;
            margin-right: auto;
        }
    `;
    document.head.appendChild(style);
}

// Administrative Manager Module - نافذة إدارة الأعمال الإدارية
class AdministrativeManager {
    constructor() {
        this.currentDate = new Date();
        this.administrative = [];
        this.selectedDate = null;
        this.viewMode = 'calendar'; // calendar or list
        this.filteredDate = null; // للبحث بتاريخ معين
        this.sortOrder = 'desc'; // desc = من الأحدث للأقدم, asc = من الأقدم للأحدث
        this.lastToastDate = null; // لتجنب تكرار رسائل التاريخ
        
        // حفظ حالة الفرز والبحث للعودة إليها بعد التعديل
        this.savedState = {
            viewMode: 'calendar',
            sortOrder: 'desc',
            filteredDate: null,
            selectedDate: null
        };
    }

    async init() {
        try {
            await this.loadAllAdministrative();
            this.restoreState(); // استعادة الحالة المحفوظة
            this.render();
        } catch (error) {
            showToast('حدث خطأ في تحميل الأعمال الإدارية', 'error');
        }
    }

    // حفظ الحالة الحالية
    saveState() {
        this.savedState = {
            viewMode: this.viewMode,
            sortOrder: this.sortOrder,
            filteredDate: this.filteredDate,
            selectedDate: this.selectedDate
        };
        
        // حفظ في sessionStorage أيضاً للاستمرارية
        sessionStorage.setItem('administrativeState', JSON.stringify(this.savedState));
    }

    // استعادة الحالة المحفوظة
    restoreState() {
        try {
            const savedStateStr = sessionStorage.getItem('administrativeState');
            if (savedStateStr) {
                const savedState = JSON.parse(savedStateStr);
                this.viewMode = savedState.viewMode || 'calendar';
                this.sortOrder = savedState.sortOrder || 'desc';
                this.filteredDate = savedState.filteredDate || null;
                this.selectedDate = savedState.selectedDate || null;
                this.savedState = savedState;
            }
        } catch (error) {
        }
    }

    // مسح الحالة المحفوظة
    clearSavedState() {
        sessionStorage.removeItem('administrativeState');
    }

    // إرجاع الوقت الحالي مع مراعاة الانحراف المتزامن عبر الإنترنت إن وُجد
    getNow() {
        try {
            const raw = localStorage.getItem('onlineTimeOffsetMs');
            const offset = raw ? parseInt(raw, 10) : 0;
            if (!isNaN(offset)) {
                return new Date(Date.now() + offset);
            }
        } catch (e) {}
        return new Date();
    }

    async syncTimeOffset() {
        const endpoints = [
            'http://worldclockapi.com/api/json/utc/now',
            'https://timeapi.io/api/Time/current/zone?timeZone=UTC',
            'https://worldtimeapi.org/api/timezone/UTC',
            'https://api.github.com',
            'https://httpbin.org/get'
        ];
        for (const url of endpoints) {
            try {
                const t0 = Date.now();
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 5000);
                
                const res = await fetch(url, { 
                    cache: 'no-store',
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                    },
                    signal: controller.signal
                });
                
                clearTimeout(timeoutId);
                const t1 = Date.now();
                let serverMs = null;
                try {
                    const ct = res.headers.get('date');
                    if (ct) serverMs = new Date(ct).getTime();
                } catch (e) {}
                if (!serverMs && !url.includes('github.com') && !url.includes('httpbin.org')) {
                    try {
                        const text = await res.text();
                        const data = JSON.parse(text);
                        if (data.currentDateTime) serverMs = new Date(data.currentDateTime).getTime();
                        else if (data.utc_datetime) serverMs = new Date(data.utc_datetime).getTime();
                        else if (data.dateTime) serverMs = new Date(data.dateTime).getTime();
                        else if (data.datetime) serverMs = new Date(data.datetime).getTime();
                    } catch (e) {}
                }
                if (serverMs) {
                    const rtt = (t1 - t0) / 2;
                    const approxNow = serverMs + rtt;
                    const localNow = Date.now();
                    const offset = approxNow - localNow;
                    try { localStorage.setItem('onlineTimeOffsetMs', String(offset)); } catch (e) {}
                    return offset;
                }
            } catch (e) {
                // next
            }
        }
        return null;
    }

    async loadAllAdministrative() {
        try {
            this.administrative = await getAllAdministrative();
        } catch (error) {
            this.administrative = [];
        }
    }

    render() {
        const modalTitle = document.getElementById('modal-title');
        const modalContent = document.getElementById('modal-content');
        const modalContainer = document.getElementById('modal-container');
        
        modalTitle.textContent = 'إدارة الأعمال الإدارية';
        // تأكيد ظهور زر السهم وعدم تحريكه
        const bodyEl = document.body;
        if (bodyEl) bodyEl.classList.remove('hide-sidebar-toggle');
        const sidebarToggle = document.getElementById('sidebar-toggle');
        if (sidebarToggle) sidebarToggle.checked = false;
        // إعادة ضبط أصناف الحاوية من بقايا شاشة الإضافة
        modalContent.classList.remove('search-modal-content', 'p-6', 'h-full', 'overflow-y-auto');
        modalContent.classList.remove('px-4');
        modalContent.classList.add('px-0');
        
        // إعادة تعيين زر الرئيسية والعنوان للحالة الطبيعية
        const backBtn = document.getElementById('back-to-main');
        const pageTitle = document.getElementById('page-title');
        if (backBtn && pageTitle) {
            backBtn.innerHTML = `
                <i class="ri-home-5-line text-white text-lg"></i>
                <span class="text-white">الرئيسيه</span>
            `;
            pageTitle.textContent = 'إدارة الأعمال الإدارية';
            
            // إزالة المستمع القديم وإضافة الجديد للرجوع للرئيسية مباشرة
            const newBackBtn = backBtn.cloneNode(true);
            backBtn.parentNode.replaceChild(newBackBtn, backBtn);
            
            newBackBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                // الرجوع للشاشة الرئيسية مباشرة
                window.location.href = 'index.html';
            });
        }
        
        // توسيع النافذة - اجعلها تاخد العرض بالكامل
        modalContainer.classList.remove('max-w-5xl', 'max-w-7xl', 'mx-4');
        modalContainer.classList.add('w-full');
        modalContent.classList.remove('search-modal-content');
        
        modalContent.innerHTML = `
            <div class="administrative-manager-container search-layout" id="administrative-root">
                <!-- Main Layout: Right Sidebar + Content -->
                <div class="flex gap-2">
                    <!-- Right Sidebar -->
                    <div class="w-80 lg:w-72 xl:w-72 2xl:w-80 flex-shrink-0 space-y-3 search-left-pane">
                        <!-- View Toggle Buttons -->
                        <div class="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                            <h3 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <i class="ri-eye-line text-indigo-500"></i>
                                طرق العرض
                            </h3>
                            <div class="flex bg-gray-100 rounded-lg p-1 w-full">
                                <button id="calendar-view-btn" class="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${this.viewMode === 'calendar' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}">
                                    <i class="ri-calendar-line ml-1"></i>
                                    تقويم
                                </button>
                                <button id="list-view-btn" class="flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${this.viewMode === 'list' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}">
                                    <i class="ri-list-check ml-1"></i>
                                    قائمة
                                </button>
                            </div>
                        </div>

                        <!-- Date Search Box -->
                        <div class="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                            <h3 class="text-sm font-bold text-gray-800 mb-3 flex items-center gap-2">
                                <i class="ri-search-line text-indigo-500"></i>
                                البحث بالتاريخ
                            </h3>
                            <input type="date" id="date-search" 
                                class="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm font-medium"
                                value="${this.filteredDate || ''}">
                        </div>

                        <!-- Add New Work Button -->
                        <div class="bg-white rounded-lg p-3 shadow-md border border-gray-200">
                            <button id="add-new-work-btn" class="w-full px-3 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-all shadow-sm flex items-center justify-center gap-2 text-sm">
                                <i class="ri-add-line text-base"></i>
                                إضافة عمل جديد
                            </button>
                        </div>

                        <!-- Statistics -->
                        <div class="bg-white rounded-lg p-4 shadow-md border border-gray-200">
                            <h3 class="text-sm font-bold text-gray-800 mb-2 flex items-center gap-2">
                                <i class="ri-bar-chart-line text-indigo-500"></i>
                                الإحصائيات
                            </h3>
                            <div class="space-y-3">
                                <!-- Today's Works - Full Width -->
                                <div class="bg-gradient-to-br from-pink-200 via-rose-300 to-red-200 rounded-xl p-3 border-2 border-pink-300 text-center shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                                    <div class="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center mx-auto mb-1 shadow-md">
                                        <i class="ri-today-line text-white text-lg drop-shadow-sm"></i>
                                    </div>
                                    <div class="text-2xl font-bold text-red-700 mb-0.5" id="stats-today">0</div>
                                    <div class="text-xs font-semibold text-red-800">أعمال اليوم</div>
                                </div>

                                <!-- Month and Week Works - Side by Side -->
                                <div class="grid grid-cols-2 gap-2">
                                    <!-- Completed Works -->
                                    <div class="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200 text-center shadow-sm hover:shadow-md transition-shadow">
                                        <div class="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                            <i class="ri-check-line text-white text-sm"></i>
                                        </div>
                                        <div class="text-lg font-bold text-green-600 mb-1" id="stats-completed">0</div>
                                        <div class="text-xs font-medium text-green-800">منجز</div>
                                    </div>

                                    <!-- Pending Works -->
                                    <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 text-center shadow-sm hover:shadow-md transition-shadow">
                                        <div class="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                            <i class="ri-time-line text-white text-sm"></i>
                                        </div>
                                        <div class="text-lg font-bold text-purple-600 mb-1" id="stats-pending">0</div>
                                        <div class="text-xs font-medium text-purple-800">متبقي</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- Main Content Area -->
                    <div class="flex-1">
                        <div id="calendar-content" class="min-h-[calc(100vh-140px)]">
                            ${this.viewMode === 'calendar' ? this.renderCalendar() : this.renderWorksList()}
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.updateStatistics();
        const detailsPanel = document.getElementById('work-details');
        if (detailsPanel) { detailsPanel.remove(); }
        this.attachEventListeners();
        
        // إعداد صندوق التمرير إذا كان في وضع القائمة
        if (this.viewMode === 'list') {
            setTimeout(() => {
                this.setupAdministrativeListScrollBox?.();
            }, 10);
        }
    }

    updateStatistics() {
        const today = this.getNow();
        const todayStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
        
        // حساب أعمال اليوم
        const todayWorks = this.administrative.filter(work => work.dueDate === todayStr).length;
        
        // حساب الأعمال المنجزة والمتبقية
        const completedWorks = this.administrative.filter(work => work.completed).length;
        const pendingWorks = this.administrative.length - completedWorks;
        
        // تحديث الإحصائيات في الواجهة
        const todayElement = document.getElementById('stats-today');
        const completedElement = document.getElementById('stats-completed');
        const pendingElement = document.getElementById('stats-pending');
        
        if (todayElement) todayElement.textContent = todayWorks;
        if (completedElement) completedElement.textContent = completedWorks;
        if (pendingElement) pendingElement.textContent = pendingWorks;
    }

    renderCalendar() {
        const year = this.currentDate.getFullYear();
        const month = this.currentDate.getMonth();
        const today = this.getNow();
        
        // أسماء الشهور بالعربية
        const monthNames = [
            'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
            'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
        ];

        // أسماء أيام الأسبوع بالعربية (تبدأ من السبت)
        const dayNames = ['سبت', 'أحد', 'اثنين', 'ثلاثاء', 'أربعاء', 'خميس', 'جمعة'];

        // الحصول على أول يوم في الشهر وعدد الأيام
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const daysInMonth = lastDay.getDate();
        
        // تحويل يوم البداية للنظام العربي (السبت = 0) بغض النظر عن إعدادات المتصفح
        const nativeStart = firstDay.getDay(); // الأحد=0..السبت=6
        let startingDayOfWeek = (nativeStart + 1) % 7;

        let calendarHTML = `
            <div class="calendar-container bg-white rounded-lg shadow-md border border-gray-200 w-full">
                <!-- Calendar Header -->
                <div class="calendar-header bg-gradient-to-r from-indigo-500 to-indigo-600 text-white p-3 rounded-t-lg relative">
                    <button id="sync-time-btn" class="absolute left-2 top-2 w-7 h-7 rounded-full bg-green-400 hover:bg-green-500 text-white flex items-center justify-center shadow" title="مزامنة">
                        <i class="ri-refresh-line text-sm"></i>
                    </button>
                    <div class="flex items-center justify-between gap-3 flex-wrap">
                        <div class="flex items-center gap-2">
                            <button id="prev-month" class="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-md transition-colors">
                                <i class="ri-arrow-right-s-line text-lg"></i>
                            </button>
                            <button id="next-month" class="p-1.5 hover:bg-white hover:bg-opacity-20 rounded-md transition-colors">
                                <i class="ri-arrow-left-s-line text-lg"></i>
                            </button>
                        </div>
                        <h2 class="text-lg font-bold">${monthNames[month]} ${year}</h2>
                        <div class="w-6"></div>
                    </div>
                </div>

                <!-- Days of Week Header -->
                <div class="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
        `;

        // إضافة أسماء أيام الأسبوع
        dayNames.forEach(day => {
            calendarHTML += `
                <div class="p-2 text-center text-xs font-semibold text-gray-600 border-l border-gray-200 last:border-l-0">
                    ${day}
                </div>
            `;
        });

        calendarHTML += `</div><div class="grid grid-cols-7 gap-0">`;

        // إضافة الأيام الفارغة في بداية الشهر
        for (let i = 0; i < startingDayOfWeek; i++) {
            calendarHTML += `<div class="h-20 border-l border-b border-gray-200 bg-gray-50"></div>`;
        }

        // إضافة أيام الشهر
        for (let day = 1; day <= daysInMonth; day++) {
            const currentDateStr = `${year}-${(month + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
            const worksForDay = this.getWorksForDate(currentDateStr);
            const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year;
            const isSelected = this.selectedDate === currentDateStr;

            let dayClasses = 'h-20 border-l border-b border-gray-200 p-1.5 cursor-pointer transition-all duration-200 relative overflow-hidden';
            let dayContent = '';
            let dayNumberStyle = 'text-xs font-medium text-gray-800 mb-1';

            if (isToday) {
                dayClasses += ' bg-gradient-to-br from-indigo-100 to-indigo-200 border-indigo-300';
                dayNumberStyle = 'text-xs font-bold text-indigo-800 mb-1';
            } else {
                dayClasses += ' hover:bg-indigo-50 hover:border-indigo-300';
            }

            if (isSelected) {
                dayClasses += ' ring-1 ring-indigo-500 bg-gradient-to-br from-indigo-200 to-indigo-300';
                dayNumberStyle = 'text-xs font-bold text-indigo-900 mb-1';
            }

            if (worksForDay.length > 0) {
                dayClasses += ' has-works';
                
                // تحديد لون المؤشر حسب عدد الأعمال
                let indicatorColor = 'bg-green-500';
                let textColor = 'text-green-700';
                if (worksForDay.length > 2) {
                    indicatorColor = 'bg-red-500';
                    textColor = 'text-red-700';
                } else if (worksForDay.length > 1) {
                    indicatorColor = 'bg-orange-500';
                    textColor = 'text-orange-700';
                }

                dayContent = `
                    <div class="work-indicators">
                        <!-- نقطة المؤشر -->
                        <div class="absolute top-0.5 left-0.5 w-2 h-2 ${indicatorColor} rounded-full shadow-sm animate-pulse"></div>
                        
                        <!-- عداد الأعمال -->
                        <div class="absolute bottom-0.5 left-0.5 right-0.5">
                            <div class="bg-white bg-opacity-90 rounded-sm px-1 py-0.5 shadow-sm">
                                <div class="text-xs ${textColor} font-bold text-center flex items-center justify-center gap-0.5">
                                    <i class="ri-briefcase-fill text-xs"></i>
                                    <span>${worksForDay.length}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }

            calendarHTML += `
                <div class="${dayClasses}" data-date="${currentDateStr}">
                    <div class="${dayNumberStyle}">${day}</div>
                    ${dayContent}
                </div>
            `;
        }

        calendarHTML += `</div></div>`;
        return calendarHTML;
    }

    renderWorksList() {
        // فلترة الأعمال حسب التاريخ المحدد (إن وجد)
        let worksToShow = [...this.administrative];
        let titleText = 'جميع الأعمال الإدارية';
        let clearFilterButton = '';

        if (this.filteredDate) {
            worksToShow = this.administrative.filter(work => work.dueDate === this.filteredDate);
            titleText = `أعمال يوم ${this.filteredDate}`;
            clearFilterButton = `
                <button id="clear-filter-btn" class="px-3 py-1 bg-red-500 text-white text-xs rounded-md hover:bg-red-600 transition-colors">
                    <i class="ri-close-line ml-1"></i>إلغاء الفلترة
                </button>
            `;
        }

        if (worksToShow.length === 0) {
            return `
                <div class="text-center py-12">
                    <i class="ri-briefcase-line text-6xl text-gray-300 mb-4"></i>
                    <p class="text-gray-500 text-lg">${this.filteredDate ? 'لا توجد أعمال في هذا التاريخ' : 'لا توجد أعمال إدارية مضافة بعد'}</p>
                    <p class="text-gray-400 text-sm mt-2">يمكنك إضافة الأعمال الإدارية من الزر أعلاه</p>
                    ${clearFilterButton}
                </div>
            `;
        }

        // ترتيب الأعمال حسب النظام المحدد
        const sortedWorks = [...worksToShow].sort((a, b) => {
            if (!a.dueDate) return 1;
            if (!b.dueDate) return -1;
            
            const dateA = new Date(a.dueDate);
            const dateB = new Date(b.dueDate);
            
            return this.sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });

        let listHTML = `
            <div class="w-full">
                <div id="administrative-list-wrapper" class="bg-indigo-50 rounded-xl border-2 border-indigo-300 shadow-sm h-full min-h-0 overflow-hidden flex flex-col">
                    <div class="administrative-list-header flex justify-between items-center p-3 border-b border-indigo-200/60 bg-indigo-50">
                        <div class="flex items-center gap-2">
                            <h3 class="text-lg font-bold text-gray-800">${titleText} (${worksToShow.length})</h3>
                            ${clearFilterButton}
                        </div>
                        <div class="flex items-center gap-2">
                            <button id="sort-btn" class="flex items-center gap-1 px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-md text-sm transition-colors">
                                <span>${this.sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً'}</span>
                                <i class="ri-arrow-${this.sortOrder === 'desc' ? 'down' : 'up'}-line text-gray-600"></i>
                            </button>
                        </div>
                    </div>
                    <div id="administrative-list" class="space-y-3 overscroll-contain p-3">
        `;

        sortedWorks.forEach((work, index) => {
            const dueDate = work.dueDate || 'غير محدد';
            const task = work.task || 'غير محدد';
            const location = work.location || 'غير محدد';
            const completed = work.completed ? 'منجز' : 'متبقي';
            const completedClass = work.completed ? 'text-green-600' : 'text-red-600';
            const completedIcon = work.completed ? 'ri-check-line' : 'ri-time-line';
            
            listHTML += `
                <div class="work-card bg-white border border-gray-200 rounded-lg p-4 hover:bg-indigo-50 hover:border-indigo-300 transition-all duration-200">
                    <div class="flex justify-between items-start gap-3">
                        <div class="flex-1 space-y-1.5">
                            <!-- Row 1: Status standalone -->
                            <div class="flex items-center gap-2" style="order:1">
                                <i class="${completedIcon} ${work.completed ? 'text-green-600' : 'text-red-600'}"></i>
                                <span class="text-xs text-gray-500 font-semibold" style="font-size:13px">الحالة</span>
                                <span class="text-sm font-bold ${completedClass}" style="font-size:14px">${completed}</span>
                            </div>
                            <!-- Row 2: Location -->
                            <div class="flex items-center gap-2" style="order:2">
                                <i class="ri-map-pin-line text-indigo-500"></i>
                                <span class="text-xs text-gray-500 font-semibold" style="font-size:13px">مكان العمل</span>
                                <span class="text-sm text-gray-900 font-semibold" style="font-size:15px">${location}</span>
                            </div>
                            <!-- Row 3: Date -->
                            <div class="flex items-center gap-2" style="order:3">
                                <i class="ri-calendar-event-line text-indigo-500"></i>
                                <span class="text-xs text-gray-500 font-semibold" style="font-size:13px">تاريخ الإنجاز</span>
                                <span class="text-sm text-gray-900 font-bold" style="font-size:15px">${dueDate}</span>
                            </div>
                            <!-- Row 4: Task -->
                            <div class="flex items-center gap-2" style="order:4">
                                <i class="ri-list-check text-indigo-500"></i>
                                <span class="text-xs text-gray-500 font-semibold" style="font-size:13px">العمل المطلوب</span>
                                <span class="text-sm text-gray-900 font-bold" style="font-size:15px">${task}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-2 shrink-0">
                            <button class="edit-work-btn p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" data-work-id="${work.id}" title="تعديل العمل">
                                <i class="ri-pencil-line"></i>
                            </button>
                            <button class="delete-work-btn p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors" data-work-id="${work.id}" title="حذف العمل">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;
        });

        listHTML += `
                    </div>
                </div>
            </div>`;
        return listHTML;
    }

    getWorksForDate(dateStr) {
        return this.administrative.filter(work => work.dueDate === dateStr);
    }

    attachEventListeners() {
        // View toggle buttons
        document.getElementById('calendar-view-btn')?.addEventListener('click', () => {
            if (this.viewMode !== 'calendar') {
                this.viewMode = 'calendar';
                // إلغاء الفلترة عند الانتقال للتقويم
                this.filteredDate = null;
                document.getElementById('date-search').value = '';
                this.updateContent();
            }
        });

        document.getElementById('list-view-btn')?.addEventListener('click', () => {
            if (this.viewMode !== 'list') {
                this.viewMode = 'list';
                this.updateContent();
            }
        });

        // Calendar navigation
        document.getElementById('prev-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() - 1);
            this.updateContent();
        });

        document.getElementById('next-month')?.addEventListener('click', () => {
            this.currentDate.setMonth(this.currentDate.getMonth() + 1);
            this.updateContent();
        });

        // Sync time to fix wrong system clock
        document.getElementById('sync-time-btn')?.addEventListener('click', async (e) => {
            const btn = e.currentTarget;
            const icon = btn.querySelector('i');
            btn.disabled = true;
            btn.classList.add('opacity-80','cursor-not-allowed');
            icon.classList.add('animate-spin');
            showToast('جارٍ تحديث التقويم...', 'info');
            try {
                const offset = await this.syncTimeOffset();
                if (typeof offset === 'number') {
                    showToast('تمت مزامنة الوقت بنجاح', 'success');
                    this.updateStatistics();
                    this.updateContent();
                } else {
                    showToast('تعذر المزامنة حالياً', 'error');
                }
            } catch (e) {
                showToast('تعذر المزامنة حالياً', 'error');
            } finally {
                icon.classList.remove('animate-spin');
                btn.disabled = false;
                btn.classList.remove('opacity-80','cursor-not-allowed');
            }
        });

        // Date search
        const dateSearch = document.getElementById('date-search');
        if (dateSearch) {
            dateSearch.replaceWith(dateSearch.cloneNode(true));
            const newDateSearch = document.getElementById('date-search');
            newDateSearch.addEventListener('change', (e) => {
                const selectedDate = e.target.value;
                if (selectedDate) {
                    this.searchByDate(selectedDate, { silent: true });
                }
            });
        }

        // Clear filter button
        const clearBtn = document.getElementById('clear-filter-btn');
        if (clearBtn) {
            clearBtn.replaceWith(clearBtn.cloneNode(true));
            const newClearBtn = document.getElementById('clear-filter-btn');
            newClearBtn.addEventListener('click', () => {
                this.clearFilter();
            });
        }

        // Sort button
        const sortBtn = document.getElementById('sort-btn');
        if (sortBtn) {
            sortBtn.replaceWith(sortBtn.cloneNode(true));
            const newSortBtn = document.getElementById('sort-btn');
            newSortBtn.addEventListener('click', () => {
                this.toggleSort();
            });
        }

        // Calendar day clicks
        document.querySelectorAll('[data-date]').forEach(dayElement => {
            dayElement.addEventListener('click', (e) => {
                const date = e.currentTarget.dataset.date;
                const dateInput = document.getElementById('date-search');
                if (dateInput) dateInput.value = date;
                this.selectDate(date);
            });
        });

        // Add new work button
        document.getElementById('add-new-work-btn')?.addEventListener('click', () => {
            this.saveState();
            navigateTo(displayAdministrativeForm);
        });

        // Work list actions
        document.querySelectorAll('.edit-work-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workId = parseInt(e.currentTarget.dataset.workId, 10);
                this.saveState();
                navigateTo(displayAdministrativeForm, workId);
            });
        });

        document.querySelectorAll('.delete-work-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const workId = parseInt(e.currentTarget.dataset.workId, 10);
                this.deleteWork(workId);
            });
        });
    }

    updateContent() {
        const contentContainer = document.getElementById('calendar-content');
        if (contentContainer) {
            contentContainer.innerHTML = this.viewMode === 'calendar' ? this.renderCalendar() : this.renderWorksList();
            this.attachEventListeners();
            if (this.viewMode === 'list') {
                setTimeout(() => {
                    this.setupAdministrativeListScrollBox?.();
                }, 10);
            } else {
                const mainEl = document.querySelector('main');
                if (mainEl) mainEl.style.overflowY = 'auto';
            }
        }

        // Update statistics
        this.updateStatistics();

        // Update view toggle buttons
        const calendarBtn = document.getElementById('calendar-view-btn');
        const listBtn = document.getElementById('list-view-btn');
        
        if (calendarBtn && listBtn) {
            calendarBtn.className = `flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${this.viewMode === 'calendar' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}`;
            listBtn.className = `flex-1 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${this.viewMode === 'list' ? 'bg-indigo-500 text-white shadow-md' : 'text-gray-600 hover:text-gray-800'}`;
        }

        // Update work details panel visibility
        const detailsPanel = document.getElementById('work-details');
        if (detailsPanel) {
            detailsPanel.classList.add('hidden');
        }
    }

    searchByDate(dateStr, options = {}) {
        const { silent = false } = options;
        const isNewSearch = this.lastToastDate !== dateStr;
        
        const worksForDate = this.getWorksForDate(dateStr);
        
        // تطبيق الفلترة بالتار��خ المحدد
        this.filteredDate = dateStr;
        
        // Switch to list view and show filtered works
        this.viewMode = 'list';
        this.selectedDate = dateStr;
        this.updateContent();
        
        if (!silent && isNewSearch) {
            this.lastToastDate = dateStr;
        }
    }

    clearFilter() {
        this.filteredDate = null;
        this.selectedDate = null;
        this.lastToastDate = null;
        document.getElementById('date-search').value = '';
        this.updateContent();
    }

    toggleSort() {
        this.sortOrder = this.sortOrder === 'desc' ? 'asc' : 'desc';
        
        // Update button immediately
        const sortBtn = document.getElementById('sort-btn');
        if (sortBtn) {
            const span = sortBtn.querySelector('span');
            const icon = sortBtn.querySelector('i');
            if (span) span.textContent = this.sortOrder === 'desc' ? 'الأحدث أولاً' : 'الأقدم أولاً';
            if (icon) icon.className = `ri-arrow-${this.sortOrder === 'desc' ? 'down' : 'up'}-line text-gray-600`;
        }
        
        // Re-render the list only
        if (this.viewMode === 'list') {
            const contentContainer = document.getElementById('calendar-content');
            if (contentContainer) {
                contentContainer.innerHTML = this.renderWorksList();
                this.attachEventListeners();
                setTimeout(() => {
                    this.setupAdministrativeListScrollBox?.();
                }, 10);
            }
        }
    }

    selectDate(dateStr) {
        this.selectedDate = dateStr;
        const worksForDate = this.getWorksForDate(dateStr);
        if (this.viewMode === 'calendar') {
            if (worksForDate.length > 0) {
                this.filteredDate = dateStr;
                this.viewMode = 'list';
                this.updateContent();
            } else {
                this.updateContent();
            }
        } else {
            this.filteredDate = dateStr;
            this.updateContent();
        }
    }

    async deleteWork(workId) {
        if (confirm('هل أنت متأكد من حذف هذا العمل؟')) {
            try {
                await deleteById('administrative', workId);
                await this.loadAllAdministrative();
                this.updateContent();
                await updateCountersInHeader();
                showToast('تم حذف العمل بنجاح', 'success');
            } catch (error) {
                console.error('Error deleting work:', error);
                showToast('حدث خطأ أثناء حذف العمل', 'error');
            }
        }
    }

    setupAdministrativeListScrollBox() {
        try {
            const wrapper = document.getElementById('administrative-list-wrapper');
            const list = document.getElementById('administrative-list');
            if (!wrapper || !list) return;

            const mainEl = document.querySelector('main');
            const viewportH = window.innerHeight;
            const top = wrapper.getBoundingClientRect().top;
            const targetH = Math.max(240, viewportH - top - 12);

            wrapper.style.height = targetH + 'px';
            wrapper.style.minHeight = '0px';
            list.style.maxHeight = (targetH - 48) + 'px';
            list.style.overflowY = 'auto';

            if (mainEl) {
                mainEl.style.overflowY = 'hidden';
            }
        } catch (e) {}

        if (!this.__administrativeListResizeBound) {
            this.__administrativeListResizeBound = true;
            window.addEventListener('resize', () => this.setupAdministrativeListScrollBox());
        }
    }
}

// Global variable to maintain administrative state
let globalAdministrativeManager = null;

// Global function to display administrative modal
async function displayAdministrativeModal() {
    if (!globalAdministrativeManager) {
        globalAdministrativeManager = new AdministrativeManager();
    }
    await globalAdministrativeManager.init();
}

// عرض نموذج إضافة/تعديل العمل الإداري
async function displayAdministrativeForm(workId = null) {
    try {
        const isEdit = workId !== null;
        let work = null;
        
        if (isEdit) {
            work = await getById('administrative', workId);
            if (!work) {
                showToast('لم يتم العثور على العمل', 'error');
                return;
            }
        }
        
        // جلب جميع الموكلين
        const clients = await getAllClients();
        const prefillClientName = work ? (work.clientName || (work.clientId ? (clients.find(c => c.id === work.clientId)?.name || '') : '')) : '';
        
        document.getElementById('modal-title').textContent = isEdit ? 'تعديل العمل الإداري' : 'إضافة عمل إداري جديد';
        const modalContent = document.getElementById('modal-content');
        const modalContainer = document.getElementById('modal-container');
        
        // توسيع النافذة لملء الشاشة
        modalContainer.classList.remove('max-w-5xl', 'max-w-7xl', 'mx-4', 'w-full');
        modalContainer.classList.add('w-full', 'h-screen');
        modalContent.classList.remove('px-4', 'pb-4');
        modalContent.classList.add('p-6', 'h-full', 'overflow-y-auto');
        
        modalContent.innerHTML = `
            <div class="w-full h-full p-4">
                <div class="w-full h-full mx-auto">
                    <form id="administrative-form" class="space-y-4 flex flex-col min-h-full">
                        <!-- حالة العمل أعلى الشاشة -->
                        <div class="w-full flex justify-center">
                            <div class="bg-white border-2 border-gray-300 rounded-xl p-4 shadow-sm max-w-md w-full">
                                <label class="block text-base font-bold text-gray-700 mb-2 text-center">حالة العمل</label>
                                <div class="grid grid-cols-2 gap-2">
                                    <label class="flex items-center justify-center gap-1 cursor-pointer bg-gray-50 p-3 rounded-lg border border-red-200 hover:border-red-400 hover:bg-red-50 transition-all ${!work || !work.completed ? 'ring-2 ring-red-400 bg-red-50' : ''}">
                                        <input type="radio" name="completed" value="false" class="w-4 h-4 text-red-600 focus:ring-red-500" 
                                               ${!work || !work.completed ? 'checked' : ''}>
                                        <i class="ri-time-line text-red-600"></i>
                                        <span class="text-red-600 font-bold text-sm">غير منجز</span>
                                    </label>
                                    <label class="flex items-center justify-center gap-1 cursor-pointer bg-gray-50 p-3 rounded-lg border border-green-200 hover:border-green-400 hover:bg-green-50 transition-all ${work && work.completed ? 'ring-2 ring-green-400 bg-green-50' : ''}">
                                        <input type="radio" name="completed" value="true" class="w-4 h-4 text-green-600 focus:ring-green-500" 
                                               ${work && work.completed ? 'checked' : ''}>
                                        <i class="ri-check-line text-green-600"></i>
                                        <span class="text-green-600 font-bold text-sm">منجز</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <!-- السطر الأول: الموكل والعمل المطلوب -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <!-- العمل المطلوب -->
                            <div>
                                <div class="flex items-stretch">
                                    <label for="task" class="px-3 py-2 border-2 border-indigo-300 bg-indigo-50 text-sm font-bold text-indigo-800 shrink-0 w-28 md:w-32 text-right rounded-r-lg">العمل المطلوب</label>
                                    <div class="flex-1 relative -mr-px">
                                        <input type="text" id="task" autocomplete="off" class="w-full px-4 py-3 text-base bg-white border-2 border-indigo-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 font-medium" value="${work ? work.task || '' : ''}" placeholder="اكتب وصف العمل المطلوب..." required>
                                        <button type="button" id="task-toggle" class="absolute inset-y-0 left-0 flex items-center px-2 text-gray-500 hover:text-gray-700">
                                            <i class="ri-arrow-down-s-line"></i>
                                        </button>
                                        <div id="task-dropdown" class="autocomplete-results hidden"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- الموكل -->
                            <div>
                                <div class="flex items-stretch">
                                    <label for="client-name" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">الموكل</label>
                                    <div class="flex-1 relative -mr-px">
                                        <input type="text" id="client-name" autocomplete="off" class="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value="${prefillClientName}" placeholder="اكتب اسم الموكل (اختياري)">
                                        <button type="button" id="client-name-toggle" class="absolute inset-y-0 left-0 flex items-center px-2 text-gray-500 hover:text-gray-700">
                                            <i class="ri-arrow-down-s-line"></i>
                                        </button>
                                        <div id="client-name-dropdown" class="autocomplete-results hidden"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- السطر الثاني: تاريخ الإنجاز ومكان العمل -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <!-- تاريخ الإنجاز -->
                            <div>
                                <div class="flex items-stretch relative">
                                    <label for="due-date" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">تاريخ الإنجاز</label>
                                    <div class="flex-1 -mr-px relative">
                                        <input type="text" id="due-date" class="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 placeholder-gray-400 text-right" placeholder="YYYY-MM-DD" value="${work ? work.dueDate || '' : ''}" required>
                                        <button type="button" id="open-date-picker-due" class="absolute inset-y-0 left-2 flex items-center text-indigo-600">
                                            <i class="ri-calendar-event-line"></i>
                                        </button>
                                        <div id="custom-date-picker-due" class="absolute left-0 top-12 bg-white border border-gray-300 rounded-lg shadow-xl p-3 w-80 hidden z-50"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- مكان العمل -->
                            <div>
                                <div class="flex items-stretch">
                                    <label for="location" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">مكان العمل</label>
                                    <div class="flex-1 relative -mr-px">
                                        <input type="text" id="location" autocomplete="off" class="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" value="${work ? work.location || '' : ''}" placeholder="مكان إتمام العمل...">
                                        <button type="button" id="location-toggle" class="absolute inset-y-0 left-0 flex items-center px-2 text-gray-500 hover:text-gray-700">
                                            <i class="ri-arrow-down-s-line"></i>
                                        </button>
                                        <div id="location-dropdown" class="autocomplete-results hidden"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- السطر الثالث: الملاحظات -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <!-- الملاحظات -->
                            <div>
                                <div class="flex items-stretch">
                                    <label for="notes" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">ملاحظات</label>
                                    <input type="text" id="notes" class="flex-1 px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 -mr-px" 
                                           value="${work ? work.notes || '' : ''}" placeholder="أي ملاحظات إضافية...">
                                </div>
                            </div>
                        </div>
                        
                        <!-- أزرار الحفظ والإلغاء -->
                        <div class="mt-auto pt-4">
                            <div class="sticky bottom-0 left-0 right-0 z-10 bg-gray-50 border-t border-gray-200 py-3">
                                <div class="flex justify-center">
                                    <div class="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm flex items-center gap-2">
                                        <button type="submit" class="w-auto px-4 py-2 text-sm bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white rounded-md font-semibold shadow-sm flex items-center justify-center gap-1">
                                            <i class="ri-save-line text-base"></i>
                                            ${isEdit ? 'تحديث العمل' : 'حفظ العمل'}
                                        </button>
                                        <button type="button" id="cancel-administrative-btn" class="w-auto px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-md font-semibold shadow-sm flex items-center justify-center gap-1">
                                            <i class="ri-close-line text-base"></i>
                                            إلغاء
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        `;
        
        // تغيير زر الرئيسية لزر رجوع بعد إنشاء المحتوى + إخفاء زر الشريط الجانبي
        setTimeout(() => {
            const backBtn = document.getElementById('back-to-main');
            const pageTitle = document.getElementById('page-title');
            const bodyEl = document.body;
            const sidebarToggle = document.getElementById('sidebar-toggle');
            if (sidebarToggle) sidebarToggle.checked = false; // تأكد من إغلاق الشريط
            if (bodyEl) bodyEl.classList.add('hide-sidebar-toggle'); // إخفاء زر السهم
            if (backBtn && pageTitle) {
                backBtn.innerHTML = `
                    <i class="ri-arrow-right-line text-white text-lg"></i>
                    <span class="text-white">رجوع</span>
                `;
                pageTitle.textContent = isEdit ? 'تعديل العمل الإداري' : 'إضافة عمل إداري جديد';
                // إزالة المستمع القديم وإضافة الجديد
                const newBackBtn = backBtn.cloneNode(true);
                backBtn.parentNode.replaceChild(newBackBtn, backBtn);
                newBackBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    navigateBack();
                });
            }
        }, 100);
        
        (function(){
            const dueInput = document.getElementById('due-date');
            const dpBtn = document.getElementById('open-date-picker-due');
            const dp = document.getElementById('custom-date-picker-due');
            function to2(n){return n.toString().padStart(2,'0');}
            function toYMD(d){return d.getFullYear()+"-"+to2(d.getMonth()+1)+"-"+to2(d.getDate());}
            function parseYMD(s){const ok = s && /^\d{4}-\d{2}-\d{2}$/.test(s); if(!ok) return null; const [y,mo,da]=s.split('-').map(Number); const d=new Date(y,mo-1,da); if(d.getFullYear()!==y||d.getMonth()!==mo-1||d.getDate()!==da) return null; return d;}
            function normalizeDMYString(s){ if(!s) return null; const m=s.trim().match(/^(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})$/); if(!m) return null; let d=parseInt(m[1],10), mo=parseInt(m[2],10), y=parseInt(m[3],10); if(m[3].length===2){ y = y < 50 ? 2000 + y : 1900 + y; } const dt=new Date(y,mo-1,d); if(dt.getFullYear()!==y||dt.getMonth()!==mo-1||dt.getDate()!==d) return null; return toYMD(dt); }
            let viewDate = parseYMD(dueInput?.value) || new Date();
            function buildDPHTML(d){
                const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
                const dayNames=['سبت','أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة'];
                const y=d.getFullYear();
                const m=d.getMonth();
                const first=new Date(y,m,1);
                let start=first.getDay();
                const daysInMonth=new Date(y,m+1,0).getDate();
                const cells=[]; for(let i=0;i<start;i++) cells.push(''); for(let day=1; day<=daysInMonth; day++) cells.push(day); while(cells.length%7!==0) cells.push('');
                let grid='';
                for(const c of cells){ if(c==='') grid+=`<button type="button" class="w-10 h-10 text-center text-gray-300 cursor-default" disabled>-</button>`; else { const isSel = dueInput && dueInput.value && dueInput.value===toYMD(new Date(y,m,c)); grid+=`<button type="button" data-day="${c}" class="w-10 h-10 rounded ${isSel?'bg-indigo-600 text-white':'hover:bg-indigo-100 text-gray-800'}">${c}</button>`; } }
                return `
                    <div class="flex items-center justify-between mb-2">
                        <button type="button" id="dp-next" class="w-8 h-8 border rounded text-sm leading-none flex items-center justify-center">›</button>
                        <div class="flex items-center gap-2">
                            <select id="dp-month" class="border rounded px-2 py-1 text-sm">${months.map((nm,idx)=>`<option value="${idx}" ${idx===m?'selected':''}>${nm}</option>`).join('')}</select>
                            <input id="dp-year" type="number" class="border rounded px-2 py-1 w-20 text-sm" value="${y}">
                        </div>
                        <button type="button" id="dp-prev" class="w-8 h-8 border rounded text-sm leading-none flex items-center justify-center">‹</button>
                    </div>
                    <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-1">${dayNames.map(n=>`<div>${n}</div>`).join('')}</div>
                    <div class="grid grid-cols-7 gap-1 mb-2">${grid}</div>
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex gap-2">
                            <button type="button" id="dp-today" class="px-2 py-1 border rounded text-sm">اليوم</button>
                            <button type="button" id="dp-yesterday" class="px-2 py-1 border rounded text-sm">البارحة</button>
                            <button type="button" id="dp-tomorrow" class="px-2 py-1 border rounded text-sm">غداً</button>
                        </div>
                        <button type="button" id="dp-close" class="px-2 py-1 border rounded text-sm">إغلاق</button>
                    </div>`;
            }
            function attachDPHandlers(){
                if (dp) dp.addEventListener('click', (e)=> e.stopPropagation());
                const prev=dp.querySelector('#dp-prev');
                const next=dp.querySelector('#dp-next');
                const mSel=dp.querySelector('#dp-month');
                const yInp=dp.querySelector('#dp-year');
                if(prev) prev.addEventListener('click',(e)=>{ e.stopPropagation(); viewDate=new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1); renderDP(); });
                if(next) next.addEventListener('click',(e)=>{ e.stopPropagation(); viewDate=new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1); renderDP(); });
                if(mSel) { mSel.addEventListener('click',(e)=> e.stopPropagation()); mSel.addEventListener('change',(e)=>{ e.stopPropagation(); viewDate=new Date(viewDate.getFullYear(), parseInt(mSel.value), 1); renderDP(); }); }
                if(yInp) { yInp.addEventListener('click',(e)=> e.stopPropagation()); yInp.addEventListener('input',(e)=>{ e.stopPropagation(); const yy=parseInt(yInp.value)||viewDate.getFullYear(); viewDate=new Date(yy, viewDate.getMonth(), 1); }); yInp.addEventListener('change',(e)=>{ e.stopPropagation(); renderDP(); }); }
                dp.querySelectorAll('button[data-day]').forEach(b=>{ b.addEventListener('click',(e)=>{ e.stopPropagation(); const day=parseInt(b.getAttribute('data-day')); const d=new Date(viewDate.getFullYear(), viewDate.getMonth(), day); if(dueInput) dueInput.value=toYMD(d); dp.classList.add('hidden'); }); });
                const t=dp.querySelector('#dp-today');
                const yst=dp.querySelector('#dp-yesterday');
                const tm=dp.querySelector('#dp-tomorrow');
                const cl=dp.querySelector('#dp-close');
                if(t) t.addEventListener('click',(e)=>{ e.stopPropagation(); const d=new Date(); if(dueInput) dueInput.value=toYMD(d); dp.classList.add('hidden'); });
                if(yst) yst.addEventListener('click',(e)=>{ e.stopPropagation(); const d=new Date(); d.setDate(d.getDate()-1); if(dueInput) dueInput.value=toYMD(d); dp.classList.add('hidden'); });
                if(tm) tm.addEventListener('click',(e)=>{ e.stopPropagation(); const d=new Date(); d.setDate(d.getDate()+1); if(dueInput) dueInput.value=toYMD(d); dp.classList.add('hidden'); });
                if(cl) cl.addEventListener('click',(e)=>{ e.stopPropagation(); dp.classList.add('hidden'); });
            }
            function renderDP(){ if(dp) { dp.innerHTML=buildDPHTML(viewDate); attachDPHandlers(); } }
            function openDP(){ renderDP(); if(dp) dp.classList.remove('hidden'); }
            function outsideClose(e){ if(dp && !dp.contains(e.target) && e.target!==dpBtn && !e.target.closest('#open-date-picker-due')) dp.classList.add('hidden'); }
            if(dpBtn && dp){ dpBtn.addEventListener('click',(e)=>{ e.stopPropagation(); openDP(); }); document.addEventListener('click', outsideClose); }
            const normalizeManual = ()=>{ if(dueInput){ const n = normalizeDMYString(dueInput.value); if(n) dueInput.value = n; } };
            if(dueInput){ dueInput.addEventListener('blur', normalizeManual); dueInput.addEventListener('change', normalizeManual); }
            const formEl = document.getElementById('administrative-form');
            if(formEl){ formEl.addEventListener('submit', ()=> normalizeManual(), true); }
        })();

        // إضافة مستمعي الأحداث
        document.getElementById('administrative-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            await saveAdministrative(workId);
        });
        
        document.getElementById('cancel-administrative-btn').addEventListener('click', () => {
            sessionStorage.setItem('expandedAdministrativeClientId', 'general');
            navigateBack();
        });
        try {
            const input = document.getElementById('client-name');
            const dropdown = document.getElementById('client-name-dropdown');
            const toggle = document.getElementById('client-name-toggle');
            if (input && dropdown) {
                setupAutocomplete('client-name', 'client-name-dropdown', async () => await getAllClients(), () => {});
                if (toggle) {
                    toggle.addEventListener('click', async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!dropdown.classList.contains('hidden')) { dropdown.classList.add('hidden'); return; }
                        const items = await getAllClients();
                        const list = (items || []).map(i => i.name).filter(Boolean).sort((a,b)=>a.localeCompare(b,'ar'));
                        dropdown.innerHTML = list.map(v => `<div class="autocomplete-item">${v}</div>`).join('');
                        dropdown.classList.remove('hidden');
                    });
                }
                dropdown.addEventListener('click', (e) => {
                    const item = e.target.closest('.autocomplete-item');
                    if (!item) return;
                    input.value = item.textContent || '';
                    dropdown.classList.add('hidden');
                });
                document.addEventListener('click', (e) => {
                    if (e.target === input || e.target === toggle || (e.target.closest && e.target.closest('#client-name-dropdown'))) return;
                    dropdown.classList.add('hidden');
                });
            }
        } catch (_) {}
        try {
            const adminList = await getAllAdministrative();
            const uniq = (arr) => Array.from(new Set((arr || []).filter(Boolean)));
            const tasksList = uniq(adminList.map(x => x.task));
            const locsList = uniq(adminList.map(x => x.location));
            const setupCombo = (inputId, dropdownId, toggleId, items) => {
                const input = document.getElementById(inputId);
                const dropdown = document.getElementById(dropdownId);
                const toggle = document.getElementById(toggleId);
                if (!input || !dropdown) return;
                const objects = (items || []).map(v => ({ name: String(v) }));
                setupAutocomplete(inputId, dropdownId, async () => objects, () => {});
                if (toggle) {
                    toggle.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!dropdown.classList.contains('hidden')) { dropdown.classList.add('hidden'); return; }
                        const list = (items || []).map(v => String(v)).filter(Boolean).sort((a,b)=>a.localeCompare(b,'ar'));
                        dropdown.innerHTML = list.map(v => `<div class="autocomplete-item">${v}</div>`).join('');
                        dropdown.classList.remove('hidden');
                    });
                }
                dropdown.addEventListener('click', (e) => {
                    const item = e.target.closest('.autocomplete-item');
                    if (!item) return;
                    input.value = item.textContent || '';
                    dropdown.classList.add('hidden');
                });
                document.addEventListener('click', (e) => {
                    if (e.target === input || e.target === toggle || (e.target.closest && e.target.closest(`#${dropdownId}`))) return;
                    dropdown.classList.add('hidden');
                });
            };
            setupCombo('task', 'task-dropdown', 'task-toggle', tasksList);
            setupCombo('location', 'location-dropdown', 'location-toggle', locsList);
        } catch (_) {}
        
    } catch (error) {
        showToast('حدث خطأ في عرض النموذج', 'error');
    }
}

// حفظ العمل الإداري
async function saveAdministrative(workId = null) {
    try {
        const clientName = document.getElementById('client-name').value.trim();
        const task = document.getElementById('task').value.trim();
        const dueDate = document.getElementById('due-date').value;
        const location = document.getElementById('location').value.trim();
        const completed = document.querySelector('input[name="completed"]:checked').value === 'true';
        const notes = document.getElementById('notes').value.trim();
        
        if (!task || !dueDate) {
            showToast('يرجى ملء جميع الحقول المطلوبة', 'error');
            return;
        }
        
        const workData = {
            clientId: null,
            clientName: clientName || null,
            task,
            dueDate,
            location: location || null,
            completed,
            notes: notes || null,
            createdAt: workId ? undefined : new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        
        if (workId) {
            await updateById('administrative', workId, workData);
            showToast('تم تحديث العمل بنجاح', 'success');
            
            sessionStorage.setItem('expandedAdministrativeClientId', 'general');
        } else {
            await addToStore('administrative', workData);
            showToast('تم حفظ ال��مل بنجاح', 'success');
        }
        
        navigateBack();
        
    } catch (error) {
        showToast('حدث خطأ في حفظ العمل', 'error');
    }
}

// دوال قاعدة البيانات للأعمال الإدارية
async function getAllAdministrative() {
    return await getAll('administrative');
}

// استمع لحفظ الأعمال الإدارية لإعادة تحميل المدير
document.addEventListener('administrativeSaved', async () => {
    const modalTitle = document.getElementById('modal-title');
    if (modalTitle && modalTitle.textContent === 'إدارة الأعمال الإدارية' && globalAdministrativeManager) {
        await globalAdministrativeManager.loadAllAdministrative();
        globalAdministrativeManager.updateContent();
    }
});