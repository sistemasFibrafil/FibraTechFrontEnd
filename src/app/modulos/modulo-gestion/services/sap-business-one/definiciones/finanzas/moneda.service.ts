import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IMoneda } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/finanzas/moneda.interface';

@Injectable({providedIn: 'root'})
export class MonedaService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<IMoneda[]>(`${environment.url_api_fib}CurrencyCodes/GetList/`);
  }

  getListByCode(currCode: string) {
    let params = new HttpParams();
        params = params.append('currCode', currCode);
    return this.http.get<IMoneda[]>(`${environment.url_api_fib}CurrencyCodes/GetListByCode/`, { params });
  }
}
