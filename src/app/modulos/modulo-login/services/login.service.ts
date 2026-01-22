import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { LoginModel } from '../models/login.model';
import { environment } from '../../../../environments/environment.prod';

import { DataBaseModel } from '../models/data-base.model';
import { IAutenticarRequest, IRecuperarPasswordRequest, IUsuarioToken } from '../interfaces/autenticar.interface';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  constructor(private http: HttpClient) { }

  autentica(login: LoginModel) {
    const url = environment.url_api_fib + 'Autenticar/Autenticar';
    const param: string = JSON.stringify(login);
    return this.http.post(
        url,
        param
    );
  }

  validaToken(login: IUsuarioToken) {
    const url = environment.url_api_fib + 'Autenticar/ValidarToken';
    const param: string = JSON.stringify(login);
    return this.http.put(
        url,
        param
    );
  }

  getDataSociedadAll() {
    return this.http.get<DataBaseModel[]>
    (`${environment.url_api_fib}DataBase/GetAll/`);
  }

  obtienePermisosPorUsuario(login: LoginModel) {
    const url = environment.url_api_fib + 'Autenticar/ObtienePermisosPorUsuario';
    const param: string = JSON.stringify(login);
    return this.http.post(url,param);
  }

  RecuperarPassword(login: IRecuperarPasswordRequest) {
    const url = environment.url_api_fib + 'Autenticar/RecuperarPassword';
    const param: string = JSON.stringify(login);
    return this.http.put(
        url,
        param
    );
  }

  autenticaUsuario(login: IAutenticarRequest) {
    const url = environment.url_api_fib + 'Autenticar/AutenticarCredenciales';
    const param: string = JSON.stringify(login);
    return this.http.post(
        url,
        param
    );
  }
}
