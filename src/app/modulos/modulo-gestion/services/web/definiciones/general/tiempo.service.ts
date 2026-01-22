import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IAnio } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/anio.interface';
import { IMes } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/mes.interface';
import { ISemana } from 'src/app/modulos/modulo-gestion/interfaces/web/definiciones/general/semana.interface';
import { FilterRequestModel } from '../../../../../../models/filter-request.model';

@Injectable({providedIn: 'root'})
export class TiempoService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListAnio() {
    return this.http.get<IAnio[]>(`${environment.url_api_fib}Tiempo/GetListAnio/`);
  }

  getListMes() {
    return this.http.get<IMes[]>(`${environment.url_api_fib}Tiempo/GetListMes/`);
  }

  getListSemana(value:FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('id1', value.id1);
    params = params.append('id2', value.id2);
    return this.http.get<ISemana[]>(`${environment.url_api_fib}Tiempo/GetListSemana/`,  { params: params });
  }
}
