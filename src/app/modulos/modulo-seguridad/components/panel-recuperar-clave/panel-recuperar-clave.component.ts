import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { UsuarioModel } from '../../models/usuario.model';
import { Subscription } from 'rxjs';
import { Location } from '@angular/common';
import { CifrarDataService } from '../../../../services/cifrar-data.service';
import { SeguridadService } from '../../services/seguridad.service';
import { GlobalsConstantsForm } from '../../../../constants/globals-constants-form';
import { Router } from '@angular/router';
import { SwaCustomService } from '../../../../services/swa-custom.service';
import { LayoutService } from '../../../../services/app.layout.service';
import { UsuarioService } from '../../services/usuario.service';

@Component({
  selector: 'app-seg-panel-recuperar-clave',
  templateUrl: './panel-recuperar-clave.component.html',
  styleUrls: ['./panel-recuperar-clave.component.css']
})
export class PanelRecuperarClaveComponent implements OnInit {

  // Titulo del componente
  titulo = 'Cambiar Contraseña';

  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  maestroForm: FormGroup;

  modelo: UsuarioModel = new UsuarioModel();

  subscription: Subscription;

  constructor(private fb: FormBuilder,
    private readonly location: Location,
              private cifrarDataService: CifrarDataService,
              private usuarioService: UsuarioService,
              private readonly swaCustomService: SwaCustomService,
              private layoutService: LayoutService,
              private router: Router) {
    }

    ngOnInit() {
      this.maestroForm = this.fb.group(
        {
          passwordNueva : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(15), Validators.minLength(6)])),
          passwordNuevaRepita : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(15), Validators.minLength(6)])),
        }
      );
    }

    get dark(): boolean {
      return this.layoutService.config.colorScheme !== 'light';
    }

    onClickSave() {
      var passwordNuevo = this.cifrarDataService.encrypt(this.maestroForm.value.passwordNueva);

      if (this.maestroForm.value.passwordNueva !== this.maestroForm.value.passwordNuevaRepita) {
        this.swaCustomService.swaMsgInfo('Contraseña no son iguales!!!');
        return;
      }

      this.modelo.clave = passwordNuevo;
      this.subscription = new Subscription();
      this.subscription = this.usuarioService.setUpdatePasswordUsuario(this.modelo)
      .subscribe(() =>  {
        this.swaCustomService.swaMsgExito(null);
        this.router.navigate(['/login']);
        },
        (error) => {
          this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      });
    }

    goCancelar() {
      this.location.back();
    }

    ngOnDestroy() {
      if (this.subscription) {
        this.subscription.unsubscribe();
      }
    }

}
