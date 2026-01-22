import { SelectItem } from 'primeng/api';
import { Subscription, forkJoin } from 'rxjs';
import { PerfilModel } from '../../../models/pefil.model';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { ConstantesGenerales } from 'src/app/constants/Constantes-generales';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { UsuarioModel } from '../../../models/usuario.model';
import { ParametroSistemaModel } from '../../../models/parametro-sistema.model';

import { PerfilService } from '../../../services/perfil.service';
import { UtilService } from '../../../../../services/util.service';
import { UsuarioService } from '../../../services/usuario.service';
import { SeguridadService } from '../../../services/seguridad.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { CifrarDataService } from '../../../../../services/cifrar-data.service';
import { UsersService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/users.service';


@Component({
  selector: 'app-seg-persona-update',
  templateUrl: './persona-update.component.html',
  styleUrls: ['./persona-update.component.css']
})
export class PersonaUpdateComponent implements OnInit, OnDestroy {

  // Titulo del componente
  titulo = 'Usuario';

  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  modeloForm: FormGroup;

  modelo: UsuarioModel = new UsuarioModel();
  modeloSistema: ParametroSistemaModel = new ParametroSistemaModel();
  modeloPerfil: PerfilModel = new PerfilModel();

  themes: any[];

  userSapList: SelectItem[] = [];
  perfilList: SelectItem[] = [];

  idUsuario: number;
  private combosLoaded: boolean = false;

  // Imagen
  sellersPermitString: string;
  sellersPermitFile;

  subscription: Subscription;
  isHabilitarView: boolean;

  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    private usersService: UsersService,
    private seguridadService: SeguridadService,
    private perfilService: PerfilService,
    private readonly route: ActivatedRoute,
    private readonly utilService: UtilService,
    private readonly usuarioService: UsuarioService,
    private readonly swaCustomService: SwaCustomService,
    private readonly cifrarDataService: CifrarDataService,
  ) {}

  ngOnInit() {
    this.themes = [
      {label: 'green'}
    ];
    this.onBuildForm();
    this.onBuildColumn();
    // Cargar combos en paralelo y luego obtener parámetros del sistema
    forkJoin({
      users: this.usersService.getList(),
      perfiles: this.perfilService.getList()
    }).subscribe({
      next: (result: any) => {
        // Procesar sedes
        if (result.users) {
          this.userSapList = [];
          for (let item of result.users) {
            this.userSapList.push({ label: item.u_NAME, value: item.userid });
          }
        }

        // Procesar perfiles
        if (result.perfiles) {
          this.perfilList = [];
          for (let item of result.perfiles) {
            this.perfilList.push({ label: item.descripcionPerfil, value: item.idPerfil });
          }
        }

        // Finalmente obtener parámetros del sistema
        this.onObtieneRegistro();

        // Marcar combos cargados y, si ya tenemos idUsuario, obtener la persona
        this.combosLoaded = true;
        if (this.idUsuario) {
          this.getToObtienePersonaPorId();
        }
      },
      error: (e) => {
        this.swaCustomService.swaMsgError(e?.error?.resultadoDescripcion || e?.message || 'Error cargando datos iniciales.');
        // Aun en caso de error, intentar obtener los parámetros para no bloquear la pantalla
        this.onObtieneRegistro();
      }
    });


    this.route.params.subscribe((params: Params) => {
      this.idUsuario = params['id'];
      // Si los combos ya fueron cargados, obtener la persona inmediatamente;
      // si no, la llamada se realizará cuando termine el forkJoin (ver arriba).
      if (this.combosLoaded) {
        this.getToObtienePersonaPorId();
      }
    });
  }

 onBuildForm() {
    this.modeloForm = this.fb.group(
      {
        'apellidoPaterno' : new FormControl(this.modelo.apellidoPaterno, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'apellidoMaterno' : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'nombre' : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'numeroDocumento' : new FormControl('', Validators.compose([Validators.required])),
        'numeroTelefono' : new FormControl(''),
        'userSap' : new FormControl('', Validators.compose([Validators.required])),
        'activo' : new FormControl(true, Validators.compose([Validators.required])),
        'usuario' : new FormControl({value: '', disabled: true}, Validators.compose([Validators.required, Validators.maxLength(20), Validators.minLength(2)])),
        'password' : new FormControl('', Validators.compose([Validators.maxLength(15), Validators.minLength(6)])),
        'email' : new FormControl('', Validators.compose([Validators.required, Validators.email])),
        'perfil' : new FormControl(''),
        'foto' : new FormControl(''),
        'dark' : new FormControl('true'),
        'menu' : new FormControl('static'),
        'theme' : new FormControl('green')
      }
    );
  }

  onBuildColumn() {
  }

  onObtieneRegistro() {
    this.subscription = new Subscription();
    this.subscription = this.seguridadService.getParametroSistemaPorId()
    .subscribe(resp => {
      if (resp) {
        this.modeloSistema = resp;
        }
      },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      }
    );
  }

  getToObtienePersonaPorId() {
    this.isHabilitarView = true;
    this.subscription = new Subscription();
    this.subscription = this.usuarioService.getById(this.idUsuario)
    .subscribe(data => {
      this.modelo = data;
      this.modeloForm.controls['apellidoPaterno'].setValue(this.modelo.apellidoPaterno);
      this.modeloForm.controls['apellidoMaterno'].setValue(this.modelo.apellidoMaterno);
      this.modeloForm.controls['nombre'].setValue(this.modelo.nombre);
      this.modeloForm.controls['numeroDocumento'].setValue(this.modelo.nroDocumento);
      this.modeloForm.controls['numeroTelefono'].setValue(this.modelo.nroTelefono);

      const userSapItem = this.userSapList?.find(s => String(s.value) === String(this.modelo.idUserSap));
      if (userSapItem) {
        this.modeloForm.controls['userSap'].setValue(userSapItem);
      }

      this.modeloForm.controls['activo'].setValue(this.modelo.activo);
      this.modeloForm.controls['usuario'].setValue(this.modelo.usuario);
      this.modeloForm.controls['password'].setValue(this.cifrarDataService.decrypt(this.modelo.clave));
      this.modeloForm.controls['email'].setValue(this.modelo.email);

      const perfilItem = this.perfilList?.find(s => String(s.value) === String(this.modelo.idPerfil));
      if (perfilItem) {
        this.modeloForm.controls['perfil'].setValue(perfilItem);
      }

      this.modeloForm.controls['foto'].setValue(this.modelo.imagen);
      this.sellersPermitString = this.modelo.imagen;
      this.modeloForm.controls['dark'].setValue(this.modelo.themeDark);
      this.modeloForm.controls['menu'].setValue(this.modelo.typeMenu);
      this.modeloForm.controls['theme'].setValue(this.modelo.themeColor);

      this.isHabilitarView = false;
    });
  }

  onBasicUpload(event: any) {
    let fileList: FileList = event.files;
    if (fileList.length > 0) {
      const file: File = fileList[0];
      this.sellersPermitFile = file;
      this.handleInputChange(file);
    } else {
      alert("No file selected");
    }
  }

  handleInputChange(files) {
    let file = files;
    let pattern = /image-*/;
    let reader = new FileReader();
    if (!file.type.match(pattern)) {
      alert('invalid format');
      return;
    }
    reader.onloadend = this._handleReaderLoaded.bind(this);
    reader.readAsDataURL(file);
  }

  _handleReaderLoaded(e) {
    let reader = e.target;
    let base64result = reader.result
    this.sellersPermitString = base64result;
    this.modeloForm.controls['foto'].setValue(this.sellersPermitString);
  }

  onClearUpload() {
    this.modeloForm.controls['foto'].setValue(this.modelo.imagen);
    this.sellersPermitString = this.modelo.imagen;
  }

  onClickSave() {
    this.modelo.apellidoPaterno = this.utilService.convertirMayuscula(this.modeloForm.controls['apellidoPaterno'].value);
    this.modelo.apellidoMaterno = this.utilService.convertirMayuscula(this.modeloForm.controls['apellidoMaterno'].value);
    this.modelo.nombre = this.utilService.convertirMayuscula(this.modeloForm.controls['nombre'].value);
    this.modelo.nroDocumento = this.modeloForm.controls['numeroDocumento'].value.toString();
    this.modelo.nroTelefono = this.modeloForm.controls['numeroTelefono'].value.toString();

    if (this.modeloForm.controls['userSap'].value) {
      let itemUserSap = this.modeloForm.controls['userSap'].value;
      this.modelo.idUserSap = itemUserSap.value;
    }

    this.modelo.activo = this.modeloForm.controls['activo'].value;
    this.modelo.imagen = this.modeloForm.controls['foto'].value;
    this.modelo.usuario = this.utilService.convertirMayuscula(this.modeloForm.controls['usuario'].value);

    if (this.modeloSistema.tipoAutenticacion === 'AUTO-NORMAL') {

      let password = this.modeloForm.controls['password'].value === null || this.modeloForm.controls['password'].value === undefined || this.modeloForm.controls['password'].value === '' ? '' : this.modeloForm.controls['password'].value;

      if (password === '') {
        this.swaCustomService.swaMsgInfo('INGRESAR CONTRASEÑA');
        return;
      }

      this.modelo.clave = this.cifrarDataService.encrypt(this.modeloForm.controls['password'].value);
    } else {
      this.modelo.clave = this.cifrarDataService.encrypt(ConstantesGenerales.PASSWORD_DEFAULT);
    }

    this.modelo.email = this.utilService.convertirMayuscula(this.modeloForm.controls['email'].value);

    if (this.modeloForm.controls['perfil'].value) {
      let itemPerfil = this.modeloForm.controls['perfil'].value;
      this.modelo.idPerfil = itemPerfil.value;
    }
    this.modelo.imagen = this.modeloForm.controls['foto'].value;
    this.modelo.themeDark = Boolean(this.modeloForm.controls['dark'].value);
    this.modelo.typeMenu = this.modeloForm.controls['menu'].value;
    this.modelo.themeColor = this.modeloForm.controls['theme'].value;

    this.subscription = new Subscription();
    this.subscription = this.usuarioService.setUpdate(this.modelo)
    .subscribe(() =>  {
      this.swaCustomService.swaMsgExito(null);
      this.back(); },
      (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    });
  }

  back() {
    this.router.navigate(['/main/modulo-seg/panel-persona']);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

}
