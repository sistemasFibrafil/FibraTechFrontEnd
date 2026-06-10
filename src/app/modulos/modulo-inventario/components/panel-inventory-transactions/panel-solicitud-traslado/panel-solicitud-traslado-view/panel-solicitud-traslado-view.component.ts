import { SelectItem } from 'primeng/api';
import { Subject, forkJoin, of } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, switchMap, takeUntil, tap } from 'rxjs/operators';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { TableColumn } from 'src/app/interface/common-ui.interface';
import { IWarehouses } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { ISalesPersons } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IOperationsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/operation-type.interface';
import { IUserDefinedFields } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IInventoryTransferRequest, IInventoryTransferRequestLines } from 'src/app/modulos/modulo-inventario/interfaces/inventory-transfer-request.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { InventoryTransferRequestService } from 'src/app/modulos/modulo-inventario/services/inventory-transfer-request.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { OperationsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/operation-type.service';
import { UserDefinedFieldsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';


@Component({
  selector: 'panel-inv-solicitud-traslado-view',
  templateUrl: './panel-solicitud-traslado-view.component.html',
  styleUrls: ['./panel-solicitud-traslado-view.component.css']
})
export class PanelSolicitudTrasladoViewComponent implements OnInit, OnDestroy {
  // Lifecycle management
  /** Gestión de ciclo de vida y estado inicial */
  private readonly destroy$                   = new Subject<void>();
  isLoadingInitialData                        = false;

  // Forms
  /** Formularios reactivos de la vista */
  modeloFormSn                                : FormGroup;
  modeloFormDoc                               : FormGroup;
  modeloFormOtr                               : FormGroup;
  modeloFormPie                               : FormGroup;

  // Configuration
  /** Configuración general y constantes */
  readonly titulo                             = 'Solicitud de Traslado';
  readonly jrnlMemo                           = 'Solicitud de traslado - ';
  globalConstants                             : GlobalsConstantsForm = new GlobalsConstantsForm();

  // Combos
  /** Listas de soporte para dropdowns */
  warehousesList                                : SelectItem[] = [];
  outputsTypesList                              : SelectItem[] = [];
  salesPersonsList                              : SelectItem[] = [];
  transfersTypesList                            : SelectItem[] = [];
  operationsTypesList                           : SelectItem[] = [];
  reasonsTransfersList                          : SelectItem[] = [];

  // UI State
  /** Estado de overlays y flags UI */
  isDisplay                                   = false;

  // Table configuration
  /** Definición de columnas de la tabla */
  columnas                                    : TableColumn[];

  // Data
  /** Modelos de cabecera y detalle */
  modeloLinesSelected                         : IInventoryTransferRequestLines;

  modeloLines                                 : IInventoryTransferRequestLines[] = [];

  // Filters / Additional properties
  /** Identificadores y auxiliares */
  cardCode                                    = '';

  id                                          = 0;
  cntctCode                                   = 0;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly operationsTypesService: OperationsTypesService,
    private readonly userDefinedFieldsService: UserDefinedFieldsService,
    private readonly InventoryTransferRequestService: InventoryTransferRequestService,
    public  readonly utilService: UtilService
  ) {}

  // ===========================
  // Lifecycle Hooks
  // ===========================

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
    // 1. Construir formularios y columnas
    this.buildForms();
    this.buildColumns();

    // 2. Cargar todos los combos en paralelo y esperar a que todos terminen
    this.loadAllCombos();
  }

  private buildForms(): void {
    this.modeloFormSn = this.fb.group({
      cardCode                : [{ value: '', disabled: false }],
      cardName                : [{ value: '', disabled: false }],
      cntctCode               : [{ value: '', disabled: false }],
      address                 : [{ value: '', disabled: false }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: false }],
      docStatus               : [{ value: 'Abierto', disabled: false }, Validators.required],
      docDate                 : [{ value: null, disabled: false }, Validators.required],
      docDueDate              : [{ value: null, disabled: false }, Validators.required],
      taxDate                 : [{ value: null, disabled: false }, Validators.required],
      u_FIB_IsPkg             : [{ value: false, disabled: false }],
      filler                  : [{ value: '', disabled: false }, Validators.required],
      toWhsCode               : [{ value: '', disabled: false }, Validators.required]
    });

    this.modeloFormOtr = this.fb.group({
      u_FIB_TIP_TRAS          : [{ value: '', disabled: false }, Validators.required],
      u_BPP_MDMT              : [{ value: '', disabled: false }, Validators.required],
      u_BPP_MDTS              : [{ value: '', disabled: false }, Validators.required]
    });

    this.modeloFormPie = this.fb.group({
      salesPersons            : [{ value: '', disabled: false }, Validators.required],
      jrnlMemo                : [{ value: this.jrnlMemo, disabled: false }],
      comments                : [{ value: '', disabled: false }]
    });
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'itemCode',        header: 'Código' },
      { field: 'itemName',        header: 'Descripción' },
      { field: 'fromWhsCod',      header: 'De almacén' },
      { field: 'whsCode',         header: 'Almacén destino' },
      { field: 'u_tipoOpT12',     header: 'Tipo operación' },
      { field: 'unitMsr',         header: 'UM' },
      { field: 'quantity',        header: 'Cantidad' },
      { field: 'openQty',         header: 'Pendiente de despacho' }
    ];
  }

  private loadAllCombos(): void {
    const paramMotivo     : any = { tableID: 'OWTQ', aliasID: 'BPP_MDMT' };
    const paramAlmacen    : any = { inactive: 'N' };
    const paramTipoTras   : any = { tableID: 'OWTQ', aliasID: 'FIB_TIP_TRAS' };
    const paramTipoSalida : any = { tableID: 'OWTQ', aliasID: 'BPP_MDTS' };

    forkJoin({
      warehouses        : this.warehousesService.getListByInactive(paramAlmacen).pipe(catchError(() => of([] as IWarehouses[]))),
      outputsTypes      : this.userDefinedFieldsService.getList(paramTipoSalida).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      salesPersons      : this.salesPersonsService.getList().pipe(catchError(() => of([] as ISalesPersons[]))),
      transfersTypes    : this.userDefinedFieldsService.getList(paramTipoTras).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      operationsTypes   : this.operationsTypesService.getList().pipe(catchError(() => of([] as IOperationsTypes[]))),
      reasonsTransfers  : this.userDefinedFieldsService.getList(paramMotivo).pipe(catchError(() => of([] as IUserDefinedFields[]))),
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (res) => {
        this.warehousesList        = (res.warehouses || []).map(item => ({ label: item.fullDescr, value: item.whsCode }));
        this.outputsTypesList      = (res.outputsTypes || []).map(item => ({ label: item.fullDescr, value: item.fldValue }));
        this.salesPersonsList      = (res.salesPersons || []).map((item: any) => ({ label: item.slpName, value: item.slpCode }));
        this.transfersTypesList    = (res.transfersTypes || []).map(item => ({ label: item.fullDescr, value: item.fldValue }));
        this.operationsTypesList   = (res.operationsTypes || []).map(item => ({ label: item.fullDescr, value: item.code }));
        this.reasonsTransfersList  = (res.reasonsTransfers || []).map(item => ({ label: item.fullDescr, value: item.fldValue }));

        // 3. AHORA SÍ cargar datos - los combos están listos
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

        return this.InventoryTransferRequestService
          .getByDocEntry(this.id)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IInventoryTransferRequest) => {
        this.setFormValues(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  // ===========================
  // Data Operations
  // ===========================

  private setFormValues(value: IInventoryTransferRequest): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el modeloLines durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.cardCode = value.cardCode;
    this.cntctCode = value.cntctCode;

    // Actualizar formulario Socio de Negocio
    this.modeloFormSn.patchValue(
      {
        cardCode    : value.cardCode,
        cardName    : value.cardName,
        cntctCode   : value.cntctCode,
        address     : value.address
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para los dropdowns de Almacenes
    const fillerItem    = this.warehousesList.find(item => item.value === value.filler);
    const toWhsCodeItem = this.warehousesList.find(item => item.value === value.toWhsCode);

    // Actualizar formulario de Documento
    this.modeloFormDoc.patchValue(
      {
        docNum      : value.docNum,
        docStatus   : value.docStatus === 'O' ? 'Abierto' : 'Cerrado',
        docDate     : value.docDate ? new Date(value.docDate) : null,
        docDueDate  : value.docDueDate ? new Date(value.docDueDate) : null,
        taxDate     : value.taxDate ? new Date(value.taxDate) : null,
        u_FIB_IsPkg : value.u_FIB_IsPkg === 'Y',
        filler      : fillerItem || null,
        toWhsCode   : toWhsCodeItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para campos definidos por usuario
    const tipoTrasladoItem   = this.transfersTypesList.find(item => item.value === value.u_FIB_TIP_TRAS);
    const motivoTrasladoItem = this.reasonsTransfersList.find(item => item.value === value.u_BPP_MDMT);
    const tipoSalidaItem     = this.outputsTypesList.find(item => item.value === value.u_BPP_MDTS);

    // Actualizar formulario Otros
    this.modeloFormOtr.patchValue(
      {
        u_FIB_TIP_TRAS : tipoTrasladoItem || null,
        u_BPP_MDMT     : motivoTrasladoItem || null,
        u_BPP_MDTS     : tipoSalidaItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valor como SelectItem para empleado de ventas
    const salesPersonsItem = this.salesPersonsList.find(item => item.value === value.slpCode);

    // Actualizar formulario Pie
    this.modeloFormPie.patchValue(
      {
        salesPersons  : salesPersonsItem || null,
        jrnlMemo      : value.jrnlMemo,
        comments      : value.comments
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar modeloLines después de que los formularios estén actualizados
    // =========================================================================
    // Esto garantiza que los eventos onChange no sobrescriban los valores originales del modeloLines
    this.modeloLines = value.lines || [];
    this.isLoadingInitialData = false;
  }

  // ===========================
  // UI Actions
  // ===========================

  onClickBack(): void {
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-list']);
  }
}
