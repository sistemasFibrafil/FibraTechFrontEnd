import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { SelectItem } from 'primeng/api';

@Injectable({
  providedIn: 'root'
})
export class UtilService {

  constructor
  (
    private datePipe: DatePipe,
  ) { }

  firstDayMonth(): Date {
    let date: Date = new Date();
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  currentDate(): Date {
    let date: Date = new Date();

     // Si ya es un objeto Date, crear una nueva instancia sin conversión de zona horaria
    if (date instanceof Date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    // Si es un string, parsear y crear fecha local
    const parsedDate = new Date(date);
    return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  }

  fecha_DD_MM_YYYY(): string {
    return this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  }

  fecha_AAAAMMDD(fecha: string | Date): string {
    const day = new Date(fecha).getDate();
    const month = new Date(fecha).getMonth() + 1;
    const year = new Date(fecha).getFullYear();
    const fechaFinal = `${year}-${month}-${day}`;
    return fechaFinal;
  }

  fecha_AAAAMMDD_F112(fecha: string | Date): string {
    var day = new Date(fecha).getDate().toString();
    var month = (new Date(fecha).getMonth() + 1).toString();
    const year = new Date(fecha).getFullYear();
    if(Number(day)<10) day="0"+day.toString();
    if(Number(month)<10) month="0"+month.toString();

    const fechaFinal = `${year}${month}${day}`;

    return fechaFinal;
  }

  fecha_MM(fecha: Date): string {
    var month = new Date(fecha).getMonth() + 1

    if(Number(month)<10) {
      return "0"+month.toString();
    } else {
      return month.toString();
    }
  }

  fecha_YY(fecha: Date): number {
    const year = new Date(fecha).getFullYear();

    return year;
  }

  fecha_DDMMYYYYHHMM(fecha: Date): string {
    const day = this.padLeft(new Date(fecha).getDate(),2);
    const month = this.padLeft(new Date(fecha).getMonth() + 1,2);
    const year = new Date(fecha).getFullYear();
    const hour = this.padLeft(new Date(fecha).getHours(),2);
    const minute = this.padLeft(new Date(fecha).getMinutes(),2);
    const fechaFinal = `${day}/${month}/${year} ${hour}:${minute}`;
    return fechaFinal;
  }

  obtenerHora(fecha: Date): string {
    const hour = this.padLeft(new Date(fecha).getHours(),2);
    const minute = this.padLeft(new Date(fecha).getMinutes(),2);
    const hora = `${hour}:${minute}`;
    return hora;
  }

  /**
   * Devuelve la hora y minuto concatenados como entero.
   * Ejemplo: 07:08 -> "0708" -> convertido a número = 708
   * @param fecha Date | string
   * @returns number (hora concatenada con minuto, sin ceros a la izquierda en el entero)
   */
  horaMinutoToInt(fecha: Date | string): number {
    const d = fecha instanceof Date ? new Date(fecha) : new Date(fecha);
    const h = d.getHours();
    const m = d.getMinutes();
    // concatenar horas + minutos (minutos con padding 2)
    const s = `${h}${m.toString().padStart(2, '0')}`;
    return Number(s);
  }

  obtenerFechaHora(fecha: Date, hora: string): Date {
    const day = this.padLeft(new Date(fecha).getDate(),2);
    const month = this.padLeft(new Date(fecha).getMonth() + 1,2);
    const year = new Date(fecha).getFullYear();

    const fechaFinal = new Date(`${month}/${day}/${year} ${hora}`);

    return fechaFinal;
  }

  padLeft(value: number, lon: number): string {
    return value.toString().padStart(lon,'0')
  }

  recortarMensajeApiExito(msg: string): string {
    return msg.split(',')[0];
  }

  fechaApi_POST(fecha: Date): string {
    fecha.setHours(0, -fecha.getTimezoneOffset(), 0, 0);
    return fecha.toISOString();
  }

  /**
   * Devuelve una cadena ISO para POST que incluye hora y minuto (sin segundos/milisegundos),
   * preservando la hora local y evitando desfases por zona horaria.
   * Ejemplo: input local 2025-11-15 14:30 -> '2025-11-15T14:30:00.000Z'
   */
  fechaApi_POST_HHMM(fecha: Date): string {
    // Crear copia para no mutar el objeto original
    const d = new Date(fecha);
    // Limpiar segundos y milisegundos
    d.setSeconds(0, 0);
    // Ajustar minutos en base al timezoneOffset para que el ISO resultante refleje la hora local
    d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
    return d.toISOString();
  }

  /**
   * Normaliza una fecha eliminando la conversión de zona horaria
   * Útil para evitar el problema de +1/-1 día al enviar fechas a APIs
   * @param date - Fecha a normalizar (Date o string)
   * @returns Date normalizada con solo año, mes y día (sin hora ni zona horaria)
   *
   * @example
   * // Usuario selecciona 13-10-2025 en el calendario
   * const normalizedDate = this.utilService.normalizeDate(formValues.docDate);
   * // Resultado: 13-10-2025 (sin cambio de día por zona horaria)
   */
  normalizeDate(date: Date | string): Date {
    // Si ya es un objeto Date, crear una nueva instancia sin conversión de zona horaria
    if (date instanceof Date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    // Si es un string, parsear y crear fecha local
    const parsedDate = new Date(date);
    return new Date(parsedDate.getFullYear(), parsedDate.getMonth(), parsedDate.getDate());
  }

  /**
   * Opción B: Devuelve una cadena en formato `YYYY-MM-DD` (sin hora ni zona horaria).
   * Útil cuando la API espera una fecha simple en texto sin desfaces por zona horaria.
   * No modifica la función existente `normalizeDate`.
   * @param date Date | string
   * @returns string con formato 'yyyy-MM-dd'
   */
  normalizeDateToApiString(date: Date | string): string {
    let d: Date;
    if (date instanceof Date) {
      d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    } else {
      const parsed = new Date(date);
      d = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
    }

    const yyyy = d.getFullYear();
    const mm = (d.getMonth() + 1).toString().padStart(2, '0');
    const dd = d.getDate().toString().padStart(2, '0');

    return `${yyyy}-${mm}-${dd}`;
  }

  /**
   * Devuelve un objeto `Date` con la porción de hora/minuto/segundo puesta a 0
   * (medianoche local). Útil para mantener el tipo `Date` en formularios/objetos
   * pero evitar horas no deseadas.
   * Esta función no modifica `normalizeDate`.
   * @param date Date | string
   */
  normalizeDateToLocalDate(date: Date | string): Date {
    if (date instanceof Date) {
      return new Date(date.getFullYear(), date.getMonth(), date.getDate());
    }
    const parsed = new Date(date);
    return new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
  }

  validar_email(email)
  {
    var regex = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
    return regex.test(email) ? true : false;
  }

  goValidacionFechas(fechaInicio: Date, fechaFin: Date): boolean {
    let valido: boolean = false;

    if (fechaInicio === null) {
      valido = false;
      return valido;
    }

    if (fechaFin === null) {
      valido = false;
      return valido;
    }

    if (fechaInicio > fechaFin) {
      valido = true;
    }

    return valido;
  }

  convertirListaEmail(cadenaEmail: string): string[] {
    let miCadena = cadenaEmail;
    let posicion = miCadena.indexOf(';');
    let posiInicio = 0;

    let listDtaemail: string[] = [];

    if (posicion === -1)
    {
      listDtaemail.push(miCadena);
    }

    while (posicion !== -1) {

      let data = miCadena.substr(posiInicio, posicion);
      listDtaemail.push(data);
      miCadena = miCadena.substr(posicion + 1);
      posicion = miCadena.indexOf(';');

      if (posicion === -1)
      {
        listDtaemail.push(miCadena);
      }
    }
    return listDtaemail;
  }

  validaListEmail(email: string): string {
    var lista = this.convertirListaEmail(email);
    let msg = '';

    lista.forEach(x => {
      let validoEmail = this.validar_email(x);
      if (!validoEmail) {
        msg += '/' + x;
      }
    });

    return msg;
  }

  restarDia(fecha: string | Date, dias) {
    if (typeof fecha === 'string') {
      fecha = new Date(fecha);
    }
    fecha.setDate(fecha.getDate() - dias);
    return fecha;
  }

  sumarDias(fecha, dias) {
    fecha.setDate(fecha.getDate() + dias);
    return fecha;
  }
  recortarMensajeApiError(msg: string): string {
    return msg.split(';')[0];
  }

  onRedondearDecimal(numero: any, decimales: number): number {
    debugger;
  const n = String(numero ?? '').replace(',', '.');
  if (!n || isNaN(Number(n))) return 0;

  const [entero, decimal = ''] = n.split('.');
  const dec = decimal.padEnd(decimales + 1, '0');

  const base = Number(entero + dec.slice(0, decimales));
  const siguiente = Number(dec[decimales]);

  return (base + (siguiente >= 5 ? 1 : 0)) / Math.pow(10, decimales);
}


  onRedondearDecimalConCero(numero: number, decimales: number): string {
    const n = Number(numero);
    const opts: Intl.NumberFormatOptions = {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    };
    if (numero === null || numero === undefined || isNaN(n)) {
      return (0).toLocaleString('en-EN', opts);
    }
    return n.toLocaleString('en-EN', opts);
  }

  aceptaSoloNumeros(evt, value, decimal = 4){
    // Backspace = 8, Enter = 13, ‘0′ = 48, ‘9′ = 57, ‘.’ = 46, ‘-’ = 43
    const key = window.Event ? evt.which : evt.keyCode;
    const chark = String.fromCharCode(key);
    let tempValue = value + chark;

    if(key >= 48 && key <= 57){
      if (this.filter(tempValue, decimal) === false){
        return false;
      }else{
        return true;
      }
    }
    else
    {
      if (key === 8 || key === 13 || key === 0) {
        return true;
      }else if ( key === 46){
      if (this.filter(tempValue, decimal) === false){
        return false;
      }else{
        return true;
      }
      }else{
        return false;
      }
    }
  }

  onNumericInput(modeloForm: FormGroup,controlName: string, decimals: number): void {
    const control = modeloForm.get(controlName);
    if (!control) return;

    let value = String(control.value ?? '');

    // El navegador ya resolvió si fue reemplazo o escritura
    value = value.replace(/[^0-9.]/g, '');

    const parts = value.split('.');
    if (parts.length > 2) {
      value = parts[0] + '.' + parts.slice(1).join('');
    }

    if (parts.length === 2) {
      value = parts[0] + '.' + parts[1].slice(0, decimals);
    }

    control.setValue(value, { emitEvent: false });
  }

  filter(val, decimal){
    const preg = new RegExp('^([0-9]+\.?[0-9]{0,' + decimal + '})$');
    if ( preg.test(val) === true){
      return true;
    }else{
      return false;
    }
  }

  convertirMayuscula(data: string): string {
    data = data === null ? '': data;
    data = data === undefined ? '' : data;

    let mayus = data.toUpperCase();

    return mayus;
  }

  goFindRegistroPorCode(data: SelectItem[], find: any): SelectItem {
    let item: SelectItem = data.find(xFind => xFind.value === find);

    item = item === undefined ? null : item;

    return item;
  }

  goOcultarParteDelCorreo(value: string) :  string{
    let chars = 3; // Cantidad de caracters visibles
    return value
    ? value.replace(/[a-z0-9\-_.]+@/ig, (c) => c.substr(0, chars) + c.split('').slice(chars, -1).map(v => '*').join('') + '@')
    : value;
  }

  /**
   * Manejo centralizado de errores con soporte para errores de validación
   * @param error - El objeto de error recibido
   * @param context - Contexto donde ocurrió el error (ej: 'save', 'getList')
   * @param resetFlag - Callback para resetear flags de carga
   * @param swaService - Servicio para mostrar mensajes al usuario
   *
   * @example
   * // Uso básico
   * this.utilService.handleErrorSingle(e, 'save', () => this.isSaving = false, this.swaCustomService);
   *
   * @example
   * // Uso con múltiples flags
   * this.utilService.handleErrorSingle(e, 'getList', () => { this.isDisplay = false; this.isLoading = false; }, this.swaCustomService);
   */
  handleErrorSingle(
    error: any,
    context: string,
    resetFlag: () => void,
    swaService?: any
  ): string {
    // If the backend returned a Blob (text/plain or json as blob), read it and show its content
    if (error?.error instanceof Blob) {
      if (resetFlag && typeof resetFlag === 'function') {
        resetFlag();
      }

      error.error.text().then((text: string) => {
        let blobMsg = text || 'Ocurrió un error inesperado.';

        try {
          const parsed = JSON.parse(text);
          if (parsed?.errors) {
            const allErrors = Object.values(parsed.errors).flat() as string[];
            blobMsg = allErrors.length > 0 ? allErrors.join('<br>') : (parsed.title || blobMsg);
          } else {
            blobMsg = parsed?.resultadoDescripcion || parsed?.message || blobMsg;
          }
        } catch (err) {
          // not JSON, keep plain text
        }

        if (context) {
          console.error(`Error en ${context}:`, blobMsg, error);
        } else {
          console.error('Error:', blobMsg, error);
        }

        if (swaService && typeof swaService.swaMsgError === 'function') {
          swaService.swaMsgError(blobMsg);
        }
      }).catch(() => {
        console.error('Error leyendo el Blob de error', error);
        if (resetFlag && typeof resetFlag === 'function') {
          resetFlag();
        }
        if (swaService && typeof swaService.swaMsgError === 'function') {
          swaService.swaMsgError(error?.message || 'Ocurrió un error inesperado.');
        }
      });

      return;
    }

    let errorMsg: string;

    // Manejar errores de validación (e.error.errors)
    if (error?.error?.errors) {
      const allErrors = Object.values(error.error.errors).flat() as string[];
      errorMsg = allErrors.length > 0
        ? allErrors.join('<br>')
        : (error.error.title || 'Ocurrió un error de validación.');
    }
    // Manejar errores estándar
    else {
      errorMsg = error?.error?.resultadoDescripcion
        || error?.error?.message
        || error?.message
        || 'Ocurrió un error inesperado.';
    }

    // Log en consola para debugging
    if (context) {
      console.error(`Error en ${context}:`, errorMsg, error);
    } else {
      console.error('Error:', errorMsg, error);
    }

    // Resetear el flag usando el callback
    if (resetFlag && typeof resetFlag === 'function') {
      resetFlag();
    }

    // Mostrar mensaje al usuario si se proporciona el servicio
    if (swaService && typeof swaService.swaMsgError === 'function') {
      swaService.swaMsgError(errorMsg);
    }

    return errorMsg;
  }

  formatNumericFormControl(form: FormGroup, controlName: string, precision: number): void {
    const control = form.get(controlName);
    if (!control || control.value === null || control.value === undefined) {
      return;
    }

    const valueStr = String(control.value).replace(/,/g, '').trim();
    const numberValue = Number(valueStr);

    if (isNaN(numberValue)) {
      return;
    }

    const formattedValue = this.onRedondearDecimalConCero(numberValue, precision);

    control.setValue(formattedValue, { emitEvent: false });
  }
}
