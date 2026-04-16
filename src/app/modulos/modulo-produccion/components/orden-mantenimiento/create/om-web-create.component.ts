import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { LayoutComponent } from '../../../../../layout/layout.component';

import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';
import { ConstantesGenerales } from '../../../../../constants/Constantes-generales';

import { UtilService } from '../../../../../services/util.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { CifrarDataService } from '../../../../../services/cifrar-data.service';
import { ITipoServicioWeb } from '../../../interfaces/tipoServicioWeb.interface';

@Component({
  selector: 'app-pr-om-web-create',
  templateUrl: './om-web-create.component.html',
  styleUrls: ['./om-web-create.component.css']
})
export class OrdenMantenimientoWebCreateComponent implements OnInit, OnDestroy {

  // Titulo del componente
  titulo = 'Órden de Mantenimiento';

  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  modeloForm: FormGroup;
  subscription: Subscription;

  // modelo: PersonaModel = new PersonaModel();
  // modeloSistema: ParametroSistemaModel = new ParametroSistemaModel();
  // modeloPerfil: PerfilModel = new PerfilModel();

  listItemPerfil: SelectItem[];
  tipoServicioWebList: ITipoServicioWeb[];



  // Imagen
  sellersPermitString: string;
  sellersPermitFile;


  // Centro de Costo
  isActivateBusquedaCentroCosto = false;
  itemCentroCostoSeleccionado: any;
  isActivateBusquedaCentro: boolean = false;
  isDimension: number;

  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
  ) {}

  ngOnInit() {
    this.sellersPermitString = '';
    this.isDimension = ConstantesGenerales.DIMENSION_DEFAULT;

    this.onBuildForm();
    this.onInicializar();
    this.onObtieneRegistro();
    this.getToObtienePerfil();
    this.onBuildColumn();
  }

  onInicializar() {
    //this.modelo.entidadUsuario = new UsuarioModel();
  }

  onBuildColumn() {
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
      {
        'fecInicio' : new FormControl('', Validators.compose([Validators.required])),
        'horaInicio' : new FormControl('', Validators.compose([Validators.required])),
        'tipoServicio' : new FormControl('', Validators.compose([Validators.required])),
        'areaSolicitante' : new FormControl('', Validators.compose([Validators.required])),
        'maquina' : new FormControl('', Validators.compose([Validators.required])),
        'parte' : new FormControl('', Validators.compose([Validators.required])),
        'subParte' : new FormControl(''),
        'detalleOtros' : new FormControl(''),
        'sede' : new FormControl('', Validators.compose([Validators.required])),
        'puestoSolicitante' : new FormControl('', Validators.compose([Validators.required])),
        'solicitante' : new FormControl('', Validators.compose([Validators.required])),
      }
    );

    this.getListTipoServicio();
  }

  getListTipoServicio() {
    this.tipoServicioWebList =
    [
      { codTipoServicio: '01', nomTipoServicio: 'Preventivo' },
      { codTipoServicio: '02', nomTipoServicio: 'Correctivo' },
      { codTipoServicio: '03', nomTipoServicio: 'Otros' },
    ];
  }

  onObtieneRegistro() {
    // this.subscription = new Subscription();
    // this.subscription = this.seguridadService.getParametroSistemaPorId()
    // .subscribe(resp => {
    //   if (resp) {
    //     this.modeloSistema = resp;
    //     }
    //   },
    //   (error) => {
    //     this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    //   }
    // );
  }

  getToObtienePerfil() {
    // this.subscription = new Subscription();
    // this.subscription = this.seguridadService.getPerfil(this.modeloPerfil)
    // .subscribe((data: PerfilModel[]) => {
    //   this.listItemPerfil = [];
    //   for (let item of data) {
    //     this.listItemPerfil.push({ label: item.descripcionPerfil, value: item.idPerfil });
    //   }
    // });
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

  centroCostoSeleccionado(event: any) {
    this.itemCentroCostoSeleccionado = event;
    this.modeloForm.patchValue({
      codCentroCosto: event.codCentroCosto,
      desCentroCosto: event.desCentroCosto,
    });

    this.activarModalCentroCosto();
  }

  activarModalCentroCosto() {
    this.isActivateBusquedaCentroCosto = !this.isActivateBusquedaCentroCosto;
  }

  centroSeleccionado(event: any) {
    this.modeloForm.patchValue({
      codCentro: event.codcentro,
      desCentro: event.nombre,
    });

    this.activarModalCentro();
  }

  activarModalCentro() {
    this.isActivateBusquedaCentro = !this.isActivateBusquedaCentro;
  }

  onClickSave() {
    // this.modelo.apellidoPaterno = this.utilService.convertirMayuscula(this.modeloForm.controls['apellidoPaterno'].value);
    // this.modelo.apellidoMaterno = this.utilService.convertirMayuscula(this.modeloForm.controls['apellidoMaterno'].value);
    // this.modelo.nombre = this.utilService.convertirMayuscula(this.modeloForm.controls['nombre'].value);
    // this.modelo.nroDocumento = this.modeloForm.controls['numeroDocumento'].value.toString();
    // this.modelo.nroTelefono = this.modeloForm.controls['numeroTelefono'].value.toString();
    // this.modelo.flgActivo = this.modeloForm.controls['flgEstado'].value;

    // this.modelo.entidadUsuario.imagen = this.modeloForm.controls['foto'].value;
    // this.modelo.entidadUsuario.usuario = this.utilService.convertirMayuscula(this.modeloForm.controls['usuario'].value);

    // if (this.modeloSistema.tipoAutenticacion === 'AUTO-NORMAL') {

    //   let password = this.modeloForm.controls['password'].value === null || this.modeloForm.controls['password'].value === undefined || this.modeloForm.controls['password'].value === '' ? '' : this.modeloForm.controls['password'].value;

    //   if (password === '') {
    //     this.swaCustomService.swaMsgInfo('INGRESAR CONTRASEÑA');
    //     return;
    //   }

    //   this.modelo.entidadUsuario.claveOrigen = this.cifrarDataService.encrypt(this.modeloForm.controls['password'].value);
    // } else {
    //   this.modelo.entidadUsuario.claveOrigen = this.cifrarDataService.encrypt(ConstantesGenerales.PASSWORD_DEFAULT);
    // }

    // this.modelo.entidadUsuario.email = this.utilService.convertirMayuscula(this.modeloForm.controls['email'].value);

    // if (this.modeloForm.controls['perfil'].value) {
    //   let itemPerfil = this.modeloForm.controls['perfil'].value;
    //   this.modelo.entidadUsuario.idPerfil = itemPerfil.value;
    // }

    // if(this.modelo.entidadUsuario.imagen === '' || this.modelo.entidadUsuario.imagen === null || this.modelo.entidadUsuario.imagen === undefined) {
    //   this.modelo.entidadUsuario.imagen = ConstantesVarios._IMAGEDEFAULT;
    // } else {
    //   this.modelo.entidadUsuario.imagen = this.modeloForm.controls['foto'].value;
    // }

    // this.modelo.entidadUsuario.themeDark = Boolean(this.modeloForm.controls['dark'].value);
    // this.modelo.entidadUsuario.typeMenu = this.modeloForm.controls['menu'].value;
    // this.modelo.entidadUsuario.themeColor = this.modeloForm.controls['theme'].value;

    // this.subscription = new Subscription();
    // this.subscription = this.seguridadService.setInsertPersona(this.modelo)
    // .subscribe(
    //   () =>  {
    //   this.swaCustomService.swaMsgExito(null);
    //   this.back(); },
    //   (error) => {
    //     this.swaCustomService.swaMsgError(error.error.resultadoDescripcion);
    // });
  }

  back() {
    this.router.navigate(['/main/modulo-se/panel-persona']);
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
