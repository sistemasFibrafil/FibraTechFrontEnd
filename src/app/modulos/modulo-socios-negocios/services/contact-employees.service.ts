import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IContactEmployees } from '../interfaces/contact-employees.interface';

@Injectable({providedIn: 'root'})
export class ContactEmployeesService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('cardCode', value.cardCode);
    params = params.append('searchText', value.searchText);

    return this.http.get<IContactEmployees[]>(`${environment.url_api_fib}ContactEmployees/GetListByFilter/`,{params: params});
  }

  getById(value: any) {
    let params = new HttpParams();
    params = params.append('cardCode', value.cardCode);
    params = params.append('cntctCode', value.cntctCode);

    return this.http.get<IContactEmployees>(`${environment.url_api_fib}ContactEmployees/GetById/`,{params: params});
  }
}
