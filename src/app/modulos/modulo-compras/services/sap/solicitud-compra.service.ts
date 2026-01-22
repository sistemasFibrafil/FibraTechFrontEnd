import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ISolicitudCompra } from '../../interfaces/sap/solicitud-compra.interface';
import { SolicitudCompraCloseModel, SolicitudCompraCreateModel, SolicitudCompraFilterModel, SolicitudCompraUpdateModel } from '../../models/sap/solicitud-compra.model';


@Injectable({providedIn: 'root'})
export class SolicitudCompraService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){ }

  getListByFilter(value: SolicitudCompraFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    return this.http.get<ISolicitudCompra[]>(`${environment.url_api_fib}PurchaseRequest/GetListByFilter/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
    return this.http.get<ISolicitudCompra>(`${environment.url_api_fib}PurchaseRequest/GetByDocEntry/${docEntry}`);
  }

  setCreate(value: SolicitudCompraCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}PurchaseRequest/SetCreate/`, param);
  }

  setUpdate(value: SolicitudCompraUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}PurchaseRequest/SetUpdate/`, param);
  }

  setClose(value: SolicitudCompraCloseModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}PurchaseRequest/SetClose/`, param);
  }
}
