import chokidar from 'chokidar';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PARQUETS_DIR = './sources/parquets';

console.log('Iniciando watcher de parquets...');
console.log(`Monitoreando: ${PARQUETS_DIR}\n`);

const watcher = chokidar.watch(`${PARQUETS_DIR}/*.parquet`, {
  persistent: true,
  ignoreInitial: true,
  awaitWriteFinish: {
    stabilityThreshold: 2000,
    pollInterval: 100
  }
});

async function processNewParquet(filepath) {
  console.log(`\n[DETECTADO] Nuevo parquet: ${filepath}`);
  console.log('Iniciando proceso de actualizacion...\n');
  
  try {
    console.log('1. Generando archivos SQL...');
    const { stdout: sqlOutput } = await execAsync('node scripts/generate_sql.js');
    console.log(sqlOutput);
    
    console.log('2. Actualizando sources...');
    const { stdout: sourcesOutput } = await execAsync('npm run sources');
    console.log(sourcesOutput);
    
    console.log('\n[OK] Proceso completado. El nuevo parquet esta listo para usar.\n');
  } catch (error) {
    console.error('[ERROR] Fallo en el proceso:', error.message);
  }
}

watcher
  .on('add', processNewParquet)
  .on('error', error => console.error('[ERROR] Watcher:', error));

console.log('Watcher activo. Esperando nuevos archivos parquet...');