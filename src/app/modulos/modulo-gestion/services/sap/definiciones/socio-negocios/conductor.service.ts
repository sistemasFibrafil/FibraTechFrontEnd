import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IConductorSap } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/socio-negocios/conductor-sap.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';



@Injectable({providedIn: 'root'})
export class ConductorSapService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('cod1', value.cod1);
    params = params.append('text1', value.text1);
    return this.http.get<IConductorSap[]>(`${environment.url_api_fib}ConductorSap/GetListByFiltro/`,{params: params});
  }
}
