import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment.prod';
import { HttpClient, HttpParams } from '@angular/common/http';
import { UsuarioModel } from '../models/usuario.model';
import { UserContextService } from 'src/app/services/user-context.service';
import { VariablesGlobales } from '../../../interface/variables-globales';

@Injectable({providedIn: 'root'})
export class UsuarioService {
  constructor
  (
    private http: HttpClient,
    private userContextService: UserContextService
  ){ }

  getList() {
    return this.http.get<UsuarioModel[]>(`${environment.url_api_fib}Usuario/GetList/`);
  }

  getListByFilter(value: any) {
    let parametros = new HttpParams();
    parametros = parametros.append('filter', value.filter);
    return this.http.get<UsuarioModel[]>(`${environment.url_api_fib}Usuario/GetListByFilter/`, { params: parametros });
  }

  getById(id: number) {
    return this.http.get<UsuarioModel>(`${environment.url_api_fib}Usuario/GetById/${id}`);
  }

  setCreate(value: UsuarioModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Usuario/SetCreate';
    const param: string = JSON.stringify(value);
    return this.http.post(url,param);
  }

  setUpdate(value: UsuarioModel) {
      value.regUsuario = this.userContextService.getIdUsuario();
      value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
      const url = environment.url_api_fib + 'Usuario/SetUpdate';
      const param: string = JSON.stringify(value);
      return this.http.put(url,param);
    }
    setDelete(value: UsuarioModel) {
      value.regUsuario = this.userContextService.getIdUsuario();
      value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
      const url = environment.url_api_fib + 'Usuario/SetDelete';
      const param: string = JSON.stringify(value);
      return this.http.patch(url,param);
    }

  setUpdatePasswordUsuario(value: UsuarioModel) {
    value.idUsuario = this.userContextService.getIdUsuario();
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Usuario/SetUpdatePassword';
    const param: string = JSON.stringify(value);
    return this.http.put(url,param);
  }
}
