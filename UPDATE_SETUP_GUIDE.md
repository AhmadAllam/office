# دليل إعداد نظام التحديثات على GitHub

## الخطوات المطلوبة:

### 1. إنشاء مستودع GitHub للتحديثات

1. اذهب إلى [GitHub.com](https://github.com)
2. اضغط على "New repository"
3. اسم المستودع: `law-app-updates`
4. اجعله **Public**
5. اضغط "Create repository"

### 2. إنشاء الملفات المطلوبة

#### أ) ملف `version.json` (معلومات الإصدار الحالي):

```json
{
  "version": "1.0.1",
  "releaseDate": "2024-01-15T10:00:00Z",
  "downloadUrl": "https://github.com/YOUR_USERNAME/law-app-updates/releases/download/v1.0.1/law-app-setup.exe",
  "releaseNotes": "إصلاح مشاكل الترميز في النصوص العربية\nتحسينات في الأداء\nإضافة ميزات جديدة",
  "mandatory": false,
  "minVersion": "1.0.0"
}
```

#### ب) ملف `releases.json` (قائمة جميع الإصدارات):

```json
{
  "releases": [
    {
      "version": "1.0.1",
      "releaseDate": "2024-01-15T10:00:00Z",
      "downloadUrl": "https://github.com/YOUR_USERNAME/law-app-updates/releases/download/v1.0.1/law-app-setup.exe",
      "releaseNotes": "إصلاح مشاكل الترميز في النصوص العربية\nتحسينات في الأداء",
      "mandatory": false,
      "fileSize": "45.2 MB",
      "checksum": "sha256:abc123..."
    },
    {
      "version": "1.0.0",
      "releaseDate": "2024-01-01T10:00:00Z",
      "downloadUrl": "https://github.com/YOUR_USERNAME/law-app-updates/releases/download/v1.0.0/law-app-setup.exe",
      "releaseNotes": "الإصدار الأول من البرنامج",
      "mandatory": false,
      "fileSize": "44.8 MB",
      "checksum": "sha256:def456..."
    }
  ]
}
```

### 3. تحديث إعدادات البرنامج

في ملف `js/updater.js`، قم بتغيير:

```javascript
const UPDATE_CONFIG = {
    owner: 'YOUR_GITHUB_USERNAME', // ضع اسم المستخدم الخاص بك هنا
    repo: 'law-app-updates',
    currentVersion: '1.0.0' // الإصدار الحالي للبرنامج
};
```

### 4. إنشاء Release جديد

1. اذهب إلى مستودع GitHub
2. اضغط على "Releases"
3. اضغط على "Create a new release"
4. Tag version: `v1.0.1`
5. Release title: `الإصدار 1.0.1`
6. Description: اكتب ملاحظات الإصدار
7. ارفع ملف التثبيت (.exe أو .dmg أو .AppImage)
8. اضغط "Publish release"

### 5. كيفية نشر تحديث جديد

#### الطريقة الأولى: تحديث ملف version.json
1. اذهب إلى ملف `version.json` في المستودع
2. اضغط على أيقونة القلم للتعديل
3. غيّر رقم الإصدار وملاحظات الإصدار
4. احفظ التغييرات

#### الطريقة الثانية: إنشاء Release جديد
1. اذهب إلى "Releases"
2. اضغط "Create a new release"
3. ضع رقم الإصدار الجديد
4. ارفع ملف التثبيت الجديد
5. انشر الإصدار

### 6. اختبار النظام

1. افتح البرنامج
2. اذهب إلى الإعدادات → التحديثات
3. اضغط "فحص التحديثات"
4. يجب أن يظهر التحديث الجديد إذا كان متاحاً

### 7. هيكل المستودع النهائي

```
law-app-updates/
├── version.json          # معلومات الإصدار الحالي
├── releases.json         # قائمة جميع الإصدارات
├── README.md            # وصف المستودع
└── releases/            # مجلد الإصدارات (اختياري)
    ├── v1.0.0/
    └── v1.0.1/
```

### 8. نصائح مه��ة

- **تأكد من أن المستودع Public** حتى يمكن للبرنامج الوصول إليه
- **استخدم أرقام إصدارات منطقية** مثل 1.0.0, 1.0.1, 1.1.0
- **اكتب ملاحظات إصدار واضحة** باللغة العربية
- **اختبر التحديث قبل النشر** على جهاز آخر
- **احتفظ بنسخة احتياطية** من الإصدارات القديمة

### 9. استكشاف الأخطاء

#### إذا لم يظهر التحديث:
- تأكد من أن اسم المستخدم صحيح في `UPDATE_CONFIG`
- تأكد من أن المستودع Public
- تحقق من صحة ملف `version.json`
- تأكد من أن رقم الإصدار الجديد أكبر من الحالي

#### إذا فشل التحميل:
- تأكد من صحة رابط التحميل في `downloadUrl`
- تحقق من أن ملف التثبيت موجود في الـ Release
- تأكد من أن الملف لم يتم حذفه أو تلفه

### 10. مثال كامل

إذا كان اسم المستخدم الخاص بك `ahmed123`، فسيكون:

```javascript
const UPDATE_CONFIG = {
    owner: 'ahmed123',
    repo: 'law-app-updates',
    currentVersion: '1.0.0'
};
```

ورابط التحميل سيكون:
```
https://github.com/ahmed123/law-app-updates/releases/download/v1.0.1/law-app-setup.exe
```