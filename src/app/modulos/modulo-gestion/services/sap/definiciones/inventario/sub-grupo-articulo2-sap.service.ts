import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { ISubGrupoArticulo2 } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/grupo-articulo-sap.interface';
import { SubGrupoArticuloModel } from 'src/app/modulos/modulo-gestion/models/sap/definiciones/inventario/sub-grupo-articulo.model';



@Injectable({providedIn: 'root'})
export class SubGrupoArticulo2Service {
  constructor
  (
    private http: HttpClient
  ) { }

  getList() {
    return this.http.get<ISubGrupoArticulo2[]>(`${environment.url_api_fib}SubGrupoArticulo2Sap/GetList/`);
  }
}
