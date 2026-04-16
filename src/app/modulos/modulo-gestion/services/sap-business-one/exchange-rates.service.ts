import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ExchangeRatesFindModel } from '../../models/sap-business-one/exchange-rates.model';
import { IExchangeRates } from '../../interfaces/sap-business-one/exchange-rates.interface';



@Injectable({providedIn: 'root'})
export class ExchangeRatesService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ) { }

  getByDocDateAndCurrency(value: ExchangeRatesFindModel) {
    let params = new HttpParams();
    params = params.append('rateDate', this.datePipe.transform(value.rateDate, 'yyyy-MM-dd'));
    params = params.append('currency', value.currency);
    params = params.append('sysCurrncy', value.sysCurrncy);

    return this.http.get<IExchangeRates>(`${environment.url_api_fib}ExchangeRates/GetByDocDateAndCurrency/`, { params: params });
  }
}
