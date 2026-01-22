import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { DatePipe } from '@angular/common';
import { TakeInventorySparePartsCreateModel, TakeInventorySparePartsDeleteModel, TakeInventorySparePartsFilterModel, TakeInventorySparePartsFindModel, TakeInventorySparePartsUpdateModel } from '../models/take-inventory-spare-parts.model';


@Injectable({providedIn: 'root'})
export class TakeInventorySparePartsService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getListByFilter(value: TakeInventorySparePartsFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('usuario', value.usuario);
    params = params.append('whsCode', value.whsCode);
    params = params.append('item', value.item);
    return this.http.get<any[]>(`${environment.url_api_fib}TakeInventorySpareParts/GetListByFilter/`,{params: params});
  }

  getExcelByFilter(value: TakeInventorySparePartsFilterModel){

    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('usuario', value.usuario);
    params = params.append('whsCode', value.whsCode);
    params = params.append('item', value.item);

    return this.http.get(`${environment.url_api_fib}TakeInventorySpareParts/GetExcelByFilter/`,{params: params, responseType: 'arraybuffer'});
  }

  getListCurrentDate(value: TakeInventorySparePartsFindModel) {
  let params = new HttpParams();
  params = params.append('u_CreateDate', this.datePipe.transform(value.u_CreateDate, 'yyyy-MM-dd'));
  params = params.append('u_WhsCode', value.u_WhsCode);
  params = params.append('u_UsrCreate', value.u_UsrCreate);
  return this.http.get<any[]>(`${environment.url_api_fib}TakeInventorySpareParts/GetListCurrentDate/`,{params: params});
}

  setCreate(value: TakeInventorySparePartsCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}TakeInventorySpareParts/SetCreate/`, param);
  }

  setUpdate(value: TakeInventorySparePartsUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}TakeInventorySpareParts/SetUpdate/`, param);
  }

  setDelete(value: TakeInventorySparePartsDeleteModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}TakeInventorySpareParts/SetDelete/`, param);
  }
}
