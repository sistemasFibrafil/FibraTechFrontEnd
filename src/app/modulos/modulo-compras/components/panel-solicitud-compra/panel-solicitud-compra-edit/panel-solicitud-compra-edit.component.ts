import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, forkJoin, merge, Subject, switchMap, takeUntil } from 'rxjs';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

import { LayoutComponent } from '@app/layout/layout.component';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ItemsFindByListCodeModel } from '@app/modulos/modulo-inventario/models/items.model';
import { PurchaseRequest1UpdateModel, PurchaseRequestUpdateModel } from '../../../models/sap-business-one/purchase-request.model';

import { MenuItem, TableColumn } from '@app/interface/common-ui.interface';
import { IArticuloQuery } from '@app/modulos/modulo-inventario/interfaces/items.interface';
import { IPurchaseRequest, IPurchaseRequest1 } from '../../../interfaces/sap-business-one/purchase-request.interface';

import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { LocalDataService } from '@app/services/local-data.service';
import { UserContextService } from '@app/services/user-context.service';
import { ItemsService } from '@app/modulos/modulo-inventario/services/items.service';
import { PurchaseRequestService } from '../../../services/sap-business-one/purchase-request.service';
import { EmployeesInfoService } from '@app/modulos/modulo-recursos-humanos/services/employees-info.service';
import { UsersService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/users.service';
import { BranchesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/branchs.service';
import { DepartmentsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/departments.service';


@Component({
  selector: 'app-com-panel-solicitud-compra-edit',
  templateUrl: './panel-solicitud-compra-edit.component.html',
  styleUrls: ['./panel-solicitud-compra-edit.component.css']
})
export class PanelSolicitudCompraEditComponent implements OnInit, OnDestroy, AfterViewInit {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly destroy$                    = new Subject<void>();
  private resizeObserver!                      : ResizeObserver;

  @ViewChild('notifyLabel') notifyLabel!       : ElementRef<HTMLElement>;
  paddingTop                                   = '20px';


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  readonly titulo                              = 'Solicitud de Compra';
  globalConstants                              : GlobalsConstantsForm = new GlobalsConstantsForm();


  // ===========================
  // 🔹 3. FORMS
  // ===========================
  modeloFormReq                                : FormGroup;
  modeloFormDoc                                : FormGroup;
  modeloFormCon                                : FormGroup;
  modeloFormPie                                : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isLocked                                     = false;
  isSaving                                     = false;
  isDisplay                                    = false;
  hasValidLines                                = false;
  hasRealChanges                               = false;
  sLoadingInitialData                          = false;
  isLoadingInitialData                         = false;
  isVisualizarAlmacen                          = false;
  isVisualizarArticulo                         = false;
  isVisualizarProveedor                        = false;
  isVisualizarTipoCompra                       = false;
  isVisualizarCentroCosto                      = false;
  isVisualizarTipoOperacion                    = false;
  isVisualizarCuentaContable                   = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  items                                        : MenuItem[];
  columnas                                     : TableColumn[] = [];
  opciones                                     : MenuItem[];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modelo                                       : IPurchaseRequest;
  modeloLinesSelected                          : IPurchaseRequest1;
  modeloLinesSelectedContext                   : IPurchaseRequest1;

  modeloLines                                  : IPurchaseRequest1[] = [];
  modeloLinesEliminar                          : IPurchaseRequest1[] = [];
  modeloLinesOriginal                          : IPurchaseRequest1[] = [];


  // ===========================
  // 🔹 7. COMBOS / LISTS
  // ===========================
  reqTypesList                                 : SelectItem[] = [];
  docTypesList                                 : SelectItem[] = [];
  branchesList                                 : SelectItem[] = [];
  docStatusList                                : SelectItem[] = [];
  requesterList                                : SelectItem[] = [];
  departmentsList                              : SelectItem[] = [];
  employeesInfoList                            : SelectItem[] = [];


  // ===========================
  // 🔹 8. DOC TYPE CONTROL
  // ===========================
  initialSnapshot!                             : any;


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
  id                                           = 0;
  docEntry                                     = 0;
  indexAlmacen                                 = 0;
  indexArticulo                                = 0;
  indexTipoCompra                              = 0;
  indexCentroCosto                             = 0;
  indexTipoOperacion                           = 0;
  indexCentroProveedor                         = 0;
  indexCentroCuentaContable                    = 0;


  // ===========================
  // 🔹 10. AUX / FILTERS
  // ===========================
  filler                                       = '';
  itemCode                                     = '';
  toWhsCode                                    = '';
  inactiveAlmacen                              = 'N';
  demandanteAlmacen                            = 'N';
  inactiveAlmacenItem                          = 'N';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    public  readonly app: LayoutComponent,
    private readonly route: ActivatedRoute,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly branchesService: BranchesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly departmentsService: DepartmentsService,
    private readonly employeesInfoService: EmployeesInfoService,
    private readonly purchaseRequestService: PurchaseRequestService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  /**
   * Inicializa formularios y carga datos iniciales para combos.
   */
  ngOnInit(): void {
    this.initializeComponent();
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

  /**
   * Limpia suscripciones/observadores para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  //#endregion



  //#region <<< 2. INITIALIZATION >>>

  private initializeComponent(): void {
    // 1️⃣ Crear formularios
    this.buildForms();

    // 2️⃣ Cargar datos base
    this.loadAllCombos();

    // 3️⃣ Registrar listeners reactivos
    this.subscribeReqDate();

    // 4️⃣ Inicializar UI
    this.onBuildColumn();
    this.opcionesTabla();
    this.buildContextMenu();
  }

  private buildForms(): void {
    // Define y compone grupos de formulario con validadores
    this.modeloFormReq = this.fb.group({
      reqType                 : [{ value: '', disabled: false }, Validators.required],
      reqName                 : [{ value: '', disabled: false }, Validators.required],
      branch                  : [{ value: '', disabled: false }],
      department              : [{ value: '', disabled: false }],
      notify                  : [{ value: false, disabled: false }],
      email                   : [{ value: '', disabled: false }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: false }],
      docStatus               : [{ value: 'Abierto', disabled: false }, Validators.required],
      docDate                 : [{ value: null, disabled: false }, Validators.required],
      docDueDate              : [{ value: null, disabled: false }, Validators.required],
      taxDate                 : [{ value: null, disabled: false }, Validators.required],
      reqDate                 : [{ value: null, disabled: false }, Validators.required]
    });

    this.modeloFormCon = this.fb.group({
      docType                 : [{ value: '', disabled: false }, Validators.required]
    });

    this.modeloFormPie = this.fb.group({
      employeeInfo            : [{ value: '', disabled: false }, Validators.required],
      comments                : [{ value: '', disabled: false }, Validators.maxLength(250)]
    });
  }

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
          label: item.userName,
          value: item.userCode
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
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  private onBuildColumn(): void {
    // Usar docTypeSelected si está disponible, sino leer del formulario
    const docTypeValue = this.modeloFormCon.get('docType')?.value?.value;
    const isItemDoc         = docTypeValue === 'I';

    if( isItemDoc){
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
        { field: 'onHand',            header: 'Stock' },
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

  //#endregion



  //#region <<< 3. GETTERS >>>

  private get docType(): string {
    return this.modeloFormCon.get('docType')?.value?.value;
  }

  get isItem(): boolean {
    return this.docType === 'I';
  }

  get isService(): boolean {
    return this.docType === 'S';
  }

  //#endregion



  //#region <<< 4. TABLE / CONTEXT MENU >>>

  onContextMenuShow(event: any): void {
    // No sobrescribir la selección del contexto si el evento no trae datos de fila.
    // El p-table ya actualiza `modeloLinesSelectedContext` vía [(contextMenuSelection)].
    if (event?.item?.data) {
      this.modeloLinesSelectedContext = event.item.data;
    }
    this.updateMenuContextVisibility();
  }

  /** Agrega una nueva línea después de la línea seleccionada en el menú contextual */
  onClickContextMenuAddLine(modelo: IPurchaseRequest1): void {
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
  onClickContextMenuDelete(modelo: IPurchaseRequest1): void {
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


  /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
  onSelectedItem(modelo: IPurchaseRequest1): void {
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

  //#endregion



  //#region <<< 5. LINES (CORE) >>>

  private addLine(index: number): void {
    const newLine: IPurchaseRequest1 = {
      lineStatus        : 'O',
      itemCode          : '',
      dscription        : '',
      lineVendor        : '',
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
      onHand            : 0,
      quantity          : 0,
      openQty           : 0,
      record            : 1
    };


    // 🔥 Crear nueva referencia
    this.modeloLines = [
      ...this.modeloLines.slice(0, index),
      newLine,
      ...this.modeloLines.slice(index)
    ];

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  /** Aplica la fecha de requerimiento a todas las líneas que tengan artículo seleccionado */
  private applyReqDateToLines(date: Date): void {
    // Se obtiene solo las líneas que tienen descripción (artículo seleccionado)
    this.modeloLines.filter(line => line.dscription !== '').forEach(line => {
      line.pqtReqDate = date;
    });
  }

  // Verifica si todas las líneas son válidas según el tipo de documento
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

  //#endregion



  //#region <<< 6. DOC TYPE >>>
  //#endregion



  //#region <<< 7. ICONS >>>

  showIcon(modelo: any): boolean {
    const u = this.utilService;
    const p = (v: any) => u.normalizePrimitive(v);

    const lineStatus = p(modelo.lineStatus);
    const itemCode   = p(modelo.itemCode);
    const dscription = p(modelo.dscription);

    if (lineStatus === 'C') return false;

    // Caso 1: Tipo Item
    if (this.docType === 'I') {
      return !!itemCode;
    }

    // Caso 2: Tipo Servicio
    if (this.docType === 'S') {
      return !!dscription;
    }

    return false;
  }

  showIconDelete(modelo: any): boolean {
    const p = (v: any) => this.utilService.normalizePrimitive(v);

    return p(modelo.lineStatus) !== 'C'
      && !!p(modelo.lineVendor);
  }

  //#endregion



  //#region <<< 8. ARTÍCULO >>>

  onOpenArticulo(index: number): void {
    this.indexArticulo        = index;
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  onSelectedArticulo(value: any): void {
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
    this.getListByCode(value.itemCode);
  }

  onClickCloseArticulo(): void {
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  private mapToPurchaseRequest(element: IArticuloQuery, date: Date): IPurchaseRequest1 {
    /** helpers para evitar repetición */
    const u       = this.utilService;
    const p       = (v:any)=>u.normalizePrimitive(v);
    const d       = (v:any)=>u.normalizeDateOrToday(v);

    return {
      itemCode       : p(element.itemCode),
      dscription     : p(element.itemName),
      pqtReqDate     : d(date),
      acctCode       : p(element.acctCode),
      formatCode     : p(element.formatCode),
      acctName       : p(element.acctName),
      u_tipoOpT12    : p(element.u_tipoOpT12),
      u_tipoOpT12Nam : p(element.u_tipoOpT12Nam),
      whsCode        : p(element.dfltWH),
      unitMsr        : p(element.buyUnitMsr),
      onHand         : p(element.onHand),
      quantity       : 1,
      openQty        : 1
    };
  }

  setItem(data: IArticuloQuery[]): void {
    const element = data[0];
    const date = this.modeloFormDoc.get('reqDate')?.value;

    const newItem = this.utilService.mapLine(
      this.mapToPurchaseRequest(element, date)
    );

    this.modeloLines = this.modeloLines.map((line, index) => {
      if (index !== this.indexArticulo) return line;

      return {
        ...newItem,
        record: line.record === 1 ? 1 : 2
      };
    });

    this.updateHasValidLines();
    this.detectRealChanges();
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
        next: (data: any[]) => {
          if (!data || data.length === 0) {
            this.swaCustomService.swaMsgError('Artículo no encontrado');
            return;
          }

          this.setItem(data);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'getListByCode', this.swaCustomService);
        }
      });
  }

  private buildFilterParams(itemCode: string): ItemsFindByListCodeModel {
    return {
      itemCode,
      cardCode            : '',
      currency            : '',
      operationTypeCode   : '02',
      warehouseProduction : '',
      warehouseLogistics  : 'Y',
    };
  }

  onDescChange() {
    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  //#endregion



  //#region <<< 9. PROVEEDOR >>>

  onOpenProveedor(index: number): void {
    this.indexCentroProveedor = index;
    this.isVisualizarProveedor = !this.isVisualizarProveedor;
  }

  onSelectedProveedor(value: any): void {
    const currentLine          = this.modeloLines[this.indexCentroProveedor];
    currentLine.lineVendor     = value.cardCode;
    this.isVisualizarProveedor = !this.isVisualizarProveedor;

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseProveedor(): void {
    this.isVisualizarProveedor = !this.isVisualizarProveedor;
  }

  onDeleteProveedor(index: number): void {
    if (index == null || index < 0) return;

    const linea = this.modeloLines[index];
    if (!linea) return;

    // 🔥 Limpiar proveedor
    linea.lineVendor = '';

    // 🔄 Forzar actualización (por si Angular no detecta el cambio)
    this.modeloLines = [...this.modeloLines];

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  //#endregion



  //#region <<< 10. CUENTA CONTABLE >>>

  onOpenCuentaContable(index: number): void {
    this.indexCentroCuentaContable = index;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  onSelectedCuentaContable(value: any): void {
    const currentLine               = this.modeloLines[this.indexCentroCuentaContable];
    currentLine.acctCode            = value.acctCode;
    currentLine.formatCode          = value.formatCode;
    currentLine.acctName            = value.acctName;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseCuentaContable(): void {
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  //#endregion



  //#region <<< 11. CENTRO DE COSTO >>>

  onOpenCentroCosto(index: number): void {
    this.indexCentroCosto        = index;
    this.isVisualizarCentroCosto = !this.isVisualizarCentroCosto;
  }

  onSelectedCentroCosto(value: any): void {
    const currentLine            = this.modeloLines[this.indexCentroCosto];
    currentLine.ocrCode          = value.ocrCode;
    this.isVisualizarCentroCosto = !this.isVisualizarCentroCosto;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseCentroCosto(): void {
    this.isVisualizarCentroCosto = !this.isVisualizarCentroCosto;
  }

  //#endregion



  //#region <<< 12. ALMACÉN >>>

  onOpenAlmacen(value: IPurchaseRequest1, index: number): void {
    this.indexAlmacen         = index;
    this.itemCode             = value.itemCode;
    this.isVisualizarAlmacen  = !this.isVisualizarAlmacen;
  }

  onSelectedAlmacen(value: any): void {
    const currentLine         = this.modeloLines[this.indexAlmacen];
    currentLine.whsCode       = value.whsCode;
    this.isVisualizarAlmacen  = !this.isVisualizarAlmacen;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseAlmacen(): void {
    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;
  }

  //#endregion



  //#region <<< 13. TIPO OPERACIÓN >>>

  onOpenTipoOperacion(index: number): void {
    this.indexTipoOperacion        = index;
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }

  onSelectedTipoOperacion(value: any): void {
    const currentLine              = this.modeloLines[this.indexTipoOperacion];
    currentLine.u_tipoOpT12        = value.code;
    currentLine.u_tipoOpT12Nam     = value.fullDescription;
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseTipoOperacion(): void {
    this.isVisualizarTipoCompra = !this.isVisualizarTipoCompra;
  }

  //#endregion



  //#region <<< 14. TIPO COMPRA >>>

  onOpenTipoCompra(index: number): void {
    this.indexTipoCompra = index;
    this.isVisualizarTipoCompra = !this.isVisualizarTipoCompra;
  }

  onClickSelectedTipoCompra(value: any): void {
    const currentLine             = this.modeloLines[this.indexTipoCompra];
    currentLine.u_FF_TIP_COM      = value.fldValue;
    currentLine.u_FF_TIP_COM_NAM  = value.fullDescr;
    this.isVisualizarTipoCompra   = !this.isVisualizarTipoCompra;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseTipoCompra(): void {
    this.isVisualizarTipoCompra = !this.isVisualizarTipoCompra;
  }

  //#endregion



  //#region <<< 15. CANTIDAD >>>

  onChangeQuantity(value: IPurchaseRequest1, index: number): void {
    if (value.record === 1) {
      this.updateQuantityNew(value, index);
    } else {
      this.updateQuantityExisting(value, index);
    }

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  private updateQuantityNew(value: IPurchaseRequest1, index: number): void {
    if (value.itemCode === '') {
      this.modeloLines[index].quantity = 0;
      this.modeloLines[index].openQty = 0;
      return;
    }

    const quantity = this.utilService.onRedondearDecimal(value.quantity, 3);
    this.modeloLines[index].quantity = quantity;
    this.modeloLines[index].openQty = quantity;
  }

  private updateQuantityExisting(value: IPurchaseRequest1, index: number): void {
    const modelomodeloLinesOriginal = this.modeloLinesOriginal.find(d => d.lineNum === value.lineNum && d.docEntry === value.docEntry);

    if (!modelomodeloLinesOriginal) return;

    const quantity    = this.utilService.onRedondearDecimal(value.quantity, 3);
    const earring     = this.utilService.onRedondearDecimal(modelomodeloLinesOriginal.quantity - modelomodeloLinesOriginal.openQty,3);

    this.modeloLines[index].quantity        = value.itemCode === '' ? 0 : quantity;
    this.modeloLines[index].openQty         = value.itemCode === '' ? 0 : (quantity - earring) > 0 ? (quantity - earring) : 0;
  }

  //#endregion



  //#region <<< 16. REQUESTER / HEADER LOGIC >>>

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
              label: item.userName,
              value: item.userCode
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
            this.utilService.handleErrorSingle(e, 'onChangeReqType', this.swaCustomService);
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
            this.utilService.handleErrorSingle(e, 'onChangeReqType', this.swaCustomService);
          }
        });
      }
    }
  }

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
          const email= reqTypeValue === 12 ? data?.email     : data?.email;

          this.onSelectedBranchDeparment(data?.branch, dept);

          this.modeloFormReq.patchValue({ email: email }, { emitEvent: false });
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onChangeReqName', this.swaCustomService);
        }
      });
  }

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

  //#endregion



  //#region <<< 17. SAVE >>>

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

  private save(): void {
    if (!this.validateSave()) {
      return;
    }

    this.isSaving = true;

    const modeloToSave = this.buildModelToSave();

    this.purchaseRequestService.setUpdate(modeloToSave)
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

  private validateSave(): boolean {
    const showError = (msg: string) => {
      this.swaCustomService.swaMsgInfo(msg);
      return false;
    };

    /** helpers */
    const u   = this.utilService;
    const p   = (v:any)=>u.normalizePrimitive(v);
    const val = (v:any)=>v?.value ?? v;

    /** combinar forms */
    const f = this.mergeForms();

    const isItemDoc = val(f.docType) === 'I';

    /** 🔹 VALIDACIONES HEADER */
    const headerValidations = [
      { cond: !val(f.reqName), msg: 'Seleccione el nombre del solicitante.' },
      { cond: f.notify && !p(f.email)?.trim(), msg: 'Ingrese un correo electrónico válido.' },
      { cond: !f.docDate, msg: 'Ingrese la fecha del documento.' },
      { cond: !f.docDueDate, msg: 'Ingrese la fecha de vencimiento del documento.' },
      { cond: !f.taxDate, msg: 'Ingrese la fecha fiscal del documento.' },
      { cond: !f.reqDate, msg: 'Ingrese la fecha de requerimiento.' },
      { cond: !val(f.employeeInfo), msg: 'Seleccione el propietario de la solicitud.' }
    ];

    for (const v of headerValidations) {
      if (v.cond) return showError(v.msg);
    }

    /** 🔹 VALIDACIONES DETALLE */
    for (const line of this.modeloLines) {

      const lineValidations = [
        { cond: !line.pqtReqDate, msg: 'Ingrese la fecha de requerimiento en el detalle.' },
        { cond: !line.acctCode, msg: 'Seleccione la cuenta contable en el detalle.' },
        { cond: !line.ocrCode, msg: 'Seleccione el centro de costos en el detalle.' },
        { cond: !line?.u_tipoOpT12, msg: 'Seleccione el tipo de operación en el detalle.' },
        { cond: !line?.u_FF_TIP_COM, msg: 'Seleccione el tipo de compra en el detalle.' },

        ...(isItemDoc ? [
          { cond: !line.whsCode, msg: 'Seleccione el almacén en el detalle.' },
          { cond: !line.unitMsr, msg: 'La unidad medida es obligatoria. Definir en datos maestros del artículo. Pestaña "Datos de compras".' },
          { cond: !line.quantity || line.quantity <= 0, msg: 'La cantidad debe ser mayor que CERO (0).' }
        ] : [])
      ];

      for (const v of lineValidations) {
        if (v.cond) return showError(v.msg);
      }
    }

    return true;
  }

  private mergeForms() {
    return {
      ...this.modeloFormReq.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormCon.getRawValue(),
      ...this.modeloFormPie.getRawValue()
    };
  }

  private mapLinesUpdate(): PurchaseRequest1UpdateModel[] {
    /** helpers para evitar repetición */
    const u = this.utilService;
    const p = (v:any)=>u.normalizePrimitive(v);
    const n = (v:any)=>u.normalizeNumber(v);
    const d = (v:any)=>u.normalizeDateOrToday(v);

    const allLines = [...this.modeloLines, ...this.modeloLinesEliminar];

    return allLines.map(line => ({

      docEntry    : n(line.docEntry),
      lineNum     : n(line.lineNum),
      lineStatus  : p(line.lineStatus),

      itemCode    : p(line.itemCode),
      dscription  : p(line.dscription),

      lineVendor  : p(line.lineVendor),
      pqtReqDate  : d(line.pqtReqDate),

      acctCode    : p(line.acctCode),
      ocrCode     : p(line.ocrCode),

      whsCode     : p(line.whsCode),

      unitMsr     : p(line.unitMsr),
      quantity    : n(line.quantity),

      u_tipoOpT12 : p(line.u_tipoOpT12),
      u_FF_TIP_COM: p(line.u_FF_TIP_COM),

      record      : n(line.record)
    }));
  }

  private buildModelToSave(): PurchaseRequestUpdateModel {
    /** helpers para evitar repetición */
    const u         = this.utilService;
    const p         = (v:any)=>u.normalizePrimitive(v);
    const d         = (v:any)=>u.normalizeDateOrToday(v);
    const val       = (v:any)=>v?.value ?? v;
    const label     = (v:any)=>v?.label ?? v ?? '';

    /** combinar tod  os los formularios */
    const f         = this.mergeForms();

    const userId    = this.userContextService.getIdUsuario();

    const notify  = f.notify === true ? 'Y' : 'N';

    const lines     = this.mapLinesUpdate();

    return {
      ...new PurchaseRequestUpdateModel(),

      docEntry    : this.docEntry,

      docDate     : d(f.docDate),
      docDueDate  : d(f.docDueDate),
      taxDate     : d(f.taxDate),
      reqDate     : d(f.reqDate),

      docType     : val(f.docType),

      reqType     : val(f.reqType),
      requester   : val(f.reqName),
      reqName     : label(f.reqName),

      branch      : val(f.branch),
      department  : val(f.department),

      notify      : notify,
      email       : p(f.email),

      ownerCode   : val(f.employeeInfo),

      comments    : p(f.comments),

      u_UsrUpdate : userId,

      lines
    };
  }

  //#endregion



  //#region <<< 18. NAVIGATION >>>

  onClickBack(): void {
    this.router.navigate(['/main/modulo-com/panel-solicitud-compra-list']);
  }

  //#endregion



  //#region <<< 19. DATA LOADING >>>

  private loadData(): void {
    this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.id = +params['id'];

        // 🔥 aquí sí se activa de forma confiable
        this.isDisplay = true;

        return this.purchaseRequestService
          .getByDocEntry(this.id)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IPurchaseRequest) => {
        this.modeloLinesOriginal = structuredClone(data.lines);

        const normalizedLines = data.lines.map(line => ({
          ...line,
          pqtReqDate: this.utilService.normalizeDateOrToday(line.pqtReqDate)
        }));

        const modelo = {
          ...data,
          lines: normalizedLines
        };

        this.modeloLinesOriginal = normalizedLines.map(line => ({
          ...line,
          pqtReqDate: new Date(line.pqtReqDate)
        }));

        this.setFormValues(modelo);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: IPurchaseRequest): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el modeloLines durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.isLocked                 = value.docStatus !== 'O';
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
        email                     : this.utilService.normalizePrimitive(value.email)
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
    this.modeloFormCon.patchValue(
      {
        docType                  : docType || null,
      },
      { emitEvent: false }
    );

    // Buscar y asignar valor como SelectItem para empleado
    const employee                = this.employeesInfoList.find(item => item.value === value.ownerCode);

    // Actualizar formulario Pie
    this.modeloFormPie.patchValue(
      {
        employeeInfo              : employee || null,
        comments                  : this.utilService.normalizePrimitive(value.comments)
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar modeloLines después de que los formularios estén actualizados
    // =========================================================================
    // Esto garantiza que los eventos onChange no sobrescriban los valores originales del modeloLines
    this.onBuildColumn();
    this.modeloLines = (value.lines || []).map(linea => this.utilService.mapLine(linea));
    this.updateHasValidLines();
    this.isLoadingInitialData = false;

    // =========================
    // SNAPSHOT ORIGINAL (CLAVE)
    // =========================
    this.initialSnapshot = {
      req: this.modeloFormReq.getRawValue(),
      doc: this.modeloFormDoc.getRawValue(),
      pie: this.modeloFormPie.getRawValue(),
      lines: structuredClone(this.modeloLines)
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

  //#endregion



  //#region <<< 20. CHANGE TRACKING >>>

  private watchChanges(): void {
    merge(
      this.modeloFormReq.valueChanges,
      this.modeloFormDoc.valueChanges,
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
    const reqChanged = this.utilService.hasFormChanged(
      this.modeloFormReq,
      this.initialSnapshot.req
    );

    const docChanged = this.utilService.hasFormChanged(
      this.modeloFormDoc,
      this.initialSnapshot.doc
    );

    const pieChanged = this.utilService.hasFormChanged(
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
          return this.utilService.normalizeDateChange(currentValue) !==
                this.utilService.normalizeDateChange(originalValue);
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

  onFechaChange() {
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  //#endregion
}
