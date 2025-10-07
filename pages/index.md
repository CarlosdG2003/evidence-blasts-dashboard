# Dashboard de PRD_SDI_MIN_BLASTS

Este dashboard muestra una exploración visual de los datos de **postgres_parquets.prd_sdi_min_blasts**.

---

## Cargar datos

```sql prd_sdi_min_blasts
select * from postgres_parquets.prd_sdi_min_blasts;
```

---

## Vista previa de los datos

<DataTable data={prd_sdi_min_blasts} rows=10/>

---

## Registros por fecha

```sql registros_por_fecha
select 
    "Date" as fecha,
    count(*) as cantidad
from postgres_parquets.prd_sdi_min_blasts
group by "Date"
order by "Date";
```

<LineChart 
    data={registros_por_fecha} 
    x=fecha 
    y=cantidad 
    title="Registros por fecha"
/>

---

## Registros por zona

```sql registros_por_zona
select 
    "Zone" as zona,
    count(*) as cantidad
from postgres_parquets.prd_sdi_min_blasts
group by "Zone"
order by cantidad desc;
```

<BarChart 
    data={registros_por_zona} 
    x=zona 
    y=cantidad 
    title="Voladuras por zona"
    swapXY=true
/>

---

## Carga específica real promedio por zona

```sql carga_por_zona
select 
    coalesce(zone, 'Sin zona') as zona,
    round(avg(cast(specific_charge_real as double)), 2) as carga_especifica_promedio
from postgres_parquets.prd_sdi_min_blasts
where specific_charge_real is not null 
  and specific_charge_real != ''
  and cast(specific_charge_real as double) > 0
group by zone
order by carga_especifica_promedio desc;
```

<BarChart 
    data={carga_por_zona} 
    x=zona 
    y=carga_especifica_promedio 
    title="Carga específica real promedio por zona"
    swapXY=true
/>

---

## Producción real vs producción teórica

```sql produccion_comparativa
select 
    coalesce(zone, 'Sin zona') as zona,
    round(avg(cast(production_theoretical as double)), 2) as produccion_teorica,
    round(avg(cast(production_real as double)), 2) as produccion_real
from postgres_parquets.prd_sdi_min_blasts
where production_theoretical is not null 
  and production_real is not null
  and production_theoretical != ''
  and production_real != ''
  and cast(production_theoretical as double) > 0
  and cast(production_real as double) > 0
group by zone
order by produccion_real desc;
```

<BarChart 
    data={produccion_comparativa} 
    x=zona 
    y={['produccion_teorica', 'produccion_real']}
    title="Producción teórica vs real por zona"
    swapXY=true
/>

---

## Relación entre carga específica y producción real

```sql correlacion_carga_produccion
select 
    specific_charge_real as carga_especifica,
    production_real as produccion_real,
    coalesce(zone, 'Sin zona') as zona
from postgres_parquets.prd_sdi_min_blasts
where specific_charge_real is not null 
  and production_real is not null
  and specific_charge_real > 0
  and production_real > 0
limit 1000;
```

<ScatterPlot 
    data={correlacion_carga_produccion} 
    x=carga_especifica 
    y=produccion_real 
    series=zona
    title="Correlación entre carga específica real y producción real"
/>

---

## Distribución de tipos de producción

```sql distribucion_produccion
select 
    'Mineral' as tipo,
    round(sum(cast(coalesce(production_real_ore, '0') as double)), 2) as cantidad
from postgres_parquets.prd_sdi_min_blasts
union all
select 
    'Estéril' as tipo,
    round(sum(cast(coalesce(production_real_waste, '0') as double)), 2) as cantidad
from postgres_parquets.prd_sdi_min_blasts
union all
select 
    'Marginal' as tipo,
    round(sum(cast(coalesce(production_real_marginal, '0') as double)), 2) as cantidad
from postgres_parquets.prd_sdi_min_blasts;
```

<BarChart 
    data={distribucion_produccion}
    x=tipo
    y=cantidad
    title="Distribución total de producción por tipo"
/>

---

## Composición química promedio (metales principales)

```sql composicion_quimica
select 
    'Cobre (Cu)' as elemento,
    round(avg(cast(cu as double)), 4) as porcentaje
from postgres_parquets.prd_sdi_min_blasts
where cu is not null and cu != '' and cast(cu as double) > 0
union all
select 
    'Zinc (Zn)' as elemento,
    round(avg(cast(zn as double)), 4) as porcentaje
from postgres_parquets.prd_sdi_min_blasts
where zn is not null and zn != '' and cast(zn as double) > 0
union all
select 
    'Plomo (Pb)' as elemento,
    round(avg(cast(pb as double)), 4) as porcentaje
from postgres_parquets.prd_sdi_min_blasts
where pb is not null and pb != '' and cast(pb as double) > 0
union all
select 
    'Hierro (Fe)' as elemento,
    round(avg(cast(fe as double)), 4) as porcentaje
from postgres_parquets.prd_sdi_min_blasts
where fe is not null and fe != '' and cast(fe as double) > 0
union all
select 
    'Azufre (S)' as elemento,
    round(avg(cast(s as double)), 4) as porcentaje
from postgres_parquets.prd_sdi_min_blasts
where s is not null and s != '' and cast(s as double) > 0;
```

<BarChart 
    data={composicion_quimica}
    x=elemento
    y=porcentaje
    title="Composición química promedio (%)"
    swapXY=true
/>

---

## Resumen general

```sql resumen
select 
    count(*) as total_registros,
    count(distinct zone) as zonas_diferentes,
    round(avg(cast(specific_charge_real as double)), 2) as carga_especifica_promedio,
    round(sum(cast(production_real as double)), 2) as produccion_total,
    round(avg(cast(holes as double)), 1) as promedio_hoyos,
    round(avg(cast(drill_diameter as double)), 1) as diametro_perforacion_promedio
from postgres_parquets.prd_sdi_min_blasts;
```

<BigValue 
    data={resumen} 
    value=total_registros 
    title="Total registros"
/>

<BigValue 
    data={resumen} 
    value=zonas_diferentes 
    title="Zonas diferentes"
/>

<BigValue 
    data={resumen} 
    value=carga_especifica_promedio 
    title="Carga específica promedio"
    fmt='#,##0.00'
/>

<BigValue 
    data={resumen} 
    value=produccion_total 
    title="Producción total"
    fmt='#,##0.00'
/>

<BigValue 
    data={resumen} 
    value=promedio_hoyos 
    title="Promedio de hoyos por voladura"
    fmt='#,##0.0'
/>

<BigValue 
    data={resumen} 
    value=diametro_perforacion_promedio 
    title="Diámetro perforación promedio"
    fmt='#,##0.0'
/>

---

## Consumo de explosivos por zona

```sql explosivos_por_zona
select 
    coalesce(zone, 'Sin zona') as zona,
    round(sum(cast(coalesce(emulsion, '0') as double)), 2) as emulsion,
    round(sum(cast(coalesce(anfo, '0') as double)), 2) as anfo,
    round(sum(cast(coalesce(goma, '0') as double)), 2) as goma
from postgres_parquets.prd_sdi_min_blasts
group by zone
having sum(cast(coalesce(emulsion, '0') as double)) + 
       sum(cast(coalesce(anfo, '0') as double)) + 
       sum(cast(coalesce(goma, '0') as double)) > 0
order by (sum(cast(coalesce(emulsion, '0') as double)) + 
          sum(cast(coalesce(anfo, '0') as double)) + 
          sum(cast(coalesce(goma, '0') as double))) desc;
```

<BarChart 
    data={explosivos_por_zona} 
    x=zona 
    y={['emulsion', 'anfo', 'goma']}
    title="Consumo de explosivos por zona"
    swapXY=true
/>