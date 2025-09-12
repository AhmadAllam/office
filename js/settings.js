function displaySettingsModal() {
    document.getElementById('modal-title').textContent = 'الإعدادات';
    const modalContent = document.getElementById('modal-content');
    modalContent.classList.remove('search-modal-content');
    modalContent.innerHTML = `
        <div class="max-w-full mx-auto p-3">
            <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
                
                <!-- النسخ الاحتياطي والاستعادة -->
                <div class="bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md transition-all h-fit">
                    <div class="text-center mb-4">
                        <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                            <i class="ri-hard-drive-2-line text-white text-lg"></i>
                        </div>
                        <h3 class="text-base font-bold text-blue-700 mb-1">النسخ الاحتياطي</h3>
                        <p class="text-sm text-gray-600">حماية البيانات</p>
                    </div>
                    <p class="text-gray-600 text-sm mb-4 text-center">نسخ احتياطي أو استعادة</p>
                    <div class="space-y-3">
                        <button id="backup-data-btn" class="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                            <i class="ri-download-2-line text-lg"></i>
                            إنشاء نسخة احتياطية
                        </button>
                        <div class="relative">
                            <input type="file" id="restore-file-input" accept=".json" class="hidden">
                            <button id="restore-data-btn" class="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                                <i class="ri-upload-2-line text-lg"></i>
                                استعادة من نسخة احتياطية
                            </button>
                        </div>
                        <div class="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                            <span class="text-sm font-semibold text-gray-700">النسخ الاحتياطي تلقائياً عند الخروج</span>
                            <label class="flex items-center gap-3 cursor-pointer select-none">
                                <input id="toggle-auto-backup" type="checkbox" style="position:absolute;width:1px;height:1px;opacity:0;">
                                <div id="auto-backup-track" class="relative" style="width:56px;height:28px;border-radius:9999px;background:#e5e7eb;border:1px solid #cbd5e1;box-shadow:inset 0 1px 2px rgba(0,0,0,.08);transition:background .25s, box-shadow .25s, border-color .25s;cursor:pointer;">
                                    <div id="auto-backup-knob" style="position:absolute;top:2px;left:2px;width:24px;height:24px;background:#ffffff;border-radius:9999px;box-shadow:0 1px 2px rgba(0,0,0,.2);transition:transform .25s, box-shadow .25s;"></div>
                                </div>
                                <span id="auto-backup-off" class="text-xs.font-bold" style="color:#4b5563;">موقوف</span>
                                <span id="auto-backup-on" class="text-xs font-bold" style="color:#1d4ed8;display:none;">مُفعّل</span>
                            </label>
                        </div>
                        <div id="auto-backup-note" class="mt-2 text-xs text-yellow-700">هذه الميزة تعمل فقط في تطبيق سطح المكتب، ولن تعمل في المتصفح العادي</div>
                    </div>
                </div>

                <!-- البيانات التجريبية -->
                <div class="bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md transition-all h-fit">
                    <div class="text-center mb-4">
                        <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                            <i class="ri-database-2-line text-white text-lg"></i>
                        </div>
                        <h3 class="text-base font-bold text-blue-700 mb-1">البيانات التجريبية</h3>
                        <p class="text-sm text-gray-600">للاختبار والتجربة</p>
                    </div>
                    <p class="text-gray-600 text-sm mb-4 text-center">بيانات تجريبية للاختبار</p>
                    <div class="space-y-3">
                        <button id="add-sample-data-btn" class="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                            <i class="ri-database-2-line text-lg"></i>
                            إضافة البيانات التجريبية
                        </button>
                        <button id="delete-all-data-btn" class="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                            <i class="ri-delete-bin-2-line text-lg"></i>
                            مسح شامل للبيانات
                        </button>
                    </div>
                </div>

                <!-- إعدادات المكتب -->
                <div class="bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md transition-all h-fit">
                    <div class="text-center mb-4">
                        <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                            <i class="ri-building-line text-white text-lg"></i>
                        </div>
                        <h3 class="text-base font-bold text-blue-700 mb-1">إعدادات المكتب</h3>
                        <p class="text-sm text-gray-600">تخصيص معلومات المكتب</p>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2 text-center">اسم المكتب</label>
                            <input type="text" id="office-name-input" 
                                   class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-sm bg-white transition-all" 
                                   placeholder="أدخل اسم المكتب">
                        </div>
                        <button id="save-office-settings-btn" class="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                            <i class="ri-save-line text-lg"></i>
                            حفظ الإعدادات
                        </button>
                    </div>
                </div>

                <!-- إعدادات الأمان -->
                <div class="bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md transition-all h-fit">
                    <div class="text-center mb-4">
                        <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                            <i class="ri-shield-keyhole-line text-white text-lg"></i>
                        </div>
                        <h3 class="text-base font-bold text-blue-700 mb-1">إعدادات الأمان</h3>
                        <p class="text-sm text-gray-600">حماية التطبيق بكلمة مرور</p>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2 text-center">كلمة المرور</label>
                            <input type="password" id="app-password-input" 
                                   class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-sm bg-white transition-all" 
                                   placeholder="أدخل كلمة المرور">
                        </div>
                        <button id="save-password-btn" class="w-full px-4 py-3 bg-blue-900 hover:bg-black text-white rounded-lg text-sm font-bold flex items-center justify-center gap-2">
                            <i class="ri-lock-line text-lg"></i>
                            حفظ كلمة المرور
                        </button>
                    </div>
                </div>

                <!-- نسخ الصيغ الجاهزة -->
                <div class="bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md transition-all h-fit">
                    <div class="text-center mb-4">
                        <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                            <i class="ri-file-copy-line text-white text-lg"></i>
                        </div>
                        <h3 class="text-base font-bold text-blue-700 mb-1">الصيغ الجاهزة</h3>
                        <p class="text-sm text-gray-600">نسخ مجلد الصيغ إلى سطح المكتب</p>
                    </div>
                    <p class="text-gray-600 text-sm mb-4 text-center">نسخ جميع الصيغ القانونية الجاهزة</p>
                    <div class="space-y-3">
                        <button id="copy-pack-btn" class="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                            <i class="ri-file-copy-line text-lg"></i>
                            نسخ الصيغ الجاهزة لسطح المكتب
                        </button>
                    </div>
                </div>

                <!-- مزامنة البيانات -->
                <div class="bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md transition-all h-fit">
                    <div class="text-center mb-4">
                        <div class="w-10 h-10 bg-green-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                            <i class="ri-cloud-line text-white text-lg"></i>
                        </div>
                        <h3 class="text-base font-bold text-green-700 mb-1">مزامنة البيانات</h3>
                        <p class="text-sm text-gray-600">مزامنة بين الأجهزة المختلفة</p>
                    </div>
                    <div class="space-y-3">
                        <div>
                            <label class="block text-sm font-bold text-gray-700 mb-2 text-center">معرف المكتب (أرقام فقط)</label>
                            <div class="relative">
                                <input type="text" id="sync-client-id" 
                                       class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-center text-sm bg-white transition-all" 
                                       placeholder="مثال: 123456789"
                                       pattern="[0-9]*"
                                       inputmode="numeric">
                                <i id="sync-id-lock-icon" class="ri-lock-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-lg hidden"></i>
                            </div>
                            <p class="text-xs text-gray-500 mt-1 text-center">المعرّف يُصدر من الإدارة</p>
                            <p id="sync-id-locked-message" class="text-xs text-green-600 mt-1 text-center font-semibold hidden">
                                <i class="ri-shield-check-line"></i> المعرف محفوظ ومؤمن
                            </p>
                        </div>
                        
                        <!-- حالة المزامنة -->
                        <div class="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div class="flex items-center justify-between mb-2">
                                <span class="text-sm font-semibold text-blue-800">حالة المزامنة</span>
                                <span id="sync-status" class="text-sm">
                                    <span id="sync-status-text" class="text-gray-600 flex items-center gap-1">
                                        <i class="ri-question-line"></i>
                                        لم يتم الإعداد
                                    </span>
                                </span>
                            </div>
                            <div class="flex gap-2">
                                <button id="sync-now-btn" class="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                                    <i class="ri-refresh-line text-lg"></i>
                                    مزامنة الآن
                                </button>
                            </div>
                            
                            <!-- مؤشر التقدم -->
                            <div id="sync-progress-container" class="hidden mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div class="flex items-center justify-between mb-2">
                                    <span id="sync-progress-text" class="text-sm font-semibold text-blue-800">جاري التحضير...</span>
                                    <span id="sync-progress-percent" class="text-xs text-blue-600">0%</span>
                                </div>
                                <div class="w-full bg-blue-200 rounded-full h-2">
                                    <div id="sync-progress-bar" class="bg-blue-600 h-2 rounded-full transition-all duration-300" style="width: 0%"></div>
                                </div>
                                <div id="sync-progress-details" class="text-xs text-blue-600 mt-1 text-center">
                                    <i class="ri-information-line"></i> <span id="sync-step-info">بدء العملية...</span>
                                </div>
                            </div>
                        </div>
                                                                                            </div>
                </div>

                                
            </div>
        </div>
    `;
    
    (function(){ 
        const grid = document.querySelector('#modal-content .grid');
        if (!grid) return;
        grid.insertAdjacentHTML('beforeend', `
                <div class="bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md transition-all h-fit">
                    <div class="text-center mb-4">
                        <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                            <i class="ri-volume-up-line text-white text-lg"></i>
                        </div>
                        <h3 class="text-base font-bold text-blue-700 mb-1">التنبيهات الصوتيه</h3>
                        <p class="text-sm text-gray-600">تنبيهات جلسات الغد وأعمال الغد</p>
                    </div>
                    <div class="space-y-3">
                        <label class="block text-sm font-bold text-gray-700 mb-2 text-center">تكرار التنبيه</label>
                        <select id="tomorrow-audio-mode" class="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center text-sm bg-white transition-all">
                            <option value="off">معطل</option>
                            <option value="always">تشغيل باستمرار</option>
                            <option value="hourly">كل ساعة</option>
                            <option value="2h">كل ساعتين</option>
                            <option value="3h">كل 3 ساعات</option>
                        </select>
                        <button id="save-tomorrow-audio-settings-btn" class="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                            <i class="ri-save-line text-lg"></i>
                            حفظ الإعدادات
                        </button>
                    </div>
                </div>
        `);
        const select = document.getElementById('tomorrow-audio-mode');
        const btn = document.getElementById('save-tomorrow-audio-settings-btn');
        (async ()=>{ 
            try { 
                const v = await getSetting('tomorrowAudioMode'); 
                if (v === 'off' || v === 'always' || v === 'hourly' || v === '2h' || v === '3h') { 
                    select.value = v; 
                } else { 
                    select.value = 'hourly'; 
                } 
            } catch (e) { 
                select.value = 'hourly'; 
            } 
        })();
        if (btn) btn.addEventListener('click', async ()=>{ 
            try { 
                const val = select.value; 
                await setSetting('tomorrowAudioMode', val); 
                if (typeof showToast==='function') showToast('تم حفظ إعدادات التنبيه'); 
            } catch (e) {} 
        });
    })();
    
    loadOfficeSettings();
    
    document.getElementById('save-office-settings-btn').addEventListener('click', handleSaveOfficeSettings);
    document.getElementById('backup-data-btn').addEventListener('click', handleBackupData);
    document.getElementById('restore-data-btn').addEventListener('click', handleRestoreDataClick);
    document.getElementById('copy-pack-btn').addEventListener('click', handleCopyPackToDesktop);
    
    // إعدادات المزامنة
        document.getElementById('sync-now-btn').addEventListener('click', handleSyncNow);
    document.getElementById('sync-client-id').addEventListener('input', handleSyncIdInput);
        
    // تحميل إعدادات المزامنة
    loadSyncSettings();
    // إخفاء زر حفظ المعرف وإزالة مزامنة عند الإغلاق
    setTimeout(() => {
        try {
            const saveBtn = document.getElementById('save-sync-settings-btn');
            if (saveBtn) saveBtn.style.display = 'none';
            const autoSyncToggle = document.getElementById('toggle-auto-sync');
            if (autoSyncToggle) {
                const container = autoSyncToggle.closest('.p-3');
                if (container) container.remove();
            }
        } catch (e) {}
    }, 0);
    
    // إعداد مفتاح المزامنة التلقائية - ملغي حسب الطلب
    // setupAutoSyncToggle();
    const grid = document.querySelector('#modal-content .grid');
    if (grid) {
        const card = document.createElement('div');
        card.className = 'bg-white border-2 border-gray-300 rounded-xl p-3 shadow-md transition-all h-fit';
        card.innerHTML = `
            <div class="text-center mb-4">
                <div class="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center mx-auto mb-2 shadow-md">
                    <i class="ri-database-backup-line text-white text-lg"></i>
                </div>
                <h3 class="text-base font-bold text-blue-700 mb-1">نسخ XML إلى JSON</h3>
                <p class="text-sm text-gray-600">تجميع ملفات Access XML إلى نسخة احتياطية</p>
            </div>
            <div class="space-y-3">
                <div>
                    <label class="block text-sm font-bold text-gray-700 mb-2 text-center">مجلد الاكسس</label>
                    <div class="flex gap-2">
                        <input type="text" id="xml-folder-path" 
                               class="flex-1 px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white transition-all text-center font-medium" 
                               placeholder="اختر مجلد الاكسس" readonly>
                        <button id="select-xml-folder-btn" class="px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm flex items-center justify-center" title="اختيار مجلد الاكسس">
                            <i class="ri-folder-line text-lg"></i>
                        </button>
                    </div>
                </div>
                <button id="build-access-backup-btn" class="w-full px-4 py-3 bg-blue-900 text-white rounded-lg hover:bg-black transition-colors text-sm font-bold flex items-center justify-center gap-2 shadow-md">
                    <i class="ri-play-line text-lg"></i>
                    تشغيل التحويل الآن
                </button>
            </div>
        `;
        grid.appendChild(card);
        
        // تحميل المجلد المحفوظ
        const xmlFolderInput = card.querySelector('#xml-folder-path');
        const selectFolderBtn = card.querySelector('#select-xml-folder-btn');
        
        // تحميل المجلد المحفوظ أو استخدام القيمة الافتراضية
        (async () => {
            try {
                const savedFolder = await getSetting('xmlSourceFolder');
                if (savedFolder) {
                    fullFolderPath = savedFolder;
                    // عرض اسم المجلد فقط
                    const folderName = savedFolder.split('\\').pop() || savedFolder.split('/').pop() || savedFolder;
                    xmlFolderInput.value = folderName;
                    xmlFolderInput.style.color = '#374151'; // لون النص العادي
                    xmlFolderInput.title = savedFolder; // إظهار المسار الكامل عند التمرير
                } else {
                    // في Electron: عرض رسالة توضيحية، في المتصفح: استخدام data
                    if (window.electronAPI) {
                        xmlFolderInput.value = '';
                        xmlFolderInput.placeholder = 'اختر مجلد الاكسس';
                    } else {
                        xmlFolderInput.value = 'اختر مجلد الاكسس';
                        xmlFolderInput.style.color = '#9CA3AF'; // لون رمادي للنص التوضيحي
                        fullFolderPath = 'data';
                    }
                }
            } catch (e) {
                if (window.electronAPI) {
                    xmlFolderInput.value = '';
                    xmlFolderInput.placeholder = 'اختر مجلد الاكسس';
                } else {
                    xmlFolderInput.value = 'اختر مجلد الاكسس';
                    xmlFolderInput.style.color = '#9CA3AF'; // لون رمادي للنص التوضيحي
                    fullFolderPath = 'data';
                }
            }
        })();
        
        // إضافة input مخفي لاختيار المجلد في المتصفح
        const hiddenFolderInput = document.createElement('input');
        hiddenFolderInput.type = 'file';
        hiddenFolderInput.webkitdirectory = true;
        hiddenFolderInput.style.display = 'none';
        document.body.appendChild(hiddenFolderInput);
        
        // متغير لحفظ المسار الكامل
        let fullFolderPath = '';
        
        // إضافة وظيفة اختيار المجلد
        if (selectFolderBtn) {
            selectFolderBtn.addEventListener('click', async () => {
                try {
                    if (window.electronAPI && window.electronAPI.selectFolder) {
                        // في تطبيق سطح المكتب
                        const result = await window.electronAPI.selectFolder();
                        if (result && !result.canceled && result.filePaths && result.filePaths.length > 0) {
                            const selectedPath = result.filePaths[0];
                            fullFolderPath = selectedPath;
                            
                            // عرض اسم المجلد فقط
                            const folderName = selectedPath.split('\\').pop() || selectedPath.split('/').pop();
                            xmlFolderInput.value = folderName;
                            xmlFolderInput.style.color = '#374151'; // لون النص العادي
                            xmlFolderInput.title = selectedPath; // إظهار المسار الكامل عند التمرير
                            
                            await setSetting('xmlSourceFolder', selectedPath);
                            showToast('تم تحديد المجلد بنجاح', 'success');
                        }
                    } else {
                        // في المتصفح - فتح نافذة اختيار المجلد
                        // إعادة تعيين قيمة input لضمان تشغيل حدث change حتى لو تم اختيار نفس المجلد
                        hiddenFolderInput.value = '';
                        hiddenFolderInput.click();
                    }
                } catch (e) {
                    showToast('فشل في تحديد المجلد', 'error');
                }
            });
            
            // معالج تغيير المجلد في المتصفح
            hiddenFolderInput.addEventListener('change', async (e) => {
                try {
                    if (e.target.files && e.target.files.length > 0) {
                        // الحصول على مسار المجلد من أول ملف
                        const firstFile = e.target.files[0];
                        const folderPath = firstFile.webkitRelativePath.split('/')[0];
                        fullFolderPath = folderPath;
                        
                        // تحديث حقل النص - عرض اسم المجلد فقط
                        xmlFolderInput.value = folderPath;
                        xmlFolderInput.style.color = '#374151'; // لون النص العادي
                        xmlFolderInput.title = folderPath; // إظهار المسار عند التمرير
                        await setSetting('xmlSourceFolder', folderPath);
                        
                        // حفظ الملفات في متغير عام للاستخدام لاحقاً
                        window.selectedXmlFiles = Array.from(e.target.files);
                        
                        // فحص الملفات المطلوبة
                        const requiredFiles = ['جدول الموكلين.xml', 'جدول الخصوم.xml', 'جدول الدعاوى.xml', 'جدول الجلسات.xml'];
                        const foundFiles = requiredFiles.filter(fileName => 
                            window.selectedXmlFiles.some(file => file.name === fileName)
                        );
                        
                        if (foundFiles.length === 4) {
                            showToast(`تم تحديد المجلد: ${folderPath} (${foundFiles.length}/4 ملفات)`, 'success');
                        } else {
                            showToast(`تم تحديد المجلد: ${folderPath} (${foundFiles.length}/4 ملفات - بعض الملفات مفقودة)`, 'warning');
                        }
                    }
                } catch (error) {
                    showToast('فشل في تحديد المجلد', 'error');
                }
            });
        }
        
        const runBtn = card.querySelector('#build-access-backup-btn');
        if (runBtn) runBtn.addEventListener('click', async ()=>{
            try {
                // في Electron: التأكد من اختيار مجلد
                if (window.electronAPI && !fullFolderPath) {
                    showToast('يرجى اختيار مجلد الاكسس أولاً', 'warning');
                    return;
                }
                
                // في المتصفح: التحقق من النص التوضيحي
                if (!window.electronAPI && xmlFolderInput.value === 'اختر مجلد الاكسس') {
                    showToast('يرجى اختيار مجلد الاكسس أولاً', 'warning');
                    return;
                }
                
                // استخدام المسار الكامل المحفوظ
                const folderToUse = fullFolderPath || 'data';
                
                showToast('جاري التحويل من XML إلى JSON...', 'info');
                if (window.electronAPI && window.electronAPI.buildAccessBackup) {
                    const res = await window.electronAPI.buildAccessBackup(folderToUse);
                    if (res && res.success) {
                        const message = res.message ? res.message : `تم إنشاء النسخة: ${res.filename || ''}`;
                        showToast(message, 'success');
                        
                        // إظهار زر لفتح مجلد الحفظ
                        if (res.savedPath && window.electronAPI.openFolder) {
                            setTimeout(() => {
                                const openFolderBtn = document.createElement('button');
                                openFolderBtn.innerHTML = '<i class="ri-folder-open-line"></i> فتح مجلد الحفظ';
                                openFolderBtn.className = 'mt-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 transition-colors';
                                openFolderBtn.onclick = async () => {
                                    try {
                                        // استخراج مجلد الحفظ من المسار الكامل
                                        const folderPath = res.savedPath.substring(0, res.savedPath.lastIndexOf('\\'));
                                        await window.electronAPI.openFolder(folderPath);
                                    } catch (e) {
                                        showToast('فشل في فتح المجلد', 'error');
                                    }
                                };
                                
                                // إضافة الزر تحت زر التشغيل
                                const runBtnParent = runBtn.parentElement;
                                if (runBtnParent && !runBtnParent.querySelector('.open-folder-btn')) {
                                    openFolderBtn.classList.add('open-folder-btn');
                                    runBtnParent.appendChild(openFolderBtn);
                                    
                                    // إزالة الزر بعد 10 ثوان
                                    setTimeout(() => {
                                        if (openFolderBtn.parentElement) {
                                            openFolderBtn.remove();
                                        }
                                    }, 10000);
                                }
                            }, 1000);
                        }
                    } else {
                        showToast(res && res.message ? res.message : 'فشل التنفيذ', 'error');
                    }
                } else {
                    const fileName = await buildAccessBackupWeb(folderToUse);
                    showToast('تم إنشاء النسخة: ' + fileName, 'success');
                }
            } catch (e) {
                showToast('فشل التنفيذ', 'error');
            }
        });

        // إعادة ترتيب الكروت بصريًا حسب تسلسل محدد دون المساس بالوظائف
        const reorderSettingsCards = () => {
            try {
                const container = document.querySelector('#modal-content .grid');
                if (!container) return;
                const getTitle = (el) => {
                    const h3 = el.querySelector('h3');
                    return h3 && h3.textContent ? h3.textContent.trim() : '';
                };
                const desiredOrder = ['إعدادات المكتب','إعدادات الأمان','التنبيهات الصوتيه','نسخ XML إلى JSON','النسخ الاحتياطي','البيانات التجريبية','الترخيص'];
                const cards = Array.from(container.children);
                const used = new Set();
                desiredOrder.forEach(title => {
                    const el = cards.find(c => getTitle(c) === title);
                    if (el) { container.appendChild(el); used.add(el); }
                });
                // ضع أي بطاقات أخرى غير مذكورة في الترتيب بعد المذكورة
                cards.forEach(c => { if (!used.has(c)) container.appendChild(c); });
            } catch (e) {}
        };
        // مهلة قصيرة للتأكد من اكتمال إدراج كل الكروت الديناميكية
        setTimeout(reorderSettingsCards, 0);
    }
    document.getElementById('restore-file-input').addEventListener('change', handleRestoreData);
    document.getElementById('add-sample-data-btn').addEventListener('click', handleAddSampleData);
    document.getElementById('delete-all-data-btn').addEventListener('click', handleFullWipe);
    (function initAutoBackupToggle() {
        const autoToggle = document.getElementById('toggle-auto-backup');
        const track = document.getElementById('auto-backup-track');
        const knob = document.getElementById('auto-backup-knob');
        const onLabel = document.getElementById('auto-backup-on');
        const offLabel = document.getElementById('auto-backup-off');
        if (!autoToggle) return;
        const render = (checked) => {
            if (track) {
                track.style.background = checked ? 'linear-gradient(90deg, #2563eb, #1d4ed8)' : '#e5e7eb';
                track.style.borderColor = checked ? '#1d4ed8' : '#cbd5e1';
                track.style.boxShadow = checked ? 'inset 0 1px 2px rgba(0,0,0,.08), 0 0 0 2px rgba(37, 99, 235, .15)' : 'inset 0 1px 2px rgba(0,0,0,.08)';
            }
            if (knob) {
                knob.style.transform = checked ? 'translateX(28px)' : 'translateX(0)';
                knob.style.boxShadow = checked ? '0 1px 2px rgba(0,0,0,.2), 0 0 0 3px rgba(147,197,253,.45)' : '0 1px 2px rgba(0,0,0,.2)';
            }
            if (onLabel) onLabel.style.display = checked ? 'inline' : 'none';
            if (offLabel) offLabel.style.display = checked ? 'none' : 'inline';
        };
        (async () => {
            try {
                const v = await getSetting('autoBackupOnExit');
                autoToggle.checked = (v === true || v === '1' || v === 1);
            } catch (e) {}
            render(autoToggle.checked);
            const note = document.getElementById('auto-backup-note');
            const isDesktop = !!(window.electronAPI);
            if (!isDesktop) {
                if (note) note.style.display = 'block';
                autoToggle.disabled = true;
                if (track) track.style.opacity = '0.5';
                if (knob) knob.style.opacity = '0.6';
            } else {
                if (note) note.style.display = 'none';
            }
        })();
        autoToggle.addEventListener('change', async () => {
            try {
                await setSetting('autoBackupOnExit', autoToggle.checked);
                render(autoToggle.checked);
                if (typeof showToast==='function') showToast(autoToggle.checked ? 'تم تفعيل النسخ الاحتياطي التلقائي' : 'تم إيقاف النسخ الاحتياطي التلقائي');
            } catch (e) {}
        });
    })();
    const savePwdBtn = document.getElementById('save-password-btn');
    if (savePwdBtn) {
        savePwdBtn.addEventListener('click', async function () {
            try {
                const input = document.getElementById('app-password-input');
                const val = (input && input.value ? input.value.trim() : '');
                if (input && input.dataset.masked === '1') { if (typeof showToast==='function') showToast('تم الاحتفاظ بكلمة المرور الحالية', 'success'); return; }
                if (!val) { if (typeof showToast==='function') showToast('يرجى إدخال كلمة المرور', 'error'); return; }
                const enc = new TextEncoder().encode(val);
                const buf = await crypto.subtle.digest('SHA-256', enc);
                const hex = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
                await setSetting('appPasswordHash', hex);
                await setSetting('appPasswordLen', val.length);
                sessionStorage.removeItem('auth_ok');
                if (typeof showToast==='function') showToast('تم حفظ كلمة المرور', 'success');
                if (input) { input.value = 'x'.repeat(val.length); input.dataset.masked='1'; }
            } catch (e) {}
        });
    }
    (async ()=>{
        const input = document.getElementById('app-password-input');
        if (!input) return;
        try {
            const len = await getSetting('appPasswordLen');
            const n = Number(len);
            if (n && n > 0) {
                input.value = 'x'.repeat(n);
                input.dataset.masked = '1';
            }
        } catch(e) {}
        input.addEventListener('input', ()=>{ if (input.dataset.masked==='1') { delete input.dataset.masked; } });
    })();
}

async function handleAddSampleData() {
    const confirmation = confirm('هل تريد إضافة البيانات التجريبية؟ سيتم إضافة موكلين وخصوم وقضايا وجلسات للاختبار.');
    if (confirmation) {
        try {
            await addSampleData();
            closeModal();
        } catch (error) {
            showToast('حدث خطأ في إضافة البيانات التجريبية', 'error');
        }
    }
}

async function handleFullWipe() {
    const ok = confirm('سيتم مسح كل بيانات البرنامج والكاش والتخزين لهذا الموقع. هل أنت متأكد؟');
    if (!ok) return;
    try { if (typeof showToast==='function') showToast('جاري المسح الشامل...', 'info'); } catch (e) {}
    try {
        if (navigator.serviceWorker && navigator.serviceWorker.getRegistrations) {
            const regs = await navigator.serviceWorker.getRegistrations();
            for (const r of regs) { try { await r.unregister(); } catch (_) {} }
        }
    } catch (e) {}
    try {
        if (window.caches && caches.keys) {
            const keys = await caches.keys();
            await Promise.all(keys.map(k => caches.delete(k)));
        }
    } catch (e) {}
    try { localStorage.clear(); } catch (e) {}
    try { sessionStorage.clear(); } catch (e) {}
    try {
        if (indexedDB && typeof indexedDB.databases === 'function') {
            const dbs = await indexedDB.databases();
            if (Array.isArray(dbs)) {
                for (const info of dbs) {
                    if (info && info.name) {
                        await new Promise(res => { const req = indexedDB.deleteDatabase(info.name); req.onsuccess=()=>res(); req.onerror=()=>res(); req.onblocked=()=>res(); });
                    }
                }
            }
        } else {
            await new Promise(res => { const req = indexedDB.deleteDatabase('LawyerAppDB'); req.onsuccess=()=>res(); req.onerror=()=>res(); req.onblocked=()=>res(); });
        }
    } catch (e) {}
    try { if (typeof showToast==='function') showToast('تم المسح الشامل', 'success'); } catch (e) {}
    setTimeout(() => { window.location.reload(); }, 800);
}



async function handleDeleteAllData() {
    const confirmation = confirm('هل أنت متأكد من حذف جميع البيانات؟ سيتم حذف جميع الموكلين والقضايا والجلسات والحسابات نهائياً!');
    if (!confirmation) return;

    try {
                
        // محاولة الطريقة الأولى: حذف البيانا�� من كل جدول
        const success = await clearAllDataFromTables();
        
        if (success) {
            showToast('تم حذف جميع البيانات بنجاح ✅');
            if (typeof updateCountersInHeader === 'function') {
                await updateCountersInHeader();
            }
            
            // إعادة تحميل الصفحة بعد ثانية واحدة
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            return;
        }
        
        // إذا فشلت الطريقة الأولى، نجرب حذف قاعدة البيانات كاملة
        await deleteEntireDatabase();
        
    } catch (error) {
        console.error('Error in handleDeleteAllData:', error);
        showToast('فشل حذف البيانات: ' + error.message, 'error');
        
        // في حالة فشل كل شيء، إعادة تحميل الصفحة
        setTimeout(() => {
            window.location.reload();
        }, 3000);
    }
}

// دالة لحذف البيانات من كل جدول على حدة
async function clearAllDataFromTables() {
    try {
        const dbInstance = getDbInstance();
        if (!dbInstance) {
            throw new Error('قاعدة البيانات غير متاحة');
        }

        const storeNames = ['clients', 'opponents', 'cases', 'sessions', 'accounts', 'administrative', 'clerkPapers', 'expertSessions', 'settings'];
        
                
        for (const storeName of storeNames) {
            try {
                await clearStore(storeName);
                console.log(`تم حذف بيانات جدول ${storeName}`);
            } catch (error) {
                console.warn(`تعذر حذف جدول ${storeName}:`, error);
                // نتجاهل الأخطاء ونكمل مع الجداول الأخرى
            }
        }
        
        // إضافة الإعدادات الافتراضية مرة أخرى
        try {
            await setSetting('officeName', 'محامين مصر الرقمية');
        } catch (error) {
            console.warn('تعذر إضافة الإعدادات الافتراضية:', error);
        }
        
        return true;
    } catch (error) {
        console.error('فشل في حذف البيانات من الجداول:', error);
        return false;
    }
}

// دالة لحذف قاعدة البيانات بالكامل
async function deleteEntireDatabase() {
    return new Promise((resolve, reject) => {
        // إغلاق قاعدة البيانات بشكل قوي
        const dbInstance = getDbInstance();
        if (dbInstance) {
            dbInstance.close();
        }
        
        // انتظار قصير للتأكد من إغلاق الاتصالات
        setTimeout(() => {
            const deleteRequest = indexedDB.deleteDatabase('LawyerAppDB');
            
            // مهلة زمنية للحذف (5 ثواني)
            const timeout = setTimeout(() => {
                window.location.reload();
            }, 5000);

            deleteRequest.onsuccess = async () => {
                clearTimeout(timeout);
                try {
                    // انتظار قصير قبل إعادة التهيئة
                    await new Promise(resolve => setTimeout(resolve, 300));
                    
                    await initDB();
                    if (typeof updateCountersInHeader === 'function') {
                        await updateCountersInHeader();
                    }
                    
                    showToast('تم حذف جميع البيانات بنجاح ✅');
                    
                    // إعادة تحميل الصفحة بعد ثانية واحدة
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    
                    resolve();
                } catch (error) {
                    console.error('Error reinitializing database:', error);
                    showToast('تم حذف جميع البيانات بنجاح ✅');
                    // إعادة تحميل الصفحة في كل الأحوال
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                    resolve();
                }
            };

            deleteRequest.onerror = (event) => {
                clearTimeout(timeout);
                console.error('Error deleting database:', event);
                showToast('فشل حذف البيانات', 'error');
                // إعادة تحميل الصفحة كحل أخير
                setTimeout(() => {
                    window.location.reload();
                }, 2000);
                reject(event);
            };
            
            deleteRequest.onblocked = () => {
                clearTimeout(timeout);
                // إعادة تحميل الصفحة فوراً
                setTimeout(() => {
                    window.location.reload();
                }, 1000);
            };
        }, 200);
    });
}


async function loadOfficeSettings() {
    try {
        const officeName = await getSetting('officeName');
        const officeNameInput = document.getElementById('office-name-input');
        if (officeNameInput && officeName) {
            officeNameInput.value = officeName;
        }
    } catch (error) {
    }
}

async function handleSaveOfficeSettings() {
    try {
        const officeNameInput = document.getElementById('office-name-input');
        const officeName = officeNameInput.value.trim();
        
        if (!officeName) {
            showToast('يرجى إدخال اسم المكتب', 'error');
            return;
        }
        
        await setSetting('officeName', officeName);
        showToast('تم حفظ إعدادات المكتب بنجاح');
        

        startDateAlternation();
        
    } catch (error) {

        showToast('حدث خطأ في حفظ الإعدادات', 'error');
    }
}


async function handleBackupData() {
    try {
        showToast('جاري إنشاء النسخة الاحتياطية...', 'info');
        
        const backupData = await createBackup();
        const dataStr = JSON.stringify(backupData, null, 2);
        

        const now = new Date();
        const dateStr = now.toISOString().slice(0, 19).replace(/:/g, '-');
        const filename = `lawyers-backup-${dateStr}.json`;
        

        const blob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showToast('تم إنشاء النسخة الاحتياطية بنجاح');
        
    } catch (error) {
        showToast('حدث خطأ في إنشاء النسخة الاحتياطية', 'error');
    }
}

function handleRestoreDataClick() {
    document.getElementById('restore-file-input').click();
}

async function handleRestoreData(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!file.name.endsWith('.json')) {
        showToast('يرجى اختيار ملف JSON صحيح', 'error');
        return;
    }
    
    const confirmation = confirm('هل تريد استعادة البيانات من النسخة الاحتياطية؟ سيتم استبدال جميع البيانات الحالية.');
    if (!confirmation) return;
    
    try {
        showToast('جاري استعادة البيانات...', 'info');
        

        const fileContent = await readFileAsText(file);

        

        let backupData;
        try {
            backupData = JSON.parse(fileContent);
        } catch (parseError) {
            throw new Error('الملف ليس بصيغة JSON صحيحة');
        }
        

        if (!backupData || typeof backupData !== 'object') {
            throw new Error('بنية الملف غير صحيحة');
        }
        
        if (!backupData.data) {
            throw new Error('الملف لا يحتوي على بيانات صحيحة');
        }
        

        const expectedStores = ['clients', 'opponents', 'cases', 'sessions'];
        const hasValidData = expectedStores.some(store => 
            backupData.data[store] && Array.isArray(backupData.data[store])
        );
        
        if (!hasValidData) {
            throw new Error('الملف لا يحتوي على بيانات صحيحة للتطبيق');
        }
        

        

        

        {
            try {
                const lic = await getSetting('licensed');
                const isLicensed = (lic === true || lic === 'true');
                const clientsInBackup = (backupData && backupData.data && Array.isArray(backupData.data.clients)) ? backupData.data.clients.length : 0;
                if (!isLicensed && clientsInBackup > 14) {
                    if (typeof showToast === 'function') showToast('عدد البيانات فى الملف كبيرة يرجى التفعيل اولا', 'error');
                    return;
                }
            } catch (e) {}
        }
        await restoreBackup(backupData);
        

        await updateCountersInHeader();
        
        showToast('تم استعادة البيانات بنجاح ✅');
        closeModal();
        

        setTimeout(() => {
            window.location.reload();
        }, 1000);
        
    } catch (error) {
        let errorMessage = 'حدث خطأ في استعادة البيانات';
        if (error.message?.includes('JSON')) {
            errorMessage = 'الملف ليس بصيغة JSON صحيحة';
        } else if (error.message?.includes('بنية')) {
            errorMessage = 'بنية الملف غير صحيحة - تأكد من أنه ملف نسخة احتياطية صحيح';
        } else if (error.message?.includes('البيانات مفقودة')) {
            errorMessage = 'الملف لا يحتوي على بيانات';
        } else if (error.message?.includes('فشل في استعادة جدول')) {
            errorMessage = `خطأ في قاعدة البيانات: ${error.message}`;
        } else if (error.message) {
            errorMessage = error.message;
        }
        showToast(errorMessage, 'error');
    }
    

    event.target.value = '';
}

async function createBackup() {
    const backup = {
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        data: {}
    };
    

    const storeNames = ['clients', 'opponents', 'cases', 'sessions', 'accounts', 'administrative', 'clerkPapers', 'expertSessions', 'settings'];
    
    for (const storeName of storeNames) {
        try {
            const records = await getAllRecords(storeName);
            let out = records;
            if (storeName === 'settings') {
                const excluded = /^(licensed|licenseKeyHash|trialStartMs|trialEndMs|lastSeenMs|installId|trial.*|lastSeen.*|backup_.*)$/;
                out = (records || []).filter(r => r && !excluded.test((r.key || '')));
            }
            backup.data[storeName] = out;
        } catch (error) {
            /* تعذر نسخ جدول ${storeName} */
            backup.data[storeName] = [];
        }
    }
    
    return backup;
}

async function restoreBackup(backupData) {
    try {
        if (!backupData || typeof backupData !== 'object') {
            throw new Error('ملف النسخة الاحتياطية غير صحيح - البيانات مفقودة');
        }
        
        // التعامل مع الهياكل المختلفة للبيانات
        let dataToRestore;
        if (backupData.data && typeof backupData.data === 'object') {
            dataToRestore = backupData.data;
        } else if (typeof backupData === 'object' && !backupData.data) {
            dataToRestore = backupData;
        } else {
            throw new Error('بنية البيانات غير معروفة');
        }
        
        // التحقق من وجود البيانات الأساسية
        const requiredCollections = ['clients', 'cases', 'sessions'];
        for (const collection of requiredCollections) {
            if (!Array.isArray(dataToRestore[collection])) {
                throw new Error(`بيانات ${collection} غير صحيحة أو مفقودة`);
            }
        }
        
        // المتابعة مع عملية الاستعادة
        await initDB();
        const expectedStores = ['clients', 'opponents', 'cases', 'sessions', 'accounts', 'administrative', 'clerkPapers', 'expertSessions', 'settings'];
        
        // حذف جميع البيانات المحلية القديمة أولاً لضمان عدم التكرار
        console.log('🗑️ حذف البيانات المحلية القديمة...');
        for (const storeName of expectedStores) {
            try {
                await clearStore(storeName);
                console.log(`✅ تم حذف جدول ${storeName}`);
            } catch (error) {
                console.warn(`⚠️ تعذر حذف جدول ${storeName}:`, error);
            }
        }
        
        let restoredCount = 0;
        for (const [storeName, records] of Object.entries(dataToRestore)) {
            if (Array.isArray(records) && records.length > 0) {
                try {
                    for (const record of records) {
                        if (record && typeof record === 'object') {
                            if (storeName === 'settings') {
                                const excluded = /^(licensed|licenseKeyHash|trialStartMs|trialEndMs|lastSeenMs|installId|trial.*|lastSeen.*)$/;
                                if (!excluded.test((record.key || ''))) {
                                    await putRecord(storeName, record);
                                }
                            } else {
                                if (record.id) {
                                    await putRecord(storeName, record);
                                } else {
                                    await addRecord(storeName, record);
                                }
                            }
                            restoredCount++;
                        }
                    }
                } catch (error) {
                    console.error(`خطأ في استعادة جدول ${storeName}:`, error);
                    throw new Error(`فشل في استعادة جدول ${storeName}`);
                }
            }
        }
        
        console.log(`✅ تم استعادة ${restoredCount} سجل بنجاح بدون تكرار`);
        return restoredCount;
        
    } catch (error) {
        console.error('خطأ في استعادة البيانات:', error);
        throw error;
    }
}

// دالة مساعدة لحذف جميع البيانات من جدول معين
async function clearStore(storeName) {
    return new Promise((resolve, reject) => {
        const dbInstance = getDbInstance();
        if (!dbInstance) {
            reject(new Error('قاعدة البيانات غير متاحة'));
            return;
        }
        
        try {
            const transaction = dbInstance.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const clearRequest = store.clear();
            
            clearRequest.onsuccess = () => resolve();
            clearRequest.onerror = () => reject(clearRequest.error);
            
            transaction.onerror = () => reject(transaction.error);
        } catch (error) {
            // إذا كان الجدول غير موجود، نتجاهل الخطأ
            console.warn(`Table ${storeName} not found, skipping...`);
            resolve();
        }
    });
}

function readFileAsText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(reader.error);
        reader.readAsText(file);
    });
}

function getAllRecords(storeName) {
    return new Promise((resolve, reject) => {
        const dbInstance = getDbInstance();
        if (!dbInstance) return reject("DB not initialized");
        
        try {
            const transaction = dbInstance.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();
            
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        } catch (error) {
            // إذا كان الجدول غير موجود، نرجع مصفوفة فارغة
            console.warn(`Table ${storeName} not found, returning empty array`);
            resolve([]);
        }
    });
}

async function buildAccessBackupWeb(customFolder = 'data') {
    function safeStr(v){return v==null?'':String(v).trim()}
    function toInt(v){if(v==null)return null;const n=parseInt(String(v).trim(),10);return Number.isFinite(n)?n:null}
    function toDateOnly(s){const t=safeStr(s);if(!t)return'';const x=t.split('T')[0];return x||''}
    function extractBlocks(xml,tag){const re=new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`,'g');const out=[];let m;while((m=re.exec(xml))!==null)out.push(m[1]);return out}
    function pickTag(block,tag){const re=new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`);const m=re.exec(block);return m?safeStr(m[1]):''}
    function extractInventoryFromDecision(decision,fallbackYear){const text=safeStr(decision);if(!text)return{number:null,year:fallbackYear??null};const withYear=text.match(/حصر\s*([0-9]+(?:[،,][0-9]+)*)\s*لسنة\s*([0-9]{4})/);if(withYear){const nums=withYear[1].split(/[،,]/).map(s=>parseInt(s.trim(),10)).filter(n=>Number.isFinite(n));const year=parseInt(withYear[2],10);if(nums.length>0)return{number:nums[0],year}}const onlyNumber=text.match(/حصر\s*([0-9]+)/);if(onlyNumber){const num=parseInt(onlyNumber[1],10);return{number:Number.isFinite(num)?num:null,year:fallbackYear??null}}return{number:null,year:fallbackYear??null}}
    
    // وظيفة قراءة الملف من الملفات المحددة أو من الخادم
    async function readUtf8(fileName) {
        // إذا كانت هناك ملفات محددة من المجلد، استخدمها
        if (window.selectedXmlFiles && window.selectedXmlFiles.length > 0) {
            const file = window.selectedXmlFiles.find(f => f.name === fileName);
            if (file) {
                return await file.text();
            }
        }
        // وإلا استخدم fetch العادي
        const url = `${customFolder}/${fileName}`;
        const res = await fetch(encodeURI(url));
        if (!res.ok) throw new Error(`فشل في تحميل الملف: ${fileName}`);
        return await res.text();
    }
    
    const clientsXml = await readUtf8('جدول الموكلين.xml');
    const opponentsXml = await readUtf8('جدول الخصوم.xml');
    const casesXml = await readUtf8('جدول الدعاوى.xml');
    const sessionsXml = await readUtf8('جدول الجلسات.xml');
    const clientBlocks=extractBlocks(clientsXml,'جدول_x0020_الموكلين');
    let clients=clientBlocks.map(blk=>{const id=toInt(pickTag(blk,'معرف_x0020_الموكل'));const name=safeStr(pickTag(blk,'اسم_x0020_الموكل'));return{id:id??undefined,name,capacity:'بصفته الشخصية',address:'',phone:''}}).filter(c=>c.id!=null&&c.name!=='');
    const opponentBlocks=extractBlocks(opponentsXml,'جدول_x0020_الخصوم');
    const opponentClientMap=new Map();
    const clientOverlayMap=new Map();
    const opponents=opponentBlocks.map(blk=>{const id=toInt(pickTag(blk,'معرف_x0020_الخصم'));const name=safeStr(pickTag(blk,'اسم_x0020_الخصم'));const capacity=safeStr(pickTag(blk,'صفة_x0020_الخصم'));const address=safeStr(pickTag(blk,'عنوان_x0020_الخصم'));const phone=safeStr(pickTag(blk,'هاتف_x0020_الخصم'));const clientId=toInt(pickTag(blk,'معرف_x0020_الموكل'));const clientCapacity=safeStr(pickTag(blk,'صفة_x0020_الموكل'));const clientAddress=safeStr(pickTag(blk,'عنوان_x0020_الموكل'));const clientPhone=safeStr(pickTag(blk,'هاتف_x0020_الموكل'));if(id!=null&&clientId!=null)opponentClientMap.set(id,clientId);if(clientId!=null){const overlay=clientOverlayMap.get(clientId)||{};if(clientCapacity)overlay.capacity=overlay.capacity||clientCapacity;const preferredAddress=clientAddress||address;if(preferredAddress)overlay.address=overlay.address||preferredAddress;const preferredPhone=clientPhone||phone;if(preferredPhone)overlay.phone=overlay.phone||preferredPhone;clientOverlayMap.set(clientId,overlay)}return{id:id??undefined,name,capacity,address,phone}}).filter(o=>o.id!=null&&o.name!=='');
    if(clientOverlayMap.size>0){clients=clients.map(c=>{const ov=clientOverlayMap.get(c.id);if(!ov)return c;return{...c,capacity:ov.capacity||c.capacity,address:ov.address||c.address,phone:ov.phone||c.phone}})}
    const caseBlocks=extractBlocks(casesXml,'جدول_x0020_الدعاوى');
    const cases=caseBlocks.map(blk=>{const id=toInt(pickTag(blk,'معرف_x0020_الدعوى'));const opponentId=toInt(pickTag(blk,'معرف_x0020_الخصم'));const clientId=opponentId!=null?(opponentClientMap.get(opponentId)??null):null;const court=safeStr(pickTag(blk,'المحكمة'));const caseType=safeStr(pickTag(blk,'نوع_x0020_الدعوى'));const subject=safeStr(pickTag(blk,'موضوع_x0020_الدعوى'));const caseNumber=safeStr(pickTag(blk,'رقم_x0020_الدعوى'));const caseYear=safeStr(pickTag(blk,'سنة_x0020_الدعوى'));const poaNumber=safeStr(pickTag(blk,'رقم_x0020_التوكيل'));const notes=safeStr(pickTag(blk,'ملاحظات'));return{id:id??undefined,clientId:clientId??null,opponentId:opponentId??null,caseNumber,caseYear,court,caseType,subject,poaNumber,poaDate:'',notes,isArchived:false}}).filter(cs=>cs.id!=null);
    const caseMap=new Map();
    cases.forEach(c=>caseMap.set(c.id,c));
    const sessionBlocks=extractBlocks(sessionsXml,'جدول_x0020_الجلسات');
    const sessions=sessionBlocks.map(blk=>{const id=toInt(pickTag(blk,'معرف_x0020_الجلسة'));const caseId=toInt(pickTag(blk,'معرف_x0020_الدعوى'));const dateStr=pickTag(blk,'تاريخ_x0020_الجلسة');const sessionDate=toDateOnly(dateStr);const decision=safeStr(pickTag(blk,'القرار'));const roll=toInt(pickTag(blk,'الرول'));const relatedCase=caseMap.get(caseId||-1)||null;const clientId=relatedCase?relatedCase.clientId??null:null;const court=relatedCase?String(relatedCase.court||''):'';const fallbackYear=sessionDate?parseInt(sessionDate.slice(0,4),10):null;const inv=extractInventoryFromDecision(decision,fallbackYear);return{id:id??undefined,clientId,caseId:caseId??null,sessionDate,sessionTime:'',court,sessionType:'جلسة',notes:decision,inventoryNumber:(inv.number??roll??null),inventoryYear:(inv.year??fallbackYear)}}).filter(s=>s.id!=null&&s.caseId!=null&&s.sessionDate!=='');
    const out={version:'1.0.0',timestamp:new Date().toISOString(),data:{clients,opponents,cases,sessions,accounts:[],administrative:[],clerkPapers:[],expertSessions:[],settings:[{key:'officeName',value:'محامين مصر الرقمية'}]}};
    const dateStr=new Date().toISOString().slice(0,19).replace(/:/g,'-');
    const filename=`lawyers-backup-access-${dateStr}.json`;
    const blob=new Blob([JSON.stringify(out,null,2)],{type:'application/json'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download=filename;document.body.appendChild(a);a.click();document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return filename;
}

// دالة نسخ مجلد pack إلى سطح المكتب
async function handleCopyPackToDesktop() {
    try {
        // التحقق من وجود Electron API
        if (!window.electronAPI || !window.electronAPI.copyPackToDesktop) {
            if (typeof showToast === 'function') {
                showToast('هذه الميزة تعمل فقط في تطبيق سطح المكتب', 'error');
            } else {
                alert('هذه الميزة تعمل فقط في تطبيق سطح المكتب');
            }
            return;
        }

        // عرض رسالة تحميل
        if (typeof showToast === 'function') {
            showToast('جاري نسخ الصيغ الجاهزة...', 'info');
        }

        // استدعاء API لنسخ المجلد
        const result = await window.electronAPI.copyPackToDesktop();

        if (result.success) {
            if (typeof showToast === 'function') {
                showToast(result.message, 'success');
            } else {
                alert(result.message);
            }
        } else {
            if (typeof showToast === 'function') {
                showToast(result.message, 'error');
            } else {
                alert('خطأ: ' + result.message);
            }
        }
    } catch (error) {
        console.error('خطأ في نسخ مجلد الصيغ الجاهزة:', error);
        if (typeof showToast === 'function') {
            showToast('حدث خطأ أثناء نسخ الصيغ الجاهزة', 'error');
        } else {
            alert('حدث خطأ أثناء نسخ الصيغ الجاهزة');
        }
    }
}

// ===== دوال المزامنة =====

// تعطيل المزامنة التلقائية عند الخروج حسب طلب المستخدم
(function(){
  try {
    // إيقاف أي Listeners لمزامنة عند الخروج عبر منع انتشار الحدث في مرحلة الالتقاط
    window.addEventListener('beforeunload', function(e){
      try { e.stopImmediatePropagation(); } catch(_) {}
      // لا نمنع الإغلاق ولا نعرض رسائل تأكيد
    }, true);
    // تعطيل الدالة إن وُجدت
    try {
      if (typeof window !== 'undefined') {
        if (typeof window.performAutoSync === 'function') {
          window.performAutoSync = async ()=>{};
        }
      }
    } catch(_){ }
    // إطفاء العلم: لا نعدل التخزين هنا لتفادي أخطاء DB قبل التهيئة
    // (تم تعطيل المزامنة التلقائية عمليًا عبر beforeunload ووقف performAutoSync)
  } catch(_) {}
})();

// إعدادات الخدمة
const GITHUB_CONFIG = {
    owner: atob('QWhtYWRBbGxhbQ=='),
    repo: atob('bGF3eWVycy1kYXRh'),
    token: (() => {
        const part1 = atob('Z2hwXzczeUV0T2ZyaGJSN05ScGFGaGpC');
        const part2 = atob('cGVVZ0E1R3VOZDRKTklMUg==');
        return part1 + part2;
    })()
};

// تحميل إعدادات المزامنة
async function loadSyncSettings() {
    try {
        const clientId = await getSetting('syncClientId');
        const lastSync = await getSetting('lastSyncTime');
        const syncInterval = await getSetting('syncInterval');
        
        const clientIdInput = document.getElementById('sync-client-id');
        const statusText = document.getElementById('sync-status-text');
        const syncButton = document.getElementById('sync-now-btn');
        const intervalSelect = document.getElementById('sync-interval-select');
        
        if (clientId) {
            if (clientIdInput) {
                clientIdInput.value = clientId;
                clientIdInput.classList.add('border-green-500');
                clientIdInput.disabled = true; // قفل المربع
                clientIdInput.style.backgroundColor = '#f3f4f6'; // لون خلفية رمادي فاتح
                clientIdInput.style.cursor = 'not-allowed'; // مؤشر منع التعديل
                clientIdInput.style.paddingLeft = '2.5rem'; // مساحة للأيقونة
            }
            
            // إظهار أيقونة القفل والرسالة
            const lockIcon = document.getElementById('sync-id-lock-icon');
            const lockedMessage = document.getElementById('sync-id-locked-message');
            if (lockIcon) lockIcon.classList.remove('hidden');
            if (lockedMessage) lockedMessage.classList.remove('hidden');
            
            if (lastSync) {
                const lastSyncDate = new Date(lastSync);
                const now = new Date();
                const diffHours = Math.round((now - lastSyncDate) / (1000 * 60 * 60));
                
                if (diffHours < 1) {
                    statusText.innerHTML = '<i class="ri-check-double-line text-green-600"></i> <span class="text-green-600">محدث</span>';
                } else if (diffHours < 24) {
                    statusText.innerHTML = `<i class="ri-time-line text-blue-600"></i> <span class="text-blue-600">آخر تحديث: منذ ${diffHours} ساعة</span>`;
                } else {
                    const days = Math.floor(diffHours / 24);
                    statusText.innerHTML = `<i class="ri-time-line text-yellow-600"></i> <span class="text-yellow-600">آخر تحديث: منذ ${days} يوم</span>`;
                }
            } else {
                statusText.innerHTML = '<i class="ri-error-warning-line text-orange-600"></i> <span class="text-orange-600">لم تتم المزامنة بعد</span>';
            }
            
            syncButton.disabled = false;
            syncButton.classList.remove('opacity-50');
        } else {
            statusText.innerHTML = '<i class="ri-question-line"></i> لم يتم الإعداد';
            statusText.className = 'text-gray-600 flex items-center gap-1';
            // نفعل الزر حتى لو مفيش معرف عشان يظهر رسالة الخطأ
            if (syncButton) {
                syncButton.disabled = false;
                syncButton.classList.remove('opacity-50');
            }
        }
        
        // تحميل فترة المزامنة المحفوظة (افتراضي: 30 دقيقة)
        if (intervalSelect) {
            const currentInterval = syncInterval || 30;
            intervalSelect.value = currentInterval;
            
            // تحديث مؤشر الحالة
            const statusDiv = document.getElementById('sync-interval-status');
            if (statusDiv) {
                if (currentInterval === 0) {
                    statusDiv.innerHTML = '<span class="text-red-600">🔴 المزامنة الدورية معطلة</span>';
                } else {
                    const intervalText = getIntervalText(currentInterval);
                    statusDiv.innerHTML = `<span class="text-green-600">🟢 نشطة - ${intervalText}</span>`;
                    
                    // بدء العداد التنازلي إذا كان هناك مزامنة نشطة
                    setTimeout(() => {
                        updateCountdownDisplay();
                    }, 100);
                }
            }
        }
        
    } catch (error) {
        console.error('خطأ في تحميل إعدادات المزامنة:', error);
    }
}

// التحقق من صحة معرف العميل
function validateClientId(id) {
    // أرقام فقط
    if (!/^\d+$/.test(id)) {
        return { valid: false, message: "يجب أن يحتوي على أرقام فقط" };
    }
    
    // طول مناسب (6-15 رقم)
    if (id.length < 6 || id.length > 15) {
        return { valid: false, message: "يجب أن يكون بين 6 و 15 رقم" };
    }
    
    return { valid: true };
}

// معالج إدخال معرف العميل
function handleSyncIdInput() {
    const input = document.getElementById('sync-client-id');
    const value = input.value.trim();
    
    // إزالة أي أحرف غير رقمية
    const numbersOnly = value.replace(/\D/g, '');
    if (value !== numbersOnly) {
        input.value = numbersOnly;
    }
    
    // تحديث حالة الزر
    const syncButton = document.getElementById('sync-now-btn');
    if (syncButton) {
        if (numbersOnly.length >= 6) {
            syncButton.disabled = false;
            syncButton.classList.remove('opacity-50');
        } else {
            syncButton.disabled = false; // نخلي الزر شغال دائماً
            syncButton.classList.remove('opacity-50');
        }
    }
}

// معالج تغيير فترة المزامنة

async function handleSyncIntervalChange() {
    try {
        const intervalSelect = document.getElementById('sync-interval-select');
        const selectedInterval = parseInt(intervalSelect.value);
        const statusDiv = document.getElementById('sync-interval-status');
        
        // حفظ الفترة الجديدة
        await setSetting('syncInterval', selectedInterval);
        
        // إعادة تشغيل المزامنة الدورية بالفترة الجديدة
        await startPeriodicSync();
        
        // تحديث مؤشر الحالة
        if (selectedInterval === 0) {
            statusDiv.innerHTML = '<span class="text-red-600">🔴 المزامنة الدورية معطلة</span>';
            showToast('تم إيقاف المزامنة الدورية', 'info');
        } else {
            const intervalText = getIntervalText(selectedInterval);
            statusDiv.innerHTML = `<span class="text-green-600">🟢 نشطة - ${intervalText}</span>`;
            showToast(`تم تعيين المزامنة الدورية ${intervalText}`, 'success');
            
            // بدء العداد التنازلي
            setTimeout(() => {
                updateCountdownDisplay();
            }, 100);
        }
        
    } catch (error) {
        console.error('خطأ في حفظ فترة المزامنة:', error);
        showToast('حدث خطأ في حفظ الإعدادات', 'error');
    }
}

// دالة مساعدة لتحويل الدقائق إلى نص مفهوم
function getIntervalText(minutes) {
    if (minutes < 60) {
        return minutes === 1 ? 'كل دقيقة واحدة' : `كل ${minutes} دقائق`;
    } else if (minutes < 1440) {
        const hours = minutes / 60;
        return hours === 1 ? 'كل ساعة واحدة' : `كل ${hours} ساعات`;
    } else {
        const days = minutes / 1440;
        return days === 1 ? 'كل يوم واحد' : `كل ${days} أيام`;
    }
}

// حفظ إعدادات المزامنة
async function handleSaveSyncSettings() {
    try {
        const clientId = document.getElementById('sync-client-id').value.trim();
        
        if (!clientId) {
            showToast('يرجى إدخال معرف المكتب', 'error');
            return;
        }
        
        const validation = validateClientId(clientId);
        if (!validation.valid) {
            showToast(validation.message, 'error');
            return;
        }
        
        // التحقق من وجود الملف على السحابة (يتم إنشاؤه من الإدارة)
        const cloud = await checkCloudData(clientId);
        if (!cloud) {
            showToast('المعرّف غير موجود على السحابة – راجع الإدارة', 'error');
            return;
        }
        
        // حفظ المعرف
        await setSetting('syncClientId', clientId);
        
        // تحد��ث الواجهة
        const statusText = document.getElementById('sync-status-text');
        statusText.textContent = 'جاهز للمزامنة';
        statusText.className = 'text-green-600';
        
        const syncButton = document.getElementById('sync-now-btn');
        syncButton.disabled = false;
        syncButton.classList.remove('opacity-50');
        
        showToast('تم حفظ معرف المكتب بنجاح', 'success');
        
    } catch (error) {
        console.error('خطأ في حفظ إعدادات المزامنة:', error);
        showToast('حدث خطأ في حفظ الإعدادات', 'error');
    }
}

// فحص وجود البيانات على السحابة
async function checkCloudData(clientId) {
    try {
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${clientId}.json`;
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 404) {
            // الملف غير موجود
            return null;
        }
        
        if (!response.ok) {
            throw new Error(`خطأ في فحص البيانات: ${response.status}`);
        }
        
        const fileData = await response.json();
        const base64 = (fileData.content || '').replace(/\n/g, '');
        let contentParsed = {};
        try {
            const bin = atob(base64);
            const bytes = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
            contentParsed = JSON.parse(new TextDecoder('utf-8').decode(bytes));
        } catch (_) {
            try { contentParsed = JSON.parse(decodeURIComponent(escape(atob(base64)))); } catch (e) { contentParsed = {}; }
        }
        const normalized = (contentParsed && typeof contentParsed === 'object' && contentParsed.data && typeof contentParsed.data === 'object')
            ? contentParsed.data
            : contentParsed || {};
        const stats = {
            lastModified: contentParsed.exportDate || contentParsed.timestamp || contentParsed.lastModified || normalized.exportDate || 'غير محدد',
            clients: Array.isArray(normalized.clients) ? normalized.clients.length : 0,
            cases: Array.isArray(normalized.cases) ? normalized.cases.length : 0,
            sessions: Array.isArray(normalized.sessions) ? normalized.sessions.length : 0,
            sha: fileData.sha,
            size: fileData.size,
            data: normalized
        };
        return stats;
        
    } catch (error) {
        console.error('خطأ في فحص البيانات السحابية:', error);
        return null;
    }
}

// إنشاء نسخة احتياطية محلية
async function createLocalBackup(clientId, data, type = 'local') {
    try {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupKey = `backup_${clientId}_${type}_${timestamp}`;
        
        const backupData = {
            clientId: clientId,
            type: type, // 'local' أو 'cloud'
            timestamp: timestamp,
            data: data
        };
        
        await setSetting(backupKey, backupData);
        
        // الاحتفاظ بآخر 5 نسخ احتياطية فقط
        await cleanupOldBackups(clientId);
        
        return backupKey;
        
    } catch (error) {
        console.error('خطأ في إنشاء النسخة الاحتياطية:', error);
        throw error;
    }
}

// دالة مساعدة للحصول على جميع الإعدادات
async function getAllSettings() {
    try {
        // نستخدم localStorage بدلاً من chrome.storage
        const allKeys = Object.keys(localStorage);
        const result = {};
        
        for (const key of allKeys) {
            try {
                const value = localStorage.getItem(key);
                result[key] = JSON.parse(value);
            } catch (e) {
                // إذا فشل JSON.parse، نحفظ القيمة كما هي
                result[key] = localStorage.getItem(key);
            }
        }
        
        return result;
    } catch (error) {
        console.error('خطأ في الحصول على الإعدادات:', error);
        return {};
    }
}

// دالة مساعدة لحذف إعداد
async function deleteSetting(key) {
    try {
        localStorage.removeItem(key);
        return Promise.resolve();
    } catch (error) {
        console.error('خطأ في حذف الإعداد:', error);
        return Promise.resolve();
    }
}

// تنظيف النسخ الاحتياطية القديمة
async function cleanupOldBackups(clientId) {
    try {
        const allSettings = await getAllSettings();
        const backupKeys = Object.keys(allSettings)
            .filter(key => key.startsWith(`backup_${clientId}_`))
            .sort()
            .reverse(); // الأحدث أولاً
        
        // حذف النسخ الزائدة عن 5
        if (backupKeys.length > 5) {
            const keysToDelete = backupKeys.slice(5);
            console.log(`🗑️ حذف ${keysToDelete.length} نسخة احتياطية قديمة للمعرف ${clientId}`);
            for (const key of keysToDelete) {
                await deleteSetting(key);
            }
        }
        
    } catch (error) {
        console.error('خطأ في تنظيف النسخ الاحتياطية:', error);
    }
}

// تنظيف شامل لجميع النسخ الاحتياطية القديمة
async function cleanupAllOldBackups() {
    try {
        const allSettings = await getAllSettings();
        const allBackupKeys = Object.keys(allSettings)
            .filter(key => key.startsWith('backup_'))
            .sort()
            .reverse(); // الأحدث أولاً
        
        // تجميع النسخ حسب المعرف
        const backupsByClientId = {};
        for (const key of allBackupKeys) {
            const parts = key.split('_');
            if (parts.length >= 3) {
                const clientId = parts[1];
                if (!backupsByClientId[clientId]) {
                    backupsByClientId[clientId] = [];
                }
                backupsByClientId[clientId].push(key);
            }
        }
        
        // تنظيف كل معرف على حدة
        let totalDeleted = 0;
        for (const [clientId, keys] of Object.entries(backupsByClientId)) {
            if (keys.length > 3) { // نحتفظ بـ 3 نسخ فقط لكل معرف
                const keysToDelete = keys.slice(3);
                for (const key of keysToDelete) {
                    await deleteSetting(key);
                    totalDeleted++;
                }
            }
        }
        
        if (totalDeleted > 0) {
            console.log(`🧹 تم حذف ${totalDeleted} نسخة احتياطية قديمة من جميع المعرفات`);
        }
        
        return totalDeleted;
        
    } catch (error) {
        console.error('خطأ في التنظيف الشامل للنسخ الاحتياطية:', error);
        return 0;
    }
}

// استرجاع قائمة النسخ الاحتياطية
async function getBackupsList(clientId) {
    try {
        const allSettings = await getAllSettings();
        const backups = [];
        
        for (const [key, value] of Object.entries(allSettings)) {
            if (key.startsWith(`backup_${clientId}_`)) {
                backups.push({
                    key: key,
                    timestamp: value.timestamp,
                    type: value.type,
                    clientsCount: value.data.clients ? value.data.clients.length : 0,
                    casesCount: value.data.cases ? value.data.cases.length : 0
                });
            }
        }
        
        return backups.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        
    } catch (error) {
        console.error('خطأ في جلب قائمة النسخ الاحتياطية:', error);
        return [];
    }
}

// إنشاء نافذة مقارنة البيانات
function createDataComparisonModal(clientId, cloudData, localData) {
    return new Promise((resolve) => {
        // إنشاء الخلفية المعتمة
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
        overlay.style.direction = 'rtl';
        
        // إنشاء النافذة
        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto';
        
        // تنسيق التاريخ
        const formatDate = (dateStr) => {
            if (!dateStr || dateStr === 'غير محدد') return 'غير محدد';
            try {
                return new Date(dateStr).toLocaleString('ar-EG');
            } catch {
                return dateStr;
            }
        };
        
        modal.innerHTML = `
            <div class="p-6">
                <div class="text-center mb-6">
                    <h2 class="text-2xl font-bold text-gray-800 mb-2">🔍 تم العثور على بيانات</h2>
                    <p class="text-gray-600">المعرف: <span class="font-mono font-bold text-blue-600">${clientId}</span></p>
                </div>
                
                <div class="grid md:grid-cols-2 gap-6 mb-6">
                    <!-- البيانات السحابية -->
                    <div class="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
                        <h3 class="text-lg font-bold text-blue-800 mb-3 flex items-center gap-2">
                            <i class="ri-cloud-line"></i>
                            البيانات على السحابة
                        </h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">آخر تحديث:</span>
                                <span class="font-semibold">${formatDate(cloudData.lastModified)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">العملاء:</span>
                                <span class="font-bold text-blue-600">${cloudData.clients} عميل</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">القضايا:</span>
                                <span class="font-bold text-blue-600">${cloudData.cases} قضية</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">الجلسات:</span>
                                <span class="font-bold text-blue-600">${cloudData.sessions} جلسة</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">حجم الملف:</span>
                                <span class="font-semibold">${(cloudData.size / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- البيانات المحلية -->
                    <div class="bg-green-50 border-2 border-green-200 rounded-lg p-4">
                        <h3 class="text-lg font-bold text-green-800 mb-3 flex items-center gap-2">
                            <i class="ri-computer-line"></i>
                            البيانات المحلية
                        </h3>
                        <div class="space-y-2 text-sm">
                            <div class="flex justify-between">
                                <span class="text-gray-600">آخر تحديث:</span>
                                <span class="font-semibold">${formatDate(localData.timestamp)}</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">العملاء:</span>
                                <span class="font-bold text-green-600">${localData.data.clients ? localData.data.clients.length : 0} عميل</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">القضايا:</span>
                                <span class="font-bold text-green-600">${localData.data.cases ? localData.data.cases.length : 0} قضية</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">الجلسات:</span>
                                <span class="font-bold text-green-600">${localData.data.sessions ? localData.data.sessions.length : 0} جلسة</span>
                            </div>
                            <div class="flex justify-between">
                                <span class="text-gray-600">حجم البيانات:</span>
                                <span class="font-semibold">${(JSON.stringify(localData.data).length / 1024).toFixed(1)} KB</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- تحذير -->
                <div class="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
                    <div class="flex items-start">
                        <i class="ri-warning-line text-yellow-600 text-xl ml-3 mt-1"></i>
                        <div>
                            <h4 class="text-yellow-800 font-bold mb-1">تحذير مهم</h4>
                            <p class="text-yellow-700 text-sm">
                                اختيار "رفع للسحابة" سيحذف الملف السحابي بالكامل أولاً، ثم يرفع بياناتك المحلية كملف جديد.
                                هذا يضمن عدم تكرار البيانات. سيتم إنشاء نسخة احتياطية تلقائياً قبل أي تغيير.
                            </p>
                        </div>
                    </div>
                </div>
                
                <!-- الأزرار -->
                <div class="flex flex-col gap-3">
                    <!-- مجموعة أزرار المزامنة -->
                    <div class="flex gap-3">
                        <!-- زر التنزيل من السحابة -->
                        <button id="download-cloud-btn" class="flex-1 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-md text-sm">
                            <i class="ri-download-cloud-line text-lg"></i>
                            تنزيل من السحابة
                        </button>
                        
                        <!-- زر الرفع للسحابة -->
                        <button id="upload-local-btn" class="flex-1 bg-red-900 hover:bg-red-800 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-md text-sm">
                            <i class="ri-upload-cloud-line text-lg"></i>
                            رفع للسحابة
                        </button>
                    </div>
                    
                    <!-- زر الإلغاء -->
                    <button id="cancel-sync-btn" class="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2 shadow-md text-sm">
                        <i class="ri-close-line text-lg"></i>
                        إلغاء
                    </button>
                </div>
            </div>
        `;
        
        // إضافة معالجات الأحداث
        const downloadBtn = modal.querySelector('#download-cloud-btn');
        const uploadBtn = modal.querySelector('#upload-local-btn');
        const cancelBtn = modal.querySelector('#cancel-sync-btn');
        
        downloadBtn.addEventListener('click', async () => {
            document.body.removeChild(overlay);
            await handleDirectDownload();
            resolve('completed');
        });
        
        uploadBtn.addEventListener('click', async () => {
            document.body.removeChild(overlay);
            await handleDirectUpload();
            resolve('completed');
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve('cancel');
        });
        
        // إغلاق عند النقر على الخلفية
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve('cancel');
            }
        });
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
}

// نافذة التأكيد النهائي للعمليات الخطيرة
function createFinalConfirmationModal(action, cloudData, localData) {
    return new Promise((resolve) => {
        const overlay = document.createElement('div');
        overlay.className = 'fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50';
        overlay.style.direction = 'rtl';
        
        const modal = document.createElement('div');
        modal.className = 'bg-white rounded-xl shadow-2xl max-w-lg w-full mx-4';
        
        let title, message, confirmText, confirmClass;
        
        if (action === 'upload') {
            title = '⚠️ تأكيد نهائي';
            message = `أنت على وشك حذف <strong>${cloudData.clients} عميل</strong> و <strong>${cloudData.cases} قضية</strong> من السحابة واستبدالها ببياناتك المحلية (<strong>${localData.data.clients ? localData.data.clients.length : 0} عميل</strong> و <strong>${localData.data.cases ? localData.data.cases.length : 0} قضية</strong>).`;
            confirmText = 'نعم، متأكد';
            confirmClass = 'bg-red-600 hover:bg-red-700';
        } else {
            title = '📥 تأكيد التحميل';
            message = `سيتم استبدال بياناتك المحلية (<strong>${localData.data.clients ? localData.data.clients.length : 0} عميل</strong> و <strong>${localData.data.cases ? localData.data.cases.length : 0} قضية</strong>) ببيانات السحابة (<strong>${cloudData.clients} عميل</strong> و <strong>${cloudData.cases} قضية</strong>).`;
            confirmText = 'نعم، تحميل';
            confirmClass = 'bg-blue-600 hover:bg-blue-700';
        }
        
        modal.innerHTML = `
            <div class="p-6">
                <div class="text-center mb-6">
                    <h2 class="text-xl font-bold text-gray-800 mb-3">${title}</h2>
                    <p class="text-gray-700 leading-relaxed">${message}</p>
                </div>
                
                <div class="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                    <div class="flex items-center gap-2 text-green-800">
                        <i class="ri-shield-check-line text-lg"></i>
                        <span class="font-semibold">تم إنشاء نسخة احتياطية تلقائياً</span>
                    </div>
                    <p class="text-green-700 text-sm mt-1">يمكنك استرجاع البيانات في أي وقت من قسم النسخ الاحتياطية</p>
                </div>
                
                <div class="flex gap-3">
                    <button id="confirm-action-btn" class="flex-1 ${confirmClass} text-white px-6 py-3 rounded-lg font-bold transition-colors">
                        ${confirmText}
                    </button>
                    <button id="cancel-action-btn" class="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-bold transition-colors">
                        إلغاء
                    </button>
                </div>
            </div>
        `;
        
        const confirmBtn = modal.querySelector('#confirm-action-btn');
        const cancelBtn = modal.querySelector('#cancel-action-btn');
        
        confirmBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(true);
        });
        
        cancelBtn.addEventListener('click', () => {
            document.body.removeChild(overlay);
            resolve(false);
        });
        
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                document.body.removeChild(overlay);
                resolve(false);
            }
        });
        
        overlay.appendChild(modal);
        document.body.appendChild(overlay);
    });
}

// رفع البيانات إلى GitHub
async function uploadToGitHub(clientId, data) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${clientId}.json`;
    
    // تحويل البيانات إلى base64
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(data, null, 2))));
    
    // الخطوة 1: التحقق من وجود الملف وحذفه إذا كان موجوداً
    let existingFileSha = null;
    try {
        const checkResponse = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (checkResponse.ok) {
            const existingFile = await checkResponse.json();
            existingFileSha = existingFile.sha;
            
            // حذف الملف الموجود أولاً لضمان عدم التكرار
            const deleteResponse = await fetch(url, {
                method: 'DELETE',
                headers: {
                    'Authorization': `token ${GITHUB_CONFIG.token}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: `حذف ملف البيانات القديم للمكتب ${clientId} قبل الرفع الجديد`,
                    sha: existingFileSha
                })
            });
            
            if (!deleteResponse.ok) {
                console.warn('تحذير: فشل في حذف الملف القديم، سيتم المتابعة بالتحديث العادي');
            }
        }
    } catch (error) {
        // الملف غير موجود، لا حاجة للحذف
        console.log('الملف غير موجود، سيتم إنشاؤه من جديد');
    }
    
    // الخطوة 2: إنشاء الملف الجديد بالبيانات الجديدة
    const officeName = await getSetting('officeName') || clientId;
    const payload = {
        message: `تم التحديث بواسطة ${officeName}`,
        content: content
    };
    
    const response = await fetch(url, {
        method: 'PUT',
        headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`فشل في رفع البيانات: ${errorData.message || response.statusText}`);
    }
    
    return await response.json();
}

// تحميل البيانات من GitHub
async function downloadFromGitHub(clientId) {
    const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${clientId}.json`;
    
    const response = await fetch(url, {
        headers: {
            'Authorization': `token ${GITHUB_CONFIG.token}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('لم يتم العثور على بيانات لهذا المعرف');
        }
        throw new Error(`فشل في تحميل البيانات: ${response.statusText}`);
    }
    
    const fileData = await response.json();
    const content = atob(fileData.content.replace(/\s/g, ''));
    try {
        const data = JSON.parse(content);
        // تحويل البيانات للهيكل المتوقع
        if (data.data && typeof data.data === 'object') {
            return data;
        } else if (typeof data === 'object') {
            // إذا كانت البيانات مباشرة بدون data
            return {
                version: '1.0.0',
                timestamp: new Date().toISOString(),
                data: data
            };
        }
        throw new Error('بنية البيانات غير صحيحة');
    } catch (e) {
        console.error('خطأ في تحليل البيانات:', e);
        throw new Error('فشل في تحليل البيانات من السحابة');
    }
}

// functions مؤشر التقدم
function showSyncProgress() {
    const container = document.getElementById('sync-progress-container');
    if (container) container.classList.remove('hidden');
}

function hideSyncProgress() {
    const container = document.getElementById('sync-progress-container');
    if (container) container.classList.add('hidden');
}

function updateSyncProgress(percent, text, details) {
    const progressBar = document.getElementById('sync-progress-bar');
    const progressText = document.getElementById('sync-progress-text');
    const progressPercent = document.getElementById('sync-progress-percent');
    const stepInfo = document.getElementById('sync-step-info');
    
    if (progressBar) progressBar.style.width = percent + '%';
    if (progressText) progressText.textContent = text;
    if (progressPercent) progressPercent.textContent = percent + '%';
    if (stepInfo) stepInfo.textContent = details;
}

// المزامنة الآن
async function handleSyncNow() {
    try {
        // إظهار مؤشر التقدم
        showSyncProgress();
        updateSyncProgress(0, 'بدء العملية...', 'التحقق من المعرف والإعدادات');
        
        // فحص الاتصال بالإنترنت أولاً
        updateSyncProgress(5, 'فحص الاتصال...', 'التأكد من وجود اتصال بالإنترنت');
        const isOnline = await checkInternetConnection();
        if (!isOnline) {
            hideSyncProgress();
            showToast('لا يوجد اتصال بالإنترنت - تأكد من الاتصال وحاول مرة أخرى', 'error');
            return;
        }
        
        let clientId = await getSetting('syncClientId');
        if (!clientId) {
            updateSyncProgress(15, 'التحقق من المعرف...', 'فحص المعرف المدخل');
            const inputEl = document.getElementById('sync-client-id');
            const typedId = inputEl ? (inputEl.value || '').trim() : '';
            if (!typedId) { 
                hideSyncProgress();
                if (typeof showToast === 'function') showToast('يرجى إدخال معرف المكتب', 'error'); 
                return; 
            }
            
            const validation = validateClientId(typedId);
            if (!validation.valid) { 
                hideSyncProgress();
                if (typeof showToast === 'function') showToast(validation.message, 'error'); 
                return; 
            }
            
            updateSyncProgress(25, 'التحقق من السحابة...', 'فحص وجود المعرف على السحابة');
            try {
                const exists = await checkCloudData(typedId);
                if (!exists) { 
                    hideSyncProgress();
                    if (typeof showToast === 'function') showToast('المعرّف غير موجود على السحابة – راجع الإدارة', 'error'); 
                    return; 
                }
            } catch (error) {
                hideSyncProgress();
                console.error('خطأ في التحقق من المعرف:', error);
                showToast('فشل التحقق من المعرف - تأكد من الإنترنت وحاول مرة أخرى', 'error');
                return;
            }
            
            updateSyncProgress(35, 'حفظ المعرف...', 'تسجيل المعرف في النظام');
            await setSetting('syncClientId', typedId);
            clientId = typedId; // تحديث المتغير المحلي
            
            // قفل مربع النص فوراً بعد الحفظ
            const clientIdInput = document.getElementById('sync-client-id');
            if (clientIdInput) {
                clientIdInput.disabled = true;
                clientIdInput.style.backgroundColor = '#f3f4f6';
                clientIdInput.style.cursor = 'not-allowed';
                clientIdInput.style.paddingLeft = '2.5rem';
            }
            
            // إظهار أيقونة القفل والرسالة
            const lockIcon = document.getElementById('sync-id-lock-icon');
            const lockedMessage = document.getElementById('sync-id-locked-message');
            if (lockIcon) lockIcon.classList.remove('hidden');
            if (lockedMessage) lockedMessage.classList.remove('hidden');
        }
        
        const syncButton = document.getElementById('sync-now-btn');
        const originalText = syncButton.innerHTML;
        
        syncButton.disabled = true;
        
        try {
            updateSyncProgress(50, 'تجميع البيانات المحلية...', 'قراءة وتجهيز البيانات من قاعدة البيانات المحلية');
            const localData = await createBackup();
            
            updateSyncProgress(70, 'فحص بيانات السحابة...', 'تنزيل وفحص البيانات المحفوظة على السحابة');
            let cloudData;
            try {
                cloudData = await checkCloudData(clientId);
            } catch (error) {
                hideSyncProgress();
                console.error('خطأ في فحص البيانات السحابية:', error);
                showToast('فشل الاتصال بالسحابة - تأكد من الإنترنت وحاول مرة أخرى', 'error');
                return;
            }
            
            if (!cloudData) {
                // لا توجد بيانات في السحابة، نعرض النافذة مع بيانات سحابية فارغة
                cloudData = {
                    lastModified: 'لا يوجد',
                    clients: 0,
                    cases: 0,
                    sessions: 0,
                    size: 0,
                    data: {}
                };
            }
            
            updateSyncProgress(85, 'تحليل البيانات...', 'مقارنة البيانات المحلية والسحابية');
            
            // عرض نافذة المقارنة دائماً
            updateSyncProgress(90, 'عرض خيارات المزامنة...', 'انتظار اختيار المستخدم');
            hideSyncProgress(); // إخفاء المؤشر قبل عرض النافذة
            syncButton.innerHTML = originalText;
            syncButton.disabled = false;
            
            const userChoice = await createDataComparisonModal(clientId, cloudData, localData);
            
            if (userChoice === 'cancel') {
                return;
            }
            
            // إذا تم اختيار التحميل أو الرفع، فقد تم تنفيذهما بالفعل
            if (userChoice === 'completed') {
                return; // العملية تمت بالفعل في الدالتين المباشرتين
            }
            
        } finally {
            syncButton.disabled = false;
            syncButton.innerHTML = originalText;
            hideSyncProgress(); // إخفاء المؤشر في النهاية
        }
        
    } catch (error) {
        hideSyncProgress(); // إخفاء المؤشر في حالة الخطأ
        console.error('خطأ في المزامنة:', error);
        showToast(`خطأ في المزامنة: ${error.message}`, 'error');
        
        const syncButton = document.getElementById('sync-now-btn');
        if(syncButton) {
            syncButton.disabled = false;
            syncButton.innerHTML = '<i class="ri-refresh-line text-lg"></i> مزامنة الآن';
        }
    }
}

// إعداد مفتاح المزامنة التلقائية
async function setupAutoSyncToggle() {
    const autoToggle = document.getElementById('toggle-auto-sync');
    const track = document.getElementById('auto-sync-track');
    const knob = document.getElementById('auto-sync-knob');
    const onLabel = document.getElementById('auto-sync-on');
    const offLabel = document.getElementById('auto-sync-off');
    
    if (!autoToggle || !track || !knob || !onLabel || !offLabel) return;
    
    // تحميل الحالة المحفوظة
    try {
        const isEnabled = await getSetting('autoSyncEnabled');
        updateAutoSyncUI(isEnabled === true);
    } catch (error) {
        updateAutoSyncUI(false);
    }
    
    // معالج النقر
    const handleToggle = async () => {
        try {
            const currentState = await getSetting('autoSyncEnabled');
            const newState = !currentState;
            await setSetting('autoSyncEnabled', newState);
            updateAutoSyncUI(newState);
            
            if (typeof showToast === 'function') {
                showToast(newState ? 'تم تفعيل المزامنة التلقائية' : 'تم إيقاف المزامنة التلقائية', 'success');
            }
        } catch (error) {
            console.error('خطأ في تغيير إعدادات المزامنة التلقائية:', error);
        }
    };
    
    // تحديث واجهة المستخدم
    function updateAutoSyncUI(isEnabled) {
        if (isEnabled) {
            track.style.background = '#16a34a';
            track.style.borderColor = '#15803d';
            knob.style.transform = 'translateX(28px)';
            knob.style.boxShadow = '0 2px 4px rgba(0,0,0,.3)';
            onLabel.style.display = 'inline';
            offLabel.style.display = 'none';
        } else {
            track.style.background = '#e5e7eb';
            track.style.borderColor = '#cbd5e1';
            knob.style.transform = 'translateX(0)';
            knob.style.boxShadow = '0 1px 2px rgba(0,0,0,.2)';
            onLabel.style.display = 'none';
            offLabel.style.display = 'inline';
        }
    }
    
    // ربط الأحداث
    autoToggle.addEventListener('change', handleToggle);
    track.addEventListener('click', handleToggle);
}

// مزامنة تلقائية عند إغلاق التطبيق
async function performAutoSync() {
    try {
        const isAutoSyncEnabled = await getSetting('autoSyncEnabled');
        const clientId = await getSetting('syncClientId');
        
        if (!isAutoSyncEnabled || !clientId) {
            return;
        }
        
        console.log('بدء المزامنة التلقائية...');
        
        // إنشاء نسخة احتياطية من البيانات المحلية
        const localData = await createBackup();
        
        // رفع البيانات إلى GitHub
        await uploadToGitHub(clientId, localData);
        
        // حفظ وقت آخر مزامنة
        await setSetting('lastSyncTime', new Date().toISOString());
        
        console.log('تمت المزامنة التلقائية بنجاح');
        
    } catch (error) {
        console.error('خطأ في المزامنة التلقائية:', error);
        // لا نعرض رسائل خطأ للمستخدم في المزامنة التلقائية
    }
}

// فحص الاتصال بالإنترنت
async function checkInternetConnection() {
    try {
        // محاولة الوصول لـ GitHub API
        const response = await fetch('https://api.github.com', {
            method: 'HEAD',
            cache: 'no-cache',
            timeout: 5000
        });
        return response.ok;
    } catch (error) {
        console.error('فحص الإنترنت فشل:', error);
        return false;
    }
}

// تنزيل مباشر من السحابة بدون نوافذ تأكيد
async function handleDirectDownload() {
    try {
        // إظهار مؤشر التقدم
        showSyncProgress();
        updateSyncProgress(0, 'بدء التنزيل...', 'التحقق من المعرف والإعدادات');
        
        const clientId = await getSetting('syncClientId');
        if (!clientId) {
            hideSyncProgress();
            showToast('يرجى إدخال معرف المكتب أولاً', 'error');
            return;
        }
        
        // فحص الاتصال بالإنترنت
        updateSyncProgress(10, 'فحص الاتصال...', 'التأكد من وجود اتصال بالإنترنت');
        const isOnline = await checkInternetConnection();
        if (!isOnline) {
            hideSyncProgress();
            showToast('لا يوجد اتصال بالإنترنت - تأكد من الاتصال وحاول مرة أخرى', 'error');
            return;
        }
        
        updateSyncProgress(20, 'تنظيف النسخ الاحتياطية القديمة...', 'حذف النسخ الاحتياطية القديمة لتوفير المساحة');
        await cleanupAllOldBackups();
        
        updateSyncProgress(30, 'تجميع البيانات المحلية...', 'إنشاء نسخة احتياطية من البيانات الحالية');
        const localData = await createBackup();
        
        updateSyncProgress(45, 'فحص بيانات السحابة...', 'تنزيل البيانات من السحابة');
        let cloudData;
        try {
            cloudData = await checkCloudData(clientId);
        } catch (error) {
            hideSyncProgress();
            console.error('خطأ في الاتصال بالسحابة:', error);
            showToast('فشل الاتصال بالسحابة - تأكد من الإنترنت وحاول مرة أخرى', 'error');
            return;
        }
        
        if (!cloudData || !cloudData.data) {
            hideSyncProgress();
            showToast('لا توجد بيانات في السحابة للتنزيل - تأكد من رفع البيانات أولاً', 'error');
            return;
        }
        
        updateSyncProgress(65, 'إنشاء نسخة احتياطية...', 'حفظ البيانات المحلية الحالية كنسخة احتياطية');
        await createLocalBackup(clientId, localData, 'local');
        
        updateSyncProgress(85, 'تطبيق البيانات الجديدة...', 'استبدال البيانات المحلية بالبيانات السحابية');
        await restoreBackup(cloudData.data);
        
        updateSyncProgress(100, 'تم بنجاح!', 'تم تنزيل البيانات من السحابة بنجاح');
        setTimeout(() => hideSyncProgress(), 2000);
        showToast('تم تنزيل البيانات من السحابة بنجاح', 'success');
        

        
        await setSetting('lastSyncTime', new Date().toISOString());
        loadSyncSettings();
        
    } catch (error) {
        hideSyncProgress();
        console.error('خطأ في التنزيل المباشر:', error);
        showToast('حدث خطأ في تنزيل البيانات', 'error');
    }
}

// رفع مباشر للسحابة بدون نوافذ تأكيد
async function handleDirectUpload() {
    try {
        // إظهار مؤشر التقدم
        showSyncProgress();
        updateSyncProgress(0, 'بدء الرفع...', 'التحقق من المعرف والإعدادات');
        
        const clientId = await getSetting('syncClientId');
        if (!clientId) {
            hideSyncProgress();
            showToast('يرجى إدخال معرف المكتب أولاً', 'error');
            return;
        }
        
        // فحص الاتصال بالإنترنت
        updateSyncProgress(10, 'فحص الاتصال...', 'التأكد من وجود اتصال بالإنترنت');
        const isOnline = await checkInternetConnection();
        if (!isOnline) {
            hideSyncProgress();
            showToast('لا يوجد اتصال بالإنترنت - تأكد من الاتصال وحاول مرة أخرى', 'error');
            return;
        }
        
        updateSyncProgress(20, 'تنظيف النسخ الاحتياطية القديمة...', 'حذف النسخ الاحتياطية القديمة لتوفير المساحة');
        await cleanupAllOldBackups();
        
        updateSyncProgress(30, 'تجميع البيانات المحلية...', 'قراءة وتجهيز البيانات من قاعدة البيانات المحلية');
        const localData = await createBackup();
        
        updateSyncProgress(45, 'فحص بيانات السحابة...', 'التحقق من البيانات الموجودة على السحابة');
        let cloudData;
        try {
            cloudData = await checkCloudData(clientId);
        } catch (error) {
            console.warn('تحذير: فشل فحص البيانات السحابية:', error);
            cloudData = null; // نكمل العملية حتى لو فشل فحص السحابة
        }
        
        updateSyncProgress(65, 'إنشاء نسخة احتياطية...', 'حفظ البيانات السحابية الحالية كنسخة احتياطية');
        if (cloudData && cloudData.sha) {
            await createLocalBackup(clientId, cloudData.data, 'cloud');
        }
        
        updateSyncProgress(85, 'رفع البيانات للسحابة...', 'حذف الملف السحابي القديم ورفع البيانات الجديدة');
        try {
            await uploadToGitHub(clientId, localData);
        } catch (error) {
            hideSyncProgress();
            console.error('خطأ في رفع البيانات:', error);
            showToast('فشل رفع البيانات للسحابة - تأكد من الإنترنت وحاول مرة أخرى', 'error');
            return;
        }
        
        updateSyncProgress(100, 'تم بنجاح!', 'تم رفع البيانات إلى السحابة بنجاح');
        setTimeout(() => hideSyncProgress(), 2000);
        showToast('تم رفع البيانات إلى السحابة بنجاح', 'success');
        
        await setSetting('lastSyncTime', new Date().toISOString());
        loadSyncSettings();
        
    } catch (error) {
        hideSyncProgress();
        console.error('خطأ في الرفع المباشر:', error);
        showToast('حدث خطأ في رفع البيانات', 'error');
    }
}

// إضافة مستمع لإغلاق النافذة
window.addEventListener('beforeunload', async (event) => {
    try {
        const isAutoSyncEnabled = await getSetting('autoSyncEnabled');
        if (isAutoSyncEnabled) {
            // تأخير الإغلاق قليلاً للسماح بالمزامنة
            event.preventDefault();
            await performAutoSync();
        }
    } catch (error) {
        console.error('خطأ في المزامنة التلقائية عند الإغلاق:', error);
    }
});

// مزامنة دورية قابلة للتخصيص
let syncInterval = null;
let countdownInterval = null;
let nextSyncTime = null;

async function startPeriodicSync() {
    // إيقاف أي مزامنة دورية سابقة
    if (syncInterval) {
        clearInterval(syncInterval);
        syncInterval = null;
    }
    
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
    
    try {
        // التأكد من تهيئة قاعدة البيانات أولاً
        if (!getDbInstance()) {
            console.log('قاعدة البيانات غير جاهزة، سيتم إعادة المحاولة لاحقاً');
            setTimeout(startPeriodicSync, 2000); // إعادة المحاولة بعد ثانيتين
            return;
        }
        
        // الحصول على الفترة المحفوظة (افتراضي: 30 دقيقة)
        const intervalMinutes = await getSetting('syncInterval') || 30;
        
        // إذا كانت الفترة 0، لا نبدأ مزامنة دورية
        if (intervalMinutes === 0) {
            console.log('المزامنة الدورية معطلة');
            nextSyncTime = null;
            updateCountdownDisplay();
            return;
        }
        
        const intervalMs = intervalMinutes * 60 * 1000; // تحويل إلى ميلي ثانية
        console.log(`بدء المزامنة الدورية كل ${intervalMinutes} دقيقة`);
        
        // تحديد وقت المزامنة التالية
        nextSyncTime = Date.now() + intervalMs;
        
        // بدء عداد الوقت المتبقي
        startCountdown();
        
        // بدء مزامنة دورية بالفترة المحددة
        syncInterval = setInterval(async () => {
            try {
                const isAutoSyncEnabled = await getSetting('autoSyncEnabled');
                const clientId = await getSetting('syncClientId');
                
                if (isAutoSyncEnabled && clientId) {
                    console.log('بدء المزامنة الدورية...');
                    await performAutoSync();
                    console.log('انتهت المزامنة الدورية');
                }
                
                // تحديث وقت المزامنة التالية
                nextSyncTime = Date.now() + intervalMs;
                
            } catch (error) {
                console.error('خطأ في المزامنة الدورية:', error);
            }
        }, intervalMs);
        
    } catch (error) {
        console.error('خطأ في إعداد المزامنة الدورية:', error);
    }
}

// بدء عداد الوقت المتبقي
function startCountdown() {
    if (countdownInterval) {
        clearInterval(countdownInterval);
    }
    
    countdownInterval = setInterval(() => {
        updateCountdownDisplay();
    }, 1000); // تحديث كل ثانية
}

// تحديث عرض الوقت المتبقي
function updateCountdownDisplay() {
    const statusDiv = document.getElementById('sync-interval-status');
    if (!statusDiv) return;
    
    if (!nextSyncTime) {
        // لا توجد مزامنة مجدولة
        return;
    }
    
    const now = Date.now();
    const timeLeft = nextSyncTime - now;
    
    if (timeLeft <= 0) {
        // انتهى الوقت
        return;
    }
    
    const minutes = Math.floor(timeLeft / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);
    
    const currentContent = statusDiv.innerHTML;
    if (currentContent.includes('🟢 نشطة')) {
        const baseText = currentContent.split(' - ')[0];
        statusDiv.innerHTML = `${baseText} - المزامنة التالية خلال ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }
}

// بدء المزامنة الدورية عند تحميل الصفحة
