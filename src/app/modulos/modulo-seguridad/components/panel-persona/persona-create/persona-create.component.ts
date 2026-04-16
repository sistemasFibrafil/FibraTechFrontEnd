import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Subscription, forkJoin } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { ConstantesVarios } from '../../../../../constants/ConstantesVarios';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { PerfilModel } from '../../../models/pefil.model';
import { UsuarioModel } from '../../../models/usuario.model';

import { PerfilService } from '../../../services/perfil.service';
import { UtilService } from '../../../../../services/util.service';
import { UsuarioService } from '../../../services/usuario.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { CifrarDataService } from '../../../../../services/cifrar-data.service';
import { UsersService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/users.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';



@Component({
  selector: 'app-seg-persona-create',
  templateUrl: './persona-create.component.html',
  styleUrls: ['./persona-create.component.css']
})
export class PersonaCreateComponent implements OnInit, OnDestroy {
  // Titulo del componente
  titulo                = 'Usuario';
  // Name de los botones de accion
  globalConstants       : GlobalsConstantsForm = new GlobalsConstantsForm();
  modeloForm            : FormGroup;
  modelo                : UsuarioModel = new UsuarioModel();
  modeloPerfil          : PerfilModel = new PerfilModel();
  userSapList           : SelectItem[] = [];
  perfilList            : SelectItem[] = [];
  salesPersonsList      : SelectItem[] = [];
  // Imagen
  sellersPermitString   : string;
  sellersPermitFile     :  any;
  subscription          : Subscription;

  constructor
  (
    private fb: FormBuilder,
    private router: Router,
    public app: LayoutComponent,
    private utilService: UtilService,
    private usersService: UsersService,
    private perfilService: PerfilService,
    private usuarioService: UsuarioService,
    private cifrarDataService: CifrarDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly salesPersonsService: SalesPersonsService,
  ) {}

  ngOnInit() {
    this.sellersPermitString = '';
    this.onBuildForm();
    this.onBuildColumn();
    this.loadAllCombos();
  }


  onBuildColumn() {
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
      {
        'apellidoPaterno'   : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'apellidoMaterno'   : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'nombre'            : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'numeroDocumento'   : new FormControl('', Validators.compose([Validators.required])),
        'numeroTelefono'    : new FormControl(''),
        'userSap'           : new FormControl('', Validators.compose([Validators.required])),
        'salesEmployees'    : new FormControl('', Validators.compose([Validators.required])),
        'activo'            : new FormControl({value: true, disabled: true}, Validators.compose([Validators.required])),
        'usuario'           : new FormControl('', Validators.compose([Validators.required, Validators.maxLength(20), Validators.minLength(2)])),
        'password'          : new FormControl('', Validators.compose([Validators.maxLength(15), Validators.minLength(4)])),
        'email'             : new FormControl('', Validators.compose([Validators.required, Validators.email])),
        'perfil'            : new FormControl('', Validators.compose([Validators.required])),
        'foto'              : new FormControl(null),
        'dark'              : new FormControl('true'),
        'menu'              : new FormControl('static'),
        'theme'             : new FormControl('green')
      }
    );
  }

  private loadAllCombos(): void {
    forkJoin({
      users: this.usersService.getList(),
      perfiles: this.perfilService.getList(),
      salesPersons: this.salesPersonsService.getList(),
    }).subscribe({
      next: (res: any) => {
        this.userSapList      = (res.users || []).map(item => ({ label: item.userName, value: item.userId }));
        this.salesPersonsList = (res.salesPersons || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.perfilList       = (res.perfiles || []).map(item => ({ label: item.descripcionPerfil, value: item.idPerfil }));
      },
      error: (e) => {
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
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
    this.modeloForm.controls['foto'].setValue('');

    this.sellersPermitString = '';
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

    this.modelo.clave = this.cifrarDataService.encrypt(this.modeloForm.controls['password'].value);

    this.modelo.email = this.utilService.convertirMayuscula(this.modeloForm.controls['email'].value);

    if (this.modeloForm.controls['perfil'].value) {
      let itemPerfil = this.modeloForm.controls['perfil'].value;
      this.modelo.idPerfil = itemPerfil.value;
    }

    if(this.modelo.imagen === '' || this.modelo.imagen === null || this.modelo.imagen === undefined) {
      this.modelo.imagen = ConstantesVarios._IMAGEDEFAULT;
    } else {
      this.modelo.imagen = this.modeloForm.controls['foto'].value;
    }

    this.modelo.themeDark = Boolean(this.modeloForm.controls['dark'].value);
    this.modelo.typeMenu = this.modeloForm.controls['menu'].value;
    this.modelo.themeColor = this.modeloForm.controls['theme'].value;

    this.subscription = new Subscription();
    this.subscription = this.usuarioService.setCreate(this.modelo)
    .subscribe(
      () =>  {
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
