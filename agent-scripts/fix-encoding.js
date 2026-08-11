const fs = require('fs');
const path = require('path');

function fixDoubleEncoding(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        // Check if there are any strange characters like �, �, etc.
        if (content.includes('�') || content.includes('�')) {
            // Revert the double encoding: string -> latin1 buffer -> utf8 string
            // Note: If Windows-1252 was used, latin1 might not cover 0x80-0x9F perfectly, 
            // but for standard Spanish accents (�����, �) which are in ISO-8859-1, it matches perfectly.
            const buffer = Buffer.from(content, 'latin1');
            const fixedContent = buffer.toString('utf8');
            
            fs.writeFileSync(filePath, fixedContent, 'utf8');
            console.log(`Fixed: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error processing ${filePath}: ${err.message}`);
    }
}

function walkDir(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (!fullPath.includes('node_modules') && !fullPath.includes('.git')) {
                walkDir(fullPath);
            }
        } else {
            const ext = path.extname(fullPath);
            if (['.env', '.ts', '.js', '.yaml', '.yml', '.md', '.bru'].includes(ext) || file.startsWith('.env')) {
                fixDoubleEncoding(fullPath);
            }
        }
    }
}

const targetDir = path.resolve(__dirname, '..'); // Points to remesas root
walkDir(targetDir);
console.log('Encoding fix completed.');

