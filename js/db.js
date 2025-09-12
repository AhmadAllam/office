let db;


function getDbInstance() {
    return db;
}

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('LawyerAppDB', 18);

        request.onupgradeneeded = (event) => {
            const dbInstance = event.target.result;
            const transaction = event.target.transaction;

            if (!dbInstance.objectStoreNames.contains('clients')) {
                const clientsStore = dbInstance.createObjectStore('clients', { keyPath: 'id', autoIncrement: true });
                clientsStore.createIndex('name', 'name', { unique: false });
            }

            if (!dbInstance.objectStoreNames.contains('opponents')) {
                const opponentsStore = dbInstance.createObjectStore('opponents', { keyPath: 'id', autoIncrement: true });
                opponentsStore.createIndex('name', 'name', { unique: false });
            }

            let casesStore;
            if (dbInstance.objectStoreNames.contains('cases')) {
                casesStore = transaction.objectStore('cases');
            } else {
                casesStore = dbInstance.createObjectStore('cases', { keyPath: 'id', autoIncrement: true });
            }
            if (!casesStore.indexNames.contains('clientId')) casesStore.createIndex('clientId', 'clientId', { unique: false });
            if (!casesStore.indexNames.contains('opponentId')) casesStore.createIndex('opponentId', 'opponentId', { unique: false });
            
            if (event.oldVersion < 8) {
                if (casesStore.indexNames.contains('caseNumberYear')) {
                    casesStore.deleteIndex('caseNumberYear');
                }
                casesStore.createIndex('caseNumberYear', ['caseNumber', 'caseYear'], { unique: false });
            }

            if (!casesStore.indexNames.contains('poaNumber')) casesStore.createIndex('poaNumber', 'poaNumber', { unique: false });
            

            if (event.oldVersion < 14) {
                if (!casesStore.indexNames.contains('isArchived')) {
                    casesStore.createIndex('isArchived', 'isArchived', { unique: false });
                }
                

                const getAllRequest = casesStore.getAll();
                getAllRequest.onsuccess = () => {
                    const cases = getAllRequest.result;
                    cases.forEach(caseRecord => {
                        if (caseRecord.isArchived === undefined) {
                            caseRecord.isArchived = false;
                            casesStore.put(caseRecord);
                        }
                    });
                };
            }

            // حذف الفهارس الغير مستخدمة في الإصدار 16
            if (event.oldVersion < 16) {
                // حذف الفهارس الغير مستخدمة من جدول administrative
                let administrativeStore;
                if (dbInstance.objectStoreNames.contains('administrative')) {
                    administrativeStore = transaction.objectStore('administrative');
                    if (administrativeStore.indexNames.contains('task')) {
                        administrativeStore.deleteIndex('task');
                    }
                    if (administrativeStore.indexNames.contains('location')) {
                        administrativeStore.deleteIndex('location');
                    }
                }

                // حذف الفهارس الغير مستخدمة من جدول clerkPapers
                let clerkPapersStore;
                if (dbInstance.objectStoreNames.contains('clerkPapers')) {
                    clerkPapersStore = transaction.objectStore('clerkPapers');
                    if (clerkPapersStore.indexNames.contains('clerkOffice')) {
                        clerkPapersStore.deleteIndex('clerkOffice');
                    }
                    if (clerkPapersStore.indexNames.contains('deliveryDate')) {
                        clerkPapersStore.deleteIndex('deliveryDate');
                    }
                    if (clerkPapersStore.indexNames.contains('receiptDate')) {
                        clerkPapersStore.deleteIndex('receiptDate');
                    }
                }

                // حذف الفهرس الغير مستخدم من جدول expertSessions
                let expertSessionsStore;
                if (dbInstance.objectStoreNames.contains('expertSessions')) {
                    expertSessionsStore = transaction.objectStore('expertSessions');
                    if (expertSessionsStore.indexNames.contains('caseNumber')) {
                        expertSessionsStore.deleteIndex('caseNumber');
                    }
                }
            }

            // حذف الفهرس الغير مستخدم في الإصدار 17
            if (event.oldVersion < 17) {
                // حذف فهرس inventoryNumberYear من جدول sessions
                let sessionsStoreForCleanup;
                if (dbInstance.objectStoreNames.contains('sessions')) {
                    sessionsStoreForCleanup = transaction.objectStore('sessions');
                    if (sessionsStoreForCleanup.indexNames.contains('inventoryNumberYear')) {
                        sessionsStoreForCleanup.deleteIndex('inventoryNumberYear');
                    }
                }
            }

            let sessionsStore;
            if (dbInstance.objectStoreNames.contains('sessions')) {
                sessionsStore = transaction.objectStore('sessions');
            } else {
                sessionsStore = dbInstance.createObjectStore('sessions', { keyPath: 'id', autoIncrement: true });
            }
            if (!sessionsStore.indexNames.contains('caseId')) sessionsStore.createIndex('caseId', 'caseId', { unique: false });
            if (sessionsStore.indexNames.contains('inventoryNumber')) {
                sessionsStore.deleteIndex('inventoryNumber');
            }
            // تم حذف فهرس inventoryNumberYear في الإصدار 17 لأنه غير مستخدم


            if (!dbInstance.objectStoreNames.contains('accounts')) {
                const accountsStore = dbInstance.createObjectStore('accounts', { keyPath: 'id', autoIncrement: true });
                accountsStore.createIndex('clientId', 'clientId', { unique: false });
                accountsStore.createIndex('caseId', 'caseId', { unique: false });
                accountsStore.createIndex('paymentDate', 'paymentDate', { unique: false });
            }


            if (!dbInstance.objectStoreNames.contains('administrative')) {
                const administrativeStore = dbInstance.createObjectStore('administrative', { keyPath: 'id', autoIncrement: true });
                administrativeStore.createIndex('clientId', 'clientId', { unique: false });
                administrativeStore.createIndex('dueDate', 'dueDate', { unique: false });
                administrativeStore.createIndex('completed', 'completed', { unique: false });
            }


            if (!dbInstance.objectStoreNames.contains('clerkPapers')) {
                const clerkPapersStore = dbInstance.createObjectStore('clerkPapers', { keyPath: 'id', autoIncrement: true });
                clerkPapersStore.createIndex('clientId', 'clientId', { unique: false });
                clerkPapersStore.createIndex('caseId', 'caseId', { unique: false });
                clerkPapersStore.createIndex('paperType', 'paperType', { unique: false });
                clerkPapersStore.createIndex('paperNumber', 'paperNumber', { unique: false });
                clerkPapersStore.createIndex('notes', 'notes', { unique: false });
            }


            if (!dbInstance.objectStoreNames.contains('expertSessions')) {
                const expertSessionsStore = dbInstance.createObjectStore('expertSessions', { keyPath: 'id', autoIncrement: true });
                expertSessionsStore.createIndex('clientId', 'clientId', { unique: false });
                expertSessionsStore.createIndex('outgoingNumber', 'outgoingNumber', { unique: false });
                expertSessionsStore.createIndex('incomingNumber', 'incomingNumber', { unique: false });
                expertSessionsStore.createIndex('sessionDate', 'sessionDate', { unique: false });
                expertSessionsStore.createIndex('sessionTime', 'sessionTime', { unique: false });
            }


            if (!dbInstance.objectStoreNames.contains('settings')) {
                const settingsStore = dbInstance.createObjectStore('settings', { keyPath: 'key' });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            
            // إضافة الإعدادات الافتراضية إذا لم تكن موجودة
            setTimeout(async () => {
                try {
                    const officeName = await getSetting('officeName');
                    if (!officeName) {
                        await setSetting('officeName', 'محامين مصر الرقمية');
                    }
                } catch (error) {
                    // إذا حدث خطأ، نضيف الإعدادات الافتراضية
                    try {
                        await setSetting('officeName', 'محامين مصر الرقمية');
                    } catch (e) {

                    }
                }
            }, 100);
            
            resolve(db);
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

// تحديث سجل موجود
function updateRecord(storeName, id, data) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        
        // أولاً نجيب السجل الموجود
        const getTransaction = db.transaction([storeName], 'readonly');
        const getStore = getTransaction.objectStore(storeName);
        const getRequest = getStore.get(id);
        
        getRequest.onsuccess = () => {
            const existingRecord = getRequest.result;
            if (!existingRecord) {
                reject(new Error('Record not found'));
                return;
            }
            
            // نحديث البيانات مع الاحتفاظ بالـ ID
            const updatedRecord = { ...existingRecord, ...data, id: id };
            
            // نحفظ السجل المحدث
            const updateTransaction = db.transaction([storeName], 'readwrite');
            const updateStore = updateTransaction.objectStore(storeName);
            const updateRequest = updateStore.put(updatedRecord);
            
            updateRequest.onsuccess = (event) => resolve(event.target.result);
            updateRequest.onerror = (event) => reject(event.target.error);
        };
        
        getRequest.onerror = (event) => reject(event.target.error);
    });
}

function deleteRecord(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}

function getById(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!db || id === undefined || id === null) return resolve(null);
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result || null);
        request.onerror = (e) => reject(e.target.error);
    });
}

function getFromIndex(storeName, indexName, query) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const index = store.index(indexName);
        const request = index.getAll(query);
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = (e) => reject(e.target.error);
    });
}

function addClient(clientData) {
    return new Promise(async (resolve, reject) => {
        if (!db) return reject("DB not initialized");
        try {
            const lic = await getSetting('licensed');
            const isLicensed = (lic === true || lic === 'true');
            if (!isLicensed) {
                const count = await getCount('clients');
                if (count >= 14) {
                    try { if (typeof showToast === 'function') showToast('وصلت للحد الأقصى للموكلين (14)، يرجى التفعيل للمتابعة', 'error'); } catch (e) {}
                    return reject(new Error('ClientLimitReached'));
                }
            }
        } catch (e) {}
        const transaction = db.transaction(['clients'], 'readwrite');
        const objectStore = transaction.objectStore('clients');
        const request = objectStore.add(clientData);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getAllClients() {
     return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['clients'], 'readonly');
        const objectStore = transaction.objectStore('clients');
        const request = objectStore.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getClientByName(name) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['clients'], 'readonly');
        const store = transaction.objectStore('clients');
        const index = store.index('name');
        const request = index.getAll(name);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

function addOpponent(opponentData) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['opponents'], 'readwrite');
        const objectStore = transaction.objectStore('opponents');
        const request = objectStore.add(opponentData);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getAllOpponents() {
     return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['opponents'], 'readonly');
        const objectStore = transaction.objectStore('opponents');
        const request = objectStore.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getOpponentByName(name) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['opponents'], 'readonly');
        const store = transaction.objectStore('opponents');
        const index = store.index('name');
        const request = index.getAll(name);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e.target.error);
    });
}

function addCase(caseData) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['cases'], 'readwrite');
        const objectStore = transaction.objectStore('cases');
        const request = objectStore.add(caseData);
        request.onsuccess = (event) => {
            // حذف العلاقة المؤقتة بما أنه تم إنشاء قضية فعلية
            if (caseData.clientId && caseData.opponentId) {
                cleanupTempClientOpponentRelation(caseData.clientId, caseData.opponentId);
            }
            resolve(event.target.result);
        };
        request.onerror = (event) => {
            if (event.target.error.name === 'ConstraintError') {
                reject(new Error('ConstraintError: A case with this number and year already exists.'));
            } else {
                reject(event.target.error);
            }
        };
    });
}

// دالة لحذف العلاقة المؤقتة بين الموكل والخصم
function cleanupTempClientOpponentRelation(clientId, opponentId) {
    try {
        let clientOpponentRelations = JSON.parse(localStorage.getItem('clientOpponentRelations') || '{}');
        if (clientOpponentRelations[clientId]) {
            clientOpponentRelations[clientId] = clientOpponentRelations[clientId].filter(id => id !== opponentId);
            if (clientOpponentRelations[clientId].length === 0) {
                delete clientOpponentRelations[clientId];
            }
            localStorage.setItem('clientOpponentRelations', JSON.stringify(clientOpponentRelations));
        }
    } catch (error) {

    }
}

function getAllCases() {
     return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['cases'], 'readonly');
        const objectStore = transaction.objectStore('cases');
        const request = objectStore.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function addSession(sessionData) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['sessions'], 'readwrite');
        const objectStore = transaction.objectStore('sessions');
        const request = objectStore.add(sessionData);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getAllSessions() {
     return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['sessions'], 'readonly');
        const objectStore = transaction.objectStore('sessions');
        const request = objectStore.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getCount(storeName) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const countRequest = objectStore.count();
        countRequest.onsuccess = () => resolve(countRequest.result);
        countRequest.onerror = (event) => reject(event.target.error);
    });
}

async function getTomorrowSessionsCount() {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];

        const transaction = db.transaction(['sessions'], 'readonly');
        const store = transaction.objectStore('sessions');
        const request = store.openCursor();
        let count = 0;

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.sessionDate === tomorrowString) {
                    count++;
                }
                cursor.continue();
            } else {
                resolve(count);
            }
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

// دالة جديدة لحساب أعمال الغد الإدارية
async function getTomorrowAdministrativeCount() {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];

        const transaction = db.transaction(['administrative'], 'readonly');
        const store = transaction.objectStore('administrative');
        const request = store.openCursor();
        let count = 0;

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.dueDate === tomorrowString) {
                    count++;
                }
                cursor.continue();
            } else {
                resolve(count);
            }
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

async function getTodaySessionsCount() {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const today = new Date();
        const todayString = today.toISOString().split('T')[0];

        const transaction = db.transaction(['sessions'], 'readonly');
        const store = transaction.objectStore('sessions');
        const request = store.openCursor();
        let count = 0;

        request.onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                if (cursor.value.sessionDate === todayString) {
                    count++;
                }
                cursor.continue();
            } else {
                resolve(count);
            }
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

// دوال الحسابات
function addAccount(accountData) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['accounts'], 'readwrite');
        const objectStore = transaction.objectStore('accounts');
        const request = objectStore.add(accountData);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getAllAccounts() {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['accounts'], 'readonly');
        const objectStore = transaction.objectStore('accounts');
        const request = objectStore.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function updateAccount(accountData) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['accounts'], 'readwrite');
        const objectStore = transaction.objectStore('accounts');
        const request = objectStore.put(accountData);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function deleteAccount(accountId) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['accounts'], 'readwrite');
        const objectStore = transaction.objectStore('accounts');
        const request = objectStore.delete(accountId);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// دالة للحصول على الحسابات بناء على فهرس معين
function getAccountsByIndex(indexName, value) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['accounts'], 'readonly');
        const objectStore = transaction.objectStore('accounts');
        const index = objectStore.index(indexName);
        const request = index.getAll(value);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// دوال عامة للتعامل مع أي جدول في قاعدة البيانات

// دالة عامة لإضافة بيانات لأي جدول
function addToStore(storeName, data) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.add(data);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// دالة عامة للحصول على جميع البيانات من أي جدول
function getAll(storeName) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction([storeName], 'readonly');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.getAll();
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// دالة عامة لإضافة سجل جديد في أي جدول
function addRecord(storeName, data) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.add(data);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// إضافة سجل مع الحفاظ على المفتاح (id أو key) باستخدام put
function putRecord(storeName, data) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.put(data);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// دالة عامة لتحديث عنصر بالـ ID في أي جدول
function updateById(storeName, id, data) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        
        // أولاً نجيب السجل الموجود
        const getTransaction = db.transaction([storeName], 'readonly');
        const getStore = getTransaction.objectStore(storeName);
        const getRequest = getStore.get(id);
        
        getRequest.onsuccess = () => {
            const existingRecord = getRequest.result;
            if (!existingRecord) {
                reject(new Error('Record not found'));
                return;
            }
            
            // نحديث البيانات مع الاحتفاظ بالـ ID
            const updatedRecord = { ...existingRecord, ...data, id: id };
            
            // نحفظ السجل المحدث
            const updateTransaction = db.transaction([storeName], 'readwrite');
            const updateStore = updateTransaction.objectStore(storeName);
            const updateRequest = updateStore.put(updatedRecord);
            
            updateRequest.onsuccess = (event) => resolve(event.target.result);
            updateRequest.onerror = (event) => reject(event.target.error);
        };
        
        getRequest.onerror = (event) => reject(event.target.error);
    });
}

// دالة عامة لحذف عنصر بالـ ID من أي جدول
function deleteById(storeName, id) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction([storeName], 'readwrite');
        const objectStore = transaction.objectStore(storeName);
        const request = objectStore.delete(id);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

// دوال الأرشفة
function toggleCaseArchive(caseId) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        
        // أولاً نجيب القضية
        const getTransaction = db.transaction(['cases'], 'readonly');
        const getStore = getTransaction.objectStore('cases');
        const getRequest = getStore.get(caseId);
        
        getRequest.onsuccess = () => {
            const caseRecord = getRequest.result;
            if (!caseRecord) {
                reject(new Error('Case not found'));
                return;
            }
            
            // نعكس حالة الأرشفة
            const updatedCase = { 
                ...caseRecord, 
                isArchived: !caseRecord.isArchived 
            };
            
            // نحفظ القضية المحدثة
            const updateTransaction = db.transaction(['cases'], 'readwrite');
            const updateStore = updateTransaction.objectStore('cases');
            const updateRequest = updateStore.put(updatedCase);
            
            updateRequest.onsuccess = (event) => resolve(updatedCase);
            updateRequest.onerror = (event) => reject(event.target.error);
        };
        
        getRequest.onerror = (event) => reject(event.target.error);
    });
}

function getArchivedCases() {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['cases'], 'readonly');
        const objectStore = transaction.objectStore('cases');
        const index = objectStore.index('isArchived');
        const request = index.getAll(true);
        request.onsuccess = (event) => resolve(event.target.result);
        request.onerror = (event) => reject(event.target.error);
    });
}

function getActiveCases() {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(['cases'], 'readonly');
        const objectStore = transaction.objectStore('cases');
        const request = objectStore.getAll();
        request.onsuccess = (event) => {
            const allCases = event.target.result;
            const activeCases = allCases.filter(c => !c.isArchived);
            resolve(activeCases);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

// دوال الإعدادات
function getSetting(key) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        
        // التحقق من وجود جدول الإعدادات
        if (!db.objectStoreNames.contains('settings')) {
            resolve(null);
            return;
        }
        
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get(key);
        request.onsuccess = () => {
            const result = request.result;
            resolve(result ? result.value : null);
        };
        request.onerror = (event) => reject(event.target.error);
    });
}

function setSetting(key, value) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        
        // التحقق من وجود جدول الإعدادات
        if (!db.objectStoreNames.contains('settings')) {
            reject("Settings table not found");
            return;
        }
        
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        const request = store.put({ key: key, value: value });
        request.onsuccess = () => resolve();
        request.onerror = (event) => reject(event.target.error);
    });
}