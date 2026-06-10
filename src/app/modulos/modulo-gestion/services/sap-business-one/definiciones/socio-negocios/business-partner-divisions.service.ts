import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IBusinessPartnerDivisions } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/business-partner-divisions.interfce';

@Injectable({providedIn: 'root'})
export class BusinessPartnerDivisionsService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<IBusinessPartnerDivisions[]>(`${environment.url_api_fib}BusinessPartnerDivisions/GetList/`);
  }
}
