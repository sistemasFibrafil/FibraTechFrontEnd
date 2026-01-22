import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ICondicionPago } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/socio-negocios/condicion-pago-sap.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';


@Injectable({providedIn: 'root'})
export class CondicionPagoService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<ICondicionPago[]>(`${environment.url_api_fib}PaymentTermsTypes/GetList/`);
  }
}
