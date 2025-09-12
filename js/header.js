async function updateCountersInHeader() {
    try {
        const clientCount = await getCount('clients');
        const caseCount = await getCount('cases');
        const tomorrowSessionsCount = await getTomorrowSessionsCount();
        const tomorrowAdministrativeCount = await getTomorrowAdministrativeCount();
        
        const clientCountElement = document.getElementById('client-count');
        const lawsuitCountElement = document.getElementById('lawsuit-count');
        const tomorrowSessionsCountElement = document.getElementById('tomorrow-sessions-count');
        const tomorrowAdministrativeCountElement = document.getElementById('tomorrow-administrative-count');
        
        if (clientCountElement) clientCountElement.textContent = clientCount.toString();
        if (lawsuitCountElement) lawsuitCountElement.textContent = caseCount.toString();
        if (tomorrowSessionsCountElement) {
            tomorrowSessionsCountElement.textContent = tomorrowSessionsCount > 0 ? tomorrowSessionsCount.toString() : '0';
        }
        if (tomorrowAdministrativeCountElement) {
            tomorrowAdministrativeCountElement.textContent = tomorrowAdministrativeCount > 0 ? tomorrowAdministrativeCount.toString() : '0';
        }
        const isHomePage = /(^|\\|\/)index\.html$/.test(window.location.pathname) || window.location.pathname === '/' || window.location.pathname === '';
        const hasSessions = tomorrowSessionsCount > 0;
        const hasAdmin = tomorrowAdministrativeCount > 0;
        const hasAnyTomorrow = hasSessions || hasAdmin;
        if (isHomePage && hasAnyTomorrow) {
            // Avoid playing audio before unlocking if password overlay is active
            const isLocked = !!document.getElementById('password-overlay');
            if (!isLocked) {
                try {
                    let mode = 'hourly';
                    try {
                        const v = await getSetting('tomorrowAudioMode');
                        if (v === 'off' || v === 'always' || v === 'hourly' || v === '2h' || v === '3h') mode = v;
                    } catch (e) {}
                    if (mode !== 'off') {
                        let src = '';
                        let key = '';
                        if (hasSessions && hasAdmin) { src = 'audio/s-m.mp3'; key = 'tomorrowCombinedAudioLast'; }
                        else if (hasSessions) { src = 'audio/s.mp3'; key = 'tomorrowAudioLast'; }
                        else { src = 'audio/m.mp3'; key = 'tomorrowAdminAudioLast'; }
                        if (mode === 'always') {
                            enqueueAlert(src);
                        } else {
                            const now = Date.now();
                            const last = parseInt(localStorage.getItem(key) || '0', 10);
                            let gap = 3600000;
                            if (mode === '2h') gap = 2 * 3600000;
                            else if (mode === '3h') gap = 3 * 3600000;
                            if (!Number.isFinite(last) || (now - last) >= gap) {
                                enqueueAlert(src);
                                localStorage.setItem(key, String(now));
                            }
                        }
                    }
                } catch (e) {}
            }
        }
        
    } catch (error) {
    }
}

function getCurrentDate() {
    return new Date().toISOString().split('T')[0];
}
function enqueueAlert(src) {
    if (!window.__alertQueue) window.__alertQueue = [];
    window.__alertQueue.push(src);
    if (!window.__isAlertPlaying) {
        const next = () => {
            const s = window.__alertQueue.shift();
            if (!s) { window.__isAlertPlaying = false; return; }
            window.__isAlertPlaying = true;
            try {
                const a = new Audio(s);
                a.addEventListener('ended', () => { window.__isAlertPlaying = false; next(); });
                a.addEventListener('error', () => { window.__isAlertPlaying = false; next(); });
                a.play().catch(() => { window.__isAlertPlaying = false; next(); });
            } catch (e) { window.__isAlertPlaying = false; next(); }
        };
        next();
    }
}

async function startDateAlternation() {
    const displayElement = document.getElementById('alternating-display');
    const labelElement = document.getElementById('alternating-label');
    const iconElement = document.getElementById('alternating-icon');
    
    if (!displayElement || !labelElement || !iconElement) return;
    
    let isShowingDate = true;
    let officeName = "محامين مصر الرقمية"; // القيمة الافتراضية
    

    try {
        const savedOfficeName = await getSetting('officeName');
        if (savedOfficeName) {
            officeName = savedOfficeName;
        }
    } catch (error) {

    }
    
    function updateDisplay() {
        labelElement.style.opacity = '0';
        displayElement.style.opacity = '0';
        iconElement.style.opacity = '0';
        
        setTimeout(() => {
            if (isShowingDate) {
                labelElement.textContent = 'اليوم';
                labelElement.className = 'text-xs text-black font-bold alternating-label fade-in';
                
                displayElement.textContent = getCurrentDate();
                displayElement.className = 'alternating-text fade-in';
                
                iconElement.className = 'ri-calendar-line alternating-icon fade-in';
            } else {
                labelElement.textContent = 'المكتب';
                labelElement.className = 'text-xs text-black font-bold alternating-label fade-in';
                
                displayElement.textContent = officeName;
                displayElement.className = 'alternating-text fade-in';
                
                iconElement.className = 'ri-briefcase-line alternating-icon fade-in';
            }
            
            setTimeout(() => {
                labelElement.style.opacity = '1';
                displayElement.style.opacity = '1';
                iconElement.style.opacity = '1';
            }, 50);
            
            isShowingDate = !isShowingDate;
        }, 250);
    }
    
    updateDisplay();
    setInterval(updateDisplay, 4000);
}

async function enforceAppPassword() {
    try {
        if (typeof initDB === 'function') {
            try { await initDB(); } catch (e) {}
        }
        const stored = await getSetting('appPasswordHash');
        if (!stored) return;
        if (sessionStorage.getItem('auth_ok') === '1') return;
        const overlay = document.createElement('div');
        overlay.id = 'password-overlay';
        overlay.className = 'fixed inset-0 z-[9999] flex items-center justify-center bg-black';
        overlay.innerHTML = `
            <div class="bg-white rounded-lg w-[95vw] max-w-xl p-8 border border-gray-200">
                <div class="flex items-center justify-center gap-2 mb-4">
                    <i class="ri-lock-2-line text-pink-600 text-lg"></i>
                    <span class="text-gray-800 font-semibold text-lg">أدخل كلمة المرور</span>
                </div>
                <form id="app-login-form" class="space-y-4">
                    <input id="app-login-password" type="password" class="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-pink-500 text-center text-lg" placeholder="كلمة المرور" autocomplete="current-password">
                    <div id="app-login-error" class="text-red-600 text-sm text-center -mt-2 min-h-[1rem]"></div>
                    <button id="app-login-btn" class="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-lg text-lg">دخول</button>
                </form>
            </div>
        `;
        document.body.appendChild(overlay);
        try { document.body.style.overflow = 'hidden'; } catch(e) {}
        const input = overlay.querySelector('#app-login-password');
        const form = overlay.querySelector('#app-login-form');
        const errorEl = overlay.querySelector('#app-login-error');
        const showError = (msg) => {
            if (errorEl) errorEl.textContent = msg;
            if (input) input.classList.add('border-red-500','ring-2','ring-red-500');
        };
        const clearError = () => {
            if (errorEl) errorEl.textContent = '';
            if (input) input.classList.remove('border-red-500','ring-2','ring-red-500');
        };
        const doCheck = async () => {
            const val = (input && input.value ? input.value.trim() : '');
            if (!val) { showError('يرجى إدخال كلمة المرور'); if (input) input.focus(); return; }
            const enc = new TextEncoder().encode(val);
            const buf = await crypto.subtle.digest('SHA-256', enc);
            const hex = Array.from(new Uint8Array(buf)).map(b=>b.toString(16).padStart(2,'0')).join('');
            if (hex === stored) {
                sessionStorage.setItem('auth_ok','1');
                overlay.remove();
                try { document.body.style.overflow = ''; } catch(e) {}
                // Re-run header updates to trigger audio after unlocking (if applicable)
                try { if (typeof updateCountersInHeader === 'function') updateCountersInHeader(); } catch(e) {}
            } else {
                showError('كلمة المرور غير صحيحة');
                if (input) { input.focus(); input.select(); }
            }
        };
        form.addEventListener('submit', (e)=>{ e.preventDefault(); doCheck(); });
        if (input) input.addEventListener('input', clearError);
        setTimeout(()=>{ if (input) input.focus(); }, 50);
    } catch (e) {}
}
// Copy-on-click for header title + inject global quick home button
window.addEventListener('DOMContentLoaded', async () => {
    await enforceAppPassword();

    // Add quick Home button on the far side of the title bar if header exists
    try {
        const header = document.querySelector('header');
        if (header) {
            let container = header.querySelector('.grid');
            if (!container) container = header.querySelector('.flex');
            const isHome = /(^|\\|\/)index\.html$/.test(window.location.pathname) || window.location.pathname === '/' || window.location.pathname === '';
            if (isHome) {
                const existingQuickHome = header.querySelector('#quick-home-btn');
                if (existingQuickHome) existingQuickHome.remove();
            } else {
                const existingQuickHome = header.querySelector('#quick-home-btn');
                if (!existingQuickHome) {
                    const btn = document.createElement('button');
                    btn.id = 'quick-home-btn';
                    btn.className = 'inline-flex items-center gap-1 px-2 py-1 bg-transparent border border-white/20 rounded-full shadow-sm text-white hover:bg-white/10 text-sm';
                    btn.innerHTML = '<i class="ri-home-5-line text-white text-base"></i><span class="text-white">الرئيسيه</span>';
                    btn.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        window.location.href = 'index.html';
                    });

                    const leftSlot = document.createElement('div');
                    leftSlot.className = 'justify-self-end';
                    leftSlot.appendChild(btn);

                    const grid = header.querySelector('.grid');
                    if (grid && getComputedStyle(grid).display.includes('grid')) {
                        const cols = grid.getAttribute('class') || '';
                        if (!cols.includes('grid-cols-3')) grid.classList.add('grid-cols-3');
                        const lastCell = grid.children[2];
                        if (lastCell) {
                            lastCell.appendChild(btn);
                        } else {
                            const cell = document.createElement('div');
                            cell.className = 'justify-self-end';
                            cell.appendChild(btn);
                            grid.appendChild(cell);
                        }
                    } else if (container) {
                        container.appendChild(leftSlot);
                    } else {
                        header.appendChild(leftSlot);
                    }
                }
            }
        }
    } catch (e) {}

    try {
        const enforceBackLabel = () => {
            const backBtn = document.getElementById('back-to-main');
            if (!backBtn) return;
            let backSpan = backBtn.querySelector('span');
            if (!backSpan) {
                backSpan = document.createElement('span');
                backSpan.className = 'text-white';
                backBtn.appendChild(backSpan);
            }
            if (backSpan.textContent !== 'رجوع') backSpan.textContent = 'رجوع';
        };
        enforceBackLabel();
        const headerEl = document.querySelector('header');
        if (headerEl && !window.__backBtnObserverBound) {
            window.__backBtnObserverBound = true;
            const obs = new MutationObserver(() => enforceBackLabel());
            obs.observe(headerEl, { childList: true, subtree: true });
        }
    } catch (e) {}

    const copyableTitle = document.getElementById('copyable-title');
    const pageTitleSpan = document.getElementById('page-title');
    if (copyableTitle && pageTitleSpan) {
        copyableTitle.addEventListener('click', async () => {
            const text = pageTitleSpan.textContent.trim();
            try {
                await navigator.clipboard.writeText(text);
                if (typeof showToast === 'function') showToast('تم النسخ', 'success');
            } catch (e) {
                const ta = document.createElement('textarea');
                ta.value = text;
                document.body.appendChild(ta);
                ta.select();
                document.execCommand('copy');
                document.body.removeChild(ta);
            }
        });
    }
});
