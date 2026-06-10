import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { Subject, forkJoin, of } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, filter, finalize, takeUntil } from 'rxjs/operators';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ItemsFindByListCodeModel } from '@app/modulos/modulo-inventario/models/items.model';
import { InventoryTransferRequestPickingCreateModel } from '@app/modulos/modulo-inventario/models/picking.model';
import { InventoryTransferRequest1CreateModel, InventoryTransferRequestCreateModel } from '@app/modulos/modulo-inventario/models/inventory-transfer-request.model';

import { MenuItem, TableColumn } from '@app/interface/common-ui.interface';
import { IArticuloQuery } from '@app/modulos/modulo-inventario/interfaces/items.interface';
import { IWarehouses } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { ISalesPersons } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IOperationsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/operation-type.interface';
import { IUserDefinedFields } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IInventoryTransferRequestLines, IInventoryTransferRequestLinesQuery, IInventoryTransferRequestQuery } from '@app/modulos/modulo-inventario/interfaces/inventory-transfer-request.interface';

import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { ItemsService } from '@app/modulos/modulo-inventario/services/items.service';
import { IPicking } from '@app/modulos/modulo-inventario/interfaces/picking.inteface';
import { InventoryTransferRequestService } from '@app/modulos/modulo-inventario/services/inventory-transfer-request.service';
import { WarehousesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { SalesPersonsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { OperationsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/operation-type.service';
import { UserDefinedFieldsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { DocumentNumberingSeriesService } from '@app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series.service';


@Component({
  selector: 'app-inv-panel-solicitud-traslado-create',
  templateUrl: './panel-solicitud-traslado-create.component.html',
  styleUrls: ['./panel-solicitud-traslado-create.component.css']
})
export class PanelSolicitudTrasladoCreateComponent implements OnInit, OnDestroy {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly destroy$                     = new Subject<void>();


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();


  // ===========================
  // 🔹 3. FORMS
  // ===========================
  modeloFormSn                                  : FormGroup;
  modeloFormDoc                                 : FormGroup;
  modeloFormOtr                                 : FormGroup;
  modeloFormPie                                 : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isLocked                                      = true;
  isSaving                                      = false;
  isDisplay                                     = false;
  isUploadItem                                  = false;
  hasValidLines                                 = false;
  isDisplayUpload                               = false;
  isVisualizarArticulo                          = false;
  isVisualizarAlmacenOrigen                     = false;
  isVisualizarAlmacenDestino                    = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  items                                         : MenuItem[];
  opciones                                      : MenuItem[];
  columnas                                      : TableColumn[];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modeloLinesSelected                           : IInventoryTransferRequestLinesQuery;
  modeloLinesSelectedContext                    : IInventoryTransferRequestLinesQuery;

  modeloLines                                   : IInventoryTransferRequestLinesQuery[] = [];
  modeloPickingOriginalLines                    : IPicking[] = [];


  // ===========================
  // 🔹 7. COMBOS / LISTS
  // ===========================
  warehousesList                                : SelectItem[] = [];
  outputsTypesList                              : SelectItem[] = [];
  salesPersonsList                              : SelectItem[] = [];
  transfersTypesList                            : SelectItem[] = [];
  operationsTypesList                           : SelectItem[] = [];
  reasonsTransfersList                          : SelectItem[] = [];


  // ===========================
  // 🔹 8. INDEXES (UI CONTROL)
  // ===========================
  cntctCode                                     = 0;
  indexArticulo                                 = 0;
  indexAlmacenOrigen                            = 0;
  indexAlmacenDestino                           = 0;


  // ===========================
  // 🔹 9. AUX / FILTERS
  // ===========================
  titulo                                        = 'Solicitud de Traslado';
  jrnlMemo                                      = 'Solicitud de traslado - ';
  itemCode                                      = '';
  cardCode                                      = '';
  inactiveAlmacenItem                           = 'N';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly itemsService: ItemsService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly operationsTypesService: OperationsTypesService,
    private readonly userDefinedFieldsService: UserDefinedFieldsService,
    private readonly documentNumberingSeriesService: DocumentNumberingSeriesService,
    private readonly inventoryTransferRequestService: InventoryTransferRequestService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  ngOnInit(): void {
    // 1️⃣ Inicializa UI
    this.initializeComponent();

    // 2️⃣ Escucha flecha atrás / adelante
    this.listenBrowserBack();
  }

  /** Limpia suscripciones para evitar fugas de memoria */
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

  //#endregion



  //#region <<< 2. INITIALIZATION >>>

  private initializeComponent(): void {
    // 1️⃣ Crear formularios
    this.buildForms();

    // 2️⃣ Cargar datos base
    this.loadAllCombos();

    // 3️⃣ Registrar listeners reactivos
    this.wireAlmacenOrigenControl();
    this.wireAlmacenDestinoControl();

    // 4️⃣ Inicializar UI
    this.buildColumns();
    this.buildTableOptions();
    this.buildContextMenuOptions();

    // 5️⃣ Inicializar líneas
    this.addLine(0);
  }

  private buildForms(): void {
    /** Construye los formularios con validadores requeridos */
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
      salesPersons            : ['', Validators.required],
      jrnlMemo                : [this.jrnlMemo],
      comments                : ['']
    });
  }

  private loadAllCombos(): void {
    const paramNumero     : any = { objectCode: '1250000001', docSubType:'--' };
    const paramMotivo     : any = { tableID: 'OWTQ', aliasID: 'BPP_MDMT' };
    const paramAlmacen    : any = { inactive: 'N' };
    const paramTipoTras   : any = { tableID: 'OWTQ', aliasID: 'FIB_TIP_TRAS' };
    const paramTipoSalida : any = { tableID: 'OWTQ', aliasID: 'BPP_MDTS' };

    // Mostrar spinner mientras cargan los combos
    this.isDisplay = true;

    forkJoin({
      numero            : this.documentNumberingSeriesService.getNumero(paramNumero).pipe(catchError(() => of(null))),
      warehouses        : this.warehousesService.getListByInactive(paramAlmacen).pipe(catchError(() => of([] as IWarehouses[]))),
      outputsTypes      : this.userDefinedFieldsService.getList(paramTipoSalida).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      salesPersons      : this.salesPersonsService.getList().pipe(catchError(() => of([] as ISalesPersons[]))),
      transfersTypes    : this.userDefinedFieldsService.getList(paramTipoTras).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      operationsTypes   : this.operationsTypesService.getList().pipe(catchError(() => of([] as IOperationsTypes[]))),
      reasonsTransfers  : this.userDefinedFieldsService.getList(paramMotivo).pipe(catchError(() => of([] as IUserDefinedFields[]))),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {
        this.modeloFormDoc.patchValue({ docNum: res.numero.nextNumber }, { emitEvent: false });

        this.warehousesList        = (res.warehouses || []).map(item => ({ label: item.fullDescr, value: item.whsCode }));
        this.outputsTypesList      = (res.outputsTypes || []).map(item => ({ label: item.fullDescr, value: item.fldValue }));
        this.salesPersonsList      = (res.salesPersons || []).map((item: any) => ({ label: item.slpName, value: item.slpCode }));
        this.transfersTypesList    = (res.transfersTypes || []).map(item => ({ label: item.fullDescr, value: item.fldValue }));
        this.operationsTypesList   = (res.operationsTypes || []).map(item => ({ label: item.fullDescr, value: item.code }));
        this.reasonsTransfersList  = (res.reasonsTransfers || []).map(item => ({ label: item.fullDescr, value: item.fldValue }));



        // Almacenes
        const warehousesDefault = this.userContextService.getDfltWhs();

        if (warehousesDefault) {
          const defaultWhs = this.warehousesList.find(i => i.value === warehousesDefault);
          if (defaultWhs) {
            this.modeloFormDoc.get('filler').setValue({ label: defaultWhs.label, value: defaultWhs.value }, { emitEvent: false });
            this.modeloFormDoc.get('toWhsCode').setValue({ label: defaultWhs.label, value: defaultWhs.value }, { emitEvent: false });
          }
        }

        // Tipo Traslado
        const transfersTypesDefault = this.transfersTypesList.find(i => i.value === '01');

        if (transfersTypesDefault) {
          this.modeloFormOtr.get('u_FIB_TIP_TRAS').setValue({ label: transfersTypesDefault.label, value: transfersTypesDefault.value }, { emitEvent: false });
        }

        // Motivo Traslado
        const reasonsTransfersDefault = this.reasonsTransfersList.find(i => i.value === '04');

        if (reasonsTransfersDefault) {
          this.modeloFormOtr.get('u_BPP_MDMT').setValue({ label: reasonsTransfersDefault.label, value: reasonsTransfersDefault.value }, { emitEvent: false });
        }

        // Tipo Salida
        const outputsTypesDefautl = this.outputsTypesList.find(i => i.value === 'TSI');

        if (outputsTypesDefautl) {
          this.modeloFormOtr.get('u_BPP_MDTS').setValue({ label: outputsTypesDefautl.label, value: outputsTypesDefautl.value }, { emitEvent: false });
        }


        // AHORA SÍ cargar datos - los combos están listos
        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  //#endregion



  //#region <<< 3. GETTERS >>>

  private get getNameFile(): string {
    return `Solicitud de Traslado - ${this.utilService.fechaHoraArchivo()}`;
  }

  //#endregion



  //#region <<< 4. TABLE CONFIG >>>

  private buildColumns(): void {
    /** Construye la definición de columnas para la tabla */
    this.columnas = [
      { field: 'itemCode',        header: 'Código' },
      { field: 'itemName',        header: 'Descripción' },
      { field: 'fromWhsCod',      header: 'De almacén' },
      { field: 'whsCode',         header: 'Almacén destino' },
      { field: 'u_tipoOpT12',     header: 'Tipo operación' },
      { field: 'unitMsr',         header: 'UM' },
      { field: 'quantity',        header: 'Cantidad' }
    ];
  }

  private buildTableOptions(): void {
    /** Define las acciones del split-button para operaciones de fila */
    this.opciones = [
      { value: '1', label: 'Insertar línea',  icon: 'pi pi-plus',   command: () => this.onClickAddLine() },
      { value: '2', label: 'Borrar línea',    icon: 'pi pi-trash',  command: () => this.onClickDelete() }
    ];
  }

  private buildContextMenuOptions(): void {
    /** Define las acciones del menú contextual para las filas */
    this.items = [
      { value: '1', label: 'Insertar línea',      icon: 'pi pi-plus',     command: () => this.onClickContextMenuAddLine(this.modeloLinesSelectedContext) },
      { value: '2', label: 'Borrar línea',        icon: 'pi pi-trash',    command: () => this.onClickContextMenuDelete(this.modeloLinesSelectedContext) },
      { value: '3', label: 'Descargar plantilla', icon: 'pi pi-download', command: () => this.onClickContextMenuDownload() },
      { value: '4', label: 'Cargar plantilla',    icon: 'pi pi-upload',   command: () => this.onClickContextMenuUploadView() }
    ];
  }

  //#endregion



  //#region <<< 5. CONTEXT MENU >>>

  onContextMenuShow(event: any): void {
    if (event?.item?.data) {
      this.modeloLinesSelectedContext = event.item.data;
    }
    this.updateMenuContextVisibility();
  }

  private onClickContextMenuAddLine(modelo: IInventoryTransferRequestLines)
  {
    /** Agrega una nueva línea después de la línea seleccionada en el menú contextual */
    // Manejar casos donde el objeto 'modelo' no es pasado correctamente
    const target = modelo || this.modeloLinesSelectedContext;

    let insertIndex = this.modeloLines.length; // por defecto al final
    if (target) {
      const idx = this.modeloLines.indexOf(target);
      insertIndex = idx > -1 ? idx + 1 : this.modeloLines.length;
    }

    this.addLine(insertIndex);
  }

  private onClickContextMenuDelete(modelo: IInventoryTransferRequestLines)
  {
    /** Elimina la línea seleccionada en el menú contextual */
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

    this.inventoryTransferRequestService.getDownloadItemsTemplate()
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

  private onClickContextMenuUploadView()
  {
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
    return [
      { field: 'itemCode', aliases: ['itemCode', 'Codigo'] },
      { field: 'fromWhsCod', aliases: ['fromWhsCod', 'De almacen'] },
      { field: 'whsCode', aliases: ['whsCode', 'Almacen destino'] },
      { field: 'u_tipoOpT12', aliases: ['u_tipoOpT12', 'Codigo tipo de operacion'] },
      { field: 'unitMsr', aliases: ['unitMsr', 'UM'] },
      { field: 'quantity', aliases: ['quantity', 'Cantidad'] },
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
    return {
      itemCode     : (m.itemCode ?? '').toString().trim(),
      fromWhsCod   : (m.fromWhsCod ?? '').toString().trim(),
      whsCode      : (m.whsCode ?? '').toString().trim(),
      u_tipoOpT12  : (m.u_tipoOpT12 ?? '').toString().trim(),
      unitMsr      : (m.unitMsr ?? '').toString().trim(),
      quantity     : m.quantity !== null ? Number(m.quantity) : 0
    };
  }

  //#endregion



  //#region <<< 9. EXCEL VALIDATION >>>

  private validateExcelLine(line: any, nroLinea: number): boolean {
    const validations = [
      { cond: !line.itemCode, msg: `Línea ${nroLinea}: Ingrese el código de artículo.` },
      { cond: !line.fromWhsCod, msg: `Línea ${nroLinea}: Ingrese el almacén de origen.` },
      { cond: !line.whsCode, msg: `Línea ${nroLinea}: Ingrese el almacén de destino.` },
      { cond: !line.u_tipoOpT12, msg: `Línea ${nroLinea}: Ingrese el tipo de operación.` },
      { cond: !line.unitMsr, msg: `Línea ${nroLinea}: Ingrese la unidad de medida.` },
      {
        cond: line.quantity == null || line.quantity === '' || line.quantity === undefined,
        msg: `Línea ${nroLinea}: Ingrese la cantidad.`
      },
      {
        cond: Number(line.quantity) <= 0,
        msg: `Línea ${nroLinea}: La cantidad no debe ser menor o igual que cero (0).`
      },
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

    this.inventoryTransferRequestService.setValidateLinesExcel(lines)
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

  onSelectedItem(modelo: IInventoryTransferRequestLines): void {
    /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
  }

  private onClickAddLine(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    const insertIndex = index + 1;
    this.addLine(insertIndex);
  }

  private onClickDelete(): void {
    /** Elimina la línea seleccionada; agrega una vacía si quedan sin líneas */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    if (index > -1) {
      // Eliminar la línea del modelo
      this.modeloLines.splice(index, 1);

      // Eliminar también de modeloPickingOriginalLines las que correspondan al itemCode y fromWhsCod de la línea eliminada
      this.modeloPickingOriginalLines.filter(x => x.u_ItemCode === this.modeloLinesSelected.itemCode && x.u_FromWhsCod === this.modeloLinesSelected.fromWhsCod).forEach(x => this.modeloPickingOriginalLines.splice(this.modeloPickingOriginalLines.indexOf(x), 1));
    }

    if (this.modeloLines.length === 0) {
      this.addLine(0);
    }

    this.updateHasValidLines();
  }

  //#endregion



  //#region <<< 11. MENU VISIBILITY >>>

  private hasEmptyLine(): boolean {
    return this.modeloLines.some(line => !this.utilService.normalizePrimitive(line.itemCode)
    );
  }

  private updateMenuVisibility(): void {
    const hasEmptyLines = this.hasEmptyLine();
    const hasLines          = this.modeloLines.length > 0;

    const addLineOption     = this.opciones.find(x => x.value === '1');
    const deleteLineOption  = this.opciones.find(x => x.value === '2');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  private updateMenuContextVisibility(): void {
    const hasEmptyLines = this.hasEmptyLine();
    const hasLines          = this.modeloLines.length > 0;

    const addLineOption     = this.items.find(x => x.value === '1');
    const deleteLineOption  = this.items.find(x => x.value === '2');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;

  }

  //#endregion



  //#region <<< 12. LINES (CORE) >>>

  private addLine(index: number): void {
    const newLine: IInventoryTransferRequestLinesQuery = {
      lineStatus        : 'O',
      itemCode          : '',
      dscription        : '',
      fromWhsCod        : '',
      whsCode           : '',
      u_tipoOpT12       : '',
      u_tipoOpT12Nam    : '',
      unitMsr           : '',
      quantity          : 0,
      openQty           : 0,
      u_FIB_LinStPkg    : 'O',
      u_FIB_OpQtyPkg    : 0,
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

  private updateHasValidLines(): void {
    this.hasValidLines =
      this.modeloLines.length > 0 &&
      !this.hasEmptyLine()
  }

  //#endregion



  //#region <<< 13. BUSINESS PARTNER >>>

  onSelectedSocioNegocio(value: any): void {
    this.cardCode = value.cardCode;
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({
      cardCode  : value.cardCode,
      cardName  : value.cardName,
      address   : value.address2,
      cntctCode : value.cntctCode
    });

    const jrnlMemoNew = `${this.jrnlMemo}${this.cardCode}`;
    this.modeloFormPie.patchValue({ jrnlMemo: jrnlMemoNew });
  }

  onSelectedPersonaContacto(value: any): void {
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({ cntctCode: value.cntctCode });
  }

  //#endregion



  //#region <<< 14. ARTÍCULO >>>

  onOpenArticulo(index: number): void {
    this.indexArticulo = index;
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  onSelectedArticulo(value: any): void {
    this.isVisualizarArticulo = false;
    this.getListByCode(value.itemCode);
  }

  onClickCloseArticulo(): void {
    this.isVisualizarArticulo = false;
  }

  private mapToPurchaseRequest(element: IArticuloQuery): IInventoryTransferRequestLinesQuery {
    /** helpers para evitar repetición */
    const u       = this.utilService;
    const p       = (v:any)=>u.normalizePrimitive(v);

    const fillerValue       = this.modeloFormDoc.get('filler')?.value?.value;
    const toWhsCodeValue    = this.modeloFormDoc.get('toWhsCode')?.value?.value;

    return {
      itemCode       : p(element.itemCode),
      dscription     : p(element.itemName),
      fromWhsCod     : p(fillerValue || element.dfltWH),
      whsCode        : p(toWhsCodeValue || element.dfltWH),
      u_tipoOpT12    : p(element.u_tipoOpT12),
      u_tipoOpT12Nam : p(element.u_tipoOpT12Nam),
      unitMsr        : p(element.invntryUom),
      quantity       : 1,
      openQty        : 1,
      u_FIB_OpQtyPkg : 1
    };
  }

  private setItem(data: IArticuloQuery[]): void {
    if (!data || data.length === 0) return;

    const element = data[0];

    const newItem = this.mapToPurchaseRequest(element);

    this.modeloLines = this.modeloLines.map((line, index) =>
      index === this.indexArticulo
        ? {
            ...line,     // mantiene valores por defecto: record, u_FIB_LinStPkg, etc.
            ...newItem   // actualiza solo los campos del artículo
          }
        : line
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
      operationTypeCode   : '11',
      warehouseType       : 'P'
    };
  }

  //#endregion



  //#region <<< 15. ALMACÉN DE ORIGEN >>>

  onOpenAlmacenOrigenItem(value: IInventoryTransferRequestLines, index: number): void {
    this.indexAlmacenOrigen = index;
    this.itemCode = value.itemCode;
    this.isVisualizarAlmacenOrigen = !this.isVisualizarAlmacenOrigen;
  }

  onSelectedAlmacenOrigenItem(value: any): void {
    const currentLine = this.modeloLines[this.indexAlmacenOrigen];

    currentLine.fromWhsCod = value.whsCode;

    // Actualizar modeloPickingOriginalLines relacionadas
    if (this.modeloPickingOriginalLines.length > 0) {
      this.modeloPickingOriginalLines
        .filter(x => x.u_ItemCode === currentLine.itemCode && x.u_FromWhsCod === currentLine.fromWhsCod)
        .forEach(x => x.u_FromWhsCod = value.whsCode);
    }

    this.isVisualizarAlmacenOrigen = false;
  }

  onClickCloseAlmacenOrigenItem(): void {
    this.isVisualizarAlmacenOrigen = false;
  }

  //#endregion



  //#region <<< 16. ALMACÉN DE DESTINO >>>

  onOpenAlmacenDestinoItem(value: IInventoryTransferRequestLines, index: number): void {
    this.indexAlmacenDestino = index;
    this.itemCode = value.itemCode;
    this.isVisualizarAlmacenDestino = !this.isVisualizarAlmacenDestino;
  }

  onSelectedAlmacenDestinoItem(value: any): void {
    const currentLine = this.modeloLines[this.indexAlmacenDestino];

    currentLine.whsCode = value.whsCode;

    // Actualizar modeloPickingOriginalLines relacionadas
    if (this.modeloPickingOriginalLines.length > 0) {
      this.modeloPickingOriginalLines
        .filter(x => x.u_ItemCode === currentLine.itemCode && x.u_FromWhsCod === currentLine.fromWhsCod)
        .forEach(x => x.u_WhsCode = value.whsCode);
    }

    this.modeloLines[this.indexAlmacenDestino].whsCode = value.whsCode;
    this.isVisualizarAlmacenDestino = false;
  }

  onClickCloseAlmacenDestinoItem(): void {
    this.isVisualizarAlmacenDestino = false;
  }

  //#endregion



  //#region <<< 18. CANTIDAD >>>

  onChangeQuantity(value: IInventoryTransferRequestLines, index: number): void {
    /** Actualiza cantidades en la línea con validación de decimales */
    if (value.itemCode === '') {
      this.modeloLines[index].quantity = 0;
      this.modeloLines[index].openQty = 0;
      this.modeloLines[index].u_FIB_OpQtyPkg = 0;
      return;
    }

    const quantity = this.utilService.onRedondearDecimal(value.quantity, 3);
    this.modeloLines[index].quantity = quantity;
    this.modeloLines[index].openQty = quantity;
    this.modeloLines[index].u_FIB_OpQtyPkg = quantity;
  }

  //#endregion



  //#region <<< 19. REQUESTER / HEADER LOGIC >>>

  private wireAlmacenOrigenControl(): void {
    this.modeloFormDoc.get('filler')
    ?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((value) => {

      const hasValidLines = this.modeloLines.some(
        x => x.itemCode && x.itemCode.trim() !== ''
      );

      if (value && hasValidLines) {

        this.swaCustomService.swaConfirmation(
          this.globalConstants.titleActualizarDeAlmacen,
          this.globalConstants.subTitleActualizarDeAlmacen,
          this.globalConstants.icoSwalQuestion
        ).then((result) => {

          if (result.isConfirmed) {
            const whsCode = value?.value || value;

            this.applyAlmacenOrigenTomodeloLines(whsCode);
          }
        });
      }
    });
  }

  private applyAlmacenOrigenTomodeloLines(whsCode: string): void {
    this.modeloLines.forEach(x => {
      if (x.itemCode !== '') {
        x.fromWhsCod = whsCode;
      }
    });

    this.modeloPickingOriginalLines.forEach(x => {
      x.u_FromWhsCod = whsCode;
    });
  }

  private wireAlmacenDestinoControl(): void {
    this.modeloFormDoc.get('toWhsCode')
    ?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((value) => {

      const hasValidLines = this.modeloLines.some(
        x => x.itemCode && x.itemCode.trim() !== ''
      );

      if (value && hasValidLines) {

        this.swaCustomService.swaConfirmation(
          this.globalConstants.titleActualizarAAlmacen,
          this.globalConstants.subTitleActualizarAAlmacen,
          this.globalConstants.icoSwalQuestion
        ).then((result) => {

          if (result.isConfirmed) {
            const whsCode = value?.value || value;

            this.applyAlmacenDestinoTomodeloLines(whsCode);
          }
        });
      }
    });
  }

  private applyAlmacenDestinoTomodeloLines(whsCode: string): void {
    this.modeloLines.forEach(x => {
      if (x.itemCode !== '') {
        x.whsCode = whsCode;
      }
    });

    this.modeloPickingOriginalLines.forEach(x => {
      x.u_WhsCode = whsCode;
    });
  }

  //#endregion



  //#region <<< 20. LOAD DATA (EDICIÓN) >>>

  private loadData(): void {
    const mode = history.state?.mode;

    // 🆕 CREAR NUEVO → no necesita data
    if (mode === 'create') {
      return;
    }

    // 📋 COPIA
    let tomaInventario = history.state?.tomaInventario;

    if (!tomaInventario) {
      const cache = sessionStorage.getItem('TomaInventarioCopyTo');
      tomaInventario = cache ? JSON.parse(cache) : null;
    }

    if (!tomaInventario) return;

    this.setFormValues(tomaInventario);
  }

  private setFormValues(value: IInventoryTransferRequestQuery): void {
    const isDisabled = value.pickingLines.length > 0;

    // Setear valor
    this.modeloFormDoc.patchValue(
      {
        u_FIB_IsPkg: isDisabled,
      },
      { emitEvent: false }
    );

    // Habilitar / Deshabilitar
    const control = this.modeloFormDoc.get('u_FIB_IsPkg');

    if (isDisabled) {
      control?.disable({ emitEvent: false });
    } else {
      control?.enable({ emitEvent: false });
    }


    this.modeloLines                = value.lines.map(line => ({ ...line }));
    this.modeloPickingOriginalLines = value.pickingLines.map(line => ({ ...line }));
    this.updateHasValidLines();
  }

  //#endregion



  //#region <<< 21. SAVE >>>

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

    this.inventoryTransferRequestService.setCreate(modeloToSave)
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
    const showError = (msg: string): boolean => {
      this.swaCustomService.swaMsgInfo(msg);
      return false;
    };

    const p = (v: any) => this.utilService.normalizePrimitive(v);
    const val = (v: any) => v?.value ?? v;

    const runValidations = (validations: { cond: boolean, msg: string }[]) => {
      for (const v of validations) {
        if (v.cond) return showError(v.msg);
      }
      return true;
    };

    const { filler, toWhsCode } = this.modeloFormDoc.getRawValue();

    const fillerValue = val(filler);
    const toWhsCodeValue = val(toWhsCode);

    if (!runValidations([
      { cond: !fillerValue, msg: 'Seleccione el almacén de origen.' },
      { cond: !toWhsCodeValue, msg: 'Seleccione el almacén de destino.' },
      { cond: fillerValue === toWhsCodeValue, msg: 'El almacén de destino no puede ser idéntico al almacén de origen.' },
      { cond: this.modeloLines.length === 0, msg: 'Ingrese los datos en el detalle de la transferencia.' },
      { cond: this.modeloLines.some(d => !p(d.itemCode)), msg: 'Ingrese los datos en el detalle de la transferencia.' },
    ])) return false;

    for (let i = 0; i < this.modeloLines.length; i++) {
      const line = this.modeloLines[i];
      const row = i + 1;

      const fromWhsCod = val(line.fromWhsCod);
      const whsCode = val(line.whsCode);

      const validations = [
        { cond: fromWhsCod === whsCode, msg: `Línea ${row}: El almacén de destino no puede ser idéntico al almacén de origen.` },
        { cond: !p(line.u_tipoOpT12), msg: `Línea ${row}: Seleccione el tipo de operación.` },
        { cond: Number(line.quantity) <= 0, msg: `Línea ${row}: La cantidad no debe ser menor o igual que cero (0).` },
      ];

      if (!runValidations(validations)) return false;
    }

    return true;
  }

  private mergeForms() {
    return {
      ...this.modeloFormSn.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormPie.getRawValue()
    };
  }

  private mapLinesCreate(): InventoryTransferRequest1CreateModel[] {
    /** helpers para evitar repetición */
    const u = this.utilService;
    const p = (v:any)=>u.normalizePrimitive(v);
    const n = (v:any)=>u.normalizeNumber(v);

    return this.modeloLines.map<InventoryTransferRequest1CreateModel>(line => ({
      itemCode       : p(line.itemCode),
      dscription     : p(line.dscription),
      fromWhsCod     : p(line.fromWhsCod),
      whsCode        : p(line.whsCode),

      unitMsr        : p(line.unitMsr),
      quantity       : n(line.quantity),

      u_FIB_LinStPkg : p(line.u_FIB_LinStPkg),
      u_FIB_OpQtyPkg : n(line.u_FIB_OpQtyPkg),
      u_tipoOpT12    : p(line.u_tipoOpT12)
    }));
  }

  private mapPickingLines(userId:number): InventoryTransferRequestPickingCreateModel[] {
    /** helpers para evitar repetición */
    const u = this.utilService;
    const p = (v:any)=>u.normalizePrimitive(v);
    const n = (v:any)=>u.normalizeNumber(v);

    return this.modeloPickingOriginalLines.map<InventoryTransferRequestPickingCreateModel>(line => ({
      u_ItemCode   : p(line.u_ItemCode),
      u_Dscription : p(line.u_Dscription),
      u_CodeBar    : p(line.u_CodeBar),
      u_FromWhsCod : p(line.u_FromWhsCod),
      u_WhsCode    : p(line.u_WhsCode),

      u_UnitMsr    : p(line.u_UnitMsr),
      u_Quantity   : n(line.u_Quantity),
      u_WeightKg   : n(line.u_WeightKg),

      u_Status     : p(line.u_Status),
      u_UsrCreate  : n(userId)
    }));
  }

  private buildModelToSave(): InventoryTransferRequestCreateModel {
    /** helpers para evitar repetición */
    const u               = this.utilService;
    const p               = (v:any)=>u.normalizePrimitive(v);
    const n               = (v:any)=>u.normalizeNumber(v);
    const d               = (v:any)=>u.normalizeDateOrToday(v);
    const val             = (v:any)=>v?.value ?? v;

    /** combinar tod  os los formularios */
    const f               = this.mergeForms();

    const userId          = this.userContextService.getIdUsuario();

    const hasPicking      = this.modeloPickingOriginalLines.length > 0;
    const u_FIB_IsPkg     = f.u_FIB_IsPkg ? 'Y' : (hasPicking ? 'Y' : 'N');
    const u_FIB_DocStPkg  = hasPicking ? 'C' : 'O';

    const lines           = this.mapLinesCreate();
    const pickingLines    = this.mapPickingLines(userId)


    return {
      ...new InventoryTransferRequestCreateModel(),

      docDate         : d(f.docDate),
      docDueDate      : d(f.docDueDate),
      taxDate         : d(f.taxDate),

      u_FIB_IsPkg     : u_FIB_IsPkg,
      u_FIB_DocStPkg  : u_FIB_DocStPkg,

      cardCode        : p(f.cardCode),
      cardName        : p(f.cardName),
      cntctCode       : n(f.cntctCode),
      address         : p(f.address),

      filler          : p(val(f.filler)),
      toWhsCode       : p(val(f.toWhsCode)),

      u_FIB_TIP_TRAS  : p(val(f.u_FIB_TIP_TRAS)),
      u_BPP_MDMT      : p(val(f.u_BPP_MDMT)),
      u_BPP_MDTS      : p(val(f.u_BPP_MDTS)),

      slpCode         : n(val(f.salesPersons) ?? -1),
      jrnlMemo        : p(f.jrnlMemo),
      comments        : p(f.comments),

      u_UsrCreate     : userId,

      lines,
      pickingLines
    };
  }

  //#endregion



  //#region <<< 22. SESSION / CLEANUP >>>

  private clearSession(): void {
    sessionStorage.removeItem('TomaInventarioCopyTo');
  }

  //#endregion



  //#region <<< 23. NAVIGATION >>>

  onClickBack(): void {
    /** Navega de vuelta a la lista de solicitudes de traslado */
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-list']);
  }

  //#endregion
}
