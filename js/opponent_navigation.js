// دالة تحديث عرض الخصم الحالي
function updateOpponentDisplay(opponents) {
    if (opponents.length === 0) return;
    
    const currentOpponent = opponents[currentOpponentIndex];
    
    // استخدام IDs مباشرة بدل selectors معقدة
    const nameEl = document.getElementById('opponent-name-value');
    const capacityEl = document.getElementById('opponent-capacity-value');
    const addressEl = document.getElementById('opponent-address-value');
    const phoneEl = document.getElementById('opponent-phone-value');
    const fileNumberEl = document.getElementById('opponent-file-number-value');
    
    if (nameEl) nameEl.textContent = currentOpponent.name || 'فارغ';
    if (capacityEl) capacityEl.textContent = currentOpponent.capacity || 'فارغ';
    if (addressEl) addressEl.textContent = currentOpponent.address || 'فارغ';
    if (phoneEl) phoneEl.textContent = currentOpponent.phone || 'فارغ';
    if (fileNumberEl) fileNumberEl.textContent = currentOpponent.fileNumber || 'فارغ';
    
    // تحديث زر التعديل
    const editBtn = document.querySelector('.edit-opponent-btn');
    if (editBtn) {
        editBtn.setAttribute('data-opponent-id', currentOpponent.id);
    }
    
    // تحديث المؤشر
    const indexSpan = document.getElementById('current-opponent-index');
    if (indexSpan) {
        indexSpan.textContent = currentOpponentIndex + 1;
    }
}