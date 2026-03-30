const fs = require('fs');
const path = require('path');

const traverseDir = (dir) => {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            traverseDir(fullPath);
        } else if (file.endsWith('.js')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            
            // Remove res.setHeader('Access-Control-*' lines
            content = content.replace(/res\.setHeader\s*\(\s*['"`]Access-Control-[^;]+;\n?/g, '');
            
            // Remove OPTIONS block: if (req.method === 'OPTIONS') { return res.status(200).end(); }
            content = content.replace(/if\s*\(\s*req\.method\s*===\s*['"`]OPTIONS['"`]\s*\)\s*\{\s*return\s*res\.status\(200\)\.end\(\);\s*\}\n?/g, '');
            
            // Also clean up any lingering comments like "// CORS configuration"
            content = content.replace(/\/\/\s*CORS configuration[ \t\n]*/ig, '');

            fs.writeFileSync(fullPath, content, 'utf8');
            console.log("Cleaned CORS from:", fullPath);
        }
    }
};

const routesDir = path.join(__dirname, 'src', 'routes');
traverseDir(routesDir);
console.log("CORS cleanup script finished.");
