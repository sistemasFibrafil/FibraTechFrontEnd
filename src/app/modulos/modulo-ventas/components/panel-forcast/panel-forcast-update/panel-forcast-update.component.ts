import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { ForCastVentaService } from '../../../services/web/forcast-venta.service';
import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/articulo.interface';
import { IGrupoArticulo } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/grupo-articulo-sap.interface';
import { IForcastVenta, IForcastVentaConSinOc, IForcastVentaEstado, IForcastVentaNegocio } from '../../../interfaces/web/forcast-venta.interface';

import { UserContextService } from 'src/app/services/user-context.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { ISocioNegocio } from 'src/app/modulos/modulo-socios-negocios/interfaces/socio-segocio.interface';
import { GrupoArticuloService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/grupo-articulo-sap.service';



@Component({
  selector: 'app-ven-panel-forcast-update',
  templateUrl: './panel-forcast-update.component.html',
  styleUrls: ['./panel-forcast-update.component.css']
})
export class PanelForcastUpdateComponent implements OnInit {
  // Titulo del componente
  titulo = 'Forcast de venta';

  modeloForm: FormGroup;
  buttonAcces: ButtonAcces = new ButtonAcces();
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  idForcastVenta: number = 0;
  modelo: IForcastVenta;
  modeloSave: IForcastVenta;
  listConSinOc: SelectItem[];
  listNegocio: SelectItem[];
  listGrupoArticulo: SelectItem[];
  listEstado: SelectItem[];

  // MODAL: Progreso
  isDisplay: boolean = false;
  isSaving: boolean = false;

  // MODAL: Artículo
  itemCode: string = '';
  articuloSeleccionado: IArticulo;

  // MODAL: CLiente
  cardCode: string = '';
  clienteSeleccionado: ISocioNegocio;


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    private readonly route: ActivatedRoute,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private userContextService: UserContextService,
    private grupoArticuloService: GrupoArticuloService,
    private forCastVentaService: ForCastVentaService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.getListConSinOcAll();
    this.getListNegocioAll();
    this.getListGrupoArticulo();
    this.getListEstadoAll();

    // this.route.params.subscribe((params: Params) => {
    //   this.idForcastVenta = Number(params['id']);
    //   this.getById(this.idForcastVenta);
    // });

    this.route.params.subscribe((params: Params) => {
      this.idForcastVenta = Number(params["id"]);
      setTimeout(() => {
        this.getById(this.idForcastVenta);
      }, 10);
    });
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
      'conSinOc'      : new FormControl('', Validators.compose([Validators.required])),
      'negocio'       : new FormControl('', Validators.compose([Validators.required])),
      'fecRegistro'   : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'docNum'        : new FormControl('', Validators.compose([Validators.required])),
      'grupoArticulo' : new FormControl('', Validators.compose([Validators.required])),
      'itemCode'      : new FormControl('', Validators.compose([Validators.required])),
      'itemName'      : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'cardCode'      : new FormControl('', Validators.compose([Validators.required])),
      'licTradNum'    : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'cardName'      : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'unidadMedida'  : new FormControl('', Validators.compose([Validators.required])),
      'cantidad'      : new FormControl('1.00', Validators.compose([Validators.required])),
      'kg'            : new FormControl('1.00', Validators.compose([Validators.required])),
      'precio'        : new FormControl('1.00', Validators.compose([Validators.required])),
      'estado'        : new FormControl('', Validators.compose([Validators.required])),
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-forcast-list');
  }

  getListConSinOcAll() {
    this.forCastVentaService.getListConSinOcAll()
    .subscribe({next:(data: IForcastVentaConSinOc[]) =>{
        this.listConSinOc = [];
        for (let item of data) {
          this.listConSinOc.push({ label: item.nomConSinOc, value: item.idConSinOc });
        }
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListNegocioAll() {
    this.forCastVentaService.getListNegocioAll()
    .subscribe({next:(data: IForcastVentaNegocio[]) =>{
        this.listNegocio = [];
        for (let item of data) {
          this.listNegocio.push({ label: item.nomNegocio, value: item.idNegocio });
        }
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListGrupoArticulo() {
    this.grupoArticuloService.getList()
    .subscribe({next:(data: IGrupoArticulo[]) =>{
        this.listGrupoArticulo = [];
        for (let item of data) {
          this.listGrupoArticulo.push({ label: item.itmsGrpNam, value: item.itmsGrpCod });
        }
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToArticuloSelecionado(value) {
    this.articuloSeleccionado = value;
    this.modeloForm.patchValue({itemCode : value.itemCode, itemName: value.itemName });
  }

  onToSelectedCliente(value) {
    this.clienteSeleccionado = value;
    this.modeloForm.patchValue({cardCode : value.cardCode, licTradNum: value.licTradNum, cardName: value.cardName });
  }

  getListEstadoAll() {
    this.forCastVentaService.getListEstadoAll()
    .subscribe({next:(data: IForcastVentaEstado[]) =>{
        this.listEstado = [];
        for (let item of data) {
          this.listEstado.push({ label: item.nomEstado, value: item.codEstado });
        }
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getById(idForcastVenta: number) {
    this.isDisplay = true;
    this.forCastVentaService.getById(idForcastVenta)
    .subscribe({next:(data: IForcastVenta) => {
        this.modelo = data;
        this.itemCode = this.modelo.itemCode;
        this.cardCode = this.modelo.cardCode;
        this.modeloForm.controls['conSinOc'].setValue({ label: this.modelo.nomConSinOc, value: this.modelo.idConSinOc });
        this.modeloForm.controls['negocio'].setValue({ label: this.modelo.nomNegocio, value: this.modelo.idNegocio });
        this.modeloForm.controls['fecRegistro'].setValue( data.fecRegistro == null ?  null : new Date(data.fecRegistro) );
        this.modeloForm.controls['docNum'].setValue( this.modelo.docNum );
        this.modeloForm.controls['grupoArticulo'].setValue({ label: this.modelo.itmsGrpNam, value: this.modelo.itmsGrpCod });
        this.modeloForm.controls['itemCode'].setValue( this.modelo.itemCode );
        this.modeloForm.controls['cardCode'].setValue( this.modelo.cardCode );
        this.modeloForm.controls['unidadMedida'].setValue( this.modelo.unidadMedida );
        this.modeloForm.controls['cantidad'].setValue( this.modelo.cantidad );
        this.modeloForm.controls['kg'].setValue( this.modelo.kg );
        this.modeloForm.controls['precio'].setValue( this.modelo.precio );
        this.modeloForm.controls['estado'].setValue({ label: this.modelo.nomEstado, value: this.modelo.codEstado });
        this.isDisplay = false;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToValidatedSave(){
    if (!this.modeloForm.controls['conSinOc'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el C/S OC.');
      return false;
    }

    if (!this.modeloForm.controls['negocio'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el Negocio.');
      return false;
    }

    if (!this.modeloForm.controls['fecRegistro'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione la Fecha de registro.');
      return false;
    }

    if (!this.modeloForm.controls['docNum'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese el Número de OV.');
      return false;
    }

    if (!this.modeloForm.controls['grupoArticulo'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el Grupo de artículo.');
      return false;
    }

    if (!this.modeloForm.controls['itemCode'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el Artcíulo.');
      return false;
    }

    if (!this.modeloForm.controls['cardCode'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el Cliente.');
      return false;
    }

    if (!this.modeloForm.controls['unidadMedida'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese la Unidad de medida.');
      return false;
    }

    if (!this.modeloForm.controls['unidadMedida'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese la Unidad de medida.');
      return false;
    }

    if (!this.modeloForm.controls['cantidad'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese la Cantidad válida.');
      return false;
    }

    if (!this.modeloForm.controls['kg'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese el Kg válido.');
      return false;
    }

    if (!this.modeloForm.controls['precio'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese el Precio válido.');
      return false;
    }

    if (!this.modeloForm.controls['estado'].value)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el estado.');
      return false;
    }

    return true;
  }

  onToSave() {
    this.isSaving = true;
    if(!this.onToValidatedSave()) return;

    this.modeloSave = this.modeloForm.getRawValue();
    this.modeloSave.idForcastVenta = this.idForcastVenta;

    let conSinOcItem = this.modeloForm.controls['conSinOc'].value;
    this.modeloSave.idConSinOc = conSinOcItem.value;

    let negocioItem = this.modeloForm.controls['negocio'].value;
    this.modeloSave.idNegocio = negocioItem.value;

    let grupoArticuloItem = this.modeloForm.controls['grupoArticulo'].value;
    this.modeloSave.itmsGrpCod = grupoArticuloItem.value;

    let estadoItem = this.modeloForm.controls['estado'].value;
    this.modeloSave.codEstado = estadoItem.value;

    this.modeloSave.idUsuario = this.userContextService.getIdUsuario();

    this.forCastVentaService.setUpdate(this.modeloSave)
    .subscribe({ next: (data:any)=>{
        this.isSaving = false;
        this.swaCustomService.swaMsgExito(null);
        this.back();
      },
      error:(e)=>{
        this.isSaving = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickSave() {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.onToSave();
      }
    });
  }

  back() {
    this.router.navigate(['/main/modulo-ve/panel-forcast-list']);
  }
}
