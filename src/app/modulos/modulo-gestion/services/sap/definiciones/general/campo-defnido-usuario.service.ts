import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { CampoDefinidoUsuarioFilterModel, CampoDefinidoUsuarioFindModel } from 'src/app/modulos/modulo-gestion/models/sap/definiciones/general/campo-defnido-usuario.model';
import { ICampoDefnidoUsuario } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/campo-definido-usuario.interface';



@Injectable({providedIn: 'root'})
export class CamposDefinidoUsuarioService {
  constructor
  (
    private http: HttpClient
  ) { }

  getList(value: CampoDefinidoUsuarioFindModel) {
    let params = new HttpParams();
    params = params.append('tableID', value.tableID);
    params = params.append('aliasID', value.aliasID);
    return this.http.get<ICampoDefnidoUsuario[]>(`${environment.url_api_fib}UserDefinedFields/GetList/`,{params: params});
  }

  getListByFilter(value: CampoDefinidoUsuarioFilterModel) {
    let params = new HttpParams();
    params = params.append('userDefinedFields', value.userDefinedFields);
    params = params.append('tableID', value.tableID);
    params = params.append('aliasID', value.aliasID);
    return this.http.get<ICampoDefnidoUsuario[]>(`${environment.url_api_fib}UserDefinedFields/GetListByFilter/`,{params: params});
  }
}
