async function displayEditClientFormInline(clientId) {
    try {
        const client = await getById('clients', clientId);
        if (!client) {
            showToast('لم يتم العثور على بيانات الموكل', 'error');
            return;
        }

        const pageHeaderTitle = document.getElementById('page-title');
        if (pageHeaderTitle) pageHeaderTitle.textContent = 'تعديل البيانات';
        const modalTitleEl = document.getElementById('modal-title');
        if (modalTitleEl) modalTitleEl.textContent = '';
        const modalContent = document.getElementById('modal-content');
        modalContent.classList.remove('search-modal-content');
        

        stateManager.currentClientId = clientId;
        
        modalContent.innerHTML = `
            <div class="bg-gradient-to-br from-blue-100 to-indigo-200 rounded-2xl p-6 shadow-2xl border border-blue-300">
                <form id="edit-client-form" class="space-y-6">
                    <!-- الحقول في شبكة -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-blue-200 shadow-md">
                        <div>
                            <div class="inline-flex w-full items-stretch">
                                <label for="client-name" class="w-24 md:w-28 shrink-0 pr-3 py-3 text-sm font-semibold text-gray-700 bg-blue-50 border-2 border-blue-300 rounded-r-lg border-l-0 flex items-center justify-start text-right">
                                    اسم الموكل
                                </label>
                                <input type="text" id="client-name" name="name" value="${client.name || ''}" required 
                                       class="flex-1 p-3 bg-white border-2 border-blue-300 rounded-l-lg border-r-0 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right transition-colors font-semibold text-gray-800">
                            </div>
                        </div>
                        
                        <div>
                            <div class="inline-flex w-full items-stretch">
                                <label for="client-capacity" class="w-24 md:w-28 shrink-0 pr-3 py-3 text-sm font-semibold text-gray-700 bg-blue-50 border-2 border-blue-300 rounded-r-lg border-l-0 flex items-center justify-start text-right">
                                    صفته
                                </label>
                                <input type="text" id="client-capacity" name="capacity" value="${client.capacity || ''}" 
                                       class="flex-1 p-3 bg-white border-2 border-blue-300 rounded-l-lg border-r-0 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right transition-colors font-semibold text-gray-800">
                            </div>
                        </div>
                        
                        <div>
                            <div class="inline-flex w-full items-stretch">
                                <label for="client-address" class="w-24 md:w-28 shrink-0 pr-3 py-3 text-sm font-semibold text-gray-700 bg-blue-50 border-2 border-blue-300 rounded-r-lg border-l-0 flex items-center justify-start text-right">
                                    عنوانه
                                </label>
                                <input type="text" id="client-address" name="address" value="${client.address || ''}" 
                                       class="flex-1 p-3 bg-white border-2 border-blue-300 rounded-l-lg border-r-0 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right transition-colors font-semibold text-gray-800">
                            </div>
                        </div>
                        
                        <div>
                            <div class="inline-flex w-full items-stretch">
                                <label for="client-phone" class="w-24 md:w-28 shrink-0 pr-3 py-3 text-sm font-semibold text-gray-700 bg-blue-50 border-2 border-blue-300 rounded-r-lg border-l-0 flex items-center justify-start text-right">
                                    الهاتف
                                </label>
                                <input type="text" id="client-phone" name="phone" value="${client.phone || ''}" 
                                       class="flex-1 p-3 bg-white border-2 border-blue-300 rounded-l-lg border-r-0 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right transition-colors font-semibold text-gray-800">
                            </div>
                        </div>
                        
                                            </div>
                    
                    <!-- أزرار التحكم -->
                    <div class="flex flex-col sm:flex-row gap-4 pt-6">
                        <button type="submit" class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg font-bold flex items-center justify-center gap-3">
                            <i class="ri-save-3-line text-xl"></i>
                            <span>حفظ التعديلات</span>
                        </button>
                        <button type="button" id="cancel-edit-btn" class="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg font-bold flex items-center justify-center gap-3">
                            <i class="ri-close-line text-xl"></i>
                            <span>إلغاء</span>
                        </button>
                    </div>
                </form>
            </div>
        `;


        document.getElementById('edit-client-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedData = Object.fromEntries(formData.entries());
            
            try {
                await updateRecord('clients', clientId, updatedData);
                showToast('تم تحديث بيانات الموكل بنجاح', 'success');
                await updateCountersInHeader();

                // ارجع للشاشة السابقة (عرض الموكل)
                navigateBack();
            } catch (error) {
                showToast('حدث خطأ في تحديث البيانات', 'error');
            }
        });

        document.getElementById('cancel-edit-btn').addEventListener('click', async () => {
            // ارجع للشاشة السابقة بدل إعادة بناء العرض يدويًا
            navigateBack();
        });

    } catch (error) {
        showToast('حدث خطأ في تحميل نموذج التعديل', 'error');
    }
}


async function displayEditOpponentFormInline(opponentId) {
    try {
        const opponent = await getById('opponents', opponentId);
        if (!opponent) {
            showToast('لم يتم العثور على بيانات الخصم', 'error');
            return;
        }


        const cases = await getFromIndex('cases', 'opponentId', opponentId);
        const clientId = cases.length > 0 ? cases[0].clientId : null;

        const pageHeaderTitle = document.getElementById('page-title');
        if (pageHeaderTitle) pageHeaderTitle.textContent = 'تعديل البيانات';
        const modalTitleEl2 = document.getElementById('modal-title');
        if (modalTitleEl2) modalTitleEl2.textContent = '';
        const modalContent = document.getElementById('modal-content');
        modalContent.classList.remove('search-modal-content');
        

        stateManager.currentClientId = clientId;
        
        modalContent.innerHTML = `
            <div class="bg-gradient-to-br from-red-100 to-pink-200 rounded-2xl p-6 shadow-2xl border border-red-300">
                <form id="edit-opponent-form" class="space-y-6">
                    <!-- الحقول في شبكة -->
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white/95 backdrop-blur-sm rounded-xl border border-red-200 shadow-md">
                        <div>
                            <div class="inline-flex w-full items-stretch">
                                <label for="opponent-name" class="w-24 md:w-28 shrink-0 pr-3 py-3 text-sm font-semibold text-gray-700 bg-red-50 border-2 border-red-300 rounded-r-lg border-l-0 flex items-center justify-start text-right">
                                    اسم الخصم
                                </label>
                                <input type="text" id="opponent-name" name="name" value="${opponent.name || ''}" required 
                                       class="flex-1 p-3 bg-white border-2 border-red-300 rounded-l-lg border-r-0 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-right transition-colors font-semibold text-gray-800">
                            </div>
                        </div>
                        
                        <div>
                            <div class="inline-flex w-full items-stretch">
                                <label for="opponent-capacity" class="w-24 md:w-28 shrink-0 pr-3 py-3 text-sm font-semibold text-gray-700 bg-red-50 border-2 border-red-300 rounded-r-lg border-l-0 flex items-center justify-start text-right">
                                    صفته
                                </label>
                                <input type="text" id="opponent-capacity" name="capacity" value="${opponent.capacity || ''}" 
                                       class="flex-1 p-3 bg-white border-2 border-red-300 rounded-l-lg border-r-0 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-right transition-colors font-semibold text-gray-800">
                            </div>
                        </div>
                        
                        <div>
                            <div class="inline-flex w-full items-stretch">
                                <label for="opponent-address" class="w-24 md:w-28 shrink-0 pr-3 py-3 text-sm font-semibold text-gray-700 bg-red-50 border-2 border-red-300 rounded-r-lg border-l-0 flex items-center justify-start text-right">
                                    عنوانه
                                </label>
                                <input type="text" id="opponent-address" name="address" value="${opponent.address || ''}" 
                                       class="flex-1 p-3 bg-white border-2 border-red-300 rounded-l-lg border-r-0 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-right transition-colors font-semibold text-gray-800">
                            </div>
                        </div>
                        
                        <div>
                            <div class="inline-flex w-full items-stretch">
                                <label for="opponent-phone" class="w-24 md:w-28 shrink-0 pr-3 py-3 text-sm font-semibold text-gray-700 bg-red-50 border-2 border-red-300 rounded-r-lg border-l-0 flex items-center justify-start text-right">
                                    الهاتف
                                </label>
                                <input type="text" id="opponent-phone" name="phone" value="${opponent.phone || ''}" 
                                       class="flex-1 p-3 bg-white border-2 border-red-300 rounded-l-lg border-r-0 shadow-sm placeholder-gray-400 focus:ring-2 focus:ring-red-500 focus:border-red-500 text-right transition-colors font-semibold text-gray-800">
                            </div>
                        </div>
                        
                                            </div>
                    
                    <!-- أزرار التحكم -->
                    <div class="flex flex-col sm:flex-row gap-4 pt-6">
                        <button type="submit" class="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white py-4 px-8 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg font-bold flex items-center justify-center gap-3">
                            <i class="ri-save-3-line text-xl"></i>
                            <span>حفظ التعديلات</span>
                        </button>
                        <button type="button" id="cancel-edit-opponent-btn" class="px-8 py-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-lg font-bold flex items-center justify-center gap-3">
                            <i class="ri-close-line text-xl"></i>
                            <span>إلغاء</span>
                        </button>
                    </div>
                </form>
            </div>
        `;


        document.getElementById('edit-opponent-form').addEventListener('submit', async (e) => {
            e.preventDefault();
            const formData = new FormData(e.target);
            const updatedData = Object.fromEntries(formData.entries());
            
            try {
                await updateRecord('opponents', opponentId, updatedData);
                showToast('تم تحديث بيانات الخصم بنجاح', 'success');
                await updateCountersInHeader();

                // ارجع للشاشة السابقة (عرض الموكل أو القائمة)
                navigateBack();
            } catch (error) {
                showToast('حدث خطأ في تحديث البيانات', 'error');
            }
        });

        document.getElementById('cancel-edit-opponent-btn').addEventListener('click', async () => {
            // ارجع للشاشة السابقة بدل إعادة بناء العرض يدويًا
            navigateBack();
        });

    } catch (error) {
        showToast('حدث خطأ في تحميل نموذج التعديل', 'error');
    }
}