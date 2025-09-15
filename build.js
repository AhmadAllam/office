#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

// Electron versions configuration
const ELECTRON_VERSIONS = {
    modern: '38.1.0',
    legacy: '22.3.27'
};

// Cache directories - Safe location in AppData
const CACHE_DIR = path.join(process.env.APPDATA, 'LawyerApp', 'electron-cache');
const MODERN_CACHE = path.join(CACHE_DIR, 'modern');
const LEGACY_CACHE = path.join(CACHE_DIR, 'legacy');

// Colors for terminal output
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m'
};

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function colorText(text, color) {
    return `${colors[color]}${text}${colors.reset}`;
}

function showHeader() {
    console.clear();
    console.log(colorText('╔══════════════════════════════════════════════════════════════╗', 'cyan'));
    console.log(colorText('║                    LAWYER APP BUILD SYSTEM                  ║', 'cyan'));
    console.log(colorText('╚══════════════════════════════════════════════════════════════╝', 'cyan'));
    console.log();
}

function showVersionInfo() {
    console.log(colorText('📋 VERSION INFORMATION:', 'yellow'));
    console.log(colorText('┌─────────────────────────────────────────────────────────────┐', 'blue'));
    console.log(colorText('│ MODERN VERSION  │ Electron 38.1.0 │ Windows 10/11 Only  │', 'blue'));
    console.log(colorText('│ LEGACY VERSION  │ Electron 22.3.27│ Windows 7/8/10/11   │', 'blue'));
    console.log(colorText('└─────────────────────────────────────────────────────────────┘', 'blue'));
    console.log();
}

function showMenu() {
    console.log(colorText('🚀 SELECT BUILD TYPE:', 'green'));
    console.log('  1) Modern Version  (Windows 10/11)');
    console.log('  2) Legacy Version  (Windows 7+)');
    console.log('  3) Both Versions');
    console.log('  4) Show Info');
    console.log('  5) Clear Cache');
    console.log('  6) Exit');
    console.log();
}

function executeCommand(command, description) {
    try {
        console.log(colorText(`\n⏳ ${description}...`, 'yellow'));
        execSync(command, { stdio: 'inherit' });
        console.log(colorText(`✅ ${description} completed successfully!`, 'green'));
        return true;
    } catch (error) {
        console.log(colorText(`❌ Error during ${description}:`, 'red'));
        console.log(colorText(error.message, 'red'));
        return false;
    }
}

// Cache management functions
function ensureCacheDir() {
    if (!fs.existsSync(CACHE_DIR)) {
        fs.mkdirSync(CACHE_DIR, { recursive: true });
        console.log(colorText('📁 Created cache directory', 'blue'));
    }
}

function isElectronCached(version) {
    const cacheDir = version === 'modern' ? MODERN_CACHE : LEGACY_CACHE;
    return fs.existsSync(path.join(cacheDir, 'node_modules', 'electron'));
}

function getCurrentElectronVersion() {
    try {
        const packagePath = path.join(__dirname, 'node_modules', 'electron', 'package.json');
        if (fs.existsSync(packagePath)) {
            const pkg = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
            return pkg.version;
        }
    } catch (error) {
        // Ignore errors
    }
    return null;
}

function cacheElectronVersion(version) {
    const cacheDir = version === 'modern' ? MODERN_CACHE : LEGACY_CACHE;
    const electronVersion = ELECTRON_VERSIONS[version];
    
    ensureCacheDir();
    
    if (isElectronCached(version)) {
        console.log(colorText(`📦 Electron ${electronVersion} already cached`, 'green'));
        return true;
    }
    
    console.log(colorText(`📥 Caching Electron ${electronVersion}...`, 'yellow'));
    
    // Create cache directory
    if (!fs.existsSync(cacheDir)) {
        fs.mkdirSync(cacheDir, { recursive: true });
    }
    
    // Create temporary package.json for cache
    const tempPackageJson = {
        "name": "electron-cache",
        "version": "1.0.0",
        "devDependencies": {
            "electron": electronVersion
        }
    };
    
    fs.writeFileSync(path.join(cacheDir, 'package.json'), JSON.stringify(tempPackageJson, null, 2));
    
    // Install electron in cache directory
    try {
        execSync(`Set-Location "${cacheDir}"; npm install`, { stdio: 'inherit', shell: 'powershell' });
        console.log(colorText(`✅ Electron ${electronVersion} cached successfully!`, 'green'));
        return true;
    } catch (error) {
        console.log(colorText(`❌ Failed to cache Electron ${electronVersion}`, 'red'));
        return false;
    }
}

function switchToElectronVersion(version) {
    const electronVersion = ELECTRON_VERSIONS[version];
    const currentVersion = getCurrentElectronVersion();
    
    if (currentVersion === electronVersion) {
        console.log(colorText(`✅ Already using Electron ${electronVersion}`, 'green'));
        return true;
    }
    
    console.log(colorText(`🔄 Switching to Electron ${electronVersion}...`, 'cyan'));
    
    // Ensure version is cached
    if (!cacheElectronVersion(version)) {
        return false;
    }
    
    const cacheDir = version === 'modern' ? MODERN_CACHE : LEGACY_CACHE;
    const sourceNodeModules = path.join(cacheDir, 'node_modules');
    const targetNodeModules = path.join(__dirname, 'node_modules');
    
    try {
        // Remove current electron if exists
        const currentElectronPath = path.join(targetNodeModules, 'electron');
        if (fs.existsSync(currentElectronPath)) {
            execSync(`rmdir /s /q "${currentElectronPath}"`, { stdio: 'inherit' });
        }
        
        // Ensure node_modules exists
        if (!fs.existsSync(targetNodeModules)) {
            fs.mkdirSync(targetNodeModules, { recursive: true });
        }
        
        // Copy cached electron
        const cachedElectronPath = path.join(sourceNodeModules, 'electron');
        execSync(`xcopy "${cachedElectronPath}" "${currentElectronPath}" /E /I /H /Y`, { stdio: 'inherit' });
        
        console.log(colorText(`✅ Switched to Electron ${electronVersion}`, 'green'));
        return true;
        
    } catch (error) {
        console.log(colorText(`❌ Failed to switch Electron version: ${error.message}`, 'red'));
        return false;
    }
}

// Clean old build directories
function cleanBuildDirs(type = 'all') {
    console.log(colorText('🧹 Cleaning old build directories...', 'yellow'));
    
    const dirsToClean = [];
    
    if (type === 'modern' || type === 'all') {
        dirsToClean.push('dist-modern');
    }
    
    if (type === 'legacy' || type === 'all') {
        dirsToClean.push('dist-legacy');
    }
    
    for (const dir of dirsToClean) {
        const dirPath = path.join(__dirname, dir);
        if (fs.existsSync(dirPath)) {
            try {
                fs.rmSync(dirPath, { recursive: true, force: true });
                console.log(colorText(`🗑️  Removed: ${dir}/`, 'green'));
            } catch (error) {
                console.log(colorText(`⚠️  Could not remove ${dir}/: ${error.message}`, 'yellow'));
            }
        }
    }
}

function buildModern(skipClean = false) {
    console.log(colorText('\n🔧 Building Modern Version...', 'cyan'));
    
    // Clean old modern build (unless called from buildBoth)
    if (!skipClean) {
        cleanBuildDirs('modern');
    }
    
    if (!switchToElectronVersion('modern')) {
        return false;
    }
    
    if (!executeCommand('npm run build-modern', 'Building modern version')) {
        return false;
    }
    
    console.log(colorText('\n🎉 Modern version built successfully!', 'green'));
    console.log(colorText('📁 Output: dist-modern/', 'blue'));
    return true;
}

function buildLegacy(skipClean = false) {
    console.log(colorText('\n🔧 Building Legacy Version...', 'cyan'));
    
    // Clean old legacy build (unless called from buildBoth)
    if (!skipClean) {
        cleanBuildDirs('legacy');
    }
    
    if (!switchToElectronVersion('legacy')) {
        return false;
    }
    
    if (!executeCommand('npm run build-legacy', 'Building legacy version')) {
        return false;
    }
    
    console.log(colorText('\n🎉 Legacy version built successfully!', 'green'));
    console.log(colorText('📁 Output: dist-legacy/', 'blue'));
    return true;
}

function buildBoth() {
    console.log(colorText('\n🔧 Building Both Versions...', 'cyan'));
    
    // Clean all old builds at once
    cleanBuildDirs('all');
    
    const modernSuccess = buildModern(true); // Skip individual clean
    if (!modernSuccess) {
        console.log(colorText('\n⚠️  Modern build failed, continuing with legacy...', 'yellow'));
    }
    
    const legacySuccess = buildLegacy(true); // Skip individual clean
    
    if (modernSuccess && legacySuccess) {
        console.log(colorText('\n🎉 Both versions built successfully!', 'green'));
    } else if (modernSuccess || legacySuccess) {
        console.log(colorText('\n⚠️  One version built successfully, check errors above.', 'yellow'));
    } else {
        console.log(colorText('\n❌ Both builds failed. Check errors above.', 'red'));
    }
}

function showInfo() {
    try {
        console.log(colorText('\n📊 CURRENT ELECTRON VERSION:', 'cyan'));
        const currentVersion = getCurrentElectronVersion();
        if (currentVersion) {
            console.log(colorText(`Active: Electron ${currentVersion}`, 'green'));
        } else {
            console.log(colorText('No Electron installed', 'yellow'));
        }
        
        console.log(colorText('\n💾 CACHED VERSIONS:', 'cyan'));
        console.log(colorText(`Modern (${ELECTRON_VERSIONS.modern}): ${isElectronCached('modern') ? '✅ Cached' : '❌ Not cached'}`, 'blue'));
        console.log(colorText(`Legacy (${ELECTRON_VERSIONS.legacy}): ${isElectronCached('legacy') ? '✅ Cached' : '❌ Not cached'}`, 'blue'));
        
        console.log(colorText('\n📁 BUILD DIRECTORIES:', 'cyan'));
        try {
            execSync('dir dist-modern', { stdio: 'inherit' });
        } catch {
            console.log(colorText('dist-modern: Not found', 'yellow'));
        }
        
        try {
            execSync('dir dist-legacy', { stdio: 'inherit' });
        } catch {
            console.log(colorText('dist-legacy: Not found', 'yellow'));
        }
        
        console.log(colorText('\n📦 CACHE SIZE:', 'cyan'));
        if (fs.existsSync(CACHE_DIR)) {
            try {
                const stats = execSync(`powershell "Get-ChildItem -Path '${CACHE_DIR}' -Recurse | Measure-Object -Property Length -Sum | Select-Object Sum"`, { encoding: 'utf8' });
                const sizeMatch = stats.match(/(\d+)/);
                if (sizeMatch) {
                    const sizeBytes = parseInt(sizeMatch[1]);
                    const sizeMB = (sizeBytes / (1024 * 1024)).toFixed(2);
                    console.log(colorText(`Cache size: ${sizeMB} MB`, 'blue'));
                }
            } catch {
                console.log(colorText('Cache size: Unable to calculate', 'yellow'));
            }
        } else {
            console.log(colorText('No cache directory found', 'yellow'));
        }
        
    } catch (error) {
        console.log(colorText('Error getting info: ' + error.message, 'red'));
    }
}

function clearCache() {
    console.log(colorText('\n🗑️  Clearing Electron Cache...', 'yellow'));
    
    if (!fs.existsSync(CACHE_DIR)) {
        console.log(colorText('No cache directory found', 'yellow'));
        return;
    }
    
    try {
        execSync(`rmdir /s /q "${CACHE_DIR}"`, { stdio: 'inherit' });
        console.log(colorText('✅ Cache cleared successfully!', 'green'));
        console.log(colorText('💡 Next build will download Electron versions again', 'blue'));
    } catch (error) {
        console.log(colorText(`❌ Failed to clear cache: ${error.message}`, 'red'));
    }
}

function askQuestion() {
    rl.question(colorText('Enter your choice (1-6): ', 'magenta'), (answer) => {
        console.log();
        
        switch (answer.trim()) {
            case '1':
                buildModern();
                break;
            case '2':
                buildLegacy();
                break;
            case '3':
                buildBoth();
                break;
            case '4':
                showInfo();
                break;
            case '5':
                clearCache();
                break;
            case '6':
                console.log(colorText('👋 Goodbye!', 'green'));
                rl.close();
                return;
            default:
                console.log(colorText('❌ Invalid choice. Please enter 1-6.', 'red'));
        }
        
        console.log(colorText('\nPress Enter to continue...', 'yellow'));
        rl.question('', () => {
            main();
        });
    });
}

function main() {
    showHeader();
    showVersionInfo();
    showMenu();
    askQuestion();
}

// Start the application
main();