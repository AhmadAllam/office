async function displaySessionList() {
    const embedded = document.getElementById('embedded-content');
    const container = embedded || document.getElementById('modal-content');
    const isEmbedded = !!embedded;

    if (!container) return;

    // عنوان النافذة
    if (!isEmbedded) {
        document.getElementById('modal-title').textContent = 'قائمة الجلسات';
        container.classList.remove('search-modal-content');
    }
    const pageHeaderTitle = document.getElementById('page-title');
    if (pageHeaderTitle) pageHeaderTitle.textContent = 'قائمة الجلسات';
    if (window.location.pathname.includes('search.html')) {
        const mt = document.getElementById('modal-title');
        if (mt) mt.textContent = '';
        if (pageHeaderTitle) pageHeaderTitle.textContent = 'جلسات الدعوى الجديده';
    }
    if (typeof setHeaderAsBack === 'function') setHeaderAsBack();

    const sessions = await getFromIndex('sessions', 'caseId', stateManager.currentCaseId);
    let sessionListHtml = '<div class="space-y-2">';
    if (sessions.length > 0) {
        sessions.sort((a,b) => (a.sessionDate > b.sessionDate) ? 1 : -1)
        sessions.forEach(s => {
            sessionListHtml += `
                <div class="p-3 bg-gray-100 rounded-lg flex justify-between items-center">
                    <div>
                        <p class="font-bold">تاريخ: ${s.sessionDate || 'غير محدد'}</p>
                        <p class="text-sm text-gray-600">${s.decision || 'لا يوجد قرار'}</p>
                    </div>
                    <div class="flex gap-2">
                        <button data-session-id="${s.id}" class="edit-session-btn text-blue-500 hover:text-blue-700"><i class="ri-pencil-line"></i></button>
                        <button data-session-id="${s.id}" class="delete-session-btn text-red-500 hover:text-red-700"><i class="ri-delete-bin-line"></i></button>
                    </div>
                </div>
            `;
        });
    } else {
        sessionListHtml += '<p class="text-center text-gray-500 p-4">لا توجد جلسات مضافة لهذه القضية.</p>';
    }
    sessionListHtml += '</div>';

    container.innerHTML = `
        <div id="session-list-container">${sessionListHtml}</div>
        <div class="flex justify-center mt-6">
             <button id="add-new-session-btn" class="w-full md:w-auto px-12 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 text-lg font-bold shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2">
                <i class="ri-add-line"></i><span>إضافة جلسة جديدة</span>
             </button>
        </div>
    `;
    
    attachSessionListEventListeners();
    

    if (sessions.length === 1) {
        setTimeout(async () => {
            const sessionId = sessions[0].id;
            const sessionData = await getById('sessions', sessionId);
            navigateTo(displaySessionForm, sessionId, sessionData);
        }, 100);
    }
}

async function handleDeleteSession(sessionId) {
    if (confirm('هل أنت متأكد من حذف هذه الجلسة؟')) {
        try {
            await deleteRecord('sessions', sessionId);
            showToast('تم حذف الجلسة بنجاح.');
            await updateCountersInHeader();
            

            document.dispatchEvent(new CustomEvent('sessionSaved'));
            
            replaceCurrentView(displaySessionList);
        } catch (error) {
            showToast('حدث خطأ أثناء الحذف.');

        }
    }
}

function attachSessionListEventListeners() {
    document.getElementById('add-new-session-btn')?.addEventListener('click', () => navigateTo(displaySessionForm, null, null));

    document.querySelectorAll('.edit-session-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const sessionId = parseInt(e.currentTarget.dataset.sessionId, 10);
            const sessionData = await getById('sessions', sessionId);
            navigateTo(displaySessionForm, sessionId, sessionData);
        });
    });

    document.querySelectorAll('.delete-session-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const sessionId = parseInt(e.currentTarget.dataset.sessionId, 10);
            handleDeleteSession(sessionId);
        });
    });
}

async function refreshSessionsSidebar(selectedId){
    try{
        if (!stateManager.currentCaseId) return;
        const listEl = document.getElementById('sessions-sidebar-list');
        if (!listEl) return;
        let sessions = [];
        try { sessions = await getFromIndex('sessions','caseId', stateManager.currentCaseId); } catch(e){ sessions = []; }
        const sorted = [...sessions].sort((a,b)=>{ if(!a.sessionDate) return 1; if(!b.sessionDate) return -1; return new Date(a.sessionDate)-new Date(b.sessionDate); });
        const html = sorted.map(s => `
            <div class="flex items-center gap-2">
                <button class="session-item-btn flex-1 text-right px-3 py-2 rounded ${selectedId===s.id?'bg-blue-200':'bg-blue-50 hover:bg-blue-100'} border border-blue-200 flex justify-between items-center" data-session-id="${s.id}">
                    <span class="font-semibold">${s.sessionDate || 'غير محدد'}</span>
                    <i class="ri-arrow-left-s-line"></i>
                </button>
                <button class="delete-session-inline px-2 py-2 text-red-600 hover:text-red-700" data-session-id="${s.id}">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `).join('');
        listEl.innerHTML = html || '<div class="text-gray-500 text-sm">لا توجد جلسات</div>';
        const h3 = listEl.parentElement ? listEl.parentElement.querySelector('h3') : null;
        if (h3) h3.textContent = `الجلسات (${sorted.length})`;
    }catch(e){}
}

async function displaySessionForm(sessionId = null, sessionData = null) {
    const currentSessionData = sessionData || {};
    
    const embedded = document.getElementById('embedded-content');
    const container = embedded || document.getElementById('modal-content');
    const isEmbedded = !!embedded;

    if (!container) return;

    if (!isEmbedded) {
        const modalTitle = document.getElementById('modal-title');
        if (modalTitle) modalTitle.textContent = '';
        container.classList.remove('search-modal-content');
    }
    const pageHeaderTitle2 = document.getElementById('page-title');
    if (pageHeaderTitle2) {
        if (window.location.pathname.includes('new.html') && !sessionId) {
            pageHeaderTitle2.textContent = 'ادخل بيانات الجلسة الجديده';
        } else {
            pageHeaderTitle2.textContent = 'تعديل الجلسة';
        }
    }
    if (typeof setHeaderAsBack === 'function') setHeaderAsBack();
    if (!stateManager.currentCaseId && currentSessionData && currentSessionData.caseId) { stateManager.currentCaseId = currentSessionData.caseId; }
    const isNewFlow = window.location.pathname.includes('new.html') && !!stateManager.currentCaseId;
    const enableSidebar = (window.location.pathname.includes('new.html') || window.location.pathname.includes('search.html')) && !!stateManager.currentCaseId;
    window.STAY_ON_SAVE = !!isNewFlow;
    if (enableSidebar && window.location.pathname.includes('search.html')) {
        const modalTitle2 = document.getElementById('modal-title');
        if (modalTitle2) modalTitle2.textContent = '';
        const pageHeader = document.getElementById('page-title');
        if (pageHeader) pageHeader.textContent = 'جلسات الدعوى الجديده';
    }
    let __sessionsForCase = [];
    let __sortedSessions = [];
    let __currentIndex = -1;
    if (enableSidebar) {
        try { __sessionsForCase = await getFromIndex('sessions','caseId', stateManager.currentCaseId); } catch(e) { __sessionsForCase = []; }
        __sortedSessions = [...__sessionsForCase].sort((a,b)=>{ if(!a.sessionDate) return 1; if(!b.sessionDate) return -1; return new Date(a.sessionDate)-new Date(b.sessionDate); });
        if (sessionId) { __currentIndex = __sortedSessions.findIndex(s=>s.id===sessionId); }
    }

    const __formHTML = `
        <div class="bg-white rounded-2xl p-3 sm:p-6 shadow-2xl">
            <form id="session-form" class="space-y-4 sm:space-y-6" novalidate>
                 <div class="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 p-3 sm:p-6 bg-blue-50 backdrop-blur-sm rounded-xl shadow-md">
                    <!-- تاريخ الجلسة -->
                    <div class="flex flex-col sm:flex-row sm:items-stretch relative">
                        <label for="session-date" class="px-3 py-2 sm:py-3 border-2 border-gray-400 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-full sm:w-32 lg:w-36 text-right rounded-t-lg sm:rounded-r-lg sm:rounded-t-lg">
                            <i class="ri-calendar-line text-blue-600 ml-2"></i>تاريخ الجلسة
                        </label>
                        <div class="flex-1 relative">
                            <input type="text" id="session-date" name="sessionDate" value="${currentSessionData.sessionDate || ''}" placeholder="YYYY-MM-DD" required class="w-full px-3 py-2 sm:py-3 bg-white border-2 border-gray-400 border-t-0 sm:border-t-2 sm:border-r-0 rounded-b-lg sm:rounded-l-lg sm:rounded-b-lg placeholder-gray-400 focus:ring-0 focus:border-blue-600 text-right font-semibold text-gray-800 pr-10">
                            <button type="button" id="open-date-picker" class="absolute inset-y-0 left-2 flex items-center text-blue-600">
                                <i class="ri-calendar-event-line"></i>
                            </button>
                            <div id="custom-date-picker" class="absolute left-0 top-12 bg-white border border-gray-300 rounded-lg shadow-xl p-3 w-80 hidden z-50"></div>
                        </div>
                    </div>
                    
                    <!-- الرول -->
                    <div class="flex flex-col sm:flex-row sm:items-stretch">
                        <label for="session-roll" class="px-3 py-2 sm:py-3 border-2 border-gray-400 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-full sm:w-32 lg:w-36 text-right rounded-t-lg sm:rounded-r-lg sm:rounded-t-lg">
                            <i class="ri-list-check text-green-600 ml-2"></i>الرول
                        </label>
                        <input type="text" id="session-roll" name="roll" value="${currentSessionData.roll || ''}" class="flex-1 px-3 py-2 sm:py-3 bg-white border-2 border-gray-400 border-t-0 sm:border-t-2 sm:border-r-0 rounded-b-lg sm:rounded-l-lg sm:rounded-b-lg placeholder-gray-400 focus:ring-0 focus:border-blue-600 text-right font-semibold text-gray-800">
                    </div>
                    
                    <!-- رقم الحصر -->
                    <div class="flex flex-col sm:flex-row sm:items-stretch">
                        <label for="inventory-number" class="px-3 py-2 sm:py-3 border-2 border-gray-400 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-full sm:w-32 lg:w-36 text-right rounded-t-lg sm:rounded-r-lg sm:rounded-t-lg">
                            <i class="ri-hashtag text-purple-600 ml-2"></i>رقم الحصر
                        </label>
                        <input type="text" id="inventory-number" name="inventoryNumber" value="${currentSessionData.inventoryNumber || ''}" class="flex-1 px-3 py-2 sm:py-3 bg-white border-2 border-gray-400 border-t-0 sm:border-t-2 sm:border-r-0 rounded-b-lg sm:rounded-l-lg sm:rounded-b-lg placeholder-gray-400 focus:ring-0 focus:border-blue-600 text-right font-semibold text-gray-800">
                    </div>
                    
                    <!-- سنة الحصر -->
                    <div class="flex flex-col sm:flex-row sm:items-stretch">
                        <label for="inventory-year" class="px-3 py-2 sm:py-3 border-2 border-gray-400 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-full sm:w-32 lg:w-36 text-right rounded-t-lg sm:rounded-r-lg sm:rounded-t-lg">
                            <i class="ri-calendar-2-line text-orange-600 ml-2"></i>سنة الحصر
                        </label>
                        <input type="text" id="inventory-year" name="inventoryYear" value="${currentSessionData.inventoryYear || ''}" class="flex-1 px-3 py-2 sm:py-3 bg-white border-2 border-gray-400 border-t-0 sm:border-t-2 sm:border-r-0 rounded-b-lg sm:rounded-l-lg sm:rounded-b-lg placeholder-gray-400 focus:ring-0 focus:border-blue-600 text-right font-semibold text-gray-800">
                    </div>
                </div>
                
                <!-- قسم القرار والطلبات -->
                <div class="p-3 sm:p-6 bg-blue-50 backdrop-blur-sm rounded-xl shadow-md">
                    <div class="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6">
                        <!-- القرار -->
                        <div class="flex flex-col sm:flex-row sm:items-stretch">
                            <label for="session-decision" class="px-3 py-2 sm:py-3 border-2 border-gray-400 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-full sm:w-32 lg:w-36 text-right rounded-t-lg sm:rounded-r-lg sm:rounded-t-lg">
                                <i class="ri-file-text-line text-indigo-600 ml-2"></i>القرار
                            </label>
                            <textarea id="session-decision" name="decision" rows="4" placeholder="اكتب قرار الجلسة..." class="flex-1 px-3 py-2 sm:py-3 bg-white border-2 border-gray-400 border-t-0 sm:border-t-2 sm:border-r-0 rounded-b-lg sm:rounded-l-lg sm:rounded-b-lg placeholder-gray-400 focus:ring-0 focus:border-blue-600 text-right transition-colors resize-none font-semibold text-gray-800">${currentSessionData.decision || ''}</textarea>
                        </div>
                        
                        <!-- الطلبات -->
                        <div class="flex flex-col sm:flex-row sm:items-stretch">
                            <label for="session-requests" class="px-3 py-2 sm:py-3 border-2 border-gray-400 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-full sm:w-32 lg:w-36 text-right rounded-t-lg sm:rounded-r-lg sm:rounded-t-lg">
                                <i class="ri-question-answer-line text-indigo-600 ml-2"></i>الطلبات
                            </label>
                            <textarea id="session-requests" name="requests" rows="4" class="flex-1 px-3 py-2 sm:py-3 bg-white border-2 border-gray-400 border-t-0 sm:border-t-2 sm:border-r-0 rounded-b-lg sm:rounded-l-lg sm:rounded-b-lg placeholder-gray-400 focus:ring-0 focus:border-blue-600 text-right transition-colors resize-none font-semibold text-gray-800">${currentSessionData.requests || ''}</textarea>
                        </div>
                    </div>
                </div>
                
                <!-- زر الحفظ -->
                <div class="flex justify-center pt-2 sm:pt-4">
                    <button type="submit" class="w-full sm:w-auto px-8 sm:px-12 py-3 sm:py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-base sm:text-lg font-bold flex items-center justify-center gap-2 sm:gap-3">
                        <i class="ri-save-3-line text-lg sm:text-xl"></i><span>حفظ الجلسة</span>
                    </button>
                </div>
            </form>
        </div>
    `;

    if (enableSidebar) {
        const total = __sortedSessions.length;
        const prevDisabled = (__currentIndex <= 0) ? 'opacity-50 cursor-not-allowed' : '';
        const nextDisabled = (__currentIndex === -1 || __currentIndex >= total-1) ? 'opacity-50 cursor-not-allowed' : '';
        const listItems = __sortedSessions.map(s => `
            <div class="flex items-center gap-2">
                <button class="session-item-btn flex-1 text-right px-3 py-2 rounded ${sessionId===s.id?'bg-blue-200':'bg-blue-50 hover:bg-blue-100'} border border-blue-200 flex justify-between items-center" data-session-id="${s.id}">
                    <span class="font-semibold">${s.sessionDate || 'غير محدد'}</span>
                    <i class="ri-arrow-left-s-line"></i>
                </button>
                <button class="delete-session-inline px-2 py-2 text-red-600 hover:text-red-700" data-session-id="${s.id}">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `).join('');
        container.innerHTML = `
            <div class="grid grid-cols-1 md:grid-cols-5 gap-3">
                <div class="order-2 md:order-1 md:col-span-1">
                    <div class="bg-white rounded-xl border border-blue-200 p-3">
                        <div class="flex items-center justify-between mb-2">
                            <h3 class="font-bold text-blue-700">الجلسات (${total})</h3>
                            <button id="add-new-session-inline" class="px-2 py-1 bg-blue-600 text-white rounded text-sm"><i class="ri-add-line"></i> جديدة</button>
                        </div>
                        <div id="sessions-sidebar-list" class="space-y-2 max-h-[50vh] md:max-h-[65vh] overflow-auto">${listItems || '<div class="text-gray-500 text-sm">لا توجد جلسات</div>'}</div>
                        <div class="flex justify-center items-center gap-2 mt-2">
                            <button id="prev-session-btn" class="px-2 py-1 border rounded ${prevDisabled}"><i class="ri-arrow-right-line"></i></button>
                            <button id="next-session-btn" class="px-2 py-1 border rounded ${nextDisabled}"><i class="ri-arrow-left-line"></i></button>
                        </div>
                    </div>
                </div>
                <div class="order-1 md:order-2 md:col-span-4">
                    ${__formHTML}
                </div>
            </div>
        `;
    } else {
        container.innerHTML = __formHTML;
    }
    if (enableSidebar) {
        const listEl = document.getElementById('sessions-sidebar-list');
        listEl?.addEventListener('click', async (evt) => {
            const delBtn = evt.target.closest('.delete-session-inline');
            const itemBtn = evt.target.closest('.session-item-btn');
            if (delBtn) {
                evt.stopPropagation();
                const sid = parseInt(delBtn.dataset.sessionId || delBtn.getAttribute('data-session-id'), 10);
                const ok = confirm('هل أنت متأكد من حذف هذه الجلسة؟');
                if (!ok) return;
                const isCurrent = !!sessionId && sid === sessionId;
                try {
                    const row = delBtn.parentElement;
                    const neighbor = row?.nextElementSibling || row?.previousElementSibling;
                    row?.remove();
                    const h3 = listEl.parentElement?.querySelector('h3');
                    if (h3) h3.textContent = `الجلسات (${listEl.querySelectorAll('.delete-session-inline').length})`;
                    await deleteRecord('sessions', sid);
                    await updateCountersInHeader();
                    document.dispatchEvent(new CustomEvent('sessionSaved'));
                    const nextId = neighbor ? parseInt(neighbor.querySelector('.session-item-btn')?.dataset.sessionId || '0', 10) : 0;
                    await refreshSessionsSidebar(nextId || (sessionId || null));
                    if (isCurrent) {
                        if (nextId) {
                            const data = await getById('sessions', nextId);
                            replaceCurrentView(displaySessionForm, nextId, data);
                        } else {
                            replaceCurrentView(displaySessionForm, null, null);
                        }
                    }
                    showToast('تم حذف الجلسة بنجاح.');
                } catch (err) {
                    showToast('حدث خطأ أثناء الحذف.');
                }
                return;
            }
            if (itemBtn) {
                const sid = parseInt(itemBtn.dataset.sessionId, 10);
                const s = await getById('sessions', sid);
                navigateTo(displaySessionForm, sid, s);
                return;
            }
        });
        document.getElementById('add-new-session-inline')?.addEventListener('click', () => {
            navigateTo(displaySessionForm, null, null);
        });
        document.getElementById('prev-session-btn')?.addEventListener('click', async () => {
            if (__currentIndex > 0) {
                const s = __sortedSessions[__currentIndex - 1];
                const data = await getById('sessions', s.id);
                navigateTo(displaySessionForm, s.id, data);
            }
        });
        document.getElementById('next-session-btn')?.addEventListener('click', async () => {
            if (__currentIndex !== -1 && __currentIndex < __sortedSessions.length - 1) {
                const s = __sortedSessions[__currentIndex + 1];
                const data = await getById('sessions', s.id);
                navigateTo(displaySessionForm, s.id, data);
            }
        });
    }

    const dateInput = document.getElementById('session-date');
    const dpBtn = document.getElementById('open-date-picker');
    const dp = document.getElementById('custom-date-picker');
    function pad(n){return n.toString().padStart(2,'0');}
    function toYMD(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
    function parseYMD(s){const ok = s && /^\d{4}-\d{2}-\d{2}$/.test(s); if(!ok) return null; const [y,mo,da]=s.split('-').map(Number); const d=new Date(y,mo-1,da); if(d.getFullYear()!==y||d.getMonth()!==mo-1||d.getDate()!==da) return null; return d;}
    function normalizeDMYString(s){
        if(!s) return null;
        const m = s.trim().match(/^(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})$/);
        if(!m) return null;
        let d = parseInt(m[1],10), mo = parseInt(m[2],10), y = parseInt(m[3],10);
        if(m[3].length===2){ y = y < 50 ? 2000 + y : 1900 + y; }
        const dt = new Date(y, mo-1, d);
        if(dt.getFullYear()!==y || dt.getMonth()!==mo-1 || dt.getDate()!==d) return null;
        return toYMD(dt);
    }
    let viewDate = parseYMD(dateInput?.value) || new Date();
    function buildDPHTML(d){
        const months=['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
        const y=d.getFullYear();
        const m=d.getMonth();
        const first=new Date(y,m,1);
        let start=first.getDay();
        const daysInMonth=new Date(y,m+1,0).getDate();
        const dayNames=['سبت','أحد','اثنين','ثلاثاء','أربعاء','خميس','جمعة'];
        const cells=[];
        for(let i=0;i<start;i++) cells.push('');
        for(let day=1; day<=daysInMonth; day++) cells.push(day);
        while(cells.length%7!==0) cells.push('');
        let grid='';
        for(const c of cells){
            if(c==='') grid+=`<button type="button" class="w-10 h-10 text-center text-gray-300 cursor-default" disabled>-</button>`;
            else {
                const isSel = dateInput && dateInput.value && dateInput.value===toYMD(new Date(y,m,c));
                grid+=`<button type="button" data-day="${c}" class="w-10 h-10 rounded ${isSel?'bg-blue-600 text-white':'hover:bg-blue-100 text-gray-800'}">${c}</button>`;
            }
        }
        return `
            <div class="flex items-center justify-between mb-2">
                <button type="button" id="dp-next" class="w-8 h-8 border rounded text-sm leading-none flex items-center justify-center">›</button>
                <div class="flex items-center gap-2">
                    <select id="dp-month" class="border rounded px-2 py-1 text-sm">
                        ${months.map((nm,idx)=>`<option value="${idx}" ${idx===m?'selected':''}>${nm}</option>`).join('')}
                    </select>
                    <input id="dp-year" type="number" class="border rounded px-2 py-1 w-20 text-sm" value="${y}">
                </div>
                <button type="button" id="dp-prev" class="w-8 h-8 border rounded text-sm leading-none flex items-center justify-center">‹</button>
            </div>
            <div class="grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-1">
                ${dayNames.map(n=>`<div>${n}</div>`).join('')}
            </div>
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
        const prev=document.getElementById('dp-prev');
        const next=document.getElementById('dp-next');
        const mSel=document.getElementById('dp-month');
        const yInp=document.getElementById('dp-year');
        if (dp) dp.addEventListener('click', (e)=> e.stopPropagation());
        if(prev) prev.addEventListener('click',(e)=>{ e.stopPropagation(); viewDate=new Date(viewDate.getFullYear(), viewDate.getMonth()-1, 1); renderDP(); });
        if(next) next.addEventListener('click',(e)=>{ e.stopPropagation(); viewDate=new Date(viewDate.getFullYear(), viewDate.getMonth()+1, 1); renderDP(); });
        if(mSel) {
            mSel.addEventListener('click',(e)=> e.stopPropagation());
            mSel.addEventListener('change',(e)=>{ e.stopPropagation(); viewDate=new Date(viewDate.getFullYear(), parseInt(mSel.value), 1); renderDP(); });
        }
        if(yInp) {
            yInp.addEventListener('click',(e)=> e.stopPropagation());
            yInp.addEventListener('input',(e)=>{ e.stopPropagation(); const yy=parseInt(yInp.value)||viewDate.getFullYear(); viewDate=new Date(yy, viewDate.getMonth(), 1); });
            yInp.addEventListener('change',(e)=>{ e.stopPropagation(); renderDP(); });
        }
        dp.querySelectorAll('button[data-day]').forEach(b=>{
            b.addEventListener('click',(e)=>{ e.stopPropagation(); const day=parseInt(b.getAttribute('data-day')); const d=new Date(viewDate.getFullYear(), viewDate.getMonth(), day); if(dateInput) dateInput.value=toYMD(d); dp.classList.add('hidden'); });
        });
        const t=document.getElementById('dp-today');
        const yst=document.getElementById('dp-yesterday');
        const tm=document.getElementById('dp-tomorrow');
        const cl=document.getElementById('dp-close');
        if(t) t.addEventListener('click',(e)=>{ e.stopPropagation(); const d=new Date(); if(dateInput) dateInput.value=toYMD(d); dp.classList.add('hidden'); });
        if(yst) yst.addEventListener('click',(e)=>{ e.stopPropagation(); const d=new Date(); d.setDate(d.getDate()-1); if(dateInput) dateInput.value=toYMD(d); dp.classList.add('hidden'); });
        if(tm) tm.addEventListener('click',(e)=>{ e.stopPropagation(); const d=new Date(); d.setDate(d.getDate()+1); if(dateInput) dateInput.value=toYMD(d); dp.classList.add('hidden'); });
        if(cl) cl.addEventListener('click',(e)=>{ e.stopPropagation(); dp.classList.add('hidden'); });
    }
    function renderDP(){ if(dp) { dp.innerHTML=buildDPHTML(viewDate); attachDPHandlers(); } }
    function openDP(){
        renderDP();
        if (dp) {
            dp.classList.remove('hidden');
            // رفع الظهور فوق أي عناصر
            dp.style.zIndex = '9999';
            // تموضع مناسب للموبايل
            if (window.innerWidth <= 768) {
                try {
                    const rect = dpBtn.getBoundingClientRect();
                    dp.style.position = 'fixed';
                    dp.style.left = Math.max(8, rect.left) + 'px';
                    dp.style.top = (rect.bottom + 8) + 'px';
                    dp.style.width = Math.min(window.innerWidth - 16, 320) + 'px';
                    dp.style.maxWidth = 'calc(100vw - 16px)';
                } catch (e) {
                    // fallback للوضع الافتراضي
                    dp.style.position = 'absolute';
                }
            } else {
                // ديسكتوب: نفس الوضعية القديمة
                dp.style.position = 'absolute';
                dp.style.left = '0px';
                dp.style.top = '3rem';
                dp.style.width = '20rem';
            }
        }
    }
    function outsideClose(e){ if(dp && !dp.contains(e.target) && e.target!==dpBtn && !e.target.closest('#open-date-picker')) dp.classList.add('hidden'); }
    if(dpBtn && dp){
        const openHandler = (e)=>{ e.stopPropagation(); if (e.preventDefault) e.preventDefault(); if (dateInput && typeof dateInput.blur === 'function') dateInput.blur(); openDP(); };
        // دعم كل من click و touchstart لفتح الملتقط على الموبايل
        dpBtn.addEventListener('click', openHandler);
        dpBtn.addEventListener('touchstart', openHandler, { passive: false });
        // منع إغلاق الملتقط عند اللمس داخله
        if (dp) dp.addEventListener('touchstart', (e)=> e.stopPropagation(), { passive: true });
        // إغلاق عند النقر/اللمس خارج الملتقط
        document.addEventListener('click', outsideClose);
        document.addEventListener('touchstart', outsideClose);
    }

    const tryNormalizeManual = ()=>{ if(dateInput){ const n = normalizeDMYString(dateInput.value); if(n) dateInput.value = n; } };
    if(dateInput){ dateInput.addEventListener('blur', tryNormalizeManual); dateInput.addEventListener('change', tryNormalizeManual); }

    document.getElementById('session-form').addEventListener('submit', (e) => handleSaveSession(e, sessionId));

    if (window.__sessionFormSavedHandler) {
        document.removeEventListener('sessionSaved', window.__sessionFormSavedHandler);
    }
    window.__sessionFormSavedHandler = async () => {
        try {
            if (stateManager.currentCaseId) {
                await refreshSessionsSidebar(sessionId || null);
            }
            if (sessionId) {
                const still = await getById('sessions', sessionId);
                if (still) {
                    const data = await getById('sessions', sessionId);
                    replaceCurrentView(displaySessionForm, sessionId, data);
                    return;
                }
            }
            let list = [];
            try { list = await getFromIndex('sessions', 'caseId', stateManager.currentCaseId); } catch(e){ list = []; }
            list = list.sort((a,b)=>{ if(!a.sessionDate) return 1; if(!b.sessionDate) return -1; return new Date(a.sessionDate)-new Date(b.sessionDate); });
            if (list.length > 0) {
                const target = list[0];
                const data = await getById('sessions', target.id);
                replaceCurrentView(displaySessionForm, target.id, data);
            } else {
                replaceCurrentView(displaySessionForm, null, null);
            }
        } catch(e) {}
    };
    document.addEventListener('sessionSaved', window.__sessionFormSavedHandler);

    // عند العرض المدمج: لا نستخدم المودال، ونحافظ على سلوك العودة الافتراضي
    if (isEmbedded) {
        const modal = document.getElementById('modal');
        if (modal && !modal.classList.contains('hidden')) {
            modal.classList.add('hidden');
        }
    }
}

async function handleSaveSession(e, sessionId) {
    e.preventDefault();
    const form = e.target;
    const formData = new FormData(form);
    const newSessionData = Object.fromEntries(formData.entries());
    {
        const s = newSessionData.sessionDate ? newSessionData.sessionDate.trim() : '';
        const m = s.match(/^(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})$/);
        if(m){
            const _pad = n=>n.toString().padStart(2,'0');
            let d = parseInt(m[1],10), mo = parseInt(m[2],10), y = parseInt(m[3],10);
            if(m[3].length===2){ y = y < 50 ? 2000 + y : 1900 + y; }
            const dt = new Date(y, mo-1, d);
            if(dt.getFullYear()===y && dt.getMonth()===mo-1 && dt.getDate()===d){
                newSessionData.sessionDate = `${y}-${_pad(mo)}-${_pad(d)}`;
            }
        }
    }

    const sessionDate = newSessionData.sessionDate?.trim() || '';
    const roll = newSessionData.roll?.trim() || '';
    const inventoryNumber = newSessionData.inventoryNumber?.trim() || '';
    const inventoryYear = newSessionData.inventoryYear?.trim() || '';
    const decision = newSessionData.decision?.trim() || '';
    const requests = newSessionData.requests?.trim() || '';
    
    const hasAnyData = sessionDate !== '' || roll !== '' || inventoryNumber !== '' || inventoryYear !== '' || decision !== '' || requests !== '';
    
    if (!hasAnyData) {
        showToast('يجب إدخال بيانات في أي حقل على الأقل قبل الحفظ', 'error');
        return;
    }

    try {
        if (sessionId) {
            const existingSession = await getById('sessions', sessionId);
            const updatedSession = { ...existingSession, ...newSessionData };
            await updateRecord('sessions', sessionId, updatedSession);
            showToast('تم تعديل الجلسة بنجاح.');
        } else {
            if (!stateManager.currentCaseId) {
                showToast("خطأ: لا يمكن إضافة جلسة بدون قضية.");
                return;
            }
            newSessionData.caseId = stateManager.currentCaseId;
            const newId = await addSession(newSessionData);
            newSessionData.id = newId;
            showToast('تم حفظ الجلسة بنجاح.');
        }
        await updateCountersInHeader();
        
        document.dispatchEvent(new CustomEvent('sessionSaved'));
        
        if (window.location.pathname.includes('session-edit.html')) {
            return;
        }
        
        if (window.STAY_ON_SAVE && window.location.pathname.includes('new.html')) {
            await refreshSessionsSidebar(sessionId ? sessionId : newSessionData.id);
            try {
                let after = [];
                try { after = await getFromIndex('sessions', 'caseId', stateManager.currentCaseId); } catch (err) { after = []; }
                const sortedAfter = [...after].sort((a,b)=>{ if(!a.sessionDate) return 1; if(!b.sessionDate) return -1; return new Date(a.sessionDate)-new Date(b.sessionDate); });
                const selectedId = sessionId ? sessionId : newSessionData.id;
                const listEl = document.getElementById('sessions-sidebar-list');
                if (listEl) {
                    const html = sortedAfter.map(s => `
                        <div class="flex items-center gap-2">
                            <button class="session-item-btn flex-1 text-right px-3 py-2 rounded ${selectedId===s.id?'bg-blue-200':'bg-blue-50 hover:bg-blue-100'} border border-blue-200 flex justify-between items-center" data-session-id="${s.id}">
                                <span class="font-semibold">${s.sessionDate || 'غير محدد'}</span>
                                <i class="ri-arrow-left-s-line"></i>
                            </button>
                            <button class="delete-session-inline px-2 py-2 text-red-600 hover:text-red-700" data-session-id="${s.id}">
                                <i class="ri-delete-bin-line"></i>
                            </button>
                        </div>
                    `).join('');
                    listEl.innerHTML = html || '<div class="text-gray-500 text-sm">لا توجد جلسات</div>';
                    const header = listEl.parentElement ? listEl.parentElement.querySelector('h3') : null;
                    if (header) header.textContent = `الجلسات (${sortedAfter.length})`;
                    listEl.querySelectorAll('.session-item-btn').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            const sid = parseInt(e.currentTarget.dataset.sessionId, 10);
                            const s = await getById('sessions', sid);
                            navigateTo(displaySessionForm, sid, s);
                        });
                    });
                    listEl.querySelectorAll('.delete-session-inline').forEach(btn => {
                        btn.addEventListener('click', async (e) => {
                            e.stopPropagation();
                            const sid = parseInt(e.currentTarget.dataset.sessionId, 10);
                            const ok = confirm('هل أنت متأكد من حذف هذه الجلسة؟');
                            if (!ok) return;
                            try {
                                const isCurrent = !!selectedId && sid === selectedId;
                                await deleteRecord('sessions', sid);
                                showToast('تم حذف الجلسة بنجاح.');
                                await updateCountersInHeader();
                                document.dispatchEvent(new CustomEvent('sessionSaved'));
                                let after2 = [];
                                try { after2 = await getFromIndex('sessions', 'caseId', stateManager.currentCaseId); } catch (err) { after2 = []; }
                                const sorted2 = [...after2].sort((a,b)=>{ if(!a.sessionDate) return 1; if(!b.sessionDate) return -1; return new Date(a.sessionDate)-new Date(b.sessionDate); });
                                const pickId = (isCurrent ? null : selectedId) || (sorted2[0]?.id || null);
                                if (pickId) {
                                    const data = await getById('sessions', pickId);
                                    replaceCurrentView(displaySessionForm, pickId, data);
                                } else {
                                    replaceCurrentView(displaySessionForm, null, null);
                                }
                            } catch (err) {
                                showToast('حدث خطأ أثناء الحذف.');
                            }
                        });
                    });
                }
            } catch (e) {}
            if (sessionId) {
                const s = await getById('sessions', sessionId);
                replaceCurrentView(displaySessionForm, sessionId, s);
            } else {
                if (newSessionData.id) {
                    const s = await getById('sessions', newSessionData.id);
                    replaceCurrentView(displaySessionForm, newSessionData.id, s);
                } else {
                    replaceCurrentView(displaySessionForm, null, null);
                }
            }
            return;
        }

        const modalTitle = document.getElementById('modal-title')?.textContent || '';
        

        if (window.location.pathname.includes('new.html') && stateManager.currentCaseId) {

            if (typeof displayCaseDetailsForm === 'function') {
                displayCaseDetailsForm();
            } else {
                navigateBack();
            }
        } else if (modalTitle.includes('بيانات الأطراف') && stateManager.currentCaseId) {
            navigateBack();

            setTimeout(async () => {
                if (window.loadCaseSessions && window.attachAddSessionButtonListener) {
                    await window.loadCaseSessions(stateManager.currentCaseId.toString());
                    window.attachAddSessionButtonListener();
                }
            }, 100);
        } else {
            navigateBack();
        }
    } catch (error) {
        showToast('حدث خطأ أثناء حفظ الجلسة.');

    }
}
