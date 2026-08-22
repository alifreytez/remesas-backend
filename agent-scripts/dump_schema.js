import fs from 'fs';
import path from 'path';

async function dumpSchema() {
    const modelsDir = path.resolve('src/database/models/main');
    const files = fs.readdirSync(modelsDir).filter(f => f.endsWith('.model.ts'));
    let md = '# Database Schema Dump\n\n';

    for (const file of files) {
        const filePath = path.join(modelsDir, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // Extract class name
        const classMatch = content.match(/export default class (\w+) extends/);
        const className = classMatch ? classMatch[1] : file;

        // Extract definition block
        const defMatch = content.match(/static definition\(\) \{([\s\S]*?)\n\s*\}\n/);
        
        md += `## ${className}\n`;

        if (defMatch) {
            let defStr = defMatch[1];
            
            // basic parsing to find fields
            const fields = [];
            const regex = /([a-zA-Z0-9_]+):\s*\{([^}]*)\}/g;
            let m;
            while ((m = regex.exec(defStr)) !== null) {
                const fieldName = m[1];
                const fieldBody = m[2];
                
                let type = "Unknown";
                const typeMatch = fieldBody.match(/type:\s*([^,\n]+)/);
                if (typeMatch) type = typeMatch[1].trim();

                let allowNull = "true";
                const allowNullMatch = fieldBody.match(/allowNull:\s*(true|false)/);
                if (allowNullMatch) allowNull = allowNullMatch[1];

                fields.push(`- **${fieldName}**: \`${type}\` ${allowNull === 'false' ? '(Required)' : '(Optional)'}`);
            }

            md += fields.join('\n') + '\n\n';
        } else {
            md += `*Could not parse definition*\n\n`;
        }

        // Extract relations block
        const relMatch = content.match(/static relations\(\)[\s\S]*?return\s*\[([\s\S]*?)\];/);
        if (relMatch) {
            const relStr = relMatch[1];
            const relations = [];
            const relRegex = /\{[^}]*target:\s*'([^']+)'[^}]*foreignKey:\s*'([^']+)'[^}]*\}/g;
            let r;
            while ((r = relRegex.exec(relStr)) !== null) {
                relations.push(`- BelongsTo **${r[1]}** (FK: \`${r[2]}\`)`);
            }
            if (relations.length > 0) {
                md += `### Relations\n` + relations.join('\n') + '\n\n';
            }
        }
    }

    fs.writeFileSync('C:/Users/alifreytez/.gemini/antigravity/brain/5cd8de89-fff5-4503-8c68-5c25637c7b6a/schema.md', md);
    console.log('Schema dumped to schema.md');
}

dumpSchema().catch(console.error);
