# Guía de Manejo de Fechas en el Proyecto

## Problema Común: Conversión de Zona Horaria (+1/-1 Día)

### El Problema

Cuando envías fechas a una API, puedes experimentar un desfase de **+1 o -1 día** debido a la conversión de zona horaria de JavaScript:

```typescript
// ❌ INCORRECTO - Puede causar desfase de días
const formValue = this.form.value.docDate; // Usuario selecciona: 13-10-2025
const model = {
  docDate: new Date(formValue) // Resultado: 14-10-2025 (debido a zona horaria)
};
```

### ¿Por Qué Ocurre?

1. El componente de fecha (PrimeNG Calendar) almacena la fecha en zona horaria local
2. Al convertir con `new Date(fecha)`, JavaScript interpreta la fecha en UTC
3. Si tu zona horaria es UTC-5 (Perú/Colombia), una fecha "2025-10-13T00:00:00Z" se convierte a "2025-10-12T19:00:00" localmente
4. Al enviar al servidor, puede redondear al día siguiente o anterior

### Solución: Usar `utilService.normalizeDate()`

El servicio `UtilService` incluye el método `normalizeDate()` que:
- Extrae solo **año, mes y día**
- Elimina información de **hora y zona horaria**
- **Preserva la fecha exacta** seleccionada por el usuario

## Cómo Usar

### 1. Inyectar UtilService en tu Componente

```typescript
constructor(
  public readonly utilService: UtilService,
  // ... otros servicios
) {}
```

### 2. Usar normalizeDate() al Construir Modelos

```typescript
// ✅ CORRECTO - Preserva la fecha exacta
private buildModelToSave(): ModeloCreate {
  const formValues = this.form.getRawValue();
  
  return {
    docDate: this.utilService.normalizeDate(formValues.docDate),
    docDueDate: this.utilService.normalizeDate(formValues.docDueDate),
    taxDate: this.utilService.normalizeDate(formValues.taxDate),
    // ... otros campos
  };
}
```

### 3. Ejemplos de Uso

#### Formularios de Creación
```typescript
// panel-solicitud-traslado-create.component.ts
private buildModelToSave(): SolicitudTrasladoCreateModel {
  const formValues = this.form.getRawValue();
  
  return {
    docDate: this.utilService.normalizeDate(formValues.docDate),      // ✅
    docDueDate: this.utilService.normalizeDate(formValues.docDueDate), // ✅
    taxDate: this.utilService.normalizeDate(formValues.taxDate),       // ✅
    // ...
  };
}
```

#### Formularios de Actualización
```typescript
private buildModelToSave(): SolicitudTrasladoUpdateModel {
  const formValues = {
    ...this.modeloFormCab2.getRawValue(),
    ...this.modeloFormCab3.getRawValue()
  };
  
  return {
    docDate: this.utilService.normalizeDate(formValues.docDate),      // ✅
    docDueDate: this.utilService.normalizeDate(formValues.docDueDate), // ✅
    taxDate: this.utilService.normalizeDate(formValues.taxDate),       // ✅
    // ...
  };
}
```

#### Filtros de Búsqueda
```typescript
onClickSearch(): void {
  const params = {
    startDate: this.utilService.normalizeDate(this.form.value.startDate), // ✅
    endDate: this.utilService.normalizeDate(this.form.value.endDate),     // ✅
    // ...
  };
  
  this.service.getList(params).subscribe(/* ... */);
}
```

## Cuándo Usar normalizeDate()

### ✅ SIEMPRE Usar En:
- Construcción de modelos para enviar a APIs (`buildModelToSave()`)
- Parámetros de búsqueda con fechas
- Filtros de fecha en listados
- Cualquier fecha que se envíe al backend

### ❌ NO Necesario En:
- Inicialización de formularios (`docDate: [new Date()]`)
- Comparaciones de fecha locales
- Validaciones de fecha en el frontend

## Referencia de API

### `utilService.normalizeDate(date: Date | string): Date`

**Parámetros:**
- `date`: Fecha a normalizar (puede ser `Date` o `string`)

**Retorna:**
- `Date` normalizada con solo año, mes y día (sin hora ni zona horaria)

**Ejemplo:**
```typescript
const userSelectedDate = new Date('2025-10-13T00:00:00Z');
const normalized = this.utilService.normalizeDate(userSelectedDate);
console.log(normalized); // 2025-10-13 00:00:00 (hora local, sin conversión UTC)
```

## Beneficios

✅ **Consistencia**: Todas las fechas se manejan de la misma manera  
✅ **Reutilizable**: Método centralizado en `UtilService`  
✅ **Previene Bugs**: Elimina el problema de +1/-1 día  
✅ **Documentado**: JSDoc incluido para autocompletado en VS Code  
✅ **Mantenible**: Un solo lugar para actualizar la lógica

## Migración de Código Existente

### Antes (con problema)
```typescript
docDate: new Date(formValues.docDate)
```

### Después (sin problema)
```typescript
docDate: this.utilService.normalizeDate(formValues.docDate)
```

## Archivos de Referencia

Los siguientes componentes ya implementan correctamente `normalizeDate()`:

- `panel-solicitud-traslado-create.component.ts`
- `panel-solicitud-traslado-update.component.ts`

Puedes usarlos como referencia al migrar otros componentes.

---

**Nota**: Si encuentras un componente que aún usa `new Date(formValues.fecha)` en la construcción de modelos, considera actualizarlo a `this.utilService.normalizeDate(formValues.fecha)` para prevenir bugs de zona horaria.
