import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IChartOfAccounts } from '../interfaces/chart-of-accounts.interface';


@Injectable({providedIn: 'root'})
export class ChartOfAccountsService {
  constructor
  (
    private http: HttpClient,
  ) { }

  getListByFilter(values: any) {
    var params = new HttpParams();
    params = params.append('accountingAccount', values.accountingAccount);
    return this.http.get<IChartOfAccounts[]>(`${environment.url_api_fib}ChartOfAccounts/GetListByFilter/`, { params: params });
  }

  getById(id: any) {
    var params = new HttpParams();
    params = params.append('acctCode', id);
    return this.http.get<IChartOfAccounts>(`${environment.url_api_fib}ChartOfAccounts/GetById/`,{params: params});
  }
}
