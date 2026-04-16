import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IPicking } from '../interfaces/picking.inteface';
import { IInventoryTransferRequest } from '../interfaces/inventory-transfer-request.interface';
import { InventoryTransferRequestCloseModel, InventoryTransferRequestCreateModel, InventoryTransferRequestFilterModel, InventoryTransferRequestUpdateModel } from '../models/inventory-transfer-request.model';


@Injectable({providedIn: 'root'})
export class InventoryTransferRequestService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){ }

  getListOpen() {
    return this.http.get<IInventoryTransferRequest[]>(`${environment.url_api_fib}InventoryTransferRequest/getListOpen/`);
  }

  getListByFilter(value: InventoryTransferRequestFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    
    return this.http.get<IInventoryTransferRequest[]>(`${environment.url_api_fib}InventoryTransferRequest/GetListByFilter/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
    return this.http.get<IInventoryTransferRequest>(`${environment.url_api_fib}InventoryTransferRequest/GetByDocEntry/${docEntry}`);
  }

  getToTransferenciaByDocEntry(docEntry: number) {
    return this.http.get<IInventoryTransferRequest>(`${environment.url_api_fib}InventoryTransferRequest/GetToTransferenciaByDocEntry/${docEntry}`);
  }

  getListNotPicking() {
    return this.http.get<IPicking[]>(`${environment.url_api_fib}InventoryTransferRequest/GetListNotPicking/`);
  }

  getFormatoPdfByDocEntry(id: number) {
    return this.http.get(`${environment.url_api_fib}InventoryTransferRequest/GetFormatoPdfByDocEntry/${id}`, {responseType: 'blob',  observe: 'response', reportProgress: true });
  }

  setCreate(value: InventoryTransferRequestCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}InventoryTransferRequest/SetCreate/`, param);
  }

  setUpdate(value: InventoryTransferRequestUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}InventoryTransferRequest/SetUpdate/`, param);
  }

  setClose(value: InventoryTransferRequestCloseModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}InventoryTransferRequest/SetClose/`, param);
  }
}
