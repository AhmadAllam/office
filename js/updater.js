// ===== نظام التحديثات =====

// إعدادات مستودع GitHub للتحديثات
const UPDATE_CONFIG = {
    owner: 'AhmadAllam', // اسم المستخدم في GitHub
    repo: 'office', // اسم مستودع التحديثات
    currentVersion: '0.0.0' // سيتم جلبه من التطبيق
};

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

// فحص التحديثات من GitHub Releases
async function checkForUpdatesFromGitHub() {
    try {
        let resultFromVersion = null;
        // أولاً، جرب الحصول على معلومات من ملف version.json إذا كان موجوداً
        try {
            const versionUrl = `https://api.github.com/repos/${UPDATE_CONFIG.owner}/${UPDATE_CONFIG.repo}/contents/version.json`;
            const versionResponse = await fetch(versionUrl);
            
            if (versionResponse.ok) {
                const versionData = await versionResponse.json();
                const content = JSON.parse(atob(versionData.content));
                
                const currentVersion = UPDATE_CONFIG.currentVersion;
                const latestVersion = content.version;
                const isNewerVersion = compareVersions(latestVersion, currentVersion) > 0;
                
                resultFromVersion = {
                    hasUpdate: isNewerVersion,
                    version: latestVersion,
                    releaseNotes: content.releaseNotes,
                    releaseDate: content.releaseDate,
                    downloadUrl: content.downloadUrl,
                    mandatory: content.mandatory || false
                };
            }
        } catch (versionError) {
            console.log('ملف version.json غير موجود، سيتم استخدام GitHub Releases API');
        }
        
        // إذا لم يكن ملف version.json موجوداً، استخدم GitHub Releases API مع fallback ذكي
        const headers = { 'Accept': 'application/vnd.github.v3+json', 'User-Agent': 'LawyerApp' };
        const latestUrl = `https://api.github.com/repos/${UPDATE_CONFIG.owner}/${UPDATE_CONFIG.repo}/releases/latest`;
        let response = await fetch(latestUrl, { headers });

        const normalizeVersionTag = (tag) => {
            if (!tag) return '';
            const m = String(tag).match(/(\d+\.\d+\.\d+)/);
            return m ? m[1] : String(tag).replace(/^v/i, '');
        };
        const pickDownloadUrl = (assets) => {
            if (!Array.isArray(assets)) return '';
            const file = assets.find(a => {
                const n = (a && a.name ? a.name : '').toLowerCase();
                return n.endsWith('.exe') || n.endsWith('.dmg') || n.endsWith('.appimage') || n.includes('setup') || n.includes('installer');
            }) || assets[0];
            return file ? file.browser_download_url : '';
        };
        const chooseRelease = (list) => {
            if (!Array.isArray(list) || list.length === 0) return null;
            // اختَر أقرب إصدار منشور (غير مسودة). نسمح بـ prerelease ليظهر مبكراً إذا تم وضعه كذلك.
            const nonDraft = list.filter(r => !r.draft);
            return (nonDraft[0]) || list[0];
        };

        let release;
        let list = [];
        const allUrl = `https://api.github.com/repos/${UPDATE_CONFIG.owner}/${UPDATE_CONFIG.repo}/releases`;
        if (response.ok) {
            release = await response.json();
            try {
                const respAll = await fetch(allUrl, { headers });
                if (respAll.ok) list = await respAll.json();
            } catch (_) {}
        } else {
            const respAll = await fetch(allUrl, { headers });
            if (!respAll.ok) throw new Error(`HTTP ${respAll.status}: ${respAll.statusText}`);
            list = await respAll.json();
            release = chooseRelease(list);
            if (!release) throw new Error('لا توجد إصدارات منشورة');
        }

        const currentVersion = UPDATE_CONFIG.currentVersion;

        // اختر أفضل مرشح: أحدث إصدار semver أكبر من الإصدار الحالي من القائمة، وإلا احتفظ بـ /latest
        const pickNewerFromList = (arr) => {
            if (!Array.isArray(arr)) return null;
            const candidates = arr.filter(r => r && !r.draft).map(r => ({ r, v: normalizeVersionTag(r.tag_name) }))
                .filter(x => x.v && compareVersions(x.v, currentVersion) > 0);
            if (candidates.length === 0) return null;
            candidates.sort((a, b) => compareVersions(b.v, a.v));
            return candidates[0].r;
        };
        const newer = pickNewerFromList(list);
        const candidate = newer || release;

        const latestVersion = normalizeVersionTag(candidate.tag_name);
        const isNewerVersion = compareVersions(latestVersion, currentVersion) > 0;

        const downloadUrl = pickDownloadUrl(candidate.assets || []);

        const releaseResult = {
            hasUpdate: isNewerVersion,
            version: latestVersion || '0.0.0',
            releaseNotes: release.body || 'تحديثات وتحسينات عامة',
            releaseDate: release.published_at || release.created_at || '',
            downloadUrl,
            mandatory: false
        };
        return releaseResult.hasUpdate ? releaseResult : (resultFromVersion || releaseResult);
        
    } catch (error) {
        console.error('خطأ في فحص التحديثات من GitHub:', error);
        throw error;
    }
}

// مقارنة الإصدارات (مثل 1.0.1 مع 1.0.0)
function compareVersions(version1, version2) {
    const v1parts = version1.split('.').map(Number);
    const v2parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
        const v1part = v1parts[i] || 0;
        const v2part = v2parts[i] || 0;
        
        if (v1part > v2part) return 1;
        if (v1part < v2part) return -1;
    }
    
    return 0;
}

// فحص التحديثات يدوياً
async function checkForUpdates() {
    if (isCheckingForUpdates) {
        showToast('جاري فحص التحديثات بالفعل...', 'info');
        return;
    }

    try {
        isCheckingForUpdates = true;
        updateUpdateStatus('جاري فحص التحديثات...', 'checking');

        // تحديث الإصدار الحالي من التطبيق
        try {
            const ver = await getCurrentVersion();
            if (ver) UPDATE_CONFIG.currentVersion = ver;
        } catch (e) {}
        
        // فحص من GitHub
        const githubResult = await checkForUpdatesFromGitHub();
        try { if (typeof showToast === 'function') showToast(`GitHub latest=${githubResult.version || 'n/a'} | local=${UPDATE_CONFIG.currentVersion} | hasUpdate=${githubResult.hasUpdate ? '1' : '0'} | hasExe=${githubResult.downloadUrl ? '1' : '0'}`, 'info'); } catch (_) {}
        
        if (githubResult.hasUpdate) {
            updateInfo = {
                version: githubResult.version,
                releaseNotes: githubResult.releaseNotes,
                releaseDate: githubResult.releaseDate,
                downloadUrl: githubResult.downloadUrl,
                mandatory: githubResult.mandatory
            };
            updateUpdateStatus(`تحديث متاح: الإصدار ${githubResult.version}`, 'available');
            showUpdateInfo(updateInfo);
            if (githubResult.downloadUrl) {
                showInstallButton();
            } else {
                hideInstallButton();
                showToast('تحديث متاح، لكن ملف Windows غير مرفق ضمن الأصول', 'warning');
            }
            showToast(`تم العثور على تحديث جديد: الإصدار ${githubResult.version}`, 'success');
        } else {
            updateUpdateStatus('التطبيق محدث لأحدث إصدار', 'up-to-date');
            hideInstallButton();
            hideUpdateInfo();
            showToast('التطبيق محدث لأحدث إصدار', 'success');
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
    if (isDownloadingUpdate) {
        showToast('جاري تحميل التحديث بالفعل...', 'info');
        return;
    }

    if (!updateInfo || !updateInfo.downloadUrl) {
        showToast('لا يوجد تحديث متاح للتحميل', 'warning');
        return;
    }

    const confirmed = confirm(`تحميل وتثبيت الإصدار ${updateInfo.version} الآن؟`);
    if (!confirmed) return;

    try {
        isDownloadingUpdate = true;
        updateUpdateStatus('جاري تحميل التحديث...', 'downloading');
        showProgressBar();
        hideInstallButton();

        if (window.electronAPI && window.electronAPI.downloadAndInstallFromGitHub) {
            const safeName = `LawApp-Setup-v${updateInfo.version}.exe`;
            const result = await window.electronAPI.downloadAndInstallFromGitHub(updateInfo.downloadUrl, safeName);
            if (!result || !result.success) throw new Error(result && result.error ? result.error : 'فشل عملية التحميل/التثبيت');
            updateUpdateStatus('بدء التثبيت وإغلاق التطبيق...', 'installing');
        } else {
            window.open(updateInfo.downloadUrl, '_blank');
            updateUpdateStatus('تم فتح رابط التحميل. يرجى التثبيت يدوياً.', 'downloaded');
        }
    } catch (error) {
        console.error('خطأ في تحميل التحديث:', error);
        updateUpdateStatus('فشل في تحميل التحديث', 'error');
        hideProgressBar();
        showInstallButton();
        showToast('فشل في تحميل التحديث: ' + error.message, 'error');
    } finally {
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

    if (!(updateInfoElement && versionElement && notesElement)) return;

    versionElement.textContent = `الإصدار الجديد: ${info.version}`;

    const raw = (info.releaseNotes || '').trim();

    const escapeHTML = (s) => s.replace(/[&<>"']/g, (ch) => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    }[ch]));

    const formatLines = (text) => {
        const lines = text.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
        if (lines.length === 0) return '<span class="text-gray-600">تحديثات وتحسينات عامة</span>';
        const items = lines.map(l => l.replace(/^[-*•]\s+/, '').replace(/^\d+\.[\s]+/, ''));
        return '<ul class="list-disc pr-5 space-y-1">' + items.map(it => '<li>' + escapeHTML(it) + '</li>').join('') + '</ul>';
    };

    notesElement.innerHTML = formatLines(raw);
    updateInfoElement.classList.remove('hidden');
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
async function getCurrentVersion() {
    try {
        if (window.electronAPI && window.electronAPI.getAppVersion) {
            const res = await window.electronAPI.getAppVersion();
            if (res && res.success && res.version) return res.version;
        }
    } catch (e) {}
    return UPDATE_CONFIG.currentVersion || '0.0.0';
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