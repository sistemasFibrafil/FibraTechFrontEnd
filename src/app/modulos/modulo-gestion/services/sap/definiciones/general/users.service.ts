import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IUsers } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/users.interface';


@Injectable({providedIn: 'root'})
export class UsersService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<IUsers[]>(`${environment.url_api_fib}Users/GetList/`);
  }

  getByCode(code: any) {
    var params = new HttpParams();
    params = params.append('USER_CODE', code);
    return this.http.get<IUsers>(`${environment.url_api_fib}Users/GetByCode/`,{params: params});
  }
}
