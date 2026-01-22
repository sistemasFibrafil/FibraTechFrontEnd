import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ISocioNegocio } from '../interfaces/socio-segocio.interface';


@Injectable({providedIn: 'root'})
export class SocioNegocioService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('businessPartner', value.businessPartner);
    params = params.append('cardType', value.cardType);
    params = params.append('transType', value.transType);
    return this.http.get<ISocioNegocio[]>(`${environment.url_api_fib}BusinessPartners/GetListByFilter/`,{params: params});
  }

  getByCode(cardCode: string) {
    let params = new HttpParams();
    params = params.append('cardCode', cardCode);
    return this.http.get<ISocioNegocio>(`${environment.url_api_fib}BusinessPartners/GetByCode/`,{params: params});
  }

  getListClienteBySectorStatus(value: any) {
    let params = new HttpParams();
    params = params.append('sector', value.sector);
    params = params.append('status', value.status);
    params = params.append('businessPartner', value.businessPartner);
    return this.http.get<ISocioNegocio[]>(`${environment.url_api_fib}BusinessPartners/GetListClienteBySectorStatus/`,{params: params});
  }

  getClienteBySectorStatusExcel(value: any) {
    let params = new HttpParams();
    params = params.append('sector', value.sector);
    params = params.append('status', value.status);
    params = params.append('businessPartner', value.businessPartner);
    return this.http.get(`${environment.url_api_fib}BusinessPartners/GetClienteBySectorStatusExcel/`,{params: params, responseType: 'arraybuffer'});
  }
}
