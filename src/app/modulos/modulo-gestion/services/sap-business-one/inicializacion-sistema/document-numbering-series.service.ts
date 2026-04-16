import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { IDocumentNumberingSeries } from '../../../interfaces/sap-business-one/inicializacion-sistema/document-numbering-series.interface';



@Injectable({providedIn: 'root'})
export class DocumentNumberingSeriesService {
  constructor
  (
    private http: HttpClient
  ) { }

  getNumero(value: any) {
    let params = new HttpParams();
    params = params.append('objectCode', value.objectCode);
    params = params.append('docSubType', value.docSubType);
    return this.http.get<IDocumentNumberingSeries>(`${environment.url_api_fib}DocumentNumberingSeries/GetNumero/`,{params: params});
  }
}
