import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Subject, forkJoin } from 'rxjs';
import { finalize, switchMap, takeUntil, tap } from 'rxjs/operators';
import Swal from 'sweetalert2';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/campo-defnido-usuario.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/sales-persons.service';
import { TipoDocumentoSunatService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/tipo-documento-sunat.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/warehouses.service';
import { IPicking } from 'src/app/modulos/modulo-inventario/interfaces/picking.inteface';
import { ITransferenciaStock, ITransferenciaStock1 } from 'src/app/modulos/modulo-inventario/interfaces/transferencia-stock.interface';
import { TransferenciaStockUpdateModel } from 'src/app/modulos/modulo-inventario/models/transferencia-stock.model';
import { PickingService } from 'src/app/modulos/modulo-inventario/services/picking.service';
import { TransferenciaStockService } from 'src/app/modulos/modulo-inventario/services/transferencia-stock.service';
import { NumeracionDocumentoSunatService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/numeracion-documento-sunat.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { UtilService } from 'src/app/services/util.service';


@Component({
  selector: 'app-inv-panel-transferencia-stock-edit',
  templateUrl: './panel-transferencia-stock-edit.component.html',
  styleUrls: ['./panel-transferencia-stock-edit.component.css']
})
export class PanelPanelTransferenciaStockEditComponent implements OnInit, OnDestroy {
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

  // Combos
  /** Listas de soporte para dropdowns */
  tipoDocumentoList                             : SelectItem[] = [];
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
  isSaving                                      = false;
  isDisplay                                     = false;
  isVisualizarCodebar                           = false;

  // Table configuration
  /** Configuración de tabla y listas relacionadas */
  columnas                                      : any[];
  columnasModal                                 : any[];
  opciones                                      : any = [];
  bardcodeList                                  : any[];

  // Data
  /** Modelos y datos de documento */
  id                                            = 0;
  docEntry                                      = 0;
  modelo                                        : ITransferenciaStock;
  modeloLines                                   : ITransferenciaStock1[] = [];
  modeloSelected                                : ITransferenciaStock1;

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

  // Change Detection
  /** Seguimiento de cambios reales */
  private initialSnapshot!                      : any;
  private isInitializing                        = true;
  hasRealChanges                                = false;

  constructor(
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService,
    private readonly warehousesService: WarehousesService,
    private readonly pickingService: PickingService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly tipoDocumentoSunatService: TipoDocumentoSunatService,
    private readonly transferenciaStockService: TransferenciaStockService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    private readonly numeracionDocumentoSunatService: NumeracionDocumentoSunatService,
    public  readonly utilService: UtilService,
  ) { }

  // ===========================
  // 1. Lifecycle Hooks
  // ===========================
  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // 2. Initialization
  // ===========================
  private initializeComponent(): void {
    // Construir formularios y configuración básica
    this.buildForms();
    this.subscribeReqDate();
    this.buildColumns();
    this.buildTableOptions();
    this.initializeBlur();

    // Cargar todos los combos en paralelo y esperar a que todos terminen
    this.loadAllCombos();
  }

  private initializeBlur(): void {
    this.blurNBultos();
    this.blurPesoKg();
  }

  // ===========================
  // 3. Form Building
  // ===========================
  private buildForms(): void {
    this.modeloFormSn = this.fb.group({
      cardCode            : [{ value: '', disabled: true }],
      cardName            : [{ value: '', disabled: true }],
      cntctCode           : [{ value: '', disabled: true }],
      address             : [{ value: '', disabled: true }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum              : [{ value: '', disabled: true }],
      u_BPP_MDTD          : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDSD          : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDCD          : [{ value: '', disabled: false }, [Validators.required]],
      docDate             : [{ value: '', disabled: true }, [Validators.required]],
      taxDate             : [{ value: '', disabled: false }, [Validators.required]],
      filler              : [{ value: '', disabled: true }, [Validators.required]],
      toWhsCode           : [{ value: '', disabled: true }, [Validators.required]]
    });

    this.modeloFormTra = this.fb.group({
      u_FIB_TIP_TRANS     : [{ value: '', disabled: false }],
      u_FIB_TIPDOC_TRA    : [{ value: '', disabled: false }],
      u_BPP_MDRT          : [{ value: '', disabled: false }],
      u_BPP_MDNT          : [{ value: '', disabled: false }],
      u_BPP_MDVC          : [{ value: '', disabled: false }],
      u_FIB_TIPDOC_COND   : [{ value: '', disabled: false }],
      u_FIB_NUMDOC_COD    : [{ value: '', disabled: false }],
      u_FIB_NOM_COND      : [{ value: '', disabled: false }],
      u_FIB_APE_COND      : [{ value: '', disabled: false }],
      u_BPP_MDFN          : [{ value: '', disabled: true }],
      u_BPP_MDFC          : [{ value: '', disabled: false }]
    });

    this.modeloFormOtr = this.fb.group({
      u_FIB_TIP_TRAS      : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDMT          : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDTS          : [{ value: '', disabled: false }, [Validators.required]]
    });

    this.modeloFormPie = this.fb.group({
      slpCode             : [{ value: '', disabled: true }, [Validators.required]],
      u_FIB_NBULTOS       : [{ value: '0.00', disabled: false }, [Validators.required]],
      u_FIB_KG            : [{ value: '0.00', disabled: false }, [Validators.required]],
      jrnlMemo            : [this.jrnlMemo],
      comments            : ['']
    });

    this.modeloFormBar = this.fb.group({
      u_CodeBar           : ['']
    });
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'itemCode',        header: 'Código' },
      { field: 'itemName',        header: 'Descripción' },
      { field: 'fromWhsCod',      header: 'De almacén' },
      { field: 'whsCode',         header: 'Almacén destino' },
      { field: 'u_tipoOpT12Nam',  header: 'Tipo operación' },
      { field: 'unitMsr',         header: 'UM' },
      { field: 'quantity',        header: 'Cantidad' }
    ];
    this.columnasModal = [
      { field: 'u_ItemCode',      header: 'Código' },
      { field: 'u_CodeBar',       header: 'Barcode' },
      { field: 'u_Quantity',      header: 'Cantidad' },
      { field: 'u_WeightKg',      header: 'Peso' }
    ];
  }

  private buildTableOptions(): void {
    this.opciones = [
      { label: 'Visualizar', icon: 'pi pi-eye', command: () => { this.onClickVisualizar(); } }
    ];
  }

  // ===========================
  // 4. Data Loading
  // ===========================
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
      warehouse             : this.warehousesService.getListByInactive(paramCampo2),
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
        this.utilService.handleErrorSingle(e, 'loadAllCombos', () => {}, this.swaCustomService);
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
          this.utilService.handleErrorSingle(e, 'loadData', () => { this.isDisplay = false; }, this.swaCustomService);
        }
      });
  }

  // ===========================
  // 5. Form Events & Subscriptions
  // ===========================
  /** Se suscribe a cambios en el nombre del conductor */
  private subscribeReqDate(): void {
    // Nombre del conductor
    this.modeloFormTra.get('u_FIB_NOM_COND')
    ?.valueChanges
    .subscribe(() => {
      this.onChangeNomConductor();
    });

    // Apellidos del conductor
    this.modeloFormTra.get('u_FIB_APE_COND')
    ?.valueChanges
    .subscribe(() => {
      this.onChangeNomConductor();
    });
  }

  private formatNumericFormControl(controlName: string, precision: number): void {
    const control = this.modeloFormPie.get(controlName);

    if (control) {
      const valueStr = String(control.value).replace(/,/g, '').trim();
      const formattedValue = this.utilService.onRedondearDecimalConCero(Number(valueStr) || 0,precision);

      control.setValue(formattedValue, { emitEvent: false });

      // Detecta cambios reales
      this.detectRealChanges();
    }
  }

  blurNBultos(): void {
    this.formatNumericFormControl('u_FIB_NBULTOS', 3);
  }

  blurPesoKg(): void {
    this.formatNumericFormControl('u_FIB_KG', 3);
  }

  onSelectedItem(modelo: ITransferenciaStock1): void {
    this.modeloSelected = modelo;

    // Verificar si hay ítems vacíos de manera más eficiente
    const hasEmptyItems = this.modeloLines.some(x => x.itemCode === '');

    // Actualizar visibilidad de la opción "Visualizar" con validación
    const visualizarOption = this.opciones.find(x => x.label === 'Visualizar');
    if (visualizarOption) {
      visualizarOption.visible = !hasEmptyItems;
    }
  }

  onSelectedSocioNegocio(value: any): void {
    if(value) {
      this.cardCode   = value.cardCode;
      this.cntctCode  = value.cntctCode;
      this.modeloFormSn.patchValue({
        cardCode      : value.cardCode,
        cardName      : value.cardName,
        address       : value.address2,
        cntctCode     : value.cntctCode
      }, { emitEvent  : false });

      const jrnlMemoNew = this.jrnlMemo + this.cardCode;
      this.modeloFormPie.patchValue({ jrnlMemo: jrnlMemoNew }, { emitEvent: false });
    }
  }

  onSelectedPersonaContacto(value: any): void {
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({ cntctCode: value.cntctCode }, { emitEvent: false });
  }

  onChangeNomConductor(): void {
    const nombre = this.modeloFormTra.get('u_FIB_NOM_COND')?.value || '';
    const apellido = this.modeloFormTra.get('u_FIB_APE_COND')?.value || '';

    const nombreCompleto = `${nombre} ${apellido}`.trim();

    this.modeloFormTra.get('u_BPP_MDFN').setValue(nombreCompleto, { emitEvent: false });
  }

  // Tipo y Serie de Documento
  private getNumeroDocumentoByTipoSerie(u_BPP_NDTD: string, u_BPP_NDSD: string): void {
    const params = { u_BPP_NDTD: u_BPP_NDTD, u_BPP_NDSD: u_BPP_NDSD };
    this.numeracionDocumentoSunatService.getNumeroDocumentoByTipoSerie(params)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': data.u_BPP_NDCD });
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getNumeroDocumentoByTipoSerie', null, this.swaCustomService);
      }
    });
  }

  onChangeTipoDocumento(event: any): void {
    if (event.value) {
      const u_BPP_NDTD = event.value.value || event.value;
      const u_BPP_NDSD = this.modeloFormDoc.controls['u_BPP_MDSD'].value;

      if (u_BPP_NDSD) {
        this.getNumeroDocumentoByTipoSerie(u_BPP_NDTD, u_BPP_NDSD);
      } else {
        this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': '' });
      }
    } else {
      this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': '' });
    }
  }

  onSelectedSerieDocumento(value: any): void {
    if(value) {
      this.modeloFormDoc.patchValue({
        'u_BPP_MDSD': value.u_BPP_NDSD,
        'u_BPP_MDCD': value.u_BPP_NDCD
      }, { emitEvent: false });

      // Detecta cambios reales
      this.detectRealChanges();
    }
  }

  // ===========================
  // 6. Change Detection
  // ===========================
  private watchChanges(): void {
    this.modeloFormDoc.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormTra.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormOtr.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormPie.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());
  }

  private detectRealChanges(): void {
    // 🔒 No detectar cambios durante inicialización
    if (this.isInitializing) {
      return;
    }

    const currentSnapshot = JSON.stringify({
      doc: this.modeloFormDoc.getRawValue(),
      tra: this.modeloFormTra.getRawValue(),
      otr: this.modeloFormOtr.getRawValue(),
      pie: this.modeloFormPie.getRawValue()
    });

    this.hasRealChanges =
      currentSnapshot !== this.initialSnapshot;
  }

  // ===========================
  // 7. Modal Methods
  // ===========================
  onClickVisualizar(): void {
    this.isVisualizarCodebar = true;
    this.loadModalData();
  }

  onClickBuscarModal(): void {
    this.loadModalData();
  }

  private loadModalData(): void {
    debugger
    this.isDisplay = true;
    this.bardcodeList = [];

    const { u_CodeBar } = this.modeloFormBar.value;
    const value: any = {
      u_TrgetEntry  : this.modeloSelected.docEntry,
      u_TargetType  : Number(this.modeloSelected.objType),
      u_TrgetLine   : this.modeloSelected.lineNum,
      u_CodeBar     : u_CodeBar
    };

    this.pickingService.getListByTarget(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IPicking[]) => {
          this.isDisplay = false;
          this.bardcodeList = data;
        },
        error: (e) => {
          this.bardcodeList = [];
          this.isDisplay = false;
          this.showModalError(e.error?.resultadoDescripcion || 'Ocurrió un error inesperado.');
        }
      });
  }

  private showModalError(message: string): Promise<any> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: { container: 'my-swal' },
      target: document.getElementById('modal')
    });

    return swalWithBootstrapButtons.fire(
      this.globalConstants.msgInfoSummary,
      message,
      'error'
    );
  }

  onClearModel(): void {
    this.bardcodeList = [];
    this.modeloFormBar.patchValue({ text1: '' });
  }

  onHideModal(): void {
    this.onClearModel();
  }

  onClickCloseModal(): void {
    this.onClearModel();
    this.isVisualizarCodebar = false;
  }

  // ===========================
  // 8. Set Form Values
  // ===========================
  private setFormValues(value: ITransferenciaStock): void {
    // 1️⃣ cargar datos desde BD

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
    this.modeloFormSn.patchValue(value, { emitEvent: false });

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
    const tipoTransporteItem          = this.tipoTransporteList.find(item => item.value === value.u_FIB_TIP_TRANS);
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

    // 2️⃣ aplicar blur inicial (formateo visual)
    this.initializeBlur();

    // 3️⃣ crear snapshot FINAL
    this.initialSnapshot = JSON.stringify({
      doc: this.modeloFormDoc.getRawValue(),
      tra: this.modeloFormTra.getRawValue(),
      otr: this.modeloFormOtr.getRawValue(),
      pie: this.modeloFormPie.getRawValue()
    });

    // 4️⃣ terminar inicialización
    this.isInitializing = false;

    // 5️⃣ empezar a escuchar cambios
    this.watchChanges();
  }

  // ===========================
  // 9. Save Operations
  // ===========================
  private validateSave(): boolean {
    const showError = (message: string): boolean => {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo(message);
      return false;
    };

    const { filler, toWhsCode } = this.modeloFormDoc.getRawValue();
    const fillerValue = filler?.value || filler;
    const toWhsCodeValue = toWhsCode?.value || toWhsCode;

    if (fillerValue === toWhsCodeValue) {
      return showError('El almacén de destino no puede ser idéntico al almacén de origen.');
    }

    if (this.modeloLines.length === 0 || this.modeloLines.some(d => d.itemCode === '')) {
      return showError('Ingrese los datos en el detalle de la transferencia.');
    }

    for (const line of this.modeloLines) {
      if (line.fromWhsCod === line.whsCode) {
        return showError('El almacén de destino no puede ser idéntico al almacén de origen.');
      }
      if (!line?.u_tipoOpT12) {
        return showError('Seleccione el tipo operación en el detalle.');
      }
      if (line.quantity === 0) {
        return showError('La cantidad debe ser mayor que CERO (0).');
      }
    }

    return true;
  }

  private buildModelToSave(): TransferenciaStockUpdateModel {
    const formValues = {
      ...this.modeloFormSn.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormTra.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormPie.getRawValue(),
    };

    const userId = this.userContextService.getIdUsuario();

    const u_FIB_NBULTOS : number = Number(String(formValues.u_FIB_NBULTOS).replace(/,/g, '').trim() || 0);
    const u_FIB_KG      : number = Number(String(formValues.u_FIB_KG).replace(/,/g, '').trim() || 0);

    return {
      ...new TransferenciaStockUpdateModel(),
      ...formValues,
      docEntry              : this.docEntry,
      taxDate               : this.utilService.normalizeDate(formValues.taxDate),
      u_BPP_MDTD            : formValues.u_BPP_MDTD?.value || formValues.u_BPP_MDTD || '',
      u_BPP_MDSD            : formValues.u_BPP_MDSD?.value || formValues.u_BPP_MDSD || '',
      u_BPP_MDCD            : formValues.u_BPP_MDCD || '',
      u_FIB_TIP_TRANS       : formValues.u_FIB_TIP_TRANS?.value || formValues.u_FIB_TIP_TRANS || '',
      u_FIB_TIPDOC_TRA      : formValues.u_FIB_TIPDOC_TRA?.value || formValues.u_FIB_TIPDOC_TRA || '',
      u_BPP_MDRT            : formValues.u_BPP_MDRT || '',
      u_BPP_MDNT            : formValues.u_BPP_MDNT || '',
      u_BPP_MDVC            : formValues.u_BPP_MDVC || '',
      u_FIB_TIPDOC_COND     : formValues.u_FIB_TIPDOC_COND?.value || formValues.u_FIB_TIPDOC_COND || '',
      u_FIB_NUMDOC_COD      : formValues.u_FIB_NUMDOC_COD || '',
      u_FIB_NOM_COND        : formValues.u_FIB_NOM_COND || '',
      u_FIB_APE_COND        : formValues.u_FIB_APE_COND || '',
      u_BPP_MDFN            : formValues.u_BPP_MDFN || '',
      u_BPP_MDFC            : formValues.u_BPP_MDFC || '',
      u_FIB_TIP_TRAS        : formValues.u_FIB_TIP_TRAS?.value || formValues.u_FIB_TIP_TRAS || '',
      u_BPP_MDMT            : formValues.u_BPP_MDMT?.value || formValues.u_BPP_MDMT || '',
      u_BPP_MDTS            : formValues.u_BPP_MDTS?.value || formValues.u_BPP_MDTS || '',
      u_FIB_NBULTOS         : u_FIB_NBULTOS,
      u_FIB_KG              : u_FIB_KG,
      u_UsrUpdate           : userId,
      lines                 : this.modeloLines.map(line => ({ ...line })),
    };
  }

  private save(): void {
    this.isSaving = true;

    if (!this.validateSave()) {
      return;
    }

    const modeloToSave = this.buildModelToSave();

    this.transferenciaStockService.setUpdate(modeloToSave)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isSaving = false; })
      )
      .subscribe({
        next: () => {
          this.swaCustomService.swaMsgExito(null);
          this.onClickBack();
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'save', () => { this.isSaving = false; }, this.swaCustomService);
        }
      });
  }

  // ===========================
  // 10. UI Actions
  // ===========================
  onClickSave(): void {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.save();
      }
    });
  }

  onClickBack(): void {
    this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-list']);
  }
}
