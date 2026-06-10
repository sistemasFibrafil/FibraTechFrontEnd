import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ICurrencyCodes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/currency-codes.interface';

@Injectable({providedIn: 'root'})
export class CurrencyCodesService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<ICurrencyCodes[]>(`${environment.url_api_fib}CurrencyCodes/GetList/`);
  }

  getListByCode(currCode: string) {
    let params = new HttpParams();
    params = params.append('currCode', currCode);
    return this.http.get<ICurrencyCodes[]>(`${environment.url_api_fib}CurrencyCodes/GetListByCode/`, { params });
  }
}
