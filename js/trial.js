(function(){
// نظام الترخيص الجديد - بناءً على معرف GitHub مع فترة تجريبية 15 يوم
async function initLicenseSystem(){
    try{
        await initDB();
    }catch(e){}
    
    // فحص حالة الترخيص المحفوظة محلياً
    let isLicensed = await getSetting("licensed");
    isLicensed = isLicensed === true || isLicensed === "true";
    
    let licenseId = await getSetting("licenseId");
    
    // إدارة الفترة التجريبية إذا لم يكن مرخص
    let trialInfo = null;
    if (!isLicensed) {
        trialInfo = await initTrialPeriod();
        
        // فحص انتهاء الفترة التجريبية
        if (trialInfo.expired) {
            showTrialExpiredOverlay();
        }
    }
    
    // عرض واجهة الترخيص في الإعدادات
    showLicenseInterface(isLicensed, licenseId, trialInfo);
}

// إدارة الفترة التجريبية
async function initTrialPeriod() {
    const now = Date.now();
    let trialStartMs = await getSetting("trialStartMs");
    let trialEndMs = await getSetting("trialEndMs");
    let lastCheckTime = await getSetting("lastCheckTime");
    
    // إذا لم تبدأ الفترة التجريبية بعد، ابدأها
    if (!trialStartMs || !trialEndMs) {
        trialStartMs = now;
        trialEndMs = now + (15 * 24 * 60 * 60 * 1000); // 15 يوم
        
        try {
            await setSetting("trialStartMs", trialStartMs);
            await setSetting("trialEndMs", trialEndMs);
            await setSetting("lastCheckTime", now);
        } catch (e) {}
    } else {
        // كشف التلاعب في التاريخ
        if (lastCheckTime && now < lastCheckTime) {
            // المستخدم رجع التاريخ للخلف - خصم يوم من الفترة التجريبية
            const penaltyMs = 24 * 60 * 60 * 1000; // يوم واحد
            trialEndMs = Math.max(trialStartMs, trialEndMs - penaltyMs);
            
            try {
                await setSetting("trialEndMs", trialEndMs);
            } catch (e) {}
        }
        
        // تحديث آخر وقت فحص
        try {
            await setSetting("lastCheckTime", now);
        } catch (e) {}
    }
    
    const remainingDays = Math.max(0, Math.ceil((trialEndMs - now) / (24 * 60 * 60 * 1000)));
    const expired = now >= trialEndMs;
    
    return {
        startDate: new Date(trialStartMs),
        endDate: new Date(trialEndMs),
        remainingDays,
        expired,
        totalDays: 15
    };
}

function showLicenseInterface(isLicensed, licenseId, trialInfo) {
    if(!/settings\.html$/.test(window.location.pathname)) return;
    
    const container = document.querySelector('#modal-content .grid');
    if(!container) {
        setTimeout(() => showLicenseInterface(isLicensed, licenseId, trialInfo), 50);
        return;
    }
    
    let licenseCard = document.getElementById('license-settings-card');
    if(!licenseCard) {
        licenseCard = document.createElement('div');
        licenseCard.id = 'license-settings-card';
        licenseCard.className = 'bg-white border-4 border-black rounded-xl p-4 shadow-lg transition-all h-fit';
        container.appendChild(licenseCard);
    }
    
    let status, color, icon;
    
    if (isLicensed) {
        status = 'مرخّص';
        color = 'green';
        icon = 'ri-shield-check-line';
    } else if (trialInfo && trialInfo.expired) {
        status = 'منتهي الصلاحية';
        color = 'red';
        icon = 'ri-time-line';
    } else {
        status = 'فترة تجريبية';
        color = 'blue';
        icon = 'ri-key-line';
    }
    
    let html = '';
    html += '<div class="text-center mb-4">';
    html += `<div class="w-12 h-12 bg-${color}-500 rounded-xl flex items-center justify-center mx-auto mb-3 shadow-md">`;
    html += `<i class="${icon} text-white text-xl"></i>`;
    html += '</div>';
    html += `<h3 class="text-lg font-bold text-${color}-700 mb-1">حالة الترخيص</h3>`;
    html += `<p class="text-sm text-gray-600">${status}</p>`;
    html += '</div>';
    
    if(isLicensed) {
        html += '<div class="text-sm space-y-2 mb-4">';
        html += '<div class="flex items-center justify-between">';
        html += '<span class="text-gray-600">المعرف:</span>';
        html += `<span class="text-gray-800 font-semibold">${licenseId || 'غير محدد'}</span>`;
        html += '</div>';
        html += '<div class="flex items-center justify-between">';
        html += '<span class="text-gray-600">الحالة:</span>';
        html += '<span class="text-green-600 font-semibold">✅ مفعّل</span>';
        html += '</div>';
        html += '</div>';
        
        html += '<div class="text-xs text-center text-gray-500 bg-gray-50 p-2 rounded-lg mb-3">';
        html += 'تم تفعيل التطبيق بنجاح. جميع الميزات متاحة بلا قيود.';
        html += '</div>';
        
        html += '<div class="text-xs text-center text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">';
        html += '<i class="ri-shield-line text-sm"></i> ';
        html += '<strong>تحذير:</strong> لا تشارك معرف الترخيص مع أحد لحماية بياناتك. ';
        html += 'المشاركة ستعطل المزامنة وتعرض ملفاتك للعبث بسبب تعدد المستخدمين غير المشروع.';
        html += '</div>';
    } else {
        // عرض معلومات الفترة التجريبية
        if (trialInfo) {
            html += '<div class="text-sm space-y-2 mb-4">';
            html += '<div class="flex items-center justify-between">';
            html += '<span class="text-gray-600">الأيام المتبقية:</span>';
            html += `<span class="text-${trialInfo.expired ? 'red' : 'blue'}-600 font-semibold">${trialInfo.remainingDays} يوم</span>`;
            html += '</div>';
            html += '<div class="flex items-center justify-between">';
            html += '<span class="text-gray-600">حد الموكلين:</span>';
            html += '<span class="text-gray-800 font-semibold">15 موكل</span>';
            html += '</div>';
            html += '</div>';
            
            if (trialInfo.expired) {
                html += '<div class="text-xs text-center text-red-600 bg-red-50 p-2 rounded-lg mb-3">';
                html += '⚠️ انتهت الفترة التجريبية. يرجى التفعيل للمتابعة.';
                html += '</div>';
            } else {
                html += '<div class="text-xs text-center text-blue-600 bg-blue-50 p-2 rounded-lg mb-3">';
                html += `📅 الفترة التجريبية: ${trialInfo.remainingDays} أيام متبقية من أصل ${trialInfo.totalDays} يوم`;
                html += '</div>';
            }
        }
        
        html += '<div class="space-y-3">';
        html += '<div>';
        html += '<label class="block text-sm font-medium text-gray-700 mb-2">معرف الترخيص:</label>';
        html += '<input type="text" id="license-id-input" placeholder="أدخل معرف الترخيص..." ';
        html += 'class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-center">';
        html += '</div>';
        html += '<button id="verify-license-btn" class="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-md transition-colors">';
        html += '<i class="ri-shield-check-line text-lg"></i>تحقق من الترخيص';
        html += '</button>';
        html += '<div id="license-status" class="text-xs text-center text-gray-600"></div>';
        html += '</div>';
    }
    
    licenseCard.innerHTML = html;
    
    // ربط الأحداث
    if(!isLicensed) {
        const verifyBtn = document.getElementById('verify-license-btn');
        const licenseInput = document.getElementById('license-id-input');
        
        if(verifyBtn) {
            verifyBtn.addEventListener('click', () => verifyLicense());
        }
        
        if(licenseInput) {
            licenseInput.addEventListener('keypress', (e) => {
                if(e.key === 'Enter') {
                    verifyLicense();
                }
            });
        }
    }
}

async function verifyLicense() {
    const licenseInput = document.getElementById('license-id-input');
    const verifyBtn = document.getElementById('verify-license-btn');
    const statusEl = document.getElementById('license-status');
    
    if(!licenseInput || !verifyBtn || !statusEl) return;
    
    const licenseId = licenseInput.value.trim();
    
    if(!licenseId) {
        setLicenseStatus('يرجى إدخال معرف الترخيص', 'text-red-600');
        return;
    }
    
    // تعطيل الواجهة أثناء التحقق
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="ri-loader-4-line text-lg animate-spin"></i>جاري التحقق...';
    licenseInput.disabled = true;
    setLicenseStatus('جاري التحقق من المعرف...', 'text-blue-600');
    
    try {
        // استخدام نفس إعدادات GitHub من settings.js
        const GITHUB_CONFIG = {
            owner: atob('QWhtYWRBbGxhbQ=='), // AhmadAllam
            repo: atob('bGF3eWVycy1kYXRh'), // lawyers-data
            token: (() => {
                const part1 = atob('Z2hwX1ZTUTVBaExaaENTdGxnRTUydUloY21SYg==');
                const part2 = atob('N09oemw3NDhhREkz');
                return part1 + part2;
            })()
        };
        
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${licenseId}.json`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if(response.status === 404) {
            setLicenseStatus('❌ معرف الترخيص غير صحيح', 'text-red-600');
            return;
        }
        
        if(!response.ok) {
            throw new Error(`خطأ في التحقق: ${response.status}`);
        }
        
        // المعرف صحيح - حفظ الترخيص محلياً
        await setSetting("licensed", true);
        await setSetting("licenseId", licenseId);
        
        setLicenseStatus('✅ تم التفعيل بنجاح!', 'text-green-600');
        
        if(typeof showToast === "function") {
            try { 
                showToast("تم تفعيل التطبيق بنجاح!", "success"); 
            } catch(_) {}
        }
        
        // إعادة تحديث الواجهة
        setTimeout(() => {
            showLicenseInterface(true, licenseId, null);
        }, 1500);
        
    } catch(error) {
        console.error('خطأ في التحقق من الترخيص:', error);
        setLicenseStatus('❌ فشل في التحقق من الترخيص', 'text-red-600');
        
        if(typeof showToast === "function") {
            try { 
                showToast("فشل في التحقق من الترخيص", "error"); 
            } catch(_) {}
        }
    } finally {
        // إعادة تفعيل الواجهة
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="ri-shield-check-line text-lg"></i>تحقق من الترخيص';
        licenseInput.disabled = false;
    }
}

function setLicenseStatus(message, className) {
    const statusEl = document.getElementById('license-status');
    if(statusEl) {
        statusEl.textContent = message;
        statusEl.className = `text-xs text-center mt-2 ${className}`;
    }
}

// عرض رسالة انتهاء الفترة التجريبية
function showTrialExpiredOverlay() {
    let overlay = document.getElementById("trial-expired-overlay");
    if (overlay) return;
    
    overlay = document.createElement("div");
    overlay.id = "trial-expired-overlay";
    overlay.className = "fixed inset-0 z-[9999] flex items-center justify-center bg-black/90";
    overlay.innerHTML = `
        <div class="w-[95vw] max-w-md bg-white rounded-xl p-6 flex flex-col items-center gap-4 shadow-2xl">
            <div class="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-2">
                <i class="ri-time-line text-white text-2xl"></i>
            </div>
            <h3 class="text-xl font-bold text-gray-800 text-center">انتهت الفترة التجريبية</h3>
            <p class="text-gray-600 text-center text-sm">
                انتهت فترة الـ 15 يوم التجريبية. يرجى تفعيل الترخيص للمتابعة.
            </p>
            <div class="w-full space-y-3">
                <input type="text" id="overlay-license-input" placeholder="أدخل معرف الترخيص..." 
                       class="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:ring-2 focus:ring-blue-500">
                <button id="overlay-verify-btn" class="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold flex items-center justify-center gap-2">
                    <i class="ri-shield-check-line text-lg"></i>تفعيل الآن
                </button>
            </div>
            <div id="overlay-status" class="text-xs text-center text-gray-600"></div>
        </div>
    `;
    
    try {
        document.body.appendChild(overlay);
        document.body.style.overflow = "hidden";
        
        // ربط الأحداث
        const verifyBtn = document.getElementById("overlay-verify-btn");
        const licenseInput = document.getElementById("overlay-license-input");
        
        if (verifyBtn) {
            verifyBtn.addEventListener("click", () => verifyLicenseFromOverlay());
        }
        
        if (licenseInput) {
            licenseInput.addEventListener("keypress", (e) => {
                if (e.key === 'Enter') {
                    verifyLicenseFromOverlay();
                }
            });
        }
    } catch (e) {}
}

// التحقق من الترخيص من النافذة المنبثقة
async function verifyLicenseFromOverlay() {
    const licenseInput = document.getElementById('overlay-license-input');
    const verifyBtn = document.getElementById('overlay-verify-btn');
    const statusEl = document.getElementById('overlay-status');
    
    if (!licenseInput || !verifyBtn || !statusEl) return;
    
    const licenseId = licenseInput.value.trim();
    
    if (!licenseId) {
        statusEl.textContent = 'يرجى إدخال معرف الترخيص';
        statusEl.className = 'text-xs text-center text-red-600';
        return;
    }
    
    // تعطيل الواجهة أثناء التحقق
    verifyBtn.disabled = true;
    verifyBtn.innerHTML = '<i class="ri-loader-4-line text-lg animate-spin"></i>جاري التحقق...';
    licenseInput.disabled = true;
    statusEl.textContent = 'جاري التحقق من المعرف...';
    statusEl.className = 'text-xs text-center text-blue-600';
    
    try {
        // استخدام نفس إعدادات GitHub
        const GITHUB_CONFIG = {
            owner: atob('QWhtYWRBbGxhbQ=='), // AhmadAllam
            repo: atob('bGF3eWVycy1kYXRh'), // lawyers-data
            token: (() => {
                const part1 = atob('Z2hwX1ZTUTVBaExaaENTdGxnRTUydUloY21SYg==');
                const part2 = atob('N09oemw3NDhhREkz');
                return part1 + part2;
            })()
        };
        
        const url = `https://api.github.com/repos/${GITHUB_CONFIG.owner}/${GITHUB_CONFIG.repo}/contents/${licenseId}.json`;
        
        const response = await fetch(url, {
            headers: {
                'Authorization': `token ${GITHUB_CONFIG.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.status === 404) {
            statusEl.textContent = '❌ معرف الترخيص غير صحيح';
            statusEl.className = 'text-xs text-center text-red-600';
            return;
        }
        
        if (!response.ok) {
            throw new Error(`خطأ في التحقق: ${response.status}`);
        }
        
        // المعرف صحيح - حفظ الترخيص محلياً
        await setSetting("licensed", true);
        await setSetting("licenseId", licenseId);
        
        statusEl.textContent = '✅ تم التفعيل بنجاح!';
        statusEl.className = 'text-xs text-center text-green-600';
        
        if (typeof showToast === "function") {
            try { 
                showToast("تم تفعيل التطبيق بنجاح!", "success"); 
            } catch(_) {}
        }
        
        // إزالة النافذة المنبثقة
        setTimeout(() => {
            const overlay = document.getElementById("trial-expired-overlay");
            if (overlay) {
                try { 
                    overlay.remove(); 
                    document.body.style.overflow = ""; 
                } catch(_) {}
            }
            // إعادة تحميل الصفحة لتحديث الواجهة
            window.location.reload();
        }, 1500);
        
    } catch (error) {
        console.error('خطأ في التحقق من الترخيص:', error);
        statusEl.textContent = '❌ فشل في التحقق من الترخيص';
        statusEl.className = 'text-xs text-center text-red-600';
        
        if (typeof showToast === "function") {
            try { 
                showToast("فشل في التحقق من الترخيص", "error"); 
            } catch(_) {}
        }
    } finally {
        // إعادة تفعيل الواجهة
        verifyBtn.disabled = false;
        verifyBtn.innerHTML = '<i class="ri-shield-check-line text-lg"></i>تفعيل الآن';
        licenseInput.disabled = false;
    }
}

// تشغيل النظام
if(document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLicenseSystem);
} else {
    initLicenseSystem();
}
})();