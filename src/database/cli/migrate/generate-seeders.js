import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlFilePath = path.join(__dirname, 'estructura_db.sql');
const currentDataDir = path.join(__dirname, 'current-data');
const seedersDir = path.join(__dirname, 'seeders');

if (fs.existsSync(seedersDir)) {
    fs.rmSync(seedersDir, { recursive: true, force: true });
}
fs.mkdirSync(seedersDir, { recursive: true });

const sqlContent = fs.existsSync(sqlFilePath) ? fs.readFileSync(sqlFilePath, 'utf8') : '';

// 1. Same parsing logic as generate-migration to get topological sort
const statements = [];
let currentStmt = '';
let inString = false;
let inDoubleQuote = false;
let dollarQuoteTag = null;

for (let i = 0; i < sqlContent.length; i++) {
    const char = sqlContent[i];
    const nextChar = sqlContent[i + 1] || '';

    currentStmt += char;

    if (!inString && !inDoubleQuote && !dollarQuoteTag) {
        if (char === "'") {
            inString = true;
        } else if (char === '"') {
            inDoubleQuote = true;
        } else if (char === '$') {
            let match = sqlContent.substring(i).match(/^(\$[a-zA-Z0-9_]*\$)/);
            if (match) {
                dollarQuoteTag = match[1];
                currentStmt += match[1].substring(1);
                i += match[1].length - 1;
            }
        } else if (char === ';') {
            statements.push(currentStmt.trim());
            currentStmt = '';
        }
    } else if (inString) {
        if (char === "'") {
            if (nextChar === "'") {
                currentStmt += "'";
                i++;
            } else {
                inString = false;
            }
        }
    } else if (inDoubleQuote) {
        if (char === '"') {
            if (nextChar === '"') {
                currentStmt += '"';
                i++;
            } else {
                inDoubleQuote = false;
            }
        }
    } else if (dollarQuoteTag) {
        if (char === '$') {
            let match = sqlContent.substring(i, i + dollarQuoteTag.length);
            if (match === dollarQuoteTag) {
                dollarQuoteTag = null;
                currentStmt += match.substring(1);
                i += match.length - 1;
            }
        }
    }
}
if (currentStmt.trim()) {
    statements.push(currentStmt.trim());
}

function extractTableColumns(body) {
    const cols = [];
    let current = '';
    let depth = 0;
    let inStr = false;
    for (let i = 0; i < body.length; i++) {
        const char = body[i];
        if (char === "'") inStr = !inStr;
        if (!inStr) {
            if (char === '(') depth++;
            else if (char === ')') depth--;
            else if (char === ',' && depth === 0) {
                if (current.trim()) cols.push(current.trim());
                current = '';
                continue;
            }
        }
        current += char;
    }
    if (current.trim()) cols.push(current.trim());
    return cols;
}

function parseColumnDef(def) {
    const parts = def.match(/^([a-zA-Z0-9_]+)\s+(.+)$/s);
    if (!parts) return null;
    const name = parts[1];
    let rest = parts[2];

    let typeStr = 'Sequelize.STRING';

    if (rest.match(/^serial/i)) {
        typeStr = 'Sequelize.INTEGER';
    } else if (rest.match(/^(?:character varying|varchar)(\s*\(\s*\d+\s*\))?/i)) {
        typeStr = 'Sequelize.STRING';
    } else if (rest.match(/^timestamp(?:\s+without\s+time\s+zone)?/i)) {
        typeStr = 'Sequelize.DATE';
    } else if (rest.match(/^date/i)) {
        typeStr = 'Sequelize.DATEONLY';
    } else if (rest.match(/^(?:integer|int4|int)/i)) {
        typeStr = 'Sequelize.INTEGER';
    } else if (rest.match(/^(?:bigint|int8)/i)) {
        typeStr = 'Sequelize.BIGINT';
    } else if (rest.match(/^numeric(\s*\(\s*\d+\s*,\s*\d+\s*\))?/i)) {
        typeStr = 'Sequelize.DECIMAL';
    } else if (rest.match(/^boolean/i)) {
        typeStr = 'Sequelize.BOOLEAN';
    } else if (rest.match(/^text/i)) {
        typeStr = 'Sequelize.TEXT';
    } else if (rest.match(/^jsonb?/i)) {
        typeStr = 'Sequelize.JSONB';
    } else if (rest.match(/^double precision/i)) {
        typeStr = 'Sequelize.DOUBLE';
    } else if (rest.match(/^real|float/i)) {
        typeStr = 'Sequelize.FLOAT';
    }

    return { name, type: typeStr };
}

const tables = new Map();

function getTableEntry(schemaTable) {
    if (!tables.has(schemaTable)) {
        const [schema, tableName] = schemaTable.split('.');
        tables.set(schemaTable, { name: schemaTable, schema, tableName, columns: {}, deps: new Set() });
    }
    return tables.get(schemaTable);
}

for (const stmt of statements) {
    if (!stmt) continue;
    if (/^CREATE TABLE\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)/i.test(stmt)) {
        const match = stmt.match(/^CREATE TABLE\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s*\(([\s\S]+)\)\s*;?$/i);
        if (match) {
            const name = match[1];
            const body = match[2];
            const colStrs = extractTableColumns(body);
            const entry = getTableEntry(name);
            for (const colStr of colStrs) {
                if (colStr.match(/^(?:CONSTRAINT|PRIMARY KEY|FOREIGN KEY|UNIQUE)/i)) continue;
                const parsedCol = parseColumnDef(colStr);
                if (parsedCol) {
                    entry.columns[parsedCol.name] = parsedCol.type;
                }
            }
        }
    } else if (
        /^ALTER TABLE\s+(?:ONLY\s+)?([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s+ADD CONSTRAINT\s+([a-zA-Z0-9_]+)\s+FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s*\(([^)]+)\)/i.test(
            stmt
        )
    ) {
        const match = stmt.match(
            /^ALTER TABLE\s+(?:ONLY\s+)?([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s+ADD CONSTRAINT\s+([a-zA-Z0-9_]+)\s+FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s*\(([^)]+)\)/i
        );
        if (match) {
            const table = match[1];
            const refTableFull = match[4];
            const entry = getTableEntry(table);
            entry.deps.add(refTableFull);
        }
    }
}

// Topological Sort
const sortedTables = [];
const visited = new Set();
const visiting = new Set();

function visit(tableName) {
    if (visited.has(tableName)) return;
    if (visiting.has(tableName)) return;

    visiting.add(tableName);
    const entry = tables.get(tableName);
    if (entry) {
        for (const dep of entry.deps) {
            if (tables.has(dep) && dep !== tableName) {
                visit(dep);
            }
        }
        sortedTables.push(entry);
    }
    visiting.delete(tableName);
    visited.add(tableName);
}

for (const tableName of tables.keys()) {
    visit(tableName);
}

// 2. Format Value helper
function formatValue(val, type) {
    if (val === '\\N') return 'null';

    // Unescape postgres COPY format
    let unescaped = val.replace(/\\\\/g, '\\').replace(/\\n/g, '\n').replace(/\\r/g, '\r').replace(/\\t/g, '\t').replace(/\\b/g, '\b');

    if (!type) return JSON.stringify(unescaped);

    if (type === 'Sequelize.BOOLEAN') {
        return unescaped === 't' ? 'true' : 'false';
    } else if (type === 'Sequelize.INTEGER' || type === 'Sequelize.BIGINT' || type === 'Sequelize.FLOAT' || type === 'Sequelize.DOUBLE' || type === 'Sequelize.DECIMAL') {
        if (!isNaN(unescaped) && unescaped.trim() !== '') {
            return unescaped;
        }
    }

    return JSON.stringify(unescaped);
}

// 3. Generate Seeders
let currentTimestamp = new Date('2026-07-20T10:00:00Z').getTime();
function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
}
function getTimestampStr(ts) {
    const d = new Date(ts);
    return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}`;
}

let seederIdx = 1;

for (const entry of sortedTables) {
    const dataFilePath = path.join(currentDataDir, `${entry.schema}.${entry.tableName}.sql`);
    if (!fs.existsSync(dataFilePath)) continue;

    const content = fs.readFileSync(dataFilePath, 'utf8');
    const copyMatch = content.match(/COPY\s+([a-zA-Z0-9_]+)\.([a-zA-Z0-9_]+)\s*\(([^)]+)\)\s*FROM\s*stdin;/i);
    if (!copyMatch) continue;

    const cols = copyMatch[3].split(',').map((c) => c.trim().replace(/"/g, ''));

    const dataStart = content.indexOf(copyMatch[0]) + copyMatch[0].length;
    const dataEnd = content.indexOf('\\.', dataStart);
    const dataBlock = content.substring(dataStart, dataEnd).trim();

    if (!dataBlock) continue;

    const lines = dataBlock.split('\n').filter((r) => r.trim() !== '');

    // Generate JS array contents
    let dataStr = '[\n';
    for (let i = 0; i < lines.length; i++) {
        const vals = lines[i].split('\t');
        let objStr = '        { ';
        cols.forEach((c, idx) => {
            const colType = entry.columns[c];
            const formattedVal = formatValue(vals[idx], colType);
            objStr += `"${c}": ${formattedVal}`;
            if (idx < cols.length - 1) objStr += ', ';
        });
        objStr += ' }';
        if (i < lines.length - 1) objStr += ',';
        objStr += '\n';
        dataStr += objStr;
    }
    dataStr += '      ]';

    let sequenceStr = '';
    const seqMatch = content.match(/SELECT\s+pg_catalog\.setval\('([^']+)',\s*(\d+),\s*(true|false)\);/i);
    if (seqMatch) {
        sequenceStr = `await queryInterface.sequelize.query(\`SELECT pg_catalog.setval('${seqMatch[1]}', ${seqMatch[2]}, ${seqMatch[3]});\`);`;
    }

    const fileContent = `
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const data = ${dataStr};
      
      const chunkSize = 1000;
      for (let i = 0; i < data.length; i += chunkSize) {
        await queryInterface.bulkInsert(
          { schema: '${entry.schema}', tableName: '${entry.tableName}' }, 
          data.slice(i, i + chunkSize), 
          { ignoreDuplicates: true }
        );
      }
      
      ${sequenceStr}
    } catch (error) {
      console.error('Error in seeder ${entry.schema}.${entry.tableName}:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete({ schema: '${entry.schema}', tableName: '${entry.tableName}' }, null, {});
  }
};
`;

    const cleanName = entry.name.replace('.', '_');
    const filename = `${getTimestampStr(currentTimestamp)}-${pad2(seederIdx)}-seed-${cleanName}.cjs`;

    fs.writeFileSync(path.join(seedersDir, filename), fileContent.trim());

    currentTimestamp += 1000;
    seederIdx++;
}

console.log(`Seeders generados exitosamente en ${seedersDir}`);
