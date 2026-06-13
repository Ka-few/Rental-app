const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) results = results.concat(walk(file));
        else if (file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    });
    return results;
}

const files = walk(path.join(__dirname, 'src'));
files.forEach(f => {
    let content = fs.readFileSync(f, 'utf8');
    let original = content;
    
    if (content.includes('CapacitorSQLitePlugin')) {
        content = content.replace(
            /import\s+\{([^}]*CapacitorSQLitePlugin[^}]*)\}\s+from\s+["']@capacitor-community\/sqlite["']/,
            (match, group) => {
                const parts = group.split(',').map(s => s.trim()).filter(Boolean);
                const valParts = parts.filter(p => !p.includes('CapacitorSQLitePlugin'));
                let newImport = `import { ${valParts.join(', ')} } from "@capacitor-community/sqlite";\nimport type { CapacitorSQLitePlugin } from "@capacitor-community/sqlite";`;
                return newImport;
            }
        );
    }
    
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+["'](\.\.\/types)["']/g, "import type { $1 } from \"$2\"");
    content = content.replace(/import\s+\{([^}]+)\}\s+from\s+["'](\.\/types)["']/g, "import type { $1 } from \"$2\"");
    
    if (content !== original) {
        fs.writeFileSync(f, content, 'utf8');
        console.log('Fixed types in', f);
    }
});
