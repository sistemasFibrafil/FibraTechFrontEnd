import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ILocal } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/ventas/local.interface';
import { LocalModel } from 'src/app/modulos/modulo-gestion/models/web/definiciones/ventas/local.model';
import { FilterRequestModel } from 'src/app/models/filter-request.model';



@Injectable({providedIn: 'root'})
export class LocalService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('text1', value.text1);

    return this.http.get<ILocal[]>(`${environment.url_api_fib}Local/GetListByFiltro/`,{params: params});
  }

  getByNumLocal(numLocal: string) {
    return this.http.get<ILocal>(`${environment.url_api_fib}Local/GetByNumLocal/${numLocal}`);
  }

  setCreate(value: LocalModel) {
    const param: string = JSON.stringify(value);
    return this.http.post(`${environment.url_api_fib}Local/SetCreate/`, param);
  }

  setUpdate(value: LocalModel) {
    const param: string = JSON.stringify(value);
    return this.http.put(`${environment.url_api_fib}Local/SetUpdate/`, param);
  }

  setDelete(numLocal: number) {
    return this.http.delete<ILocal>(`${environment.url_api_fib}Local/SetDelete/${numLocal}`);
  }
}
