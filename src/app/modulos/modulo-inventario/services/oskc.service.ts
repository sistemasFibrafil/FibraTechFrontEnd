import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { OSKCCreateModel, OSKCDeleteModel, OSKCFindByDateModel, OSKCFindByFiltroModel, OSKCUpdateModel } from '../models/oskc.model';
import { IOSKC } from '../interfaces/oskc.interface';



@Injectable({providedIn: 'root'})
export class OSKCService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  setCreate(value: OSKCCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any[]>(`${environment.url_api_fib}OSKC/SetCreate/`, param);
  }

  setUpdate(value: OSKCUpdateModel) {
    const param: string = JSON.stringify(value);
    return this.http.put<any[]>(`${environment.url_api_fib}OSKC/SetUpdate/`, param);
  }

  setDelete(value: OSKCDeleteModel) {
    const param: string = JSON.stringify(value);
    return this.http.patch<IOSKC>(`${environment.url_api_fib}OSKC/SetDelete/`, param);
  }

  getListByDateRange(value: OSKCFindByDateModel) {
    let params = new HttpParams();
    params = params.append('strDate', this.datePipe.transform(value.strDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    return this.http.get<IOSKC[]>(`${environment.url_api_fib}OSKC/GetListByDateRange/`,{params: params});
  }

  getByCode(code: string) {
    let params = new HttpParams();
    params = params.append('code', code);
    return this.http.get<IOSKC>(`${environment.url_api_fib}OSKC/GetByCode/`,{params: params});
  }

  getListByFiltro(value: OSKCFindByFiltroModel) {
    let params = new HttpParams();
    params = params.append('filtro', value.filtro);
    return this.http.get<IOSKC[]>(`${environment.url_api_fib}OSKC/GetListByFiltro/`,{params: params});
  }

  getOSKCExcel(value: OSKCFindByDateModel){
    let params = new HttpParams();
    params = params.append('strDate', this.datePipe.transform(value.strDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    return this.http.get(`${environment.url_api_fib}OSKC/GetOSKCExcel/`,{params: params, responseType: 'arraybuffer'});
  }
}
