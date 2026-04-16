import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { IDocumentNumberingSeriesSunat, IDocumentNumberingSeriesSunatQuery } from '../../../interfaces/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.interface';
import { DocumentNumberingSeriesSunatFindModel } from '../../../models/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.model';


@Injectable({providedIn: 'root'})
export class DocumentNumberingSeriesSunatService {
  constructor
  (
    private http: HttpClient
  ) { }

  getListSerieDocumento(value: DocumentNumberingSeriesSunatFindModel) {
    let params = new HttpParams();
    params = params.append('idUsuario', value.idUsuario);
    params = params.append('u_BPP_NDTD', value.u_BPP_NDTD);
    params = params.append('u_BPP_NDCD', value.u_BPP_NDCD);
    params = params.append('u_Delivery', value.u_Delivery);
    params = params.append('u_SalesInvoices', value.u_SalesInvoices);
    params = params.append('u_Transfer', value.u_Transfer);
    return this.http.get<IDocumentNumberingSeriesSunatQuery[]>(`${environment.url_api_fib}DocumentNumberingSeriesSunat/GetListSerieDocumento/`,{params: params});
  }

  getNumeroDocumentoByTipoSerie(value: any) {
    let params = new HttpParams();
    params = params.append('u_BPP_NDTD', value.u_BPP_NDTD);
    params = params.append('u_BPP_NDSD', value.u_BPP_NDSD);
    return this.http.get<IDocumentNumberingSeriesSunat>(`${environment.url_api_fib}DocumentNumberingSeriesSunat/GetNumeroDocumentoByTipoSerie/`,{params: params});
  }
}
