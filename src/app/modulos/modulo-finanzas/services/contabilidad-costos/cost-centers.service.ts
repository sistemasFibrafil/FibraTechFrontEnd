import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ICostCenters } from '../../interfaces/contabilidad-costos/cost-centers.interface';


@Injectable({providedIn: 'root'})
export class CostCentersService {
  constructor
  (
    private http: HttpClient,
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('costCenter', value.costCenter);
    params = params.append('active', value.active);
    return this.http.get<ICostCenters[]>(`${environment.url_api_fib}CostCenters/GetListByFilter/`, { params: params });
  }
}
