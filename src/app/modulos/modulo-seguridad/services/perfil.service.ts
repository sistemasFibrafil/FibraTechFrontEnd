import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UserContextService } from 'src/app/services/user-context.service';
import { VariablesGlobales } from '../../../interface/variables-globales';
import { PerfilModel } from '../models/pefil.model';

@Injectable({providedIn: 'root'})
export class PerfilService {
  constructor
  (
    private http: HttpClient,
    private userContextService: UserContextService
  ){ }

  getList() {
    return this.http.get<PerfilModel[]>(`${environment.url_api_fib}Perfil/GetList/`);
  }

  getListByFilter(value: PerfilModel) {
    let parametros = new HttpParams();
    parametros = parametros.append('descripcionPerfil', value.descripcionPerfil);
    return this.http.get<PerfilModel[]>(`${environment.url_api_fib}Perfil/GetAll/`, { params: parametros });
  }

  setCreate(value: PerfilModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Perfil/Create';
    const param: string = JSON.stringify(value);
    return this.http.post(url,param);
  }

  setUpdate(value: PerfilModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Perfil/Update';
    const param: string = JSON.stringify(value);
    return this.http.put(url,param);
  }


  setDelete(value: PerfilModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Perfil/Delete';
    const param: string = JSON.stringify(value);
    return this.http.patch(url,param);
  }
}
