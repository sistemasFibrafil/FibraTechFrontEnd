import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ISop } from '../../interfaces/web/sop.interface';
import { SopCreateModel, SopDeleteModel, SopDetalleDeleteModel, SopUpdateModel } from '../../models/web/sop.model';
import { FilterRequestModel } from 'src/app/models/filter-request.model';


@Injectable({providedIn: 'root'})
export class SopService {
  constructor
  (
    private http: HttpClient
  ){ }

  getListFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('id1', value.id1);
    params = params.append('id2', value.id2);
    params = params.append('id3', value.id3);
    params = params.append('text1', value.text1);
    return this.http.get<ISop[]>(`${environment.url_api_fib}Sop/GetListFiltro/`,{params: params});
  }

  getById(id: number) {
    return this.http.get<ISop>(`${environment.url_api_fib}Sop/GetById/${id}`);
  }

  getSopExcelById(value: FilterRequestModel){
    var params = new HttpParams();
    params = params.append('id1', value.id1);
    return this.http.get(`${environment.url_api_fib}Sop/GetSopExcelById/`,{params: params, responseType: 'arraybuffer'});
  }

  setCreate(value: SopCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post(`${environment.url_api_fib}Sop/SetCreate/`, param);
  }

  setUpdate(value: SopUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}Sop/SetUpdate/`, param);
  }

  setDelete(value: SopDeleteModel) {
    const param: string = JSON.stringify(value);
    return this.http.patch(`${environment.url_api_fib}Sop/setDelete/`, param);
  }

  setDeleteDetalle(value: SopDetalleDeleteModel) {
    const param: string = JSON.stringify(value);
    return this.http.patch(`${environment.url_api_fib}Sop/SetDeleteDetalle/`, param);
  }
}
