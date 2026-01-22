import { Component, OnDestroy, ViewChild, Input } from '@angular/core';
import { LayoutService } from '../../services/app.layout.service';
import { UserContextService } from '../../services/user-context.service';
import { Subscription } from 'rxjs';
import { TopbarComponent } from '../topbar/topbar.component';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profilesidebar',
  templateUrl: './profilesidebar.component.html',
  styleUrls: ['./profilesidebar.component.scss']
})
export class ProfilesidebarComponent implements OnDestroy {

  isCountNotification: number;
  isUserName: string;
  isUserEmail: string;
  isUserImage: string;

  subscription$: Subscription;

  @ViewChild(TopbarComponent) appTopbar!: TopbarComponent;

  constructor(
    public layoutService: LayoutService,
    private readonly router: Router,
    private readonly userContextService: UserContextService) {
    this.onInicializar();
  }

  get visible(): boolean {
      return this.layoutService.state.profileSidebarVisible;
  }

  set visible(_val: boolean) {
      this.layoutService.state.profileSidebarVisible = _val;
  }

  onInicializar() {
    this.isCountNotification = 0;
    this.isUserName = this.userContextService.getNombreCompletoUsuario();
    this.isUserEmail = this.userContextService.getEmail();
    this.isUserImage = this.userContextService.getImagen();
  }

  goLogout(event) {
    event.preventDefault();
    // 🔴 ESTA LÍNEA ES LA SOLUCIÓN
    this.layoutService.resetLayout();
    this.userContextService.logout();
  }

  goCambiarContrasena() {
    this.router.navigate(['panel-recuperar-clave']);
  }

  goPerfil() {

  }

  ngOnDestroy(){

    if (this.subscription$) {
      this.subscription$.unsubscribe();
    }
  }

}
