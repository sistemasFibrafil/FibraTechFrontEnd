import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { DocumentSeriesConfigurationCreateModel, DocumentSeriesConfigurationFindModel } from '../models/document-series-configuration.model';

import { IDocumentSeriesConfigurationQuery } from '../interfaces/document-series-configuration.interface';

@Injectable({providedIn: 'root'})
export class DocumentSeriesConfigurationService {
  constructor
  (
    private http: HttpClient
  ){ }

  getById(value: DocumentSeriesConfigurationFindModel) {
    let parametros = new HttpParams();
    parametros = parametros.append('idUsuario', value.idUsuario);
    return this.http.get<IDocumentSeriesConfigurationQuery>(`${environment.url_api_fib}DocumentSeriesConfiguration/GetById/`, { params: parametros });
  }

  setCreate(value: DocumentSeriesConfigurationCreateModel) {
    const param: string = JSON.stringify(value);
    return this.http.post<any>(`${environment.url_api_fib}DocumentSeriesConfiguration/SetCreate/`, param);
  }
}
