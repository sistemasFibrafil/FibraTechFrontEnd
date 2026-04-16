import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';



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
