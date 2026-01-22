import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { DatePipe } from '@angular/common';
import { TakeInventoryFinishedProductsCreateModel, TakeInventoryFinishedProductsFilterModel, TakeInventoryFinishedProductsFindModel } from '../models/take-inventory-finished-products.model';
import { ITakeInventoryFinishedProducts1 } from '../interfaces/take-inventory-finished-products.interface';

@Injectable({providedIn: 'root'})
export class TakeInventoryFinishedProductsService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe,
  ) { }

  getListByFilter(value: TakeInventoryFinishedProductsFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('usuario', value.usuario);
    params = params.append('whsCode', value.whsCode);
    params = params.append('item', value.item);
    return this.http.get<any[]>(`${environment.url_api_fib}TakeInventoryFinishedProducts/GetListByFilter/`,{params: params});
  }

  getSummaryItemExcelByFilter(value: TakeInventoryFinishedProductsFilterModel){
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('usuario', value.usuario);
    params = params.append('whsCode', value.whsCode);
    params = params.append('item', value.item);
    return this.http.get(`${environment.url_api_fib}TakeInventoryFinishedProducts/GetSummaryItemExcelByFilter/`,{params: params, responseType: 'arraybuffer'});
  }

  getSummaryUserExcelByFilter(value: TakeInventoryFinishedProductsFilterModel){
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('usuario', value.usuario);
    params = params.append('whsCode', value.whsCode);
    params = params.append('item', value.item);
    return this.http.get(`${environment.url_api_fib}TakeInventoryFinishedProducts/getSummaryUserExcelByFilter/`,{params: params, responseType: 'arraybuffer'});
  }

  getDetailedExcelByFilter(value: TakeInventoryFinishedProductsFilterModel){
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('usuario', value.usuario);
    params = params.append('whsCode', value.whsCode);
    params = params.append('item', value.item);

    return this.http.get(`${environment.url_api_fib}TakeInventoryFinishedProducts/GetDetailedExcelByFilter/`,{params: params, responseType: 'arraybuffer'});
  }

  getListByItemCode(value: any) {
    let params = new HttpParams();
    params = params.append('docEntry', value.docEntry);
    params = params.append('codeBar', value.codeBar);
    return this.http.get<ITakeInventoryFinishedProducts1[]>(`${environment.url_api_fib}TakeInventoryFinishedProducts/GetListByItemCode/`,{params: params});
  }

  getListCurrentDate(value: TakeInventoryFinishedProductsFindModel) {
    let params = new HttpParams();
    params = params.append('whsCode', value.whsCode);
    params = params.append('usrCreate', value.usrCreate);
    params = params.append('createDate', this.datePipe.transform(value.createDate, 'yyyy-MM-dd'));
    return this.http.get<any[]>(`${environment.url_api_fib}TakeInventoryFinishedProducts/GetListCurrentDate/`,{params: params});
  }

  setCreate(value: TakeInventoryFinishedProductsCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}TakeInventoryFinishedProducts/SetCreate/`, param);
  }

  setDeleteLine(value: any) {
    debugger
    const param: string = JSON.stringify(value);
    return this.http.patch<any>(`${environment.url_api_fib}TakeInventoryFinishedProducts/SetDeleteLine/`, param);
  }

  setDelete(value: any) {
    const param: string = JSON.stringify(value);
    return this.http.patch<any>(`${environment.url_api_fib}TakeInventoryFinishedProducts/SetDelete/`, param);
  }

  getToCopy(value: any){
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('usuario', value.usuario);
    params = params.append('item', value.item);
    params = params.append('itemCode', value.itemCode);

    return this.http.get<any[]>(`${environment.url_api_fib}TakeInventoryFinishedProducts/GetToCopy/`,{params: params});
  }
}
