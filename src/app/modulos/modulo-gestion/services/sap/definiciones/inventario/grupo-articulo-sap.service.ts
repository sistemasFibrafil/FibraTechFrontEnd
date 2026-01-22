import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { IGrupoArticulo } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/grupo-articulo-sap.interface';


@Injectable({providedIn: 'root'})
export class GrupoArticuloService {
  constructor(
    private http: HttpClient) { }

  getList() {
    return this.http.get<IGrupoArticulo[]>(`${environment.url_api_fib}ItemGroups/GetList/`);
  }
}
