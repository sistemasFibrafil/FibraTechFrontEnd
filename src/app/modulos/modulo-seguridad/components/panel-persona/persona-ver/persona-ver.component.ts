import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subscription } from 'rxjs';
import { SeguridadService } from '../../../services/seguridad.service';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { CifrarDataService } from '../../../../../services/cifrar-data.service';
import { UserContextService } from '../../../../../services/user-context.service';
import { UsuarioModel } from '../../../models/usuario.model';
import { UsuarioService } from '../../../services/usuario.service';

@Component({
  selector: 'app-seg-persona-ver',
  templateUrl: './persona-ver.component.html',
  styleUrls: ['./persona-ver.component.css']
})
export class PersonaVerComponent implements OnInit, OnDestroy {

  // Titulo del componente
  titulo = 'Usuario';

  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  modeloForm: FormGroup;

  modelo: UsuarioModel = new UsuarioModel();

  idUsuario: number;
  // Imagen
  sellersPermitString: string;
  sellersPermitFile;
  subscription: Subscription;

  constructor
  (
      private fb: FormBuilder,
      public app: LayoutComponent,
      private seguridadService: SeguridadService,
      private usuarioService: UsuarioService,
      private readonly cifrarDataService: CifrarDataService,
      private readonly userContextService: UserContextService
  ) {}

  ngOnInit() {
    //this.idUsuario = this.userContextService.getIdEmpleado();
    this.getToObtienePersonaPorId();

    this.modeloForm = this.fb.group(
      {
        'apellidoPaterno' : new FormControl('', Validators.compose(
          [Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'apellidoMaterno' : new FormControl('', Validators.compose(
          [Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'nombre' : new FormControl('', Validators.compose(
          [Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'numeroDocumento' : new FormControl('', Validators.compose([Validators.required])),
        'numeroTelefono' : new FormControl(''),
        'activo' : new FormControl(true, Validators.compose([Validators.required])),
        'codCentroCosto' : new FormControl({value: '', disabled: true}, Validators.compose([Validators.required])),
        'desCentroCosto' : new FormControl('', Validators.compose([Validators.required])),
        'usuario' : new FormControl({value: '', disabled: true}, Validators.compose(
          [Validators.required, Validators.maxLength(20), Validators.minLength(2)])),
        'password' : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(15), Validators.minLength(6)])),
        'email' : new FormControl('', Validators.compose([Validators.required, Validators.email])),
        'perfil' : new FormControl('', Validators.compose([Validators.required])),
        'foto' : new FormControl('')
      }
    );
  }

  getToObtienePersonaPorId() {
    this.subscription = new Subscription();
    this.subscription = this.usuarioService.getById(this.idUsuario)
    .subscribe(data => {
      this.modelo = data;
      this.modeloForm.controls['apellidoPaterno'].setValue(this.modelo.apellidoPaterno);
      this.modeloForm.controls['apellidoMaterno'].setValue(this.modelo.apellidoMaterno);
      this.modeloForm.controls['nombre'].setValue(this.modelo.nombre);
      this.modeloForm.controls['numeroDocumento'].setValue(this.modelo.nroDocumento);
      this.modeloForm.controls['numeroTelefono'].setValue(this.modelo.nroTelefono);
      this.modeloForm.controls['activo'].setValue(this.modelo.activo);
      this.modeloForm.controls['usuario'].setValue(this.modelo.usuario);
      this.modeloForm.controls['password'].setValue(this.cifrarDataService.decrypt(this.modelo.clave));
      this.modeloForm.controls['email'].setValue(this.modelo.email);
      this.modeloForm.controls['perfil'].setValue(this.modelo.descripcionPerfil)
      this.modeloForm.controls['foto'].setValue(this.modelo.imagen);
      this.sellersPermitString = this.modelo.imagen;
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
