import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { finalize, forkJoin, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ISolicitudCompra, ISolicitudCompra1 } from '../../../interfaces/sap/solicitud-compra.interface';
import { IArticuloQuery } from 'src/app/modulos/modulo-inventario/interfaces/articulo.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { SolicitudCompraService } from '../../../services/sap/solicitud-compra.service';
import { ArticuloService } from 'src/app/modulos/modulo-inventario/services/articulo.service';
import { UsersService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/users.service';
import { EmployeesInfoService } from 'src/app/modulos/modulo-recursos-humanos/services/employees-info.service';
import { BranchesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/branchs.service';
import { SolicitudCompra1UpdateModel, SolicitudCompraUpdateModel } from '../../../models/sap/solicitud-compra.model';
import { DepartmentsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/departments.service';
import { NumeracionDocumentoService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/numeracion-documento.service';


@Component({
  selector: 'app-com-panel-solicitud-compra-edit',
  templateUrl: './panel-solicitud-compra-edit.component.html',
  styleUrls: ['./panel-solicitud-compra-edit.component.css']
})
export class PanelSolicitudCompraEditComponent implements OnInit, OnDestroy, AfterViewInit {
  // Lifecycle management
  /** Gestión de ciclo de vida y ajustes visuales auxiliares */
  private readonly destroy$                    = new Subject<void>();
  isLoadingInitialData                         = false;
  paddingTop                                   = '20px';
  @ViewChild('notifyLabel') notifyLabel!       : ElementRef<HTMLElement>;
  private resizeObserver!                      : ResizeObserver;

  // Forms
  /** Formularios reactivos de la vista */
  modeloFormReq                                : FormGroup;
  modeloFormDoc                                : FormGroup;
  modeloFormCon                                : FormGroup;
  modeloFormPie                                : FormGroup;

  // Configuration
  /** Configuración general y constantes */
  readonly titulo                              = 'Solicitud de Compra';
  globalConstants                              : GlobalsConstantsForm = new GlobalsConstantsForm();

  // Combos
  /** Listas de soporte para dropdowns */
  reqTypesList                                 : SelectItem[] = [];
  docTypesList                                 : SelectItem[] = [];
  branchesList                                 : SelectItem[] = [];
  departmentsList                              : SelectItem[] = [];
  docStatusList                                : SelectItem[] = [];
  requesterList                                : SelectItem[] = [];
  employeesInfoList                            : SelectItem[] = [];

  // UI State
  /** Estados de overlays, modales y flags UI */
  isSaving                                     = false;
  isDisplay                                    = false;
  isVisualizarAlmacen                          = false;
  isVisualizarArticulo                         = false;
  isVisualizarProveedor                        = false;
  isVisualizarTipoCompra                       = false;
  isVisualizarCentroCosto                      = false;
  isVisualizarCuentaContable                   = false;
  isVisualizarTipoOperacion                    = false;

  // Table configuration
  /** Configuración de tabla y menús de acción */
  items                                        : MenuItem[];
  columnas                                     : TableColumn[] = [];
  opciones                                     : MenuItem[];

  // Data
  /** Modelos de cabecera y detalle */
  modelo                                       : ISolicitudCompra;
  modeloLines                                  : ISolicitudCompra1[] = [];
  modeloLinesSelected                          : ISolicitudCompra1;
  modeloLinesEliminar                          : ISolicitudCompra1[] = [];
  modeloLinesOriginal                          : ISolicitudCompra1[] = [];
  modeloLinesSelectedContext                   : ISolicitudCompra1;

  docTypeSelected                              : any;

  // Filters / Additional properties
  /** Identificadores y auxiliares */
  id                                           = 0;
  docEntry                                     = 0;
  indexArticulo                                = 0;
  indexAlmacen                                 = 0;
  indexTipoCompra                              = 0;
  indexCentroCosto                             = 0;
  indexTipoOperacion                           = 0;
  indexCentroProveedor                         = 0;
  indexCentroCuentaContable                    = 0;

  filler                                       = '';
  itemCode                                     = '';
  toWhsCode                                    = '';
  inactiveAlmacen                              = 'N';
  demandanteAlmacen                            = 'N';
  inactiveAlmacenItem                          = 'N';

  hasValidLines                                = false;

  // Change Detection
  /** Seguimiento de cambios reales para habilitar acciones */
  initialSnapshot!                             : any;
  hasRealChanges                               = false;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    public  readonly app: LayoutComponent,
    private readonly route: ActivatedRoute,
    private readonly usersService: UsersService,
    private readonly articuloService: ArticuloService,
    private readonly branchesService: BranchesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly departmentsService: DepartmentsService,
    private readonly employeesInfoService: EmployeesInfoService,
    private readonly solicitudCompraService: SolicitudCompraService,
    private readonly numeracionDocumentoService: NumeracionDocumentoService,
    public  readonly utilService: UtilService,
  ) {}

  // ===========================
  // Lifecycle Hooks
  // ===========================

  /**
   * Inicializa formularios y carga datos iniciales para combos.
   */
  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Limpia suscripciones/observadores para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Después de iniciar la vista: mide el quiebre del label y se suscribe a cambios de tamaño.
   */
  ngAfterViewInit(): void {
    // Primer cálculo
    this.recalculate();

    // Observa cambios reales del elemento
    this.resizeObserver = new ResizeObserver(() => {
      this.recalculate();
    });

    this.resizeObserver.observe(this.notifyLabel.nativeElement);
  }

  /** Detecta redimensionamiento de ventana y vuelve a medir */
  @HostListener('window:resize')
  onWindowResize(): void {
    this.recalculate();
  }

  /**
   * Mide si el label se quiebra en múltiples líneas y
   * actualiza el padding del checkbox en consecuencia.
   */
  private recalculate(): void {
    // Espera a que el DOM se re-renderice
    setTimeout(() => {
      const label = this.notifyLabel.nativeElement;

      const lineHeight = parseFloat(
        getComputedStyle(label).lineHeight
      );

      const isWrapped = label.scrollHeight > lineHeight;

      this.paddingTop = isWrapped ? '1px' : '20px';
    });
  }


  // ===========================
  // Initialization
  // ===========================

  private initializeComponent(): void {
    // Construye formularios reactivos y columnas/menús de UI
    this.buildForms();
    this.subscribeReqDate();
    this.onBuildColumn();
    this.opcionesTabla();
    this.buildContextMenu();
    // Cargar todos los combos en paralelo y aplicar valores por defecto sin emitir eventos
    this.loadAllCombos();
  }

  private buildForms(): void {
    // Define y compone grupos de formulario con validadores
    this.modeloFormReq = this.fb.group({
      reqType                 : ['', Validators.required],
      reqName                 : ['', Validators.required],
      branch                  : [''],
      department              : [''],
      notify                  : [false],
      email                   : ['']
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: true }],
      docStatus               : [{ value: 'Abierto', disabled: true }, Validators.required],
      docDate                 : [new Date(), Validators.required],
      docDueDate              : [new Date(), Validators.required],
      taxDate                 : [new Date(), Validators.required],
      reqDate                 : [null, Validators.required]
    });

    this.modeloFormCon = this.fb.group({
      docType                 : [{ value: '', disabled: true }, Validators.required]
    });

    this.modeloFormPie = this.fb.group({
      employeeInfo            : ['', Validators.required],
      comments                : ['']
    });
  }

  private onBuildColumn(): void {
    // Usar docTypeSelected si está disponible, sino leer del formulario
    const docTyp = this.modeloFormCon.get('docType')?.value?.value;

    if( docTyp === 'I'){
      this.columnas = [
        { field: 'itemCode',          header: 'Código' },
        { field: 'dscription',        header: 'Descripción' },
        { field: 'lineVendor',        header: 'Proveedor' },
        { field: 'pqtReqDate',        header: 'Fecha necesaria' },
        { field: 'formatCode',        header: 'Cuenta mayor' },
        { field: 'acctName',          header: 'Nombre de la cuenta de mayor' },
        { field: 'ocrCode',           header: 'Centro de costos' },
        { field: 'whsCode',           header: 'Almacén' },
        { field: 'u_tipoOpT12Nam',    header: 'Tipo de operación' },
        { field: 'u_FF_TIP_COM_NAM',  header: 'Tipo de compra' },
        { field: 'unitMsr',           header: 'UM' },
        { field: 'quantity',          header: 'Cantidad' },
      ];
    }
    else{
      this.columnas = [
        { field: 'dscription',        header: 'Descripción' },
        { field: 'lineVendor',        header: 'Proveedor' },
        { field: 'pqtReqDate',        header: 'Fecha necesaria' },
        { field: 'formatCode',        header: 'Cuenta mayor' },
        { field: 'acctName',          header: 'Nombre de la cuenta de mayor' },
        { field: 'ocrCode',           header: 'Centro de costos' },
        { field: 'u_tipoOpT12Nam',    header: 'Tipo de operación' },
        { field: 'u_FF_TIP_COM_NAM',  header: 'Tipo de compra' },
      ];
    }
  }

  private opcionesTabla(): void {
    // Acciones del split-button para operaciones de fila
    this.opciones = [
      { value: '1', label: 'Añadir línea', icon: 'pi pi-pencil',  command: () => this.onClickAddLine() },
      { value: '2', label: 'Borrar línea', icon: 'pi pi-times',   command: () => this.onClickDelete() }
    ];
  }

  private buildContextMenu(): void {
    // Acciones del menú contextual asociadas a la fila seleccionada
    this.items = [
      { value: '1', label: 'Añadir línea', icon: 'pi pi-plus',   command: () => this.onClickContextMenuAddLine(this.modeloLinesSelectedContext) },
      { value: '2', label: 'Borrar línea', icon: 'pi pi-trash',  command: () => this.onClickContextMenuDelete(this.modeloLinesSelectedContext) }
    ];
  }

  onContextMenuShow(event: any): void {
    // No sobrescribir la selección del contexto si el evento no trae datos de fila.
    // El p-table ya actualiza `modeloLinesSelectedContext` vía [(contextMenuSelection)].
    if (event?.item?.data) {
      this.modeloLinesSelectedContext = event.item.data;
    }
    this.updateMenuContextVisibility();
  }

  /** Agrega una nueva línea después de la línea seleccionada en el menú contextual */
  onClickContextMenuAddLine(modelo: ISolicitudCompra1): void {
    // Manejar casos donde el objeto 'modelo' no es pasado correctamente
    const target = modelo || this.modeloLinesSelectedContext;

    let insertIndex = this.modeloLines.length; // por defecto al final
    if (target) {
      const idx = this.modeloLines.indexOf(target);
      insertIndex = idx > -1 ? idx + 1 : this.modeloLines.length;
    }

    this.addLine(insertIndex);
  }

  /** Elimina la línea seleccionada en el menú contextual */
  onClickContextMenuDelete(modelo: ISolicitudCompra1): void {
    if (modelo.record === 2) {
      modelo.record = 3;
      this.modeloLinesEliminar.push(modelo);
    }
    const index = this.modeloLines.indexOf(modelo);
    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }
    // Si se quedó sin líneas, agregar una vacía como comportamiento por defecto
    if (this.modeloLines.length === 0) {
      this.addLine(0);
      return;
    }

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  // ===========================
  // Table Events
  // ===========================

  /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
  onSelectedItem(modelo: ISolicitudCompra1): void {
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
  }

  onClickAddLine(): void {
    // Agrega una nueva línea vacía
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    const insertIndex = index + 1;
    this.addLine(insertIndex);
  }

  onClickDelete(): void {
    if (this.modeloLinesSelected.record === 2) {
      this.modeloLinesSelected.record = 3;
      this.modeloLinesEliminar.push(this.modeloLinesSelected);
    }

    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }

    if (this.modeloLines.length === 0) {
      this.addLine(0);
      return;
    }

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  // ===========================
  // Helper Methods
  // ===========================

  private updateMenuVisibility(): void {
    // Leer el valor actual del formulario
    const formConValues     = this.modeloFormCon.getRawValue();
    const docTypeValue      = formConValues.docType?.value;
    const isItemDoc         = docTypeValue === 'I';

    // Activa/desactiva opciones del split-button según líneas presentes y vacías
    const hasEmptyLines = this.modeloLines.some(line => isItemDoc ? line.itemCode === '' : line.dscription === '');
    const hasLines = this.modeloLines.length > 0;

    const addLineOption = this.opciones.find(x => x.label === 'Añadir línea');
    const deleteLineOption = this.opciones.find(x => x.label === 'Borrar línea');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  private updateMenuContextVisibility(): void {
    // Leer el valor actual del formulario
    const formConValues     = this.modeloFormCon.getRawValue();
    const docTypeValue      = formConValues.docType?.value;
    const isItemDoc         = docTypeValue === 'I';

    // Activa/desactiva opciones del menú contextual según líneas presentes y vacías
    const hasEmptyLines = this.modeloLines.some(line => isItemDoc ? line.itemCode === '' : line.dscription === '');
    const hasLines = this.modeloLines.length > 0;

    const addLineOption = this.items.find(x => x.label === 'Añadir línea');
    const deleteLineOption = this.items.find(x => x.label === 'Borrar línea');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  // Verifica si todas las líneas son válidas
  private updateHasValidLines(): void {
    const docTypeValue = this.modeloFormCon.getRawValue().docType?.value;
    const isItemDoc = docTypeValue === 'I';

    this.hasValidLines =
    this.modeloLines.length > 0 &&
    this.modeloLines.every(line =>
      isItemDoc
        ? !!line.itemCode?.trim()
        : !!line.dscription?.trim()
    );
  }


  private addLine(index: number): void {
    this.modeloLines.splice(index, 0, {
      lineStatus        : 'O',
      itemCode          : '',
      dscription        : '',
      lineVendor        : '' ,
      pqtReqDate        : null,
      acctCode          : '',
      formatCode        : '',
      acctName          : '',
      ocrCode           : '',
      whsCode           : '',
      u_tipoOpT12       : '',
      u_tipoOpT12Nam    : '',
      u_FF_TIP_COM      : '',
      u_FF_TIP_COM_NAM  : '',
      unitMsr           : '',
      quantity          : 0,
      openQty           : 0,
      record            : 1
    });
    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  /**
   * Carga en paralelo las listas de soporte (numeración, almacenes, tipos y empleados)
   * y establece los valores por defecto en los formularios usando { emitEvent: false } para
   * evitar triggers no deseados en valueChanges.
   */
  private loadAllCombos(): void {

    // Cargar datos síncronos (LocalDataService)
    const reqTypes = this.localDataService.getListReqTypes();
    this.reqTypesList = reqTypes.map(s => ({ label: s.name, value: s.code }));

    const docTypes = this.localDataService.getListDocTypes();
    this.docTypesList = docTypes.map(s => ({ label: s.name, value: s.code }));

    forkJoin({
      requesterList     : this.usersService.getList(),
      branchesList      : this.branchesService.getList(),
      departmentsList   : this.departmentsService.getList(),
      employeesInfoList : this.employeesInfoService.getList()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result: any) => {
        // Mapear requester list
        this.requesterList = result.requesterList.map(item => ({
          label: item.u_NAME,
          value: item.useR_CODE
        }));

        // Mapear branches list
        this.branchesList = result.branchesList.map(item => ({
          label: item.name,
          value: item.code
        }));


        // Mapear departments list
        this.departmentsList = result.departmentsList.map(item => ({
          label: item.name,
          value: item.code
        }));


        // Mapear employees info list
        this.employeesInfoList =  result.employeesInfoList.map(item => ({
          label: item.fullName,
          value: item.empID
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
        return this.solicitudCompraService.getByDocEntry(+params['id']);
      }),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (data: ISolicitudCompra) => {
        this.isDisplay = false;

        const normalizedLines = data.lines.map(line => ({
          ...line,
          pqtReqDate: this.normalizeDateToDate(line.pqtReqDate)
        }));

        this.modelo = {
          ...data,
          lines: normalizedLines
        };

        this.modeloLinesOriginal = normalizedLines.map(line => ({
          ...line,
          pqtReqDate: new Date(line.pqtReqDate)
        }));

        this.setFormValues(this.modelo);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  private setFormValues(value: ISolicitudCompra): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el modeloLines durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.docEntry                 = value.docEntry;


    // Buscar y asignar valores como SelectItem para los dropdowns de Almacenes
    if(value.reqType === 17){
      this.requesterList = this.employeesInfoList.map(item => ({
        label: item.label,
        value: item.value
      }));
    }

    const reqType                 = this.reqTypesList.find(item => item.value === value.reqType);
    const reqName                 = this.requesterList.find(item => item.value === value.requester);
    const branch                  = this.branchesList.find(item => item.value === value.branch);
    const department              = this.departmentsList.find(item => item.value === value.department);

    // Actualizar formulario de Requerimiento
    this.modeloFormReq.patchValue(
      {
        reqType                   : reqType || null,
        reqName                   : reqName || null,
        branch                    : branch || null,
        department                : department || null,
        notify                    : value.notify === 'Y' ? true : false,
        email                     : value.email || ''
      },
      { emitEvent: false }
    );

    // Actualizar formulario de Documento
    this.modeloFormDoc.patchValue(
      {
        docNum                    : value.docNum,
        docStatus                 : value.docStatus === 'O' ? 'Abierto' : 'Cerrado',
        docDate                   : value.docDate ? new Date(value.docDate) : null,
        docDueDate                : value.docDueDate ? new Date(value.docDueDate) : null,
        taxDate                   : value.taxDate ? new Date(value.taxDate) : null,
        reqDate                   : value.reqDate ? new Date(value.reqDate) : null,
      },
      { emitEvent: false }
    );

    const docType                 = this.docTypesList.find(item => item.value === value.docType);

    // Actualizar formulario de Contenido
      this.docTypeSelected   = docType;
    this.modeloFormCon.patchValue(
      {
        docType                  : docType || null,
      },
      { emitEvent: false }
    );


    // Habilitar o deshabilitar controles del formulario basados en el estado del documento
    // Para evitar 'changed after checked' manejamos el estado del control desde el componente
    const isEditable = value.docStatus === 'O';
    const docControls = ['reqType', 'reqName','docDate', 'docDueDate', 'taxDate', 'reqDate'];
    for (const ctrlName of docControls) {
      const ctrl = this.modeloFormDoc.get(ctrlName);
      if (!ctrl) { continue; }
      if (isEditable) {
        ctrl.enable({ emitEvent: false });
      } else {
        ctrl.disable({ emitEvent: false });
      }
    }

    // Buscar y asignar valor como SelectItem para empleado
    const employee                = this.employeesInfoList.find(item => item.value === value.ownerCode);

    // Actualizar formulario Pie
    this.modeloFormPie.patchValue(
      {
        employeeInfo              : employee || null,
        comments                  : value.comments
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar modeloLines después de que los formularios estén actualizados
    // =========================================================================
    // Esto garantiza que los eventos onChange no sobrescriban los valores originales del modeloLines
    this.onBuildColumn();
    this.modeloLines = value.lines || [];
    this.updateHasValidLines();
    this.isLoadingInitialData = false;

    // =========================
    // SNAPSHOT ORIGINAL (CLAVE)
    // =========================
    this.initialSnapshot = {
      req: this.modeloFormReq.getRawValue(),
      doc: this.modeloFormDoc.getRawValue(),
      pie: this.modeloFormPie.getRawValue(),
      lines: JSON.parse(JSON.stringify(this.modeloLines))
    };

    // Marcar pristine
    this.modeloFormReq.markAsPristine();
    this.modeloFormDoc.markAsPristine();
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
    this.modeloFormReq.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormDoc.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());


    this.modeloFormPie.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());
  }

  /** Normaliza cualquier valor a Date; si es inválido devuelve la fecha actual para no romper comparaciones. */
  private normalizeDateToDate(value: any): Date {
    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      // valor por defecto obligatorio (elige uno válido)
      return new Date();
    }

    return date;
  }

  private normalizeDate(value: any): string | null {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);

    return isNaN(date.getTime())
      ? null
      : date.toISOString().substring(0, 10); // yyyy-mm-dd
  }

  private hasFormChanged(form: FormGroup, snapshot: any): boolean {
    const current = form.getRawValue();

    return Object.keys(snapshot).some(key => {
      const currentValue  = current[key];
      const snapshotValue = snapshot[key];

      // =========================
      // FECHAS (p-calendar)
      // =========================
      if (currentValue instanceof Date || snapshotValue instanceof Date) {
        return this.normalizeDate(currentValue) !== this.normalizeDate(snapshotValue);
      }

      // =========================
      // SelectItem (dropdowns)
      // =========================
      if (currentValue?.value !== undefined || snapshotValue?.value !== undefined) {
        return currentValue?.value !== snapshotValue?.value;
      }

      // =========================
      // VALORES NORMALES
      // =========================
      return currentValue !== snapshotValue;
    });
  }

  private detectRealChanges(): void {
    // =========================
    // VALIDACIÓN BÁSICA
    // =========================
    const formsValid =
    this.modeloFormReq.valid &&
    this.modeloFormDoc.valid &&
    this.modeloFormPie.valid &&
    this.modeloLines.length > 0;

    if (!formsValid) {
      this.hasRealChanges = false;
      return;
    }

    // =========================
    // 1️⃣ CAMBIOS EN FORMULARIOS (POR SNAPSHOT)
    // =========================
    const reqChanged = this.hasFormChanged(
      this.modeloFormReq,
      this.initialSnapshot.req
    );

    const docChanged = this.hasFormChanged(
      this.modeloFormDoc,
      this.initialSnapshot.doc
    );

    const pieChanged = this.hasFormChanged(
      this.modeloFormPie,
      this.initialSnapshot.pie
    );

    const formChanged = reqChanged || docChanged || pieChanged;

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
      'lineVendor',
      'pqtReqDate',
      'acctCode',
      'formatCode',
      'acctName',
      'ocrCode',
      'whsCode',
      'u_tipoOpT12',
      'u_tipoOpT12Nam',
      'u_tipoOpT12Nam',
      'u_FF_TIP_COM',
      'u_FF_TIP_COM_NAM',
      'quantity',
      'openQty'
    ];

    const hasUpdatedLines = this.modeloLines.some(line => {
      // Solo líneas existentes en BD
      if (line.record !== 2) return false;

      const original = this.initialSnapshot.lines.find(
        o => o.lineNum === line.lineNum && o.docEntry === line.docEntry
      );

      if (!original) return false;

      return FIELDS_TO_COMPARE.some(field => {

        const currentValue  = line[field];
        const originalValue = original[field];

        // =========================
        // 🔥 FECHAS (p-calendar)
        // =========================
        if (field === 'pqtReqDate') {
          return this.normalizeDate(currentValue) !==
                this.normalizeDate(originalValue);
        }

        // =========================
        // RESTO DE CAMPOS
        // =========================
        return currentValue !== originalValue;
      });
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

  /** Maneja cambios en el tipo de solicitante y carga la lista correspondiente */
  onChangeReqType(): void {
    const reqTypeValue = this.modeloFormReq.get('reqType')?.value?.value;

    if (reqTypeValue) {
      // Limpiar selección actual de reqName
      this.modeloFormReq.get('reqName')?.setValue('', { emitEvent: false });

      // Cargar requester list según el tipo seleccionado
      if (reqTypeValue === 12) {
        this.usersService.getList().subscribe({
          next: (data: any) => {
            this.requesterList = data.map(item => ({
              label: item.u_NAME,
              value: item.useR_CODE
            }));

            const userSap = this.userContextService.getUserSap();
            if(userSap){
              const defaultRequester = this.requesterList.find(x => x.value === userSap);
              if (defaultRequester) {
                this.modeloFormReq.get('reqName').setValue(defaultRequester, { emitEvent: false });
              }
            }
          },
          error: (e) => {
            this.utilService.handleErrorSingle(e, 'onChangeReqType', () => {}, this.swaCustomService);
          }
        });
      } else {
        this.employeesInfoService.getList().subscribe({
          next: (data) => {
            this.requesterList = data.map(item => ({
              label: item.fullName,
              value: item.empID
            }));
          },
          error: (e) => {
            this.utilService.handleErrorSingle(e, 'onChangeReqType', () => {}, this.swaCustomService);
          }
        });
      }
    }
  }

  /**
   * Maneja cambios en el selector de solicitante.
   * Obtiene datos del usuario/empleado y actualiza sucursal/departamento automáticamente.
   */
  onChangeReqName(): void {
    const reqTypeValue = this.modeloFormReq.get('reqType')?.value?.value;
    const reqNameValue = this.modeloFormReq.get('reqName')?.value?.value;

    if (!reqTypeValue || !reqNameValue) {
      return;
    }

    const request$: any =
      reqTypeValue === 12
        ? this.usersService.getByCode(reqNameValue)
        : this.employeesInfoService.getById(reqNameValue);

      request$
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: any) => {
          if (!data) {
            this.onSelectedBranchDeparment(undefined as any, undefined as any);
            this.modeloFormReq.patchValue({ email: '' }, { emitEvent: false });
            return;
          }

          const dept = reqTypeValue === 12 ? data?.department : data?.dept;
          const email= reqTypeValue === 12 ? data?.e_Mail     : data?.email;

          this.onSelectedBranchDeparment(data?.branch, dept);

          this.modeloFormReq.patchValue({ email: email }, { emitEvent: false });
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onChangeReqName', () => {}, this.swaCustomService);
        }
      });
  }

  /** Asigna sucursal y departamento automáticamente sin disparar eventos adicionales */
  onSelectedBranchDeparment(branch: number, department: number): void {
    // Asigna sucursal y departamento sin disparar eventos extra
    const branchCtrl = this.modeloFormReq.get('branch');
    const deptCtrl   = this.modeloFormReq.get('department');
    if (!branchCtrl || !deptCtrl) { return; }

    const branchSelected     = this.branchesList.find(x => x.value === branch) ?? '';
    const departmentSelected = this.departmentsList.find(x => x.value === department) ?? '';

    branchCtrl.setValue(branchSelected, { emitEvent: false });
    deptCtrl.setValue(departmentSelected, { emitEvent: false });
  }


  /** Aplica la fecha de requerimiento a todas las líneas que tengan artículo seleccionado */
  private applyReqDateToLines(date: Date): void {
    // Se obtiene solo las líneas que tienen descripción (artículo seleccionado)
    this.modeloLines.filter(line => line.dscription !== '').forEach(line => {
      line.pqtReqDate = date;
    });
  }

  /** Se suscribe a cambios en la fecha de requerimiento para aplicarlos a todas las líneas */
  private subscribeReqDate(): void {
    this.modeloFormDoc.get('reqDate')!
    .valueChanges
    .pipe(
      takeUntil(this.destroy$)
    )
    .subscribe((date: Date | null) => {
      if (date) {
        this.applyReqDateToLines(date);
      }
    });
  }

  onOpenArticulo(index: number): void {
    // Abre modal para buscar/seleccionar un artículo para la línea indicada
    this.indexArticulo        = index;
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }
  /** Asigna un artículo seleccionado a la línea actual */
  setItem(data: IArticuloQuery[]): void {
    const item = this.modeloLines[this.indexArticulo];
    const date = this.modeloFormDoc.get('reqDate')?.value;

    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if(index === 0) {
        item.itemCode       = element.itemCode;
        item.dscription     = element.itemName;
        if (date) {
          item.pqtReqDate   = date;
        }
        item.acctCode       = element.acctCode || '';
        item.formatCode     = element.formatCode || '';
        item.acctName       = element.acctName || '';
        item.u_tipoOpT12    = element.u_tipoOpT12 || '';
        item.u_tipoOpT12Nam = element.u_tipoOpT12Nam || '';
        item.whsCode        = element.dfltWH || '';
        item.unitMsr        = element.invntryUom;
        item.quantity       = 1;
        item.openQty        = 1
      }
    }

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }
  /** Busca artículos por código desde el servicio */
  getListByCode(itemCode: string): void {
    this.isDisplay = true;

    const params = {
      itemCode,
      cardCode          : '',
      currency          : '',
      slpCode           : 0,
      codTipoOperacion  : '02'
    };

    this.articuloService.getListByCode(params)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data:  IArticuloQuery[]) => {
        this.isDisplay = false;
        this.setItem(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListByCode', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }
  /** Maneja la selección de un artículo desde el modal */
  onSelectedArticulo(value: any): void {
    // Aplica el artículo seleccionado a la línea actual
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
    this.getListByCode(value.itemCode);
  }
  /** Cierra el modal de búsqueda de artículos */
  onClickCloseArticulo(): void {
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  onDescChange() {
    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  /** Abre el modal para seleccionar proveedor de la línea indicada */
  onOpenProveedor(index: number): void {
    // Abre modal para seleccionar proveedor de la línea
    this.indexCentroProveedor = index;
    this.isVisualizarProveedor = !this.isVisualizarProveedor;
  }
  /** Maneja la selección de un proveedor desde el modal */
  onSelectedProveedor(value: any): void {
    // Aplica el proveedor seleccionado a la línea actual
    const currentLine          = this.modeloLines[this.indexCentroProveedor];
    currentLine.lineVendor     = value.cardCode;
    this.isVisualizarProveedor = !this.isVisualizarProveedor;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }
  /** Cierra el modal de búsqueda de proveedores */
  onClickCloseProveedor(): void {
    this.isVisualizarProveedor = !this.isVisualizarProveedor;
  }

  onFechaChange() {
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  /** Abre el modal para seleccionar cuenta contable de la línea indicada */
  onOpenCuentaContable(index: number): void {
    // Abre modal para seleccionar cuenta contable de la línea
    this.indexCentroCuentaContable = index;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }
  /** Maneja la selección de una cuenta contable desde el modal */
  onSelectedCuentaContable(value: any): void {
    // Aplica el centro de costo seleccionado a la línea actual
    const currentLine               = this.modeloLines[this.indexCentroCuentaContable];
    currentLine.acctCode            = value.acctCode;
    currentLine.formatCode          = value.formatCode;
    currentLine.acctName            = value.acctName;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }
  /** Cierra el modal de búsqueda de cuentas contables */
  onClickCloseCuentaContable(): void {
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  /** Abre el modal para seleccionar centro de costo de la línea indicada */
  onOpenCentroCosto(index: number): void {
    // Abre modal para seleccionar centro de costo de la línea
    this.indexCentroCosto        = index;
    this.isVisualizarCentroCosto = !this.isVisualizarCentroCosto;
  }
  /** Maneja la selección de un centro de costo desde el modal */
  onSelectedCentroCosto(value: any): void {
    // Aplica el centro de costo seleccionado a la línea actual
    const currentLine            = this.modeloLines[this.indexCentroCosto];
    currentLine.ocrCode          = value.ocrCode;
    this.isVisualizarCentroCosto = !this.isVisualizarCentroCosto;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }
  /** Cierra el modal de búsqueda de centros de costo */
  onClickCloseCentroCosto(): void {
    this.isVisualizarCentroCosto = !this.isVisualizarCentroCosto;
  }

  /** Abre el modal para seleccionar almacén de destino de la línea indicada */
  onOpenAlmacen(value: ISolicitudCompra1, index: number): void {
    // Abre modal para seleccionar almacén de destino de la línea
    this.indexAlmacen         = index;
    this.itemCode             = value.itemCode;
    this.isVisualizarAlmacen  = !this.isVisualizarAlmacen;
  }
  /** Maneja la selección de un almacén desde el modal */
  onSelectedAlmacen(value: any): void {
    // Aplica el almacén de destino seleccionado a la línea actual
    const currentLine         = this.modeloLines[this.indexAlmacen];
    currentLine.whsCode       = value.whsCode;
    this.isVisualizarAlmacen  = !this.isVisualizarAlmacen;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }
  /** Cierra el modal de búsqueda de almacenes */
  onClickCloseAlmacen(): void {
    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;
  }

  /** Abre el modal para seleccionar tipo de operación de la línea indicada */
  onOpenTipoOperacion(index: number): void {
    // Abre modal para seleccionar tipo de operación de la línea
    this.indexTipoOperacion        = index;
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }
  /** Maneja la selección de un tipo de operación desde el modal */
  onSelectedTipoOperacion(value: any): void {
    // Aplica el tipo de operación seleccionado a la línea actual
    const currentLine              = this.modeloLines[this.indexTipoOperacion];
    currentLine.u_tipoOpT12        = value.code;
    currentLine.u_tipoOpT12Nam     = value.u_descrp;
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }
  /** Cierra el modal de búsqueda de tipos de operación */
  onClickCloseTipoOperacion(): void {
    this.isVisualizarTipoCompra = !this.isVisualizarTipoCompra;
  }

  /** Abre el modal para seleccionar tipo de compra de la línea indicada */
  onOpenTipoCompra(index: number): void {
    // Abre modal para seleccionar tipo de compra de la línea
    this.indexTipoCompra = index;
    this.isVisualizarTipoCompra = !this.isVisualizarTipoCompra;
  }
  /** Maneja la selección de un tipo de compra desde el modal */
  onClickSelectedTipoCompra(value: any): void {
    // Aplica el tipo de compra seleccionado a la línea actual
    const currentLine             = this.modeloLines[this.indexTipoCompra];
    currentLine.u_FF_TIP_COM      = value.fldValue;
    currentLine.u_FF_TIP_COM_NAM  = value.descr;
    this.isVisualizarTipoCompra   = !this.isVisualizarTipoCompra;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }
  /** Cierra el modal de búsqueda de tipos de compra */
  onClickCloseTipoCompra(): void {
    this.isVisualizarTipoCompra = !this.isVisualizarTipoCompra;
  }

  onChangeQuantity(value: ISolicitudCompra1, index: number): void {
    if (value.record === 1) {
      this.updateQuantityNew(value, index);
    } else {
      this.updateQuantityExisting(value, index);
    }

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  private updateQuantityNew(value: ISolicitudCompra1, index: number): void {
    if (value.itemCode === '') {
      this.modeloLines[index].quantity = 0;
      this.modeloLines[index].openQty = 0;
      return;
    }

    const quantity = this.utilService.onRedondearDecimal(value.quantity, 3);
    this.modeloLines[index].quantity = quantity;
    this.modeloLines[index].openQty = quantity;
  }

  private updateQuantityExisting(value: ISolicitudCompra1, index: number): void {
    const modelomodeloLinesOriginal = this.modeloLinesOriginal.find(d => d.lineNum === value.lineNum && d.docEntry === value.docEntry);

    if (!modelomodeloLinesOriginal) return;

    const quantity    = this.utilService.onRedondearDecimal(value.quantity, 3);
    const earring     = this.utilService.onRedondearDecimal(modelomodeloLinesOriginal.quantity - modelomodeloLinesOriginal.openQty,3);

    this.modeloLines[index].quantity        = value.itemCode === '' ? 0 : quantity;
    this.modeloLines[index].openQty         = value.itemCode === '' ? 0 : (quantity - earring) > 0 ? (quantity - earring) : 0;
  }

  private validateSave(): boolean {
    /** Valida que el documento esté completo antes de guardar */
    const showError = (message: string): boolean => {
      this.swaCustomService.swaMsgInfo(message);
      return false;
    };

    const formReqValues     = this.modeloFormReq.getRawValue();
    const formDocValues     = this.modeloFormDoc.getRawValue();
    const formConValues     = this.modeloFormCon.getRawValue();
    const formPieValues     = this.modeloFormPie.getRawValue();

    const reqNameValue      = formReqValues.reqName?.value || '';
    const notifyValue       = formReqValues.notify;
    const emailValue        = formReqValues.email || '';
    const docDate           = formDocValues.docDate;
    const docDueDate        = formDocValues.docDueDate;
    const taxDate           = formDocValues.taxDate;
    const reqDate           = formDocValues.reqDate;

    const docTypeValue      = formConValues.docType?.value;
    const isItemDoc         = docTypeValue === 'I';

    const employeeInfoValue = formPieValues.employeeInfo?.value;

    if (reqNameValue === undefined || reqNameValue === null || reqNameValue === '') {
      return showError('Seleccione el nombre del solicitante.');
    }

    if (notifyValue && (emailValue === undefined || emailValue === null || emailValue.trim() === '')) {
      return showError('Ingrese un correo electrónico válido.');
    }

    if (!docDate) {
      return showError('Ingrese la fecha del documento.');
    }

    if (!docDueDate) {
      return showError('Ingrese la fecha de vencimiento del documento.');
    }

    if (!taxDate) {
      return showError('Ingrese la fecha fiscal del documento.');
    }

    if (!reqDate) {
      return showError('Ingrese la fecha de requerimiento.');
    }

    if (employeeInfoValue === undefined || employeeInfoValue === null) {
      return showError('Seleccione el propietario de la solicitud.');
    }


    for (const line of this.modeloLines.filter(line => isItemDoc ? line.itemCode !== '' : line.dscription !== '')) {
      if (isItemDoc && line.itemCode === '') {
        return showError('Seleccione la cuenta contable en el detalle.');
      }
      if (line.pqtReqDate === null) {
        return showError('Ingrese la fecha de requerimiento en el detalle.');
      }
      if (line.acctCode === '') {
        return showError('Seleccione la cuenta contable en el detalle.');
      }
      if (line.ocrCode === '') {
        return showError('Seleccione el centro de costos en el detalle.');
      }
      if (isItemDoc && line.whsCode === '') {
        return showError('Seleccione el almacén en el detalle.');
      }
      if (!line?.u_tipoOpT12) {
        return showError('Seleccione el tipo de operación en el detalle.');
      }
      if (!line?.u_FF_TIP_COM) {
        return showError('Seleccione el tipo de compra en el detalle.');
      }
      if (isItemDoc && line.quantity === 0) {
        return showError('La cantidad debe ser mayor que CERO (0).');
      }
    }
    return true;
  }

  private buildModelToSave(): SolicitudCompraUpdateModel {
    const formValues = {
      ...this.modeloFormReq.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormCon.getRawValue(),
      ...this.modeloFormPie.getRawValue()
    };

    const userId = this.userContextService.getIdUsuario();
    const allLines = [...this.modeloLines, ...this.modeloLinesEliminar];

    const lines: SolicitudCompra1UpdateModel[] = allLines
      .filter(linea => linea.itemCode !== '' && linea.record !== 4)
      .map(linea => ({
        docEntry      : linea.docEntry,
        lineNum       : linea.lineNum,
        lineStatus    : linea.lineStatus,
        itemCode      : linea.itemCode,
        dscription    : linea.dscription,
        lineVendor    : linea.lineVendor,
        pqtReqDate    : this.utilService.normalizeDate(linea.pqtReqDate),
        acctCode      : linea.acctCode,
        ocrCode       : linea.ocrCode,
        whsCode       : linea.whsCode,
        u_tipoOpT12   : linea.u_tipoOpT12,
        u_FF_TIP_COM: linea.u_FF_TIP_COM,
        unitMsr       : linea.unitMsr,
        quantity      : linea.quantity,
        record        : linea.record
      }));

    return {
      ...new SolicitudCompraUpdateModel(),
      docEntry        : this.docEntry,
      docDate         : this.utilService.normalizeDate(formValues.docDate),
      docDueDate      : this.utilService.normalizeDate(formValues.docDueDate),
      taxDate         : this.utilService.normalizeDate(formValues.taxDate),
      reqDate         : this.utilService.normalizeDate(formValues.reqDate),
      docType         : formValues.docType?.value,
      reqType         : formValues.reqType?.value,
      requester       : formValues.reqName?.value,
      reqName         : formValues.reqName?.label,
      branch          : formValues.branch?.value,
      department      : formValues.department?.value,
      notify          : formValues.notify === true ? 'Y' : 'N',
      email           : formValues.email,
      ownerCode       : formValues.employeeInfo?.value,
      comments        : formValues.comments,
      u_UsrUpdate     : userId,
      lines           : lines
    };
  }

  private save(): void {
    // Persiste el documento al servicio backend si los detalles son válidos
    if (!this.validateSave()) {
      return;
    }

    this.isSaving = true;

    const modeloToSave = this.buildModelToSave();

    debugger;

    this.solicitudCompraService.setUpdate(modeloToSave)
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

  /** Muestra diálogo de confirmación antes de guardar el documento */
  onClickSave(): void {
    // Diálogo de confirmación antes de guardar; ejecuta `save()` si se confirma
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

  /** Navega de vuelta a la lista de solicitudes de compra */
  onClickBack(): void {
    this.router.navigate(['/main/modulo-com/panel-solicitud-compra-list']);
  }
}
