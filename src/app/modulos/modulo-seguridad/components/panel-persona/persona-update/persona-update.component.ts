import { SelectItem } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';
import { Subject, Subscription, finalize, forkJoin, switchMap, takeUntil } from 'rxjs';

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
  selector: 'app-seg-persona-update',
  templateUrl: './persona-update.component.html',
  styleUrls: ['./persona-update.component.css']
})
export class PersonaUpdateComponent implements OnInit, OnDestroy {

  private readonly destroy$ = new Subject<void>();

  // Titulo del componente
  titulo                    = 'Usuario';

  // Name de los botones de accion
  globalConstants           : GlobalsConstantsForm = new GlobalsConstantsForm();

  modeloForm                : FormGroup;

  isDisplay                 : boolean = false;

  modelo                    : UsuarioModel = new UsuarioModel();
//  modeloSistema             : ParametroSistemaModel = new ParametroSistemaModel();
  modeloPerfil              : PerfilModel = new PerfilModel();

  themes                    : any[];

  userSapList               : SelectItem[] = [];
  perfilList                : SelectItem[] = [];
  salesPersonsList          : SelectItem[] = [];

  idUsuario                 : number;
  private combosLoaded      : boolean = false;

  // Imagen
  sellersPermitString       : string;
  sellersPermitFile         :  any;

  subscription              : Subscription;
  isHabilitarView           : boolean;

  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    private usersService: UsersService,
    private perfilService: PerfilService,
    private readonly route: ActivatedRoute,
    private readonly utilService: UtilService,
    private readonly usuarioService: UsuarioService,
    private readonly swaCustomService: SwaCustomService,
    private readonly cifrarDataService: CifrarDataService,
    private readonly salesPersonsService: SalesPersonsService,
  ) {}

  ngOnInit() {
    this.themes = [
      {label: 'green'}
    ];
    this.onBuildForm();
    this.onBuildColumn();
    this.loadAllCombos();
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
        'salesPersons'    : new FormControl('', Validators.compose([Validators.required])),
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

  private loadAllCombos(): void {
    this.isDisplay = true;

    forkJoin({
      users: this.usersService.getList(),
      perfiles: this.perfilService.getList(),
      salesPersons: this.salesPersonsService.getList(),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res: any) => {
        this.userSapList      = (res.users || []).map(item => ({ label: item.userName, value: item.userId }));
        this.salesPersonsList = (res.salesPersons || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.perfilList       = (res.perfiles || []).map(item => ({ label: item.descripcionPerfil, value: item.idPerfil }));

        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', () => this.swaCustomService);
      }
    });
  }

  private loadData(): void {
    this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.idUsuario = +params['id'];

        // 🔥 aquí sí se activa de forma confiable
        this.isDisplay = true;

        return this.usuarioService
          .getById(this.idUsuario)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: UsuarioModel) => {
        this.modelo = data;
        this.setFormValues(this.modelo);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: UsuarioModel): void {
    const h = this.getHelpers();

    this.setUserForm(value, h);
    this.setViewState(value);
  }

  private getHelpers() {
    const {
      normalizePrimitive: n,
      findSelectItem: findItem,
      patchForm: patch
    } = this.utilService;

    return { n, findItem, patch };
  }

  private setUserForm(value: UsuarioModel, h: any): void {
    const userSapItem      = h.findItem(this.userSapList, value.idUserSap);
    const perfilItem       = h.findItem(this.perfilList, value.idPerfil);
    const salesPersonsItem = h.findItem(this.salesPersonsList, value.slpCode);

    h.patch(this.modeloForm, {
      apellidoPaterno : h.n(value.apellidoPaterno),
      apellidoMaterno : h.n(value.apellidoMaterno),
      nombre          : h.n(value.nombre),
      numeroDocumento : h.n(value.nroDocumento),
      numeroTelefono  : h.n(value.nroTelefono),

      userSap         : userSapItem,
      salesPersons    : salesPersonsItem,
      activo          : value.activo,
      usuario         : h.n(value.usuario),
      password        : this.cifrarDataService.decrypt(value.clave),
      email           : h.n(value.email),

      perfil          : perfilItem,
      foto            : h.n(value.imagen),
      dark            : value.themeDark,
      menu            : h.n(value.typeMenu),
      theme           : h.n(value.themeColor)
    });
  }

  private setViewState(value: UsuarioModel): void {
    this.idUsuario = value.idUsuario;
    this.sellersPermitString = value.imagen;
    this.isHabilitarView = false;
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

  onClickSave(): void {
    const f = this.modeloForm.getRawValue();

    const u = this.utilService;
    const p = (v: any) => u.normalizePrimitive(v);
    const n = (v:any)=>u.normalizeNumber(v);
    const val = (v: any) => v?.value ?? v;
    const may = (v: any) => u.convertirMayuscula(p(v));

    this.modelo = {
      idUsuario       : this.idUsuario,
      apellidoPaterno : may(f.apellidoPaterno),
      apellidoMaterno : may(f.apellidoMaterno),
      nombre          : may(f.nombre),
      nroDocumento    : p(f.numeroDocumento).toString(),
      nroTelefono     : p(f.numeroTelefono).toString(),

      idUserSap       : n(val(f.userSap)),
      slpCode         : n(val(f.salesPersons)),

      activo          : f.activo,
      imagen          : f.foto,
      usuario         : may(f.usuario),
      clave           : this.cifrarDataService.encrypt(p(f.password)),
      email           : may(f.email),

      idPerfil        : n(val(f.perfil)),

      themeDark       : Boolean(f.dark),
      typeMenu        : f.menu,
      themeColor      : f.theme,
    };

    this.subscription = this.usuarioService.setUpdate(this.modelo)
    .subscribe({
      next: () => {
        this.swaCustomService.swaMsgExito(null);
        this.back();
      },
      error: (error) => {
        this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
      }
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
