# Dashboard de Plan de Producción - Planta

Análisis del plan de producción y procesamiento de mineral en planta concentradora.

---

## KPIs Principales

```sql kpis_principales
SELECT 
    count(*) as total_registros,
    round(sum(try_cast(tons_dry as double)), 2) as tonelaje_total,
    round(avg(try_cast(tons_dry as double)), 2) as tonelaje_promedio_dia,
    round(sum(try_cast(tons_cu_metal as double)), 2) as cobre_metal_total,
    round(avg(try_cast(cu_rec as double)), 2) as recuperacion_promedio,
    round(avg(try_cast(cu_cf as double)), 4) as ley_concentrado_promedio,
    round(avg(try_cast(availability as double)), 2) as disponibilidad_promedio
FROM parquets.prd_sdi_plant_prod_plan
WHERE date IS NOT NULL;
```

<BigValue 
    data={kpis_principales} 
    value=total_registros 
    title="Días Planificados"
/>

<BigValue 
    data={kpis_principales} 
    value=tonelaje_total 
    title="Tonelaje Total (t)"
    fmt='#,##0'
/>

<BigValue 
    data={kpis_principales} 
    value=tonelaje_promedio_dia 
    title="Tonelaje Promedio/Día (t)"
    fmt='#,##0'
/>

<BigValue 
    data={kpis_principales} 
    value=cobre_metal_total 
    title="Cobre Metal Total (t)"
    fmt='#,##0.00'
/>

<BigValue 
    data={kpis_principales} 
    value=recuperacion_promedio 
    title="Recuperación Promedio (%)"
    fmt='#,##0.0'
/>

<BigValue 
    data={kpis_principales} 
    value=ley_concentrado_promedio 
    title="Ley Concentrado Promedio (%)"
    fmt='#,##0.00'
/>

<BigValue 
    data={kpis_principales} 
    value=disponibilidad_promedio 
    title="Disponibilidad Promedio (%)"
    fmt='#,##0.0'
/>

---

## Evolución Temporal del Tonelaje

```sql evolucion_tonelaje
SELECT 
    date as fecha,
    round(try_cast(tons_dry as double), 2) as tonelaje_seco,
    round(try_cast(tons_day as double), 2) as tonelaje_dia,
    round(try_cast(tons_shift as double), 2) as tonelaje_turno
FROM parquets.prd_sdi_plant_prod_plan
WHERE date IS NOT NULL
  AND try_cast(tons_dry as double) IS NOT NULL
ORDER BY date;
```

<LineChart 
    data={evolucion_tonelaje} 
    x=fecha 
    y={['tonelaje_seco', 'tonelaje_dia']}
    title="Evolución del Tonelaje Procesado"
/>

---

## Evolución de Producción de Cobre

```sql evolucion_cobre
SELECT 
    date as fecha,
    round(try_cast(tons_con_cu as double), 2) as toneladas_concentrado,
    round(try_cast(tons_cu_metal as double), 2) as cobre_metal,
    round(try_cast(tons_cu_day as double), 2) as cobre_dia,
    round(try_cast(tons_cu_shift as double), 2) as cobre_turno
FROM parquets.prd_sdi_plant_prod_plan
WHERE date IS NOT NULL
  AND try_cast(tons_cu_metal as double) IS NOT NULL
ORDER BY date;
```

<LineChart 
    data={evolucion_cobre} 
    x=fecha 
    y={['toneladas_concentrado', 'cobre_metal']}
    title="Evolución de Concentrado y Cobre Metal"
/>

<LineChart 
    data={evolucion_cobre} 
    x=fecha 
    y=cobre_metal
    title="Producción de Cobre Metal en el Tiempo"
/>

---

## Indicadores Operacionales

```sql indicadores_operacionales
SELECT 
    date as fecha,
    round(try_cast(cu_rec as double), 2) as recuperacion_cu,
    round(try_cast(cu_cf as double), 4) as ley_concentrado,
    round(try_cast(cu_cp as double), 4) as ley_cabeza,
    round(try_cast(availability as double), 2) as disponibilidad
FROM parquets.prd_sdi_plant_prod_plan
WHERE date IS NOT NULL
ORDER BY date;
```

<LineChart 
    data={indicadores_operacionales} 
    x=fecha 
    y=recuperacion_cu
    title="Recuperación de Cobre (%)"
/>

<LineChart 
    data={indicadores_operacionales} 
    x=fecha 
    y=ley_concentrado
    title="Ley del Concentrado (%)"
/>

<LineChart 
    data={indicadores_operacionales} 
    x=fecha 
    y=disponibilidad
    title="Disponibilidad de Planta (%)"
/>

---

## Resumen Mensual

```sql resumen_mensual
SELECT 
    strftime(date, '%Y-%m') as mes,
    count(*) as dias_operacion,
    round(sum(try_cast(tons_dry as double)), 2) as tonelaje_total,
    round(avg(try_cast(tons_dry as double)), 2) as tonelaje_promedio_dia,
    round(sum(try_cast(tons_cu_metal as double)), 2) as cobre_metal_total,
    round(avg(try_cast(cu_rec as double)), 2) as recuperacion_promedio,
    round(avg(try_cast(availability as double)), 2) as disponibilidad_promedio
FROM parquets.prd_sdi_plant_prod_plan
WHERE date IS NOT NULL
GROUP BY strftime(date, '%Y-%m')
ORDER BY mes;
```

<DataTable data={resumen_mensual}/>

<BarChart 
    data={resumen_mensual} 
    x=mes 
    y=tonelaje_total
    title="Tonelaje Total Mensual"
/>

<BarChart 
    data={resumen_mensual} 
    x=mes 
    y=cobre_metal_total
    title="Cobre Metal Total Mensual"
/>

---

## Análisis de Eficiencia

```sql analisis_eficiencia
SELECT 
    strftime(date, '%Y-%m') as mes,
    round(avg(try_cast(cu_rec as double)), 2) as recuperacion_promedio,
    round(avg(try_cast(availability as double)), 2) as disponibilidad_promedio,
    round((avg(try_cast(tons_dry as double)) / nullif(avg(try_cast(tons_day as double)), 0)) * 100, 2) as eficiencia_tonelaje
FROM parquets.prd_sdi_plant_prod_plan
WHERE date IS NOT NULL
  AND try_cast(tons_day as double) > 0
GROUP BY strftime(date, '%Y-%m')
ORDER BY mes;
```

<BarChart 
    data={analisis_eficiencia} 
    x=mes 
    y={['recuperacion_promedio', 'disponibilidad_promedio']}
    title="Recuperación y Disponibilidad Mensual (%)"
/>

---

## Correlación: Tonelaje vs Cobre Metal

```sql correlacion_ton_cu
SELECT 
    try_cast(tons_dry as double) as tonelaje_seco,
    try_cast(tons_cu_metal as double) as cobre_metal
FROM parquets.prd_sdi_plant_prod_plan
WHERE try_cast(tons_dry as double) IS NOT NULL 
  AND try_cast(tons_cu_metal as double) IS NOT NULL
  AND try_cast(tons_dry as double) > 0
  AND try_cast(tons_cu_metal as double) > 0
LIMIT 1000;
```

<ScatterPlot 
    data={correlacion_ton_cu} 
    x=tonelaje_seco 
    y=cobre_metal
    title="Correlación: Tonelaje Procesado vs Cobre Metal Producido"
/>

---

## Correlación: Recuperación vs Ley de Concentrado

```sql correlacion_rec_ley
SELECT 
    try_cast(cu_rec as double) as recuperacion,
    try_cast(cu_cf as double) as ley_concentrado
FROM parquets.prd_sdi_plant_prod_plan
WHERE try_cast(cu_rec as double) IS NOT NULL 
  AND try_cast(cu_cf as double) IS NOT NULL
  AND try_cast(cu_rec as double) > 0
  AND try_cast(cu_cf as double) > 0
LIMIT 1000;
```

<ScatterPlot 
    data={correlacion_rec_ley} 
    x=recuperacion 
    y=ley_concentrado
    title="Correlación: Recuperación vs Ley de Concentrado"
/>

---

## Top 20 Días con Mayor Producción

```sql top_produccion
SELECT 
    date as fecha,
    round(try_cast(tons_dry as double), 2) as tonelaje,
    round(try_cast(tons_cu_metal as double), 2) as cobre_metal,
    round(try_cast(cu_rec as double), 2) as recuperacion,
    round(try_cast(availability as double), 2) as disponibilidad
FROM parquets.prd_sdi_plant_prod_plan
WHERE date IS NOT NULL
  AND try_cast(tons_cu_metal as double) IS NOT NULL
ORDER BY try_cast(tons_cu_metal as double) DESC
LIMIT 20;
```

<DataTable data={top_produccion} rows=20/>

---

## Días con Menor Recuperación

```sql baja_recuperacion
SELECT 
    date as fecha,
    round(try_cast(tons_dry as double), 2) as tonelaje,
    round(try_cast(cu_rec as double), 2) as recuperacion,
    round(try_cast(cu_cf as double), 4) as ley_concentrado,
    round(try_cast(availability as double), 2) as disponibilidad
FROM parquets.prd_sdi_plant_prod_plan
WHERE date IS NOT NULL
  AND try_cast(cu_rec as double) IS NOT NULL
  AND try_cast(cu_rec as double) > 0
ORDER BY try_cast(cu_rec as double) ASC
LIMIT 20;
```

<DataTable data={baja_recuperacion} rows=20/>

---

## Plan de Producción Reciente

```sql plan_reciente
SELECT 
    date as fecha,
    round(try_cast(tons_dry as double), 2) as tonelaje_seco,
    round(try_cast(tons_cu_metal as double), 2) as cobre_metal,
    round(try_cast(cu_rec as double), 2) as recuperacion,
    round(try_cast(cu_cf as double), 4) as ley_concentrado,
    round(try_cast(availability as double), 2) as disponibilidad
FROM parquets.prd_sdi_plant_prod_plan
WHERE date IS NOT NULL
ORDER BY date DESC
LIMIT 30;
```

<DataTable data={plan_reciente} rows=30/>

---

##  Estadísticas Detalladas

```sql estadisticas_detalladas
SELECT 
    count(*) as registros,
    round(sum(try_cast(tons_dry as double)), 2) as tonelaje_total,
    round(avg(try_cast(tons_dry as double)), 2) as tonelaje_promedio,
    round(min(try_cast(tons_dry as double)), 2) as tonelaje_minimo,
    round(max(try_cast(tons_dry as double)), 2) as tonelaje_maximo,
    round(sum(try_cast(tons_cu_metal as double)), 2) as cobre_metal_total,
    round(avg(try_cast(cu_rec as double)), 2) as recuperacion_promedio,
    round(min(try_cast(cu_rec as double)), 2) as recuperacion_minima,
    round(max(try_cast(cu_rec as double)), 2) as recuperacion_maxima,
    round(avg(try_cast(availability as double)), 2) as disponibilidad_promedio
FROM parquets.prd_sdi_plant_prod_plan;
```

<DataTable data={estadisticas_detalladas}/>