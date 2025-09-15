// ===== نظام التحديثات =====

let updateInfo = null;
let isCheckingForUpdates = false;
let isDownloadingUpdate = false;

// تهيئة نظام التحديثات
function initUpdater() {
    if (!window.electronAPI) {
        console.log('التحديثات متاحة فقط في تطبيق سطح المكتب');
        return;
    }

    // مستمعي الأحداث
    window.electronAPI.onUpdateChecking(() => {
        updateUpdateStatus('جاري فحص التحديثات...', 'checking');
    });

    window.electronAPI.onUpdateAvailable((event, info) => {
        updateInfo = info;
        updateUpdateStatus(`تحديث متاح: الإصدار ${info.version}`, 'available');
        showInstallButton();
    });

    window.electronAPI.onUpdateNotAvailable(() => {
        updateUpdateStatus('التطبيق محدث لأحدث إصدار', 'up-to-date');
        hideInstallButton();
    });

    window.electronAPI.onUpdateDownloadProgress((event, progress) => {
        updateUpdateStatus(`جاري التحميل: ${progress.percent}%`, 'downloading');
        updateProgressBar(progress.percent);
    });

    window.electronAPI.onUpdateDownloaded(() => {
        updateUpdateStatus('تم تحميل التحديث - سيتم التثبيت وإعادة التشغيل', 'downloaded');
        hideProgressBar();
    });

    window.electronAPI.onUpdateError((event, error) => {
        updateUpdateStatus(`خطأ في التحديث: ${error}`, 'error');
        hideProgressBar();
        hideInstallButton();
        isCheckingForUpdates = false;
        isDownloadingUpdate = false;
    });
}

// فحص التحديثات يدوياً
async function checkForUpdates() {
    if (!window.electronAPI) {
        showToast('التحديثات متاحة فقط في تطبيق سطح المكتب', 'warning');
        return;
    }

    if (isCheckingForUpdates) {
        showToast('جاري فحص التحديثات بالفعل...', 'info');
        return;
    }

    try {
        isCheckingForUpdates = true;
        updateUpdateStatus('جاري فحص التحديثات...', 'checking');
        
        const result = await window.electronAPI.checkForUpdates();
        
        if (result.success) {
            if (result.hasUpdate) {
                updateInfo = {
                    version: result.version,
                    releaseNotes: result.releaseNotes,
                    releaseDate: result.releaseDate
                };
                updateUpdateStatus(`تحديث متاح: الإصدار ${result.version}`, 'available');
                showUpdateInfo(updateInfo);
                showInstallButton();
                showToast(`تم العثور على تحديث جديد: الإصدار ${result.version}`, 'success');
            } else {
                updateUpdateStatus('التطبيق محدث لأحدث إصدار', 'up-to-date');
                hideInstallButton();
                hideUpdateInfo();
                showToast('التطبيق محدث لأحدث إصدار', 'success');
            }
        } else {
            throw new Error(result.error);
        }
    } catch (error) {
        console.error('خطأ في فحص التحديثات:', error);
        updateUpdateStatus('فشل في فحص التحديثات', 'error');
        hideInstallButton();
        hideUpdateInfo();
        showToast('فشل في فحص التحديثات: ' + error.message, 'error');
    } finally {
        isCheckingForUpdates = false;
    }
}

// تحميل وتثبيت التحديث
async function downloadAndInstallUpdate() {
    if (!window.electronAPI) {
        showToast('التحديثات متاحة فقط في تطبيق سطح المكتب', 'warning');
        return;
    }

    if (isDownloadingUpdate) {
        showToast('جا��ي تحميل التحديث بالفعل...', 'info');
        return;
    }

    if (!updateInfo) {
        showToast('لا يوجد تحديث متاح للتحميل', 'warning');
        return;
    }

    // تأكيد من المستخدم
    const confirmed = confirm(
        `هل تريد تحميل وتثبيت الإصدار ${updateInfo.version}؟\n\n` +
        `سيتم إغلاق التطبيق وإعادة تشغيله تلقائياً بعد التثبيت.\n\n` +
        `ملاحظات الإصدار:\n${updateInfo.releaseNotes || 'تحديثات وتحسينات عامة'}`
    );

    if (!confirmed) {
        return;
    }

    try {
        isDownloadingUpdate = true;
        updateUpdateStatus('جاري تحميل التحديث...', 'downloading');
        showProgressBar();
        hideInstallButton();

        const result = await window.electronAPI.downloadAndInstallUpdate();
        
        if (!result.success) {
            throw new Error(result.error);
        }

        // إذا وصلنا هنا، فالتطبيق سيتم إغلاقه وإعادة تشغيله
        updateUpdateStatus('جاري التثبيت وإعادة التشغيل...', 'installing');
        
    } catch (error) {
        console.error('خطأ في تحميل التحديث:', error);
        updateUpdateStatus('فشل في تحميل التحديث', 'error');
        hideProgressBar();
        showInstallButton();
        showToast('فشل في تحميل التحديث: ' + error.message, 'error');
        isDownloadingUpdate = false;
    }
}

// تحديث حالة التحديث في الواجهة
function updateUpdateStatus(message, status) {
    const statusElement = document.getElementById('update-status-text');
    if (!statusElement) return;

    const icons = {
        'checking': 'ri-refresh-line animate-spin',
        'available': 'ri-download-cloud-2-line text-green-600',
        'up-to-date': 'ri-check-double-line text-green-600',
        'downloading': 'ri-download-line animate-pulse text-blue-600',
        'downloaded': 'ri-check-line text-green-600',
        'installing': 'ri-settings-3-line animate-spin text-blue-600',
        'error': 'ri-error-warning-line text-red-600'
    };

    const colors = {
        'checking': 'text-blue-600',
        'available': 'text-green-600',
        'up-to-date': 'text-green-600',
        'downloading': 'text-blue-600',
        'downloaded': 'text-green-600',
        'installing': 'text-blue-600',
        'error': 'text-red-600'
    };

    const icon = icons[status] || 'ri-question-line';
    const color = colors[status] || 'text-gray-600';

    statusElement.innerHTML = `<i class="${icon}"></i> <span class="${color}">${message}</span>`;
}

// عرض معلومات التحديث
function showUpdateInfo(info) {
    const updateInfoElement = document.getElementById('update-info');
    const versionElement = document.getElementById('update-version');
    const notesElement = document.getElementById('update-notes');

    if (updateInfoElement && versionElement && notesElement) {
        versionElement.textContent = `الإصدار الجديد: ${info.version}`;
        notesElement.textContent = info.releaseNotes || 'تحديثات وتحسينات عامة';
        updateInfoElement.classList.remove('hidden');
    }
}

// إخفاء معلومات التحديث
function hideUpdateInfo() {
    const updateInfoElement = document.getElementById('update-info');
    if (updateInfoElement) {
        updateInfoElement.classList.add('hidden');
    }
}

// إظهار زر التثبيت
function showInstallButton() {
    const installButton = document.getElementById('install-update-btn');
    if (installButton) {
        installButton.classList.remove('hidden');
    }
}

// إخفاء زر التثبيت
function hideInstallButton() {
    const installButton = document.getElementById('install-update-btn');
    if (installButton) {
        installButton.classList.add('hidden');
    }
}

// إظهار شريط ال��قدم
function showProgressBar() {
    const progressContainer = document.getElementById('update-progress-container');
    if (progressContainer) {
        progressContainer.classList.remove('hidden');
    }
}

// إخفاء شريط التقدم
function hideProgressBar() {
    const progressContainer = document.getElementById('update-progress-container');
    if (progressContainer) {
        progressContainer.classList.add('hidden');
    }
}

// تحديث شريط التقدم
function updateProgressBar(percent) {
    const progressBar = document.getElementById('update-progress-bar');
    const progressText = document.getElementById('update-progress-text');
    
    if (progressBar) {
        progressBar.style.width = `${percent}%`;
    }
    
    if (progressText) {
        progressText.textContent = `${percent}%`;
    }
}

// الحصول على الإصدار الحالي
function getCurrentVersion() {
    // يمكن الحصول على الإصدار من package.json أو من متغير عام
    return '1.0.0'; // سيتم تحديثه تلقائياً من package.json
}

// تهيئة التحديثات عند تحميل الصفحة
if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', () => {
        initUpdater();
    });
}

// تصدير الدوال للاستخدام العام
if (typeof window !== 'undefined') {
    window.updaterAPI = {
        checkForUpdates,
        downloadAndInstallUpdate,
        getCurrentVersion
    };
}