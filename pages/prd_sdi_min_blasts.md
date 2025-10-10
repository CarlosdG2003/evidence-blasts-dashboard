# Dashboard de Voladuras Mineras

Análisis de parámetros operativos y resultados de voladuras.

---

## KPIs Principales

```sql kpis_principales
SELECT 
    count(*) as total_voladuras,
    count(distinct zone) as zonas_activas,
    round(avg(try_cast(production_real as double)), 2) as produccion_promedio,
    round(avg(try_cast(specific_charge_real as double)), 3) as carga_especifica_promedio,
    round(sum(try_cast(production_real as double)), 2) as produccion_total,
    round(sum(try_cast(emulsion as double)) + sum(try_cast(anfo as double)) + sum(try_cast(goma as double)), 2) as explosivos_total
FROM parquets.prd_sdi_min_blasts
WHERE date IS NOT NULL;
```

<BigValue 
    data={kpis_principales} 
    value=total_voladuras 
    title="Total Voladuras"
/>

<BigValue 
    data={kpis_principales} 
    value=zonas_activas 
    title="Zonas Activas"
/>

<BigValue 
    data={kpis_principales} 
    value=produccion_total 
    title="Producción Total (t)"
    fmt='#,##0'
/>

<BigValue 
    data={kpis_principales} 
    value=carga_especifica_promedio 
    title="Carga Específica Prom (kg/t)"
    fmt='#,##0.000'
/>

<BigValue 
    data={kpis_principales} 
    value=explosivos_total 
    title="Explosivos Totales (kg)"
    fmt='#,##0'
/>

---

## Evolución Temporal de Voladuras

```sql voladuras_tiempo
SELECT 
    date as fecha,
    count(*) as num_voladuras,
    round(sum(try_cast(production_real as double)), 2) as produccion_total
FROM parquets.prd_sdi_min_blasts
WHERE date IS NOT NULL
GROUP BY date
ORDER BY date;
```

<LineChart 
    data={voladuras_tiempo} 
    x=fecha 
    y=num_voladuras
    title="Número de Voladuras por Fecha"
/>

<LineChart 
    data={voladuras_tiempo} 
    x=fecha 
    y=produccion_total
    title="Producción Total por Fecha (toneladas)"
/>

---

## Producción por Zona

```sql produccion_zona
SELECT 
    coalesce(nullif(trim(zone), ''), 'Sin zona') as zona,
    count(*) as num_voladuras,
    round(sum(try_cast(production_real as double)), 2) as produccion_total,
    round(avg(try_cast(production_real as double)), 2) as produccion_promedio,
    round(sum(try_cast(production_real_ore as double)), 2) as mineral,
    round(sum(try_cast(production_real_waste as double)), 2) as esteril
FROM parquets.prd_sdi_min_blasts
WHERE try_cast(production_real as double) IS NOT NULL
GROUP BY zone
ORDER BY produccion_total DESC;
```

<DataTable data={produccion_zona} rows=15/>

<BarChart 
    data={produccion_zona} 
    x=zona 
    y=produccion_total
    title="Producción Total por Zona"
    swapXY=true
/>

---

## Eficiencia: Producción Real vs Teórica

```sql eficiencia_produccion
SELECT 
    coalesce(nullif(trim(zone), ''), 'Sin zona') as zona,
    round(avg(try_cast(production_theoretical as double)), 2) as prod_teorica,
    round(avg(try_cast(production_real as double)), 2) as prod_real,
    round((avg(try_cast(production_real as double)) / nullif(avg(try_cast(production_theoretical as double)), 0)) * 100, 1) as eficiencia_pct
FROM parquets.prd_sdi_min_blasts
WHERE try_cast(production_theoretical as double) IS NOT NULL 
  AND try_cast(production_real as double) IS NOT NULL
  AND try_cast(production_theoretical as double) > 0
GROUP BY zone
ORDER BY eficiencia_pct DESC;
```

<DataTable data={eficiencia_produccion}/>

<BarChart 
    data={eficiencia_produccion} 
    x=zona 
    y={['prod_teorica', 'prod_real']}
    title="Producción Teórica vs Real por Zona"
    swapXY=true
/>

---

## Consumo de Explosivos

```sql explosivos_zona
SELECT 
    coalesce(nullif(trim(zone), ''), 'Sin zona') as zona,
    round(sum(try_cast(emulsion as double)), 2) as emulsion,
    round(sum(try_cast(anfo as double)), 2) as anfo,
    round(sum(try_cast(goma as double)), 2) as goma,
    round(sum(try_cast(emulsion as double)) + sum(try_cast(anfo as double)) + sum(try_cast(goma as double)), 2) as total_explosivos
FROM parquets.prd_sdi_min_blasts
GROUP BY zone
ORDER BY total_explosivos DESC;
```

<DataTable data={explosivos_zona}/>

<BarChart 
    data={explosivos_zona} 
    x=zona 
    y={['emulsion', 'anfo', 'goma']}
    title="Distribución de Explosivos por Zona"
    swapXY=true
/>

---

## Carga Específica por Zona

```sql carga_especifica_zona
SELECT 
    coalesce(nullif(trim(zone), ''), 'Sin zona') as zona,
    round(avg(try_cast(specific_charge_theoretical as double)), 3) as carga_teorica,
    round(avg(try_cast(specific_charge_real as double)), 3) as carga_real,
    count(*) as num_voladuras
FROM parquets.prd_sdi_min_blasts
WHERE try_cast(specific_charge_real as double) IS NOT NULL
GROUP BY zone
ORDER BY carga_real DESC;
```

<DataTable data={carga_especifica_zona}/>

<BarChart 
    data={carga_especifica_zona} 
    x=zona 
    y={['carga_teorica', 'carga_real']}
    title="Carga Específica Teórica vs Real (kg/t)"
    swapXY=true
/>

---

## Leyes Metálicas Promedio

```sql leyes_metalicas
SELECT 
    coalesce(nullif(trim(zone), ''), 'Sin zona') as zona,
    round(avg(try_cast(cu as double)), 4) as cu_pct,
    round(avg(try_cast(zn as double)), 4) as zn_pct,
    round(avg(try_cast(pb as double)), 4) as pb_pct,
    round(avg(try_cast(fe as double)), 4) as fe_pct,
    round(avg(try_cast(s as double)), 4) as s_pct
FROM parquets.prd_sdi_min_blasts
WHERE try_cast(cu as double) IS NOT NULL
   OR try_cast(zn as double) IS NOT NULL
   OR try_cast(pb as double) IS NOT NULL
GROUP BY zone
ORDER BY cu_pct DESC NULLS LAST;
```

<DataTable data={leyes_metalicas}/>

---

## Parámetros de Perforación

```sql parametros_perforacion
SELECT 
    coalesce(nullif(trim(zone), ''), 'Sin zona') as zona,
    round(avg(try_cast(drill_diameter as double)), 1) as diametro_promedio,
    round(avg(try_cast(holes as double)), 1) as hoyos_promedio,
    round(avg(try_cast(height as double)), 1) as altura_promedio,
    round(avg(try_cast(stemming as double)), 1) as retacado_promedio,
    count(*) as num_voladuras
FROM parquets.prd_sdi_min_blasts
WHERE try_cast(drill_diameter as double) IS NOT NULL
GROUP BY zone
ORDER BY num_voladuras DESC;
```

<DataTable data={parametros_perforacion}/>

---

## Correlación: Carga Específica vs Producción

```sql correlacion_carga_prod
SELECT 
    try_cast(specific_charge_real as double) as carga_especifica,
    try_cast(production_real as double) as produccion_real,
    coalesce(nullif(trim(zone), ''), 'Sin zona') as zona
FROM parquets.prd_sdi_min_blasts
WHERE try_cast(specific_charge_real as double) IS NOT NULL 
  AND try_cast(production_real as double) IS NOT NULL
  AND try_cast(specific_charge_real as double) > 0
  AND try_cast(production_real as double) > 0
LIMIT 1000;
```

<ScatterPlot 
    data={correlacion_carga_prod} 
    x=carga_especifica 
    y=produccion_real 
    series=zona
    title="Carga Específica vs Producción Real"
/>

---

## Clasificación de Material Volado

```sql clasificacion_material
SELECT 
    'Mineral' as tipo,
    round(sum(try_cast(production_real_ore as double)), 2) as toneladas,
    round((sum(try_cast(production_real_ore as double)) / nullif(sum(try_cast(production_real as double)), 0)) * 100, 1) as porcentaje
FROM parquets.prd_sdi_min_blasts
WHERE try_cast(production_real_ore as double) IS NOT NULL
UNION ALL
SELECT 
    'Estéril' as tipo,
    round(sum(try_cast(production_real_waste as double)), 2) as toneladas,
    round((sum(try_cast(production_real_waste as double)) / nullif(sum(try_cast(production_real as double)), 0)) * 100, 1) as porcentaje
FROM parquets.prd_sdi_min_blasts
WHERE try_cast(production_real_waste as double) IS NOT NULL
UNION ALL
SELECT 
    'Marginal' as tipo,
    round(sum(try_cast(production_real_marginal as double)), 2) as toneladas,
    round((sum(try_cast(production_real_marginal as double)) / nullif(sum(try_cast(production_real as double)), 0)) * 100, 1) as porcentaje
FROM parquets.prd_sdi_min_blasts
WHERE try_cast(production_real_marginal as double) IS NOT NULL;
```

<DataTable data={clasificacion_material}/>

<BarChart 
    data={clasificacion_material} 
    x=tipo 
    y=toneladas
    title="Distribución de Material por Tipo"
/>

---

## Resumen de Últimas Voladuras

```sql ultimas_voladuras
SELECT 
    date as fecha,
    code as codigo,
    zone as zona,
    round(try_cast(production_real as double), 2) as produccion,
    round(try_cast(specific_charge_real as double), 3) as carga_especifica,
    try_cast(holes as integer) as hoyos,
    round(try_cast(emulsion as double) + try_cast(anfo as double) + try_cast(goma as double), 2) as explosivos_total
FROM parquets.prd_sdi_min_blasts
WHERE date IS NOT NULL
ORDER BY date DESC
LIMIT 20;
```

<DataTable data={ultimas_voladuras} rows=20/>