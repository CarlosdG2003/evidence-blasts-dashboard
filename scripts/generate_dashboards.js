import fs from 'fs';
import path from 'path';
import duckdb from 'duckdb';

const PARQUETS_DIR = 'sources/parquets';
const PAGES_DIR = './pages';
const SOURCES_DIR = './sources/parquets';

const db = new duckdb.Database(':memory:');
const conn = db.connect();

function analyzeParquet(filePath) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT column_name, column_type 
            FROM (DESCRIBE SELECT * FROM read_parquet('${filePath}'))
        `;
        
        conn.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function getSampleData(filePath, limit = 5) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM read_parquet('${filePath}') LIMIT ${limit}`;
        
        conn.all(query, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function identifyColumnTypes(columns) {
    const numeric = columns.filter(c => 
        c.column_type.includes('DOUBLE') || 
        c.column_type.includes('INTEGER') || 
        c.column_type.includes('DECIMAL') ||
        c.column_type.includes('BIGINT')
    );
    
    const text = columns.filter(c => 
        c.column_type.includes('VARCHAR') || 
        c.column_type.includes('TEXT')
    );
    
    const date = columns.filter(c => 
        c.column_type.includes('DATE') || 
        c.column_type.includes('TIMESTAMP')
    );
    
    return { numeric, text, date };
}

function generateSQL(fileName, tableName) {
    return `SELECT * FROM read_parquet('${PARQUETS_DIR}/${fileName}')`;
}

function generateMarkdown(tableName, fileName, columns, types) {
    const { numeric, text, date } = types;
    
    let md = `# 📊 Dashboard de ${tableName.toUpperCase()}\n\n`;
    md += `Este dashboard muestra una exploración automática de **${fileName}**.\n\n`;
    md += `---\n\n`;
    
    md += `## 🧾 Cargar datos\n\n`;
    md += `\`\`\`sql ${tableName}_data\n`;
    md += `SELECT * FROM read_parquet('${PARQUETS_DIR}/${fileName}');\n`;
    md += `\`\`\`\n\n`;
    md += `---\n\n`;
    
    md += `## 👀 Vista previa de los datos\n\n`;
    md += `<DataTable data={${tableName}_data} rows=10/>\n\n`;
    md += `---\n\n`;
    
    if (date.length > 0 && numeric.length > 0) {
        const dateCol = date[0].column_name.toLowerCase().replace(/ /g, '_');
        const numCol = numeric[0].column_name.toLowerCase().replace(/ /g, '_');
        
        md += `## 📅 Tendencia temporal\n\n`;
        md += `\`\`\`sql tendencia_temporal\n`;
        md += `SELECT \n`;
        md += `    ${dateCol} as fecha,\n`;
        md += `    count(*) as cantidad\n`;
        md += `FROM read_parquet('${PARQUETS_DIR}/${fileName}')\n`;
        md += `WHERE ${dateCol} IS NOT NULL\n`;
        md += `GROUP BY ${dateCol}\n`;
        md += `ORDER BY ${dateCol};\n`;
        md += `\`\`\`\n\n`;
        md += `<LineChart \n`;
        md += `    data={tendencia_temporal} \n`;
        md += `    x=fecha \n`;
        md += `    y=cantidad \n`;
        md += `    title="Registros por fecha"\n`;
        md += `/>\n\n`;
        md += `---\n\n`;
    }
    
    if (text.length > 0) {
        const textCol = text[0].column_name.toLowerCase().replace(/ /g, '_');
        
        md += `## 🧱 Distribución por categoría\n\n`;
        md += `\`\`\`sql distribucion_categoria\n`;
        md += `SELECT \n`;
        md += `    coalesce(nullif(trim(${textCol}), ''), 'Sin categoría') as categoria,\n`;
        md += `    count(*) as cantidad\n`;
        md += `FROM read_parquet('${PARQUETS_DIR}/${fileName}')\n`;
        md += `GROUP BY ${textCol}\n`;
        md += `ORDER BY cantidad DESC\n`;
        md += `LIMIT 15;\n`;
        md += `\`\`\`\n\n`;
        md += `<BarChart \n`;
        md += `    data={distribucion_categoria} \n`;
        md += `    x=categoria \n`;
        md += `    y=cantidad \n`;
        md += `    title="Top 15 categorías"\n`;
        md += `    swapXY=true\n`;
        md += `/>\n\n`;
        md += `---\n\n`;
    }
    
    if (numeric.length >= 2) {
        const num1 = numeric[0].column_name.toLowerCase().replace(/ /g, '_');
        const num2 = numeric[1].column_name.toLowerCase().replace(/ /g, '_');
        
        md += `## 📈 Correlación entre variables\n\n`;
        md += `\`\`\`sql correlacion\n`;
        md += `SELECT \n`;
        md += `    try_cast(${num1} as double) as var1,\n`;
        md += `    try_cast(${num2} as double) as var2\n`;
        md += `FROM read_parquet('${PARQUETS_DIR}/${fileName}')\n`;
        md += `WHERE try_cast(${num1} as double) IS NOT NULL \n`;
        md += `  AND try_cast(${num2} as double) IS NOT NULL\n`;
        md += `LIMIT 1000;\n`;
        md += `\`\`\`\n\n`;
        md += `<ScatterPlot \n`;
        md += `    data={correlacion} \n`;
        md += `    x=var1 \n`;
        md += `    y=var2 \n`;
        md += `    title="${numeric[0].column_name} vs ${numeric[1].column_name}"\n`;
        md += `/>\n\n`;
        md += `---\n\n`;
    }
    
    if (numeric.length >= 3) {
        md += `## 📊 Estadísticas principales\n\n`;
        md += `\`\`\`sql estadisticas\n`;
        md += `SELECT \n`;
        
        numeric.slice(0, 3).forEach(col => {
            const colName = col.column_name.toLowerCase().replace(/ /g, '_');
            md += `    round(avg(try_cast(${colName} as double)), 2) as promedio_${colName},\n`;
        });
        
        md = md.slice(0, -2) + '\n';
        md += `FROM read_parquet('${PARQUETS_DIR}/${fileName}');\n`;
        md += `\`\`\`\n\n`;
        
        numeric.slice(0, 3).forEach(col => {
            const colName = col.column_name.toLowerCase().replace(/ /g, '_');
            md += `<BigValue \n`;
            md += `    data={estadisticas} \n`;
            md += `    value=promedio_${colName} \n`;
            md += `    title="Promedio ${col.column_name}"\n`;
            md += `    fmt='#,##0.00'\n`;
            md += `/>\n\n`;
        });
        
        md += `---\n\n`;
    }
    
    md += `## 🧮 Resumen general\n\n`;
    md += `\`\`\`sql resumen\n`;
    md += `SELECT \n`;
    md += `    count(*) as total_registros,\n`;
    
    if (text.length > 0) {
        const textCol = text[0].column_name.toLowerCase().replace(/ /g, '_');
        md += `    count(distinct nullif(trim(${textCol}), '')) as categorias_diferentes,\n`;
    }
    
    if (numeric.length > 0) {
        const numCol = numeric[0].column_name.toLowerCase().replace(/ /g, '_');
        md += `    round(avg(try_cast(${numCol} as double)), 2) as promedio_principal\n`;
    } else {
        md = md.slice(0, -2) + '\n';
    }
    
    md += `FROM read_parquet('${PARQUETS_DIR}/${fileName}');\n`;
    md += `\`\`\`\n\n`;
    
    md += `<BigValue \n`;
    md += `    data={resumen} \n`;
    md += `    value=total_registros \n`;
    md += `    title="Total registros"\n`;
    md += `/>\n\n`;
    
    if (text.length > 0) {
        md += `<BigValue \n`;
        md += `    data={resumen} \n`;
        md += `    value=categorias_diferentes \n`;
        md += `    title="Categorías diferentes"\n`;
        md += `/>\n\n`;
    }
    
    return md;
}

async function processAllParquets() {
    if (!fs.existsSync(PARQUETS_DIR)) {
        console.error(`Error: El directorio ${PARQUETS_DIR} no existe`);
        return;
    }
    
    if (!fs.existsSync(PAGES_DIR)) {
        fs.mkdirSync(PAGES_DIR, { recursive: true });
    }
    
    const files = fs.readdirSync(PARQUETS_DIR).filter(f => f.endsWith('.parquet'));
    
    console.log(`Encontrados ${files.length} archivos parquet`);
    
    const indexPages = [];
    
    for (const file of files) {
        try {
            console.log(`\nProcesando: ${file}`);
            
            const filePath = path.join(PARQUETS_DIR, file);
            const tableName = file.replace('.parquet', '').replace(/[^a-z0-9_]/gi, '_').toLowerCase();
            const mdFileName = `${tableName}.md`;
            
            const columns = await analyzeParquet(filePath);
            const types = identifyColumnTypes(columns);
            
            console.log(`  - ${columns.length} columnas encontradas`);
            console.log(`  - ${types.numeric.length} numéricas, ${types.text.length} texto, ${types.date.length} fechas`);
            
            const markdown = generateMarkdown(tableName, file, columns, types);
            
            const mdPath = path.join(PAGES_DIR, mdFileName);
            fs.writeFileSync(mdPath, markdown);
            
            console.log(`  ✅ Generado: ${mdFileName}`);
            
            indexPages.push({
                name: tableName,
                file: mdFileName,
                title: tableName.replace(/_/g, ' ').toUpperCase()
            });
            
        } catch (error) {
            console.error(`  ❌ Error procesando ${file}:`, error.message);
        }
    }
    
    generateIndexPage(indexPages);
    
    console.log(`\n✅ Proceso completado. ${indexPages.length} dashboards generados.`);
}

function generateIndexPage(pages) {
    let md = `# 🏠 Índice de Dashboards\n\n`;
    md += `Esta es la página principal con enlaces a todos los dashboards disponibles.\n\n`;
    md += `---\n\n`;
    md += `## 📊 Dashboards disponibles\n\n`;
    
    pages.forEach(page => {
        md += `### [${page.title}](/${page.name})\n`;
        md += `Análisis de datos de ${page.title}\n\n`;
    });
    
    const indexPath = path.join(PAGES_DIR, 'index.md');
    fs.writeFileSync(indexPath, md);
    
    console.log(`\n✅ Página índice generada: index.md`);
}

processAllParquets().catch(console.error);