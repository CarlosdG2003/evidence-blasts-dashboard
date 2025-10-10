import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PARQUETS_DIR = path.join(__dirname, '../sources/parquets');

function normalizeFileName(filename) {
  return filename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
}

function getExistingSqlFiles() {
  return fs.readdirSync(PARQUETS_DIR)
    .filter(file => file.endsWith('.sql'))
    .map(file => path.basename(file, '.sql'));
}

function getParquetFiles() {
  return fs.readdirSync(PARQUETS_DIR)
    .filter(file => file.endsWith('.parquet'));
}

console.log('Iniciando generacion de archivos SQL...\n');

const existingSqlFiles = getExistingSqlFiles();
const parquetFiles = getParquetFiles();

console.log(`Encontrados ${parquetFiles.length} archivos .parquet`);
console.log(`Encontrados ${existingSqlFiles.length} archivos .sql existentes\n`);

let created = 0;
let skipped = 0;
let errors = 0;

parquetFiles.forEach(parquetFile => {
  try {
    const baseFilename = path.basename(parquetFile, '.parquet');
    const sqlName = normalizeFileName(baseFilename);
    
    if (existingSqlFiles.includes(sqlName)) {
      console.log(`[SKIP] ${sqlName}.sql ya existe`);
      skipped++;
      return;
    }
    
    const sqlContent = `SELECT * FROM '${parquetFile}'`;
    const sqlFilePath = path.join(PARQUETS_DIR, `${sqlName}.sql`);
    
    fs.writeFileSync(sqlFilePath, sqlContent, 'utf8');
    
    console.log(`[OK] Creado: ${sqlName}.sql`);
    console.log(`     Parquet: ${baseFilename}.parquet`);
    console.log(`     Usar en .md como: parquets.${sqlName}\n`);
    created++;
    
  } catch (error) {
    console.error(`[ERROR] Fallo al procesar ${parquetFile}: ${error.message}`);
    errors++;
  }
});

console.log('\n--- Resumen ---');
console.log(`Archivos creados: ${created}`);
console.log(`Archivos omitidos: ${skipped}`);
console.log(`Errores: ${errors}`);
console.log('\nProceso completado.');

if (created > 0) {
  console.log('\nPasos siguientes:');
  console.log('1. Ejecuta: npm run sources');
  console.log('2. En tus archivos .md usa: SELECT * FROM parquets.nombre_del_archivo');
}