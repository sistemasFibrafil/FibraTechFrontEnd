import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IImpuestoSap } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/finanzas/impuesto-sap.iterface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';


@Injectable({providedIn: 'root'})
export class ImpuestoSapService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('text1', value.text1);

    return this.http.get<IImpuestoSap[]>(`${environment.url_api_fib}TaxGroups/GetListByFilter/`, { params: params });
  }

  getBySplCode(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('id1', value.id1.toString());
    return this.http.get<IImpuestoSap>(`${environment.url_api_fib}TaxGroups/GetBySplCode/`, { params: params });
  }
}
