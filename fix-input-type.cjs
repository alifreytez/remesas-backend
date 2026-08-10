const fs = require('fs');
const path = require('path');
const dir = '/home/alifreytez/remesas/backend/src/database/models/main';

fs.readdirSync(dir).forEach(file => {
    if (!file.endsWith('.ts')) return;
    const p = path.join(dir, file);
    let content = fs.readFileSync(p, 'utf8');
    let original = content;
    content = content.replace(/inputType:\s*'([^']+)'(,?)/g, (match, p1, p2) => {
        if (match.includes('as const')) return match;
        return `inputType: '${p1}' as const${p2}`;
    });
    if (original !== content) {
        fs.writeFileSync(p, content);
        console.log('Updated ' + file);
    }
});
