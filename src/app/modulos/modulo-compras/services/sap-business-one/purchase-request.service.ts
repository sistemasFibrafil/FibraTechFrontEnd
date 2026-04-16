import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IPurchaseRequest } from '../../interfaces/sap-business-one/purchase-request.interface';
import { PurchaseRequestCloseModel, PurchaseRequestCreateModel, PurchaseRequestFilterModel, PurchaseRequestUpdateModel } from '../../models/sap-business-one/purchase-request.model';


@Injectable({providedIn: 'root'})
export class PurchaseRequestService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){ }

  getListByFilter(value: PurchaseRequestFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    return this.http.get<IPurchaseRequest[]>(`${environment.url_api_fib}PurchaseRequest/GetListByFilter/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
    return this.http.get<IPurchaseRequest>(`${environment.url_api_fib}PurchaseRequest/GetByDocEntry/${docEntry}`);
  }

  getDownloadFormat(){
    return this.http.get(`${environment.url_api_fib}PurchaseRequest/GetDownloadFormat/`,{ responseType: 'arraybuffer' });
  }

  setCreate(value: PurchaseRequestCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}PurchaseRequest/SetCreate/`, param);
  }

  setUpdate(value: PurchaseRequestUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}PurchaseRequest/SetUpdate/`, param);
  }

  setClose(value: PurchaseRequestCloseModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}PurchaseRequest/SetClose/`, param);
  }
}
