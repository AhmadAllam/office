// ملف إدارة أوراق المحضرين
// نافذة أوراق المحضرين مع البحث والإحصائيات وعرض البيانات بطريقة الكروت

// متغيرات عامة
let openClientIds = new Set(); // لحفظ الموكلين المفتوحين

// عرض نافذة أوراق المحضرين
function displayClerkPapersModal() {
    document.body.classList.remove('form-active');
    document.getElementById('modal-title').textContent = 'أوراق المحضرين';
    const modalContent = document.getElementById('modal-content');
    const modalContainer = document.getElementById('modal-container');
    
    // توسيع النافذة
    modalContainer.classList.remove('max-w-5xl');
    modalContainer.classList.add('w-full');
    
    modalContent.classList.remove('search-modal-content');
    
    // إعادة تعيين زر الرئيسية للحالة الأصلية
    setTimeout(() => {
        const backBtn = document.getElementById('back-to-main');
        const pageTitle = document.getElementById('page-title');
        if (backBtn && pageTitle) {
            backBtn.innerHTML = `
                <i class="ri-home-5-line text-white text-lg"></i>
                <span class="text-white">الرئيسيه</span>
            `;
            pageTitle.textContent = 'أوراق المحضرين';
            
            // إزالة جميع event listeners السابقة وإضافة الأصلي
            const newBackBtn = backBtn.cloneNode(true);
            backBtn.parentNode.replaceChild(newBackBtn, backBtn);
            
            newBackBtn.addEventListener('click', function () {
                window.location.href = 'index.html';
            });
        }
    }, 100);
    
    modalContent.innerHTML = `
        <div class="search-layout">
            <div class="flex gap-6 h-[75vh]">
                <!-- الجانب الأيمن: شريط البحث والإحصائيات -->
                <div class="w-1/4 space-y-6 search-left-pane" data-left-pane="clerk">
                    <!-- شريط البحث -->
                    <div class="bg-blue-50 p-4 rounded-lg border border-blue-200 shadow-sm">
                        <div class="space-y-2">
                            <div class="relative">
                                <input type="text" id="clerk-papers-search" 
                                       placeholder="ابحث بالموكل أو رقم الورقة..." 
                                       class="w-full p-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right shadow-sm pr-10">
                                <div class="absolute right-3 top-1/2 transform -translate-y-1/2">
                                    <i class="ri-search-2-line text-gray-400 text-base"></i>
                                </div>
                            </div>
                            
                            <button id="clear-clerk-papers-search" class="w-full px-4 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all shadow-sm">
                                <i class="ri-close-line text-lg ml-2"></i>مسح البحث
                            </button>
                            <button id="add-new-clerk-paper" class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-sm text-sm font-bold flex items-center justify-center gap-2">
                                <i class="ri-add-line text-lg ml-2"></i>إضافة ورقة جديدة
                            </button>
                        </div>
                    </div>

                    <!-- إحصائيات سريعة -->
                    <div class="bg-white rounded-lg p-3 shadow-md border border-gray-200 mb-2">
                        <h3 class="text-xs font-bold text-gray-800 mb-2 flex items-center gap-1">
                            <i class="ri-bar-chart-line text-indigo-500 text-sm"></i>
                            الإحصائيات
                        </h3>
                        <div class="space-y-2">
                            <!-- Total Papers - Full Width -->
                            <div class="bg-blue-100 rounded-lg p-2 border border-blue-300 text-center shadow-sm">
                                <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-1">
                                    <i class="ri-file-paper-line text-white text-xs"></i>
                                </div>
                                <div class="text-lg font-bold text-blue-700" id="total-papers">0</div>
                                <div class="text-xs font-medium text-blue-800">إجمالي الأوراق</div>
                            </div>

                            <!-- Warnings vs Announcements - Small Stats -->
                            <div class="grid grid-cols-2 gap-1.5">
                                <!-- Warnings -->
                                <div class="bg-red-100 rounded-lg p-2 border border-red-300 text-center shadow-sm">
                                    <div class="w-5 h-5 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                        <i class="ri-alarm-warning-line text-white text-xs"></i>
                                    </div>
                                    <div class="text-sm font-bold text-red-700" id="total-warnings">0</div>
                                    <div class="text-xs font-medium text-red-800">إنذارات</div>
                                </div>

                                <!-- Announcements -->
                                <div class="bg-blue-100 rounded-lg p-2 border border-blue-300 text-center shadow-sm">
                                    <div class="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-1">
                                        <i class="ri-notification-line text-white text-xs"></i>
                                    </div>
                                    <div class="text-sm font-bold text-blue-700" id="total-announcements">0</div>
                                    <div class="text-xs font-medium text-blue-800">إعلانات</div>
                                </div>
                            </div>
                        </div>
                    </div>
                
                </div>

                <!-- الجانب الأيسر: قائمة أوراق المحضرين -->
                <div class="flex-1 min-h-0 search-right-pane">
                    <div class="bg-white rounded-xl border border-gray-200 shadow-sm h-full min-h-0 overflow-hidden flex flex-col">
                        <div id="clerk-papers-list" class="space-y-4 overscroll-contain p-6">
                            <div class="text-center text-gray-500 py-12 sticky top-0 bg-white">
                                <i class="ri-loader-4-line animate-spin text-3xl mb-3"></i>
                                <p class="text-lg">جاري تحميل أوراق المحضرين...</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    attachClerkPapersListeners();
    loadAllClerkPapers();
    updateClerkPapersStats();
    
    // إعداد التمرير لأوراق المحضرين
    try {
        requestAnimationFrame(() => {
            setupClerkPapersScrollBox();
            setupClerkPapersHoverScrollBehavior();
        });
        window.addEventListener('resize', setupClerkPapersScrollBox);
    } catch (e) { 
        console.error(e); 
    }
}

// ربط المستمعات للأحداث
function attachClerkPapersListeners() {
    // البحث
    const searchInput = document.getElementById('clerk-papers-search');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            const searchTerm = e.target.value.trim();
            filterClerkPapers(searchTerm);
        });
    }

    // مسح البحث
    const clearSearchBtn = document.getElementById('clear-clerk-papers-search');
    if (clearSearchBtn) {
        clearSearchBtn.addEventListener('click', () => {
            document.getElementById('clerk-papers-search').value = '';
            loadAllClerkPapers();
        });
    }

    // إضافة ورقة جديدة
    const addNewBtn = document.getElementById('add-new-clerk-paper');
    if (addNewBtn) {
        addNewBtn.addEventListener('click', () => {
            displayClerkPaperForm();
        });
    }
}

// تحميل جميع أوراق المحضرين
async function loadAllClerkPapers() {
    try {
        const clerkPapers = await getAllClerkPapers();
        const clients = await getAllClients();
        const cases = await getAllCases();
        
        displayClerkPapersList(clerkPapers, clients, cases);
        updateClerkPapersStats();
    } catch (error) {
        const listContainer = document.getElementById('clerk-papers-list');
        if (listContainer) {
            listContainer.innerHTML = `
                <div class="text-center text-red-500 py-12">
                    <i class="ri-error-warning-line text-3xl mb-3"></i>
                    <p class="text-lg">حدث خطأ في تحميل أوراق المحضرين</p>
                </div>
            `;
        }
    }
}

// عرض قائمة أوراق المحضرين مجمعة بالموكل
function displayClerkPapersList(clerkPapers, clients, cases) {
    const listContainer = document.getElementById('clerk-papers-list');
    if (!listContainer) return;

    if (!clerkPapers || clerkPapers.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center text-gray-500 py-12">
                <i class="ri-file-paper-line text-4xl mb-3"></i>
                <p class="text-lg">لا توجد أوراق محضرين مضافة</p>
                <p class="text-sm text-gray-400 mt-2">اضغط على "إضافة ورقة جديدة" لبدء الإضافة</p>
            </div>
        `;
        return;
    }

    // تجميع الأوراق بالموكل
    const papersByClient = {};
    
    clerkPapers.forEach(paper => {
        const clientId = paper.clientId;
        
        if (clientId) {
            if (!papersByClient[clientId]) {
                papersByClient[clientId] = [];
            }
            papersByClient[clientId].push({...paper, clientData: clients.find(c => c.id === clientId)});
        }
    });

    let html = '';
    
    Object.keys(papersByClient).forEach(clientId => {
        const clientData = clients.find(c => c.id === parseInt(clientId));
        const clientPapers = papersByClient[clientId];
        
        if (clientData) {
            html += `
                <div class="client-group bg-white border border-gray-200 rounded-lg hover:shadow-md hover:border-green-300 transition-all duration-300 mb-3" data-client-id="${clientId}">
                    <div class="client-header cursor-pointer p-4 hover:bg-gray-50 transition-colors duration-200" onclick="toggleClientPapers(${clientId})">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-3">
                                <div class="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center shadow-md">
                                    <i class="ri-user-line text-white text-lg"></i>
                                </div>
                                <div>
                                    <div class="flex items-center gap-2">
                                        <h3 class="font-bold text-gray-800 text-lg">${clientData.name}</h3>
                                    </div>
                                </div>
                            </div>
                            <div class="flex items-center gap-2">
                                <span class="inline-block bg-emerald-100 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200">${clientPapers.length} ${clientPapers.length === 1 ? 'ورقه' : 'ورقات'}</span>
                                <i class="ri-arrow-down-s-line text-gray-400 hover:text-gray-600 text-xl transform transition-transform duration-300 ${openClientIds.has(clientId.toString()) ? 'rotate-180' : ''}" id="arrow-${clientId}"></i>
                            </div>
                        </div>
                    </div>
                    
                    <div class="client-papers border-t border-gray-200 ${openClientIds.has(clientId.toString()) ? '' : 'hidden'}" id="papers-${clientId}">
                        <div class="p-4 space-y-3 bg-gray-50 rounded-b-lg">
                            ${clientPapers.map(paper => createClerkPaperCard(paper, clientData)).join('')}
                        </div>
                    </div>
                </div>
            `;
        }
    });

    listContainer.innerHTML = html;
}

// إنشاء كارت ورقة محضر
function createClerkPaperCard(paper, clientData) {
    return `
        <div class="paper-card bg-white border border-gray-200 rounded-md p-3 hover:shadow-sm hover:border-blue-300 cursor-pointer">
            <div class="flex items-center justify-between">
                <div class="flex items-center gap-3">
                    <div class="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                        <i class="ri-file-paper-line text-sm"></i>
                    </div>
                    <div class="space-y-1">
                        <div class="grid grid-cols-2 gap-2 items-stretch">
                            <div class="bg-blue-100 border border-blue-200 rounded px-2 h-8 w-full flex items-center justify-center gap-1 text-center">
                                <span class="text-[11px] text-blue-600">رقم</span>
                                <span class="text-xs font-semibold text-blue-800 truncate">${paper.paperNumber || 'غير محدد'}</span>
                            </div>
                            <div class="bg-purple-100 border border-purple-200 rounded px-2 h-8 w-full flex items-center justify-center gap-1 text-center">
                                <span class="text-[11px] text-purple-600">نوع</span>
                                <span class="text-xs font-semibold text-purple-800 truncate">${paper.paperType || 'غير محدد'}</span>
                            </div>
                        </div>
                        <div class="grid grid-cols-2 gap-2 items-stretch">
                            <div class="bg-emerald-100 border border-emerald-200 rounded px-2 h-8 w-full flex items-center justify-center gap-1 text-center">
                                <span class="text-[11px] text-emerald-600">تسليم</span>
                                <span class="text-xs font-semibold text-emerald-800 truncate">${paper.deliveryDate || 'غير محدد'}</span>
                            </div>
                            <div class="bg-amber-100 border border-amber-200 rounded px-2 h-8 w-full flex items-center justify-center gap-1 text-center">
                                <span class="text-[11px] text-amber-600">استلام</span>
                                <span class="text-xs font-semibold text-amber-800 truncate">${paper.receiptDate || 'غير محدد'}</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="flex items-center gap-1">
                    <button onclick="editClerkPaper(${paper.id})" class="p-1.5 bg-blue-100 text-blue-600 rounded hover:bg-blue-200">
                        <i class="ri-pencil-line text-xs"></i>
                    </button>
                    <button onclick="deleteClerkPaper(${paper.id})" class="p-1.5 bg-red-100 text-red-600 rounded hover:bg-red-200">
                        <i class="ri-delete-bin-line text-xs"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// توسيع/طي أوراق الموكل
function toggleClientPapers(clientId) {
    const papersContainer = document.getElementById(`papers-${clientId}`);
    const arrow = document.getElementById(`arrow-${clientId}`);
    
    if (papersContainer && arrow) {
        const isCurrentlyOpen = openClientIds.has(clientId.toString());
        
        if (isCurrentlyOpen) {
            papersContainer.classList.add('hidden');
            arrow.style.transform = 'rotate(0deg)';
            openClientIds.delete(clientId.toString());
        } else {
            papersContainer.classList.remove('hidden');
            arrow.style.transform = 'rotate(180deg)';
            openClientIds.add(clientId.toString());
        }
    }
}

// إعادة تحميل البيانات مع الحفاظ على الحالة
async function reloadClerkPapersWithState() {
    const searchTerm = document.getElementById('clerk-papers-search')?.value || '';
    if (searchTerm) {
        await filterClerkPapers(searchTerm);
    } else {
        await loadAllClerkPapers();
    }
}

// العودة لنافذة أوراق المحضرين مع الحفاظ على الحالة
async function returnToClerkPapersModal() {
    displayClerkPapersModal();
    await reloadClerkPapersWithState();
    updateClerkPapersStats();
}

// تحديث إحصائيات أوراق المحضرين
async function updateClerkPapersStats() {
    try {
        const clerkPapers = await getAllClerkPapers();
        
        const warningsCount = clerkPapers.filter(paper => paper.paperType === 'إنذار').length;
        const announcementsCount = clerkPapers.filter(paper => paper.paperType === 'إعلان').length;
        const totalCount = clerkPapers.length;
        
        const warningsElement = document.getElementById('total-warnings');
        const announcementsElement = document.getElementById('total-announcements');
        const totalElement = document.getElementById('total-papers');
        
        if (warningsElement) warningsElement.textContent = warningsCount;
        if (announcementsElement) announcementsElement.textContent = announcementsCount;
        if (totalElement) totalElement.textContent = totalCount;
        
    } catch (error) {
    }
}

// فلترة أوراق المحضرين
async function filterClerkPapers(searchTerm) {
    if (!searchTerm) {
        loadAllClerkPapers();
        return;
    }
    
    try {
        const allPapers = await getAllClerkPapers();
        const clients = await getAllClients();
        const cases = await getAllCases();
        
        const filteredPapers = allPapers.filter(paper => {
            const clientData = clients.find(cl => cl.id === paper.clientId);
            
            return (
                (clientData && clientData.name.includes(searchTerm)) ||
                (paper.paperNumber && paper.paperNumber.includes(searchTerm))
            );
        });
        
        displayClerkPapersList(filteredPapers, clients, cases);
    } catch (error) {
    }
}

// ربط مستمعات نموذج ورقة المحضر
function attachClerkPaperFormListeners(paperId) {
    const form = document.getElementById('clerk-paper-form');
    const cancelBtn = document.getElementById('cancel-paper-btn');
    
    // إعداد الـ autocomplete للموكل
    const clientInput = document.getElementById('client-name');
    const clientDropdown = document.getElementById('client-name-dropdown');
    const hiddenClient = document.getElementById('client-select');
    
    if (clientInput && clientDropdown && hiddenClient) {
        setupAutocomplete('client-name', 'client-name-dropdown', async () => {
            const clients = await getAllClients();
            return clients.map(c => ({id: c.id, name: c.name}));
        }, (item) => {
            hiddenClient.value = item ? item.id : '';
        });
        
        // زر السهم للكومبو بوكس
        const toggleBtn = document.getElementById('client-name-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', async () => {
                if (clientDropdown.classList.contains('hidden')) {
                    // إظهار كل الموكلين
                    const clients = await getAllClients();
                    clientDropdown.innerHTML = '';
                    
                    if (clients.length > 0) {
                        clients.forEach(client => {
                            const div = document.createElement('div');
                            div.textContent = client.name;
                            div.className = 'autocomplete-item text-right text-base font-semibold text-gray-900';
                            div.addEventListener('click', () => {
                                hiddenClient.value = client.id;
                                clientInput.value = client.name;
                                clientDropdown.innerHTML = '';
                                clientDropdown.classList.add('hidden');
                            });
                            clientDropdown.appendChild(div);
                        });
                        clientDropdown.classList.remove('hidden');
                    }
                } else {
                    clientDropdown.classList.add('hidden');
                }
            });
        }
    }
    
    // إعداد الـ autocomplete لنوع الورقة
    const paperTypeInput = document.getElementById('paper-type-name');
    const paperTypeDropdown = document.getElementById('paper-type-dropdown');
    const hiddenPaperType = document.getElementById('paper-type');
    
    if (paperTypeInput && paperTypeDropdown && hiddenPaperType) {
        const paperTypes = ['إنذار', 'إعلان', 'أخرى'];
        
        setupAutocomplete('paper-type-name', 'paper-type-dropdown', async () => {
            // جلب أنواع الأوراق المستخدمة سابقاً
            const clerkPapers = await getAllClerkPapers();
            const usedTypes = [...new Set(clerkPapers.map(p => p.paperType).filter(t => t))];
            
            // دمج الأنواع الافتراضية مع المستخدمة
            const allTypes = [...new Set([...paperTypes, ...usedTypes])];
            return allTypes.map(type => ({id: type, name: type}));
        }, (item) => {
            if (item) {
                hiddenPaperType.value = item.name;
            }
            // لا نمسح الحقل المخفي إذا لم يكن هناك اختيار
        });
        
        // تحديث الحقل المخفي عند الكتابة اليدوية
        paperTypeInput.addEventListener('input', () => {
            hiddenPaperType.value = paperTypeInput.value.trim();
        });
        
        // زر السهم للكومبو بوكس
        const paperTypeToggleBtn = document.getElementById('paper-type-toggle');
        if (paperTypeToggleBtn) {
            paperTypeToggleBtn.addEventListener('click', async () => {
                if (paperTypeDropdown.classList.contains('hidden')) {
                    // إظهار كل أنواع الأوراق
                    const clerkPapers = await getAllClerkPapers();
                    const usedTypes = [...new Set(clerkPapers.map(p => p.paperType).filter(t => t))];
                    const allTypes = [...new Set([...paperTypes, ...usedTypes])];
                    
                    paperTypeDropdown.innerHTML = '';
                    
                    if (allTypes.length > 0) {
                        allTypes.forEach(type => {
                            const div = document.createElement('div');
                            div.textContent = type;
                            div.className = 'autocomplete-item text-right text-base font-semibold text-gray-900';
                            div.addEventListener('click', () => {
                                hiddenPaperType.value = type;
                                paperTypeInput.value = type;
                                paperTypeDropdown.innerHTML = '';
                                paperTypeDropdown.classList.add('hidden');
                            });
                            paperTypeDropdown.appendChild(div);
                        });
                        paperTypeDropdown.classList.remove('hidden');
                    }
                } else {
                    paperTypeDropdown.classList.add('hidden');
                }
            });
        }
    }
    
    // إعداد الـ autocomplete لقلم المحضرين
    const clerkOfficeInput = document.getElementById('clerk-office-name');
    const clerkOfficeDropdown = document.getElementById('clerk-office-dropdown');
    const hiddenClerkOffice = document.getElementById('clerk-office');
    
    if (clerkOfficeInput && clerkOfficeDropdown && hiddenClerkOffice) {
        setupAutocomplete('clerk-office-name', 'clerk-office-dropdown', async () => {
            // جلب أقلام المحضرين المستخدمة سابقاً
            const clerkPapers = await getAllClerkPapers();
            const usedOffices = [...new Set(clerkPapers.map(p => p.clerkOffice).filter(o => o))];
            
            return usedOffices.map(office => ({id: office, name: office}));
        }, (item) => {
            if (item) {
                hiddenClerkOffice.value = item.name;
            }
        });
        
        // تحديث الحقل المخفي عند الكتابة اليدوية
        clerkOfficeInput.addEventListener('input', () => {
            hiddenClerkOffice.value = clerkOfficeInput.value.trim();
        });
        
        // زر السهم للكومبو بوكس
        const clerkOfficeToggleBtn = document.getElementById('clerk-office-toggle');
        if (clerkOfficeToggleBtn) {
            clerkOfficeToggleBtn.addEventListener('click', async () => {
                if (clerkOfficeDropdown.classList.contains('hidden')) {
                    // إظهار كل أقلام المحضرين
                    const clerkPapers = await getAllClerkPapers();
                    const usedOffices = [...new Set(clerkPapers.map(p => p.clerkOffice).filter(o => o))];
                    
                    clerkOfficeDropdown.innerHTML = '';
                    
                    if (usedOffices.length > 0) {
                        usedOffices.forEach(office => {
                            const div = document.createElement('div');
                            div.textContent = office;
                            div.className = 'autocomplete-item text-right text-base font-semibold text-gray-900';
                            div.addEventListener('click', () => {
                                hiddenClerkOffice.value = office;
                                clerkOfficeInput.value = office;
                                clerkOfficeDropdown.innerHTML = '';
                                clerkOfficeDropdown.classList.add('hidden');
                            });
                            clerkOfficeDropdown.appendChild(div);
                        });
                        clerkOfficeDropdown.classList.remove('hidden');
                    }
                } else {
                    clerkOfficeDropdown.classList.add('hidden');
                }
            });
        }
    }
    
    // حفظ النموذج
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            handleSaveClerkPaper(e, paperId);
        });
    }
    
    // إلغاء
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            navigateBack();
        });
    }
}

// حفظ ورقة المحضر
async function handleSaveClerkPaper(e, paperId) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const paperData = Object.fromEntries(formData.entries());
    
    // التحقق من البيانات المطلوبة
    if (!paperData.paperType || !paperData.paperNumber) {
        showToast('يرجى ملء الحقول المطلوبة: نوع الورقة، رقم الورقة', 'error');
        return;
    }
    
    try {
        let clientId = parseInt(paperData.clientId);
        const clientNameInput = document.getElementById('client-name');
        
        // إذا لم يتم اختيار موكل موجود، إنشاء موكل جديد
        if (!clientId && clientNameInput && clientNameInput.value.trim()) {
            const clientName = clientNameInput.value.trim();
            if (clientName) {
                clientId = await addClient({ name: clientName });
                const hiddenClient = document.getElementById('client-select');
                if (hiddenClient) hiddenClient.value = String(clientId);
            }
        }
        
        if (!clientId) {
            showToast('يرجى اختيار أو إدخال اسم الموكل', 'error');
            return;
        }
        
        paperData.clientId = clientId;
        
        if (paperId) {
            // تعديل ورقة موجودة
            const existingPaper = await getById('clerkPapers', paperId);
            const updatedPaper = { ...existingPaper, ...paperData };
            await updateRecord('clerkPapers', paperId, updatedPaper);
            showToast('تم تعديل ورقة المحضر بنجاح', 'success');
        } else {
            // إضافة ورقة جديدة
            await addClerkPaper(paperData);
            showToast('تم حفظ ورقة المحضر بنجاح', 'success');
        }
        
        // العودة لنافذة أوراق المحضرين مع الحفاظ على الحالة
        navigateBack();
        
    } catch (error) {
        showToast('حدث خطأ أثناء حفظ ورقة المحضر', 'error');
    }
}

// تعديل ورقة محضر
async function editClerkPaper(paperId) {
    displayClerkPaperForm(paperId);
}

// حذف ورقة محضر
async function deleteClerkPaper(paperId) {
    if (confirm('هل أنت متأكد من حذف هذه الورقة؟')) {
        try {
            await deleteRecord('clerkPapers', paperId);
            showToast('تم حذف ورقة المحضر بنجاح', 'success');
            await reloadClerkPapersWithState();
            updateClerkPapersStats();
        } catch (error) {
            showToast('حدث خطأ أثناء حذف ورقة المحضر', 'error');
        }
    }
}

// دوال قاعدة البيانات لأوراق المحضرين
async function getAllClerkPapers() {
    return await getAll('clerkPapers') || [];
}

async function addClerkPaper(paperData) {
    return await addRecord('clerkPapers', paperData);
}

// إعداد صندوق التمرير لأوراق المحضرين
function setupClerkPapersScrollBox() {
    try {
        const rightWrapper = document.querySelector('#modal-content .flex-1.min-h-0 > div');
        const clerkPapersList = document.getElementById('clerk-papers-list');
        if (!rightWrapper || !clerkPapersList) return;
        
        const viewportH = window.innerHeight;
        const wrapperTop = rightWrapper.getBoundingClientRect().top;
        const targetH = Math.max(240, viewportH - wrapperTop - 12);
        
        rightWrapper.style.height = targetH + 'px';
        rightWrapper.style.minHeight = '0px';
        
        clerkPapersList.style.maxHeight = (targetH - 24) + 'px';
        clerkPapersList.style.overflowY = 'auto';
        
        const leftPane = document.querySelector('#modal-content [data-left-pane="clerk"]');
        if (leftPane) {
            leftPane.style.maxHeight = targetH + 'px';
            leftPane.style.minHeight = '0px';
            leftPane.style.overflowY = 'auto';
        }
    } catch (e) {}
}

// إعداد سلوك التمرير عند التحويم لأوراق المحضرين
function setupClerkPapersHoverScrollBehavior() {
    const leftPane = document.querySelector('#modal-content [data-left-pane="clerk"]');
    const rightList = document.getElementById('clerk-papers-list');
    const mainEl = document.querySelector('main');
    if (!leftPane || !rightList || !mainEl) return;

    // افتراضي: تمرير الصفحة مفعل
    const enablePageScroll = () => {
        mainEl.style.overflowY = 'auto';
        document.body.style.overflowY = '';
        rightList.style.overscrollBehavior = 'contain';
    };

    const enableRightListScrollOnly = () => {
        mainEl.style.overflowY = 'hidden';
        rightList.style.overscrollBehavior = 'contain';
    };

    // عند التحويم على الجانب الأيسر -> تمرير الصفحة
    leftPane.addEventListener('mouseenter', enablePageScroll);
    leftPane.addEventListener('mouseleave', enableRightListScrollOnly);

    // عند التحويم على قائمة أوراق المحضرين -> تمرير داخلي
    rightList.addEventListener('mouseenter', enableRightListScrollOnly);
    rightList.addEventListener('mouseleave', enablePageScroll);

    // تهيئة الحالة بناءً على موضع المؤشر الأولي
    enablePageScroll();
}
