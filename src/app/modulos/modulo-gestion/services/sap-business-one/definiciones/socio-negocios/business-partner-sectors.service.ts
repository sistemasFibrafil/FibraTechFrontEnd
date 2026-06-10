import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { IBusinessPartnerSectors } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/business-partner-sectors.interface';

@Injectable({providedIn: 'root'})
export class BusinessPartnerSectorsService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<IBusinessPartnerSectors[]>(`${environment.url_api_fib}BusinessPartnerSectors/GetList/`);
  }
}
