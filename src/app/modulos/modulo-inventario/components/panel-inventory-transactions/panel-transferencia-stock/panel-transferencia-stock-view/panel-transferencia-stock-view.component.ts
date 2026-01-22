import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Subject, forkJoin } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { ITransferenciaStock, ITransferenciaStock1 } from 'src/app/modulos/modulo-inventario/interfaces/transferencia-stock.interface';
import { TransferenciaStockService } from 'src/app/modulos/modulo-inventario/services/transferencia-stock.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/campo-defnido-usuario.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/sales-persons.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/warehouses.service';
import { TipoDocumentoSunatService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/tipo-documento-sunat.service';



@Component({
  selector: 'app-inv-panel-transferencia-stock-view',
  templateUrl: './panel-transferencia-stock-view.component.html',
  styleUrls: ['./panel-transferencia-stock-view.component.css']
})
export class PanelPanelTransferenciaStockViewComponent implements OnInit, OnDestroy {
  // Lifecycle management
  /** Gestión de ciclo de vida y estado inicial */
  private readonly destroy$                     = new Subject<void>();
  private isLoadingInitialData                  = false;

  // Forms
  /** Formularios reactivos de la vista */
  modeloFormSn                                  : FormGroup;
  modeloFormDoc                                 : FormGroup;
  modeloFormTra                                 : FormGroup;
  modeloFormOtr                                 : FormGroup;
  modeloFormPie                                 : FormGroup;
  modeloFormBar                                 : FormGroup;

  // Configuration
  /** Configuración general y constantes */
  readonly titulo                               = 'Transferencia de Stock';
  readonly jrnlMemo                             = 'Traslado - ';
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();
  idLocation                                    = 0;

  // Combos
  /** Listas de soporte para dropdowns */
  tipoDocumentoList                             : SelectItem[] = [];
  serieDocumentoList                            : SelectItem[] = [];
  warehouseList                                 : SelectItem[] = [];
  tipoTransporteList                            : SelectItem[] = [];
  tipoDocumentoIdentidadTranList                : SelectItem[] = [];
  tipoDocumentoIdentidadCondList                : SelectItem[] = [];
  tipoTrasladoList                              : SelectItem[] = [];
  motivoTrasladoList                            : SelectItem[] = [];
  tipoSalidaList                                : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];

  // UI State
  /** Estados de overlays y modales */
  isDisplay                                     = false;
  isVisualizarBarcode                           = false;

  // Table configuration
  /** Configuración de tabla y listas relacionadas */
  columnas                                      : any[];
  opciones                                      : any = [];
  modeloLines                                   : any[] = [];
  bardcodeList                                  : any[];

  // Data
  /** Modelos de cabecera y detalle */
  modelo                                        : ITransferenciaStock;
  detalleSelected                               : ITransferenciaStock1;
  id                                            = 0;
  docEntry                                      = 0;

  // Document numbering
  /** Numeración y flags de documento */
  u_BPP_NDTD                                    : string = '';
  u_BPP_NDSD                                    : string = '';
  u_FIB_TDED                                    : string = 'N';
  u_FIB_TDTD                                    : string = 'Y';
  u_FIB_SEDE                                    : number = 0;

  // Cliente y contacto
  /** Datos del socio de negocio */
  cardCode                                      = '';
  cntctCode                                     = 0;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly transferenciaStockService: TransferenciaStockService,
    private readonly WarehousesService: WarehousesService,
    private readonly tipoDocumentoSunatService: TipoDocumentoSunatService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    public readonly app: LayoutComponent,
    public readonly swaCustomService: SwaCustomService,
    public readonly utilService: UtilService,
    public readonly userContextService: UserContextService,
  ) { }

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // Initialization
  // ===========================

  private initializeComponent(): void {
    // 1. Inicializar idLocation primero (requerido por los combos)
    this.idLocation = this.userContextService.getIdLocation();

    // 2. Construir formularios y configuración básica
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();

    // 3. Cargar todos los combos en paralelo y esperar a que todos terminen
    this.loadAllCombos();
  }

  private loadAllCombos(): void {
    this.u_FIB_SEDE         = this.userContextService.getIdLocation();
    const paramCampo1       : any = { u_FIB_TDTD: 'Y' };
    const paramCampo2       : any = { inactive: 'N' };
    const paramCampo3       : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRANS' };
    const paramCampo4       : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_TRA' };
    const paramCampo5       : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_COND' };
    const paramCampo6       : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRAS' };
    const paramCampo7       : any = { tableID: 'OWTR', aliasID: 'BPP_MDMT' };
    const paramCampo8       : any = { tableID: 'OWTR', aliasID: 'BPP_MDTS' };

    forkJoin({
      tipoDocumento         : this.tipoDocumentoSunatService.getListByTipo(paramCampo1),
      warehouse             : this.WarehousesService.getListByInactive(paramCampo2),
      tipoTransporte        : this.camposDefinidoUsuarioService.getList(paramCampo3),
      tipoDocIdentidadTran  : this.camposDefinidoUsuarioService.getList(paramCampo4),
      tipoDocIdentidadCond  : this.camposDefinidoUsuarioService.getList(paramCampo5),
      tipoTraslado          : this.camposDefinidoUsuarioService.getList(paramCampo6),
      motivoTraslado        : this.camposDefinidoUsuarioService.getList(paramCampo7),
      tipoSalida            : this.camposDefinidoUsuarioService.getList(paramCampo8),
      salesEmployee         : this.salesPersonsService.getList()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        // Tipo Documento
        this.tipoDocumentoList = result.tipoDocumento.map(item => ({
          label: item.u_BPP_TDDD,
          value: item.u_BPP_TDTD
        }));

        // Warehouse
        this.warehouseList = result.warehouse.map(item => ({
          label: item.fullDescr,
          value: item.whsCode
        }));

        // Tipo Transporte
        this.tipoTransporteList = result.tipoTransporte.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        // Tipo Documento Identidad transportista
        this.tipoDocumentoIdentidadTranList = result.tipoDocIdentidadTran.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        // Tipo Documento Identidad conductor
        this.tipoDocumentoIdentidadCondList = result.tipoDocIdentidadCond.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        // Tipo Traslado
        this.tipoTrasladoList = result.tipoTraslado.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        // Motivo Traslado
        this.motivoTrasladoList = result.motivoTraslado.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        // Tipo Salida
        this.tipoSalidaList = result.tipoSalida.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        // Sales Employee
        this.salesEmployeesList = result.salesEmployee.map(item => ({
          label: item.slpName,
          value: item.slpCode
        }));

        // 4. AHORA SÍ cargar datos - los combos están listos
        this.loadData();
      },
      error: (e) => {
        this.swaCustomService.swaMsgError('Error al cargar los combos: ' + (e.error?.resultadoDescripcion || e.message));
      }
    });
  }

  private loadData(): void {
    this.route.params
      .pipe(
        tap(params => this.id = +params['id']),
        switchMap(params => {
          this.isDisplay = true;
          return this.transferenciaStockService.getByDocEntry(+params['id']);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: ITransferenciaStock) => {
          this.isDisplay = false;
          this.modelo = data;
          this.setFormValues(this.modelo);
        },
        error: (e) => {
          this.isDisplay = false;
          this.swaCustomService.swaMsgError(e.error?.resultadoDescripcion || e.message);
        }
      });
  }


  onBuildForm(): void {
    this.modeloFormSn = this.fb.group({
      cardCode                : [{ value: '', disabled: true }],
      cardName                : [{ value: '', disabled: true }],
      cntctCode               : [{ value: '', disabled: true }],
      address                 : [{ value: '', disabled: true }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: true }],
      u_BPP_MDTD              : [{ value: '', disabled: true }, [Validators.required]],
      u_BPP_MDSD              : [{ value: '', disabled: true }, [Validators.required]],
      u_BPP_MDCD              : [{ value: '', disabled: true }, [Validators.required]],
      docDate                 : [{ value: '', disabled: true }, [Validators.required]],
      taxDate                 : [{ value: '', disabled: true }, [Validators.required]],
      filler                  : [{ value: '', disabled: true }, [Validators.required]],
      toWhsCode               : [{ value: '', disabled: true }, [Validators.required]]
    });

    this.modeloFormTra = this.fb.group({
      u_FIB_TIP_TRANS         : [{ value: '', disabled: true }, [Validators.required]],
      u_FIB_TIPDOC_TRA        : [{ value: '', disabled: true }, [Validators.required]],
      u_BPP_MDRT              : [{ value: '', disabled: true }, [Validators.required]],
      u_BPP_MDNT              : [{ value: '', disabled: true }, [Validators.required]],
      u_BPP_MDVC              : [{ value: '', disabled: true }, [Validators.required]],
      u_FIB_TIPDOC_COND       : [{ value: '', disabled: true }, [Validators.required]],
      u_FIB_NUMDOC_COD        : [{ value: '', disabled: true }, [Validators.required]],
      u_FIB_NOM_COND          : [{ value: '', disabled: true }, [Validators.required]],
      u_FIB_APE_COND          : [{ value: '', disabled: true }, [Validators.required]],
      u_BPP_MDFN              : [{ value: '', disabled: true }, [Validators.required]],
      u_BPP_MDFC              : [{ value: '', disabled: true }, [Validators.required]]
    });

    this.modeloFormOtr = this.fb.group({
      u_FIB_TIP_TRAS          : [{ value: '', disabled: true }, [Validators.required]],
      u_BPP_MDMT              : [{ value: '', disabled: true }, [Validators.required]],
      u_BPP_MDTS              : [{ value: '', disabled: true }, [Validators.required]]
    });

    this.modeloFormPie = this.fb.group({
      slpCode                 : [{ value: '', disabled: true }, [Validators.required]],
      u_FIB_NBULTOS           : [{ value: '0', disabled: true }, [Validators.required]],
      u_FIB_KG                : [{ value: '0', disabled: true }, [Validators.required]],
      jrnlMemo                : [{ value: '', disabled: true }, this.jrnlMemo],
      comments                : [{ value: '', disabled: true }]
    });

    this.modeloFormBar = this.fb.group({
      text1                   : ['']
    });
  }

  onBuildColumn(): void {
    this.columnas = [
      { field: 'itemCode',        header: 'Código' },
      { field: 'itemName',        header: 'Descripción' },
      { field: 'fromWhsCod',      header: 'De almacén' },
      { field: 'whsCode',         header: 'Almacén destino' },
      { field: 'u_tipoOpT12Nam',  header: 'Tipo operación' },
      { field: 'unitMsr',         header: 'UM' },
      { field: 'quantity',        header: 'Cantidad' }
    ];
  }

  opcionesTabla(): void {
    this.opciones = [
      { label: 'Visualizar', icon: 'pi pi-eye', command: () => { this.onClickVisualizar(); } }
    ];
  }

  onSelectedItem(modelo: ITransferenciaStock1): void {
    this.detalleSelected = modelo;
    if (this.modeloLines.filter(x => x.itemCode === '').length === 0) {
      this.opciones.find(x => x.label === 'Visualizar').visible = true;
    } else {
      this.opciones.find(x => x.label === 'Visualizar').visible = false;
    }
  }


  //#region <<< MODAL: Cliente >>>
  onSelectedSocioNegocio(value: any) {
    this.cardCode = value.cardCode;
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({ 'cardCode': value.cardCode, 'cardName': value.cardName, 'address': value.address2, 'cntctCode': value.cntctCode });

    const jrnlMemoNew: string = this.jrnlMemo + this.cardCode;
    this.modeloFormPie.patchValue({ 'jrnlMemo' :  jrnlMemoNew });
  }

  onSelectedPersonaContacto(value: any) {
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({ 'cntctCode' : value.cntctCode });
  }
  //#endregion


  //#region  <<< Visualizar >>>
  onClickVisualizar(): void {
    this.isVisualizarBarcode = !this.isVisualizarBarcode;
  }

  onToBuscar(): void {
    // Funcionalidad de picking removida en modo view
  }

  onClear(): void {
    this.bardcodeList = [];
    this.modeloFormBar.patchValue({ text1: '' }, { emitEvent: false });
  }

  onHide(): void {
    this.onClear();
  }

  onClickBarcodeClose()
  {
    this.onClear();
    this.isVisualizarBarcode = !this.isVisualizarBarcode;
  }
  //#endregion

  //#endregion


  private setFormValues(value: ITransferenciaStock): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el detalle durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.docEntry                 = value.docEntry;
    this.cardCode                 = value.cardCode;
    this.cntctCode                = value.cntctCode;

    this.u_BPP_NDTD               = value.u_BPP_MDTD;
    this.u_BPP_NDSD               = value.u_BPP_MDSD;

    // Actualizar formulario Socio de Negocio
    this.modeloFormSn.patchValue(
      {
        cardCode                  : value.cardCode,
        cardName                  : value.cardName,
        cntctCode                 : value.cntctCode,
        address                   : value.address
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para tipo y serie de documento
    const tipoDocItem             = this.tipoDocumentoList.find(item => item.value === value.u_BPP_MDTD);

    // Buscar y asignar valores como SelectItem para los dropdowns de Almacenes
    const fillerItem              = this.warehouseList.find(item => item.value === value.filler);
    const toWhsCodeItem           = this.warehouseList.find(item => item.value === value.toWhsCode);

    // Actualizar formulario de Documento
    this.modeloFormDoc.patchValue(
      {
        docNum                    : value.docNum,
        docDate                   : value.docDate ? new Date(value.docDate) : null,
        taxDate                   : value.taxDate ? new Date(value.taxDate) : null,
        u_BPP_MDTD                : tipoDocItem || null,
        u_BPP_MDSD                : value.u_BPP_MDSD,
        u_BPP_MDCD                : value.u_BPP_MDCD,
        filler                    : fillerItem || null,
        toWhsCode                 : toWhsCodeItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para transporte
    const tipoTransporteItem      = this.tipoTransporteList.find(item => item.value === value.u_FIB_TIP_TRANS);
    const tipoDocIdentidadTranItem    = this.tipoDocumentoIdentidadTranList.find(item => item.value === value.u_FIB_TIPDOC_TRA);
    const tipoDocIdentidadCondItem    = this.tipoDocumentoIdentidadCondList.find(item => item.value === value.u_FIB_TIPDOC_COND);

    // Actualizar formulario Transportista
    this.modeloFormTra.patchValue(
      {
        u_BPP_MDRT                : value.u_BPP_MDRT,
        u_BPP_MDNT                : value.u_BPP_MDNT,
        u_BPP_MDVC                : value.u_BPP_MDVC,
        u_FIB_TIPDOC_COND         : tipoDocIdentidadCondItem || null,
        u_FIB_NUMDOC_COD          : value.u_FIB_NUMDOC_COD,
        u_FIB_NOM_COND            : value.u_FIB_NOM_COND,
        u_FIB_APE_COND            : value.u_FIB_APE_COND,
        u_BPP_MDFN                : value.u_BPP_MDFN,
        u_BPP_MDFC                : value.u_BPP_MDFC,
        u_FIB_TIP_TRANS           : tipoTransporteItem || null,
        u_FIB_TIPDOC_TRA          : tipoDocIdentidadTranItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para campos definidos por usuario
    const tipoTrasladoItem        = this.tipoTrasladoList.find(item => item.value === value.u_FIB_TIP_TRAS);
    const motivoTrasladoItem      = this.motivoTrasladoList.find(item => item.value === value.u_BPP_MDMT);
    const tipoSalidaItem          = this.tipoSalidaList.find(item => item.value === value.u_BPP_MDTS);

    // Actualizar formulario Otros
    this.modeloFormOtr.patchValue(
      {
        u_FIB_TIP_TRAS            : tipoTrasladoItem || null,
        u_BPP_MDMT                : motivoTrasladoItem || null,
        u_BPP_MDTS                : tipoSalidaItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valor como SelectItem para empleado de ventas
    const slpCodeItem             = this.salesEmployeesList.find(item => item.value === value.slpCode);

    // Actualizar formulario Pie
    this.modeloFormPie.patchValue(
      {
        slpCode                   : slpCodeItem || null,
        u_FIB_NBULTOS             : this.utilService.onRedondearDecimalConCero(value.u_FIB_NBULTOS, 3),
        u_FIB_KG                  : this.utilService.onRedondearDecimalConCero(value.u_FIB_KG, 3),
        jrnlMemo                  : value.jrnlMemo,
        comments                  : value.comments
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar detalle después de que los formularios estén actualizados
    // =========================================================================
    // Esto garantiza que los eventos onChange no sobrescriban los valores originales del detalle
    this.modeloLines = value.lines;
    this.isLoadingInitialData = false;
  }



  onClickBack() {
    this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-list']);
  }
}
