import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ITransferenciaStock } from '../interfaces/transferencia-stock.interface';
import { TransferenciaStockCreateModel, TransferenciaStockFilterModel, TransferenciaStockUpdateModel } from '../models/transferencia-stock.model';



@Injectable({providedIn: 'root'})
export class TransferenciaStockService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){ }

  getListByFilter(value: TransferenciaStockFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    return this.http.get<ITransferenciaStock[]>(`${environment.url_api_fib}TransferenciaStock/GetListByFilter/`,{params: params});
  }

  getByDocEntry(id: number) {
    return this.http.get<ITransferenciaStock>(`${environment.url_api_fib}TransferenciaStock/GetByDocEntry/${id}`);
  }

  getFormatoPdfByDocEntry(id: number) {
    return this.http.get(`${environment.url_api_fib}TransferenciaStock/GetFormatoPdfByDocEntry/${id}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }

  setCreate(value: TransferenciaStockCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}TransferenciaStock/SetCreate/`, param);
  }

  setUpdate(value: TransferenciaStockUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}TransferenciaStock/SetUpdate/`, param);
  }
}
