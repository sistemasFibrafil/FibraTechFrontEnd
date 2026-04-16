import { SelectItem } from 'primeng/api';
import Swal from 'sweetalert2';
import { Subject, forkJoin, merge } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { StockTransfers1UpdateModel, StockTransfersUpdateModel } from 'src/app/modulos/modulo-inventario/models/stock-transfers.model';

import { IPicking } from 'src/app/modulos/modulo-inventario/interfaces/picking.inteface';
import { IStockTransfers, ITransferenciaStock1 } from 'src/app/modulos/modulo-inventario/interfaces/stock-transfers.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { PickingService } from 'src/app/modulos/modulo-inventario/services/picking.service';
import { StockTransfersService } from 'src/app/modulos/modulo-inventario/services/stock-transfers.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { DocumentTypeSunatService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-type-sunat.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { DocumentNumberingSeriesSunatService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.service';


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
  warehouseList                                 : SelectItem[] = [];
  outputTypeList                                : SelectItem[] = [];
  transferTypeList                              : SelectItem[] = [];
  typeTransportList                             : SelectItem[] = [];
  reasonTransferList                            : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];
  documentTypeSunatList                         : SelectItem[] = [];
  typeCarrierIdentityDocumentList               : SelectItem[] = [];
  typeDriversIdentityDocumentList               : SelectItem[] = [];
  typeIdentityDocumentTransportList             : SelectItem[] = [];

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

  modeloLines                                   : ITransferenciaStock1[] = [];
  modeloSelected                                : ITransferenciaStock1;

  // Document numbering
  /** Numeración y flags de documento */
  idUsuario                                     : number = 0;

  u_BPP_NDTD                                    : string = '';
  u_BPP_NDSD                                    : string = '';
  u_BPP_MDVC                                    : string = '';
  u_FIB_COD_TRA                                 : string = '';
  u_FIB_NUMDOC_COD                              : string = '';

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
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly cdr: ChangeDetectorRef,
    private readonly pickingService: PickingService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly stockTransfersService: StockTransfersService,
    private readonly documentTypeSunatService: DocumentTypeSunatService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    private readonly DocumentNumberingSeriesSunatService: DocumentNumberingSeriesSunatService,
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
    this.buildColumns();
    this.buildTableOptions();

    // Cargar todos los combos en paralelo y esperar a que todos terminen
    this.loadAllCombos();
  }

  // ===========================
  // 3. Form Building
  // ===========================
  private buildForms(): void {
    this.modeloFormSn = this.fb.group({
      cardCode            : [{ value: '', disabled: false }],
      cardName            : [{ value: '', disabled: false }],
      cntctCode           : [{ value: '', disabled: false }],
      address             : [{ value: '', disabled: false }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum              : [{ value: '', disabled: false }],
      u_BPP_MDTD          : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDSD          : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDCD          : [{ value: '', disabled: false }, [Validators.required]],
      docDate             : [{ value: '', disabled: false }, [Validators.required]],
      taxDate             : [{ value: '', disabled: false }, [Validators.required]],
      filler              : [{ value: '', disabled: false }, [Validators.required]],
      toWhsCode           : [{ value: '', disabled: false }, [Validators.required]]
    });

    this.modeloFormTra = this.fb.group({
      typeTransport               : [{ value: '', disabled: false }],
      u_FIB_COD_TRA               : [{ value: '', disabled: false }],
      typeCarrierIdentityDocument : [{ value: '', disabled: false }],
      u_BPP_MDRT                  : [{ value: '', disabled: false }],
      u_BPP_MDNT                  : [{ value: '', disabled: false }],
      u_BPP_MDVC                  : [{ value: '', disabled: false }],

      typeDriversIdentityDocument : [{ value: '', disabled: false }],
      u_FIB_NUMDOC_COD            : [{ value: '', disabled: false }],
      u_FIB_NOM_COND              : [{ value: '', disabled: false }],
      u_FIB_APE_COND              : [{ value: '', disabled: false }],
      u_BPP_MDFN                  : [{ value: '', disabled: true }],
      u_BPP_MDFC                  : [{ value: '', disabled: false }]
    });

    this.modeloFormOtr = this.fb.group({
      transferType              : [{ value: '', disabled: false }, [Validators.required]],
      reasonTransfer            : [{ value: '', disabled: false }, [Validators.required]],
      outputType                : [{ value: '', disabled: false }, [Validators.required]]
    });

    this.modeloFormPie = this.fb.group({
      slpCode             : [{ value: '', disabled: false }, [Validators.required]],
      u_FIB_NBULTOS       : [{ value: this.utilService.onRedondearDecimalConCero(0,3), disabled: false }, [Validators.required]],
      u_FIB_KG            : [{ value: this.utilService.onRedondearDecimalConCero(0,3), disabled: false }, [Validators.required]],
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
      { field: 'u_FIB_NBulto',    header: 'N° bulto' },
      { field: 'u_FIB_PesoKg',    header: 'Kg' },
      { field: 'quantity',        header: 'Cantidad' }
    ];

    this.columnasModal =
    [
      { field: 'u_ItemCode',      header: 'Código' },
      { field: 'u_CodeBar',       header: 'Barcode' },
      { field: 'u_unitMsr',       header: 'UM' },
      { field: 'u_WeightKg',      header: 'Kg' },
      { field: 'u_Quantity',      header: 'Cantidad' },
    ];
  }

  private buildTableOptions(): void {
    this.opciones = [
      { label: 'Ver',           icon: 'pi pi-eye', command: () => { this.onClickVer(); } }
    ];
  }

  // ===========================
  // 4. Data Loading
  // ===========================
  private loadAllCombos(): void {
    this.idUsuario                            = this.userContextService.getIdUsuario();
    const paramWarehouses                     : any = { inactive: 'N' };
    const paramOutputType                     : any = { tableID: 'OWTR', aliasID: 'BPP_MDTS' };
    const paramTransferType                   : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRAS' };
    const paramTypeTransport                  : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRANS' };
    const paramReasonTransfer                 : any = { tableID: 'OWTR', aliasID: 'BPP_MDMT' };
    const paramDocumentTypeSunat              : any = { u_FIB_ENTR: '', u_FIB_FAVE: '', u_FIB_TRAN: 'Y' };
    const paramTypeDriverIdentityDocument     : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_COND' };
    const paramTypeCarrierIdentityDocument    : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_TRA' };
    const paramTypeIdentityDocumentTransport  : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_TRA' };

    // Mostrar spinner mientras se cargan los combos
    this.isDisplay = true;

    forkJoin({
      warehouses                      : this.warehousesService.getListByInactive(paramWarehouses),
      outputType                      : this.camposDefinidoUsuarioService.getList(paramOutputType),
      transferType                    : this.camposDefinidoUsuarioService.getList(paramTransferType),
      typeTransport                   : this.camposDefinidoUsuarioService.getList(paramTypeTransport),
      reasonTransfer                  : this.camposDefinidoUsuarioService.getList(paramReasonTransfer),
      salesEmployees                  : this.salesPersonsService.getList(),
      documentTypeSunat               : this.documentTypeSunatService.getListByType(paramDocumentTypeSunat),
      typeDriverIdentityDocument      : this.camposDefinidoUsuarioService.getList(paramTypeDriverIdentityDocument),
      typeCarrierIdentityDocument     : this.camposDefinidoUsuarioService.getList(paramTypeCarrierIdentityDocument),
      typeIdentityDocumentTransport   : this.camposDefinidoUsuarioService.getList(paramTypeIdentityDocumentTransport),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {
        this.warehouseList = (res.warehouses || []).map(item => ({ label: item.fullDescr, value: item.whsCode }));
        this.outputTypeList = (res.outputType || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.transferTypeList = (res.transferType || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.typeTransportList = (res.typeTransport || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.reasonTransferList = (res.reasonTransfer || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.salesEmployeesList = (res.salesEmployees || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.documentTypeSunatList = (res.documentTypeSunat || []).map(item => ({ label: item.u_BPP_TDDD, value: item.u_BPP_TDTD }));
        this.typeDriversIdentityDocumentList = (res.typeDriverIdentityDocument || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.typeCarrierIdentityDocumentList = (res.typeCarrierIdentityDocument || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.typeIdentityDocumentTransportList = (res.typeIdentityDocumentTransport || []).map(item => ({ label: item.descr, value: item.fldValue }));


        const defaultTipoDoc = res.documentTypeSunat.find(item => item.u_BPP_TDTD === '09');
        if (defaultTipoDoc) {
          this.u_BPP_NDTD = defaultTipoDoc.u_BPP_TDTD;
          this.modeloFormDoc.get('u_BPP_MDTD').setValue({
            label: defaultTipoDoc.u_BPP_TDDD,
            value: defaultTipoDoc.u_BPP_TDTD
          });
        }

        const defaultTipoTraslado = res.transferType.find(item => item.fldValue === '01');
        if (defaultTipoTraslado) {
          this.modeloFormOtr.get('transferType').setValue({
            label: defaultTipoTraslado.descr,
            value: defaultTipoTraslado.fldValue
          });
        }

        const defaultMotivo = res.reasonTransfer.find(item => item.fldValue === '04');
        if (defaultMotivo) {
          this.modeloFormOtr.get('reasonTransfer').setValue({
            label: defaultMotivo.descr,
            value: defaultMotivo.fldValue
          });
        }

        const defaultTipoSalida = res.outputType.find(item => item.fldValue === 'TSI');
        if (defaultTipoSalida) {
          this.modeloFormOtr.get('outputType').setValue({
            label: defaultTipoSalida.descr,
            value: defaultTipoSalida.fldValue
          });
        }

        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  private loadData(): void {
    this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.id = +params['id'];

        // 🔥 aquí sí se activa de forma confiable
        this.isDisplay = true;

        return this.stockTransfersService
          .getByDocEntry(this.id)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IStockTransfers) => {
        this.setFormValues(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
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

  resetTransportista(): void {
    const typeTransport = this.modeloFormTra.get('typeTransport')?.value;

    this.u_FIB_COD_TRA = '';

    this.modeloFormTra.reset({
      typeTransport: typeTransport,   // ← se mantiene
      u_FIB_COD_TRA: '',
      typeCarrierIdentityDocument: '',
      u_FIB_RUC_TRANS2: '',
      u_FIB_TRANS2: '',
      u_BPP_MDVC: '',

      typeDriversIdentityDocument: '',
      u_FIB_NUMDOC_COD: '',
      u_FIB_NOM_COND: '',
      u_FIB_APE_COND: '',
      u_BPP_MDFN: '',
      u_BPP_MDFC: '',
    }, { emitEvent: false });
  }

  onSelectedTransportista(value) {
    this.resetTransportista();

    this.u_FIB_COD_TRA = value.cardCode;

    const typeCarrierIdentityDocumentItem = this.typeCarrierIdentityDocumentList.find(item => item.value === value.u_BPP_BPTD);

    this.modeloFormTra.patchValue({
      'u_FIB_COD_TRA'               : this.utilService.normalizePrimitive(value.cardCode),
      'typeCarrierIdentityDocument' : typeCarrierIdentityDocumentItem || null,
      'u_BPP_MDRT'                  : this.utilService.normalizePrimitive(value.licTradNum),
      'u_BPP_MDNT'                  : this.utilService.normalizePrimitive(value.cardName)
    }, { emitEvent: false });
  }

  onSelectedVehiculo(value) {
    this.modeloFormTra.patchValue({
      'u_BPP_MDVC'                  : this.utilService.normalizePrimitive(value.u_BPP_VEPL)
    }, { emitEvent: false });
  }

  onSelectedConductor(value) {
    const typeDriversIdentityDocumentItem = this.typeDriversIdentityDocumentList.find(item => item.value === value.u_FIB_CHTD);

    this.modeloFormTra.patchValue({
      typeDriversIdentityDocument   : typeDriversIdentityDocumentItem || null,
      u_FIB_NUMDOC_COD              : this.utilService.normalizePrimitive(value.u_FIB_CHND),
      u_FIB_NOM_COND                : this.utilService.normalizePrimitive(value.u_BPP_CHNO),
      u_FIB_APE_COND                : this.utilService.normalizePrimitive(value.u_FIB_CHAP),
      u_BPP_MDFN                    : (this.utilService.normalizePrimitive(value?.u_BPP_CHNO) + ' ' + this.utilService.normalizePrimitive(value?.u_FIB_CHAP)).trim(),
      u_BPP_MDFC                    : this.utilService.normalizePrimitive(value.u_BPP_CHLI),
    }, { emitEvent: false });
  }

  // Tipo y Serie de Documento
  private getNumeroDocumentoByTipoSerie(u_BPP_NDTD: string, u_BPP_NDSD: string): void {
    const params = { u_BPP_NDTD: u_BPP_NDTD, u_BPP_NDSD: u_BPP_NDSD };
    this.DocumentNumberingSeriesSunatService.getNumeroDocumentoByTipoSerie(params)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: any) => {
        this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': data.u_BPP_NDCD });
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getNumeroDocumentoByTipoSerie', this.swaCustomService);
      }
    });
  }

  onChangeTipoDocumento(event: any): void {
    if (event.value) {
      this.u_BPP_NDTD = event.value.value || event.value;
      const u_BPP_NDSD = this.modeloFormDoc.controls['u_BPP_MDSD'].value;

      if (u_BPP_NDSD) {
        this.getNumeroDocumentoByTipoSerie(this.u_BPP_NDTD, u_BPP_NDSD);
      } else {
        this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': '' });
      }
    } else {
      this.u_BPP_NDTD = '';
      this.u_BPP_NDSD = '';
      this.modeloFormDoc.patchValue({ 'u_BPP_MDSD': '','u_BPP_MDCD': '' });
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
      merge(
        this.modeloFormDoc.valueChanges,
        this.modeloFormTra.valueChanges,
        this.modeloFormOtr.valueChanges,
        this.modeloFormPie.valueChanges
      )
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

  onClickVer(): void {
    this.isVisualizarCodebar = true;
    this.loadModalData();
  }

  onClickBuscarModal(): void {
    this.loadModalData();
  }

  private loadModalData(): void {
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

  onClearModel(): void {
    this.bardcodeList = [];
    this.isVisualizarCodebar = false;
    this.modeloFormBar.patchValue({ u_CodeBar: '' });
  }

  onHideModal(): void {
    this.onClearModel();
  }

  onClickCloseModal(): void {
    this.onClearModel();
  }

  // ===========================
  // 8. Set Form Values
  // ===========================
  private setFormValues(value: IStockTransfers): void {
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
    this.u_FIB_COD_TRA            = value.u_FIB_COD_TRA;
    this.u_BPP_MDVC               = value.u_BPP_MDVC;
    this.u_FIB_NUMDOC_COD         = value.u_FIB_NUMDOC_COD;

    // Actualizar formulario Socio de Negocio
    this.modeloFormSn.patchValue(value, { emitEvent: false });

    // Buscar y asignar valores como SelectItem para tipo y serie de documento
    const tipoDocItem             = this.documentTypeSunatList.find(item => item.value === value.u_BPP_MDTD);

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
        u_BPP_MDSD                : this.utilService.normalizePrimitive(value.u_BPP_MDSD),
        u_BPP_MDCD                : this.utilService.normalizePrimitive(value.u_BPP_MDCD),
        filler                    : fillerItem || null,
        toWhsCode                 : toWhsCodeItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para transporte
    const tipoTransporteItem          = this.typeTransportList.find(item => item.value === value.u_FIB_TIP_TRANS);
    const tipoDocIdentidadTranItem    = this.typeIdentityDocumentTransportList.find(item => item.value === value.u_FIB_TIPDOC_TRA);
    const tipoDocIdentidadCondItem    = this.typeDriversIdentityDocumentList.find(item => item.value === value.u_FIB_TIPDOC_COND);

    // Actualizar formulario Transportista
    this.modeloFormTra.patchValue(
      {
        typeTransport               : tipoTransporteItem || null,
        u_FIB_COD_TRA               : this.utilService.normalizePrimitive(value.u_FIB_COD_TRA),
        typeCarrierIdentityDocument : tipoDocIdentidadTranItem || null,
        u_BPP_MDRT                  : this.utilService.normalizePrimitive(value.u_BPP_MDRT),
        u_BPP_MDNT                  : this.utilService.normalizePrimitive(value.u_BPP_MDNT),
        u_BPP_MDVC                  : this.utilService.normalizePrimitive(value.u_BPP_MDVC),

        typeDriversIdentityDocument : tipoDocIdentidadCondItem || null,
        u_FIB_NUMDOC_COD            : this.utilService.normalizePrimitive(value.u_FIB_NUMDOC_COD),
        u_FIB_NOM_COND              : this.utilService.normalizePrimitive(value.u_FIB_NOM_COND),
        u_FIB_APE_COND              : this.utilService.normalizePrimitive(value.u_FIB_APE_COND),
        u_BPP_MDFN                  : this.utilService.normalizePrimitive(value.u_BPP_MDFN),
        u_BPP_MDFC                  : this.utilService.normalizePrimitive(value.u_BPP_MDFC),
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para campos definidos por usuario
    const tipoTrasladoItem        = this.transferTypeList.find(item => item.value === value.u_FIB_TIP_TRAS);
    const motivoTrasladoItem      = this.reasonTransferList.find(item => item.value === value.u_BPP_MDMT);
    const tipoSalidaItem          = this.outputTypeList.find(item => item.value === value.u_BPP_MDTS);

    // Actualizar formulario Otros
    this.modeloFormOtr.patchValue(
      {
        transferType              : tipoTrasladoItem || null,
        reasonTransfer            : motivoTrasladoItem || null,
        outputType                : tipoSalidaItem || null
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
        jrnlMemo                  : this.utilService.normalizePrimitive(value.jrnlMemo),
        comments                  : this.utilService.normalizePrimitive(value.comments)
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar detalle después de que los formularios estén actualizados
    // =========================================================================
    // Esto garantiza que los eventos onChange no sobrescriban los valores originales del detalle
    this.modeloLines = value.lines;
    this.isLoadingInitialData = false;

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

  private mergeForms() {
    return {
      ...this.modeloFormSn.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormTra.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormPie.getRawValue(),
    };
  }

  private mapLinesUpdate(): StockTransfers1UpdateModel[] {
    /** helpers para evitar repetición */
    const u        = this.utilService;
    const p        = (v:any)=>u.normalizePrimitive(v);
    const n        = (v:any)=>u.normalizeNumber(v);

    return this.modeloLines.map<StockTransfers1UpdateModel>(line => ({
      docEntry    : n(line.docEntry),
      lineNum     : n(line.lineNum),

      itemCode    : p(line.itemCode),
      dscription  : p(line.dscription),

      fromWhsCod  : p(line.fromWhsCod),
      whsCode     : p(line.whsCode)
    }));
  }

  private buildModelToSave(): StockTransfersUpdateModel {
    /** helpers para evitar repetición */
    const u             = this.utilService;
    const p             = (v:any)=>u.normalizePrimitive(v);
    const n             = (v:any)=>u.normalizeNumber(v);
    const d             = (v:any)=>u.normalizeDateOrToday(v);
    const val           = (v:any)=>v?.value ?? v;

    /** combinar todos los formularios */
    const f             = this.mergeForms();

    const userId        = this.userContextService.getIdUsuario();

    const lines         = this.mapLinesUpdate();

    return {
      ...new StockTransfersUpdateModel(),

      docEntry          : this.docEntry,

      u_BPP_MDTD        : p(val(f.u_BPP_MDTD)),
      u_BPP_MDSD        : p(val(f.u_BPP_MDSD)),
      u_BPP_MDCD        : p(f.u_BPP_MDCD),

      taxDate           : d(f.taxDate),

      cardCode          : p(f.cardCode),

      u_FIB_TIP_TRANS   : p(val(f.typeTransport)),
      u_FIB_COD_TRA     : p(f.u_FIB_COD_TRA),
      u_FIB_TIPDOC_TRA  : p(val(f.typeCarrierIdentityDocument)),
      u_BPP_MDRT        : p(f.u_BPP_MDRT),
      u_BPP_MDNT        : p(f.u_BPP_MDNT),
      u_BPP_MDVC        : p(f.u_BPP_MDVC),

      u_FIB_TIPDOC_COND : p(val(f.typeDriversIdentityDocument)),
      u_FIB_NUMDOC_COD  : p(f.u_FIB_NUMDOC_COD),
      u_FIB_NOM_COND    : p(f.u_FIB_NOM_COND),
      u_FIB_APE_COND    : p(f.u_FIB_APE_COND),
      u_BPP_MDFN        : p(f.u_BPP_MDFN),
      u_BPP_MDFC        : p(f.u_BPP_MDFC),

      u_FIB_TIP_TRAS    : p(val(f.transferType)),
      u_BPP_MDMT        : p(val(f.reasonTransfer)),
      u_BPP_MDTS        : p(val(f.outputType)),

      slpCode           : n(val(f.slpCode) ?? -1),

      u_FIB_NBULTOS     : n(f.u_FIB_NBULTOS),
      u_FIB_KG          : n(f.u_FIB_KG),

      jrnlMemo          : p(f.jrnlMemo),
      comments          : p(f.comments),

      u_UsrUpdate       : userId,

      lines
    };
  }

  private save(): void {
    this.isSaving = true;

    if (!this.validateSave()) {
      return;
    }

    const modeloToSave = this.buildModelToSave();

    this.stockTransfersService.setUpdate(modeloToSave)
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
          this.utilService.handleErrorSingle(e, 'save', this.swaCustomService);
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
