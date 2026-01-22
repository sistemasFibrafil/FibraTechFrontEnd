import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { INumeracionDocumento } from '../../../interfaces/sap/inicializacion-sistema/numeracion-documento.interface';



@Injectable({providedIn: 'root'})
export class NumeracionDocumentoService {
  constructor
  (
    private http: HttpClient
  ) { }

  getNumero(value: any) {
    let params = new HttpParams();
    params = params.append('objectCode', value.objectCode);
    return this.http.get<INumeracionDocumento>(`${environment.url_api_fib}NumeracionDocumento/GetNumero/`,{params: params});
  }
}
