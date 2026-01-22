import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ITipoOperacion } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/tipo-operacion-interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';



@Injectable({providedIn: 'root'})
export class TipoOperacionSapService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('tipoOperacion', value.tipoOperacion);
    return this.http.get<ITipoOperacion[]>(`${environment.url_api_fib}TipoOperacion/GetListByFilter/`,{params: params});
  }
}
