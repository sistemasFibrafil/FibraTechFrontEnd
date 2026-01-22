import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ITipoCambio } from '../../interfaces/sap/tipo-cambio-sap.interface';
import { TipoCambioFindModel } from '../../models/sap/tipo-cambio-sap.model';


@Injectable({providedIn: 'root'})
export class TipoCambioService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getByDocDateAndCurrency(value: TipoCambioFindModel) {
    let params = new HttpParams();
    params = params.append('rateDate', this.datePipe.transform(value.rateDate, 'yyyy-MM-dd'));
    params = params.append('currency', value.currency);
    params = params.append('sysCurrncy', value.sysCurrncy);
    return this.http.get<ITipoCambio>(`${environment.url_api_fib}ExchangeRates/GetByDocDateAndCurrency/`, { params: params });
  }
}
