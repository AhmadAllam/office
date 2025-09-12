async function displayCaseEditForm(caseId) {
    try {
        const caseRecord = await getById('cases', caseId);
        if (!caseRecord) {
            showToast('لم يتم العثور على بيانات القضية', 'error');
            return;
        }

        const pageHeaderTitle = document.getElementById('page-title');
        if (pageHeaderTitle) pageHeaderTitle.textContent = 'تعديل الدعوى';
        const modalTitleElCase = document.getElementById('modal-title');
        if (modalTitleElCase) modalTitleElCase.textContent = '';
        const modalContent = document.getElementById('modal-content');
        modalContent.classList.remove('search-modal-content');

        const fields = [
            { name: 'court', label: 'المحكمة' },
            { name: 'circuitNumber', label: 'رقم الدائرة' },
            { name: 'caseType', label: 'نوع الدعوى' },
            { name: 'subject', label: 'موضوع الدعوى' },
            { name: 'caseNumber', label: 'رقم الدعوى' },
            { name: 'caseYear', label: 'سنة الدعوى' },
            { name: 'appealNumber', label: 'رقم الاستئناف' },
            { name: 'appealYear', label: 'سنة الاستئناف' },
            { name: 'cassationNumber', label: 'رقم النقض' },
            { name: 'cassationYear', label: 'سنة النقض' },
            { name: 'fileNumber', label: 'رقم الملف' },
            { name: 'poaNumber', label: 'رقم التوكيل' },
            { name: 'notes', label: 'ملاحظات' }
        ];

        const caseStatusOptions = `
            <option value="">اختر حالة القضية</option>
            <option value="جاري النظر" ${caseRecord.caseStatus === 'جاري النظر' ? 'selected' : ''}>جاري النظر</option>
            <option value="محكوم فيها" ${caseRecord.caseStatus === 'محكوم فيها' ? 'selected' : ''}>محكوم فيها</option>
            <option value="مؤجلة" ${caseRecord.caseStatus === 'مؤجلة' ? 'selected' : ''}>مؤجلة</option>
            <option value="منتهية" ${caseRecord.caseStatus === 'منتهية' ? 'selected' : ''}>منتهية</option>
            <option value="مستأنفة" ${caseRecord.caseStatus === 'مستأنفة' ? 'selected' : ''}>مستأنفة</option>
        `;

        const buildFieldsHTML = (isDesktop) => {
            let html = '';
            // Desktop has a 2-column grid, so we build fields differently
            if (isDesktop) {
                html += `<div><label class="block text-sm font-semibold text-gray-700 text-right">المحكمة</label><input type="text" name="court" value="${caseRecord.court || ''}" class="mt-1 block w-full p-3 bg-white border-2 border-blue-300 rounded-lg shadow-sm"></div>`;
                html += `<div><label class="block text-sm font-semibold text-gray-700 text-right">حالة القضية</label><select name="caseStatus" class="mt-1 block w-full p-3 bg-white border-2 border-blue-300 rounded-lg shadow-sm">${caseStatusOptions}</select></div>`;
                fields.filter(f => f.name !== 'court').forEach(field => {
                    html += `<div><label class="block text-sm font-semibold text-gray-700 text-right">${field.label}</label><input type="text" name="${field.name}" value="${caseRecord[field.name] || ''}" class="mt-1 block w-full p-3 bg-white border-2 border-blue-300 rounded-lg shadow-sm"></div>`;
                });
            } else {
                // Mobile has a single-column layout
                html += `<div><label class="block text-sm font-bold text-gray-700 text-right mb-1">المحكمة</label><input type="text" name="court" value="${caseRecord.court || ''}" class="w-full px-3 py-3 bg-white border-2 border-gray-400 rounded-lg"></div>`;
                html += `<div><label class="block text-sm font-bold text-gray-700 text-right mb-1">حالة القضية</label><select name="caseStatus" class="w-full px-3 py-3 bg-white border-2 border-gray-400 rounded-lg">${caseStatusOptions}</select></div>`;
                fields.filter(f => f.name !== 'court').forEach(field => {
                    html += `<div><label class="block text-sm font-bold text-gray-700 text-right mb-1">${field.label}</label><input type="text" name="${field.name}" value="${caseRecord[field.name] || ''}" class="w-full px-3 py-3 bg-white border-2 border-gray-400 rounded-lg"></div>`;
                });
            }
            return html;
        };

        const desktopFieldsHTML = buildFieldsHTML(true);
        const mobileFieldsHTML = buildFieldsHTML(false);

        const desktopHTML = `
            <div class="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-xl p-6 shadow-lg border border-blue-300">
                <form id="edit-case-form-desktop" novalidate>
                    <input type="hidden" name="id" value="${caseId}">
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5 p-6 bg-white/90 backdrop-blur-sm rounded-xl border border-blue-200 shadow-md">
                        ${desktopFieldsHTML}
                        <div class="col-span-2 flex justify-center pt-6">
                            <button type="submit" class="save-case-btn px-10 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl shadow-lg font-bold flex items-center justify-center gap-3 border-2 border-green-400">
                                <i class="ri-save-3-line text-xl"></i>
                                <span>حفظ التعديلات</span>
                            </button>
                        </div>
                    </div>
                </form>
                <div class="flex justify-center mt-6">
                    <button type="button" class="cancel-edit-case-btn px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-xl shadow-lg font-bold border-2 border-gray-400">
                        <i class="ri-close-line mr-2 text-lg"></i>إلغاء
                    </button>
                </div>
            </div>
        `;

        const mobileHTML = `
            <div class="bg-white rounded-xl p-4 shadow-lg border-2 border-blue-300 max-w-4xl mx-auto">
                <form id="edit-case-form-mobile" class="space-y-4" novalidate>
                    <input type="hidden" name="id" value="${caseId}">
                    <div class="p-4 bg-blue-50 rounded-xl border-2 border-blue-300 shadow-md">
                        <div class="space-y-4">${mobileFieldsHTML}</div>
                        <div class="flex flex-row flex-wrap items-center justify-center gap-4 pt-4">
                            <button type="submit" class="save-case-btn flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-base font-semibold">
                                <i class="ri-save-3-line"></i>
                                <span>حفظ التعديلات</span>
                            </button>
                            <button type="button" class="cancel-edit-case-btn flex items-center gap-2 px-8 py-3 bg-gray-500 hover:bg-gray-600 text-white rounded-lg text-base font-semibold">
                                <i class="ri-close-line"></i>
                                <span>إلغاء</span>
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        `;

        modalContent.innerHTML = `
            <style>
              .mobile-view { display: block; } 
              .desktop-view { display: none; } 
              @media (min-width: 768px) { 
                .mobile-view { display: none; } 
                .desktop-view { display: block; } 
              }
            </style>
            <div class="mobile-view">${mobileHTML}</div>
            <div class="desktop-view">${desktopHTML}</div>
        `;

        attachCaseEditListeners(caseId);
        
    } catch (error) {
        showToast('حدث خطأ في تحميل نافذة التعديل', 'error');
    }
}

function attachCaseEditListeners(caseId) {
    const modalContent = document.getElementById('modal-content');
    if (!modalContent) return;

    const saveButtons = modalContent.querySelectorAll('.save-case-btn');
    const cancelButtons = modalContent.querySelectorAll('.cancel-edit-case-btn');

    const saveHandler = async (e) => {
        e.preventDefault();
        const form = e.target.closest('form');
        if (!form) return;

        const formData = new FormData(form);
        const caseData = Object.fromEntries(formData.entries());

        if (!caseData.court || !caseData.court.trim()) {
            showToast('يجب إدخال اسم المحكمة', 'error');
            return;
        }

        try {
            const originalRecord = await getById('cases', caseId);
            const updatedRecord = { ...originalRecord, ...caseData };

            await updateRecord('cases', caseId, updatedRecord);
            showToast('تم حفظ التعديلات بنجاح', 'success');
            navigateBack();
        } catch (error) {
            showToast('حدث خطأ في حفظ التعديلات', 'error');
        }
    };

    const cancelHandler = () => {
        navigateBack();
    };

    saveButtons.forEach(btn => btn.addEventListener('click', saveHandler));
    cancelButtons.forEach(btn => btn.addEventListener('click', cancelHandler));
}

// The other functions for editing clients and opponents remain unchanged.
// I am omitting them for brevity but they should be kept in the file.
