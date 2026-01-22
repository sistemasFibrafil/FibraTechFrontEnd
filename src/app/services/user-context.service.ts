import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Router } from '@angular/router';
import { SessionService } from './session.service';

const defaultUser = null;

@Injectable({
  providedIn: 'root'
})
export class UserContextService {

  public user$ = new BehaviorSubject(defaultUser);

  constructor(private sessionService: SessionService, private router: Router) {

    let data = null;

    if (this.sessionService.getItem('currentUser')) {
      data = this.sessionService.getItemDecrypt('currentUser');
    }

    if ( data != null)
    {
      this.user$.next(data);
    }
  }

  public getIdUsuario(): number {
    return Number(this.sessionService.getItemDecrypt('usuario-id'));
  }

  public getIdPerfil() {
    return Number(this.sessionService.getItemDecrypt('perfil-id'));
  }

  public getIdUserSap(): number {
    return Number(this.sessionService.getItemDecrypt('userSap-id'));
  }

  public getUserSap(): string {
    return this.sessionService.getItemDecrypt('userSap');
  }

  public getIdLocation(): number {
    return Number(this.sessionService.getItemDecrypt('location-id'));
  }

  public getSuperUser(): boolean {
    return Boolean(this.sessionService.getItemDecrypt('superUser'));
  }

  public getIdEmpleado(): number {
    return Number(this.sessionService.getItemDecrypt('empleado-id'));
  }

  public getIdSalesSAP(): number {
    return Number(this.sessionService.getItemDecrypt('sales-sap-id'));
  }

  public getNombreCompletoUsuario(): string {
    return this.sessionService.getItemDecrypt('nombre');
  }

  public getWarehouseDefault(): string {
    return this.sessionService.getItemDecrypt('warehouse-default');
  }

  public getCodigoCentroCosto(): string {
    return this.sessionService.getItemDecrypt('codCentroCosto');
  }

  public getDescripcionCentroCosto(): string {
    return this.sessionService.getItemDecrypt('desCentroCosto');
  }

  public getImagen(): string {
    return this.sessionService.getItemDecrypt('imagen');
  }

  public getEmail(): string {
    return this.sessionService.getItemDecrypt('email');
  }

  public getUsuario() {
    return this.sessionService.getItemDecrypt('usuario');
  }

  public setUser(user: any)
  {
    this.sessionService.setItemEncrypt('currentUser', user);
    this.user$.next(user);
  }

  public getMainCurncy() {
    return this.sessionService.getItemDecrypt('mainCurncy');
  }

  public getSysCurrncy() {
    return this.sessionService.getItemDecrypt('sysCurrncy');
  }

  public getDfltWhs() {
    return this.sessionService.getItemDecrypt('dfltWhs');
  }

  public getWhsCodeSpareParts() {
    return this.sessionService.getItemDecrypt('whsCodeSpareParts');
  }

  public logout()
  {
    this.sessionService.logout();
    this.user$.next(defaultUser);
    this.redirecciona();
  }

  private redirecciona() {
    this.router.navigate(['/login']);
  }
}
