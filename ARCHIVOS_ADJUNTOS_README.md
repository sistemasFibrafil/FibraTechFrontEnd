# Control de Carga de Archivos - SKU Comercial

## Descripción
Se ha agregado un control de carga de archivos al componente de actualización de SKU comercial que permite a los usuarios adjuntar documentos relacionados con el SKU.

## Características Implementadas

### 1. Control de Carga de Archivos
- **Múltiples archivos**: Permite cargar hasta 5 archivos simultáneamente
- **Tipos de archivo permitidos**: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
- **Tamaño máximo**: 10MB por archivo
- **Validación en tiempo real**: Verifica tipo y tamaño antes de la carga
- **Interfaz intuitiva**: Botones para seleccionar, remover y limpiar archivos

### 2. Funcionalidades
- **Selección de archivos**: Botón "Seleccionar archivos" para elegir documentos
- **Vista previa**: Muestra lista de archivos seleccionados con nombre y tamaño
- **Remover archivos**: Botón individual para eliminar archivos específicos
- **Limpiar todo**: Botón para remover todos los archivos de una vez
- **Validación**: Mensajes de error para archivos inválidos

### 3. Servicio de Archivos
Se ha creado un servicio `FileUploadService` con las siguientes funcionalidades:
- Validación de archivos (tamaño y tipo)
- Conversión a Base64 para almacenamiento
- Métodos para carga, descarga y eliminación de archivos
- Manejo de errores y progreso de carga

## Uso del Control

### En el Template HTML
```html
<p-fileUpload 
  #fileUpload
  name="files[]" 
  [url]="'./upload.php'" 
  [multiple]="true" 
  accept="{{acceptedFileTypes}}"
  [maxFileSize]="maxFileSize"
  [auto]="false"
  [showRemoveButton]="true"
  [showClearButton]="true"
  [showPreview]="true"
  [showFileList]="true"
  [customUpload]="true"
  (onSelect)="onSelect($event)"
  (onUpload)="onUpload($event)"
  (onRemove)="onRemove($event)"
  (onClear)="onClear()"
  (onError)="onError($event)"
  chooseLabel="Seleccionar archivos"
  [fileLimit]="5">
</p-fileUpload>
```

### En el Componente TypeScript
```typescript
// Propiedades del componente
uploadedFiles: any[] = [];
maxFileSize: number = 10000000; // 10MB
acceptedFileTypes: string = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png';

// Métodos de manejo
onUpload(event: any) {
  this.uploadedFiles = event.files;
  this.modeloForm.patchValue({ 'u_Attachments': this.uploadedFiles });
}

onRemove(event: any) {
  const index = this.uploadedFiles.findIndex(file => file.name === event.file.name);
  if (index > -1) {
    this.uploadedFiles.splice(index, 1);
  }
}

validateFiles(): boolean {
  // Validación de archivos antes de guardar
  return this.fileUploadService.validateFile(file, this.maxFileSize, acceptedTypes);
}
```

## Configuración del Servidor

### Endpoints Necesarios
Para que el control funcione completamente, se necesitan los siguientes endpoints en el backend:

1. **POST /api/upload** - Carga de archivo individual
2. **POST /api/upload-multiple** - Carga de múltiples archivos
3. **DELETE /api/delete-file/{fileName}** - Eliminación de archivos
4. **GET /api/files** - Lista de archivos
5. **GET /api/download/{fileName}** - Descarga de archivos

### Estructura de Respuesta
```json
{
  "success": true,
  "message": "Archivo cargado correctamente",
  "files": ["archivo1.pdf", "archivo2.jpg"],
  "errors": []
}
```

## Validaciones Implementadas

### Validaciones de Archivo
- **Tamaño máximo**: 10MB por archivo
- **Tipos permitidos**: PDF, DOC, DOCX, XLS, XLSX, JPG, JPEG, PNG
- **Límite de archivos**: Máximo 5 archivos por SKU
- **Validación antes de guardar**: Se ejecuta automáticamente al guardar el formulario

### Mensajes de Error
- Archivo demasiado grande
- Tipo de archivo no permitido
- Error en la carga del archivo
- Límite de archivos excedido

## Almacenamiento

### En Base de Datos
Los archivos se convierten a Base64 y se almacenan en el campo `u_Attachments` del modelo OSKC como un array de strings.

### Estructura del Modelo
```typescript
export class OSKCUpdateModel {
  // ... otros campos
  u_Attachments: string[]; // Array de archivos en Base64
}
```

## Consideraciones de Seguridad

1. **Validación del lado del servidor**: Siempre validar archivos en el backend
2. **Límites de tamaño**: Configurar límites apropiados en el servidor
3. **Tipos de archivo**: Verificar tipos MIME en el servidor
4. **Almacenamiento seguro**: Considerar almacenamiento en sistema de archivos en lugar de base de datos para archivos grandes

## Próximas Mejoras

1. **Progreso de carga**: Mostrar barra de progreso durante la carga
2. **Vista previa de imágenes**: Mostrar miniaturas para archivos de imagen
3. **Compresión de archivos**: Comprimir archivos grandes automáticamente
4. **Drag & Drop**: Permitir arrastrar y soltar archivos
5. **Integración con almacenamiento en la nube**: Conectar con servicios como AWS S3 o Azure Blob Storage

## Troubleshooting

### Problemas Comunes
1. **Archivo no se carga**: Verificar tamaño y tipo de archivo
2. **Error de validación**: Revisar configuración de tipos permitidos
3. **Problemas de red**: Verificar conectividad con el servidor
4. **Errores de CORS**: Configurar headers apropiados en el servidor

### Logs de Depuración
El componente incluye logs de consola para depuración:
- Archivos seleccionados
- Archivos cargados
- Archivos removidos
- Errores de validación
