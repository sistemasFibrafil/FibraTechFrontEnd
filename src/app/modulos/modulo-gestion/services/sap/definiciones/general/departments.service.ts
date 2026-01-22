import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IDepartments } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/departments.interface';


@Injectable({providedIn: 'root'})
export class DepartmentsService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<IDepartments[]>(`${environment.url_api_fib}Departments/GetList/`);
  }
}
