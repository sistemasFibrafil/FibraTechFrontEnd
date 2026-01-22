import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { EntregaVentaCreateModel } from '../../../models/entrega.model';

import { IEntregaById, IEntregaItemById } from '../../../interfaces/entrega.interface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/sales-persons.interface';

import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { EntregaSapService } from '../../../services/sap/entrega-sap.service';
import { PickingVentaService } from '../../../services/web/picking-venta.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/sales-persons.service';
import { ISocioNegocio } from 'src/app/modulos/modulo-socios-negocios/interfaces/socio-segocio.interface';


interface IEstado
{
  idEstado: number;
  nomEstado: string;
}

@Component({
  selector: 'app-ven-panel-entrega-create',
  templateUrl: './panel-entrega-create.component.html',
  styleUrls: ['./panel-entrega-create.component.css']
})
export class PanelEntregaCreateComponent implements OnInit {
  // Titulo del componente
  titulo = 'Entrega';

  modeloFormCab1: FormGroup;
  modeloFormCab2: FormGroup;
  modeloFormLog: FormGroup;
  modeloFormFin: FormGroup;
  modeloFormExp: FormGroup;
  modeloFormAge: FormGroup;
  modeloFormTra: FormGroup;
  modeloFormPie1: FormGroup;
  modeloFormPie2: FormGroup;
  modeloFormCliente: FormGroup;

  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();


  type: string = '';
  idPicking: number = 0;
  modeloSave: EntregaVentaCreateModel = new EntregaVentaCreateModel();
  listEstadoItem: IEstado[];
  listEstado: SelectItem[];
  listMoneda: SelectItem[];
  listSerSap: SelectItem[];
  listSerSunat: SelectItem[];
  listEmleadoVenta: SelectItem[];
  listCondicionPago: SelectItem[];
  listMotivoTraslado: SelectItem[];
  listTipoTransporte: SelectItem[];
  listTipDocIdeConductor: SelectItem[];
  listTipDocIdeTransportista: SelectItem[];


  // MODAL: Progreso
  isDisplay: boolean = false;
  isSaving: boolean = false;

  // MODAL: CLiente
  cardCode: string = '';
  clienteSeleccionado: ISocioNegocio;

  // DETALLE
  columnas: any[];
  listItem: IEntregaItemById[] = [];

  // MODAL: Direccion
  shipToCode: string = '';
  payToCode: string = '';

  // MODAL: Transportista 1
  codTransportista: string = '';
  manTransportista1: boolean = true;

  // MODAL: Transportista 2
  u_BPP_MDCT: string = '';
  manTransportista2: boolean = true;

  // MODAL: Dirección
  codDirTransportista: string = '';

  // MODAL: Vehículo
  numPlaca1: string = '';

  // MODAL: Conductor
  numDocIdeConductor1: string = '';

  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    private readonly swaCustomService: SwaCustomService,
    private entregaSapService: EntregaSapService,
    private pickingVentaService: PickingVentaService,
    private salesPersonsService: SalesPersonsService,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    // this.getListSerieSap();
    // this.getEstado();
    // this.getListEmpleadoVentaAll();
    // this.getListCondicionPagoAll();
    // this.getListMotivoTrasladoAll();
    // this.getListTipoTransporteAll();
    // this.getListTipoDocumentoIdentidadAll();

    // this.route.params.subscribe((params: Params) => {
    //   this.type = params["type"];
    //   this.idPicking = Number(params["id"]);
    //   console.log("TYPE: ", this.type);
    //   console.log("ID: ", this.idPicking);
    //   setTimeout(() => {
    //     this.getByIdPicking(this.idPicking);
    //   }, 10);
    // });
  }

  onBuildForm() {
    this.modeloFormCab1 = this.fb.group(
    {
      'cardCode'            : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'licTradNum'          : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'cardName'            : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'docCur'              : new FormControl('', Validators.compose([Validators.required])),
      'docRate'             : new FormControl('', Validators.compose([Validators.required])),
    });

    this.modeloFormCab2 = this.fb.group(
    {
      'serieSap'            : new FormControl('', Validators.compose([Validators.required])),
      'docNum'              : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'serSunat'            : new FormControl('', Validators.compose([Validators.required])),
      'numSunat'            : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'estado'              : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'docDate'             : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'docDueDate'          : new FormControl(null, Validators.compose([Validators.required])),
      'taxDate'             : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
    });

    this.modeloFormLog = this.fb.group(
    {
      'shipToCode'          : new FormControl('', Validators.compose([Validators.required])),
      'address2'            : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'payToCode'           : new FormControl('', Validators.compose([Validators.required])),
      'address'             : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required])),
      'motTraslado'         : new FormControl('', Validators.compose([Validators.required])),
      'otrMotTraslado'      : new FormControl('', Validators.compose([Validators.required])),
    });

    this.modeloFormFin = this.fb.group(
    {
      'condicionPago'   : new FormControl('', Validators.compose([Validators.required]))
    });

    this.modeloFormExp = this.fb.group(
    {
      'rucDesInternacional'       : new FormControl(''),
      'desGuiaInternacional'      : new FormControl(''),
      'dirDesInternacional'       : new FormControl(''),
      'numContenedor'             : new FormControl(''),
      'numPrecinto01'             : new FormControl(''),
      'numPrecinto02'             : new FormControl(''),
      'numPrecinto03'             : new FormControl(''),
      'numPrecinto04'             : new FormControl(''),
    });

    this.modeloFormAge = this.fb.group(
    {
      'manTransportista2'       : new FormControl(''),
      'rucTransportista2'       : new FormControl(''),
      'u_BPP_MDNT2'       : new FormControl(''),
      'dirTransportista2'       : new FormControl(''),
    });

    this.modeloFormTra = this.fb.group(
      {
        'tipTransporte'           : new FormControl(''),
        'manTransportista1'       : new FormControl(''),
        'tipDocIdeTransportista1' : new FormControl(''),
        'rucTransportista1'       : new FormControl(''),
        'u_BPP_MDNT1'       : new FormControl(''),
        'numPlaca1'               : new FormControl(''),
        'tipDocIdeConductor1'     : new FormControl(''),
        'numDocIdeConductor1'     : new FormControl(''),
        'denConductor1'           : new FormControl(''),
        'u_FIB_NOM_COND1'           : new FormControl(''),
        'u_FIB_APE_COND1'           : new FormControl(''),
        'licConductor1'           : new FormControl(''),
      });

    this.modeloFormPie1 = this.fb.group(
    {
      'empleadoVenta'     : new FormControl(''),
      'totalBulto'        : new FormControl(''),
      'totalKilo'         : new FormControl(''),
      'comments'          : new FormControl(''),
    });
    this.modeloFormPie2 = this.fb.group(
    {
      'subTotal'          : new FormControl({ value: '', disabled: true }),
      'vatSum'            : new FormControl({ value: '', disabled: true }),
      'docTotal'          : new FormControl({ value: '', disabled: true }),
    });
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'itemCode', header: 'Código' },
      { field: 'dscription', header: 'Descripción' },
      { field: 'whsCode', header: 'Almacén' },
      { field: 'unitMsr', header: 'UM' },
      { field: 'quantity', header: 'Cantidad' },
      { field: 'peso', header: 'Peso' },
      { field: 'TaxCode', header: 'Impuesto' },
      { field: 'currency', header: 'Moneda' },
      { field: 'price', header: 'Precio' },
      { field: 'total', header: 'Total' },
    ];
  }


  //#region <<< MODAL: Cliente >>>
  getListMonedaByCurrCode(currCode: string) {
    // this.MonedaService.getListByCurrCode(currCode)
    // .subscribe({next:(data: IMoneda[]) =>{
    //     this.listMoneda = [];
    //     for (let item of data) {
    //       this.listMoneda.push({ label: item.fullCurrName, value: item.currCode });
    //     }
    //   },error:(e)=>{
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  onToSelectedCliente(value) {
    this.cardCode = value.cardCode;
    this.clienteSeleccionado = value;
    this.modeloFormCab1.patchValue({ cardCode: value.cardCode, licTradNum: value.licTradNum, cardName: value.cardName });

    this.getListMonedaByCurrCode(value.currency);
  }

  onToDireccionEntregaSelecionado(value) {
    this.shipToCode = value.address;
    this.modeloFormLog.patchValue({ shipToCode: value.address, address2: value.street });
  }

  onToDireccionFacturaSelecionado(value) {
    this.payToCode = value.address;
    this.modeloFormLog.patchValue({ payToCode: value.address, address: value.street });
  }
  //#endregion

  getListSerieSap() {
    // const value: any = { formulario: '15', idUsuario: this.userContextService.getIdUsuario() };
    // this.serieSapService.getListByFormularioIdUsuario(value)
    // .subscribe({next:(data: ISerieSap[]) =>{
    //     this.listSerSap = [];
    //     for (let item of data) {
    //       this.listSerSap.push({ label: item.seriesName, value: item.series });
    //     }
    //   },error:(e)=>{
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  onChangeSerieSap(event) {
    // const value: number = event.value.value;
    // this.serieSapService.getNumeroBySerie(value)
    // .subscribe({next:(data: ISerieSap) =>{
    //     this.modeloFormCab2.controls['docNum'].setValue(data.nextNumber);
    //     this.getListSerieSunat(value);
    //   },error:(e)=>{
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  getListSerieSunat(series: number) {
    //  const value: any = { series: series, idUsuario: this.userContextService.getIdUsuario() };
    // this.serieService.getListBySerieIdUsuario(value)
    // .subscribe({next:(data: ISerie[]) =>{
    //     this.listSerSunat = [];
    //     for (let item of data) {
    //       this.listSerSunat.push({ label: item.serieSunat, value: item.serieSunat });
    //     }
    //   },error:(e)=>{
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  onChangeSerie(event) {
    // const value: string = event.value.value;
    // this.serieService.getNumeroBySerie(value)
    // .subscribe({next:(data: ISerie) =>{
    //     this.modeloFormCab2.controls['numSunat'].setValue(data.numeroSunat);
    //   },error:(e)=>{
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  getEstado()
  {
    this.listEstadoItem =
    [
      { idEstado: 1, nomEstado: 'Abiertos' },
      { idEstado: 2, nomEstado: 'Abiertos: Imprimido' },
      { idEstado: 3, nomEstado: 'Cerrado' },
      { idEstado: 4, nomEstado: 'Cancelado' },
      { idEstado: 5, nomEstado: 'No autorizado' },
      { idEstado: 6, nomEstado: 'Pagado' },
      { idEstado: 7, nomEstado: 'Entregado' },
      { idEstado: 8, nomEstado: 'Cerrado - Cancelación' }
    ];

    this.listEstado = [];
    for (let item of this.listEstadoItem) {
      this.listEstado.push({ label: item.nomEstado, value: item.idEstado });
    }

    const item: IEstado = this.listEstadoItem.find(x=>x.idEstado === 1);

    this.modeloFormCab2.controls['estado'].setValue({ label: item.nomEstado, value: item.idEstado });
  }

  getListEmpleadoVenta() {
    this.salesPersonsService.getList()
    .subscribe({next:(data: ISalesPersons[]) =>{
        this.listEmleadoVenta = [];
        for (let item of data) {
          this.listEmleadoVenta.push({ label: item.slpName, value: item.slpCode });
        }
      },error:(e)=>{
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  // getListMotivoTrasladoAll() {
  //   this.valorDefinidoService.getListMotivoTrasladoAll()
  //   .subscribe({next:(data: IValorDefinido[]) =>{
  //       this.listMotivoTraslado = [];
  //       for (let item of data) {
  //         this.listMotivoTraslado.push({ label: item.fullDescr, value: item.fldValue });
  //       }
  //     },error:(e)=>{
  //       this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
  //     }
  //   });
  // }

  getListCondicionPagoAll() {
    // this.CondicionPagoService.getListAll()
    // .subscribe({next:(data: ICondicionPago[]) =>{
    //     this.listCondicionPago = [];
    //     for (let item of data) {
    //       this.listCondicionPago.push({ label: item.pymntGroup, value: item.groupNum });
    //     }
    //   },error:(e)=>{
    //     this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
    //   }
    // });
  }

  // getListTipoTransporteAll() {
  //   this.valorDefinidoService.getListTipoTransporteAll()
  //   .subscribe({next:(data: IValorDefinido[]) =>{
  //       this.listTipoTransporte = [];
  //       for (let item of data) {
  //         this.listTipoTransporte.push({ label: item.fullDescr, value: item.fldValue });
  //       }
  //     },error:(e)=>{
  //       this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
  //     }
  //   });
  // }

  // getListTipoDocumentoIdentidadAll() {
  //   this.valorDefinidoService.getListTipoDocumentoIdentidadAll()
  //   .subscribe({next:(data: IValorDefinido[]) =>{
  //       this.listTipDocIdeConductor = [];
  //       this.listTipDocIdeTransportista = [];
  //       for (let item of data) {
  //         this.listTipDocIdeConductor.push({ label: item.fullDescr, value: item.fldValue });
  //         this.listTipDocIdeTransportista.push({ label: item.fullDescr, value: item.fldValue });
  //       }
  //     },error:(e)=>{
  //       this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
  //     }
  //   });
  // }

  //#region <<< MODAL: Transportista 1 >>>
  onChangeTransportista1(event)
  {
    debugger
    this.manTransportista1 = !event.checked;
    console.log("CHECK 1: ",event);
  }
  onToSelectedTransportista(value) {
    this.codTransportista = value.cardCode;
    this.modeloFormTra.patchValue({ rucTransportista1: value.licTradNum, u_BPP_MDNT1: value.cardName });
  }

  onToVehiculoSelecionado(value) {
    this.numPlaca1 = value.numPlaca;
    //this.modeloFormTra.patchValue({ numPlaca: value.numPlaca });
  }

  onToConductorSelecionado(value) {
    debugger
    this.numDocIdeConductor1 = value.numDocIdeConductor;
    this.modeloFormTra.patchValue({ denConductor1: value.denConductor, u_FIB_NOM_COND1: value.u_FIB_NOM_COND, u_FIB_APE_COND1: value.u_FIB_APE_COND, licConductor1: value.licConductor });
  }
  //#endregion

  //#region <<< MODAL: Transportista 2 >>>
  onChangeTransportista2(event)
  {
    debugger
    this.manTransportista2 = !event.checked;
    console.log("CHECK 2: ",event);
  }

  onToSelectedAgencia(value) {
    this.u_BPP_MDCT = value.cardCode;
    this.modeloFormTra.patchValue({ rucTransportista2: value.licTradNum, u_BPP_MDNT2: value.cardName });
  }
  //#endregion


  getByIdPicking(idPicking: number) {
    this.isDisplay = true;
    this.pickingVentaService.getPickingVentaForEntregaByIdPicking(idPicking)
    .subscribe({next:(data: IEntregaById) =>{
        console.log("MODELO: ", data);
        this.cardCode = data.cardCode;
        this.modeloFormCab1.controls['cardCode'].setValue(data.cardCode);
        this.modeloFormCab1.controls['docCur'].setValue({ label: data.fullCurrName, value: data.currCode });
        this.modeloFormCab1.controls['docRate'].setValue(data.rate);

        this.modeloFormFin.controls['condicionPago'].setValue({ label: data.pymntGroup, value: data.groupNum });

        this.shipToCode = data.shipToCode;
        this.modeloFormLog.controls['shipToCode'].setValue(data.shipToCode);
        this.modeloFormLog.controls['address2'].setValue(data.address2);
        this.payToCode = data.payToCode;
        this.modeloFormLog.controls['payToCode'].setValue(data.payToCode);
        this.modeloFormLog.controls['address'].setValue(data.address);
        this.modeloFormLog.controls['motTraslado'].setValue({ label: data.nomMotTraslado, value: data.u_BPP_MDMT });

        this.modeloFormPie1.controls['empleadoVenta'].setValue({ label: data.slpName, value: data.slpCode });
        this.modeloFormPie1.controls['totalKilo'].setValue(data.peso);

        this.modeloFormPie2.controls['subTotal'].setValue(data.total);
        this.modeloFormPie2.controls['vatSum'].setValue(data.totalImpuesto);
        this.modeloFormPie2.controls['docTotal'].setValue(data.total);

        this.listItem = data.item;
        this.isDisplay = false;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToValidatedSave(){
    debugger

    //const { estado } = this.modeloFormCab2.controls;

    // if (tipoPicking === '' || tipoPicking === null)
    // {
    //   this.isSaving = false;
    //   this.swaCustomService.swaMsgInfo('Seleccione el tipo de picking.');
    //   return false;
    // }

    // if (estado.value === null || estado.value === undefined)
    // {
    //   this.isSaving = false;
    //   this.swaCustomService.swaMsgInfo('Seleccione el estado.');
    //   return false;
    // }

    // if (estado.value.codEstado !== '01')
    // {
    //   this.isSaving = false;
    //   this.swaCustomService.swaMsgInfo('El estado del picking no es válido.');
    //   return false;
    // }

    // if(cardCode.value === '')
    // {
    //   this.isSaving = false;
    //   this.swaCustomService.swaMsgInfo('Seleccione el cliente.');
    //   return false;
    // }

    return true;
  }

  onToSave() {
    this.isSaving = true;
    const tra1 = this.modeloFormTra.controls;

    //if(!this.onToValidatedSave()) return;

    // =================================================================================
    // CABECERA
    // =================================================================================
    if (this.modeloFormCab2.controls['serieSap'].value) {
      let itemSerSap = this.modeloFormCab2.controls['serSap'].value;
      this.modeloSave.series = itemSerSap.value;
    }
    this.modeloSave.docNum = this.modeloFormCab2.controls['docNum'].value;
    if (this.modeloFormCab2.controls['serSunat'].value) {
      let itemSerSunat = this.modeloFormCab2.controls['serSunat'].value;
      this.modeloSave.serieSunat = itemSerSunat.value;
    }
    this.modeloSave.numeroSunat = this.modeloFormCab2.controls['numSunat'].value;
    this.modeloSave.docDate = this.modeloFormCab2.controls['docDate'].value;
    this.modeloSave.docDueDate = this.modeloFormCab2.controls['docDueDate'].value;
    this.modeloSave.taxDate = this.modeloFormCab2.controls['taxDate'].value;
    // =================================================================================
    // CLIENTE
    // =================================================================================
    this.modeloSave.cardCode = this.modeloFormCab1.controls['cardCode'].value;
    this.modeloSave.cardName = this.modeloFormCab1.controls['cardName'].value;
    this.modeloSave.licTradNum = this.modeloFormCab1.controls['licTradNum'].value;
    if (this.modeloFormCab1.controls['docCur'].value) {
      let itemDocCur = this.modeloFormCab1.controls['docCur'].value;
      this.modeloSave.docCur = itemDocCur.value;
    }
    this.modeloSave.docRate = this.modeloFormCab1.controls['docRate'].value;
    // =================================================================================
    // LOGISTICA
    // =================================================================================
    this.modeloSave.shipToCode = this.modeloFormLog.controls['shipToCode'].value;
    this.modeloSave.address2 = this.modeloFormLog.controls['address2'].value;
    this.modeloSave.payToCode = this.modeloFormLog.controls['payToCode'].value;
    this.modeloSave.address = this.modeloFormLog.controls['address'].value;
    if (this.modeloFormLog.controls['motTraslado'].value) {
      let itemMotTraslado = this.modeloFormLog.controls['motTraslado'].value;
      this.modeloSave.u_BPP_MDMT = itemMotTraslado.value;
    }
    this.modeloSave.otrMotTraslado = this.modeloFormLog.controls['otrMotTraslado'].value;
    // =================================================================================
    // FINANZAS
    // =================================================================================
    if (this.modeloFormFin.controls['condicionPago'].value) {
      let itemCondicionPago = this.modeloFormFin.controls['condicionPago'].value;
      this.modeloSave.codCondicionPago = itemCondicionPago.value;
    }
    // =================================================================================
    // EXPORTACION
    // =================================================================================
    this.modeloSave.rucDesInternacional = this.modeloFormExp.controls['rucDesInternacional'].value;
    this.modeloSave.desGuiaInternacional = this.modeloFormExp.controls['desGuiaInternacional'].value;
    this.modeloSave.dirDesInternacional = this.modeloFormExp.controls['dirDesInternacional'].value;
    this.modeloSave.numContenedor = this.modeloFormExp.controls['numContenedor'].value;
    this.modeloSave.numPrecinto01 = this.modeloFormExp.controls['numPrecinto01'].value;
    this.modeloSave.numPrecinto02 = this.modeloFormExp.controls['numPrecinto02'].value;
    this.modeloSave.numPrecinto03 = this.modeloFormExp.controls['numPrecinto03'].value;
    this.modeloSave.numPrecinto04 = this.modeloFormExp.controls['numPrecinto04'].value;
    // =================================================================================
    // TRANSPORTISTA
    // =================================================================================
    if (this.modeloFormTra.controls['tipTransporte'].value) {
      let itemTipTransporte = this.modeloFormTra.controls['tipTransporte'].value;
      this.modeloSave.u_FIB_TIP_TRANS = itemTipTransporte.value;
    }
    // Transportista 1
    this.modeloSave.manTransportista1 = this.modeloFormTra.controls['manTransportista1'].value;
    this.modeloSave.codTransportista1 = this.codTransportista;
    if (this.modeloFormTra.controls['tipDocIdeTransportista1'].value) {
      let itemTipDocIdeTransportista = this.modeloFormTra.controls['tipDocIdeTransportista1'].value;
      this.modeloSave.codTipDocIdeTransportista1 = itemTipDocIdeTransportista.value;
    }
    this.modeloSave.rucTransportista1 = this.modeloFormTra.controls['rucTransportista1'].value;
    this.modeloSave.u_BPP_MDNT1 = this.modeloFormTra.controls['u_BPP_MDNT1'].value;
    this.modeloSave.numPlaca1 = this.numPlaca1;
    // Conductor
    if (this.modeloFormTra.controls['tipDocIdeConductor1'].value) {
      let itemTipDocIdeConductor = this.modeloFormTra.controls['tipDocIdeConductor1'].value;
      this.modeloSave.codTipDocIdeConductor1 = itemTipDocIdeConductor.value;
    }
    this.modeloSave.numDocIdeConductor1 = this.numDocIdeConductor1;
    this.modeloSave.denConductor1 = this.modeloFormTra.controls['denConductor1'].value;
    this.modeloSave.u_FIB_NOM_COND1 = this.modeloFormTra.controls['u_FIB_NOM_COND1'].value;
    this.modeloSave.u_FIB_APE_COND1 = this.modeloFormTra.controls['u_FIB_APE_COND1'].value;
    this.modeloSave.licConductor1 = this.modeloFormTra.controls['licConductor1'].value;
    // Transportista 2
    this.modeloSave.manTransportista2 = this.modeloFormTra.controls['manTransportista2'].value;
    this.modeloSave.codTransportista2 = this.u_BPP_MDCT;
    this.modeloSave.rucTransportista2 = this.modeloFormTra.controls['rucTransportista2'].value;
    this.modeloSave.u_BPP_MDNT2 = this.modeloFormTra.controls['u_BPP_MDNT2'].value;
    this.modeloSave.dirTransportista2 = this.modeloFormTra.controls['dirTransportista2'].value;
    // =================================================================================
    // CONDUCTOR
    // =================================================================================
    if (this.modeloFormPie1.controls['empleadoVenta'].value) {
      let itemEmpleadoVenta = this.modeloFormPie1.controls['empleadoVenta'].value;
      this.modeloSave.slpCode = itemEmpleadoVenta.value;
    }
    this.modeloSave.totalBulto = this.modeloFormPie1.controls['totalBulto'].value;
    this.modeloSave.totalKilo = this.modeloFormPie1.controls['totalKilo'].value;
    this.modeloSave.comments = this.modeloFormPie1.controls['comments'].value;

    this.modeloSave.vatSum = this.modeloFormPie2.controls['vatSum'].value;
    this.modeloSave.docTotal = this.modeloFormPie2.controls['DocTotal'].value;

    this.modeloSave.item = [];

    for (let index = 0; index < this.listItem.length; index++) {
      this.modeloSave.item.push
      ({
        lineNum           : index + 1,
        idBase            : this.listItem[index].idPicking,
        lineBase          : this.listItem[index].lineNum,
        baseType          : this.listItem[index].objType,
        baseEntry         : this.listItem[index].docEntry,
        baseLine          : this.listItem[index].lineNum,
        itemCode          : this.listItem[index].itemCode,
        dscription        : this.listItem[index].dscription,
        whsCode           : this.listItem[index].whsCode,
        unitMsr           : this.listItem[index].unitMsr,
        quantity          : this.listItem[index].quantity,
        peso              : this.listItem[index].peso,
        taxCode           : this.listItem[index].taxCode,
        acctCode          : this.listItem[index].acctCode,
        currency          : this.listItem[index].currency,
        priceBefDi        : this.listItem[index].priceBefDi,
        discPrcnt         : this.listItem[index].discPrcnt,
        price             : this.listItem[index].price,
        lineTotal         : this.listItem[index].total
      });
    }


    console.log(this.modeloSave);

    this.entregaSapService.setCreate(this.modeloSave)
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
    this.router.navigate(['/main/modulo-ven/panel-entrega-list']);
  }
}
