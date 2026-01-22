import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ISolicitudTraslado } from '../interfaces/solicitud-traslado.interface';
import { SolicitudTrasladoCloseModel, SolicitudTrasladoCreateModel, SolicitudTrasladoFilterModel, SolicitudTrasladoUpdateModel } from '../models/solicitud-traslado.model';
import { IPicking } from '../interfaces/picking.inteface';


@Injectable({providedIn: 'root'})
export class SolicitudTrasladoService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){ }

  getListOpen() {
    return this.http.get<ISolicitudTraslado[]>(`${environment.url_api_fib}SolicitudTraslado/getListOpen/`);
  }

  getListByFilter(value: SolicitudTrasladoFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    return this.http.get<ISolicitudTraslado[]>(`${environment.url_api_fib}SolicitudTraslado/GetListByFilter/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
    return this.http.get<ISolicitudTraslado>(`${environment.url_api_fib}SolicitudTraslado/GetByDocEntry/${docEntry}`);
  }

  getToTransferenciaByDocEntry(docEntry: number) {
    return this.http.get<ISolicitudTraslado>(`${environment.url_api_fib}SolicitudTraslado/GetToTransferenciaByDocEntry/${docEntry}`);
  }

  getListNotPicking() {
    return this.http.get<IPicking[]>(`${environment.url_api_fib}SolicitudTraslado/GetListNotPicking/`);
  }

  getFormatoPdfByDocEntry(id: number) {
    return this.http.get(`${environment.url_api_fib}SolicitudTraslado/GetFormatoPdfByDocEntry/${id}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }

  setCreate(value: SolicitudTrasladoCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}SolicitudTraslado/SetCreate/`, param);
  }

  setUpdate(value: SolicitudTrasladoUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}SolicitudTraslado/SetUpdate/`, param);
  }

  setClose(value: SolicitudTrasladoCloseModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}SolicitudTraslado/SetClose/`, param);
  }
}
