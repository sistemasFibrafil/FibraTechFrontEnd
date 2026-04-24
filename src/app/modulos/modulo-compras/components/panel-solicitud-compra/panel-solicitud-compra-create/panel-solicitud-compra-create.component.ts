import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { finalize, forkJoin, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

import { LayoutComponent } from '@app/layout/layout.component';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ItemsFindByListCodeModel } from '@app/modulos/modulo-inventario/models/items.model';
import { PurchaseRequest1CreateModel, PurchaseRequestCreateModel } from '../../../models/sap-business-one/purchase-request.model';

import { MenuItem, TableColumn } from '@app/interface/common-ui.interface';
import { IArticuloQuery } from '@app/modulos/modulo-inventario/interfaces/items.interface';
import { IPurchaseRequest1 } from '../../../interfaces/sap-business-one/purchase-request.interface';

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
import { DocumentNumberingSeriesService } from '@app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series.service';
import { saveAs } from 'file-saver';


@Component({
  selector: 'app-com-panel-solicitud-compra-create',
  templateUrl: './panel-solicitud-compra-create.component.html',
  styleUrls: ['./panel-solicitud-compra-create.component.css']
})
export class PanelSolicitudCompraCreateComponent implements OnInit, OnDestroy, AfterViewInit {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly destroy$                    = new Subject<void>();
  private resizeObserver!                      : ResizeObserver;

  paddingTop                                   = '20px';
  @ViewChild('notifyLabel') notifyLabel!       : ElementRef<HTMLElement>;


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  readonly titulo                              = 'Solicitud de Compra';
  readonly nombreArchivo                       = `Solicitud de Compra - ${this.utilService.fechaHoraArchivo()}`;
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
  isSaving                                     = false;
  isDisplay                                    = false;
  hasValidLines                                 = false;
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
  modeloLines                                  : IPurchaseRequest1[] = [];
  modeloLinesSelected                          : IPurchaseRequest1;
  modeloLinesSelectedContext                   : IPurchaseRequest1;


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
  docTypePrevious                              : any;
  docTypeSelected                              : any;


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
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
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly branchesService: BranchesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly departmentsService: DepartmentsService,
    private readonly employeesInfoService: EmployeesInfoService,
    private readonly purchaseRequestService: PurchaseRequestService,
    private readonly documentNumberingSeriesService: DocumentNumberingSeriesService,
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
    this.wireDocTypeControl()
    this.subscribeReqDate();

    // 4️⃣ Inicializar UI
    this.onBuildColumn();
    this.opcionesTabla();
    this.buildContextMenu();

    // 5️⃣ Inicializar líneas
    this.addLine(0);
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
      docNum                  : [{ value: '', disabled: false }],
      docStatus               : [{ value: 'Abierto', disabled: false }, Validators.required],
      docDate                 : [ { value: new Date(), disabled: false }, Validators.required],
      docDueDate              : [ { value: new Date(), disabled: false }, Validators.required],
      taxDate                 : [ { value: new Date(), disabled: false }, Validators.required],
      reqDate                 : [ { value: null, disabled: false }, Validators.required]
    });

    this.modeloFormCon = this.fb.group({
      docType                 : [{ value: '', disabled: false }, Validators.required]
    });

    this.modeloFormPie = this.fb.group({
      employeeInfo            : ['', Validators.required],
      comments                : ['']
    });
  }

  private loadAllCombos(): void {
    // Obtiene datos para combos (numeración, usuarios, sucursales, departamentos, empleados)
    const paramNumero: any = { objectCode: '1470000113', docSubType: '--' };

    this.isDisplay = true;

    // Cargar datos síncronos (LocalDataService)
    const reqTypes = this.localDataService.reqTypes;
    this.reqTypesList = reqTypes.map(s => ({ label: s.name, value: s.code }));

    const docTypes = this.localDataService.docTypes;
    this.docTypesList = docTypes.map(s => ({ label: s.name, value: s.code }));

    // Establecer valores por defecto para datos síncronos
    const defaultReqType = this.reqTypesList.find(x => x.value === 12);
    if (defaultReqType) {
      this.modeloFormReq.get('reqType').setValue(defaultReqType, { emitEvent: false });
    }

    const defaultDocType = this.docTypesList.find(x => x.value === 'I');
    if (defaultDocType) {
      this.docTypePrevious  = defaultDocType;
      this.docTypeSelected   = defaultDocType;
      this.modeloFormCon.get('docType').setValue(defaultDocType, { emitEvent: false });
      this.onBuildColumn();
    }

    // Cargar datos asíncronos en paralelo
    forkJoin({
      numero            : this.documentNumberingSeriesService.getNumero(paramNumero),
      requesterList     : this.usersService.getList(),
      branchesList      : this.branchesService.getList(),
      departmentsList   : this.departmentsService.getList(),
      employeesInfoList : this.employeesInfoService.getList()
    })
    .pipe(
          takeUntil(this.destroy$),
          finalize(() => { this.isDisplay = false; })
        )
    .subscribe({
      next: (res: any) => {
        // Numeracion
        this.modeloFormDoc.patchValue({ docNum: res.numero.nextNumber }, { emitEvent: false });


        // Mapear requester list
        this.requesterList = res.requesterList.map(item => ({
          label: item.userName,
          value: item.userCode
        }));


        // Establecer valor por defecto para requester basado en el usuario actual
        const userSap = this.userContextService.getUserSap();
        if(userSap){
          const defaultRequester = this.requesterList.find(x => x.value === userSap);
          if (defaultRequester) {
            this.modeloFormReq.get('reqName').setValue(defaultRequester, { emitEvent: false });
          }
        }


        // Mapear branches list
        this.branchesList = res.branchesList.map(item => ({
          label: item.name,
          value: item.code
        }));


        // Mapear departments list
        this.departmentsList = res.departmentsList.map(item => ({
          label: item.name,
          value: item.code
        }));


        // Mapear employees info list
        this.employeesInfoList = res.employeesInfoList.map(item => ({
          label: item.fullName,
          value: item.empID
        }));

        // Ejecutar onChangeReqName para cargar sucursal y departamento del usuario por defecto
        this.onChangeReqName();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  private onBuildColumn(): void {
    // Usar docTypeSelected si está disponible, sino leer del formulario
    const isItemDoc         = this.docType  === 'I';

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
      { value: '2', label: 'Borrar línea', icon: 'pi pi-trash',   command: () => this.onClickDelete() }
    ];
  }

  private buildContextMenu(): void {
    // Acciones del menú contextual asociadas a la fila seleccionada
    this.items = [
      { value: '1', label: 'Añadir línea', icon: 'pi pi-plus',      command: () => this.onClickContextMenuAddLine(this.modeloLinesSelectedContext) },
      { value: '2', label: 'Borrar línea', icon: 'pi pi-trash',     command: () => this.onClickContextMenuDelete(this.modeloLinesSelectedContext) },
      { value: '3', label: 'Descargar',    icon: 'pi pi-download',  command: () => this.onClickContextMenuDownload() },
      { value: '4', label: 'Cargar',       icon: 'pi pi-upload',    command: () => this.onClickContextMenuUpload(this.modeloLinesSelectedContext) },
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
    const index = this.modeloLines.indexOf(modelo);
    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }
    // Si se quedó sin líneas, agregar una vacía como comportamiento por defecto
    if (this.modeloLines.length === 0) {
      this.addLine(0);
    }

    this.updateHasValidLines();
  }

  onClickContextMenuDownload(): void {
    this.isDisplay = true;
    this.purchaseRequestService
    .getDownloadFormat()
    .subscribe({next:(response: any) => {
      saveAs(
        new Blob([response],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        this.nombreArchivo
      );
      this.isDisplay = false;
      this.swaCustomService.swaMsgExito(null);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickContextMenuUpload(modelo: IPurchaseRequest1): void {
  }


  /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
  onSelectedItem(modelo: IPurchaseRequest1): void {
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
  }

  onClickAddLine(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    const insertIndex = index + 1;
    this.addLine(insertIndex);
  }

  onClickDelete(): void {
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }

    if (this.modeloLines.length === 0) {
      this.addLine(0);
    }

    this.updateHasValidLines();
  }

  private hasEmptyLine(): boolean {
    return this.modeloLines.some(line =>
      this.isItem
        ? !this.utilService.normalizePrimitive(line.itemCode)
        : !this.utilService.normalizePrimitive(line.dscription)
    );
  }


  private updateMenuVisibility(): void {
    const hasEmptyLines = this.hasEmptyLine();
    const hasLines      = this.modeloLines.length > 0;

    const addLineOption    = this.opciones.find(x => x.label === 'Añadir línea');
    const deleteLineOption = this.opciones.find(x => x.label === 'Borrar línea');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  private updateMenuContextVisibility(): void {
    const hasEmptyLines = this.hasEmptyLine();
    const hasLines      = this.modeloLines.length > 0;

    const addLineOption    = this.items.find(x => x.label === 'Añadir línea');
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
      record            : 0
    };

    // 🔥 Crear nueva referencia
    this.modeloLines = [
      ...this.modeloLines.slice(0, index),
      newLine,
      ...this.modeloLines.slice(index)
    ];

    this.updateHasValidLines();
  }

  /** Aplica la fecha de requerimiento a todas las líneas que tengan artículo seleccionado */
  private applyReqDateToLines(date: Date): void {
    // Se obtiene solo las líneas que tienen descripción (artículo seleccionado)
    this.modeloLines = this.modeloLines.map(line =>
      line.dscription
        ? { ...line, pqtReqDate: date }
        : line
    );
  }

  // Verifica si todas las líneas son válidas según el tipo de documento
  private updateHasValidLines(): void {
  this.hasValidLines =
    this.modeloLines.length > 0 &&
    !this.hasEmptyLine();
}

  //#endregion



  //#region <<< 6. DOC TYPE >>>

  private wireDocTypeControl(): void {
    this.modeloFormCon.get('docType')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(docTyp => {

      const hasLines = this.modeloLines.some(n => n.dscription?.trim());

      if (!hasLines) {

        this.docTypeSelected = docTyp;
        this.docTypePrevious = docTyp;

        this.onBuildColumn();
        this.updateHasValidLines();

        return;
      }

      this.swaCustomService.swaConfirmation(
        this.globalConstants.titleCerrar,
        this.globalConstants.subTitleCerrar,
        this.globalConstants.icoSwalQuestion
      )
      .then((result) => {

        if (result.isConfirmed) {
          this.modeloLines = [];
          this.addLine(0);

          this.docTypeSelected = docTyp;
          this.docTypePrevious = docTyp;

          this.onBuildColumn();
          this.updateHasValidLines();
        }
        else {
          this.modeloFormCon.get('docType')?.setValue(this.docTypePrevious, { emitEvent: false });
        }
      });
    });
  }

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
      quantity       : 1,   // 🔥 SAP: siempre inicia en 1
      openQty        : 1,
      lineStatus     : 'O',
      ocrCode        : ''
    };
  }

  setItem(data: IArticuloQuery[]): void {
    if (!data || data.length === 0) return;

    const element = data[0];
    const date = this.modeloFormDoc.get('reqDate')?.value;

    const newItem = this.mapToPurchaseRequest(element, date);

    // 🔥 Forzar cambio de referencia (Angular friendly)
    this.modeloLines = this.modeloLines.map((line, index) =>
      index === this.indexArticulo ? newItem : line
    );

    this.updateHasValidLines();
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
      next: (data: IArticuloQuery[]) => {
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
  }

  //#endregion



  //#region <<< 9. PROVEEDOR >>>

  onOpenProveedor(index: number): void {
    // Abre modal para seleccionar proveedor de la línea
    this.indexCentroProveedor  = index;
    this.isVisualizarProveedor = !this.isVisualizarProveedor;
  }

  onSelectedProveedor(value: any): void {
    const currentLine          = this.modeloLines[this.indexCentroProveedor];
    currentLine.lineVendor     = value.cardCode;
    this.isVisualizarProveedor = !this.isVisualizarProveedor;
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
  }

  //#endregion



  //#region <<< 10. CUENTA CONTABLE >>>

  onOpenCuentaContable(index: number): void {
    this.indexCentroCuentaContable  = index;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  onSelectedCuentaContable(value: any): void {
    const currentLine               = this.modeloLines[this.indexCentroCuentaContable];
    currentLine.acctCode            = value.acctCode;
    currentLine.formatCode          = value.formatCode;
    currentLine.acctName            = value.acctName;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
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
  }

  onClickCloseAlmacen(): void {
    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;
  }

  //#endregion



  //#region <<< 13. TIPO OPERACIÓN >>>

  onOpenTipoOperacion(index: number): void {
    this.indexTipoOperacion = index;
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }

  onClickSelectedTipoOperacion(value: any): void {
    const currentLine               = this.modeloLines[this.indexTipoOperacion];
    currentLine.u_tipoOpT12         = value.code;
    currentLine.u_tipoOpT12Nam      = value.fullDescription;
    this.isVisualizarTipoOperacion  = !this.isVisualizarTipoOperacion;
  }

  onClickCloseTipoOperacion(): void {
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
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
  }

  onClickCloseTipoCompra(): void {
    this.isVisualizarTipoCompra = !this.isVisualizarTipoCompra;
  }

  //#endregion



  //#region <<< 15. CANTIDAD >>>

  onChangeQuantity(value: IPurchaseRequest1, index: number): void {
    const quantity        = this.utilService.onRedondearDecimal(value.quantity, 3);
    const openQty         = this.utilService.onRedondearDecimal(value.quantity, 3);

    const currentLine     = this.modeloLines[index];
    currentLine.quantity  = value.itemCode === '' ? 0 : quantity;
    currentLine.openQty   = value.itemCode === '' ? 0 : openQty;
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

    this.purchaseRequestService.setCreate(modeloToSave)
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

    const runValidations = (validations: { cond: boolean, msg: string }[]) => {
      for (const v of validations) {
        if (v.cond) return showError(v.msg);
      }
      return true;
    };

    /** combinar forms */
    const f = this.mergeForms();

    /** 🔹 HEADER */
    if (!runValidations([
      { cond: !val(f.reqName), msg: 'Seleccione el nombre del solicitante.' },
      { cond: f.notify && !p(f.email)?.trim(), msg: 'Ingrese un correo electrónico válido.' },
      { cond: !f.docDate, msg: 'Ingrese la fecha del documento.' },
      { cond: !f.docDueDate, msg: 'Ingrese la fecha de vencimiento del documento.' },
      { cond: !f.taxDate, msg: 'Ingrese la fecha fiscal del documento.' },
      { cond: !f.reqDate, msg: 'Ingrese la fecha de requerimiento.' },
      { cond: !val(f.employeeInfo), msg: 'Seleccione el propietario de la solicitud.' }
    ])) return false;

    /** 🔹 DETALLE */
    for (let i = 0; i < this.modeloLines.length; i++) {

      const line = this.modeloLines[i];
      const row  = i + 1;

      const validations = [

        { cond: !line.pqtReqDate, msg: `Línea ${row}: Ingrese la fecha de requerimiento.` },
        { cond: !line.ocrCode, msg: `Línea ${row}: Seleccione el centro de costos.` },
        { cond: !p(line?.u_tipoOpT12), msg: `Línea ${row}: Seleccione el tipo de operación.` },
        { cond: !p(line?.u_FF_TIP_COM), msg: `Línea ${row}: Seleccione el tipo de compra.` },

        ...(this.isService ? [
          { cond: !p(line.acctCode), msg: `Línea ${row}: Seleccione la cuenta contable.` }
        ] : []),

        ...(this.isItem ? [
          { cond: !p(line.whsCode), msg: `Línea ${row}: Seleccione el almacén.` },
          { cond: !line.unitMsr, msg: `Línea ${row}: Defina la unidad de medida en los datos maestros del artículo.` },
          { cond: !line.quantity || line.quantity <= 0, msg: `Línea ${row}: La cantidad debe ser mayor que cero (0).` }
        ] : [])
      ];

      if (!runValidations(validations)) return false;
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

  private mapLinesCreate(): PurchaseRequest1CreateModel[] {
    /** helpers para evitar repetición */
    const u     = this.utilService;
    const p     = (v:any)=>u.normalizePrimitive(v);
    const n     = (v:any)=>u.normalizeNumber(v);
    const d     = (v:any)=>u.normalizeDateOrToday(v);

    return this.modeloLines.map(line => ({
      itemCode     : p(line.itemCode),
      dscription   : p(line.dscription),

      lineVendor   : p(line.lineVendor),
      pqtReqDate   : d(line.pqtReqDate),

      acctCode     : p(line.acctCode),
      ocrCode      : p(line.ocrCode),

      whsCode      : p(line.whsCode),

      unitMsr      : p(line.unitMsr),
      quantity     : n(line.quantity),

      u_tipoOpT12  : p(line.u_tipoOpT12),
      u_FF_TIP_COM : p(line.u_FF_TIP_COM)
    }));
  }

  private buildModelToSave(): PurchaseRequestCreateModel {
    /** helpers para evitar repetición */
    const u       = this.utilService;
    const p       = (v:any)=>u.normalizePrimitive(v);
    const d       = (v:any)=>u.normalizeDateOrToday(v);
    const val     = (v:any)=>v?.value ?? v;
    const label   = (v:any)=>v?.label ?? v ?? '';

    /** combinar tod  os los formularios */
    const f       = this.mergeForms();

    const userId  = this.userContextService.getIdUsuario();

    const notify  = f.notify === true ? 'Y' : 'N';

    const lines   = this.mapLinesCreate();

    return {
      ...new PurchaseRequestCreateModel(),

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

      u_UsrCreate : userId,

      lines
    };
  }

  //#endregion



  //#region <<< 18. NAVIGATION >>>

  onClickBack(): void {
    this.router.navigate(['/main/modulo-com/panel-solicitud-compra-list']);
  }

  //#endregion
}
