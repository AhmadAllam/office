function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    // إزالة الرسائل الزائدة (الحد الأقصى 5 رسائل)
    const existingToasts = container.querySelectorAll('.toast');
    if (existingToasts.length >= 5) {
        // إزالة أقدم رسالة
        const oldestToast = existingToasts[existingToasts.length - 1];
        oldestToast.classList.remove('show');
        setTimeout(() => oldestToast.remove(), 200);
    }

    const toast = document.createElement('div');
    
    // تحديد الألوان والأيقونات حسب النوع
    let bgColor, icon;
    switch (type) {
        case 'error':
            bgColor = '#ef4444'; // red-500
            icon = 'ri-error-warning-fill';
            break;
        case 'info':
            bgColor = '#3b82f6'; // blue-500
            icon = 'ri-information-fill';
            break;
        case 'warning':
            bgColor = '#f59e0b'; // amber-500
            icon = 'ri-alert-fill';
            break;
        default: // success
            bgColor = '#2dce89'; // success green
            icon = 'ri-checkbox-circle-fill';
    }
    
    toast.className = 'toast';
    toast.style.backgroundColor = bgColor;
    toast.innerHTML = `<i class="${icon}"></i><span>${message}</span>`;
    
    // إضافة إمكانية النقر لإغلاق التوست
    toast.style.pointerEvents = 'auto';
    toast.style.cursor = 'pointer';
    toast.addEventListener('click', () => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 200);
    });
    
    // إضافة الرسالة الجديدة في المقدمة (أعلى الكونتينر)
    container.insertBefore(toast, container.firstChild);
    
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);

    // إزالة الرسالة بعد 3 ثوان
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentNode) {
                toast.remove();
            }
        }, 200);
    }, 3000);
}
