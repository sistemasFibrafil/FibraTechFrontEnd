import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { DraftsFilterModel } from '../models/drafts.model';

import { IDraftsDocumentReportQuery, IDraftsQuery } from '../interfaces/drafts.interface';


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

  getListDraftsDocumentReport(value: any) {
    const param: string = JSON.stringify(value);
    return this.http.post<IDraftsDocumentReportQuery[]>(`${environment.url_api_fib}Drafts/GetListDraftsDocumentReport/`, param);
  }

  getByDocEntry(docEntry: number) {
    return this.http.get<any>(`${environment.url_api_fib}Drafts/GetByDocEntry/${docEntry}`);
  }

  getStatusByDocEntry(docEntry: number) {
    return this.http.get<any>(`${environment.url_api_fib}Drafts/GetStatusByDocEntry/${docEntry}`);
  }

  setCreate(value: any, files: any[]) {
    let formData: FormData = new FormData();

    formData.append('value', JSON.stringify(value));

    files.forEach((element: any) => {
      formData.append('files', element);
    });

    return this.http.post(`${environment.url_api_fib}Drafts/SetCreate/`, formData,{ reportProgress: true, observe: 'events'});
  }

  setSaveDraftToDocument(value: any) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}Drafts/SetSaveDraftToDocument/`, param);
  }

  setUpdate(value: any, files: any[]) {
    let formData: FormData = new FormData();

    formData.append('value', JSON.stringify(value));

    files.forEach((element: any) => {
      formData.append('files', element);
    });

    return this.http.put(`${environment.url_api_fib}Drafts/SetUpdate/`, formData,{ reportProgress: true, observe: 'events'});
  }
}
