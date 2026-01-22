import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { IProceso } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/proceso.interface';


@Injectable({providedIn: 'root'})
export class CargaSaldoInicialService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){ }

  getListByFilter(value: any) {
    let params = new HttpParams();
    params = params.append('startDate', this.datePipe.transform(value.startDate, 'yyyy-MM-dd'));
    params = params.append('endDate', this.datePipe.transform(value.endDate, 'yyyy-MM-dd'));
    params = params.append('item', value.item);
    return this.http.get<IProceso[]>(`${environment.url_api_fib}CargaSaldoInicial/GetListByFilter/`,{params: params});
  }
}
