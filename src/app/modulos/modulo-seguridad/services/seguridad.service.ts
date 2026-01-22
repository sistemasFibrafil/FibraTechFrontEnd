import { Injectable } from '@angular/core';
import { MenuModel } from '../models/menu.model';
import { OpcionModel } from '../models/opcion.model';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

import { OpcionPorPerfilModel } from '../models/opcion-por-perfil';
import { UserContextService } from '../../../services/user-context.service';
import { ParametroSistemaModel } from '../models/parametro-sistema.model';
import { ParametroConexionModel } from '../models/parametro-conexion.model';
import { VariablesGlobales } from '../../../interface/variables-globales';


@Injectable({
  providedIn: 'root'
})
export class SeguridadService {
  constructor
  (
    private http: HttpClient,
    private userContextService: UserContextService
  ) {}

  getMenuAll() {
    return this.http.get<MenuModel[]>(`${environment.url_api_fib}Menu/GetAll/`);
  }
  setInsertMenu(value: MenuModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Menu/Create';
    const param: string = JSON.stringify(value);
    return this.http.post(url,param);
  }
  setUpdateMenu(value: MenuModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Menu/Update';
    const param: string = JSON.stringify(value);
    return this.http.put(url,param);
  }

  getOpcion(idMenu: number) {
    let parametros = new HttpParams();
    parametros = parametros.append('idMenu', idMenu.toString());

    return this.http.get<OpcionModel[]>(`${environment.url_api_fib}Opcion/GetAll/`, { params: parametros });
  }
  setInsertOpcion(value: OpcionModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Opcion/Create';
    const param: string = JSON.stringify(value);
    return this.http.post(url,param);
  }
  setUpdateOpcion(value: OpcionModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Opcion/Update';
    const param: string = JSON.stringify(value);
    return this.http.put(url,param);
  }
  setDeleteOpcion(value: OpcionModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'Opcion/Delete';
    const param: string = JSON.stringify(value);
    return this.http.patch(url,param);
  }
  
  getSeleccionadoOpcionPorPerfil(idMenu: number, idPerfil: number) {
    let parametros = new HttpParams();
    parametros = parametros.append('idMenu', idMenu.toString());
    parametros = parametros.append('idPerfil', idPerfil.toString());

    return this.http.get<OpcionPorPerfilModel[]>(`${environment.url_api_fib}OpcionPorPerfil/GetAllSeleccionado/`, { params: parametros });
  }
  getPorSeleccionarOpcionPorPerfil(idMenu: number, idPerfil: number) {
    let parametros = new HttpParams();
    parametros = parametros.append('idMenu', idMenu.toString());
    parametros = parametros.append('idPerfil', idPerfil.toString());

    return this.http.get<OpcionPorPerfilModel[]>
    (`${environment.url_api_fib}OpcionPorPerfil/GetAllPorSeleccionar/`, { params: parametros });
  }
  setInsertOpcionPorPerfil(value: OpcionPorPerfilModel[]) {
    const url = environment.url_api_fib + 'OpcionPorPerfil/Create';
    const param: string = JSON.stringify(value);
    return this.http.post(url,param);
  }
  setDeleteOpcionPorPerfil(value: OpcionPorPerfilModel[]) {
    const url = environment.url_api_fib + 'OpcionPorPerfil/Delete';
    const param: string = JSON.stringify(value);
    return this.http.patch(url,param);
  }

  getParametroSistemaPorId() {
    return this.http.get<ParametroSistemaModel>(`${environment.url_api_fib}ParametroSistema/GetbyIdParametroSistema/${0}`);
  }

  getParametroConexionPorId() {
    return this.http.get<ParametroConexionModel>(`${environment.url_api_fib}ParametroConexion/GetbyIdParametroConexion/${0}`);
  }

  setInsertParametroConexion(value: ParametroConexionModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'ParametroConexion/Create';
    const param: string = JSON.stringify(value);
    return this.http.post(url,param);
  }

  setUpdateParametroConexion(value: ParametroConexionModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'ParametroConexion/Update';
    const param: string = JSON.stringify(value);
    return this.http.put(url,param);
  }

  setInsertParametroSistema(value: ParametroSistemaModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'ParametroSistema/Create';
    const param: string = JSON.stringify(value);
    return this.http.post(url,param);
  }

  setUpdateParametroSistema(value: ParametroSistemaModel) {
    value.regUsuario = this.userContextService.getIdUsuario();
    value.regEstacion = VariablesGlobales._DISPOSITIVO.nombreDispositivo;
    const url = environment.url_api_fib + 'ParametroSistema/Update';
    const param: string = JSON.stringify(value);
    return this.http.put(url,param);
  }


  getAuditoriaPorFiltro(modelo: any) {
    let parametros = new HttpParams();
    parametros = parametros.append('idTransaccional', modelo.idTransaccional);
    parametros = parametros.append('tabla', modelo.tabla);
    parametros = parametros.append('campo', modelo.campo);
    return this.http.get<any[]>(`${environment.url_api_fib}Auditoria/GetAll/`, { params: parametros });
  }
}
