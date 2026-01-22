import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/sales-persons.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';



@Injectable({providedIn: 'root'})
export class SalesPersonsService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<ISalesPersons[]>(`${environment.url_api_fib}SalesPersons/GetList/`);
  }

  getListByFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('slpName', value.text1);
    return this.http.get<ISalesPersons[]>(`${environment.url_api_fib}SalesPersons/GetListByFiltro/`, {params: params});
  }

  getByCode(id: number) {
    return this.http.get<ISalesPersons>(`${environment.url_api_fib}SalesPersons/GetById/${id}`);
  }
}
