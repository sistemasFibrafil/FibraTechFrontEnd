import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { OSKPCreateModel, OSKPDeleteModel, OSKPFindByFiltroModel, OSKPUpdateModel } from '../models/oskp.model';
import { IOSKP } from '../interfaces/oskp.interface';


@Injectable({providedIn: 'root'})
export class OSKPService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  setCreate(value: OSKPCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}OSKP/SetCreate/`, param);
  }

  setUpdate(value: OSKPUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put<any[]>(`${environment.url_api_fib}OSKP/SetUpdate/`, param);
  }

  setDelete(value: OSKPDeleteModel) {
      const param: string = JSON.stringify(value);
      return this.http.patch<IOSKP>(`${environment.url_api_fib}OSKP/SetDelete/`, param);
    }

  getListByFiltro(value: OSKPFindByFiltroModel) {
    let params = new HttpParams();
    params = params.append('filtro', value.filtro);
    return this.http.get<IOSKP[]>(`${environment.url_api_fib}OSKP/GetListByFiltro/`,{params: params});
  }

  getByDocEntry(docEntry: number) {
    let params = new HttpParams();
    params = params.append('DocEntry', docEntry);
      return this.http.get<IOSKP>(`${environment.url_api_fib}OSKP/GetByDocEntry/`, {params: params});
  }
}
