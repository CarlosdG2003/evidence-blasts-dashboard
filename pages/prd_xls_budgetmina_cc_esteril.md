# Dashboard de PRD_XLS_BUDGETMINA_CC_ESTERIL

Este dashboard muestra una exploración automática de **PRD_XLS_BudgetMina_CC_Esteril.parquet**.

---

## Cargar datos

```sql prd_xls_budgetmina_cc_esteril_data
SELECT * FROM parquets.prd_xls_budgetmina_cc_esteril;
```

---

## Vista previa de los datos

<DataTable data={prd_xls_budgetmina_cc_esteril_data} rows=10/>

---

## Tendencia temporal

```sql tendencia_temporal
SELECT 
    date as fecha,
    count(*) as cantidad
FROM parquets.prd_xls_budgetmina_cc_esteril
WHERE date IS NOT NULL
GROUP BY date
ORDER BY date;
```

<LineChart 
    data={tendencia_temporal} 
    x=fecha 
    y=cantidad 
    title="Registros por fecha"
/>

---

## Correlación entre variables

```sql correlacion
SELECT 
    try_cast(vol_m3 as double) as var1,
    try_cast(peso_ton as double) as var2
FROM parquets.prd_xls_budgetmina_cc_esteril
WHERE try_cast(vol_m3 as double) IS NOT NULL 
  AND try_cast(peso_ton as double) IS NOT NULL
LIMIT 1000;
```

<ScatterPlot 
    data={correlacion} 
    x=var1 
    y=var2 
    title="Vol_m3 vs Peso_ton"
/>

---

## Estadísticas principales

```sql estadisticas
SELECT 
    round(avg(try_cast(vol_m3 as double)), 2) as promedio_vol_m3,
    round(avg(try_cast(peso_ton as double)), 2) as promedio_peso_ton,
    round(avg(try_cast(cu_porcentaje as double)), 2) as promedio_cu_porcentaje
FROM parquets.prd_xls_budgetmina_cc_esteril;
```

<BigValue 
    data={estadisticas} 
    value=promedio_vol_m3 
    title="Promedio Vol_m3"
    fmt='#,##0.00'
/>

<BigValue 
    data={estadisticas} 
    value=promedio_peso_ton 
    title="Promedio Peso_ton"
    fmt='#,##0.00'
/>

<BigValue 
    data={estadisticas} 
    value=promedio_cu_porcentaje 
    title="Promedio Cu_porcentaje"
    fmt='#,##0.00'
/>

---

## Resumen general

```sql resumen
SELECT 
    count(*) as total_registros,
    round(avg(try_cast(vol_m3 as double)), 2) as promedio_principal
FROM parquets.prd_xls_budgetmina_cc_esteril;
```

<BigValue 
    data={resumen} 
    value=total_registros 
    title="Total registros"
/>

