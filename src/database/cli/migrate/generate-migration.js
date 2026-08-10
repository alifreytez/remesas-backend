import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sqlFilePath = path.join(__dirname, 'estructura_db.sql');
const migrationsDir = path.join(__dirname, 'migrations');

if (fs.existsSync(migrationsDir)) {
    fs.rmSync(migrationsDir, { recursive: true, force: true });
}
fs.mkdirSync(migrationsDir, { recursive: true });

const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

// Custom splitter to respect string literals and dollar quotes
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
                i++; // skip escaped quote
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

// Helpers for parsing
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

    const colObj = {};
    let typeStr = 'Sequelize.STRING';

    if (rest.match(/^serial/i)) {
        typeStr = 'Sequelize.INTEGER';
        colObj.autoIncrement = true;
        rest = rest.replace(/^serial/i, '').trim();
    } else if (rest.match(/^(?:character varying|varchar)(\s*\(\s*\d+\s*\))?/i)) {
        const m = rest.match(/^(?:character varying|varchar)(\s*\(\s*\d+\s*\))?/i);
        typeStr = m[1] ? `Sequelize.STRING${m[1]}` : 'Sequelize.STRING';
        rest = rest.replace(/^(?:character varying|varchar)(\s*\(\s*\d+\s*\))?/i, '').trim();
    } else if (rest.match(/^timestamp(?:\s+without\s+time\s+zone)?/i)) {
        typeStr = 'Sequelize.DATE';
        rest = rest.replace(/^timestamp(?:\s+without\s+time\s+zone)?/i, '').trim();
    } else if (rest.match(/^date/i)) {
        typeStr = 'Sequelize.DATEONLY';
        rest = rest.replace(/^date/i, '').trim();
    } else if (rest.match(/^(?:integer|int4|int)/i)) {
        typeStr = 'Sequelize.INTEGER';
        rest = rest.replace(/^(?:integer|int4|int)/i, '').trim();
    } else if (rest.match(/^(?:bigint|int8)/i)) {
        typeStr = 'Sequelize.BIGINT';
        rest = rest.replace(/^(?:bigint|int8)/i, '').trim();
    } else if (rest.match(/^numeric(\s*\(\s*\d+\s*,\s*\d+\s*\))?/i)) {
        const m = rest.match(/^numeric(\s*\(\s*\d+\s*,\s*\d+\s*\))?/i);
        typeStr = m[1] ? `Sequelize.DECIMAL${m[1]}` : 'Sequelize.DECIMAL';
        rest = rest.replace(/^numeric(\s*\(\s*\d+\s*,\s*\d+\s*\))?/i, '').trim();
    } else if (rest.match(/^boolean/i)) {
        typeStr = 'Sequelize.BOOLEAN';
        rest = rest.replace(/^boolean/i, '').trim();
    } else if (rest.match(/^text/i)) {
        typeStr = 'Sequelize.TEXT';
        rest = rest.replace(/^text/i, '').trim();
    } else if (rest.match(/^jsonb?/i)) {
        typeStr = 'Sequelize.JSONB';
        rest = rest.replace(/^jsonb?/i, '').trim();
    } else if (rest.match(/^double precision/i)) {
        typeStr = 'Sequelize.DOUBLE';
        rest = rest.replace(/^double precision/i, '').trim();
    } else if (rest.match(/^real|float/i)) {
        typeStr = 'Sequelize.FLOAT';
        rest = rest.replace(/^real|float/i, '').trim();
    } else {
        const m = rest.match(/^([a-zA-Z0-9_]+(\s*\([^)]*\))?)/);
        if (m) {
            rest = rest.substring(m[0].length).trim();
        }
    }

    colObj.type = typeStr;

    if (/\bNOT NULL\b/i.test(rest)) {
        colObj.allowNull = false;
        rest = rest.replace(/\bNOT NULL\b/i, '').trim();
    }

    if (/\bNULL\b/i.test(rest) && !/\bNOT NULL\b/i.test(rest)) {
        colObj.allowNull = true;
        rest = rest.replace(/\bNULL\b/i, '').trim();
    }

    if (/\bPRIMARY KEY\b/i.test(rest)) {
        colObj.primaryKey = true;
        rest = rest.replace(/\bPRIMARY KEY\b/i, '').trim();
    }

    const defMatch = rest.match(/\bDEFAULT\s+(.+?)(?:\s+NOT NULL|\s+NULL|\s*$)/i) || rest.match(/\bDEFAULT\s+(.+)$/i);
    if (defMatch) {
        let defValRaw = defMatch[1].trim();
        defValRaw = defValRaw.replace(/\s+(NOT NULL|NULL)$/i, '').trim();
        if (defValRaw.toLowerCase() === 'now()' || defValRaw.toLowerCase() === 'current_timestamp') {
            colObj.defaultValue = "Sequelize.literal('CURRENT_TIMESTAMP')";
        } else if (/^'.*'$/.test(defValRaw)) {
            colObj.defaultValue = defValRaw;
        } else if (!isNaN(Number(defValRaw))) {
            colObj.defaultValue = Number(defValRaw);
        } else if (defValRaw.toLowerCase() === 'true' || defValRaw.toLowerCase() === 'false') {
            colObj.defaultValue = defValRaw.toLowerCase() === 'true';
        } else {
            colObj.defaultValue = `Sequelize.literal(\`${defValRaw.replace(/`/g, '\\`')}\`)`;
        }
    }

    return { name, def: colObj };
}

function stringifyColumnDef(def) {
    let parts = [`type: ${def.type}`];
    if (def.primaryKey) parts.push(`primaryKey: true`);
    if (def.autoIncrement) parts.push(`autoIncrement: true`);
    if (def.allowNull !== undefined) parts.push(`allowNull: ${def.allowNull}`);
    if (def.defaultValue !== undefined) {
        if (typeof def.defaultValue === 'string' && def.defaultValue.startsWith('Sequelize.literal')) {
            parts.push(`defaultValue: ${def.defaultValue}`);
        } else if (typeof def.defaultValue === 'string') {
            parts.push(`defaultValue: ${def.defaultValue}`);
        } else {
            parts.push(`defaultValue: ${def.defaultValue}`);
        }
    }
    return `{ ${parts.join(', ')} }`;
}

// Categorize statements
const schemas = [];
const extensions = [];
const tables = new Map(); // "schema.table" -> { schema, tableName, columns, pks, fks, indexes, deps }
const procedures = [];
const functions = [];

function getTableEntry(schemaTable) {
    if (!tables.has(schemaTable)) {
        const [schema, tableName] = schemaTable.split('.');
        tables.set(schemaTable, {
            name: schemaTable,
            schema,
            tableName,
            columns: [],
            pks: [],
            fks: [],
            indexes: [],
            deps: new Set(),
        });
    }
    return tables.get(schemaTable);
}

for (const stmt of statements) {
    if (!stmt) continue;

    if (/^CREATE SCHEMA/i.test(stmt)) {
        schemas.push(stmt);
    } else if (/^CREATE EXTENSION/i.test(stmt)) {
        extensions.push(stmt);
    } else if (/^CREATE PROCEDURE/i.test(stmt)) {
        procedures.push(stmt);
    } else if (/^CREATE FUNCTION/i.test(stmt)) {
        functions.push(stmt);
    } else if (/^CREATE TABLE\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)/i.test(stmt)) {
        const match = stmt.match(/^CREATE TABLE\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s*\(([\s\S]+)\)\s*;?$/i);
        if (match) {
            const name = match[1];
            const body = match[2];
            const colStrs = extractTableColumns(body);
            const entry = getTableEntry(name);
            for (const colStr of colStrs) {
                if (colStr.match(/^(?:CONSTRAINT|PRIMARY KEY|FOREIGN KEY|UNIQUE)/i)) {
                    // Inline constraint - ignore for now as pg_dump usually outputs them as ALTER TABLE
                    continue;
                }
                const parsedCol = parseColumnDef(colStr);
                if (parsedCol) {
                    entry.columns.push(parsedCol);
                }
            }
        }
    } else if (/^ALTER TABLE\s+(?:ONLY\s+)?([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s+ADD CONSTRAINT\s+([a-zA-Z0-9_]+)\s+PRIMARY KEY\s*\(([^)]+)\)/i.test(stmt)) {
        const match = stmt.match(/^ALTER TABLE\s+(?:ONLY\s+)?([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s+ADD CONSTRAINT\s+([a-zA-Z0-9_]+)\s+PRIMARY KEY\s*\(([^)]+)\)/i);
        if (match) {
            const entry = getTableEntry(match[1]);
            const cols = match[3].split(',').map((s) => s.trim());
            entry.pks.push(...cols);
        }
    } else if (
        /^ALTER TABLE\s+(?:ONLY\s+)?([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s+ADD CONSTRAINT\s+([a-zA-Z0-9_]+)\s+FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s*\(([^)]+)\)(.*)/i.test(
            stmt
        )
    ) {
        const match = stmt.match(
            /^ALTER TABLE\s+(?:ONLY\s+)?([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s+ADD CONSTRAINT\s+([a-zA-Z0-9_]+)\s+FOREIGN KEY\s*\(([^)]+)\)\s*REFERENCES\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)\s*\(([^)]+)\)(.*)/i
        );
        if (match) {
            const table = match[1];
            const fkName = match[2];
            const fields = match[3].split(',').map((s) => s.trim());
            const refTableFull = match[4];
            const refFields = match[5].split(',').map((s) => s.trim());
            let rest = match[6] || '';

            let onDelete = 'NO ACTION';
            let onUpdate = 'NO ACTION';
            const delMatch = rest.match(/ON DELETE\s+(CASCADE|RESTRICT|SET NULL|SET DEFAULT|NO ACTION)/i);
            if (delMatch) onDelete = delMatch[1].toUpperCase();
            const updMatch = rest.match(/ON UPDATE\s+(CASCADE|RESTRICT|SET NULL|SET DEFAULT|NO ACTION)/i);
            if (updMatch) onUpdate = updMatch[1].toUpperCase();

            const entry = getTableEntry(table);
            const [refSchema, refTable] = refTableFull.split('.');
            entry.fks.push({
                name: fkName,
                fields,
                refSchema,
                refTable,
                refFields,
                onDelete,
                onUpdate,
            });
            entry.deps.add(refTableFull);
        }
    } else if (/^CREATE (?:UNIQUE )?INDEX\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)(?:\s+USING\s+\w+)?\s*\(([^)]+)\)/i.test(stmt)) {
        const match = stmt.match(/^CREATE (UNIQUE )?INDEX\s+([a-zA-Z0-9_]+)\s+ON\s+([a-zA-Z0-9_]+\.[a-zA-Z0-9_]+)(?:\s+USING\s+\w+)?\s*\(([^)]+)\)/i);
        if (match) {
            const isUnique = !!match[1];
            const idxName = match[2];
            const entry = getTableEntry(match[3]);
            const cols = match[4].split(',').map((s) => s.trim());
            entry.indexes.push({ name: idxName, columns: cols, isUnique });
        }
    }
}

// Topological Sort
const sortedTables = [];
const visited = new Set();
const visiting = new Set();

function visit(tableName) {
    if (visited.has(tableName)) return;
    if (visiting.has(tableName)) {
        console.warn(`Circular dependency detected involving ${tableName}`);
        return;
    }

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

// Generate migrations
let currentTimestamp = new Date('2026-07-07T10:00:00Z').getTime();

function pad2(n) {
    return n < 10 ? '0' + n : '' + n;
}
function getTimestampStr(ts) {
    const d = new Date(ts);
    return `${d.getUTCFullYear()}${pad2(d.getUTCMonth() + 1)}${pad2(d.getUTCDate())}${pad2(d.getUTCHours())}${pad2(d.getUTCMinutes())}${pad2(d.getUTCSeconds())}`;
}

function writeMigration(filename, upStmts, downStmts) {
    const upStr = upStmts.join('\n');
    const downStr = downStmts.join('\n');

    const fileContent = `
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async (transaction) => {
${upStr}
      });
    } catch (error) {
      console.log(\`Error ejecutando la migración \${__filename}: \`, error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    try {
      await queryInterface.sequelize.transaction(async (transaction) => {
${downStr}
      });
    } catch (error) {
      console.log(\`Error ejecutando la migración \${__filename}: \`, error);
      throw error;
    }
  }
};
`;
    fs.writeFileSync(path.join(migrationsDir, filename), fileContent.trim());
}

// 1. Schemas and extensions
const schemasUp = [...schemas, ...extensions].map((s) => `        await queryInterface.sequelize.query(\`${s.replace(/`/g, '\\`')}\`, { transaction });`);
const schemasDown = schemas
    .map((s) => {
        const match = s.match(/^CREATE SCHEMA\s+([a-zA-Z0-9_]+)/i);
        return match ? `        await queryInterface.sequelize.query(\`DROP SCHEMA IF EXISTS ${match[1]} CASCADE;\`, { transaction });` : null;
    })
    .filter(Boolean);

if (schemasUp.length > 0) {
    writeMigration(`${getTimestampStr(currentTimestamp)}-00-schemas-and-extensions.cjs`, schemasUp, schemasDown);
    currentTimestamp += 1000;
}

// 2. Tables
let tableIdx = 1;
for (const entry of sortedTables) {
    if (entry.columns.length === 0) continue;

    const upStmts = [];
    const downStmts = [`        await queryInterface.dropTable({ schema: '${entry.schema}', tableName: '${entry.tableName}' }, { transaction });`];

    // Create Table
    let createTableStr = `        await queryInterface.createTable(\n          { schema: '${entry.schema}', tableName: '${entry.tableName}' },\n          {\n`;
    for (const col of entry.columns) {
        if (entry.pks && entry.pks.includes(col.name)) {
            col.def.primaryKey = true;
        }
        createTableStr += `            ${col.name}: ${stringifyColumnDef(col.def)},\n`;
    }
    createTableStr += `          },\n          { transaction }\n        );`;
    upStmts.push(createTableStr);

    // Indexes
    if (entry.indexes && entry.indexes.length > 0) {
        const hasStatusCol = entry.columns.some((c) => c.name.toLowerCase() === 'status');
        for (const idx of entry.indexes) {
            const colsStr = '[' + idx.columns.map((c) => `'${c}'`).join(', ') + ']';
            const uniqueStr = idx.isUnique ? 'unique: true, ' : '';
            const whereStr = idx.isUnique && hasStatusCol ? 'where: { status: 1 }, ' : '';

            upStmts.push(
                `        await queryInterface.addIndex(\n          { schema: '${entry.schema}', tableName: '${entry.tableName}' },\n          ${colsStr},\n          { ${uniqueStr}${whereStr}name: '${idx.name}', transaction }\n        );`
            );
        }
    }

    // Foreign Keys
    if (entry.fks && entry.fks.length > 0) {
        for (const fk of entry.fks) {
            const fieldsStr = '[' + fk.fields.map((c) => `'${c}'`).join(', ') + ']';
            const refFieldStr = fk.refFields.length === 1 ? `'${fk.refFields[0]}'` : '[' + fk.refFields.map((c) => `'${c}'`).join(', ') + ']';

            upStmts.push(
                `        await queryInterface.addConstraint(\n          { schema: '${entry.schema}', tableName: '${entry.tableName}' },\n          {\n            fields: ${fieldsStr},\n            type: 'foreign key',\n            name: '${fk.name}',\n            references: { table: { schema: '${fk.refSchema}', tableName: '${fk.refTable}' }, field: ${refFieldStr} },\n            onDelete: '${fk.onDelete}',\n            onUpdate: '${fk.onUpdate}',\n            transaction\n          }\n        );`
            );
        }
    }

    const cleanName = entry.name.replace('.', '_');
    writeMigration(`${getTimestampStr(currentTimestamp)}-${pad2(tableIdx)}-create-${cleanName}.cjs`, upStmts, downStmts);

    currentTimestamp += 1000;
    tableIdx++;
}

// 3. Procedures & Functions
const routinesUp = [...functions, ...procedures].map((s) => `        await queryInterface.sequelize.query(\`${s.replace(/`/g, '\\`')}\`, { transaction });`);
const routinesDown = [];
if (routinesUp.length > 0) {
    writeMigration(`${getTimestampStr(currentTimestamp)}-99-procedures-and-functions.cjs`, routinesUp, routinesDown);
}

console.log('Migraciones generadas exitosamente en', migrationsDir);
