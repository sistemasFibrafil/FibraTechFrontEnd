import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IBusinessPartnerGroupsUserTable } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/business-partner-groups-user-table.interface';


@Injectable({providedIn: 'root'})
export class BusinessPartnerGroupsUserTableService {
  constructor
  (
    private http: HttpClient
  ) { }

  getByCode(value: any) {
    let params = new HttpParams();
    params = params.append('code', value.code);
    return this.http.get<IBusinessPartnerGroupsUserTable>(`${environment.url_api_fib}BusinessPartnerGroupsUserTable/GetByCode/`,{params: params});
  }
}
