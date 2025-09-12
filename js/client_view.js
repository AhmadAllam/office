async function displayClientViewForm(clientId) {
    try {
        const client = await getById('clients', clientId);
        if (!client) {
            showToast('لم يتم العثور على بيانات الموكل', 'error');
            return;
        }

        const cases = await getFromIndex('cases', 'clientId', clientId);
        
        // تحديث عنوان الهيدر ليكون "تفاصيل الموكل" وإخفاء عنوان المودال الداخلي
        const pageHeaderTitle = document.getElementById('page-title');
        if (pageHeaderTitle) pageHeaderTitle.textContent = 'تفاصيل الموكل';
        const modalTitleEl = document.getElementById('modal-title');
        if (modalTitleEl) modalTitleEl.textContent = '';
        const modalContent = document.getElementById('modal-content');
        modalContent.classList.remove('search-modal-content');
        

        const caseOpponentIds = [...new Set(cases.map(c => c.opponentId).filter(id => id))];
        

        let tempOpponentIds = [];
        const clientOpponentRelations = JSON.parse(localStorage.getItem('clientOpponentRelations') || '{}');
        if (clientOpponentRelations[clientId]) {
            tempOpponentIds = clientOpponentRelations[clientId];
        }
        

        const uniqueOpponentIds = [...new Set([...caseOpponentIds, ...tempOpponentIds])];
        
        const opponents = [];
        for (const opponentId of uniqueOpponentIds) {
            const opponent = await getById('opponents', opponentId);
            if (opponent) opponents.push(opponent);
        }

        modalContent.innerHTML = `
            <div class="client-view space-y-6">
                <!-- بيانات الأطراف -->
                <div class="flex flex-col md:flex-row items-start gap-4 md:gap-6">
                    <!-- بيانات الموكل -->
                    <div class="flex-1 flex flex-col">
                        <div class="p-6 border border-blue-200 rounded-lg bg-blue-50/50 shadow-lg flex-1 flex flex-col">
                            <h3 class="text-lg font-bold text-blue-800 mb-4 flex items-center justify-center gap-2">
                                <i class="ri-user-3-line"></i>
                                <span>بيانات الموكل</span>
                            </h3>
                            <div class="space-y-4 flex-1">
                                <div class="inline-flex w-full items-stretch">
                                    <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-200 rounded-r-lg border-l-0">اسم الموكل</div>
                                    <div class="flex-1 font-bold text-lg text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">${client.name || 'فارغ'}</div>
                                </div>
                                <div class="inline-flex w-full items-stretch">
                                    <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-200 rounded-r-lg border-l-0">صفته</div>
                                    <div class="flex-1 font-medium text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">${client.capacity || 'فارغ'}</div>
                                </div>
                                <div class="inline-flex w-full items-stretch">
                                    <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-200 rounded-r-lg border-l-0">عنوانه</div>
                                    <div class="flex-1 font-medium text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">${client.address || 'فارغ'}</div>
                                </div>
                                <div class="inline-flex w-full items-stretch">
                                    <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-blue-50 border border-blue-200 rounded-r-lg border-l-0">الهاتف</div>
                                    <div class="flex-1 font-medium text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">${client.phone || 'فارغ'}</div>
                                </div>
                                                            </div>
                            
                            <div class="mt-6 text-center">
                                <button id="edit-client-data-btn" class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105" data-client-id="${clientId}">
                                    <i class="ri-edit-line mr-2"></i>تعديل
                                </button>
                            </div>
                        </div>
                    </div>

                    <!-- فاصل "ضد" -->
                    <div class="against-separator flex items-center justify-center self-center">
                        <span class="text-2xl font-black text-gray-500 bg-white px-4 py-2 rounded-full shadow-md border">ضد</span>
                    </div>

                    <!-- بيانات الخصوم -->
                    <div class="flex-1 flex flex-col">
                        <div class="p-6 border border-red-200 rounded-lg bg-red-50/50 shadow-lg flex-1 flex flex-col">
                            <h3 class="text-lg font-bold text-red-800 mb-4 flex items-center justify-center gap-2">
                                <i class="ri-shield-user-line"></i>
                                <span>بيانات الخصوم</span>
                            </h3>
                            ${opponents.length === 0 ? `
                            <div class="space-y-4 flex-1">
                            <div class="inline-flex w-full items-stretch">
                            <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-red-50 border border-red-200 rounded-r-lg border-l-0">اسم الخصم</div>
                            <div class="flex-1 font-bold text-lg text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">فارغ</div>
                            </div>
                            <div class="inline-flex w-full items-stretch">
                            <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-red-50 border border-red-200 rounded-r-lg border-l-0">صفته</div>
                            <div class="flex-1 font-medium text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">فارغ</div>
                            </div>
                            <div class="inline-flex w-full items-stretch">
                            <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-red-50 border border-red-200 rounded-r-lg border-l-0">عنوانه</div>
                            <div class="flex-1 font-medium text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">فارغ</div>
                            </div>
                            <div class="inline-flex w-full items-stretch">
                            <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-red-50 border border-red-200 rounded-r-lg border-l-0">الهاتف</div>
                            <div class="flex-1 font-medium text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">فارغ</div>
                            </div>
                                                        </div>
                            <div class="mt-6 text-center">
                            <button class="px-6 py-3 bg-gray-400 text-white rounded-lg cursor-not-allowed" disabled>
                            <i class="ri-edit-line mr-2"></i>تعديل
                            </button>
                            </div>
                            ` : `
                            
                                <div class="space-y-4 flex-1">
                                    <div class="inline-flex w-full items-stretch">
                                        <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-red-50 border border-red-200 rounded-r-lg border-l-0">اسم الخصم</div>
                                        <div id="opponent-name-value" class="flex-1 font-bold text-lg text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">${opponents[0]?.name || 'فارغ'}</div>
                                    </div>
                                    <div class="inline-flex w-full items-stretch">
                                        <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-red-50 border border-red-200 rounded-r-lg border-l-0">صفته</div>
                                        <div id="opponent-capacity-value" class="flex-1 font-medium text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">${opponents[0]?.capacity || 'فارغ'}</div>
                                    </div>
                                    <div class="inline-flex w-full items-stretch">
                                        <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-red-50 border border-red-200 rounded-r-lg border-l-0">عنوانه</div>
                                        <div id="opponent-address-value" class="flex-1 font-medium text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">${opponents[0]?.address || 'فارغ'}</div>
                                    </div>
                                    <div class="inline-flex w-full items-stretch">
                                        <div class="w-24 md:w-28 shrink-0 px-3 py-3 text-sm font-medium text-gray-700 bg-red-50 border border-red-200 rounded-r-lg border-l-0">الهاتف</div>
                                        <div id="opponent-phone-value" class="flex-1 font-medium text-gray-800 bg-white p-3 border rounded-l-lg border-r-0">${opponents[0]?.phone || 'فارغ'}</div>
                                    </div>
                                                                    </div>
                                <div class="mt-6 text-center">
                                    <button class="edit-opponent-btn px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105" data-opponent-id="${opponents[0]?.id}">
                                        <i class="ri-edit-line mr-2"></i>تعديل
                                    </button>
                                </div>
                                ${opponents.length > 1 ? `
                                    <div class="mt-4 flex items-center justify-center gap-4">
                                        <button id="prev-opponent-btn" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
                                            <i class="ri-arrow-right-line"></i>
                                        </button>
                                        <span class="text-sm text-gray-600 bg-white px-3 py-1 rounded-full border">
                                            <span id="current-opponent-index">1</span> من ${opponents.length}
                                        </span>
                                        <button id="next-opponent-btn" class="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all shadow-md">
                                            <i class="ri-arrow-left-line"></i>
                                        </button>
                                    </div>
                                ` : ''}
                            `}
                        </div>
                    </div>
                </div>

                <!-- قضايا الموكل -->
                <div class="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div class="flex items-center justify-between mb-4">
                        <h3 class="text-xl font-bold text-green-800 flex items-center gap-2">
                            <i class="ri-briefcase-line"></i>القضايا
                        </h3>
                        <button id="add-case-for-client-btn" class="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-all font-bold flex items-center gap-2" data-client-id="${clientId}">
                            <i class="ri-add-line"></i>إضافة قضية
                        </button>
                    </div>
                    
                    <div id="client-cases-list" class="space-y-3 mb-6">
                        ${cases.length === 0 ? 
                            '<div class="text-center text-gray-500 py-8"><i class="ri-briefcase-line text-2xl mb-2"></i><p>لا توجد قضايا مسجلة لهذا الموكل</p></div>' 
                            : ''
                        }
                    </div>

                </div>


            </div>
        `;


        currentOpponentIndex = 0;
        

        await loadClientCasesList(cases);
        

        attachClientViewListeners(clientId, opponents);
        
    } catch (error) {

        showToast('حدث خطأ في تحميل بيانات الموكل', 'error');
    }
}


async function loadClientCasesList(cases) {
    const casesList = document.getElementById('client-cases-list');
    
    if (cases.length === 0) return;
    
    let html = '';
    for (const caseRecord of cases) {
        const opponent = await getById('opponents', caseRecord.opponentId);
        const sessions = await getFromIndex('sessions', 'caseId', caseRecord.id);
        
        html += `
            <div class="case-card bg-white border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300" data-case-id="${caseRecord.id}">
                <!-- رأس الكارت -->
                <div class="p-4 cursor-pointer case-header" data-case-id="${caseRecord.id}">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h4 class="font-bold text-lg text-green-700">
                                    قضية رقم: ${caseRecord.caseNumber || 'غير محدد'} لسنة ${caseRecord.caseYear || 'غير محدد'}
                                </h4>
                                <i class="ri-arrow-down-s-line text-gray-400 transition-transform case-arrow" data-case-id="${caseRecord.id}"></i>
                            </div>
                            ${caseRecord.subject ? `<p class="text-sm text-gray-700 mb-2"><span class="font-medium">الموضوع:</span> ${caseRecord.subject}</p>` : '<p class="text-sm text-gray-500 mb-2">لا يوجد موضوع محدد</p>'}
                            <div class="flex items-center gap-4 text-sm text-gray-600">
                                <span class="flex items-center gap-1">
                                    <i class="ri-shield-user-line text-red-500"></i>
                                    ضد: ${opponent ? opponent.name : 'غير محدد'}
                                </span>
                            </div>
                        </div>
                        <div class="flex flex-col gap-2 ml-4">
                            <button class="edit-case-btn bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded text-sm transition-colors" data-case-id="${caseRecord.id}" onclick="event.stopPropagation()">
                                <i class="ri-edit-line mr-1"></i>تعديل
                            </button>
                            <button class="delete-case-btn bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded text-sm transition-colors" data-case-id="${caseRecord.id}" onclick="event.stopPropagation()">
                                <i class="ri-delete-bin-line mr-1"></i>حذف
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- تفاصيل القضية المخفية -->
                <div class="case-details hidden border-t border-gray-200 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50" data-case-id="${caseRecord.id}">
                    <div class="p-6">
                        <!-- عنوان التفاصيل -->
                        <div class="flex items-center gap-2 mb-4">
                            <div class="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                                <i class="ri-information-line text-white text-xs"></i>
                            </div>
                            <h3 class="text-lg font-bold text-blue-800">تفاصيل القضية الكاملة</h3>
                        </div>
                        
                        <!-- الصف الأول: الأرقام -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                            <div class="bg-white rounded-lg p-4 shadow-md border border-blue-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-blue-700 block mb-2">رقم القضية</span>
                                <p class="text-sm font-bold text-gray-800">${caseRecord.caseNumber || 'فارغ'} / ${caseRecord.caseYear || 'فارغ'}</p>
                            </div>
                            
                            <div class="bg-white rounded-lg p-4 shadow-md border border-red-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-red-700 block mb-2">رقم الاستئناف</span>
                                <p class="text-sm font-medium text-gray-800">${caseRecord.appealNumber || 'فارغ'} / ${caseRecord.appealYear || 'فارغ'}</p>
                            </div>
                            
                            <div class="bg-white rounded-lg p-4 shadow-md border border-teal-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-teal-700 block mb-2">رقم النقض</span>
                                <p class="text-sm font-medium text-gray-800">${caseRecord.cassationNumber || 'فارغ'} / ${caseRecord.cassationYear || 'فارغ'}</p>
                            </div>
                            
                            <div class="bg-white rounded-lg p-4 shadow-md border border-indigo-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-indigo-700 block mb-2">رقم التوكيل</span>
                                <p class="text-sm font-medium text-gray-800">${caseRecord.poaNumber || 'فارغ'}</p>
                            </div>
                        </div>
                        
                        <!-- الصف الثاني: البيانات الوصفية -->
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                            <div class="bg-white rounded-lg p-4 shadow-md border border-orange-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-orange-700 block mb-2">نوع الدعوى</span>
                                <p class="text-sm font-medium text-gray-800">${caseRecord.caseType || 'فارغ'}</p>
                            </div>
                            
                            <div class="bg-white rounded-lg p-4 shadow-md border border-cyan-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-cyan-700 block mb-2">موضوع الدعوى</span>
                                <p class="text-sm font-medium text-gray-800">${caseRecord.subject || 'فارغ'}</p>
                            </div>
                            
                            <div class="bg-white rounded-lg p-4 shadow-md border border-green-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-green-700 block mb-2">المحكمة</span>
                                <p class="text-sm font-medium text-gray-800">${caseRecord.court || 'فارغ'}</p>
                            </div>
                            
                            <div class="bg-white rounded-lg p-4 shadow-md border border-pink-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-pink-700 block mb-2">رقم الدائرة</span>
                                <p class="text-sm font-medium text-gray-800">${caseRecord.circuitNumber || 'فارغ'}</p>
                            </div>
                            
                            <div class="bg-white rounded-lg p-4 shadow-md border border-purple-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-purple-700 block mb-2">حالة القضية</span>
                                <p class="text-sm font-medium text-gray-800">${caseRecord.caseStatus || 'فارغ'}</p>
                            </div>
                            
                            <div class="bg-white rounded-lg p-4 shadow-md border border-sky-100 hover:shadow-lg transition-shadow text-center">
                                <span class="text-sm font-bold text-sky-700 block mb-2">رقم الملف</span>
                                <p class="text-sm font-medium text-gray-800">${caseRecord.fileNumber || 'فارغ'}</p>
                            </div>
                            <div class="bg-white rounded-lg p-4 shadow-md border border-yellow-100 hover:shadow-lg transition-shadow text-center md:col-span-2 lg:col-span-2">
                                <span class="text-sm font-bold text-yellow-700 block mb-2">ملاحظات</span>
                                <p class="text-sm text-gray-800 leading-relaxed">${caseRecord.notes || 'فارغ'}</p>
                            </div>
                        </div>
                        
                        <!-- عرض الجلسات تلقائياً -->
                        <div class="pt-4 border-t border-blue-200">
                            <div class="flex items-center justify-between mb-4">
                                <div class="flex items-center gap-2">
                                    <div class="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                                        <i class="ri-calendar-event-line text-white text-xs"></i>
                                    </div>
                                    <h4 class="text-lg font-bold text-purple-800">جلسات القضية</h4>
                                </div>
                                <button class="add-session-for-case-btn px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all font-bold shadow-md hover:shadow-lg transform hover:scale-105 flex items-center gap-2" data-case-id="${caseRecord.id}">
                                    <i class="ri-add-line"></i>
                                    <span>إضافة جلسة</span>
                                </button>
                            </div>
                            <div id="case-sessions-${caseRecord.id}" class="space-y-4">
                                <!-- الجلسات ستظهر هنا تلقائياً -->
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    casesList.innerHTML = html;
    

    attachCaseCardListeners();
    

    if (cases.length === 1) {
        setTimeout(async () => {
            const firstCaseId = cases[0].id;
            const firstCaseDetails = document.querySelector(`.case-details[data-case-id="${firstCaseId}"]`);
            const firstArrow = document.querySelector(`.case-arrow[data-case-id="${firstCaseId}"]`);
            
            if (firstCaseDetails && firstArrow) {

                expandModalForCaseDetails();
                

                firstCaseDetails.classList.remove('hidden');
                firstArrow.style.transform = 'rotate(180deg)';
                

                stateManager.currentCaseId = parseInt(firstCaseId);
                

                await loadCaseSessions(firstCaseId);
            }
        }, 100);
    }
}


function attachCaseCardListeners() {

    document.querySelectorAll('.case-header').forEach(header => {
        header.addEventListener('click', async (e) => {
            const caseId = header.dataset.caseId;
            const caseDetails = document.querySelector(`.case-details[data-case-id="${caseId}"]`);
            const arrow = document.querySelector(`.case-arrow[data-case-id="${caseId}"]`);
            
            if (caseDetails.classList.contains('hidden')) {

                document.querySelectorAll('.case-details').forEach(detail => {
                    detail.classList.add('hidden');
                });
                document.querySelectorAll('.case-arrow').forEach(arr => {
                    arr.style.transform = 'rotate(0deg)';
                });
                

                // hideOtherCases(caseId); // إبقاء باقي القضايا مرئية لكن مطوية
                

                expandModalForCaseDetails();
                

                caseDetails.classList.remove('hidden');
                arrow.style.transform = 'rotate(180deg)';
                
                var firstCaseId = caseId;
                

                stateManager.currentCaseId = parseInt(firstCaseId);
                

                stateManager.currentCaseId = parseInt(caseId);
                
                await loadCaseSessions(caseId);
            } else {
                // إغلاق الكارت الحالي فقط وترك الباقي مطوي
                caseDetails.classList.add('hidden');
                arrow.style.transform = 'rotate(0deg)';
                
                // لا نظهر كل القضايا بشكل قسري — تظل مرئية مطوية
                // showAllCases();
                
                // إرجاع النافذة لحجمها الطبيعي إذا لم يعد هناك أي كارت مفتوح
                const anyOpen = Array.from(document.querySelectorAll('.case-details')).some(el => !el.classList.contains('hidden'));
                if (!anyOpen) {
                    resetModalSize();
                }
            }
        });
    });

}

// توسيع النافذة لعرض بيانات القضية
function expandModalForCaseDetails() {
    // دعم الوضعي��: مضمّن داخل البحث أو مودال
    const modalContainer = document.getElementById('modal-container') || document.getElementById('modal-container-hidden');
    const modalContent = document.getElementById('modal-content');
    if (modalContainer && modalContent) {
        // إزالة قيود الارتفاع والتمرير
        modalContainer.style.maxHeight = 'none';
        modalContainer.style.height = 'auto';
        modalContent.style.maxHeight = 'none';
        modalContent.style.overflowY = 'visible';
        
        // توسيع النافذة لتأخذ المساحة المطلوبة
        modalContainer.classList.add('min-h-fit');
    }
}

// إرجاع النافذة لحجمها الطبيعي
function resetModalSize() {
    const modalContainer = document.getElementById('modal-container') || document.getElementById('modal-container-hidden');
    const modalContent = document.getElementById('modal-content');
    if (modalContainer && modalContent) {
        // إرجاع القيود الأصلية
        modalContainer.style.maxHeight = '';
        modalContainer.style.height = '';
        modalContent.style.maxHeight = '';
        modalContent.style.overflowY = '';
        
        modalContainer.classList.remove('min-h-fit');
    }
}

// إخفاء القضايا الأخرى عند فتح قضية معينة
function hideOtherCases(activeCaseId) {
    document.querySelectorAll('.case-card').forEach(card => {
        const cardCaseId = card.dataset.caseId;
        if (cardCaseId !== activeCaseId) {
            card.style.display = 'none';
        }
    });
}

// إظهار كل القضايا مرة أخرى
function showAllCases() {
    document.querySelectorAll('.case-card').forEach(card => {
        card.style.display = 'block';
    });
}

// متغير فهرس الخصم الحالي
let currentOpponentIndex = 0;

// دالة تحديث عرض الخصم الحالي
function updateOpponentDisplay(opponents) {
    if (opponents.length === 0) return;
    
    const currentOpponent = opponents[currentOpponentIndex];
    
    const nameEl = document.getElementById('opponent-name-value');
    const capacityEl = document.getElementById('opponent-capacity-value');
    const addressEl = document.getElementById('opponent-address-value');
    const phoneEl = document.getElementById('opponent-phone-value');
        
    if (nameEl) nameEl.textContent = currentOpponent.name || 'فارغ';
    if (capacityEl) capacityEl.textContent = currentOpponent.capacity || 'فارغ';
    if (addressEl) addressEl.textContent = currentOpponent.address || 'فارغ';
    if (phoneEl) phoneEl.textContent = currentOpponent.phone || 'فارغ';
        
    const editBtn = document.querySelector('.edit-opponent-btn');
    if (editBtn) {
        editBtn.setAttribute('data-opponent-id', currentOpponent.id);
    }
    const indexSpan = document.getElementById('current-opponent-index');
    if (indexSpan) {
        indexSpan.textContent = currentOpponentIndex + 1;
    }
}
 
// إضافة مستمعي الأحداث للموكل
function attachClientViewListeners(clientId, opponents) {
    // زر تعديل بيانات الموكل
    const editClientBtn = document.getElementById('edit-client-data-btn');
    if (editClientBtn) {
        editClientBtn.addEventListener('click', () => {
            navigateTo(displayEditClientFormInline, clientId);
        });
    }

    // زر إضافة قضية للموكل
    const addCaseBtn = document.getElementById('add-case-for-client-btn');
    if (addCaseBtn) {
        addCaseBtn.addEventListener('click', () => {
            stateManager.setSelectedClientId(clientId);
            try {
                sessionStorage.setItem('returnToPage', 'search');
                sessionStorage.setItem('returnToClientId', String(clientId));
            } catch (_) {}
            window.location.href = 'new.html';
        });
    }

    // أزرار تعديل الخصوم
    document.querySelectorAll('.edit-opponent-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const opponentId = parseInt(btn.dataset.opponentId);
            navigateTo(displayEditOpponentFormInline, opponentId);
        });
    });

    // أزرار تعديل القضايا
    document.querySelectorAll('.edit-case-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const caseId = parseInt(btn.dataset.caseId);
            navigateTo(displayCaseEditForm, caseId);
        });
    });

    // أزرار حذف القضايا
    document.querySelectorAll('.delete-case-btn').forEach(btn => {
        btn.addEventListener('click', async () => {
            const caseId = parseInt(btn.dataset.caseId);
            if (confirm('هل أنت متأكد من حذف هذه القضية؟ سيتم حذف جميع الجلسات المرتبطة بها أيضاً.')) {
                try {
                    // حذف الجلسات المرتبطة بالقضية
                    const sessions = await getFromIndex('sessions', 'caseId', caseId);
                    for (const session of sessions) {
                        await deleteRecord('sessions', session.id);
                    }
                    
                    // حذف القضية
                    await deleteRecord('cases', caseId);
                    
                    showToast('تم حذف القضية بنجاح', 'success');
                    
                    // إعادة تحميل بيانات الموكل
                    displayClientViewForm(clientId);
                } catch (error) {
                    showToast('حدث خطأ في حذف القضية', 'error');
                }
            }
        });
    });

    // أزرار إضافة جلسة للقضية
    document.querySelectorAll('.add-session-for-case-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            const caseId = parseInt(btn.dataset.caseId);
            
            try {
                const caseRecord = await getById('cases', caseId);
                if (!caseRecord) {
                    showToast('لم يتم العثور على بيانات القضية', 'error');
                    return;
                }
                
                if (!caseRecord.caseNumber || !caseRecord.caseYear) {
                    showToast('يجب إدخال رقم الدعوى والسنة أولاً قبل إضافة الج��سات', 'error');
                    return;
                }
                
                stateManager.currentCaseId = caseId;
                navigateTo(displaySessionForm);
            } catch (error) {
                showToast('حدث خطأ في التحقق من بيانات القضية', 'error');
            }
        });
    });

    // أزرار التنقل بين الخصوم
    if (opponents.length > 1) {
        const prevBtn = document.getElementById('prev-opponent-btn');
        const nextBtn = document.getElementById('next-opponent-btn');
        
        if (prevBtn && nextBtn) {
            prevBtn.addEventListener('click', () => {
                currentOpponentIndex = currentOpponentIndex > 0 ? currentOpponentIndex - 1 : opponents.length - 1;
                updateOpponentDisplay(opponents);
            });
            
            nextBtn.addEventListener('click', () => {
                currentOpponentIndex = currentOpponentIndex < opponents.length - 1 ? currentOpponentIndex + 1 : 0;
                updateOpponentDisplay(opponents);
            });
        }
    }
}