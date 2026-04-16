import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/items.interface';
import { IBusinessPartners } from 'src/app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';
import { IGrupoArticulo } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/grupo-articulo-sap.interface';
import { IForcastVenta, IForcastVentaConSinOc, IForcastVentaEstado, IForcastVentaNegocio } from '../../../interfaces/web/forcast-venta.interface';

import { UserContextService } from 'src/app/services/user-context.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { ForCastVentaService } from '../../../services/web/forcast-venta.service';
import { GrupoItemsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/grupo-articulo-sap.service';



@Component({
  selector: 'app-ven-panel-forcast-create',
  templateUrl: './panel-forcast-create.component.html',
  styleUrls: ['./panel-forcast-create.component.css']
})
export class PanelForcastCreateComponent implements OnInit {
  // Titulo del componente
  titulo = 'Forcast de venta';

  modeloForm: FormGroup;
  buttonAcces: ButtonAcces = new ButtonAcces();
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  modeloSave: IForcastVenta;
  listConSinOc: IForcastVentaConSinOc[];
  listNegocio: IForcastVentaNegocio[];
  listGrupoArticulo: IGrupoArticulo[];
  listEstado: IForcastVentaEstado[];

  // MODAL: Progreso
  isDisplay: boolean = false;
  isSaving: boolean = false;

  // MODAL: Artículo
  itemCode: string = '';
  articuloSeleccionado: IArticulo;

  // MODAL: CLiente
  cardCode: string = '';
  clienteSeleccionado: IBusinessPartners;


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private userContextService: UserContextService,
    private grupoItemsService: GrupoItemsService,
    private forCastVentaService: ForCastVentaService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.getListConSinOcAll();
    this.getListNegocioAll();
    this.getListGrupoArticulo();
    this.getListEstadoAll();
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

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('ap-ven-panel-forcast-list');
  }

  getListConSinOcAll() {
    this.listConSinOc = [];
    this.forCastVentaService.getListConSinOcAll()
    .subscribe({next:(data: IForcastVentaConSinOc[]) =>{
        this.listConSinOc = data;
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListNegocioAll() {
    this.listNegocio = [];
    this.forCastVentaService.getListNegocioAll()
    .subscribe({next:(data: IForcastVentaNegocio[]) =>{
        this.listNegocio = data;
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  getListGrupoArticulo() {
    this.listGrupoArticulo = [];
    this.grupoItemsService.getList()
    .subscribe({next:(data: IGrupoArticulo[]) =>{
        this.listGrupoArticulo = data;
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToArticuloSelecionado(value) {
    this.articuloSeleccionado = value;
    this.modeloForm.patchValue({itemCode : value.itemCode, itemName: value.itemName });
  }

  onToClienteSelecionado(value) {
    this.clienteSeleccionado = value;
    this.modeloForm.patchValue({cardCode : value.cardCode, licTradNum: value.licTradNum, cardName: value.cardName });
  }

  getListEstadoAll() {
    this.listEstado = [];
    this.forCastVentaService.getListEstadoAll()
    .subscribe({next:(data: IForcastVentaEstado[]) =>{
        this.listEstado = data;
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToValidatedSave(){
    const { conSinOc, negocio, grupoArticulo, estado } = this.modeloForm.value;
    const value: IForcastVenta = this.modeloForm.getRawValue();

    if (conSinOc === '' || conSinOc === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el C/S OC.');
      return false;
    }

    if (negocio === '' || negocio === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el Negocio.');
      return false;
    }

    if (value.fecRegistro === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione la Fecha de registro.');
      return false;
    }

    if (value.docNum.toString() === '' || value.docNum === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese el Número de OV.');
      return false;
    }

    if (grupoArticulo === '' || grupoArticulo === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el Grupo de artículo.');
      return false;
    }

    if (value.itemCode === '' || value.itemCode === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el Artcíulo.');
      return false;
    }

    if (value.cardCode === '' || value.cardCode === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el Cliente.');
      return false;
    }

    if (value.unidadMedida === '' || value.unidadMedida === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese la Unidad de medida.');
      return false;
    }

    if (value.unidadMedida === '' || value.unidadMedida === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese la Unidad de medida.');
      return false;
    }

    if (value.cantidad === 0 || value.cantidad === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese la Cantidad válida.');
      return false;
    }

    if (value.kg === 0 || value.kg === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese el Kg válido.');
      return false;
    }

    if (value.precio === 0 || value.precio === null)
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese el Precio válido.');
      return false;
    }

    if (estado === '' || estado === null)
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

    const { conSinOc, negocio, grupoArticulo, estado } = this.modeloForm.value;

    this.modeloSave = this.modeloForm.getRawValue();
    this.modeloSave.idConSinOc = conSinOc.idConSinOc;
    this.modeloSave.idNegocio = negocio.idNegocio;
    this.modeloSave.itmsGrpCod = grupoArticulo.itmsGrpCod;
    this.modeloSave.codEstado = estado.codEstado;
    this.modeloSave.idUsuario = this.userContextService.getIdUsuario();

    this.forCastVentaService.setCreate(this.modeloSave)
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
