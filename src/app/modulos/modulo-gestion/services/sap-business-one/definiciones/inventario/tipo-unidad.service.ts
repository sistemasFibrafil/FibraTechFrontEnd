import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ITipoLaminado } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/tipo-laminado.interface';
import { TipoLaminadoModel } from 'src/app/modulos/modulo-gestion/models/sap-business-one/definiciones/inventario/tipo-laminado.model';




@Injectable({providedIn: 'root'})
export class TipoLaminadoService {
  constructor
  (
    private http: HttpClient
  )
  { }

  getList() {
    return this.http.get<ITipoLaminado[]>(`${environment.url_api_fib}TipoLaminado/getList`);
  }

  getListByFiltro(value: TipoLaminadoModel) {
    let params = new HttpParams();
    params = params.append('name', value.name);
    return this.http.get<ITipoLaminado[]>(`${environment.url_api_fib}TipoLaminado/GetListByFiltro`, { params: params });
  }
}
