import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IStates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/states.interface';


@Injectable({providedIn: 'root'})
export class StatesService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByCountryCode(value: any) {

    let params = new HttpParams();
    params = params.append('countryCode', value.countryCode);
    return this.http.get<IStates[]>(`${environment.url_api_fib}States/GetListByCountryCode/`, { params });
  }
}
