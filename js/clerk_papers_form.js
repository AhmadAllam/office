// عرض نموذج إضافة/تعديل ورقة محضر
function displayClerkPaperForm(paperId = null) {
    document.body.classList.add('form-active');
    navigateTo(async () => {
        const paperData = paperId ? await getById('clerkPapers', paperId) : {};
        
        document.getElementById('modal-title').textContent = paperId ? 'تعديل ورقة محضر' : 'إضافة ورقة محضر جديدة';
        const modalContent = document.getElementById('modal-content');
        const modalContainer = document.getElementById('modal-container');
        
        // توسيع النافذة لملء الشاشة مثل نافذة العمل الإداري
        modalContainer.classList.remove('max-w-5xl', 'max-w-7xl', 'mx-4');
        modalContainer.classList.add('w-full');
        modalContent.classList.remove('search-modal-content');
        
        // جلب قائمة الموكلين
        const clients = await getAllClients();
        
        modalContent.innerHTML = `
            <div class="w-full h-full p-2">
                <div class="w-full mx-auto">
                    <form id="clerk-paper-form" class="space-y-3">
                        <!-- السطر الأول: الموكل ونوع الورقة -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <!-- الموكل -->
                            <div>
                                <div class="flex items-stretch">
                                    <label for="client-name" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">الموكل</label>
                                    <div class="flex-1 relative -mr-px">
                                        <input type="text" id="client-name" autocomplete="off" class="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400" value="${paperData.clientId ? ((clients.find(c=>c.id===paperData.clientId)||{}).name||'') : ''}" placeholder="اكتب أو اختر الموكل" required>
                                        <button type="button" id="client-name-toggle" class="absolute inset-y-0 left-0 flex items-center px-2 text-gray-500 hover:text-gray-700"><i class="ri-arrow-down-s-line"></i></button>
                                        <div id="client-name-dropdown" class="autocomplete-results hidden"></div>
                                        <input type="hidden" id="client-select" name="clientId" value="${paperData.clientId || ''}">
                                    </div>
                                </div>
                            </div>
                            
                            <!-- نوع الورقة -->
                            <div>
                                <div class="flex items-stretch">
                                    <label for="paper-type-name" class="px-3 py-2 border-2 border-blue-300 bg-blue-50 text-sm font-bold text-blue-800 shrink-0 w-28 md:w-32 text-right rounded-r-lg">نوع الورقة</label>
                                    <div class="flex-1 relative -mr-px">
                                        <input type="text" id="paper-type-name" autocomplete="off" class="w-full px-4 py-3 text-base bg-white border-2 border-blue-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400" value="${paperData.paperType || ''}" placeholder="اكتب أو اختر نوع الورقة" required>
                                        <button type="button" id="paper-type-toggle" class="absolute inset-y-0 left-0 flex items-center px-2 text-gray-500 hover:text-gray-700"><i class="ri-arrow-down-s-line"></i></button>
                                        <div id="paper-type-dropdown" class="autocomplete-results hidden"></div>
                                        <input type="hidden" id="paper-type" name="paperType" value="${paperData.paperType || ''}">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- السطر الثاني: رقم الورقة وقلم المحضرين -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <!-- رقم الورقة -->
                            <div>
                                <div class="flex items-stretch">
                                    <label for="paper-number" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">رقم الورقة</label>
                                    <input type="text" id="paper-number" name="paperNumber" value="${paperData.paperNumber || ''}" required class="flex-1 px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 -mr-px">
                                </div>
                            </div>
                            
                            <!-- قلم المحضرين -->
                            <div>
                                <div class="flex items-stretch">
                                    <label for="clerk-office-name" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">قلم المحضرين</label>
                                    <div class="flex-1 relative -mr-px">
                                        <input type="text" id="clerk-office-name" autocomplete="off" class="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 placeholder:text-sm placeholder:font-normal placeholder:text-gray-400" value="${paperData.clerkOffice || ''}" placeholder="اكتب أو اختر قلم المحضرين">
                                        <button type="button" id="clerk-office-toggle" class="absolute inset-y-0 left-0 flex items-center px-2 text-gray-500 hover:text-gray-700"><i class="ri-arrow-down-s-line"></i></button>
                                        <div id="clerk-office-dropdown" class="autocomplete-results hidden"></div>
                                        <input type="hidden" id="clerk-office" name="clerkOffice" value="${paperData.clerkOffice || ''}">
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- السطر الثالث: تاريخ التسليم وتاريخ الاستلام -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <!-- تاريخ التسليم -->
                            <div>
                                <div class="flex items-stretch relative">
                                    <label for="delivery-date" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">تاريخ التسليم</label>
                                    <div class="flex-1 -mr-px relative">
                                        <input type="text" id="delivery-date" name="deliveryDate" value="${paperData.deliveryDate || ''}" placeholder="YYYY-MM-DD" class="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right pr-10 -mr-px">
                                        <button type="button" id="open-date-picker-delivery" class="absolute inset-y-0 left-2 flex items-center text-blue-600">
                                            <i class="ri-calendar-event-line"></i>
                                        </button>
                                        <div id="custom-date-picker-delivery" class="absolute left-0 top-12 bg-white border border-gray-300 rounded-lg shadow-xl p-3 w-80 hidden z-50"></div>
                                    </div>
                                </div>
                            </div>
                            
                            <!-- تاريخ الاستلام -->
                            <div>
                                <div class="flex items-stretch relative">
                                    <label for="receipt-date" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">تاريخ الاستلام</label>
                                    <div class="flex-1 -mr-px relative">
                                        <input type="text" id="receipt-date" name="receiptDate" value="${paperData.receiptDate || ''}" placeholder="YYYY-MM-DD" class="w-full px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right pr-10 -mr-px">
                                        <button type="button" id="open-date-picker-receipt" class="absolute inset-y-0 left-2 flex items-center text-blue-600">
                                            <i class="ri-calendar-event-line"></i>
                                        </button>
                                        <div id="custom-date-picker-receipt" class="absolute left-0 top-12 bg-white border border-gray-300 rounded-lg shadow-xl p-3 w-80 hidden z-50"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <!-- السطر الرابع: الملاحظات -->
                        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <!-- الملاحظات -->
                            <div>
                                <div class="flex items-stretch">
                                    <label for="notes" class="px-3 py-2 border-2 border-gray-300 bg-gray-100 text-sm font-bold text-gray-700 shrink-0 w-28 md:w-32 text-right rounded-r-lg">ملاحظات</label>
                                    <input type="text" id="notes" name="notes" value="${paperData.notes || ''}" class="flex-1 px-4 py-3 text-base bg-white border-2 border-gray-300 rounded-l-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 -mr-px" placeholder="أي ملاحظات إضافية...">
                                </div>
                            </div>
                        </div>
                        
                        <!-- أزرار الحفظ والإلغاء -->
                        <div class="mt-auto pt-4">
                            <div class="sticky bottom-0 left-0 right-0 z-10 bg-gray-50 border-t border-gray-200 py-3">
                                <div class="flex justify-center">
                                    <div class="bg-white border border-gray-300 rounded-md px-3 py-2 shadow-sm flex items-center gap-2">
                                        <button type="submit" class="w-auto px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-md font-semibold shadow-sm flex items-center justify-center gap-1">
                                            <i class="ri-save-line text-base"></i>
                                            ${paperId ? 'تحديث الورقة' : 'حفظ الورقة'}
                                        </button>
                                        <button type="button" id="cancel-paper-btn" class="w-auto px-4 py-2 text-sm bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-md font-semibold shadow-sm flex items-center justify-center gap-1">
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
        
        setTimeout(() => {
            const backBtn = document.getElementById('back-to-main');
            const pageTitle = document.getElementById('page-title');
            if (backBtn && pageTitle) {
                backBtn.innerHTML = `
                    <i class="ri-arrow-right-line text-white text-lg"></i>
                    <span class="text-white">رجوع</span>
                `;
                pageTitle.textContent = paperId ? 'تعديل ورقة محضر' : 'إضافة ورقة محضر جديدة';
                
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
            function setupDP(fieldIds, color){
                const input = document.getElementById(fieldIds.input);
                const btn = document.getElementById(fieldIds.btn);
                const dp = document.getElementById(fieldIds.dp);
                function pad(n){return n.toString().padStart(2,'0');}
                function toYMD(d){return d.getFullYear()+"-"+pad(d.getMonth()+1)+"-"+pad(d.getDate());}
                function parseYMD(s){const ok = s && /^\d{4}-\d{2}-\d{2}$/.test(s); if(!ok) return null; const [y,mo,da]=s.split('-').map(Number); const d=new Date(y,mo-1,da); if(d.getFullYear()!==y||d.getMonth()!==mo-1||d.getDate()!==da) return null; return d;}
                function normalizeDMYString(s){ if(!s) return null; const m=s.trim().match(/^(\d{1,2})\D+(\d{1,2})\D+(\d{2,4})$/); if(!m) return null; let d=parseInt(m[1],10), mo=parseInt(m[2],10), y=parseInt(m[3],10); if(m[3].length===2){ y = y < 50 ? 2000 + y : 1900 + y; } const dt=new Date(y,mo-1,d); if(dt.getFullYear()!==y||dt.getMonth()!==mo-1||dt.getDate()!==d) return null; return toYMD(dt); }
                let viewDate = parseYMD(input?.value) || new Date();
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
                    for(const c of cells){ if(c==='') grid+=`<button type=\"button\" class=\"w-10 h-10 text-center text-gray-300 cursor-default\" disabled>-</button>`; else { const isSel = input && input.value && input.value===toYMD(new Date(y,m,c)); grid+=`<button type=\"button\" data-day=\"${c}\" class=\"w-10 h-10 rounded ${color==='blue'?'hover:bg-blue-100':'hover:bg-blue-100'} ${color==='blue'?'':' '} ${isSel?(color==='blue'?'bg-blue-600':'bg-blue-600')+' text-white':''}\">${c}</button>`; } } 
                    return `
                        <div class=\"flex items-center justify-between mb-2\">
                            <button type=\"button\" id=\"dp-next\" class=\"w-8 h-8 border rounded text-sm leading-none flex items-center justify-center\">›</button>
                            <div class=\"flex items-center gap-2\">
                                <select id=\"dp-month\" class=\"border rounded px-2 py-1 text-sm\">${months.map((nm,idx)=>`<option value=\"${idx}\" ${idx===m?'selected':''}>${nm}</option>`).join('')}</select>
                                <input id=\"dp-year\" type=\"number\" class=\"border rounded px-2 py-1 w-20 text-sm\" value=\"${y}\">
                            </div>
                            <button type=\"button\" id=\"dp-prev\" class=\"w-8 h-8 border rounded text-sm leading-none flex items-center justify-center\">‹</button>
                        </div>
                        <div class=\"grid grid-cols-7 gap-1 text-center text-xs text-gray-600 mb-1\">${dayNames.map(n=>`<div>${n}</div>`).join('')}</div>
                        <div class=\"grid grid-cols-7 gap-1 mb-2\">${grid}</div>
                        <div class=\"flex items-center justify-between gap-2\">
                            <div class=\"flex gap-2\">
                                <button type=\"button\" id=\"dp-today\" class=\"px-2 py-1 border rounded text-sm\">اليوم</button>
                                <button type=\"button\" id=\"dp-yesterday\" class=\"px-2 py-1 border rounded text-sm\">البارحة</button>
                                <button type=\"button\" id=\"dp-tomorrow\" class=\"px-2 py-1 border rounded text-sm\">غداً</button>
                            </div>
                            <button type=\"button\" id=\"dp-close\" class=\"px-2 py-1 border rounded text-sm\">إغلاق</button>
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
                    dp.querySelectorAll('button[data-day]').forEach(b=>{ b.addEventListener('click',(e)=>{ e.stopPropagation(); const day=parseInt(b.getAttribute('data-day')); const d=new Date(viewDate.getFullYear(), viewDate.getMonth(), day); if(input) input.value=toYMD(d); dp.classList.add('hidden'); }); });
                    const t=dp.querySelector('#dp-today');
                    const yst=dp.querySelector('#dp-yesterday');
                    const tm=dp.querySelector('#dp-tomorrow');
                    const cl=dp.querySelector('#dp-close');
                    if(t) t.addEventListener('click',(e)=>{ e.stopPropagation(); const d=new Date(); if(input) input.value=toYMD(d); dp.classList.add('hidden'); });
                    if(yst) yst.addEventListener('click',(e)=>{ e.stopPropagation(); const d=new Date(); d.setDate(d.getDate()-1); if(input) input.value=toYMD(d); dp.classList.add('hidden'); });
                    if(tm) tm.addEventListener('click',(e)=>{ e.stopPropagation(); const d=new Date(); d.setDate(d.getDate()+1); if(input) input.value=toYMD(d); dp.classList.add('hidden'); });
                    if(cl) cl.addEventListener('click',(e)=>{ e.stopPropagation(); dp.classList.add('hidden'); });
                }
                function renderDP(){ if(dp) { dp.innerHTML=buildDPHTML(viewDate); attachDPHandlers(); } }
                function openDP(){ renderDP(); if(dp) dp.classList.remove('hidden'); }
                function outsideClose(e){ if(dp && !dp.contains(e.target) && e.target!==btn && !e.target.closest('#'+btn.id)) dp.classList.add('hidden'); }
                if(btn && dp){ btn.addEventListener('click',(e)=>{ e.stopPropagation(); openDP(); }); document.addEventListener('click', outsideClose); }
                const tryNormalizeManual = ()=>{ if(input){ const n = normalizeDMYString(input.value); if(n) input.value = n; } };
                if(input){ input.addEventListener('blur', tryNormalizeManual); input.addEventListener('change', tryNormalizeManual); }
                const formEl = document.getElementById('clerk-paper-form');
                if(formEl){ formEl.addEventListener('submit', ()=> tryNormalizeManual(), true); }
            }
            setupDP({input:'delivery-date', btn:'open-date-picker-delivery', dp:'custom-date-picker-delivery'}, 'blue');
            setupDP({input:'receipt-date', btn:'open-date-picker-receipt', dp:'custom-date-picker-receipt'}, 'blue');
        })();

        // ربط الأحداث
        attachClerkPaperFormListeners(paperId);
    });
}
