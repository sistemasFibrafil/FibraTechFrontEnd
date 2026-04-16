import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IUsers } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/users.interface';


@Injectable({providedIn: 'root'})
export class UsersService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<IUsers[]>(`${environment.url_api_fib}Users/GetList/`);
  }

  getListByFilter(value: any) {
    var params = new HttpParams();
    params = params.append('searchText', value.searchText);

    return this.http.get<IUsers>(`${environment.url_api_fib}Users/GetListByFilter/`,{params: params});
  }

  getByCode(code: any) {
    var params = new HttpParams();
    params = params.append('userCode', code);

    return this.http.get<IUsers>(`${environment.url_api_fib}Users/GetByCode/`,{params: params});
  }
}
