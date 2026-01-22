import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { OrdenMantenimientoWebFindByFechaAndIdEstadoModel } from '../models/ordenMantenimientoWeb.model';

import { IOrdenMantenimientoWeb } from '../interfaces/ordenMantenimientoWeb.interface';

@Injectable({providedIn: 'root'})
export class OrdenMantenimientoWebService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe) { }

    getListByFechaAndIdEstadoAndNumero(value: OrdenMantenimientoWebFindByFechaAndIdEstadoModel) {
      let params = new HttpParams();
      params = params.append('fecInicial', this.datePipe.transform(value.fecInicial, 'yyyy-MM-dd'));
      params = params.append('fecFinal', this.datePipe.transform(value.fecFinal, 'yyyy-MM-dd'));
      params = params.append('idEstado', value.idEstado);
      params = params.append('numero', value.numero);

      return this.http.get<IOrdenMantenimientoWeb[]>(`${environment.url_api_fib}OrdenMantenimientoWeb/GetListOrdenMatenimientoByFechaAndIdEstadoAndNumero/`,{params: params});
  }

  getExcelByFechaAndIdEstadoAndNumero(value: OrdenMantenimientoWebFindByFechaAndIdEstadoModel){
    let params = new HttpParams();
      params = params.append('fecInicial', this.datePipe.transform(value.fecInicial, 'yyyy-MM-dd'));
      params = params.append('fecFinal', this.datePipe.transform(value.fecFinal, 'yyyy-MM-dd'));
      params = params.append('idEstado', value.idEstado);
      params = params.append('numero', value.numero);

    return this.http.get(`${environment.url_api_fib}OrdenMantenimientoWeb/GetOrdenMatenimientoExcelByFechaAndIdEstadoAndNumero/`,{params: params, responseType: 'arraybuffer'});
  }

  getPdfByIdOrdenMantenimiento(idOrdenMantenimiento: number) {
    return this.http.get(`${environment.url_api_fib}OrdenMantenimientoWeb/GetOrdenMatenimientoByIdOrdenMantenimiento/${idOrdenMantenimiento}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }
}
