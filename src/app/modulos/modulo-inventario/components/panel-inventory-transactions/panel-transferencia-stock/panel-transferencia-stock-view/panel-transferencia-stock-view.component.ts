import Swal from 'sweetalert2';
import { Subject, forkJoin, of } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, switchMap, takeUntil, map, catchError } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { TableColumn } from 'src/app/interface/common-ui.interface';
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
import { UserDefinedFieldsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { OperationsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/operation-type.service';
import { IWarehouses } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { IUserDefinedFields } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { ISalesPersons } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IOperationsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/operation-type.interface';
import { IDocumentTypeSunat } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/inicializacion-sistema/document-type-sunat.interface';



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
  //idLocation                                    = 0;

  // Combos
  /** Listas de soporte para dropdowns */
  warehousesList                                : SelectItem[] = [];
  outputsTypesList                              : SelectItem[] = [];
  salesPersonsList                              : SelectItem[] = [];
  transfersTypesList                            : SelectItem[] = [];
  operationsTypesList                           : SelectItem[] = [];
  transportsTypesList                           : SelectItem[] = [];
  reasonsTransfersList                          : SelectItem[] = [];
  sunatDocumentsTypesList                       : SelectItem[] = [];
  carrierIdentityDocumentstypesList             : SelectItem[] = [];
  driversIdentityDocumentstTypesList            : SelectItem[] = [];

  // UI State
  /** Estados de overlays y modales */
  isDisplay                                     = false;
  isVisualizarCodebar                           = false;

  // Table configuration
  /** Configuración de tabla y listas relacionadas */
  columnas                                      : any[];
  opciones                                      : any = [];
  modeloLines                                   : any[] = [];
  bardcodeList                                  : any[];

  // Data
  /** Modelos de cabecera y detalle */
  columnasModal                                 : TableColumn[];
  modeloSelected                                : ITransferenciaStock1;

  id                                            = 0;
  docEntry                                      = 0;
  idUsuario                                     : number = 0;

  // Document numbering
  /** Numeración y flags de documento */

  u_BPP_NDTD                                    : string = '';
  u_BPP_NDSD                                    : string = '';
  u_BPP_MDVC                                    : string = '';
  u_FIB_COD_TRA                                 : string = '';
  u_FIB_NUMDOC_COD                              : string = '';

  // Cliente y contacto
  /** Datos del socio de negocio */
  cardCode                                      = '';
  cntctCode                                     = 0;

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly pickingService: PickingService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly stockTransfersService: StockTransfersService,
    private readonly operationsTypesService: OperationsTypesService,
    private readonly documentTypeSunatService: DocumentTypeSunatService,
    private readonly userDefinedFieldsService: UserDefinedFieldsService,
    public  readonly utilService: UtilService,
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
    //this.idLocation = this.userContextService.getIdLocation();

    // 2. Construir formularios y configuración básica
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();

    // 3. Cargar todos los combos en paralelo y esperar a que todos terminen
    this.loadAllCombos();
  }

  private loadAllCombos(): void {
    this.idUsuario                            = this.userContextService.getIdUsuario();
    const paramWarehouses                     : any = { inactive: 'N' };
    const paramOutputsTypes                   : any = { tableID: 'OWTR', aliasID: 'BPP_MDTS' };
    const paramTransfersTypes                 : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRAS' };
    const paramTransportsTypes                : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRANS' };
    const paramReasonsTransfers               : any = { tableID: 'OWTR', aliasID: 'BPP_MDMT' };
    const paramSunatDocumentsTypes            : any = { u_FIB_ENTR: '', u_FIB_FAVE: '', u_FIB_TRAN: 'Y' };
    const paramCarrierIdentityDocumentstypes  : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_TRA' };
    const paramDriversIdentityDocumentstTypes : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_COND' };

    // Mostrar spinner mientras se cargan los combos
    this.isDisplay = true;

    forkJoin({
      warehouses                      : this.warehousesService.getListByInactive(paramWarehouses).pipe(catchError(() => of([] as IWarehouses[]))),
      outputsTypes                    : this.userDefinedFieldsService.getList(paramOutputsTypes).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      salesPersons                    : this.salesPersonsService.getList().pipe(catchError(() => of([] as ISalesPersons[]))),
      transfersTypes                  : this.userDefinedFieldsService.getList(paramTransfersTypes).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      transportsTypes                 : this.userDefinedFieldsService.getList(paramTransportsTypes).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      operationsTypes                 : this.operationsTypesService.getList().pipe(catchError(() => of([] as IOperationsTypes[]))),
      reasonsTransfers                : this.userDefinedFieldsService.getList(paramReasonsTransfers).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      sunatDocumentsTypes             : this.documentTypeSunatService.getListByType(paramSunatDocumentsTypes).pipe(catchError(() => of([] as IDocumentTypeSunat[]))),
      carrierIdentityDocumentstypes   : this.userDefinedFieldsService.getList(paramCarrierIdentityDocumentstypes).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      driversIdentityDocumentstTypes  : this.userDefinedFieldsService.getList(paramDriversIdentityDocumentstTypes).pipe(catchError(() => of([] as IUserDefinedFields[]))),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {
        this.warehousesList                     = (res.warehouses || []).map(item => ({ label: item.fullDescr, value: item.whsCode }));
        this.outputsTypesList                   = (res.outputsTypes || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.salesPersonsList                   = (res.salesPersons || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.transfersTypesList                 = (res.transfersTypes || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.transportsTypesList                = (res.transportsTypes || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.operationsTypesList                = (res.operationsTypes || []).map(item => ({ label: item.fullDescr, value: item.code }));
        this.reasonsTransfersList               = (res.reasonsTransfers || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.sunatDocumentsTypesList            = (res.sunatDocumentsTypes || []).map(item => ({ label: item.u_BPP_TDDD, value: item.u_BPP_TDTD }));
        this.carrierIdentityDocumentstypesList  = (res.carrierIdentityDocumentstypes || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.driversIdentityDocumentstTypesList = (res.driversIdentityDocumentstTypes || []).map(item => ({ label: item.descr, value: item.fldValue }));


        const sunatDocumentsTypesDefault = this.sunatDocumentsTypesList.find(item => item.value === '09');
        if (sunatDocumentsTypesDefault) {
          this.u_BPP_NDTD = sunatDocumentsTypesDefault.value;
          this.modeloFormDoc.get('sunatDocumentsTypes').setValue({
            label: sunatDocumentsTypesDefault.value,
            value: sunatDocumentsTypesDefault.value
          });
        }

        const transfersTypesDefault = this.transfersTypesList.find(item => item.value === '01');
        if (transfersTypesDefault) {
          this.modeloFormOtr.get('transfersTypes').setValue({
            label: transfersTypesDefault.label,
            value: transfersTypesDefault.value
          });
        }

        const reasonsTransfersDefault = this.reasonsTransfersList.find(item => item.value === '04');
        if (reasonsTransfersDefault) {
          this.modeloFormOtr.get('reasonTransfer').setValue({
            label: reasonsTransfersDefault.label,
            value: reasonsTransfersDefault.value
          });
        }

        const outputsTypesDefault = this.outputsTypesList.find(item => item.value === 'TSI');
        if (outputsTypesDefault) {
          this.modeloFormOtr.get('outputsTypes').setValue({
            label: outputsTypesDefault.label,
            value: outputsTypesDefault.value
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

  onBuildForm(): void {
    this.modeloFormSn = this.fb.group({
      cardCode                : [{ value: '', disabled: false }],
      cardName                : [{ value: '', disabled: false }],
      cntctCode               : [{ value: '', disabled: false }],
      address                 : [{ value: '', disabled: false }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: false }],
      sunatDocumentsTypes              : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDSD              : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDCD              : [{ value: '', disabled: false }, [Validators.required]],
      docDate                 : [{ value: '', disabled: false }, [Validators.required]],
      taxDate                 : [{ value: '', disabled: false }, [Validators.required]],
      originWarehouses                  : [{ value: '', disabled: false }, [Validators.required]],
      destinationWarehouses               : [{ value: '', disabled: false }, [Validators.required]]
    });

    this.modeloFormTra = this.fb.group({
      transportsTypes               : [{ value: '', disabled: false }],
      u_FIB_COD_TRA               : [{ value: '', disabled: false }],
      carrierIdentityDocumentstypes : [{ value: '', disabled: false }],
      u_BPP_MDRT                  : [{ value: '', disabled: false }],
      u_BPP_MDNT                  : [{ value: '', disabled: false }],
      u_BPP_MDVC                  : [{ value: '', disabled: false }],

      driversIdentityDocumentstTypes : [{ value: '', disabled: false }],
      u_FIB_NUMDOC_COD            : [{ value: '', disabled: false }],
      u_FIB_NOM_COND              : [{ value: '', disabled: false }],
      u_FIB_APE_COND              : [{ value: '', disabled: false }],
      u_BPP_MDFN                  : [{ value: '', disabled: true }],
      u_BPP_MDFC                  : [{ value: '', disabled: false }]
    });

    this.modeloFormOtr = this.fb.group({
      transfersTypes              : [{ value: '', disabled: false }, [Validators.required]],
      reasonTransfer            : [{ value: '', disabled: false }, [Validators.required]],
      outputsTypes                : [{ value: '', disabled: false }, [Validators.required]]
    });

    this.modeloFormPie = this.fb.group({
      salesPersons            : [{ value: '', disabled: false }, [Validators.required]],
      u_FIB_NBULTOS           : [{ value: '0', disabled: false }, [Validators.required]],
      u_FIB_KG                : [{ value: '0', disabled: false }, [Validators.required]],
      jrnlMemo                : [{ value: this.jrnlMemo, disabled: false }],
      comments                : [{ value: '', disabled: false }]
    });

    this.modeloFormBar = this.fb.group({
      u_CodeBar              : ['']
    });
  }

  onBuildColumn(): void {
    this.columnas = [
      { field: 'itemCode',        header: 'Código' },
      { field: 'itemName',        header: 'Descripción' },
      { field: 'fromWhsCod',      header: 'De almacén' },
      { field: 'whsCode',         header: 'Almacén destino' },
      { field: 'u_tipoOpT12',     header: 'Tipo operación' },
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

  opcionesTabla(): void {
    this.opciones = [
      { label: 'Ver', icon: 'pi pi-eye', command: () => { this.onClickView(); } }
    ];
  }

  onSelectedItem(modelo: ITransferenciaStock1): void {
    this.modeloSelected = modelo;

    // Verificar si hay ítems vacíos de manera más eficiente
    const hasEmptyItems = this.modeloLines.some(x => x.itemCode === '');

    // Actualizar visibilidad de la opción "Visualizar" con validación
    const visualizarOption = this.opciones.find(x => x.label === 'Ver');
    if (visualizarOption) {
      visualizarOption.visible = !hasEmptyItems;
    }
  }



  //#region  <<< Visualizar >>>

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

  onClickView(): void {
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
    this.modeloFormBar.patchValue({ u_CodeBar: '' }, { emitEvent: false });
  }

  onHideModal(): void {
    this.onClearModel();
  }

  onClickCloseModal()
  {
    this.onClearModel();
  }
  //#endregion

  //#endregion


  private setFormValues(value: IStockTransfers): void {
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
    const tipoDocItem             = this.sunatDocumentsTypesList.find(item => item.value === value.u_BPP_MDTD);

    // Buscar y asignar valores como SelectItem para los dropdowns de Almacenes
    const fillerItem              = this.warehousesList.find(item => item.value === value.filler);
    const toWhsCodeItem           = this.warehousesList.find(item => item.value === value.toWhsCode);

    // Actualizar formulario de Documento
    this.modeloFormDoc.patchValue(
      {
        docNum                    : value.docNum,
        docDate                   : value.docDate ? new Date(value.docDate) : null,
        taxDate                   : value.taxDate ? new Date(value.taxDate) : null,
        sunatDocumentsTypes                : tipoDocItem || null,
        u_BPP_MDSD                : value.u_BPP_MDSD,
        u_BPP_MDCD                : value.u_BPP_MDCD,
        originWarehouses                    : fillerItem || null,
        destinationWarehouses                 : toWhsCodeItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para transporte
    const tipoTransporteItem          = this.transportsTypesList.find(item => item.value === value.u_FIB_TIP_TRANS);
    const tipoDocIdentidadTranItem    = this.carrierIdentityDocumentstypesList.find(item => item.value === value.u_FIB_TIPDOC_TRA);
    const tipoDocIdentidadCondItem    = this.driversIdentityDocumentstTypesList.find(item => item.value === value.u_FIB_TIPDOC_COND);

    // Actualizar formulario Transportista
    this.modeloFormTra.patchValue(
      {
        transportsTypes               : tipoTransporteItem || null,
        u_FIB_COD_TRA               : this.utilService.normalizePrimitive(value.u_FIB_COD_TRA),
        carrierIdentityDocumentstypes : tipoDocIdentidadTranItem || null,
        u_BPP_MDRT                  : this.utilService.normalizePrimitive(value.u_BPP_MDRT),
        u_BPP_MDNT                  : this.utilService.normalizePrimitive(value.u_BPP_MDNT),
        u_BPP_MDVC                  : this.utilService.normalizePrimitive(value.u_BPP_MDVC),

        driversIdentityDocumentstTypes : tipoDocIdentidadCondItem || null,
        u_FIB_NUMDOC_COD            : this.utilService.normalizePrimitive(value.u_FIB_NUMDOC_COD),
        u_FIB_NOM_COND              : this.utilService.normalizePrimitive(value.u_FIB_NOM_COND),
        u_FIB_APE_COND              : this.utilService.normalizePrimitive(value.u_FIB_APE_COND),
        u_BPP_MDFN                  : this.utilService.normalizePrimitive(value.u_BPP_MDFN),
        u_BPP_MDFC                  : this.utilService.normalizePrimitive(value.u_BPP_MDFC),
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para campos definidos por usuario
    const tipoTrasladoItem        = this.transfersTypesList.find(item => item.value === value.u_FIB_TIP_TRAS);
    const motivoTrasladoItem      = this.reasonsTransfersList.find(item => item.value === value.u_BPP_MDMT);
    const tipoSalidaItem          = this.outputsTypesList.find(item => item.value === value.u_BPP_MDTS);

    // Actualizar formulario Otros
    this.modeloFormOtr.patchValue(
      {
        transfersTypes              : tipoTrasladoItem || null,
        reasonTransfer            : motivoTrasladoItem || null,
        outputsTypes                : tipoSalidaItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valor como SelectItem para empleado de ventas
    const salesPersonsItem             = this.salesPersonsList.find(item => item.value === value.slpCode);

    // Actualizar formulario Pie
    this.modeloFormPie.patchValue(
      {
        salesPersons              : salesPersonsItem || null,
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
