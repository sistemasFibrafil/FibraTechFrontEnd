import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Subject, forkJoin } from 'rxjs';
import { switchMap, takeUntil, tap } from 'rxjs/operators';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { TableColumn } from 'src/app/interface/common-ui.interface';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/campo-defnido-usuario.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/sales-persons.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/warehouses.service';
import { ISolicitudTraslado, ISolicitudTraslado1 } from 'src/app/modulos/modulo-inventario/interfaces/solicitud-traslado.interface';
import { SolicitudTrasladoService } from 'src/app/modulos/modulo-inventario/services/solicitud-traslado.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UtilService } from 'src/app/services/util.service';

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
  WarehouseList                               : SelectItem[] = [];
  tipoTrasladoList                            : SelectItem[] = [];
  motivoTrasladoList                          : SelectItem[] = [];
  tipoSalidaList                              : SelectItem[] = [];
  salesEmployeesList                          : SelectItem[] = [];

  // UI State
  /** Estado de overlays y flags UI */
  isDisplay                                   = false;

  // Table configuration
  /** Definición de columnas de la tabla */
  columnas                                    : TableColumn[];

  // Data
  /** Modelos de cabecera y detalle */
  modelo                                      : ISolicitudTraslado;
  modeloLinesSelected                         : ISolicitudTraslado1;
  modeloLines                                 : ISolicitudTraslado1[] = [];

  // Filters / Additional properties
  /** Identificadores y auxiliares */
  id                                          = 0;
  cardCode                                    = '';
  cntctCode                                   = 0;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly solicitudTrasladoService: SolicitudTrasladoService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
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

  private loadAllCombos(): void {
    const paramInactive: any = { inactive: 'N' };
    const paramCampo1: any = { tableID: 'OWTQ', aliasID: 'FIB_TIP_TRAS' };
    const paramCampo2: any = { tableID: 'OWTQ', aliasID: 'BPP_MDMT' };
    const paramCampo3: any = { tableID: 'OWTQ', aliasID: 'BPP_MDTS' };

    forkJoin({
      warehouse: this.warehousesService.getListByInactive(paramInactive),
      tipoTraslado: this.camposDefinidoUsuarioService.getList(paramCampo1),
      motivoTraslado: this.camposDefinidoUsuarioService.getList(paramCampo2),
      tipoSalida: this.camposDefinidoUsuarioService.getList(paramCampo3),
      salesEmployee: this.salesPersonsService.getList()
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

        // 3. AHORA SÍ cargar datos - los combos están listos
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
          return this.solicitudTrasladoService.getByDocEntry(+params['id']);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: ISolicitudTraslado) => {
          this.isDisplay = false;
          this.modelo = data;
          this.setFormValues(this.modelo);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadData', () => { this.isDisplay = false; }, this.swaCustomService);
        }
      });
  }

  private buildForms(): void {
    this.modeloFormSn = this.fb.group({
      cardCode                : [{ value: '', disabled: true }],
      cardName                : [{ value: '', disabled: true }],
      cntctCode               : [{ value: '', disabled: true }],
      address                 : [{ value: '', disabled: true }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: true }],
      docStatus               : [{ value: 'Abierto', disabled: true }, Validators.required],
      docDate                 : [{ value: '', disabled: true }, Validators.required],
      docDueDate              : [{ value: '', disabled: true }, Validators.required],
      taxDate                 : [{ value: '', disabled: true }, Validators.required],
      u_FIB_IsPkg             : [{ value: false, disabled: true }],
      filler                  : [{ value: '', disabled: true }, Validators.required],
      toWhsCode               : [{ value: '', disabled: true }, Validators.required]
    });

    this.modeloFormOtr = this.fb.group({
      u_FIB_TIP_TRAS          : [{ value: '', disabled: true }, Validators.required],
      u_BPP_MDMT              : [{ value: '', disabled: true }, Validators.required],
      u_BPP_MDTS              : [{ value: '', disabled: true }, Validators.required]
    });

    this.modeloFormPie = this.fb.group({
      slpCode                 : [{ value: '', disabled: true }, Validators.required],
      jrnlMemo                : [{ value: this.jrnlMemo, disabled: true }],
      comments                : [{ value: '', disabled: true }]
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
      { field: 'quantity',        header: 'Cantidad' },
      { field: 'openQty',         header: 'Pendiente de despacho' }
    ];
  }

  // ===========================
  // Data Operations
  // ===========================

  private setFormValues(value: ISolicitudTraslado): void {
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
    const fillerItem    = this.WarehouseList.find(item => item.value === value.filler);
    const toWhsCodeItem = this.WarehouseList.find(item => item.value === value.toWhsCode);

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
    const tipoTrasladoItem   = this.tipoTrasladoList.find(item => item.value === value.u_FIB_TIP_TRAS);
    const motivoTrasladoItem = this.motivoTrasladoList.find(item => item.value === value.u_BPP_MDMT);
    const tipoSalidaItem     = this.tipoSalidaList.find(item => item.value === value.u_BPP_MDTS);

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
    const slpCodeItem = this.salesEmployeesList.find(item => item.value === value.slpCode);

    // Actualizar formulario Pie
    this.modeloFormPie.patchValue(
      {
        slpCode  : slpCodeItem || null,
        jrnlMemo : value.jrnlMemo,
        comments : value.comments
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
