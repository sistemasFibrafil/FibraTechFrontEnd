import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IBranches } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/branches.interface';


@Injectable({providedIn: 'root'})
export class BranchesService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<IBranches[]>(`${environment.url_api_fib}Branches/GetList/`);
  }
}
