
let electron, app, BrowserWindow, Menu, ipcMain, shell, dialog;

try {
    if (process.versions.electron) {
        electron = require('electron');
        app = require('electron').app;
        BrowserWindow = require('electron').BrowserWindow;
        Menu = require('electron').Menu;
        ipcMain = require('electron').ipcMain;
        shell = require('electron').shell;
        dialog = require('electron').dialog;
    } else {

        process.exit(1);
    }
} catch (error) {

    process.exit(1);
}

const fs = require('fs');
const path = require('path');
const os = require('os');
const https = require('https');

// إضافة electron-updater مع معالجة الأخطاء
let autoUpdater = null;
try {
    const updaterModule = require('electron-updater');
    autoUpdater = updaterModule.autoUpdater;
    
    // إعداد التحديث
    autoUpdater.checkForUpdatesAndNotify = false; // تعطيل الفحص التلقائي
    autoUpdater.autoDownload = false; // تعطيل التحميل التلقائي
    autoUpdater.autoInstallOnAppQuit = false; // تعطيل التثبيت التلقائي

    // إعداد مستودع GitHub للتحديثات
    autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'AhmadAllam',
        repo: 'lawyers-app'
    });
} catch (error) {
    console.warn('electron-updater not available:', error.message);
    autoUpdater = null;
}

let mainWindow;

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js'),
            webviewTag: true
        },
        title: 'Lawyers Egypt Digital',
        autoHideMenuBar: true
    });


    mainWindow.maximize();

    mainWindow.loadFile('index.html');
    
    mainWindow.on('close', async (e) => {
        try {
            e.preventDefault();
            const shouldBackup = await mainWindow.webContents.executeJavaScript(`(async () => {
                try {
                    const db = await new Promise((resolve, reject) => {
                        const req = indexedDB.open('LawyerAppDB');
                        req.onsuccess = () => resolve(req.result);
                        req.onerror = () => reject(req.error);
                    });
                    if (!db.objectStoreNames.contains('settings')) { try { db.close(); } catch(e) {} return false; }
                    const res = await new Promise((resolve) => {
                        try {
                            const tx = db.transaction(['settings'], 'readonly');
                            const store = tx.objectStore('settings');
                            const r = store.get('autoBackupOnExit');
                            r.onsuccess = () => {
                                const val = r.result ? r.result.value : null;
                                resolve(val === true || val === '1' || val === 1);
                            };
                            r.onerror = () => resolve(false);
                        } catch (err) {
                            resolve(false);
                        }
                    });
                    try { db.close(); } catch (e) {}
                    return res;
                } catch (err) {
                    return false;
                }
            })();`, true);
            let backupJson = null;
            if (shouldBackup) {
                backupJson = await mainWindow.webContents.executeJavaScript(`(async () => {
                    try {
                        const db = await new Promise((resolve, reject) => {
                            const req = indexedDB.open('LawyerAppDB');
                            req.onsuccess = () => resolve(req.result);
                            req.onerror = () => reject(req.error);
                        });
                        const storeNames = ['clients','opponents','cases','sessions','accounts','administrative','clerkPapers','expertSessions','settings'];
                        const data = {};
                        await Promise.all(storeNames.map(name => new Promise((resolve) => {
                            if (!db.objectStoreNames.contains(name)) {
                                data[name] = [];
                                return resolve();
                            }
                            try {
                                const tx = db.transaction([name], 'readonly');
                                const store = tx.objectStore(name);
                                const r = store.getAll();
                                r.onsuccess = () => { data[name] = r.result; resolve(); };
                                r.onerror = () => { data[name] = []; resolve(); };
                            } catch (err) {
                                data[name] = [];
                                resolve();
                            }
                        })));
                        try { db.close(); } catch (e) {}
                        const backup = { version: '1.0.0', timestamp: new Date().toISOString(), data };
                        return JSON.stringify(backup);
                    } catch (err) {
                        return null;
                    }
                })();`, true);
            }
            if (backupJson) {
                const clientsFolder = getClientsPath();
                if (!fs.existsSync(clientsFolder)) {
                    fs.mkdirSync(clientsFolder, { recursive: true });
                }
                const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
                const filename = `lawyers-backup-${dateStr}.json`;
                fs.writeFileSync(path.join(clientsFolder, filename), backupJson, 'utf8');
            }
        } catch (err) {
        } finally {
            try { mainWindow.removeAllListeners('close'); } catch(e) {}
            try { mainWindow.destroy(); } catch(e) {}
        }
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

// Helper: ensure Desktop/التحديث folder exists
function getUpdatesDir() {
    const desktopPath = path.join(os.homedir(), 'Desktop');
    const updatesDir = path.join(desktopPath, 'التحديث');
    try {
        if (!fs.existsSync(updatesDir)) {
            fs.mkdirSync(updatesDir, { recursive: true });
        }
    } catch (e) {}
    return updatesDir;
}

// Helper: download file with progress and follow redirects
function downloadFileWithProgress(url, destPath) {
    return new Promise((resolve, reject) => {
        const tmpPath = destPath + '.part';
        const headers = { 'User-Agent': 'LawApp-Updater' };

        const doGet = (u) => {
            https.get(u, { headers }, (res) => {
                const status = res.statusCode || 0;
                if ([301, 302, 303, 307, 308].includes(status) && res.headers.location) {
                    res.resume();
                    return doGet(res.headers.location);
                }
                if (status !== 200) {
                    res.resume();
                    return reject(new Error('HTTP ' + status));
                }
                const total = parseInt(res.headers['content-length'] || '0', 10);
                const file = fs.createWriteStream(tmpPath);
                let received = 0;

                res.on('data', (chunk) => {
                    received += chunk.length;
                    file.write(chunk);
                    if (mainWindow) {
                        const percent = total ? Math.round((received / total) * 100) : 0;
                        mainWindow.webContents.send('update-download-progress', {
                            percent,
                            transferred: received,
                            total
                        });
                    }
                });

                res.on('end', () => {
                    file.end(() => {
                        try { fs.renameSync(tmpPath, destPath); } catch (e) {}
                        resolve();
                    });
                });

                res.on('error', (err) => {
                    try { file.close(); } catch (e) {}
                    reject(err);
                });
            }).on('error', reject);
        };

        doGet(url);
    });
}

const gotTheLock = app ? app.requestSingleInstanceLock() : false;

if (!gotTheLock && app) {
    app.quit();
} else if (app) {
    app.on('second-instance', () => {
        if (mainWindow) {
            if (mainWindow.isMinimized()) mainWindow.restore();
            mainWindow.focus();
            mainWindow.show();
        }
    });

    app.on('ready', () => {
        if (Menu) {
            Menu.setApplicationMenu(null);
        }
        createWindow();
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else if (mainWindow) {
            mainWindow.show();
            mainWindow.focus();
        }
    });

    // إعادة تشغيل التطبيق بطلب من الواجهة
    ipcMain.handle('restart-app', async () => {
        try {
            // أغلق جميع النوافذ ثم أعد التشغيل
            if (mainWindow) {
                try { mainWindow.removeAllListeners('close'); } catch(e) {}
                try { mainWindow.destroy(); } catch(e) {}
            }
            app.relaunch();
            app.exit(0);
            return { success: true };
        } catch (e) {
            try { app.relaunch(); app.exit(0); } catch(_) {}
            return { success: false, error: e?.message || 'restart failed' };
        }
    });


    // متغير لحفظ المسار المخصص
    let customClientsPath = null;

    // دالة مساعدة للحصول على مسار مجلد الموكلين
    function getClientsPath() {
        if (customClientsPath) {
            return path.join(customClientsPath, 'ملفات الموكلين');
        }
        
        // المسار الافتراضي - سطح المكتب/مكتبي/ملفات الموكلين
        const desktopPath = path.join(os.homedir(), 'Desktop');
        return path.join(desktopPath, 'مكتبي', 'ملفات الموكلين');
    }

    ipcMain.handle('create-client-folder', async (event, clientName) => {
        try {
            const clientsFolder = getClientsPath();
            const clientFolder = path.join(clientsFolder, clientName);


            if (!fs.existsSync(clientsFolder)) {
                fs.mkdirSync(clientsFolder, { recursive: true });
            }


            if (!fs.existsSync(clientFolder)) {
                fs.mkdirSync(clientFolder, { recursive: true });
            }


            const result = await dialog.showOpenDialog(mainWindow, {
                title: 'اختيار الملفات لنسخها',
                properties: ['openFile', 'multiSelections'],
                filters: [
                    { name: 'جميع الملفات', extensions: ['*'] },
                    { name: 'مستندات', extensions: ['pdf', 'doc', 'docx', 'txt'] },
                    { name: 'صور', extensions: ['jpg', 'jpeg', 'png', 'gif'] }
                ]
            });

            if (!result.canceled && result.filePaths.length > 0) {

                for (const filePath of result.filePaths) {
                    const fileName = path.basename(filePath);
                    const destPath = path.join(clientFolder, fileName);
                    fs.copyFileSync(filePath, destPath);
                }
                return { success: true, message: `تم إنشاء المجلد ونسخ ${result.filePaths.length} ملف`, filesCount: result.filePaths.length };
            } else {
                return { success: true, message: 'تم إنشاء المجلد بنجاح', filesCount: 0 };
            }
        } catch (error) {

            return { success: false, message: 'حدث خطأ في إنشاء المجلد' };
        }
    });

    ipcMain.handle('open-client-folder', async (event, clientName) => {
        try {
            const clientsFolder = getClientsPath();
            const clientFolder = path.join(clientsFolder, clientName);

            if (fs.existsSync(clientFolder)) {
                shell.openPath(clientFolder);
                return { success: true, message: 'تم فتح مجلد الموكل' };
            } else {
                return { success: false, message: 'مجلد الموكل غير موجود' };
            }
        } catch (error) {

            return { success: false, message: 'حدث خطأ في فتح المجلد' };
        }
    });


    ipcMain.handle('open-clients-main-folder', async (event) => {
        try {
            const clientsFolder = getClientsPath();
            if (!fs.existsSync(clientsFolder)) {
                fs.mkdirSync(clientsFolder, { recursive: true });
            }
            shell.openPath(clientsFolder);
            return { success: true, message: 'تم فتح مجلد الموكلين' };
        } catch (error) {
            return { success: false, message: 'حدث خطأ في فتح مجلد الموكلين' };
        }
    });


    ipcMain.handle('create-directory', async (event, dirPath) => {
        try {
            if (!fs.existsSync(dirPath)) {
                fs.mkdirSync(dirPath, { recursive: true });
                return { success: true, message: 'تم إنشاء المجلد بنجاح' };
            } else {
                return { success: false, error: 'EEXIST: المجلد موجود بالفعل' };
            }
        } catch (error) {

            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('open-folder', async (event, folderPath) => {
        try {
            if (fs.existsSync(folderPath)) {
                shell.openPath(folderPath);
                return { success: true, message: 'تم فتح المجلد' };
            } else {
                return { success: false, error: 'المجلد غير موجود' };
            }
        } catch (error) {

            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('read-directory', async (event, dirPath) => {
        try {
            if (!fs.existsSync(dirPath)) {
                return { success: false, error: 'المجلد غير موجود' };
            }

            const items = fs.readdirSync(dirPath, { withFileTypes: true });
            const result = items.map(item => ({
                name: item.name,
                isDirectory: item.isDirectory(),
                isFile: item.isFile()
            }));

            return { success: true, items: result };
        } catch (error) {

            return { success: false, error: error.message };
        }
    });


    ipcMain.handle('create-legal-library-folder', async (event, folderName) => {
        try {
            // التحقق من وجود اسم المجلد
            if (!folderName || folderName.trim() === '') {
                return { success: false, message: 'يرجى إدخال اسم المجلد' };
            }
            
            // تنظيف اسم المجلد من الأحرف غير المسموحة
            const cleanFolderName = folderName.trim().replace(/[<>:"/\\|?*]/g, '');
            
            if (!cleanFolderName) {
                return { success: false, message: 'اسم المجلد يحتوي على أحرف غير مسموحة فقط' };
            }

            const clientsPath = getClientsPath();
            const libraryPath = path.join(path.dirname(clientsPath), 'المكتبة القانونية');
            const newFolderPath = path.join(libraryPath, cleanFolderName);

            // إنشاء مجلد المكتبة الرئيسي إذا لم يكن موجوداً
            if (!fs.existsSync(libraryPath)) {
                fs.mkdirSync(libraryPath, { recursive: true });
            }

            // إنشاء المجلد الجديد أو التأكد من وجوده
            if (!fs.existsSync(newFolderPath)) {
                fs.mkdirSync(newFolderPath, { recursive: true });
            }

            // إظهار نافذة اختيار الملفات
            const result = await dialog.showOpenDialog(mainWindow, {
                title: 'اختيار الملفات لإضافتها للمكتبة القانونية',
                properties: ['openFile', 'multiSelections'],
                filters: [
                    { name: 'جميع الملفات', extensions: ['*'] }
                ],
                defaultPath: require('os').homedir()
            });

            if (!result.canceled && result.filePaths.length > 0) {
                // نسخ الملفات المختارة للمجلد
                for (const filePath of result.filePaths) {
                    const fileName = path.basename(filePath);
                    const destPath = path.join(newFolderPath, fileName);
                    fs.copyFileSync(filePath, destPath);
                }
                return { 
                    success: true, 
                    message: `تم إنشاء مجلد "${cleanFolderName}" وإضافة ${result.filePaths.length} ملف`, 
                    filesCount: result.filePaths.length,
                    folderName: cleanFolderName
                };
            } else {
                return { 
                    success: true, 
                    message: `تم إنشاء مجلد "${cleanFolderName}" بنجاح`, 
                    filesCount: 0,
                    folderName: cleanFolderName
                };
            }
        } catch (error) {

            return { success: false, message: 'حدث خطأ في إنشاء المجلد: ' + error.message };
        }
    });

    ipcMain.handle('open-legal-library-main-folder', async (event) => {
        try {
            const clientsPath = getClientsPath();
            const libraryPath = path.join(path.dirname(clientsPath), 'المكتبة القانونية');
            
            // إنشاء المجلد إذا لم يكن موجوداً
            if (!fs.existsSync(libraryPath)) {
                fs.mkdirSync(libraryPath, { recursive: true });
            }

            shell.openPath(libraryPath);
            return { success: true, message: 'تم فتح مجلد المكتبة القانونية' };
        } catch (error) {

            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('load-legal-library-folders', async (event) => {
        try {
            const clientsPath = getClientsPath();
            const libraryPath = path.join(path.dirname(clientsPath), 'المكتبة القانونية');
            
            // إنشاء مجلد المكتبة إذا لم يكن موجوداً
            if (!fs.existsSync(libraryPath)) {
                fs.mkdirSync(libraryPath, { recursive: true });
            }
            
            // المجلدات الافتراضية
            const defaultFolders = [
                'قانون المرافعات',
                'القانون المدنى',
                'القانون الجنائى',
                'القانون الادارى',
                'قانون الاجراءات الجنائية',
                'قانون العمل والتأمينات',
                'قانون الاحوال الشخصيه',
                'احكام محكمه النقض'
            ];
            
            // إنشاء المجلدات الافتراضية إذا لم تكن موجودة
            defaultFolders.forEach(folderName => {
                const folderPath = path.join(libraryPath, folderName);
                if (!fs.existsSync(folderPath)) {
                    fs.mkdirSync(folderPath, { recursive: true });
                }
            });

            const items = fs.readdirSync(libraryPath, { withFileTypes: true });
            const folders = items.filter(item => item.isDirectory()).map(item => ({
                name: item.name,
                isDirectory: true,
                isFile: false
            }))
            .sort((a, b) => {
                // ترتيب المجلدات الافتراضية أولاً
                const aIndex = defaultFolders.indexOf(a.name);
                const bIndex = defaultFolders.indexOf(b.name);
                
                if (aIndex !== -1 && bIndex !== -1) {
                    return aIndex - bIndex;
                } else if (aIndex !== -1) {
                    return -1;
                } else if (bIndex !== -1) {
                    return 1;
                } else {
                    return a.name.localeCompare(b.name, 'ar');
                }
            });

            return { success: true, items: folders };
        } catch (error) {

            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('open-legal-library-folder', async (event, folderName) => {
        try {
            const clientsPath = getClientsPath();
            const libraryPath = path.join(path.dirname(clientsPath), 'المكتبة القانونية');
            const folderPath = path.join(libraryPath, folderName);
            
            if (fs.existsSync(folderPath)) {
                shell.openPath(folderPath);
                return { success: true, message: `تم فتح مجلد "${folderName}"` };
            } else {
                return { success: false, error: 'المجلد غير موجود' };
            }
        } catch (error) {

            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('delete-legal-library-folder', async (event, folderName) => {
        try {
            const clientsPath = getClientsPath();
            const libraryPath = path.join(path.dirname(clientsPath), 'المكتبة القانونية');
            const folderPath = path.join(libraryPath, folderName);
            
            if (fs.existsSync(folderPath)) {
                // حذف المجلد وكل محتوياته
                fs.rmSync(folderPath, { recursive: true, force: true });
                return { success: true, message: `تم حذف مجلد "${folderName}" بنجاح` };
            } else {
                return { success: false, error: 'المجلد غير موجود' };
            }
        } catch (error) {

            return { success: false, error: error.message };
        }
    });

    ipcMain.handle('rename-legal-library-folder', async (event, oldName, newName) => {
        try {
            // تنظيف الاسم الجديد
            const cleanNewName = newName.replace(/[<>:"/\\|?*]/g, '');
            
            if (!cleanNewName) {
                return { success: false, error: 'الاسم الجديد يحتوي على أحرف غير مسموحة' };
            }

            const clientsPath = getClientsPath();
            const libraryPath = path.join(path.dirname(clientsPath), 'المكتبة القانونية');
            const oldFolderPath = path.join(libraryPath, oldName);
            const newFolderPath = path.join(libraryPath, cleanNewName);
            
            if (!fs.existsSync(oldFolderPath)) {
                return { success: false, error: 'المجلد الأصلي غير موجود' };
            }

            if (fs.existsSync(newFolderPath)) {
                return { success: false, error: 'يوجد مجلد بنفس الاسم الجديد' };
            }

            // إعادة تسمية المجلد
            fs.renameSync(oldFolderPath, newFolderPath);
            return { success: true, message: `تم تغيير اسم المجلد إلى "${cleanNewName}"`, newName: cleanNewName };
        } catch (error) {

            return { success: false, error: error.message };
        }
    });

    // إرفاق ملفات لمجلد موجود
    ipcMain.handle('attach-files-to-folder', async (event, folderName) => {
        try {
            const clientsPath = getClientsPath();
            const libraryPath = path.join(path.dirname(clientsPath), 'المكتبة القانونية');
            const folderPath = path.join(libraryPath, folderName);
            
            if (!fs.existsSync(folderPath)) {
                return { success: false, message: 'المجلد غير موجود' };
            }

            // إظهار نافذة اختيار الملفات
            const result = await dialog.showOpenDialog(mainWindow, {
                title: `إرفاق ملفات لمجلد "${folderName}"`,
                properties: ['openFile', 'multiSelections'],
                filters: [
                    { name: 'جميع الملفات', extensions: ['*'] }
                ],
                defaultPath: require('os').homedir()
            });

            if (!result.canceled && result.filePaths.length > 0) {
                // نسخ الملفات المختارة للمجلد
                for (const filePath of result.filePaths) {
                    const fileName = path.basename(filePath);
                    const destPath = path.join(folderPath, fileName);
                    fs.copyFileSync(filePath, destPath);
                }
                return { 
                    success: true, 
                    message: `تم إرفاق ${result.filePaths.length} ملف`, 
                    filesCount: result.filePaths.length
                };
            } else {
                return { 
                    success: true, 
                    message: 'لم يتم اختيار أي ملفات', 
                    filesCount: 0
                };
            }
        } catch (error) {

            return { success: false, message: 'حدث خطأ في إرفاق الملفات: ' + error.message };
        }
    });

    // فتح موقع تحميل
    ipcMain.handle('open-download-site', async (event, siteNumber) => {
        try {
            const sites = {
                '1': 'https://books-library.net/c-Books-Egyption-Law-best-download',
                '2': 'https://foulabook.com/ar/books/%D9%82%D8%A7%D9%86%D9%88%D9%86?page=1',
                '3': 'https://deepai.org/chat/free-chatgpt',
                '4': 'https://moj.gov.eg/ar/Pages/Services/ServicesCatalog.aspx?UserCategory=4',
                '5': 'https://digital.gov.eg/categories',
                '6': 'https://ppo.gov.eg/ppo/r/ppoportal/ppoportal/home'
            };

            const url = sites[siteNumber];
            if (url) {
                await shell.openExternal(url);
                return { success: true, message: `تم فتح الموقع ${siteNumber}` };
            } else {
                return { success: false, message: 'رقم الموقع غير صحيح' };
            }
        } catch (error) {
            return { success: false, message: 'حدث خطأ في فتح الموقع: ' + error.message };
        }
    });

    // وظيفة اختيار المجلد
    ipcMain.handle('select-folder', async () => {
        try {
            const result = await dialog.showOpenDialog(mainWindow, {
                title: 'اختيار مجلد الاكسس',
                properties: ['openDirectory'],
                defaultPath: path.join(os.homedir(), 'Desktop')
            });
            return result;
        } catch (error) {
            return { canceled: true, error: error.message };
        }
    });

    ipcMain.handle('build-access-backup', async (event, customFolder) => {
        try {
            const { build } = require(path.join(process.cwd(), 'js', 'build-backup-access.js'));
            await build(customFolder);
            const src = path.join(process.cwd(), 'lawyers-backup-access.json');
            let finalName = 'lawyers-backup-access.json';
            const dateStr = new Date().toISOString().slice(0, 19).replace(/:/g, '-');
            
            // تحديد مجلد الحفظ
            let saveDir;
            if (customFolder && path.isAbsolute(customFolder) && fs.existsSync(customFolder)) {
                // إذا كان المجلد المخصص مسار مطلق وموجود، احفظ فيه
                saveDir = customFolder;
            } else {
                // وإلا احفظ في سطح المكتب
                saveDir = path.join(os.homedir(), 'Desktop');
            }
            
            // التأكد من وجود مجلد الحفظ
            if (!fs.existsSync(saveDir)) {
                fs.mkdirSync(saveDir, { recursive: true });
            }
            
            if (fs.existsSync(src)) {
                finalName = `lawyers-backup-access-${dateStr}.json`;
                const destPath = path.join(saveDir, finalName);
                fs.copyFileSync(src, destPath);
                
                // حذف الملف المؤقت
                try {
                    fs.unlinkSync(src);
                } catch (e) {
                    // تجاهل خطأ الحذف
                }
                
                return { 
                    success: true, 
                    filename: finalName,
                    savedPath: destPath,
                    message: `تم حفظ الملف في: ${saveDir}`
                };
            }
            return { success: false, message: 'لم يتم إنشاء ملف النسخة الاحتياطية' };
        } catch (error) {
            return { success: false, message: 'فشل تنفيذ النسخ الاحتياطي من XML: ' + error.message };
        }
    });

    // اختيار مسار مجلد الموكلين
    ipcMain.handle('choose-clients-path', async (event) => {
        try {
            const result = await dialog.showOpenDialog(mainWindow, {
                title: 'اختيار مسار مجلد الموكلين',
                properties: ['openDirectory', 'createDirectory'],
                buttonLabel: 'اختيار هذا المجلد'
            });

            if (result.canceled) {
                return { success: false, canceled: true };
            }

            const selectedPath = result.filePaths[0];
            if (selectedPath) {
                // حفظ المسار في المتغير
                customClientsPath = selectedPath;
                
                return { 
                    success: true, 
                    path: selectedPath,
                    message: 'تم اختيار المسار بنجاح'
                };
            } else {
                return { 
                    success: false, 
                    message: 'لم يتم اختيار مسار صحيح'
                };
            }
        } catch (error) {
            return { 
                success: false, 
                message: 'حدث خطأ في اختيار المسار: ' + error.message 
            };
        }
    });

    // نسخ مجلد pack إلى سطح المكتب باسم "الصيغ الجاهزة"
    ipcMain.handle('copy-pack-to-desktop', async (event) => {
        try {
            const packSourcePath = path.join(__dirname, 'pack');
            const desktopPath = path.join(os.homedir(), 'Desktop');
            const destinationPath = path.join(desktopPath, 'الصيغ الجاهزة');

            // التحقق من وجود مجلد pack
            if (!fs.existsSync(packSourcePath)) {
                return { success: false, message: 'مجلد pack غير موجود' };
            }

            // حذف المجلد الوجهة إذا كان موجوداً
            if (fs.existsSync(destinationPath)) {
                fs.rmSync(destinationPath, { recursive: true, force: true });
            }

            // نسخ المجلد بشكل تكراري
            function copyFolderRecursive(source, target) {
                if (!fs.existsSync(target)) {
                    fs.mkdirSync(target, { recursive: true });
                }

                const files = fs.readdirSync(source);
                files.forEach(file => {
                    const sourcePath = path.join(source, file);
                    const targetPath = path.join(target, file);
                    
                    if (fs.lstatSync(sourcePath).isDirectory()) {
                        copyFolderRecursive(sourcePath, targetPath);
                    } else {
                        fs.copyFileSync(sourcePath, targetPath);
                    }
                });
            }

            copyFolderRecursive(packSourcePath, destinationPath);

            return { 
                success: true, 
                message: 'تم نسخ مجلد الصيغ الجاهزة إلى سطح المكتب بنجاح',
                destinationPath: destinationPath
            };
        } catch (error) {
            return { 
                success: false, 
                message: 'حدث خطأ أثناء نسخ المجلد: ' + error.message 
            };
        }
    });

    // ===== معالجات التحديث =====
    
    // إرجاع إصدار التطبيق الحالي
    ipcMain.handle('get-app-version', async () => {
        try {
            const version = app && typeof app.getVersion === 'function' ? app.getVersion() : '0.0.0';
            return { success: true, version };
        } catch (e) {
            return { success: false, error: e.message || 'تعذر قراءة الإصدار' };
        }
    });

    // تنزيل ملف التحديث من GitHub إلى Desktop/التحديث ثم تشغيله وإغلاق التطبيق
    ipcMain.handle('download-and-install-from-github', async (event, downloadUrl, suggestedName) => {
        try {
            if (!downloadUrl || typeof downloadUrl !== 'string') {
                return { success: false, error: 'رابط التنزيل غير صالح' };
            }
            const updatesDir = getUpdatesDir();
            const urlPath = (() => {
                try { return new URL(downloadUrl).pathname; } catch (e) { return ''; }
            })();
            const nameFromUrl = urlPath ? path.basename(urlPath) : 'LawApp-Setup.exe';
            const filename = (suggestedName && typeof suggestedName === 'string') ? suggestedName : nameFromUrl;
            const destPath = path.join(updatesDir, filename);

            if (mainWindow) {
                mainWindow.webContents.send('update-checking');
                mainWindow.webContents.send('update-available', { version: filename, releaseNotes: '', releaseDate: '' });
            }

            await downloadFileWithProgress(downloadUrl, destPath);

            if (mainWindow) {
                mainWindow.webContents.send('update-downloaded');
            }

            // تشغيل المثبت
            try {
                const { spawn } = require('child_process');
                const child = spawn(destPath, [], { detached: true, stdio: 'ignore' });
                child.unref();
            } catch (e) {
                await shell.openPath(destPath);
            }

            // إغلاق التطبيق بعد بدء المثبت
            setTimeout(() => {
                try { app.quit(); } catch (e) {}
            }, 500);

            return { success: true, savedPath: destPath };
        } catch (error) {
            if (mainWindow) {
                mainWindow.webContents.send('update-error', error.message || 'خطأ أثناء تنزيل التحديث');
            }
            return { success: false, error: error.message || 'خطأ أثناء تنزيل التحديث' };
        }
    });
    
    // فحص التحديثات
    ipcMain.handle('check-for-updates', async () => {
        try {
            if (!autoUpdater) {
                return {
                    success: false,
                    error: 'خدمة التحديثات غير متوفرة'
                };
            }
            
            const updateInfo = await autoUpdater.checkForUpdates();
            if (updateInfo && updateInfo.updateInfo) {
                return {
                    success: true,
                    hasUpdate: true,
                    version: updateInfo.updateInfo.version,
                    releaseNotes: updateInfo.updateInfo.releaseNotes || 'تحديثات وتحسينات عامة',
                    releaseDate: updateInfo.updateInfo.releaseDate
                };
            } else {
                return {
                    success: true,
                    hasUpdate: false,
                    message: 'التطبيق محدث لأحدث إصدار'
                };
            }
        } catch (error) {
            return {
                success: false,
                error: error.message || 'فشل في فحص التحديثات'
            };
        }
    });

    // تحميل وتثبيت التحديث
    ipcMain.handle('download-and-install-update', async () => {
        try {
            if (!autoUpdater) {
                return {
                    success: false,
                    error: 'خدمة التحديثات غير متوفرة'
                };
            }
            
            // تحميل التحديث
            await autoUpdater.downloadUpdate();
            
            // تثبيت التحديث وإعادة التشغيل
            autoUpdater.quitAndInstall(false, true);
            
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error: error.message || 'فشل في تحميل أو تثبيت التحديث'
            };
        }
    });

    // أحداث التحديث
    if (autoUpdater) {
        autoUpdater.on('checking-for-update', () => {
            if (mainWindow) {
                mainWindow.webContents.send('update-checking');
            }
        });

        autoUpdater.on('update-available', (info) => {
            if (mainWindow) {
                mainWindow.webContents.send('update-available', {
                    version: info.version,
                    releaseNotes: info.releaseNotes,
                    releaseDate: info.releaseDate
                });
            }
        });

        autoUpdater.on('update-not-available', () => {
            if (mainWindow) {
                mainWindow.webContents.send('update-not-available');
            }
        });

        autoUpdater.on('download-progress', (progressObj) => {
            if (mainWindow) {
                mainWindow.webContents.send('update-download-progress', {
                    percent: Math.round(progressObj.percent),
                    transferred: progressObj.transferred,
                    total: progressObj.total
                });
            }
        });

        autoUpdater.on('update-downloaded', () => {
            if (mainWindow) {
                mainWindow.webContents.send('update-downloaded');
            }
        });

        autoUpdater.on('error', (error) => {
            if (mainWindow) {
                mainWindow.webContents.send('update-error', error.message);
            }
        });
    }
}