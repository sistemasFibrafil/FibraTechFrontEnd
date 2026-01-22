import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { INumeracionDocumentoSunat } from 'src/app/modulos/modulo-gestion/interfaces/sap/inicializacion-sistema/numeracion-documento-sunat.interface';


@Injectable({providedIn: 'root'})
export class NumeracionDocumentoSunatService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListSerieDocumento(value: any) {
    let params = new HttpParams();
    params = params.append('u_BPP_NDTD', value.u_BPP_NDTD);
    params = params.append('u_BPP_NDCD', value.u_BPP_NDCD);
    params = params.append('u_FIB_TDED', value.u_FIB_TDED);
    params = params.append('u_FIB_TDTD', value.u_FIB_TDTD);
    params = params.append('u_FIB_SEDE', value.u_FIB_SEDE);
    return this.http.get<INumeracionDocumentoSunat[]>(`${environment.url_api_fib}NumeracionDocumentoSunat/GetListSerieDocumento/`,{params: params});
  }
  
  getNumeroDocumentoByTipoSerie(value: any) {
    let params = new HttpParams();
    params = params.append('u_BPP_NDTD', value.u_BPP_NDTD);
    params = params.append('u_BPP_NDSD', value.u_BPP_NDSD);
    return this.http.get<INumeracionDocumentoSunat>(`${environment.url_api_fib}NumeracionDocumentoSunat/GetNumeroDocumentoByTipoSerie/`,{params: params});
  }
}
