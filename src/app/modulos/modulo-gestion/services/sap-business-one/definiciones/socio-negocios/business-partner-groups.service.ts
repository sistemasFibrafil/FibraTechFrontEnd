import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IBusinessPartnerGroups } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/business-partner-groups.interface';


@Injectable({providedIn: 'root'})
export class BusinessPartnerGroupsService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByGroupType(value: any) {
    let params = new HttpParams();
    params = params.append('groupType', value.groupType);
    return this.http.get<IBusinessPartnerGroups[]>(`${environment.url_api_fib}BusinessPartnerGroups/GetListByGroupType/`,{params: params});
  }
}
