import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IEmployeesInfo } from '../interfaces/employees-info.interface';


@Injectable({providedIn: 'root'})
export class EmployeesInfoService {
  constructor
  (
    private http: HttpClient,
  ) { }

  getList() {
    return this.http.get<IEmployeesInfo[]>(`${environment.url_api_fib}EmployeesInfo/GetList/`);
  }

  getById(id: any) {
    var params = new HttpParams();
    params = params.append('empID', id);
    return this.http.get<IEmployeesInfo>(`${environment.url_api_fib}EmployeesInfo/GetById/`,{params: params});
  }
}
