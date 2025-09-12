const { contextBridge, ipcRenderer } = require('electron');


contextBridge.exposeInMainWorld('electronAPI', {
    createClientFolder: (clientName) => ipcRenderer.invoke('create-client-folder', clientName),
    openClientFolder: (clientName) => ipcRenderer.invoke('open-client-folder', clientName),
    openClientsMainFolder: () => ipcRenderer.invoke('open-clients-main-folder'),
    createLegalLibraryFolder: (folderName) => ipcRenderer.invoke('create-legal-library-folder', folderName),
    openLegalLibraryMainFolder: () => ipcRenderer.invoke('open-legal-library-main-folder'),
    loadLegalLibraryFolders: () => ipcRenderer.invoke('load-legal-library-folders'),
    openLegalLibraryFolder: (folderName) => ipcRenderer.invoke('open-legal-library-folder', folderName),
    deleteLegalLibraryFolder: (folderName) => ipcRenderer.invoke('delete-legal-library-folder', folderName),
    renameLegalLibraryFolder: (oldName, newName) => ipcRenderer.invoke('rename-legal-library-folder', oldName, newName),
    attachFilesToFolder: (folderName) => ipcRenderer.invoke('attach-files-to-folder', folderName),
    openDownloadSite: (siteNumber) => ipcRenderer.invoke('open-download-site', siteNumber),
    selectFolder: () => ipcRenderer.invoke('select-folder'),
    buildAccessBackup: (customFolder) => ipcRenderer.invoke('build-access-backup', customFolder),
    openFolder: (folderPath) => ipcRenderer.invoke('open-folder', folderPath),
    copyPackToDesktop: () => ipcRenderer.invoke('copy-pack-to-desktop'),

    onOpenWebsiteTab: (callback) => ipcRenderer.on('open-website-tab', callback)
});