# Dashboard de Producción Planta - Cierre

Análisis de producción y valores de cierre de planta.

---

## KPIs Principales

```sql kpis_principales
SELECT 
    count(*) as total_registros,
    count(distinct produccion) as tipos_produccion,
    round(sum(try_cast(valor as double)), 2) as valor_total,
    round(avg(try_cast(valor as double)), 2) as valor_promedio,
    min(fecha) as fecha_inicio,
    max(fecha) as fecha_fin
FROM parquets.prd_xls_plantcierre
WHERE fecha IS NOT NULL;
```

<BigValue 
    data={kpis_principales} 
    value=total_registros 
    title="Total Registros"
/>

<BigValue 
    data={kpis_principales} 
    value=tipos_produccion 
    title="Tipos de Producción"
/>

<BigValue 
    data={kpis_principales} 
    value=valor_total 
    title="Valor Total Acumulado"
    fmt='#,##0.00'
/>

<BigValue 
    data={kpis_principales} 
    value=valor_promedio 
    title="Valor Promedio"
    fmt='#,##0.00'
/>

---

## Evolución Temporal de Producción

```sql evolucion_temporal
SELECT 
    fecha,
    sum(try_cast(valor as double)) as valor_total,
    count(*) as num_registros
FROM parquets.prd_xls_plantcierre
WHERE fecha IS NOT NULL
  AND try_cast(valor as double) IS NOT NULL
GROUP BY fecha
ORDER BY fecha;
```

<LineChart 
    data={evolucion_temporal} 
    x=fecha 
    y=valor_total
    title="Evolución del Valor Total por Fecha"
/>

<LineChart 
    data={evolucion_temporal} 
    x=fecha 
    y=num_registros
    title="Número de Registros por Fecha"
/>

---

## Producción por Tipo

```sql produccion_tipo
SELECT 
    coalesce(nullif(trim(produccion), ''), 'Sin categoría') as tipo_produccion,
    count(*) as num_registros,
    round(sum(try_cast(valor as double)), 2) as valor_total,
    round(avg(try_cast(valor as double)), 2) as valor_promedio,
    round(min(try_cast(valor as double)), 2) as valor_min,
    round(max(try_cast(valor as double)), 2) as valor_max
FROM parquets.prd_xls_plantcierre
WHERE try_cast(valor as double) IS NOT NULL
GROUP BY produccion
ORDER BY valor_total DESC;
```

<DataTable data={produccion_tipo}/>

<BarChart 
    data={produccion_tipo} 
    x=tipo_produccion 
    y=valor_total
    title="Valor Total por Tipo de Producción"
    swapXY=true
/>

---

## Comparativa de Valores por Tipo

```sql comparativa_valores
SELECT 
    coalesce(nullif(trim(produccion), ''), 'Sin categoría') as tipo_produccion,
    round(avg(try_cast(valor as double)), 2) as promedio,
    round(min(try_cast(valor as double)), 2) as minimo,
    round(max(try_cast(valor as double)), 2) as maximo
FROM parquets.prd_xls_plantcierre
WHERE try_cast(valor as double) IS NOT NULL
GROUP BY produccion
ORDER BY promedio DESC;
```

<BarChart 
    data={comparativa_valores} 
    x=tipo_produccion 
    y={['minimo', 'promedio', 'maximo']}
    title="Valores Min, Promedio y Max por Tipo"
    swapXY=true
/>

---

## Tendencia Mensual

```sql tendencia_mensual
SELECT 
    strftime(fecha, '%Y-%m') as mes,
    round(sum(try_cast(valor as double)), 2) as valor_total,
    round(avg(try_cast(valor as double)), 2) as valor_promedio,
    count(*) as num_registros
FROM parquets.prd_xls_plantcierre
WHERE fecha IS NOT NULL
  AND try_cast(valor as double) IS NOT NULL
GROUP BY strftime(fecha, '%Y-%m')
ORDER BY mes;
```

<LineChart 
    data={tendencia_mensual} 
    x=mes 
    y=valor_total
    title="Tendencia Mensual del Valor Total"
/>

<BarChart 
    data={tendencia_mensual} 
    x=mes 
    y=num_registros
    title="Registros por Mes"
/>

---

## Desglose Temporal por Tipo de Producción

```sql temporal_por_tipo
SELECT 
    fecha,
    coalesce(nullif(trim(produccion), ''), 'Sin categoría') as tipo_produccion,
    round(sum(try_cast(valor as double)), 2) as valor
FROM parquets.prd_xls_plantcierre
WHERE fecha IS NOT NULL
  AND try_cast(valor as double) IS NOT NULL
GROUP BY fecha, produccion
ORDER BY fecha, tipo_produccion;
```

<LineChart 
    data={temporal_por_tipo} 
    x=fecha 
    y=valor
    series=tipo_produccion
    title="Evolución de Valores por Tipo de Producción"
/>

---

## Top Días con Mayor Valor

```sql top_dias
SELECT 
    fecha,
    round(sum(try_cast(valor as double)), 2) as valor_total,
    count(distinct produccion) as tipos_produccion,
    count(*) as num_registros
FROM parquets.prd_xls_plantcierre
WHERE fecha IS NOT NULL
  AND try_cast(valor as double) IS NOT NULL
GROUP BY fecha
ORDER BY valor_total DESC
LIMIT 20;
```

<DataTable data={top_dias} rows=20/>

---

## Días con Menor Valor

```sql bottom_dias
SELECT 
    fecha,
    round(sum(try_cast(valor as double)), 2) as valor_total,
    count(distinct produccion) as tipos_produccion,
    count(*) as num_registros
FROM parquets.prd_xls_plantcierre
WHERE fecha IS NOT NULL
  AND try_cast(valor as double) IS NOT NULL
GROUP BY fecha
ORDER BY valor_total ASC
LIMIT 20;
```

<DataTable data={bottom_dias} rows=20/>

---

## Distribución de Valores

```sql distribucion_valores
SELECT 
    CASE 
        WHEN try_cast(valor as double) < 100 THEN '< 100'
        WHEN try_cast(valor as double) < 500 THEN '100-500'
        WHEN try_cast(valor as double) < 1000 THEN '500-1000'
        WHEN try_cast(valor as double) < 5000 THEN '1000-5000'
        ELSE '> 5000'
    END as rango_valor,
    count(*) as cantidad,
    round(sum(try_cast(valor as double)), 2) as valor_total
FROM parquets.prd_xls_plantcierre
WHERE try_cast(valor as double) IS NOT NULL
GROUP BY rango_valor
ORDER BY 
    CASE rango_valor
        WHEN '< 100' THEN 1
        WHEN '100-500' THEN 2
        WHEN '500-1000' THEN 3
        WHEN '1000-5000' THEN 4
        ELSE 5
    END;
```

<BarChart 
    data={distribucion_valores} 
    x=rango_valor 
    y=cantidad
    title="Distribución de Registros por Rango de Valor"
/>

---

## Últimos Registros

```sql ultimos_registros
SELECT 
    fecha,
    produccion as tipo_produccion,
    round(try_cast(valor as double), 2) as valor
FROM parquets.prd_xls_plantcierre
WHERE fecha IS NOT NULL
ORDER BY fecha DESC
LIMIT 30;
```

<DataTable data={ultimos_registros} rows=30/>

---

## Resumen Estadístico por Tipo

```sql resumen_estadistico
SELECT 
    coalesce(nullif(trim(produccion), ''), 'Sin categoría') as tipo_produccion,
    count(*) as registros,
    round(sum(try_cast(valor as double)), 2) as total,
    round(avg(try_cast(valor as double)), 2) as promedio,
    round(min(try_cast(valor as double)), 2) as minimo,
    round(max(try_cast(valor as double)), 2) as maximo,
    min(fecha) as primera_fecha,
    max(fecha) as ultima_fecha
FROM parquets.prd_xls_plantcierre
WHERE try_cast(valor as double) IS NOT NULL
GROUP BY produccion
ORDER BY total DESC;
```

<DataTable data={resumen_estadistico}/>