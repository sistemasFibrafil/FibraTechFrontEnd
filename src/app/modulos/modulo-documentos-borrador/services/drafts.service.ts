import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { DraftsCloseModel, DraftsCreateModel, DraftsFilterModel, DraftsUpdateModel } from '../models/drafts.model';
import { IDraftsQuery, IDraftsStatusQuery } from '../interfaces/drafts.interface';


@Injectable({providedIn: 'root'})
export class DraftsService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getListByFilter(value: DraftsFilterModel) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('docStatus', value.docStatus);
    params = params.append('searchText', value.searchText);
    return this.http.get<IDraftsQuery[]>(`${environment.url_api_fib}Drafts/GetListByFilter/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
    return this.http.get<any>(`${environment.url_api_fib}Drafts/GetByDocEntry/${docEntry}`);
  }

  getStatusByDocEntry(docEntry: number) {
    return this.http.get<any>(`${environment.url_api_fib}Drafts/GetStatusByDocEntry/${docEntry}`);
  }

  setCreate(value: any) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}Drafts/SetCreate/`, param);
  }

  setResend(value: DraftsCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}Drafts/SetResend/`, param);
  }

  setUpdate(value: DraftsUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}Drafts/SetUpdate/`, param);
  }

  setClose(value: DraftsCloseModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}Drafts/SetClose/`, param);
  }
}
