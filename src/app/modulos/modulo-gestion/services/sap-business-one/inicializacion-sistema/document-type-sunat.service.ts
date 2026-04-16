import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { IDocumentTypeSunat } from '../../../interfaces/sap-business-one/inicializacion-sistema/document-type-sunat.interface';


@Injectable({providedIn: 'root'})
export class DocumentTypeSunatService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListByType(value: any) {
    let params = new HttpParams();
    params = params.append('u_FIB_ENTR', value.u_FIB_ENTR);
    params = params.append('u_FIB_FAVE', value.u_FIB_FAVE);
    params = params.append('u_FIB_TRAN', value.u_FIB_TRAN);
    return this.http.get<IDocumentTypeSunat[]>(`${environment.url_api_fib}DocumentTypeSunat/GetListByType/`,{params: params});
  }
}
