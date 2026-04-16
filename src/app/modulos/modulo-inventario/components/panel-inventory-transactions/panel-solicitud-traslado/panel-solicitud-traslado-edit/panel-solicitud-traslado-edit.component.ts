import { SelectItem } from 'primeng/api';
import { Subject, forkJoin, merge } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableColumn, MenuItem } from 'src/app/interface/common-ui.interface';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { InventoryTransferRequest1UpdateModel, InventoryTransferRequestUpdateModel } from 'src/app/modulos/modulo-inventario/models/inventory-transfer-request.model';

import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/items.interface';
import { IInventoryTransferRequest, IInventoryTransferRequest1 } from 'src/app/modulos/modulo-inventario/interfaces/inventory-transfer-request.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { ItemsService } from 'src/app/modulos/modulo-inventario/services/items.service';
import { InventoryTransferRequestService } from 'src/app/modulos/modulo-inventario/services/inventory-transfer-request.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';


@Component({
  selector: 'app-inv-panel-solicitud-traslado-edit',
  templateUrl: './panel-solicitud-traslado-edit.component.html',
  styleUrls: ['./panel-solicitud-traslado-edit.component.css']
})
export class PanelSolicitudTrasladoEditComponent implements OnInit, OnDestroy {
  // Lifecycle management
  /** Gestiona ciclo de vida y estado inicial */
  private readonly destroy$                     = new Subject<void>();
  isLoadingInitialData                          = false;

  // Forms
  /** Formularios reactivos de la vista */
  modeloFormSn                                  : FormGroup;
  modeloFormDoc                                 : FormGroup;
  modeloFormOtr                                 : FormGroup;
  modeloFormPie                                 : FormGroup;

  // Configuration
  /** Configuración general y constantes */
  readonly titulo                               = 'Solicitud de Traslado';
  readonly jrnlMemo                             = 'Solicitud de traslado - ';
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // Combos
  /** Listas de soporte para dropdowns */
  WarehouseList                                 : SelectItem[] = [];
  tipoTrasladoList                              : SelectItem[] = [];
  motivoTrasladoList                            : SelectItem[] = [];
  tipoSalidaList                                : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];

  // UI State
  /** Estados de overlays y modales */
  isLocked                                      = true;
  isSaving                                      = false;
  isDisplay                                     = false;
  hasValidLines                                 = false;
  hasRealChanges                                = false;
  isVisualizarArticulo                          = false;
  isVisualizarTipoOperacion                     = false;
  isVisualizarAlmacenOrigen                     = false;
  isVisualizarAlmacenDestino                    = false;

  // Table configuration
  /** Configuración de tabla y menús */
  columnas                                      : TableColumn[];
  opciones                                      : MenuItem[];

  // Data
  /** Modelos de cabecera y detalle */
  modeloLinesSelected                           : IInventoryTransferRequest1;

  modeloLines                                   : IInventoryTransferRequest1[] = [];
  modeloLinesEliminar                           : IInventoryTransferRequest1[] = [];
  modeloLinesOriginal                           : IInventoryTransferRequest1[] = [];

  // Filters / Additional properties
  /** Identificadores y auxiliares */
  cardCode                                      = '';
  itemCode                                      = '';
  inactiveAlmacenItem                           = 'N';

  id                                            = 0;
  docEntry                                      = 0;
  cntctCode                                     = 0;
  indexArticulo                                 = 0;
  indexTipoOperacion                            = 0;
  indexAlmacenOrigen                            = 0;
  indexAlmacenDestino                           = 0;

  // Change Detection
  /** Seguimiento de cambios reales */
  initialSnapshot!                              : any;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly itemsService: ItemsService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
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
    // 1. Construir formularios y opciones de tabla
    this.buildForms();
    this.onBuildColumn();
    this.opcionesTabla();

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
      docDate                 : [new Date(), Validators.required],
      docDueDate              : [new Date(), Validators.required],
      taxDate                 : [new Date(), Validators.required],
      u_FIB_IsPkg             : [false],
      filler                  : ['', Validators.required],
      toWhsCode               : ['', Validators.required]
    });

    this.modeloFormOtr = this.fb.group({
      u_FIB_TIP_TRAS          : ['', Validators.required],
      u_BPP_MDMT              : ['', Validators.required],
      u_BPP_MDTS              : ['', Validators.required]
    });

    this.modeloFormPie = this.fb.group({
      slpCode                 : ['', Validators.required],
      jrnlMemo                : [this.jrnlMemo],
      comments                : ['']
    });
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'itemCode',        header: 'Código' },
      { field: 'itemName',        header: 'Descripción' },
      { field: 'fromWhsCod',      header: 'De almacén' },
      { field: 'whsCode',         header: 'Almacén destino' },
      { field: 'u_tipoOpT12Nam',  header: 'Tipo operación' },
      { field: 'unitMsr',         header: 'UM' },
      { field: 'quantity',        header: 'Cantidad' },
      { field: 'openQty',         header: 'Pendiente de despacho' }
    ];
  }

  private opcionesTabla(): void {
    this.opciones = [
      { value: '1', label: 'Añadir línea', icon: 'pi pi-pencil', command: () => this.onClickAddLine() },
      { value: '2', label: 'Borrar línea', icon: 'pi pi-times', command: () => this.onClickDelete() }
    ];
  }

  // ===========================
  // Table Events
  // ===========================

  onSelectedItem(modelo: IInventoryTransferRequest1): void {
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  // ===========================
  // Data Operations
  // ===========================

  onSelectedSocioNegocio(value: any): void {
    this.cardCode = value.cardCode;
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({
      cardCode: value.cardCode,
      cardName: value.cardName,
      address: value.address2,
      cntctCode: value.cntctCode
    });

    const jrnlMemoNew = `${this.jrnlMemo}${this.cardCode}`;
    this.modeloFormPie.patchValue({ jrnlMemo: jrnlMemoNew });
  }

  onSelectedPersonaContacto(value: any): void {
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({ cntctCode: value.cntctCode });
  }

  private loadAllCombos(): void {
    const paramInactive : any = { inactive: 'N' };
    const paramCampo1   : any = { tableID: 'OWTQ', aliasID: 'FIB_TIP_TRAS' };
    const paramCampo2   : any = { tableID: 'OWTQ', aliasID: 'BPP_MDMT' };
    const paramCampo3   : any = { tableID: 'OWTQ', aliasID: 'BPP_MDTS' };

    forkJoin({
      warehouse         : this.warehousesService.getListByInactive(paramInactive),
      tipoTraslado      : this.camposDefinidoUsuarioService.getList(paramCampo1),
      motivoTraslado    : this.camposDefinidoUsuarioService.getList(paramCampo2),
      tipoSalida        : this.camposDefinidoUsuarioService.getList(paramCampo3),
      salesEmployee     : this.salesPersonsService.getList()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        // Warehouse
        this.WarehouseList = result.warehouse.map(item => ({
          label: item.fullDescr,
          value: item.whsCode
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

        // AHORA SÍ cargar datos - los combos están listos
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
        this.modeloLinesOriginal = structuredClone(data.lines);
        this.setFormValues(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: IInventoryTransferRequest): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el modeloLines durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.isLocked                 = value.docStatus !== 'O';
    this.docEntry                 = value.docEntry;
    this.cardCode                 = value.cardCode;
    this.cntctCode                = value.cntctCode;

    // Actualizar formulario Socio de Negocio
    this.modeloFormSn.patchValue(
      {
        cardCode                  : this.utilService.normalizePrimitive(value.cardCode),
        cardName                  : this.utilService.normalizePrimitive(value.cardName),
        cntctCode                 : value.cntctCode,
        address                   : this.utilService.normalizePrimitive(value.address)
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para los dropdowns de Almacenes
    const fillerItem              = this.WarehouseList.find(item => item.value === value.filler);
    const toWhsCodeItem           = this.WarehouseList.find(item => item.value === value.toWhsCode);

    // Actualizar formulario de Documento
    this.modeloFormDoc.patchValue(
      {
        docNum                    : value.docNum,
        docStatus                 : value.docStatus === 'O' ? 'Abierto' : 'Cerrado',
        docDate                   : value.docDate ? new Date(value.docDate) : null,
        docDueDate                : value.docDueDate ? new Date(value.docDueDate) : null,
        taxDate                   : value.taxDate ? new Date(value.taxDate) : null,
        u_FIB_IsPkg               : value.u_FIB_IsPkg === 'Y',
        filler                    : fillerItem || null,
        toWhsCode                 : toWhsCodeItem || null
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
        jrnlMemo                  : this.utilService.normalizePrimitive(value.jrnlMemo),
        comments                  : this.utilService.normalizePrimitive(value.comments)
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar modeloLines después de que los formularios estén actualizados
    // =========================================================================
    // Esto garantiza que los eventos onChange no sobrescriban los valores originales del modeloLines
    this.modeloLines = value.lines || [];
    this.updateHasValidLines();
    this.isLoadingInitialData = false;

    // =========================
    // SNAPSHOT ORIGINAL (CLAVE)
    // =========================
    this.initialSnapshot = {
      doc: this.modeloFormDoc.getRawValue(),
      otr: this.modeloFormOtr.getRawValue(),
      pie: this.modeloFormPie.getRawValue(),
      lines: structuredClone(this.modeloLines)
    };

    // Marcar pristine
    this.modeloFormDoc.markAsPristine();
    this.modeloFormOtr.markAsPristine();
    this.modeloFormPie.markAsPristine();

    // =========================
    // ESCUCHAR CAMBIOS DE FORMULARIOS
    // =========================
    this.watchChanges();

    // =========================
    // ESTADO INICIAL BOTÓN
    // =========================
    this.detectRealChanges();
  }

  // =========================
  // WATCH CHANGES (AGREGADO)
  // =========================
  private watchChanges(): void {
    merge(
      this.modeloFormDoc.valueChanges,
      this.modeloFormOtr.valueChanges,
      this.modeloFormPie.valueChanges
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.detectRealChanges());
  }

  private detectRealChanges(): void {
    // =========================
    // VALIDACIÓN BÁSICA
    // =========================
    const formsValid =
    this.modeloFormDoc.valid &&
    this.modeloFormOtr.valid &&
    this.modeloFormPie.valid &&
    this.modeloLines.length > 0;

    if (!formsValid) {
      this.hasRealChanges = false;
      return;
    }

    // =========================
    // 1️⃣ CAMBIOS EN FORMULARIOS (POR SNAPSHOT)
    // =========================
    const docChanged = this.utilService.hasFormChanged(
      this.modeloFormDoc,
      this.initialSnapshot.doc
    );

    const otrChanged = this.utilService.hasFormChanged(
      this.modeloFormOtr,
      this.initialSnapshot.otr
    );

    const pieChanged = this.utilService.hasFormChanged(
      this.modeloFormPie,
      this.initialSnapshot.pie
    );

    const formChanged = docChanged || otrChanged || pieChanged;

     // =========================
    // 2️⃣ LÍNEAS NUEVAS (record = 1)
    // =========================
    const hasNewLines =
    this.modeloLines.some(l => l.record === 1);

     // =========================
    // 3️⃣ LÍNEAS ELIMINADAS BD
    // =========================
    const hasDeletedLines =
    this.modeloLinesEliminar.length > 0;

    // =========================
    // 4️⃣ LÍNEAS EXISTENTES MODIFICADAS (record = 2)
    // =========================
    const FIELDS_TO_COMPARE = [
      'itemCode',
      'dscription',
      'fromWhsCod',
      'whsCode',
      'u_tipoOpT12',
      'u_tipoOpT12Nam',
      'quantity',
      'u_FIB_OpQtyPkg',
      'openQty'
    ];

    const hasUpdatedLines = this.modeloLines.some(line => {
      // Solo líneas existentes en BD
      if (line.record !== 2) return false;

      const original = this.initialSnapshot.lines.find(
        o => o.lineNum === line.lineNum && o.docEntry === line.docEntry
      );

      if (!original) return false;

      // Comparar campos relevantes
      return FIELDS_TO_COMPARE.some(
        field => line[field] !== original[field]
      );
    });


    // =========================
    // ✅ REGLA FINAL
    // =========================
    this.hasRealChanges =
      formChanged ||
      hasNewLines ||
      hasDeletedLines ||
      hasUpdatedLines;
  }

  onChangeAlmacenOrigen(event: any): void {
    const hasValidLines = this.modeloLines.some(x => x.itemCode && x.itemCode.trim() !== '');
    if (event.value && hasValidLines) {
      this.swaCustomService.swaConfirmation(
      this.globalConstants.titleActualizarDeAlmacen,
      this.globalConstants.subTitleActualizarDeAlmacen,
      this.globalConstants.icoSwalQuestion
      ).then((result) => {
        if (result.isConfirmed) {
          const whsCode = event.value.value || event.value;
          this.applyAlmacenOrigenTomodeloLines(whsCode);
        }
      });
    }
  }

  private applyAlmacenOrigenTomodeloLines(whsCode: string): void {
    this.modeloLines.forEach(x => {
      if (x.itemCode !== '' && x.lineStatus === 'O') {
        x.fromWhsCod = whsCode;
      }
    });
    // Detectar cambios reales
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onChangeAlmacenDestino(event: any): void {
    const hasValidLines = this.modeloLines.some(x => x.itemCode && x.itemCode.trim() !== '');
    if (event.value && hasValidLines) {
      this.swaCustomService.swaConfirmation(
        this.globalConstants.titleActualizarAAlmacen,
        this.globalConstants.subTitleActualizarAAlmacen,
        this.globalConstants.icoSwalQuestion
      ).then((result) => {
        if (result.isConfirmed) {
          const whsCode = event.value.value || event.value;
          this.applyAlmacenDestinoTomodeloLines(whsCode);
        }
      });
    }
  }

  private applyAlmacenDestinoTomodeloLines(whsCode: string): void {
    this.modeloLines.forEach(x => {
      if (x.itemCode !== '' && x.lineStatus === 'O') {
        x.whsCode = whsCode;
      }
    });
    // Detectar cambios reales
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onOpenArticulo(index: number): void {
    this.indexArticulo = index;
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  setItem(data: IArticulo[]): void {
    if (!data || data.length === 0) {
      return;
    }

    const element = data[0];
    const item = this.modeloLines[this.indexArticulo];

    const fillerControl    = this.modeloFormDoc.controls['filler'].value;
    const toWhsCodeControl = this.modeloFormDoc.controls['toWhsCode'].value;

    const fillerValue    = fillerControl?.value ?? fillerControl ?? '';
    const toWhsCodeValue = toWhsCodeControl?.value ?? toWhsCodeControl ?? '';

    item.itemCode       = element.itemCode;
    item.dscription     = element.itemName;
    item.fromWhsCod     = fillerValue || element.dfltWH || '';
    item.whsCode        = toWhsCodeValue || element.dfltWH || '';
    item.u_tipoOpT12    = element.u_tipoOpT12 || '';
    item.u_tipoOpT12Nam = element.u_tipoOpT12Nam || '';
    item.unitMsr        = element.invntryUom;
    item.quantity       = 1;
    item.openQty        = 1;
    item.u_FIB_OpQtyPkg = 1;

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  getListByCode(itemCode: string): void {
    this.isDisplay = true;

    this.itemsService
    .getListByCode(this.buildFilterParams(itemCode))
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IArticulo[]) => {
        this.setItem(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListByCode', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(itemCode: string): any {
    return {
      itemCode,
      cardCode            : '',
      currency            : '',
      slpCode             : 0,
      operationTypeCode   : '11'
    };
  }

  onSelectedArticulo(value: any): void {
    this.isVisualizarArticulo = false;
    this.getListByCode(value.itemCode);
  }

  onClickCloseArticulo(): void {
    this.isVisualizarArticulo = false;
  }

  onOpenAlmacenOrigenItem(value: IInventoryTransferRequest1, index: number): void {
    this.indexAlmacenOrigen = index;
    this.itemCode = value.itemCode;
    this.isVisualizarAlmacenOrigen = !this.isVisualizarAlmacenOrigen;
  }

  onOpenAlmacenDestinoItem(value: IInventoryTransferRequest1, index: number): void {
    this.indexAlmacenDestino = index;
    this.itemCode = value.itemCode;
    this.isVisualizarAlmacenDestino = !this.isVisualizarAlmacenDestino;
  }

  onSelectedAlmacenOrigenItem(value: any): void {
    this.modeloLines[this.indexAlmacenOrigen].fromWhsCod = value.whsCode;
    this.isVisualizarAlmacenOrigen = false;

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onSelectedAlmacenDestinoItem(value: any): void {
    this.modeloLines[this.indexAlmacenDestino].whsCode = value.whsCode;
    this.isVisualizarAlmacenDestino = false;

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseAlmacenOrigenItem(): void {
    this.isVisualizarAlmacenOrigen = false;
  }

  onClickCloseAlmacenDestinoItem(): void {
    this.isVisualizarAlmacenDestino = false;
  }

  //=======================================================================================================================
  //============================= INI: TIPO DE OPERACION ==================================================================
  //=======================================================================================================================
  onOpenTipoOperacionItem(index: number): void {
    this.indexTipoOperacion = index;
    this.isVisualizarTipoOperacion = true;
  }

  onSelectedTipoOperacionItem(value: any): void {
    const currentLine = this.modeloLines[this.indexTipoOperacion];
    currentLine.u_tipoOpT12 = value.code;
    currentLine.u_tipoOpT12Nam = value.u_descrp;
    this.isVisualizarTipoOperacion = false;

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseTipoOperacionItem(): void {
    this.isVisualizarTipoOperacion = false;
  }
  //=======================================================================================================================
  //============================= FIN: TIPO DE OPERACION ==================================================================
  //=======================================================================================================================

  onChangeQuantity(value: IInventoryTransferRequest1, index: number): void {
    if (value.record === 1) {
      this.updateQuantityNew(value, index);
    } else {
      this.updateQuantityExisting(value, index);
    }

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  private updateQuantityNew(value: IInventoryTransferRequest1, index: number): void {
    if (value.itemCode === '') {
      this.modeloLines[index].quantity = 0;
      this.modeloLines[index].u_FIB_OpQtyPkg = 0;
      this.modeloLines[index].openQty = 0;
      return;
    }

    const quantity = this.utilService.onRedondearDecimal(value.quantity, 3);
    this.modeloLines[index].quantity = quantity;
    this.modeloLines[index].u_FIB_OpQtyPkg = quantity;
    this.modeloLines[index].openQty = quantity;
  }

  private updateQuantityExisting(value: IInventoryTransferRequest1, index: number): void {
    const modelomodeloLinesOriginal = this.modeloLinesOriginal.find(d => d.lineNum === value.lineNum && d.docEntry === value.docEntry);

    if (!modelomodeloLinesOriginal) return;

    const quantity    = this.utilService.onRedondearDecimal(value.quantity, 3);
    // Se obtiene la cantidad picada
    const u_FIB_IsPkg = this.utilService.onRedondearDecimal(modelomodeloLinesOriginal.quantity - modelomodeloLinesOriginal.u_FIB_OpQtyPkg,3);

    this.modeloLines[index].quantity        = value.itemCode === '' ? 0 : quantity;
    this.modeloLines[index].u_FIB_OpQtyPkg  = value.itemCode === '' ? 0 : (quantity - u_FIB_IsPkg) > 0 ? (quantity - u_FIB_IsPkg) : 0;
  }

  // Verifica si todas las líneas son válidas
  private updateHasValidLines(): void {
    this.hasValidLines =
    this.modeloLines.length > 0 &&
    this.modeloLines.every(line =>!!line.itemCode?.trim());
  }

  private addLine(): void {
    this.modeloLines.push({lineStatus: 'O', itemCode: '', dscription: '', fromWhsCod: '', whsCode: '', u_tipoOpT12: '', unitMsr: '', quantity: 0, u_FIB_OpQtyPkg: 0, openQty: 0, record: 1 });
    this.updateHasValidLines();
  }

  onClickAddLine(): void {
    this.addLine();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickDelete(): void {
    if (this.modeloLinesSelected.record === 2) {
      this.modeloLinesSelected.record = 3;
      this.modeloLinesEliminar.push(this.modeloLinesSelected);
    }

    /** Elimina la línea seleccionada; agrega una vacía si quedan sin líneas */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }

    if (this.modeloLines.length === 0) {
      this.addLine();
      return;
    }

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  private onValidatedSave(): boolean {
    const { filler, toWhsCode } = this.modeloFormDoc.getRawValue();

    if (filler && toWhsCode && filler === toWhsCode) {
      this.swaCustomService.swaMsgInfo('El almacén de destino no puede ser idéntico al almacén de Origen.');
      return false;
    }

    const hasIncompleteLines = this.modeloLines.some(item => !item.itemCode);
    if (hasIncompleteLines) {
      this.swaCustomService.swaMsgInfo('Ingrese los datos en el modeloLines de la solicitud.');
      return false;
    }

    for (const item of this.modeloLines) {
      if (item.fromWhsCod === item.whsCode) {
        this.swaCustomService.swaMsgInfo('El almacén de destino no puede ser idéntico al almacén de Origen.');
        return false;
      }
      if (item.quantity <= 0) {
        this.swaCustomService.swaMsgInfo('La cantidad debe ser mayor que CERO (0).');
        return false;
      }
    }

    return true;
  }

  private mergeForms() {
    return {
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormPie.getRawValue()
    };
  }

  private mapLinesUpdate(): InventoryTransferRequest1UpdateModel[] {
    /** helpers para evitar repetición */
    const u            = this.utilService;
    const p            = (v:any)=>u.normalizePrimitive(v);
    const n            = (v:any)=>u.normalizeNumber(v);

    const allLines     = [...this.modeloLines, ...this.modeloLinesEliminar];

    return allLines
    .filter(line => p(line.itemCode) !== '')
    .map<InventoryTransferRequest1UpdateModel>(line => ({
      docEntry        : n(line.docEntry),
      lineNum         : n(line.lineNum),
      lineStatus      : p(line.lineStatus),

      itemCode        : p(line.itemCode),
      dscription      : p(line.dscription),
      fromWhsCod      : p(line.fromWhsCod),
      whsCode         : p(line.whsCode),

      unitMsr         : p(line.unitMsr),
      quantity        : n(line.quantity),

      u_FIB_OpQtyPkg  : n(line.u_FIB_OpQtyPkg),
      u_tipoOpT12     : p(line.u_tipoOpT12),

      record          : n(line.record)
    }));
  }

  private buildModelToSave(): InventoryTransferRequestUpdateModel {
    /** helpers para evitar repetición */
    const u           = this.utilService;
    const p           = (v:any)=>u.normalizePrimitive(v);
    const n           = (v:any)=>u.normalizeNumber(v);
    const d           = (v:any)=>u.normalizeDateOrToday(v);
    const val         = (v:any)=>v?.value ?? v;

    /** combinar todos los formularios */
    const f           = this.mergeForms();

    const userId      = this.userContextService.getIdUsuario();

    const u_FIB_IsPkg = f.u_FIB_IsPkg ? 'Y' : 'N';

    const lines       = this.mapLinesUpdate();

    return {
      ...new InventoryTransferRequestUpdateModel(),

      docEntry        : this.docEntry,

      docDate         : d(f.docDate),
      docDueDate      : d(f.docDueDate),
      taxDate         : d(f.taxDate),

      u_FIB_IsPkg     : u_FIB_IsPkg,

      cardCode        : p(f.cardCode),

      filler          : p(val(f.filler)),
      toWhsCode       : p(val(f.toWhsCode)),

      u_FIB_TIP_TRAS  : p(val(f.u_FIB_TIP_TRAS)),
      u_BPP_MDMT      : p(val(f.u_BPP_MDMT)),
      u_BPP_MDTS      : p(val(f.u_BPP_MDTS)),

      slpCode         : n(val(f.slpCode) ?? -1),

      jrnlMemo        : p(f.jrnlMemo),
      comments        : p(f.comments),

      u_UsrUpdate     : userId,

      lines
    };
  }

  private save(): void {
    this.isSaving = true;

    if (!this.onValidatedSave()) {
      this.isSaving = false;
      return;
    }

    const modeloToSave = this.buildModelToSave();

    this.InventoryTransferRequestService.setUpdate(modeloToSave)
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
  // UI Actions
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
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-list']);
  }

  // ===========================
  // Helper Methods
  // ===========================

  private updateMenuVisibility(modelo: IInventoryTransferRequest1): void {
    const hasEmptyLines = this.modeloLines.some(x => x.itemCode === '');
    const canDelete = this.modeloLines.length > 0
      && modelo.lineStatus === 'O'
      && (modelo.quantity === modelo.u_FIB_OpQtyPkg || modelo.quantity === modelo.openQty);

    const addLineOption = this.opciones.find(x => x.label === 'Añadir línea');
    const deleteLineOption = this.opciones.find(x => x.label === 'Borrar línea');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = canDelete;
  }
}
