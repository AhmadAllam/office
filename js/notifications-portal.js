// Notifications Portal Popover rendered at body level to avoid clipping and stacking issues
// Sets a flag to disable header's built-in popover handlers
window.USE_NOTIFICATIONS_PORTAL = true;

(function(){
  document.addEventListener('DOMContentLoaded', async () => {
    // Ensure DB is initialized before reading settings
    try { if (typeof initDB === 'function') await initDB(); } catch(e) {}

    // Prefer the visible/mobile button when both exist
    function isVisible(el){
      if (!el) return false;
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false;
      // offsetParent null often indicates display:none or position:fixed with no layout; guard with size
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
    let bellBtn = getBellBtn();
    if (!bellBtn) return;

    // Create portal popover (fixed on viewport)
    const pop = document.createElement('div');
    pop.id = 'notifications-portal-popover';
    pop.setAttribute('dir', 'rtl');
    pop.style.position = 'fixed';
    pop.style.top = '0px'; // will be positioned dynamically
    pop.style.left = '0px';
    pop.style.width = '22rem';
    pop.style.maxWidth = '95vw';
    pop.style.background = '#ffffff';
    pop.style.border = '1px solid #e5e7eb';
    pop.style.borderRadius = '12px';
    pop.style.boxShadow = '0 10px 30px rgba(0,0,0,0.15)';
    pop.style.overflow = 'hidden';
    pop.style.display = 'none';
    pop.style.zIndex = '100000';

    pop.innerHTML = `
      <div style="display:flex;align-items:center;justify-content:space-between;padding:10px 12px;border-bottom:1px solid #f1f5f9;">
        <span style="font-size:13px;font-weight:700">الإشعارات</span>
        <button id="portal-toggle-mute-btn" style="font-size:12px;padding:4px 8px;border:1px solid #d1d5db;border-radius:9999px;background:#fff;">كتم</button>
      </div>
      <div id="portal-popover-list" style="max-height:320px; overflow:auto; padding:8px; font-size:14px;"></div>
    `;
    document.body.appendChild(pop);

    function placePopover() {
      try {
        const r = bellBtn.getBoundingClientRect();
        const gap = 8;
        // Ensure width known to align right edge under button
        const width = pop.offsetWidth || 352; // ~22rem default
        let x = Math.round(r.right - width);
        if (x < 8) x = 8; // keep within viewport
        const maxX = Math.max(8, window.innerWidth - width - 8);
        if (x > maxX) x = maxX;
        pop.style.left = x + 'px';
        pop.style.top = Math.round(r.bottom + gap) + 'px';
      } catch (e) {}
    }

    async function refreshMuteLabelPortal() {
      try {
        const muted = await getSetting('notificationsMuted');
        const btnMute = document.getElementById('portal-toggle-mute-btn');
        if (btnMute) btnMute.textContent = (muted === true || muted === 'true') ? 'إلغاء الكتم' : 'كتم';
      } catch (e) {}
    }

    async function buildList(el) {
      if (!el) return;
      el.innerHTML = '';
      try {
        const todaySessionsList = await getTodaySessions(3);
        const tomorrowSessionsList = await getTomorrowSessions(3);
        const todayExpertsList = await getTodayExpertSessions(3);
        const tomorrowExpertsList = await getTomorrowExpertSessions(3);
        const tomorrowAdminList = await getTomorrowAdministrative(3);
        const items = [];
        const fmt = (d) => { try { return new Date(d).toLocaleDateString('ar-EG'); } catch(e) { return d || ''; } };

        if (Array.isArray(todaySessionsList) && todaySessionsList.length) {
          items.push({ title: `جلسات اليوم (${todaySessionsList.length})`, lines: todaySessionsList.map(s => `دعوى ${s.caseNumber || s.caseId || ''} - ${fmt(s.sessionDate)}`) });
        }
        if (Array.isArray(tomorrowSessionsList) && tomorrowSessionsList.length) {
          items.push({ title: `جلسات الغد (${tomorrowSessionsList.length})`, lines: tomorrowSessionsList.map(s => `دعوى ${s.caseNumber || s.caseId || ''} - ${fmt(s.sessionDate)}`) });
        }
        if (Array.isArray(todayExpertsList) && todayExpertsList.length) {
          items.push({ title: `خبراء اليوم (${todayExpertsList.length})`, lines: todayExpertsList.map(s => `${s.sessionTime || ''} - ${fmt(s.sessionDate)}`) });
        }
        if (Array.isArray(tomorrowExpertsList) && tomorrowExpertsList.length) {
          items.push({ title: `خبراء الغد (${tomorrowExpertsList.length})`, lines: tomorrowExpertsList.map(s => `${s.sessionTime || ''} - ${fmt(s.sessionDate)}`) });
        }
        if (Array.isArray(tomorrowAdminList) && tomorrowAdminList.length) {
          items.push({ title: `أعمال الغد (${tomorrowAdminList.length})`, lines: tomorrowAdminList.map(a => `${a.title || a.task || 'عمل'} - ${fmt(a.dueDate)}`) });
        }

        if (!items.length) {
          el.innerHTML = '<div style="text-align:center;color:#6b7280;padding:24px 0;">لا توجد إشعارات</div>';
          return;
        }

        items.forEach(it => {
          const block = document.createElement('div');
          block.style.padding = '8px 0';
          const header = document.createElement('div');
          header.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 8px;';
          header.innerHTML = '<span class="material-symbols-outlined" style="color:#4b5563;font-size:18px;">notifications</span>' +
                             `<span style="font-weight:700;">${it.title}</span>`;
          block.appendChild(header);
          it.lines.slice(0,3).forEach(line => {
            const row = document.createElement('div');
            row.style.cssText = 'padding:4px 8px;color:#374151;';
            row.textContent = line;
            block.appendChild(row);
          });
          el.appendChild(block);
        });
      } catch (err) {
        el.innerHTML = '<div style="text-align:center;color:#6b7280;padding:24px 0;">لا توجد إشعارات</div>';
      }
    }

    function showPopover() {
      pop.style.display = 'block';
      buildList(pop.querySelector('#portal-popover-list'));
      refreshMuteLabelPortal();
      placePopover();
      setTimeout(() => {
        document.addEventListener('click', onOutside, true);
        window.addEventListener('resize', hidePopover);
        window.addEventListener('scroll', hidePopover, true);
      }, 0);
    }

    // تزامن أولي للأيقونة وزر الكتم عند تحميل الصفحة
    (async () => {
      try {
        const muted = await getSetting('notificationsMuted');
        try { if (typeof window.setNotificationsBellMutedIcon === 'function') window.setNotificationsBellMutedIcon(muted); } catch(e) {}
        await refreshMuteLabelPortal();
      } catch (e) {}
    })();
    function hidePopover() {
      pop.style.display = 'none';
      document.removeEventListener('click', onOutside, true);
      window.removeEventListener('resize', hidePopover);
      window.removeEventListener('scroll', hidePopover, true);
    }
    function onOutside(e) {
      if (pop.contains(e.target) || bellBtn.contains(e.target)) return;
      hidePopover();
    }

    bellBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (pop.style.display === 'block') hidePopover(); else showPopover();
    });

    pop.querySelector('#portal-toggle-mute-btn').addEventListener('click', async (e) => {
      e.stopPropagation();
      try {
        const muted = await getSetting('notificationsMuted');
        const next = !(muted === true || muted === 'true');
        await setSetting('notificationsMuted', next);
        await refreshMuteLabelPortal();
        try { if (typeof window.setNotificationsBellMutedIcon === 'function') window.setNotificationsBellMutedIcon(next); } catch(e) {}
        if (typeof showToast === 'function') showToast(next ? 'تم كتم الإشعارات' : 'تم إلغاء الكتم', 'info');
      } catch (err) {}
    });
  });
})();