# Cerro Colorado - Mineral (2024-2025)

Análisis de extracción de mineral con leyes metálicas.

---

## KPIs Principales

```sql kpis_principales
SELECT 
    count(*) as total_registros,
    round(sum(try_cast(peso_ton as double)), 2) as tonelaje_total,
    round(avg(try_cast(peso_ton as double)), 2) as tonelaje_promedio,
    round(avg(try_cast(cu_porcentaje as double)), 4) as ley_cu_promedio,
    round(avg(try_cast(zn_porcentaje as double)), 4) as ley_zn_promedio,
    round(avg(try_cast(pb_porcentaje as double)), 4) as ley_pb_promedio
FROM parquets.budgetmina_cc_mineral
WHERE date IS NOT NULL;
```

<BigValue 
    data={kpis_principales} 
    value=tonelaje_total 
    title="Tonelaje Total (t)"
    fmt='#,##0'
/>

<BigValue 
    data={kpis_principales} 
    value=ley_cu_promedio 
    title="Ley Cu Promedio (%)"
    fmt='#,##0.0000'
/>

<BigValue 
    data={kpis_principales} 
    value=ley_zn_promedio 
    title="Ley Zn Promedio (%)"
    fmt='#,##0.0000'
/>

<BigValue 
    data={kpis_principales} 
    value=ley_pb_promedio 
    title="Ley Pb Promedio (%)"
    fmt='#,##0.0000'
/>

---

## Evolución Mensual del Tonelaje

```sql evolucion_mensual
SELECT 
    strftime(date, '%Y-%m') as mes,
    round(sum(try_cast(peso_ton as double)), 2) as tonelaje,
    round(avg(try_cast(cu_porcentaje as double)), 4) as ley_cu,
    round(avg(try_cast(zn_porcentaje as double)), 4) as ley_zn,
    round(avg(try_cast(pb_porcentaje as double)), 4) as ley_pb
FROM parquets.budgetmina_cc_mineral
WHERE date IS NOT NULL
GROUP BY strftime(date, '%Y-%m')
ORDER BY strftime(date, '%Y-%m');
```

<LineChart 
    data={evolucion_mensual} 
    x=mes 
    y=tonelaje
    title="Tonelaje Mensual Presupuestado"
/>

<BarChart 
    data={evolucion_mensual} 
    x=mes 
    y=tonelaje
    title="Tonelaje por Mes"
/>

---

## Evolución de Leyes Metálicas

```sql evolucion_leyes
SELECT 
    strftime(date, '%Y-%m') as mes,
    round(avg(try_cast(cu_porcentaje as double)), 4) as cu,
    round(avg(try_cast(zn_porcentaje as double)), 4) as zn,
    round(avg(try_cast(pb_porcentaje as double)), 4) as pb,
    round(avg(try_cast(fe_porcentaje as double)), 4) as fe,
    round(avg(try_cast(s_porcentaje as double)), 4) as s
FROM parquets.budgetmina_cc_mineral
WHERE date IS NOT NULL
GROUP BY strftime(date, '%Y-%m')
ORDER BY strftime(date, '%Y-%m');
```

<LineChart 
    data={evolucion_leyes} 
    x=mes 
    y={['cu', 'zn', 'pb']}
    title="Evolución de Leyes Principales (%)"
/>

---

## Comparativa Anual

```sql comparativa_anual
SELECT 
    strftime(date, '%Y') as año,
    round(sum(try_cast(peso_ton as double)), 2) as tonelaje_total,
    round(avg(try_cast(cu_porcentaje as double)), 4) as ley_cu,
    round(avg(try_cast(zn_porcentaje as double)), 4) as ley_zn,
    round(avg(try_cast(ag_ppm as double)), 2) as ley_ag
FROM parquets.budgetmina_cc_mineral
WHERE date IS NOT NULL
GROUP BY strftime(date, '%Y')
ORDER BY año;
```

<DataTable data={comparativa_anual}/>

<BarChart 
    data={comparativa_anual} 
    x=año 
    y=tonelaje_total
    title="Tonelaje Total por Año"
/>

---

## Leyes Promedio por Metal

```sql leyes_promedio
SELECT 
    'Cobre (Cu)' as metal,
    round(avg(try_cast(cu_porcentaje as double)), 4) as ley_porcentaje,
    'Porcentaje' as unidad
FROM parquets.budgetmina_cc_mineral
UNION ALL
SELECT 
    'Zinc (Zn)' as metal,
    round(avg(try_cast(zn_porcentaje as double)), 4) as ley_porcentaje,
    'Porcentaje' as unidad
FROM parquets.budgetmina_cc_mineral
UNION ALL
SELECT 
    'Plomo (Pb)' as metal,
    round(avg(try_cast(pb_porcentaje as double)), 4) as ley_porcentaje,
    'Porcentaje' as unidad
FROM parquets.budgetmina_cc_mineral
UNION ALL
SELECT 
    'Hierro (Fe)' as metal,
    round(avg(try_cast(fe_porcentaje as double)), 4) as ley_porcentaje,
    'Porcentaje' as unidad
FROM parquets.budgetmina_cc_mineral
UNION ALL
SELECT 
    'Azufre (S)' as metal,
    round(avg(try_cast(s_porcentaje as double)), 4) as ley_porcentaje,
    'Porcentaje' as unidad
FROM parquets.budgetmina_cc_mineral;
```

<BarChart 
    data={leyes_promedio} 
    x=metal 
    y=ley_porcentaje
    title="Leyes Promedio por Metal (%)"
    swapXY=true
/>

---

## Elementos Traza (ppm)

```sql elementos_traza
SELECT 
    'Plata (Ag)' as elemento,
    round(avg(try_cast(ag_ppm as double)), 2) as promedio_ppm
FROM parquets.budgetmina_cc_mineral
WHERE try_cast(ag_ppm as double) IS NOT NULL
UNION ALL
SELECT 
    'Arsénico (As)' as elemento,
    round(avg(try_cast(as_ppm as double)), 2) as promedio_ppm
FROM parquets.budgetmina_cc_mineral
WHERE try_cast(as_ppm as double) IS NOT NULL
UNION ALL
SELECT 
    'Antimonio (Sb)' as elemento,
    round(avg(try_cast(sb_ppm as double)), 2) as promedio_ppm
FROM parquets.budgetmina_cc_mineral
WHERE try_cast(sb_ppm as double) IS NOT NULL
UNION ALL
SELECT 
    'Bismuto (Bi)' as elemento,
    round(avg(try_cast(bi_ppm as double)), 2) as promedio_ppm
FROM parquets.budgetmina_cc_mineral
WHERE try_cast(bi_ppm as double) IS NOT NULL;
```

<BarChart 
    data={elementos_traza} 
    x=elemento 
    y=promedio_ppm
    title="Elementos Traza Promedio (ppm)"
    swapXY=true
/>

---

## Resumen Estadístico

```sql resumen_estadistico
SELECT 
    count(*) as registros,
    round(sum(try_cast(vol_m3 as double)), 2) as volumen_total_m3,
    round(sum(try_cast(peso_ton as double)), 2) as tonelaje_total,
    round(avg(try_cast(cu_porcentaje as double)), 4) as cu_promedio,
    round(avg(try_cast(zn_porcentaje as double)), 4) as zn_promedio,
    round(avg(try_cast(pb_porcentaje as double)), 4) as pb_promedio,
    round(avg(try_cast(ag_ppm as double)), 2) as ag_promedio_ppm,
    min(date) as fecha_inicio,
    max(date) as fecha_fin
FROM parquets.budgetmina_cc_mineral;
```

<DataTable data={resumen_estadistico}/>