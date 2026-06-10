import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { filter } from 'rxjs/operators';
import { SelectItem } from 'primeng/api';
import { NavigationStart, Router } from '@angular/router';
import { finalize, forkJoin, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ItemsFindByListCodeModel } from '@app/modulos/modulo-inventario/models/items.model';
import { PurchaseRequestLinesCreateModel, PurchaseRequestCreateModel } from '@app/modulos/modulo-compras/models/sap-business-one/purchase-request.model';

import { MenuItem, TableColumn } from '@app/interface/common-ui.interface';
import { IArticuloQuery } from '@app/modulos/modulo-inventario/interfaces/items.interface';
import { IPurchaseRequestLinesQuery, IPurchaseRequestQuery } from '@app/modulos/modulo-compras/interfaces/sap-business-one/purchase-request.interface';

import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { LocalDataService } from '@app/services/local-data.service';
import { UserContextService } from '@app/services/user-context.service';
import { ItemsService } from '@app/modulos/modulo-inventario/services/items.service';
import { EmployeesInfoService } from '@app/modulos/modulo-recursos-humanos/services/employees-info.service';
import { UsersService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/users.service';
import { PurchaseRequestService } from '@app/modulos/modulo-compras/services/sap-business-one/purchase-request.service';
import { BranchesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/branchs.service';
import { DepartmentsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/departments.service';
import { OperationsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/operation-type.service';
import { UserDefinedFieldsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { DocumentNumberingSeriesService } from '@app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series.service';


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
  private readonly h                           = this.utilService.getHelpers();
  private resizeObserver!                      : ResizeObserver;

  @ViewChild('notifyLabel') notifyLabel!       : ElementRef<HTMLElement>;


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
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
  hasValidLines                                = false;
  isDisplayUpload                              = false;
  isVisualizarAlmacen                          = false;
  isLoadingInitialData                         = false;
  isVisualizarArticulo                         = false;
  isVisualizarProveedor                        = false;
  isVisualizarCentroCosto                      = false;
  isVisualizarCuentaContable                   = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  items                                        : MenuItem[];
  opciones                                     : MenuItem[];
  columnas                                     : TableColumn[] = [];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modeloLines                                  : IPurchaseRequestLinesQuery[] = [];

  modeloLinesSelected                          : IPurchaseRequestLinesQuery;
  modeloLinesSelectedContext                   : IPurchaseRequestLinesQuery;


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
  purchasesTypesList                           : SelectItem[] = [];
  operationsTypesList                          : SelectItem[] = [];


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
  indexProveedor                               = 0;
  indexCentroCosto                             = 0;
  indexCuentaContable                          = 0;


  // ===========================
  // 🔹 10. AUX / FILTERS
  // ===========================
  titulo                                       = 'Solicitud de Compra';
  filler                                       = '';
  itemCode                                     = '';
  toWhsCode                                    = '';
  paddingTop                                   = '20px';
  inactiveAlmacen                              = 'N';
  demandanteAlmacen                            = 'N';
  inactiveAlmacenItem                          = 'N';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly usersService: UsersService,
    private readonly itemsService: ItemsService,
    private readonly branchesService: BranchesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly departmentsService: DepartmentsService,
    private readonly employeesInfoService: EmployeesInfoService,
    private readonly operationsTypesService: OperationsTypesService,
    private readonly purchaseRequestService: PurchaseRequestService,
    private readonly userDefinedFieldsService: UserDefinedFieldsService,
    private readonly documentNumberingSeriesService: DocumentNumberingSeriesService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  /**
   * Inicializa formularios y carga datos iniciales para combos.
   */
  ngOnInit(): void {
    // 1️⃣ Inicializa UI
    this.initializeComponent();

    // 2️⃣ Escucha flecha atrás / adelante
    this.listenBrowserBack();
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
    this.clearSession();
  }

  private listenBrowserBack(): void {
    this.router.events
    .pipe(
      filter((e): e is NavigationStart => e instanceof NavigationStart),
      filter(e => e.navigationTrigger === 'popstate'),
      takeUntil(this.destroy$)
    )
    .subscribe(() => {
      this.clearSession();
    });
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
    this.buildColumns();
    this.buildTableOptions();
    this.buildContextMenuOptions();

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
    const paramNumero         : any = { objectCode: '1470000113', docSubType: '--' };
    const parampurchasesTypes : any = { tableID: 'PRQ1', aliasID: 'FF_TIP_COM' };

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
      this.buildColumns();
    }

    this.isDisplay = true;

    // Cargar datos asíncronos en paralelo
    forkJoin({
      numero              : this.documentNumberingSeriesService.getNumero(paramNumero),
      branchesList        : this.branchesService.getList(),
      requesterList       : this.usersService.getList(),
      departmentsList     : this.departmentsService.getList(),
      employeesInfoList   : this.employeesInfoService.getList(),
      purchasesTypesList  : this.userDefinedFieldsService.getList(parampurchasesTypes),
      operationsTypesList : this.operationsTypesService.getList(),
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


        this.operationsTypesList = res.operationsTypesList.map(item => ({
          label: item.fullDescr,
          value: item.code
        }));


        this.purchasesTypesList = res.purchasesTypesList.map(item => ({
          label: item.fullDescr,
          value: item.fldValue
        }));

        // Ejecutar onChangeReqName para cargar sucursal y departamento del usuario por defecto
        this.onChangeReqName();

        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
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

  private get getNameFile(): string {
    const tipo = this.isItem ? 'Articulo' : 'Servicio';

    return `Solicitud de Compra - ${tipo} - ${this.utilService.fechaHoraArchivo()}`;
  }

  //#endregion



  //#region <<< 4. TABLE CONFIG >>>

  private buildColumns(): void {
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
        { field: 'u_tipoOpT12',       header: 'Tipo de operación' },
        { field: 'u_FF_TIP_COM',      header: 'Tipo de compra' },
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
        { field: 'u_tipoOpT12',       header: 'Tipo de operación' },
        { field: 'u_FF_TIP_COM',      header: 'Tipo de compra' },
      ];
    }
  }

  private buildTableOptions(): void {
    // Acciones del split-button para operaciones de fila
    this.opciones = [
      { value: '1', label: 'Insertar línea',  icon: 'pi pi-plus',   command: () => this.onClickAddLine() },
      { value: '2', label: 'Borrar línea',    icon: 'pi pi-trash',  command: () => this.onClickDelete() }
    ];
  }

  private buildContextMenuOptions(): void {
    // Acciones del menú contextual asociadas a la fila seleccionada
    this.items = [
      { value: '1', label: 'Insertar línea',      icon: 'pi pi-plus',      command: () => this.onClickContextMenuAddLine(this.modeloLinesSelectedContext) },
      { value: '2', label: 'Borrar línea',        icon: 'pi pi-trash',     command: () => this.onClickContextMenuDelete(this.modeloLinesSelectedContext) },
      { value: '3', label: 'Descargar plantilla', icon: 'pi pi-download',  command: () => this.onClickContextMenuDownload() },
      { value: '4', label: 'Cargar plantilla',    icon: 'pi pi-upload',    command: () => this.onClickContextMenuUploadView() },
    ];
  }

  //#endregion



  //#region <<< 5. CONTEXT MENU >>>

  onContextMenuShow(event: any): void {
    // No sobrescribir la selección del contexto si el evento no trae datos de fila.
    // El p-table ya actualiza `modeloLinesSelectedContext` vía [(contextMenuSelection)].
    if (event?.item?.data) {
      this.modeloLinesSelectedContext = event.item.data;
    }
    this.updateMenuContextVisibility();
  }

  /** Agrega una nueva línea después de la línea seleccionada en el menú contextual */
  private onClickContextMenuAddLine(modelo: IPurchaseRequestLinesQuery): void {
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
  private onClickContextMenuDelete(modelo: IPurchaseRequestLinesQuery): void {
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

  private onClickContextMenuDownload(): void {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleDownload,
      this.globalConstants.subTitleDownload,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.download();
      }
    });
  }

  private download(): void {
    this.isDisplay = true;

    const request = this.isItem
      ? this.purchaseRequestService.getDownloadItemsTemplate()
      : this.purchaseRequestService.getDownloadServicesTemplate();

    request
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (response: any) => {
        saveAs(
          new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          this.getNameFile
        );

        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  private onClickContextMenuUploadView(): void {
    this.isDisplayUpload = true;
  }

  //#endregion



  //#region <<< 6. EXCEL UPLOAD >>>

  onClickUpload(file: any): void {
    this.isDisplayUpload = false;

    const fileObj: File = file instanceof File
      ? file
      : file?.files
        ? file.files[0]
        : file;

    if (!fileObj || !(fileObj instanceof File)) {
      this.swaCustomService.swaMsgInfo('Archivo inválido.');
      return;
    }

    if (fileObj.size === 0) {
      this.swaCustomService.swaMsgInfo('El archivo está vacío.');
      return;
    }

    const reader = new FileReader();

    reader.onload = (e: any) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        const columns = this.getExcelColumns();
        const headers = this.getExcelHeaders(worksheet);

        if (!this.validateExcelHeaders(headers, columns)) {
          return;
        }

        const rows: any[] = XLSX.utils.sheet_to_json(worksheet, {
          defval: null
        });

        const lines = this.mapExcelRowsToLines(rows, columns);

        if (!lines) {
          return;
        }

        this.validarLineasExcel(lines);

      } catch (e: any) {
        this.utilService.handleErrorSingle(e, 'onClickUpload', this.swaCustomService);
      }
    };

    reader.onerror = (e) => {
      this.utilService.handleErrorSingle(e, 'onClickUpload', this.swaCustomService);
    };

    reader.readAsArrayBuffer(fileObj);
  }

  //#endregion



  //#region <<< 7. EXCEL CONFIG / HEADERS >>>

  private getExcelColumns(): { field: string; aliases: string[] }[] {
    return this.isItem
    ? [
        { field: 'itemCode', aliases: ['itemCode', 'Codigo'] },
        { field: 'lineVendor', aliases: ['lineVendor', 'Proveedor'] },
        { field: 'pqtReqDate', aliases: ['pqtReqDate', 'Fecha necesaria'] },
        { field: 'formatCode', aliases: ['formatCode', 'Cuenta mayor'] },
        { field: 'ocrCode', aliases: ['ocrCode', 'Centro de costo'] },
        { field: 'whsCode', aliases: ['whsCode', 'Almacen'] },
        { field: 'u_tipoOpT12', aliases: ['u_tipoOpT12', 'Codigo tipo de operacion'] },
        { field: 'u_FF_TIP_COM', aliases: ['u_FF_TIP_COM', 'Codigo tipo de compra'] },
        { field: 'unitMsr', aliases: ['unitMsr', 'UM'] },
        { field: 'quantity', aliases: ['quantity', 'Cantidad'] },
      ]
    : [
        { field: 'dscription', aliases: ['dscription', 'Descripcion'] },
        { field: 'lineVendor', aliases: ['lineVendor', 'Proveedor'] },
        { field: 'pqtReqDate', aliases: ['pqtReqDate', 'Fecha necesaria'] },
        { field: 'formatCode', aliases: ['formatCode', 'Cuenta mayor'] },
        { field: 'ocrCode', aliases: ['ocrCode', 'Centro de costo'] },
        { field: 'u_tipoOpT12', aliases: ['u_tipoOpT12', 'Codigo tipo de operacion'] },
        { field: 'u_FF_TIP_COM', aliases: ['u_FF_TIP_COM', 'Codigo tipo de compra'] },
      ];
  }

  private getExcelHeaders(worksheet: XLSX.WorkSheet): string[] {
    return (XLSX.utils.sheet_to_json(worksheet, {
      header: 1,
      defval: ''
    })[0] as any[] || []).map(x => x?.toString().trim());
  }

  private validateExcelHeaders(headers: string[], columns: { field: string; aliases: string[] }[]): boolean {
    const validHeaders = columns.flatMap(x => x.aliases);

    if (headers.length !== columns.length) {
      this.swaCustomService.swaMsgInfo('El formato del archivo no es correcto. La cantidad de columnas no coincide.');
      return false;
    }

    const invalidHeader = headers.find(h => !validHeaders.includes(h));
    if (invalidHeader) {
      this.swaCustomService.swaMsgInfo(`El formato del archivo no es correcto. La columna '${invalidHeader}' no es válida.`);
      return false;
    }

    const missingColumn = columns.find(c => !headers.some(h => c.aliases.includes(h)));
    if (missingColumn) {
      this.swaCustomService.swaMsgInfo(`El formato del archivo no es correcto. Falta la columna '${missingColumn.aliases[1]}'.`);
      return false;
    }

    return true;
  }

  //#endregion



  //#region <<< 8. EXCEL MAPPING >>>

  private mapExcelRowsToLines(rows: any[], columns: { field: string; aliases: string[] }[]): any[] | null {
    const lines: any[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i] || {};
      const nroLinea = i + 1;

      const m = this.mapExcelRow(row, columns);
      const line = this.buildExcelLine(m);

      if (!this.validateExcelLine(line, nroLinea)) {
        return null;
      }

      lines.push(line);
    }

    return lines;
  }

  private mapExcelRow(row: any, columns: { field: string; aliases: string[] }[]): any {
    const m: any = {};

    columns.forEach(c => {
      m[c.field] = this.pickExcelValue(row, c.aliases);
    });

    return m;
  }

  private pickExcelValue(row: any, aliases: string[]): any {
    for (const a of aliases) {
      if (a in row && row[a] !== null && row[a] !== undefined) {
        return row[a];
      }
    }

    return null;
  }

  private buildExcelLine(m: any): any {
    return this.isItem
    ? {
        itemCode     : (m.itemCode ?? '').toString().trim(),
        lineVendor   : (m.lineVendor ?? '').toString().trim(),
        pqtReqDate   : this.utilService.normalizeDateToApiString(m.pqtReqDate),
        formatCode   : (m.formatCode ?? '').toString().trim(),
        ocrCode      : (m.ocrCode ?? '').toString().trim(),
        whsCode      : (m.whsCode ?? '').toString().trim(),
        u_tipoOpT12  : (m.u_tipoOpT12 ?? '').toString().trim(),
        u_FF_TIP_COM : (m.u_FF_TIP_COM ?? '').toString().trim(),
        unitMsr      : (m.unitMsr ?? '').toString().trim(),
        quantity     : m.quantity !== null ? Number(m.quantity) : 0
      }
    : {
        dscription   : (m.dscription ?? '').toString().trim(),
        lineVendor   : (m.lineVendor ?? '').toString().trim(),
        pqtReqDate   : this.utilService.normalizeDateToApiString(m.pqtReqDate),
        formatCode   : (m.formatCode ?? '').toString().trim(),
        ocrCode      : (m.ocrCode ?? '').toString().trim(),
        u_tipoOpT12  : (m.u_tipoOpT12 ?? '').toString().trim(),
        u_FF_TIP_COM : (m.u_FF_TIP_COM ?? '').toString().trim()
      };
  }

  //#endregion



  //#region <<< 9. EXCEL VALIDATION >>>

  private validateExcelLine(line: any, nroLinea: number): boolean {
    const validations = this.isItem
    ? [
        { cond: !line.itemCode, msg: `Línea ${nroLinea}: Ingrese el código de artículo.` },
        { cond: !line.pqtReqDate, msg: `Línea ${nroLinea}: Ingrese la fecha necesaria.` },
        { cond: !line.formatCode, msg: `Línea ${nroLinea}: Ingrese la cuenta mayor.` },
        { cond: !line.ocrCode, msg: `Línea ${nroLinea}: Ingrese el centro de costo.` },
        { cond: !line.whsCode, msg: `Línea ${nroLinea}: Ingrese el almacén.` },
        { cond: !line.u_tipoOpT12, msg: `Línea ${nroLinea}: Ingrese el tipo de operación.` },
        { cond: !line.u_FF_TIP_COM, msg: `Línea ${nroLinea}: Ingrese el tipo de compra.` },
        { cond: !line.unitMsr, msg: `Línea ${nroLinea}: Ingrese la unidad de medida.` },
        {
          cond: line.quantity == null || line.quantity === '' || line.quantity === undefined,
          msg: `Línea ${nroLinea}: Ingrese la cantidad.`
        },
        {
          cond: Number(line.quantity) <= 0,
          msg: `Línea ${nroLinea}: La cantidad no debe ser menor o igual que cero (0).`
        },
      ]
    : [
        { cond: !line.dscription, msg: `Línea ${nroLinea}: Ingrese la descripción.` },
        { cond: !line.pqtReqDate, msg: `Línea ${nroLinea}: Ingrese la fecha necesaria.` },
        { cond: !line.formatCode, msg: `Línea ${nroLinea}: Ingrese la cuenta mayor.` },
        { cond: !line.ocrCode, msg: `Línea ${nroLinea}: Ingrese el centro de costo.` },
        { cond: !line.u_tipoOpT12, msg: `Línea ${nroLinea}: Ingrese el tipo de operación.` },
        { cond: !line.u_FF_TIP_COM, msg: `Línea ${nroLinea}: Ingrese el tipo de compra.` },
      ];

    const error = validations.find(x => x.cond);

    if (error) {
      this.swaCustomService.swaMsgInfo(error.msg);
      return false;
    }

    return true;
  }

  private validarLineasExcel(lines: any[]): void {
    if (!lines || lines.length === 0) {
      this.swaCustomService.swaMsgInfo('No existen filas para validar.');
      return;
    }

    this.isDisplay = true;

    const request = this.isItem
      ? this.purchaseRequestService.setValidateLinesItemsExcel(lines)
      : this.purchaseRequestService.setValidateLinesServicesExcel(lines);

    request
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: any) => {
        this.modeloLines = data || [];

        this.updateHasValidLines();

        this.swaCustomService.swaMsgExito(
          'Archivo procesado correctamente. Filas: ' + this.modeloLines.length
        );
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'validarLineasExcel', this.swaCustomService);
      }
    });
  }

  //#endregion



  //#region <<< 10. TABLE SELECTION / ACTIONS >>>

  onSelectedItem(modelo: IPurchaseRequestLinesQuery): void {
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

  //#endregion



  //#region <<< 11. MENU VISIBILITY >>>

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

    const addLineOption    = this.opciones.find(x => x.value === '1');
    const deleteLineOption = this.opciones.find(x => x.value === '2');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  private updateMenuContextVisibility(): void {
    const hasEmptyLines = this.hasEmptyLine();
    const hasLines      = this.modeloLines.length > 0;

    const addLineOption    = this.items.find(x => x.value === '1');
    const deleteLineOption = this.items.find(x => x.value === '2');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  //#endregion



  //#region <<< 12. LINES (CORE) >>>

  private addLine(index: number): void {
    const newLine: IPurchaseRequestLinesQuery = {
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

    this.updateHasValidLines();
  }

  // Verifica si todas las líneas son válidas según el tipo de documento
  private updateHasValidLines(): void {
    this.hasValidLines =
      this.modeloLines.length > 0 &&
      !this.hasEmptyLine();
  }

  //#endregion



  //#region <<< 13. DOC TYPE >>>

  private wireDocTypeControl(): void {
    this.modeloFormCon.get('docType')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(docTyp => {

      const hasLines = this.modeloLines.some(n => n.dscription?.trim());

      if (!hasLines) {

        this.docTypeSelected = docTyp;
        this.docTypePrevious = docTyp;

        this.buildColumns();
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

          this.buildColumns();
          this.updateHasValidLines();
        }
        else {
          this.modeloFormCon.get('docType')?.setValue(this.docTypePrevious, { emitEvent: false });
        }
      });
    });
  }

  //#endregion



  //#region <<< 14. ARTÍCULO >>>

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

  private mapToPurchaseRequest(element: IArticuloQuery, date: Date): IPurchaseRequestLinesQuery {
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

  private setItem(data: IArticuloQuery[]): void {
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

  private getListByCode(itemCode: string): void {
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
      warehouseType       : 'L'
    };
  }

  onDescChange() {
    this.updateHasValidLines();
  }

  //#endregion



  //#region <<< 15. PROVEEDOR >>>

  onOpenProveedor(index: number): void {
    this.indexProveedor  = index;
    this.isVisualizarProveedor = !this.isVisualizarProveedor;
  }

  onSelectedProveedor(value: any): void {
    const currentLine          = this.modeloLines[this.indexProveedor];
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



  //#region <<< 16. CUENTA CONTABLE >>>

  onOpenCuentaContable(index: number): void {
    this.indexCuentaContable  = index;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  onSelectedCuentaContable(value: any): void {
    const currentLine               = this.modeloLines[this.indexCuentaContable];
    currentLine.acctCode            = value.acctCode;
    currentLine.formatCode          = value.formatCode;
    currentLine.acctName            = value.acctName;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  onClickCloseCuentaContable(): void {
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  //#endregion



  //#region <<< 17. CENTRO DE COSTO >>>

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



  //#region <<< 18. ALMACÉN >>>

  onOpenAlmacen(value: IPurchaseRequestLinesQuery, index: number): void {
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



  //#region <<< 21. CANTIDAD >>>

  onChangeQuantity(value: IPurchaseRequestLinesQuery, index: number): void {
    const quantity        = this.utilService.onRedondearDecimal(value.quantity, 3);
    const openQty         = this.utilService.onRedondearDecimal(value.quantity, 3);

    const currentLine     = this.modeloLines[index];
    currentLine.quantity  = value.itemCode === '' ? 0 : quantity;
    currentLine.openQty   = value.itemCode === '' ? 0 : openQty;
  }

  //#endregion



  //#region <<< 22. WAREHOUSE HEADER LOGIC >>>

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



  //#region <<< 23. LOAD DATA (EDICIÓN) >>>

  private loadData(): void {
    const mode = history.state?.mode;

    // 🆕 CREAR NUEVO → no necesita data
    if (mode === 'create') {
      return;
    }

    // 📋 Duplicate
    let docEntry = history.state?.docEntry;

    if (!docEntry) {
      const cache = sessionStorage.getItem('SolicitudCompraDuplicate');
      docEntry = cache ? JSON.parse(cache) : null;
    }

    if (!docEntry) {
      this.swaCustomService.swaMsgInfo('La información de solicitud de compra se perdió. Vuelva a iniciar el proceso.');
      this.onClickBack();
      return;
    }

    this.isDisplay = true;

    this.purchaseRequestService.getByDocEntry(docEntry)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: IPurchaseRequestQuery) => {
        const normalizedLines = data.lines.map(line => ({
          ...line,
          pqtReqDate: this.utilService.normalizeDateOrToday(line.pqtReqDate)
        }));

        const modelo = {
          ...data,
          lines: normalizedLines
        };

        this.setFormValues(modelo);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: IPurchaseRequestQuery): void {
    this.isLoadingInitialData = true;

    this.setRequesterList(value);
    this.setRequerimientoForm(value);
    this.setContenidoForm(value);
    this.setPieForm(value);
    this.setLines(value);

    this.isLoadingInitialData = false;
  }

  private setRequesterList(value: IPurchaseRequestQuery): void {
    if (value.reqType !== 17) return;

    this.requesterList = this.employeesInfoList.map(item => ({
      label: item.label,
      value: item.value
    }));
  }

  private setRequerimientoForm(value: IPurchaseRequestQuery): void {
    const reqType    = this.h.findItem(this.reqTypesList, value.reqType);
    const reqName    = this.h.findItem(this.requesterList, value.requester);
    const branch     = this.h.findItem(this.branchesList, value.branch);
    const department = this.h.findItem(this.departmentsList, value.department);

    this.h.patch(this.modeloFormReq, {
      reqType,
      reqName,
      branch,
      department,
      notify: value.notify === 'Y',
      email : this.h.p(value.email)
    });
  }

  private setContenidoForm(value: IPurchaseRequestQuery): void {
    const docType = this.h.findItem(this.docTypesList, value.docType);

    this.h.patch(this.modeloFormCon, {
      docType
    });
  }

  private setPieForm(value: IPurchaseRequestQuery): void {
    const employee = this.h.findItem(this.employeesInfoList, value.ownerCode);

    this.h.patch(this.modeloFormPie, {
      employeeInfo: employee,
      comments    : this.h.p(value.comments)
    });
  }

  private setLines(value: IPurchaseRequestQuery): void {
    this.buildColumns();

    this.modeloLines = (value.lines || [])
    .map(linea => this.utilService.mapLine(linea));

    this.updateHasValidLines();
  }

  //#endregion



  //#region <<< 24. SAVE >>>

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

  private mapLinesCreate(): PurchaseRequestLinesCreateModel[] {
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



  //#region <<< 25. NAVIGATION >>>

  onClickBack(): void {
    this.clearSession();
    this.router.navigate(['/main/modulo-com/panel-solicitud-compra-list']);
  }

  private clearSession(): void {
    sessionStorage.removeItem('SolicitudCompraDuplicate');
  }

  //#endregion
}
