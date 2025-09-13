async function updateCountersInHeader() {
    try {
        const clientCount = await getCount('clients');
        const caseCount = await getCount('cases');
        const todaySessionsCount = await getTodaySessionsCount();
        const tomorrowSessionsCount = await getTomorrowSessionsCount();
        const todayExpertSessionsCount = await getTodayExpertSessionsCount();
        const tomorrowExpertSessionsCount = await getTomorrowExpertSessionsCount();
        const tomorrowAdministrativeCount = await getTomorrowAdministrativeCount();
        
        const clientCountElement = document.getElementById('client-count');
        const lawsuitCountElement = document.getElementById('lawsuit-count');
        const tomorrowSessionsCountElement = document.getElementById('tomorrow-sessions-count');
        const tomorrowAdministrativeCountElement = document.getElementById('tomorrow-administrative-count');
        // Mobile mirrors
        const clientCountMobile = document.getElementById('client-count-mobile');
        const lawsuitCountMobile = document.getElementById('lawsuit-count-mobile');
        const tomorrowSessionsCountMobile = document.getElementById('tomorrow-sessions-count-mobile');
        const tomorrowAdministrativeCountMobile = document.getElementById('tomorrow-administrative-count-mobile');
        const outstandingAmountElement = document.getElementById('outstanding-amount');
        const notificationsBadgeDesktop = document.getElementById('notifications-badge');
        const notificationsBadgeMobile = document.getElementById('notifications-badge-mobile');
        
        if (clientCountElement) clientCountElement.textContent = clientCount.toString();
        if (clientCountMobile) clientCountMobile.textContent = clientCount.toString();
        if (lawsuitCountElement) lawsuitCountElement.textContent = caseCount.toString();
        if (lawsuitCountMobile) lawsuitCountMobile.textContent = caseCount.toString();
        if (tomorrowSessionsCountElement) {
            tomorrowSessionsCountElement.textContent = tomorrowSessionsCount > 0 ? tomorrowSessionsCount.toString() : '0';
        }
        if (tomorrowSessionsCountMobile) {
            tomorrowSessionsCountMobile.textContent = tomorrowSessionsCount > 0 ? tomorrowSessionsCount.toString() : '0';
        }
        if (tomorrowAdministrativeCountElement) {
            tomorrowAdministrativeCountElement.textContent = tomorrowAdministrativeCount > 0 ? tomorrowAdministrativeCount.toString() : '0';
        }
        if (tomorrowAdministrativeCountMobile) {
            tomorrowAdministrativeCountMobile.textContent = tomorrowAdministrativeCount > 0 ? tomorrowAdministrativeCount.toString() : '0';
        }
        if (outstandingAmountElement) {
            outstandingAmountElement.textContent = '2500'; // يمكن تحديث هذا لاحقاً من قاعدة البيانات
        }
        
        // تحديث بادج الإشعارات للجلسات (اليوم + الغد) + جلسات الخبراء (اليوم + الغد) + أعمال الغد
        const notifCount = (todaySessionsCount || 0)
            + (tomorrowSessionsCount || 0)
            + (todayExpertSessionsCount || 0)
            + (tomorrowExpertSessionsCount || 0)
            + (tomorrowAdministrativeCount || 0);
        [notificationsBadgeDesktop, notificationsBadgeMobile].forEach(badge => {
            if (!badge) return;
            if (notifCount > 0) {
                badge.style.display = 'inline-block';
                badge.textContent = String(notifCount);
            } else {
                badge.style.display = 'none';
                badge.textContent = '';
            }
        });
        
        // تحديث أشرطة التقدم
        updateProgressBars(clientCount, caseCount, tomorrowSessionsCount, tomorrowAdministrativeCount);
        const isHomePage = /(^|\\|\/)index\.html$/.test(window.location.pathname) || window.location.pathname === '/' || window.location.pathname === '';
        const hasSessions = tomorrowSessionsCount > 0;
        const hasExpert = tomorrowExpertSessionsCount > 0;
        const hasAdmin = tomorrowAdministrativeCount > 0;
        const hasAnyTomorrow = hasSessions || hasExpert || hasAdmin;
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
                    // Respect global mute setting
                    try {
                        const muted = await getSetting('notificationsMuted');
                        if (muted === true || muted === 'true') mode = 'off';
                    } catch (e) {}
                    if (mode !== 'off') {
                        let src = '';
                        let key = '';
                        // أولوية الأصوات لو في خبراء بكرة
                        if (hasExpert && (hasSessions || hasAdmin)) { src = 'audio/gs.mp3'; key = 'tomorrowExpertCombinedAudioLast'; }
                        else if (hasExpert) { src = 'audio/gs.mp3'; key = 'tomorrowExpertAudioLast'; }
                        else if (hasSessions && hasAdmin) { src = 'audio/s-m.mp3'; key = 'tomorrowCombinedAudioLast'; }
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
    try {
        // Prefer the visible/mobile notifications button when both exist
        function isVisible(el){
            if (!el) return false;
            const style = window.getComputedStyle(el);
            if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
            const rect = el.getBoundingClientRect();
            return (rect.width > 0 && rect.height > 0);
        }
        function getBellBtn(){
            const mobile = document.getElementById('notifications-btn-mobile');
            const desktop = document.getElementById('notifications-btn');
            if (isVisible(mobile)) return mobile;
            if (isVisible(desktop)) return desktop;
            return mobile || desktop;
        }
        const btn = getBellBtn();
        const menu = document.getElementById('notifications-menu');
        const list = document.getElementById('notifications-list');
        const toggleMuteBtn = document.getElementById('toggle-mute-btn');
        const viewBtn = document.getElementById('view-notifications-btn');

        // Popover elements
        const popover = document.getElementById('notifications-popover');
        const popoverList = document.getElementById('notifications-popover-list');
        const popoverToggleMuteBtn = document.getElementById('popover-toggle-mute-btn');

        // Ensure DB is initialized before reading settings
        try { if (typeof initDB === 'function') await initDB(); } catch (e) {}

        let outsideHandlerBound = false;

        // Update bell icon globally based on mute state
        function setNotificationsBellMutedIcon(muted) {
            try {
                const bellIcon = btn ? btn.querySelector('.material-symbols-outlined') : null;
                if (bellIcon) bellIcon.textContent = (muted === true || muted === 'true') ? 'notifications_off' : 'notifications';
            } catch (e) {}
        }
        window.setNotificationsBellMutedIcon = setNotificationsBellMutedIcon;

        async function refreshMuteLabel() {
            try {
                const muted = await getSetting('notificationsMuted');
                const label = (muted === true || muted === 'true') ? 'إلغاء الكتم' : 'كتم';
                if (toggleMuteBtn) toggleMuteBtn.textContent = label;
                if (popoverToggleMuteBtn) popoverToggleMuteBtn.textContent = label;
                setNotificationsBellMutedIcon(muted);
            } catch (e) {
                if (toggleMuteBtn) toggleMuteBtn.textContent = 'كتم';
                if (popoverToggleMuteBtn) popoverToggleMuteBtn.textContent = 'كتم';
                setNotificationsBellMutedIcon(false);
            }
        }
        // تزامن أولي عند تحميل الصفحة لضبط الأيقونة وحالة الأزرار
        await refreshMuteLabel();

        async function buildNotificationsList(targetEl) {
            if (!targetEl) return;
            targetEl.innerHTML = '';
            try {
                const todaySessions = await getTodaySessionsCount();
                const tomorrowSessions = await getTomorrowSessionsCount();
                const todayExperts = await getTodayExpertSessionsCount();
                const tomorrowExperts = await getTomorrowExpertSessionsCount();
                const tomorrowAdmin = await getTomorrowAdministrativeCount();
                const items = [];
                // عناصر مختلطة مع تفاصيل بسيطة
                const todaySessionsList = await getTodaySessions(3);
                const tomorrowSessionsList = await getTomorrowSessions(3);
                const todayExpertsList = await getTodayExpertSessions(3);
                const tomorrowExpertsList = await getTomorrowExpertSessions(3);
                const tomorrowAdminList = await getTomorrowAdministrative(3);

                const fmt = (d) => {
                    try { return new Date(d).toLocaleDateString('ar-EG'); } catch(e) { return d || ''; }
                };

                if (todaySessionsList.length) {
                    items.push({
                        icon: 'event',
                        title: `جلسات اليوم (${todaySessionsList.length})`,
                        lines: todaySessionsList.map(s => `دعوى ${s.caseNumber || s.caseId || ''} - ${fmt(s.sessionDate)}`)
                    });
                }
                if (tomorrowSessionsList.length) {
                    items.push({
                        icon: 'event_upcoming',
                        title: `جلسات الغد (${tomorrowSessionsList.length})`,
                        lines: tomorrowSessionsList.map(s => `دعوى ${s.caseNumber || s.caseId || ''} - ${fmt(s.sessionDate)}`)
                    });
                }
                if (todayExpertsList.length) {
                    items.push({
                        icon: 'groups',
                        title: `خبراء اليوم (${todayExpertsList.length})`,
                        lines: todayExpertsList.map(s => `${s.sessionTime || ''} - ${fmt(s.sessionDate)}`)
                    });
                }
                if (tomorrowExpertsList.length) {
                    items.push({
                        icon: 'groups',
                        title: `خبراء الغد (${tomorrowExpertsList.length})`,
                        lines: tomorrowExpertsList.map(s => `${s.sessionTime || ''} - ${fmt(s.sessionDate)}`)
                    });
                }
                if (tomorrowAdminList.length) {
                    items.push({
                        icon: 'assignment',
                        title: `أعمال الغد (${tomorrowAdminList.length})`,
                        lines: tomorrowAdminList.map(a => `${a.title || a.task || 'عمل'} - ${fmt(a.dueDate)}`)
                    });
                }

                if (items.length === 0) {
                    targetEl.innerHTML = '<div class="text-gray-500 text-center py-4">لا توجد إشعارات</div>';
                    return;
                }
                for (const it of items) {
                    const block = document.createElement('div');
                    block.className = 'py-2';
                    const header = document.createElement('div');
                    header.className = 'flex items-center gap-2 px-2 py-1';
                    header.innerHTML = `<span class=\"material-symbols-outlined text-gray-600 text-base\">${it.icon}</span><span class=\"font-bold\">${it.title}</span>`;
                    block.appendChild(header);
                    it.lines.slice(0,3).forEach(line => {
                        const li = document.createElement('div');
                        li.className = 'pl-7 pr-2 py-1 text-gray-700';
                        li.textContent = line;
                        block.appendChild(li);
                    });
                    targetEl.appendChild(block);
                }
            } catch (err) {
                targetEl.innerHTML = '<div class="text-gray-500 text-center py-8">لا توجد إشعارات</div>';
            }
        }

        function toggleMenu() {
            if (!menu) return;
            const isHidden = menu.classList.contains('hidden');
            if (isHidden) {
                menu.classList.remove('hidden');
                buildNotificationsList(list);
                refreshMuteLabel();
                if (!outsideHandlerBound) {
                    outsideHandlerBound = true;
                    document.addEventListener('click', outsideHandler, true);
                }
            } else {
                menu.classList.add('hidden');
            }
        }
        function outsideHandler(e) {
            if (!menu) return;
            const target = e.target;
            if (menu.contains(target) || (btn && btn.contains(target))) return;
            menu.classList.add('hidden');
        }

        // Bell click -> toggle anchored popover under the button (disabled if portal mode is enabled)
        if (!window.USE_NOTIFICATIONS_PORTAL) {
            if (btn) {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    if (!popover) return;
                    const isHidden = popover.classList.contains('hidden');
                    // close menu if exists
                    if (menu) menu.classList.add('hidden');
                    if (isHidden) {
                        await buildNotificationsList(popoverList);
                        await refreshMuteLabel();
                        popover.classList.remove('hidden');
                        if (!outsideHandlerBound) {
                            outsideHandlerBound = true;
                            document.addEventListener('click', outsideHandler, true);
                        }
                    } else {
                        popover.classList.add('hidden');
                    }
                });
            }

            // Close when clicking outside
            function outsideHandler(e) {
                if (!popover) return;
                const target = e.target;
                if (popover.contains(target) || (btn && btn.contains(target))) return;
                popover.classList.add('hidden');
            }

            // Popover mute toggle
            if (popoverToggleMuteBtn) {
                popoverToggleMuteBtn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    try {
                        const muted = await getSetting('notificationsMuted');
                        const next = !(muted === true || muted === 'true');
                        await setSetting('notificationsMuted', next);
                        await refreshMuteLabel();
                        setNotificationsBellMutedIcon(next);
                        if (typeof showToast === 'function') showToast(next ? 'تم كتم الإشعارات' : 'تم إلغاء الكتم', 'info');
                    } catch (err) {}
                });
            }
        }

        // Keep old dropdown mute and view handlers (if ever used elsewhere)
        if (toggleMuteBtn) {
            toggleMuteBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                try {
                    const muted = await getSetting('notificationsMuted');
                    const next = !(muted === true || muted === 'true');
                    await setSetting('notificationsMuted', next);
                    await refreshMuteLabel();
                    if (typeof showToast === 'function') showToast(next ? 'تم كتم الإشعارات' : 'تم إلغاء الكتم', 'info');
                } catch (err) {}
            });
        }
        if (viewBtn) {
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                if (typeof showToast === 'function') showToast('سيتم عرض جميع الإشعارات هنا لاحقاً');
            });
        }
    } catch (e) {}
    if (typeof enforceAppPassword === 'function') {
        await enforceAppPassword();
    }

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

function updateProgressBars(clientCount, caseCount, tomorrowSessionsCount, tomorrowAdministrativeCount) {
    // تحديث شريط تقدم الموكلين
    const clientProgress = document.getElementById('client-progress');
    if (clientProgress) {
        const clientPercentage = Math.min((clientCount / 20) * 100, 100); // افتراض أن الحد الأقصى 20 موكل
        clientProgress.style.width = `${clientPercentage}%`;
    }
    
    // تحديث شريط تقدم القضايا
    const lawsuitProgress = document.getElementById('lawsuit-progress');
    if (lawsuitProgress) {
        const lawsuitPercentage = Math.min((caseCount / 20) * 100, 100); // افتراض أن الحد الأقصى 20 قضية
        lawsuitProgress.style.width = `${lawsuitPercentage}%`;
    }
    
    // تحديث شريط تقدم جلسات الغد
    const sessionsProgress = document.getElementById('sessions-progress');
    if (sessionsProgress) {
        const sessionsPercentage = Math.min((tomorrowSessionsCount / 10) * 100, 100); // افتراض أن الحد الأقصى 10 جلسات
        sessionsProgress.style.width = `${sessionsPercentage}%`;
    }
    
    // تحديث شريط تقدم أعمال الغد
    const administrativeProgress = document.getElementById('administrative-progress');
    if (administrativeProgress) {
        const administrativePercentage = Math.min((tomorrowAdministrativeCount / 10) * 100, 100); // افتراض أن الحد الأقصى 10 أعمال
        administrativeProgress.style.width = `${administrativePercentage}%`;
    }
}
