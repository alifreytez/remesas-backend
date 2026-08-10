const fs = require('fs');
const path = require('path');

// Fix as const as const in models
const modelsDir = '/home/alifreytez/remesas/backend/src/database/models/main';
fs.readdirSync(modelsDir).forEach(file => {
    if (!file.endsWith('.ts')) return;
    const p = path.join(modelsDir, file);
    let content = fs.readFileSync(p, 'utf8');
    let original = content;
    // Replace multiple 'as const' with just one
    content = content.replace(/as const as const/g, 'as const');
    if (original !== content) {
        fs.writeFileSync(p, content);
        console.log('Fixed as const in ' + file);
    }
});

// Remove inversify from repos
const reposDir = '/home/alifreytez/remesas/backend/src/database/repositories/main';
fs.readdirSync(reposDir).forEach(file => {
    if (!file.endsWith('.ts')) return;
    const p = path.join(reposDir, file);
    let content = fs.readFileSync(p, 'utf8');
    let original = content;
    
    if (content.includes('inversify')) {
        content = content.replace(/import \{ injectable \} from 'inversify';\r?\n/g, '')
                         .replace(/@injectable\(\)\r?\n/g, '')
                         .replace(/export default class (\w+) extends/g, 'class $1 extends');
        // Check if export default new already exists to prevent duplicates
        if (!content.includes('export default new')) {
            const match = content.match(/class (\w+)/);
            if (match) {
                content += '\nexport default new ' + match[1] + '();\n';
            }
        }
        
        fs.writeFileSync(p, content);
        console.log('Removed inversify from ' + file);
    }
});
