import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { ISubGrupoArticulo } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/grupo-articulo-sap.interface';
import { SubGrupoArticuloModel } from 'src/app/modulos/modulo-gestion/models/sap-business-one/definiciones/inventario/sub-grupo-articulo.model';



@Injectable({providedIn: 'root'})
export class SubGrupoItemsService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<ISubGrupoArticulo[]>(`${environment.url_api_fib}SubGrupoArticuloSap/GetList/`);
  }

  getListByFiltro(vale: SubGrupoArticuloModel) {
    let params = new HttpParams();
        params = params.append('name', vale.name);
    return this.http.get<ISubGrupoArticulo[]>(`${environment.url_api_fib}SubGrupoArticuloSap/GetListByFiltro/`, {params: params});
  }
}
