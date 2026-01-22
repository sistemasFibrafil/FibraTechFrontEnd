import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';


import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { OrdenVentaSodimacCreateModel, OrdenVentaSodimacLpnUpdateModel, OrdenVentaSodimacUpdateModel } from '../../models/web/orden-venta-sodimac.model';
import { IOrdenVentaSodimac, IOrdenVentaSodimacByFiltro, IOrdenVentaSodimacConsulta, IOrdenVentaSodimacDetalle } from '../../interfaces/web/orden-venta-sodimac.interface';



@Injectable({providedIn: 'root'})
export class OrdenVentaSodimacService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){}

  setCreate(value: OrdenVentaSodimacCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post(`${environment.url_api_fib}OrdenVentaSodimac/SetCreate/`, param);
  }

  setUpdte(value: OrdenVentaSodimacUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}OrdenVentaSodimac/SetUpdate/`, param);
  }

  getListOrdenVentaSodimacByFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaSodimacByFiltro[]>(`${environment.url_api_fib}OrdenVentaSodimac/GetListOrdenVentaSodimacByFiltro/`,{params: params});
  }

  getOrdenVentaSodimacById(id: number) {
    return this.http.get<IOrdenVentaSodimac>(`${environment.url_api_fib}OrdenVentaSodimac/GetOrdenVentaSodimacById/${id}`);
  }

  getListOrdenVentaSodimacPendienteLpnByFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaSodimacConsulta[]>(`${environment.url_api_fib}OrdenVentaSodimac/GetListOrdenVentaSodimacPendienteLpnByFiltro/`,{params: params});
  }

  getListOrdenVentaSodimacDetallePendienteLpnByIdAndFiltro(value: FilterRequestModel) {
    debugger
    let params = new HttpParams();
    params = params.append('id1', value.id1.toString());
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaSodimacConsulta[]>(`${environment.url_api_fib}OrdenVentaSodimac/GetListOrdenVentaSodimacDetallePendienteLpnByIdAndFiltro/`,{params: params});
  }

  getListOrdenVentaSodimacLpnByFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaSodimacConsulta[]>(`${environment.url_api_fib}OrdenVentaSodimac/GetListOrdenVentaSodimacLpnByFiltro/`,{params: params});
  }

  getListOrdenVentaSodimacDetalleById(id: number) {
    let params = new HttpParams();
    params = params.append('id1', id.toString());

    return this.http.get<IOrdenVentaSodimacDetalle[]>(`${environment.url_api_fib}OrdenVentaSodimac/GetListOrdenVentaSodimacDetalleById/`,{params: params});
  }

  setLpnUpdate(value: OrdenVentaSodimacLpnUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}OrdenVentaSodimac/SetLpnUpdate/`, param);
  }

  getBarcodeLpnPdfById(id: number) {
    return this.http.get(`${environment.url_api_fib}OrdenVentaSodimac/GetBarcodeLpnPdfById/${id}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }

  getListBarcodeEanPdfByEan(ean: string) {
    return this.http.get(`${environment.url_api_fib}OrdenVentaSodimac/GetListBarcodeEanPdfByEan/${ean}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }

  getListOrdenVentaSodimacByFechaNumero(value: FilterRequestModel){
    var params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaSodimacConsulta[]>(`${environment.url_api_fib}OrdenVentaSodimac/GetListOrdenVentaSodimacByFechaNumero/`,{params: params});
  }

  getListOrdenVentaSodimacExcelByFechaNumero(value: FilterRequestModel){
    var params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('cod1', value.cod1);
    params = params.append('text1', value.text1);

    return this.http.get(`${environment.url_api_fib}OrdenVentaSodimac/GetListOrdenVentaSodimacExcelByFechaNumero/`,{params: params, responseType: 'arraybuffer'});
  }

  getListOrdenVentaSodimacSelvaFechaNumero(value: FilterRequestModel){
    var params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('text1', value.text1);

    return this.http.get<IOrdenVentaSodimacConsulta[]>(`${environment.url_api_fib}OrdenVentaSodimac/GetListOrdenVentaSodimacSelvaFechaNumero/`,{params: params});
  }

  getListOrdenVentaSodimacSelvaPdfByFechaNumero(value: FilterRequestModel) {
    var params = new HttpParams();
    params = params.append('dat1', this.datePipe.transform(value.dat1, 'yyyy-MM-dd'));
    params = params.append('dat2', this.datePipe.transform(value.dat2, 'yyyy-MM-dd'));
    params = params.append('text1', value.text1);

    return this.http.get(`${environment.url_api_fib}OrdenVentaSodimac/GetListOrdenVentaSodimacSelvaPdfByFechaNumero/`, {params: params, responseType: 'blob',  observe: 'response', reportProgress: true });
  }
}
