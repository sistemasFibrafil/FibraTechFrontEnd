import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { IStockTransfers } from '../interfaces/stock-transfers.interface';
import { StockTransfersCreateModel, StockTransfersFilterModel, StockTransfersUpdateModel } from '../models/stock-transfers.model';



@Injectable({providedIn: 'root'})
export class StockTransfersService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){ }

  getListByFilter(value: StockTransfersFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    return this.http.get<IStockTransfers[]>(`${environment.url_api_fib}StockTransfers/GetListByFilter/`,{params: params});
  }

  getByDocEntry(id: number) {
    return this.http.get<IStockTransfers>(`${environment.url_api_fib}StockTransfers/GetByDocEntry/${id}`);
  }

  getFormatoPdfByDocEntry(id: number) {
    return this.http.get(`${environment.url_api_fib}StockTransfers/GetFormatoPdfByDocEntry/${id}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }

  setCreate(value: StockTransfersCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}StockTransfers/SetCreate/`, param);
  }

  setUpdate(value: StockTransfersUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}StockTransfers/SetUpdate/`, param);
  }
}
