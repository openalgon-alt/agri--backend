const fs = require('fs');
const path = require('path');

const backendRoot = path.join(__dirname, '..');
const apiDir = path.join(backendRoot, 'api');
const adminApiDir = path.join(apiDir, 'admin');

const srcRoutesDir = path.join(backendRoot, 'src', 'routes');
const srcRoutesAdminDir = path.join(srcRoutesDir, 'admin');

// Create directories
fs.mkdirSync(srcRoutesDir, { recursive: true });
fs.mkdirSync(srcRoutesAdminDir, { recursive: true });

function moveAndFix(src, dest, nestingLevel) {
    if (!fs.existsSync(src)) return;
    
    let content = fs.readFileSync(src, 'utf-8');
    
    // Fix imports for `_lib/neon.js`
    // From api/*.js (nesting 0) -> src/routes/*.js (needs ../../api/_lib)
    // From api/admin/*.js (nesting 1) -> src/routes/admin/*.js (needs ../../../api/_lib)
    const neonPath = nestingLevel === 0 ? '../../api/_lib/neon.js' : '../../../api/_lib/neon.js';
    
    content = content.replace(/from\s+['"]\.\/_lib\/neon\.js['"]/g, `from '${neonPath}'`);
    content = content.replace(/from\s+['"]\.\.\/_lib\/neon\.js['"]/g, `from '${neonPath}'`);
    
    fs.writeFileSync(dest, content);
    fs.unlinkSync(src); // delete old file
    console.log(`Moved & Fixed: ${path.basename(src)} -> ${dest}`);
}

// Move root API files
const rootFiles = fs.readdirSync(apiDir);
for (const file of rootFiles) {
    if (file.endsWith('.js') && file !== 'index.js') {
        moveAndFix(path.join(apiDir, file), path.join(srcRoutesDir, file), 0);
    }
}

// Move admin API files
if (fs.existsSync(adminApiDir)) {
    const adminFiles = fs.readdirSync(adminApiDir);
    for (const file of adminFiles) {
        if (file.endsWith('.js')) {
            moveAndFix(path.join(adminApiDir, file), path.join(srcRoutesAdminDir, file), 1);
        }
    }
    // Try to remove admin dir if empty
    try { fs.rmdirSync(adminApiDir); } catch(e) {}
}

console.log("Refactoring complete.");
