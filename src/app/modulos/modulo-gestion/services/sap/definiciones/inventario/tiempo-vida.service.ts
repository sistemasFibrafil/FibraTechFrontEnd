import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ITiempoVida } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/tiempo-vida.interface';
import { TiempoVidaModel } from 'src/app/modulos/modulo-gestion/models/sap/definiciones/inventario/tiempo-vida.model';



@Injectable({providedIn: 'root'})
export class TiempoVidaService {
  constructor
  (
    private http: HttpClient
  )
  { }

  getList() {
    return this.http.get<ITiempoVida[]>(`${environment.url_api_fib}TiempoVida/GetList`);
  }

  getListByFiltro(value: TiempoVidaModel) {
    let params = new HttpParams();
    params = params.append('name', value.name);
    return this.http.get<ITiempoVida[]>(`${environment.url_api_fib}TiempoVida/GetListByFiltro`, { params: params });
  }
}
