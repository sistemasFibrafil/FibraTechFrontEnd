import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { ITaxGroups } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/impuesto-sap.iterface';


@Injectable({providedIn: 'root'})
export class TaxGroupsService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('text1', value.text1);

    return this.http.get<ITaxGroups[]>(`${environment.url_api_fib}TaxGroups/GetListByFilter/`, { params: params });
  }

  getByCardCode(value: any) {
    let params = new HttpParams();
    params = params.append('cardCode', value.cardCode);
    params = params.append('address', value.address);
    params = params.append('slpCode', value.slpCode);

    return this.http.get<ITaxGroups>(`${environment.url_api_fib}TaxGroups/GetByCardCode/`, { params: params });
  }
}
