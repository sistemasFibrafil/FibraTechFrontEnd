import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ISectorSocioNegocioSap } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/sector-socio-negocio-sap.interface';

@Injectable({providedIn: 'root'})
export class SectorSapService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<ISectorSocioNegocioSap[]>(`${environment.url_api_fib}BusinessPartnerSectors/GetList/`);
  }
}
