# Cerro Colorado - Mineral (2024)

Análisis de extracción de mineral con leyes metálicas.

---

## KPIs Principales

```sql kpi_principal
SELECT 
    count(*) as total_registros,
    round(sum(try_cast(peso_ton as double)), 2) as tonelaje_total,
    round(avg(try_cast(peso_ton as double)), 2) as tonelaje_promedio,
    round(avg(try_cast(cu_porcentaje as double)), 4) as ley_cu_promedio,
    round(avg(try_cast(zn_porcentaje as double)), 4) as ley_zn_promedio,
    round(avg(try_cast(pb_porcentaje as double)), 4) as ley_pb_promedio
FROM parquets.cerro_colorado_mineral_2024
WHERE date IS NOT NULL;
```

<BigValue 
    data={kpi_principal} 
    value=tonelaje_total 
    title="Tonelaje Total (t)"
    fmt='#,##0'
/>

<BigValue 
    data={kpi_principal} 
    value=ley_cu_promedio 
    title="Ley Cu Promedio (%)"
    fmt='#,##0.0000'
/>

<BigValue 
    data={kpi_principal} 
    value=ley_zn_promedio 
    title="Ley Zn Promedio (%)"
    fmt='#,##0.0000'
/>

<BigValue 
    data={kpi_principal} 
    value=ley_pb_promedio 
    title="Ley Pb Promedio (%)"
    fmt='#,##0.0000'
/>

---