function displayLegalLibraryModal() {
    const modalTitle = document.getElementById('modal-title');
    const modalContent = document.getElementById('modal-content');
    
    modalTitle.textContent = 'المكتبة القانونية';
    modalContent.classList.add('search-modal-content');
    
    modalContent.innerHTML = `
        <div class="legal-library-container h-full flex">
            <!-- الشريط الجانبي الأيمن -->
            <div id="legal-sidebar" class="w-80 bg-green-50 border-l border-green-200 flex flex-col">
                <!-- رأس الشريط الجانبي -->
                <div class="p-4 border-b border-green-200 bg-white">
                    <div class="flex items-center justify-center gap-2">
                        <button id="grid-view-btn" class="view-toggle-btn active flex items-center gap-2 px-3 py-2 bg-green-600 text-white rounded-lg text-sm font-medium">
                            <i class="ri-grid-line text-sm"></i>
                            <span>شبكة</span>
                        </button>
                        <button id="list-view-btn" class="view-toggle-btn flex items-center gap-2 px-3 py-2 bg-gray-200 text-gray-600 rounded-lg text-sm font-medium">
                            <i class="ri-list-unordered text-sm"></i>
                            <span>قائمة</span>
                        </button>
                    </div>
                </div>

                <!-- نموذج إنشاء مجلد جديد -->
                <div class="p-4 border-b border-green-200">
                    <div class="bg-white rounded-lg p-4 border border-green-200">
                        <div class="flex items-center gap-2 mb-3">
                            <i class="ri-add-circle-line text-green-600 text-lg"></i>
                            <h3 class="font-semibold text-gray-800 text-sm">إنشاء مجلد جديد</h3>
                        </div>
                        
                        <div class="space-y-3">
                            <input 
                                type="text" 
                                id="folder-name" 
                                placeholder="اسم المجلد الجديد..."
                                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:border-green-400 text-right text-sm transition-all"
                            >
                            <button 
                                id="attach-files-btn" 
                                class="w-full px-4 py-2 bg-green-600 text-white rounded-lg font-medium flex items-center justify-center gap-2 text-sm"
                            >
                                <i class="ri-attachment-2"></i>
                                إنشاء وإرفاق ملفات
                            </button>
                        </div>
                    </div>
                </div>

                <!-- المواقع المهمة -->
                <div class="flex-1 p-4 overflow-y-auto">
                    <div class="bg-white rounded-lg p-4 border border-blue-200">
                        <div class="flex items-center gap-2 mb-4">
                            <i class="ri-download-line text-blue-600 text-lg"></i>
                            <h3 class="font-semibold text-gray-800 text-sm">المواقع المهمة</h3>
                        </div>
                        
                        <div class="grid grid-cols-2 gap-2">
                            <button class="download-site-btn flex flex-col items-center gap-1 px-2 py-2 bg-blue-50 text-blue-800 rounded-lg font-medium border border-blue-200" data-site="1">
                                <i class="ri-book-line text-blue-600 text-base"></i>
                                <span class="text-center text-xs leading-tight">كتب متنوعة</span>
                            </button>
                            
                            <button class="download-site-btn flex flex-col items-center gap-1 px-2 py-2 bg-blue-50 text-blue-800 rounded-lg font-medium border border-blue-200" data-site="2">
                                <i class="ri-book-open-line text-blue-600 text-base"></i>
                                <span class="text-center text-xs leading-tight">كتب أخرى</span>
                            </button>
                            
                            <button class="download-site-btn flex flex-col items-center gap-1 px-2 py-2 bg-purple-50 text-purple-800 rounded-lg font-medium border border-purple-200" data-site="3">
                                <i class="ri-robot-line text-purple-600 text-base"></i>
                                <span class="text-center text-xs leading-tight">الذكاء الاصطناعي</span>
                            </button>
                            
                            <button class="download-site-btn flex flex-col items-center gap-1 px-2 py-2 bg-red-50 text-red-800 rounded-lg font-medium border border-red-200" data-site="4">
                                <i class="ri-government-line text-red-600 text-base"></i>
                                <span class="text-center text-xs leading-tight">وزارة العدل</span>
                            </button>
                            
                            <button class="download-site-btn flex flex-col items-center gap-1 px-2 py-2 bg-indigo-50 text-indigo-800 rounded-lg font-medium border border-indigo-200" data-site="5">
                                <i class="ri-smartphone-line text-indigo-600 text-base"></i>
                                <span class="text-center text-xs leading-tight">مصر الرقمية</span>
                            </button>
                            
                            <button class="download-site-btn flex flex-col items-center gap-1 px-2 py-2 bg-green-50 text-green-800 rounded-lg font-medium border border-green-200" data-site="6">
                                <i class="ri-scales-line text-green-600 text-base"></i>
                                <span class="text-center text-xs leading-tight">النيابة العامة</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- المنطقة الرئيسية للمجلدات -->
            <div class="flex-1 bg-white flex flex-col">
                <div id="folders-list" class="flex-1 p-6 overflow-y-auto">
                    <div class="text-center text-gray-500 py-20">
                        <i class="ri-folder-open-line text-6xl mb-6 text-gray-300"></i>
                        <p class="text-xl font-medium text-gray-400 mb-2">لا توجد مجلدات بعد</p>
                        <p class="text-sm text-gray-400">ابدأ بإنشاء مجلد جديد من الشريط الجانبي لتنظيم مكتبتك القانونية</p>
                    </div>
                </div>
                <div id="site-viewer" class="hidden flex-1 min-h-0 flex flex-col">
                    <div class="px-2 py-1 bg-white/90 backdrop-blur border-b border-gray-200 flex items-center gap-2 sticky top-0 z-10">
                        <button id="toggle-viewer-full" class="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs bg-gray-800 text-white hover:bg-gray-700"><i class="ri-fullscreen-fill text-sm"></i><span>تكبير</span></button>
                        <div id="site-tabs" class="flex-1 flex items-center gap-1 overflow-x-auto"></div>
                    </div>
                    <div id="webviews-container" class="flex-1 relative w-full h-full"></div>
                </div>
            </div>
        </div>
    `;


    attachLegalLibraryListeners();
    

    loadExistingFolders();
}


function attachLegalLibraryListeners() {
    const attachFilesBtn = document.getElementById('attach-files-btn');
    const folderNameInput = document.getElementById('folder-name');


    attachFilesBtn.addEventListener('click', async () => {
        const folderName = folderNameInput.value.trim();
        if (!folderName) {
            showToast('يرجى إدخال اسم المجلد أولاً', 'error');
            folderNameInput.focus();
            return;
        }
        
        await attachFilesAndCreateFolder(folderName);
    });


    folderNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            attachFilesBtn.click();
        }
    });


    document.querySelectorAll('.download-site-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const siteNumber = btn.dataset.site;
            openDownloadSite(siteNumber);
        });
    });


    const listViewBtn = document.getElementById('list-view-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');

    if (listViewBtn && gridViewBtn) {
        listViewBtn.addEventListener('click', () => {
            const folders = document.getElementById('folders-list');
            const viewer = document.getElementById('site-viewer');
            if (viewer && !viewer.classList.contains('hidden') && folders) {
                viewer.classList.add('hidden');
                folders.classList.remove('hidden');
                setupLegalLibraryScrollBox();
            }
            setActiveViewButton('list');
            loadExistingFolders('list');
        });

        gridViewBtn.addEventListener('click', () => {
            const folders = document.getElementById('folders-list');
            const viewer = document.getElementById('site-viewer');
            if (viewer && !viewer.classList.contains('hidden') && folders) {
                viewer.classList.add('hidden');
                folders.classList.remove('hidden');
                setupLegalLibraryScrollBox();
            }
            setActiveViewButton('grid');
            loadExistingFolders('grid');
        });
    }

    const root = document.getElementById('modal-content');
    if (root) {
        let hoveredEl = null;
        root.addEventListener('mouseover', (e) => {
            const target = e.target.closest('.folder-item, .download-site-btn, .view-toggle-btn, #attach-files-btn, .attach-files-folder-btn, .edit-folder-btn, .delete-folder-btn');
            if (!target || !root.contains(target)) return;
            if (hoveredEl === target) return;
            hoveredEl = target;
            if (target.classList.contains('view-toggle-btn')) {
                if (target.classList.contains('bg-gray-200')) target.classList.add('bg-gray-300');
            } else if (target.classList.contains('folder-item') || target.classList.contains('download-site-btn')) {
                target.classList.add('bg-blue-50', 'border-blue-300', 'ring-1', 'ring-blue-300');
            } else {
                target.classList.add('ring-1', 'ring-blue-300');
            }
        });
        root.addEventListener('mouseout', (e) => {
            if (!hoveredEl) return;
            const related = e.relatedTarget;
            if (related && hoveredEl.contains(related)) return;

            const folder = e.target.closest('.folder-item');
            if (folder && (!related || !folder.contains(related))) {
                folder.classList.remove('bg-blue-50', 'border-blue-300', 'ring-1', 'ring-blue-300');
                folder.querySelectorAll('.attach-files-folder-btn, .edit-folder-btn, .delete-folder-btn')
                    .forEach(btn => btn.classList.remove('ring-1', 'ring-blue-300'));
            }

            if (hoveredEl.classList.contains('view-toggle-btn')) {
                hoveredEl.classList.remove('bg-gray-300');
            } else if (hoveredEl.classList.contains('folder-item') || hoveredEl.classList.contains('download-site-btn')) {
                hoveredEl.classList.remove('bg-blue-50', 'border-blue-300', 'ring-1', 'ring-blue-300');
            } else {
                hoveredEl.classList.remove('ring-1', 'ring-blue-300');
            }
            hoveredEl = null;
        });
    }
        const toggleBtn = document.getElementById('toggle-viewer-full');
    const sidebarEl = document.getElementById('legal-sidebar');
    if (toggleBtn && sidebarEl) {
        toggleBtn.addEventListener('click', () => {
            const nowHidden = !sidebarEl.classList.contains('hidden');
            if (nowHidden) {
                sidebarEl.classList.add('hidden');
                sidebarEl.style.display = 'none';
            } else {
                sidebarEl.classList.remove('hidden');
                sidebarEl.style.display = '';
            }
            const iconEl = toggleBtn.querySelector('i');
            const textEl = toggleBtn.querySelector('span');
            if (iconEl) iconEl.className = nowHidden ? 'ri-fullscreen-exit-fill text-sm' : 'ri-fullscreen-fill text-sm';
            if (textEl) textEl.textContent = nowHidden ? 'تصغير' : 'تكبير';
            setupLegalLibraryScrollBox();
            const activeWv = document.querySelector('#webviews-container webview:not(.hidden)');
            if (activeWv) { try { fitWebviewToWidth(activeWv); } catch(e){} }
        });
    }
    window.addEventListener('resize', () => {
        setupLegalLibraryScrollBox();
        const activeWv = document.querySelector('#webviews-container webview:not(.hidden)');
        if (activeWv) { try { fitWebviewToWidth(activeWv); } catch(e){} }
    });
}


function setActiveViewButton(viewType) {
    const listViewBtn = document.getElementById('list-view-btn');
    const gridViewBtn = document.getElementById('grid-view-btn');

    if (!listViewBtn || !gridViewBtn) return;

    listViewBtn.classList.remove('bg-green-500','bg-green-600','text-white','bg-gray-300');
    gridViewBtn.classList.remove('bg-green-500','bg-green-600','text-white','bg-gray-300');

    if (viewType === 'list') {
        listViewBtn.classList.add('active', 'bg-green-600', 'text-white');
        listViewBtn.classList.remove('bg-gray-200', 'text-gray-600');
        gridViewBtn.classList.remove('active');
        gridViewBtn.classList.add('bg-gray-200', 'text-gray-600');
    } else {
        gridViewBtn.classList.add('active', 'bg-green-600', 'text-white');
        gridViewBtn.classList.remove('bg-gray-200', 'text-gray-600');
        listViewBtn.classList.remove('active');
        listViewBtn.classList.add('bg-gray-200', 'text-gray-600');
    }
}


async function attachFilesAndCreateFolder(folderName) {

    if (!window.electronAPI || !window.electronAPI.createLegalLibraryFolder) {
        showBrowserLimitationModal();
        return;
    }

    try {
        const result = await window.electronAPI.createLegalLibraryFolder(folderName);
        
        if (result.success) {
            if (result.filesCount > 0) {
                showToast(`${result.message} (${result.filesCount} ملف)`, 'success');
            } else {
                showToast(result.message, 'success');
            }
            

            document.getElementById('folder-name').value = '';
            

            await loadExistingFolders();
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('حدث خطأ في إنشاء المجلد', 'error');
    }
}






function getFolderIconAndColor(folderName) {
    const folderTypes = {
        'قانون المرافعات': { icon: 'ri-book-line', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-800' },
        'القانون المدنى': { icon: 'ri-home-line', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-800' },
        'القانون الجنائى': { icon: 'ri-shield-line', color: 'from-red-500 to-red-600', bgColor: 'bg-red-50', textColor: 'text-red-800' },
        'القانون الادارى': { icon: 'ri-settings-line', color: 'from-purple-500 to-purple-600', bgColor: 'bg-purple-50', textColor: 'text-purple-800' },
        'قانون الاجراءات الجنائية': { icon: 'ri-book-line', color: 'from-blue-500 to-blue-600', bgColor: 'bg-blue-50', textColor: 'text-blue-800' },
        'قانون العمل': { icon: 'ri-home-line', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-800' },
        'قانون العمل والتأمينات': { icon: 'ri-home-line', color: 'from-green-500 to-green-600', bgColor: 'bg-green-50', textColor: 'text-green-800' },
        'قانون الاحوال الشخصيه': { icon: 'ri-heart-line', color: 'from-pink-500 to-pink-600', bgColor: 'bg-pink-50', textColor: 'text-pink-800' },
        'احكام محكمه النقض': { icon: 'ri-star-line', color: 'from-indigo-500 to-indigo-600', bgColor: 'bg-indigo-50', textColor: 'text-indigo-800' }
    };
    
    return folderTypes[folderName] || { icon: 'ri-folder-fill', color: 'from-gray-500 to-gray-600', bgColor: 'bg-gray-50', textColor: 'text-gray-800' };
}


async function loadExistingFolders(viewType = 'grid') {
    const foldersList = document.getElementById('folders-list');
    

    if (!window.electronAPI || !window.electronAPI.loadLegalLibraryFolders) {

        const demoFolders = [
            { name: 'قانون المرافعات' },
            { name: 'القانون المدنى' },
            { name: 'القانون الجنائى' },
            { name: 'القانون الادارى' },
            { name: 'قانون الاجراءات الجنائية' },
            { name: 'قانون العمل' },
            { name: 'قانون الاحوال الشخصيه' },
            { name: 'احكام محكمه النقض' }
        ];
        

        displayFolders(demoFolders, viewType, true);
        return;
    }
    
    try {
        const result = await window.electronAPI.loadLegalLibraryFolders();
        
        if (result.success && result.items && result.items.length > 0) {
            displayFolders(result.items, viewType, false);
        } else {
            foldersList.innerHTML = `
                <div class="text-center text-gray-500 py-16">
                    <i class="ri-folder-open-line text-5xl mb-4 text-gray-300"></i>
                    <p class="text-lg font-medium text-gray-400">لا توجد مجلدات بعد</p>
                    <p class="text-sm text-gray-400 mt-2">ابدأ بإنشاء مجلد جديد لتنظيم مكتبتك القانونية</p>
                </div>
            `;
        }
    } catch (error) {
        // إذا كان الخطأ بسبب عدم توفر الـ API، عرض رسالة المتصفح
        if (error.message && error.message.includes('electronAPI')) {
            foldersList.innerHTML = `
                <div class="text-center py-16">
                    <div class="max-w-md mx-auto">
                        <div class="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                            <i class="ri-computer-line text-white text-3xl"></i>
                        </div>
                        <h3 class="text-xl font-bold text-gray-800 mb-3">المكتبة القانونية</h3>
                        <p class="text-gray-600 mb-4 leading-relaxed">
                            هذه الميزة متاحة فقط في تطبيق سطح المكتب<br>
                            للاستفادة من المكتبة القانونية الكاملة
                        </p>
                        <button onclick="closeModal()" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                            فهمت، شكراً
                        </button>
                    </div>
                </div>
            `;
        } else {
            // خطأ عام آخر
            foldersList.innerHTML = `
                <div class="text-center text-red-500 py-12">
                    <i class="ri-error-warning-line text-4xl mb-4"></i>
                    <p class="text-lg font-medium">حدث خطأ في تحميل المجلدات</p>
                    <p class="text-sm mt-2">${error.message}</p>
                </div>
            `;
        }

    }
}

function displayFolders(folders, viewType = 'grid', isDemoMode = false) {
    const foldersList = document.getElementById('folders-list');
    let html = '';
    
    if (viewType === 'grid') {
        // عرض الشبكة
        html = '<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">';
        
        folders.forEach(folder => {
            const folderStyle = getFolderIconAndColor(folder.name);
            html += `
                <div class="folder-item bg-white hover:${folderStyle.bgColor} border-2 border-gray-200 hover:border-gray-300 rounded-lg p-3 cursor-pointer transition-all duration-300 hover:shadow-lg group" data-folder-name="${folder.name}" data-demo="${isDemoMode}">
                    <div class="folder-content text-center">
                        <div class="w-12 h-12 bg-gradient-to-br ${folderStyle.color} rounded-lg flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 mx-auto mb-2">
                            <i class="${folderStyle.icon} text-white text-lg"></i>
                        </div>
                        <h4 class="text-sm font-bold ${folderStyle.textColor} mb-1 line-clamp-2">${folder.name}</h4>
                        <p class="text-xs text-gray-500">${isDemoMode ? 'تجريبي' : 'قانونية'}</p>
                    </div>
                    
                    <!-- أزرار التحكم -->
                    <div class="flex justify-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button class="attach-files-folder-btn w-7 h-7 bg-green-500 hover:bg-green-600 text-white rounded flex items-center justify-center transition-all shadow-md hover:shadow-lg" title="إرفاق ملفات" data-folder-name="${folder.name}">
                            <i class="ri-attachment-2 text-xs"></i>
                        </button>
                        <button class="edit-folder-btn w-7 h-7 bg-blue-500 hover:bg-blue-600 text-white rounded flex items-center justify-center transition-all shadow-md hover:shadow-lg" title="تعديل الاسم" data-folder-name="${folder.name}">
                            <i class="ri-edit-line text-xs"></i>
                        </button>
                        <button class="delete-folder-btn w-7 h-7 bg-red-500 hover:bg-red-600 text-white rounded flex items-center justify-center transition-all shadow-md hover:shadow-lg" title="حذف المجلد" data-folder-name="${folder.name}">
                            <i class="ri-delete-bin-line text-xs"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    } else {
        // عرض القائمة (الكود الأصلي بدون تغيير)
        html = '<div class="space-y-3">';
        
        folders.forEach(folder => {
            const folderStyle = getFolderIconAndColor(folder.name);
            html += `
                <div class="folder-item bg-white hover:${folderStyle.bgColor} border-2 border-gray-200 hover:border-gray-300 rounded-xl p-5 cursor-pointer transition-all duration-300 hover:shadow-lg group flex items-center justify-between" data-folder-name="${folder.name}" data-demo="${isDemoMode}">
                    <div class="flex items-center gap-4 folder-content flex-1">
                        <div class="w-14 h-14 bg-gradient-to-br ${folderStyle.color} rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                            <i class="${folderStyle.icon} text-white text-xl"></i>
                        </div>
                        <div class="flex-1">
                            <h4 class="text-base font-bold ${folderStyle.textColor} mb-1">${folder.name}</h4>
                            <p class="text-sm text-gray-500">${isDemoMode ? 'عرض تجريبي - مكتبة قانونية' : 'مجلد مكتبة قانونية'}</p>
                        </div>
                    </div>
                    
                    <!-- أزرار التحكم -->
                    <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200">
                        <button class="attach-files-folder-btn w-8 h-8 bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg" title="إرفاق ملفات" data-folder-name="${folder.name}">
                            <i class="ri-attachment-2 text-sm"></i>
                        </button>
                        <button class="edit-folder-btn w-8 h-8 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg" title="تعديل الاسم" data-folder-name="${folder.name}">
                            <i class="ri-edit-line text-sm"></i>
                        </button>
                        <button class="delete-folder-btn w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-lg flex items-center justify-center transition-all shadow-md hover:shadow-lg" title="حذف المجلد" data-folder-name="${folder.name}">
                            <i class="ri-delete-bin-line text-sm"></i>
                        </button>
                    </div>
                </div>
            `;
        });
        
        html += '</div>';
    }
    
    foldersList.innerHTML = html;
    
    // إضافة مستمعي فتح المجلدات
    attachFolderOpenListeners();
    setupLegalLibraryScrollBox();
}

// إضافة مستمعي فتح المجلدات
function attachFolderOpenListeners() {
    // فتح المجلد عند النقر على المحتوى
    document.querySelectorAll('.folder-content').forEach(content => {
        content.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderItem = content.closest('.folder-item');
            const folderName = folderItem.dataset.folderName;
            const isDemoMode = folderItem.dataset.demo === 'true';
            
            if (isDemoMode) {
                showBrowserLimitationModal();
            } else {
                openSpecificFolder(folderName);
            }
        });
    });

    // فتح المجلد عند النقر على الكارت (إلا إذا كان على الأزرار)
    document.querySelectorAll('.folder-item').forEach(item => {
        item.addEventListener('click', (e) => {
            // تجاهل النقر إذا كان على أزرار التحكم
            if (e.target.closest('.edit-folder-btn') || e.target.closest('.delete-folder-btn') || e.target.closest('.attach-files-folder-btn')) {
                return;
            }
            const folderName = item.dataset.folderName;
            const isDemoMode = item.dataset.demo === 'true';
            
            if (isDemoMode) {
                showBrowserLimitationModal();
            } else {
                openSpecificFolder(folderName);
            }
        });
    });

    // مستمعي أزرار التعديل
    document.querySelectorAll('.edit-folder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderItem = btn.closest('.folder-item');
            const isDemoMode = folderItem.dataset.demo === 'true';
            const folderName = btn.dataset.folderName;
            
            if (isDemoMode) {
                showBrowserLimitationModal();
            } else {
                showRenameFolderDialog(folderName);
            }
        });
    });

    // مستمعي أزرار الحذف
    document.querySelectorAll('.delete-folder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderItem = btn.closest('.folder-item');
            const isDemoMode = folderItem.dataset.demo === 'true';
            const folderName = btn.dataset.folderName;
            
            if (isDemoMode) {
                showBrowserLimitationModal();
            } else {
                showDeleteFolderDialog(folderName);
            }
        });
    });

    // مستمعي أزرار إرفاق الملفات
    document.querySelectorAll('.attach-files-folder-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.stopPropagation();
            const folderItem = btn.closest('.folder-item');
            const isDemoMode = folderItem.dataset.demo === 'true';
            const folderName = btn.dataset.folderName;
            
            if (isDemoMode) {
                showBrowserLimitationModal();
            } else {
                attachFilesToExistingFolder(folderName);
            }
        });
    });
}

function setupLegalLibraryScrollBox() {
    try {
        const viewportH = window.innerHeight;
        const list = document.getElementById('folders-list');
        if (list) {
            const top = list.getBoundingClientRect().top;
            const targetH = Math.max(240, viewportH - top - 12);
            list.style.height = targetH + 'px';
            list.style.maxHeight = targetH + 'px';
            list.style.overflowY = 'auto';
        }
        const viewer = document.getElementById('site-viewer');
        if (viewer) {
            const top2 = viewer.getBoundingClientRect().top;
            const targetH2 = Math.max(240, viewportH - top2 - 12);
            viewer.style.height = targetH2 + 'px';
            viewer.style.maxHeight = targetH2 + 'px';
            const header = viewer.querySelector(':scope > div');
            const toolbarH = header ? header.offsetHeight : 0;
            const contentH = targetH2 - toolbarH;
            const wrap = document.getElementById('webviews-container');
            if (wrap) {
                wrap.style.height = (contentH > 0 ? contentH : targetH2) + 'px';
                const webviews = wrap.querySelectorAll('webview');
                webviews.forEach(wv => { wv.style.height = (contentH > 0 ? contentH : targetH2) + 'px'; });
            }
        }
    } catch (e) {}
}

// فتح مجلد محدد
async function openSpecificFolder(folderName) {

    if (!window.electronAPI || !window.electronAPI.openLegalLibraryFolder) {
        showToast('فتح المجلدات متاح فقط في تطبيق سطح المكتب', 'info');
        return;
    }

    try {
        const result = await window.electronAPI.openLegalLibraryFolder(folderName);
        
        if (result.success) {
        } else {
            showToast('حدث خطأ في فتح المجلد: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('حدث خطأ في فتح المجلد', 'error');
    }
}

// إظهار نافذة تأكيد حذف المجلد
function showDeleteFolderDialog(folderName) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div class="text-center">
                <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="ri-delete-bin-line text-red-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">تأكيد الحذف</h3>
                <p class="text-gray-600 mb-6">هل أنت متأكد من حذف مجلد "<strong>${folderName}</strong>"؟<br>سيتم حذف جميع الملفات الموجودة بداخله نهائياً.</p>
                <div class="flex gap-3 justify-center">
                    <button id="confirm-delete" class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-bold transition-all">
                        حذف نهائي
                    </button>
                    <button id="cancel-delete" class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-bold transition-all">
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    // مستمع زر التأكيد
    modal.querySelector('#confirm-delete').addEventListener('click', async () => {
        await deleteLegalLibraryFolder(folderName);
        document.body.removeChild(modal);
    });

    // مستمع زر الإلغاء
    modal.querySelector('#cancel-delete').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// إظهار نافذة تعديل اسم المجلد
function showRenameFolderDialog(folderName) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div class="text-center">
                <div class="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <i class="ri-edit-line text-blue-600 text-2xl"></i>
                </div>
                <h3 class="text-lg font-bold text-gray-800 mb-2">تعديل اسم المجلد</h3>
                <p class="text-gray-600 mb-4">الاسم الحالي: "<strong>${folderName}</strong>"</p>
                <input type="text" id="new-folder-name" value="${folderName}" class="w-full p-3 border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right mb-4" placeholder="الاسم الجديد">
                <div class="flex gap-3 justify-center">
                    <button id="confirm-rename" class="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-all">
                        حفظ التغيير
                    </button>
                    <button id="cancel-rename" class="px-6 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded-lg font-bold transition-all">
                        إلغاء
                    </button>
                </div>
            </div>
        </div>
    `;

    document.body.appendChild(modal);

    const newNameInput = modal.querySelector('#new-folder-name');
    newNameInput.focus();
    newNameInput.select();

    // مستمع زر التأكيد
    modal.querySelector('#confirm-rename').addEventListener('click', async () => {
        const newName = newNameInput.value.trim();
        if (newName && newName !== folderName) {
            await renameLegalLibraryFolder(folderName, newName);
        }
        document.body.removeChild(modal);
    });

    // مستمع زر الإلغاء
    modal.querySelector('#cancel-rename').addEventListener('click', () => {
        document.body.removeChild(modal);
    });

    // حفظ عند الضغط على Enter
    newNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            modal.querySelector('#confirm-rename').click();
        }
    });

    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// حذف مجلد من المكتبة القانونية
async function deleteLegalLibraryFolder(folderName) {

    if (!window.electronAPI || !window.electronAPI.deleteLegalLibraryFolder) {
        showToast('حذف المجلدات متاح فقط في تطبيق سطح المكتب', 'info');
        return;
    }

    try {
        const result = await window.electronAPI.deleteLegalLibraryFolder(folderName);
        
        if (result.success) {
            showToast(result.message, 'success');

            await loadExistingFolders();
        } else {
            showToast('حدث خطأ في حذف المجلد: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('حدث خطأ في حذف المجلد', 'error');
    }
}

// تعديل اسم مجلد في المكتبة القانونية
async function renameLegalLibraryFolder(oldName, newName) {

    if (!window.electronAPI || !window.electronAPI.renameLegalLibraryFolder) {
        showToast('تعديل أسماء المجلدات متاح فقط في تطبيق سطح المكتب', 'info');
        return;
    }

    try {
        const result = await window.electronAPI.renameLegalLibraryFolder(oldName, newName);
        
        if (result.success) {
            showToast(result.message, 'success');

            await loadExistingFolders();
        } else {
            showToast('حدث خطأ في تعديل اسم المجلد: ' + result.error, 'error');
        }
    } catch (error) {
        showToast('حدث خطأ في تعديل اسم المجلد', 'error');
    }
}



// عرض رسالة منبثق�� لقيود المتصفح
function showBrowserLimitationModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50';
    modal.innerHTML = `
        <div class="bg-white rounded-xl p-6 max-w-lg w-full mx-4 shadow-2xl">
            <div class="text-center">
                <div class="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <i class="ri-computer-line text-white text-3xl"></i>
                </div>
                <h3 class="text-xl font-bold text-gray-800 mb-3">المكتبة القانونية</h3>
                <p class="text-gray-600 mb-4 leading-relaxed">
                    هذه الميزة متاحة بالكامل فقط في تطبيق سطح المكتب<br>
                    للاستفادة من جميع إمكانيات المكتبة القانونية
                </p>
                
                <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-right">
                    <div class="flex items-start gap-3">
                        <i class="ri-information-line text-blue-600 text-lg mt-0.5"></i>
                        <div>
                            <p class="text-sm text-blue-800 font-medium mb-2">مميزات تطبيق سطح المكتب:</p>
                            <ul class="text-sm text-blue-700 space-y-1">
                                <li>• إنشاء وتنظيم مجلدات المراجع القانونية</li>
                                <li>• رفع وحفظ الملفات والوثائق (PDF, Word, إلخ)</li>
                                <li>• فتح الملفات مباشرة من التطبيق</li>
                                <li>• تعديل وحذف المجلدات</li>
                                <li>• البحث في محتوى الملفات</li>
                                <li>• العمل بدون إنترنت تماماً</li>
                            </ul>
                        </div>
                    </div>
                </div>
                
                <div class="flex gap-3 justify-center">
                    <button id="close-limitation-modal" class="px-6 py-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all duration-200 shadow-sm hover:shadow-md">
                        فهمت، شكراً
                    </button>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // إغلاق النافذة
    const closeBtn = modal.querySelector('#close-limitation-modal');
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(modal);
    });
    
    // إغلاق عند النقر خارج النافذة
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            document.body.removeChild(modal);
        }
    });
}

// إرفاق ملفات لمجلد موجود
async function attachFilesToExistingFolder(folderName) {

    if (!window.electronAPI || !window.electronAPI.attachFilesToFolder) {
        showBrowserLimitationModal();
        return;
    }

    try {
        const result = await window.electronAPI.attachFilesToFolder(folderName);
        
        if (result.success) {
            if (result.filesCount > 0) {
                showToast(`تم إرفاق ${result.filesCount} ملف لمجلد "${folderName}"`, 'success');
            } else {
                showToast('لم يتم اختيار أي ملفات', 'info');
            }
        } else {
            showToast(result.message, 'error');
        }
    } catch (error) {
        showToast('حدث خطأ في إرفاق الملفات', 'error');
    }
}

// فتح موقع تحميل
function openDownloadSite(siteNumber) {
    const sites = {
        '1': 'https://foulabook.com/ar/books/%D9%82%D8%A7%D9%86%D9%88%D9%86?page=1',
        '2': 'https://books-library.net/c-Books-Egyption-Law-best-download',
        '3': 'https://deepai.org/chat/free-chatgpt',
        '4': 'https://www.moj.gov.eg',
        '5': 'https://www.digital.gov.eg',
        '6': 'https://www.ppo.gov.eg'
    };
    const titles = {
        '1': 'كتب متنوعة',
        '2': 'كتب أخرى',
        '3': 'الذكاء الاصطناعي',
        '4': 'وزارة العدل',
        '5': 'مصر الرقمية',
        '6': 'النيابة العامة'
    };
    const url = sites[siteNumber];
    if (!url) { showToast('رقم الموقع غير صحيح', 'error'); return; }
    const isElectron = !!(window.electronAPI) || (navigator.userAgent && navigator.userAgent.includes('Electron'));
    if (!isElectron) {
        window.open(url, '_blank');
        return;
    }
    const viewer = document.getElementById('site-viewer');
    const folders = document.getElementById('folders-list');
    const tabsEl = document.getElementById('site-tabs');
    const wrap = document.getElementById('webviews-container');
    if (viewer && folders && tabsEl && wrap) {
        folders.classList.add('hidden');
        viewer.classList.remove('hidden');
        const title = titles[siteNumber] || url;
        createSiteTab(title, url);
        setupLegalLibraryScrollBox();
    } else {
        window.open(url, '_blank');
    }
}

function createSiteTab(title, url) {
    const tabsEl = document.getElementById('site-tabs');
    const wrap = document.getElementById('webviews-container');
    if (!tabsEl || !wrap) return;
    const tabId = 'tab-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const tabBtn = document.createElement('button');
    tabBtn.type = 'button';
    tabBtn.className = 'tab-pill inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs border border-gray-300 bg-white text-gray-700 shadow-sm hover:bg-gray-50';
    tabBtn.dataset.tabId = tabId;
    tabBtn.innerHTML = `<span class="truncate max-w-[160px]">${title}</span><i class="ri-close-line text-xs"></i>`;
    tabBtn.addEventListener('click', (e) => {
        if (e.target && e.target.classList.contains('ri-close-line')) {
            closeSiteTab(tabId);
        } else {
            activateSiteTab(tabId);
        }
    });
    tabsEl.appendChild(tabBtn);
    const wv = document.createElement('webview');
    wv.className = 'site-webview absolute inset-0 w-full h-full hidden';
    wv.setAttribute('allowpopups', '');
    wv.dataset.tabId = tabId;
    wv.src = url;
    wv.addEventListener('dom-ready', () => {
        try {
            wv.insertCSS(`
                html, body { width: 100% !important; max-width: 100vw !important; min-width: 0 !important; overflow-x: hidden !important; }
                *, *::before, *::after { box-sizing: border-box !important; }
                img, video, canvas, svg, iframe { max-width: 100% !important; height: auto !important; }
                table { width: 100% !important; table-layout: fixed !important; border-collapse: collapse !important; }
                td, th { word-wrap: break-word !important; overflow-wrap: anywhere !important; }
                pre { white-space: pre-wrap !important; }
                [class*="container"], [class*="content"], [class*="wrapper"] { max-width: 100% !important; min-width: 0 !important; overflow-x: hidden !important; }
            `);
        } catch (e) {}
        try {
            wv.executeJavaScript(`(function(){ try { var m = document.querySelector('meta[name="viewport"]') || document.createElement('meta'); m.name = 'viewport'; m.content = 'width=device-width, initial-scale=1, maximum-scale=1'; if (!m.parentNode) document.head.appendChild(m); } catch(e){} })();`, false);
        } catch (e) {}
    });
    wv.addEventListener('did-frame-finish-load', () => { try { fitWebviewToWidth(wv); } catch(e){} });
    wv.addEventListener('did-navigate', () => { try { fitWebviewToWidth(wv); } catch(e){} });
    wv.addEventListener('did-navigate-in-page', () => { try { fitWebviewToWidth(wv); } catch(e){} });
    wrap.appendChild(wv);
    activateSiteTab(tabId);
}

function fitWebviewToWidth(wv) {
    try {
        const apply = () => {
            try {
                wv.executeJavaScript(`(function(){
                    try {
                        var sw = Math.max(document.documentElement.scrollWidth || 0, (document.body && document.body.scrollWidth) || 0);
                        var vw = window.innerWidth || document.documentElement.clientWidth || 0;
                        var factor = 1;
                        if (sw > vw && sw > 0) {
                            factor = Math.max(0.5, Math.min(1, vw / sw));
                        }
                        factor;
                    } catch(e) { return 1; }
                })();`, true).then(function(factor){
                    if (typeof factor === 'number' && !isNaN(factor)) {
                        try { wv.setZoomFactor(factor); } catch(e){}
                    }
                }).catch(function(){});
            } catch(e){}
        };
        apply();
        setTimeout(apply, 300);
        setTimeout(apply, 1000);
    } catch(e){}
}

function activateSiteTab(tabId) {
    const tabsEl = document.getElementById('site-tabs');
    const wrap = document.getElementById('webviews-container');
    if (!tabsEl || !wrap) return;
    Array.from(tabsEl.children).forEach(btn => {
        if (btn.dataset.tabId === tabId) {
            btn.classList.add('bg-gradient-to-r','from-blue-600','to-indigo-600','text-white','border-transparent','shadow');
            btn.classList.remove('bg-white','text-gray-700','border-gray-300');
        } else {
            btn.classList.remove('bg-gradient-to-r','from-blue-600','to-indigo-600','text-white','border-transparent','shadow');
            btn.classList.add('bg-white','text-gray-700','border-gray-300');
        }
    });
    const webviews = wrap.querySelectorAll('webview');
    webviews.forEach(wv => {
        if (wv.dataset.tabId === tabId) {
            wv.classList.remove('hidden');
        } else {
            wv.classList.add('hidden');
        }
    });
}

function closeSiteTab(tabId) {
    const tabsEl = document.getElementById('site-tabs');
    const wrap = document.getElementById('webviews-container');
    const folders = document.getElementById('folders-list');
    const viewer = document.getElementById('site-viewer');
    if (!tabsEl || !wrap) return;
        const btn = Array.from(tabsEl.children).find(b => b.dataset.tabId === tabId);
    if (btn) tabsEl.removeChild(btn);
    const wv = wrap.querySelector(`webview[data-tab-id="${tabId}"]`);
    if (wv) wrap.removeChild(wv);
    const remaining = Array.from(tabsEl.children);
    if (remaining.length === 0) {
        if (viewer && folders) {
            viewer.classList.add('hidden');
            folders.classList.remove('hidden');
            const sidebarEl = document.getElementById('legal-sidebar');
            if (sidebarEl) { sidebarEl.classList.remove('hidden'); sidebarEl.style.display = ''; }
            setupLegalLibraryScrollBox();
        }
    } else {
        const hasActive = Array.from(wrap.querySelectorAll('webview')).some(el => !el.classList.contains('hidden'));
        if (!hasActive) {
            const next = remaining[remaining.length - 1];
            if (next) activateSiteTab(next.dataset.tabId);
        }
    }
}