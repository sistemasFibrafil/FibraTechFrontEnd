import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IVehiculoSap } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/socio-negocios/vehiculo-sap.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';


@Injectable({providedIn: 'root'})
export class VehiculoSapService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFiltro(value: FilterRequestModel) {
    let params = new HttpParams();
    params = params.append('cod1', value.cod1);
    params = params.append('text1', value.text1);

    return this.http.get<IVehiculoSap[]>(`${environment.url_api_fib}VehiculoSap/GetListByFiltro/`,{params: params});
  }
}
