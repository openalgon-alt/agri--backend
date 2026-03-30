const fs = require('fs');
const path = require('path');

function replaceInFile(filePath, level) {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // level 0 means src/routes/*.js
    // level 1 means src/routes/admin/*.js
    
    const correctPath = level === 0 ? '../../api/_lib/supabase.js' : '../../../api/_lib/supabase.js';
    
    // Replace statically
    content = content.replace(/['"]\.\/_lib\/supabase\.js['"]/g, `'${correctPath}'`);
    content = content.replace(/['"]\.\.\/_lib\/supabase\.js['"]/g, `'${correctPath}'`);
    
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Fixed supabase import in ${path.basename(filePath)}`);
}

const routesDir = path.join(__dirname, 'src', 'routes');
const filesLevel0 = fs.readdirSync(routesDir);
for (const f of filesLevel0) {
    if (f.endsWith('.js')) {
        replaceInFile(path.join(routesDir, f), 0);
    }
}

const adminDir = path.join(routesDir, 'admin');
if (fs.existsSync(adminDir)) {
    const filesLevel1 = fs.readdirSync(adminDir);
    for (const f of filesLevel1) {
        if (f.endsWith('.js')) {
            replaceInFile(path.join(adminDir, f), 1);
        }
    }
}

console.log("Supabase paths fixed.");
