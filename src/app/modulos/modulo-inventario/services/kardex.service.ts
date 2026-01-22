import { DatePipe } from '@angular/common';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { KardexSaldoInicialByPeriodoArticuloFindModel } from '../models/kardex.model';
import { IKardexSaldoInicialByPeriodoArticulo } from '../interfaces/kardex.interface';



@Injectable({providedIn: 'root'})
export class KardexService {
  constructor
  (
    private http: HttpClient,
    private datePipe: DatePipe
  ){ }

  getListKardexSaldoInicialByPeriodoArticulo(value: KardexSaldoInicialByPeriodoArticuloFindModel) {
    let params = new HttpParams();
    params = params.append('periodo', value.periodo);
    params = params.append('itemCode1', value.itemCode1);
    params = params.append('itemCode2', value.itemCode2);

    return this.http.get<IKardexSaldoInicialByPeriodoArticulo[]>(`${environment.url_api_fib}Kardex/GetListKardexSaldoInicialByPeriodoArticulo/`,{params: params});
  }
}
