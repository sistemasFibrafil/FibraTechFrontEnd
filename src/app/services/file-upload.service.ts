import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpRequest } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface FileUploadResponse {
  success: boolean;
  message: string;
  files?: string[];
  errors?: string[];
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {

  constructor(private http: HttpClient) { }

  /**
   * Valida un archivo antes de la carga
   * @param file Archivo a validar
   * @param maxSize Tamaño máximo en bytes
   * @param allowedTypes Tipos de archivo permitidos
   * @returns Objeto con resultado de validación
   */
  validateFile(file: File, maxSize: number = 10000000, allowedTypes: string[] = []): { valid: boolean; message: string } {
    // Validar tamaño
    if (file.size > maxSize) {
      return {
        valid: false,
        message: `El archivo ${file.name} excede el tamaño máximo permitido (${this.formatFileSize(maxSize)})`
      };
    }

    // Validar tipo de archivo
    if (allowedTypes.length > 0) {
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      if (!allowedTypes.includes(fileExtension)) {
        return {
          valid: false,
          message: `El archivo ${file.name} no es de un tipo permitido. Tipos aceptados: ${allowedTypes.join(', ')}`
        };
      }
    }

    return { valid: true, message: 'Archivo válido' };
  }

  /**
   * Carga un archivo al servidor
   * @param file Archivo a cargar
   * @param endpoint Endpoint del servidor
   * @returns Observable con el progreso de la carga
   */
  uploadFile(file: File, endpoint: string = '/api/upload'): Observable<HttpEvent<any>> {
    const formData = new FormData();
    formData.append('file', file);

    const req = new HttpRequest('POST', endpoint, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  /**
   * Carga múltiples archivos al servidor
   * @param files Array de archivos a cargar
   * @param endpoint Endpoint del servidor
   * @returns Observable con el progreso de la carga
   */
  uploadMultipleFiles(files: File[], endpoint: string = '/api/upload-multiple'): Observable<HttpEvent<any>> {
    const formData = new FormData();

    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file);
    });

    const req = new HttpRequest('POST', endpoint, formData, {
      reportProgress: true,
      responseType: 'json'
    });

    return this.http.request(req);
  }

  /**
   * Elimina un archivo del servidor
   * @param fileName Nombre del archivo a eliminar
   * @param endpoint Endpoint del servidor
   * @returns Observable con la respuesta
   */
  deleteFile(fileName: string, endpoint: string = '/api/delete-file'): Observable<any> {
    return this.http.delete(`${endpoint}/${fileName}`);
  }

  /**
   * Obtiene la lista de archivos del servidor
   * @param endpoint Endpoint del servidor
   * @returns Observable con la lista de archivos
   */
  getFileList(endpoint: string = '/api/files'): Observable<any> {
    return this.http.get(endpoint);
  }

  /**
   * Descarga un archivo del servidor
   * @param fileName Nombre del archivo a descargar
   * @param endpoint Endpoint del servidor
   * @returns Observable con el archivo
   */
  downloadFile(fileName: string, endpoint: string = '/api/download'): Observable<Blob> {
    return this.http.get(`${endpoint}/${fileName}`, { responseType: 'blob' });
  }

  /**
   * Formatea el tamaño de archivo en formato legible
   * @param bytes Tamaño en bytes
   * @returns String formateado
   */
  private formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Convierte un archivo a Base64
   * @param file Archivo a convertir
   * @returns Promise con el string Base64
   */
  fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        resolve(result.split(',')[1]); // Remover el prefijo data:application/...
      };
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Convierte Base64 a Blob
   * @param base64 String Base64
   * @param mimeType Tipo MIME
   * @returns Blob
   */
  base64ToBlob(base64: string, mimeType: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = new Array(byteCharacters.length);

    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mimeType });
  }
}
