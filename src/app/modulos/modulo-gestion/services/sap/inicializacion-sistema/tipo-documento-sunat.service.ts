import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ITipoDocumentoSunat } from '../../../interfaces/sap/inicializacion-sistema/tipo-documento-sunat.interface';


@Injectable({providedIn: 'root'})
export class TipoDocumentoSunatService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByTipo(value: any) {
    let params = new HttpParams();
    params = params.append('u_FIB_TDTD', value.u_FIB_TDTD);
    return this.http.get<ITipoDocumentoSunat[]>(`${environment.url_api_fib}TipoDocumentoSunat/GetListByTipo/`,{params: params});
  }
}
