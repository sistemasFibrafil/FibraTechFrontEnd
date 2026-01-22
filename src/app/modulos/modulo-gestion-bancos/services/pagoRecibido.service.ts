import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';

import { ICobranzaCarteraVencidaByFilter } from '../interfaces/pago-recibido.interface';
import { PagoRecibidoByFilterFindModel } from '../models/pago-recibido.model';



@Injectable({providedIn: 'root'})
export class PagoRecibidoService {
  constructor(
    private http: HttpClient,
    private datePipe: DatePipe) { }

  getListCobranzaCarteraVencidaByFilter(value: PagoRecibidoByFilterFindModel) {
    let params = new HttpParams();
    params = params.append('courtDate', this.datePipe.transform(value.courtDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('customer', value.customer || '');

    return this.http.get<ICobranzaCarteraVencidaByFilter[]>(`${environment.url_api_fib}PagoRecibido/GetListCobranzaCarteraVencidaByFilter/`,{params: params});
  }

  getCobranzaCarteraVencidaByFilterExcel(value: PagoRecibidoByFilterFindModel){
    let params = new HttpParams();
    params = params.append('courtDate', this.datePipe.transform(value.courtDate, 'yyyy-MM-dd'));
    params = params.append('businessPartnerGroup', value.businessPartnerGroup);
    params = params.append('customer', value.customer || '');

    return this.http.get(`${environment.url_api_fib}PagoRecibido/GetCobranzaCarteraVencidaByFilterExcel/`,{params: params, responseType: 'arraybuffer'});
  }
}
