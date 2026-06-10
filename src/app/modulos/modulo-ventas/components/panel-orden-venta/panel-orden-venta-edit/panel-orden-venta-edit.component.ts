import { SelectItem } from 'primeng/api';
import { FormGroup, FormBuilder,} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { catchError, switchMap, map, finalize, tap, take, filter } from 'rxjs/operators';
import { Subject, forkJoin, of, takeUntil, Subscription, Observable, merge, EMPTY, from, combineLatest } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ItemsFindByListCodeModel } from '@app/modulos/modulo-inventario/models/items.model';
import { Orders1UpdateModel, OrdersUpdateModel } from '@app/modulos/modulo-ventas/models/sap-business-one/orders.model';
import { Attachments2LinesUpdateModel, Attachments2UpdateModel } from '@app/modulos/modulo-ventas/models/sap-business-one/attachments2.model';

import { MenuItem, TableColumn } from '@app/interface/common-ui.interface';
import { IArticulo } from '@app/modulos/modulo-inventario/interfaces/items.interface';
import { IAddresses } from '@app/modulos/modulo-socios-negocios/interfaces/addresses.interface';
import { IExchangeRates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';
import { IBusinessPartnersQuery } from '@app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';
import { IAttachments2LinesQuery } from '@app/modulos/modulo-ventas/interfaces/sap-business-one/attachments2.interface';
import { IOrdenVenta1Query, IOrdersQuery } from '@app/modulos/modulo-ventas/interfaces/sap-business-one/orders.interface';
import { ITaxGroups } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/tax-groups.iterface';
import { IWarehouses } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { ISalesPersons } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IOperationsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/operation-type.interface';
import { IUserDefinedFields } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IPaymentTermsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/payment-terms-types.interface';

import { UtilService } from '@app/services/util.service';
import { LocalDataService } from '@app/services/local-data.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { ItemsService } from '@app/modulos/modulo-inventario/services/items.service';
import { DraftsService } from '@app/modulos/modulo-documentos-borrador/services/drafts.service';
import { AddressesService } from '@app/modulos/modulo-socios-negocios/services/addresses.service';
import { OrdersService } from '@app/modulos/modulo-ventas/services/sap-business-one/orders.service';
import { ChartOfAccountsService } from '@app/modulos/modulo-finanzas/services/chart-of-accounts.service';
import { BusinessPartnersService } from '@app/modulos/modulo-socios-negocios/services/business-partners.service';
import { ExchangeRatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';
import { TaxGroupsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/finanzas/tax-groups.service';
import { WarehousesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { SalesPersonsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { OperationsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/operation-type.service';
import { UserDefinedFieldsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { PaymentTermsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/payment-terms-types.service';


@Component({
  selector: 'app-ven-panel-orden-venta-edit',
  templateUrl: './panel-orden-venta-edit.component.html',
  styleUrls: ['./panel-orden-venta-edit.component.css']
})
export class PanelOrdenVentaEditComponent implements OnInit, OnDestroy {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly destroy$                     = new Subject<void>();
  private readonly h                            = this.utilService.getHelpers();
  private taxGroupSubscription                  : Subscription | null = null;
  private shipAddressSubscription               : Subscription | null = null;
  private agenciaLoadSubscription               : Subscription | null = null;


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();


  // ===========================
  // 🔹 3. FORMS
  // ===========================
  modeloFormSoc                                 : FormGroup;
  modeloFormDoc                                 : FormGroup;
  modeloFormCon                                 : FormGroup;
  modeloFormLog                                 : FormGroup;
  modeloFormFin                                 : FormGroup;
  modeloFormAge                                 : FormGroup;
  modeloFormExp                                 : FormGroup;
  modeloFormSal                                 : FormGroup;
  modeloFormTot                                 : FormGroup;
  modeloFormMod                                 : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isLocked                                      : boolean = true;
  isSaving                                      : boolean = false;
  isDisplay                                     : boolean = false;
  isInvoice                                     : boolean = true;
  isAuthorized                                  : boolean = true;
  hasValidLines                                 : boolean = false;
  isDisplayVisor                                : boolean = false;
  hasRealChanges                                : boolean = false;
  isPastingPrices                               : boolean = false;
  isDisplayUpload                               : boolean = false;
  isWatchingChanges                             : boolean = false;
  isPastingWhsCodes                             : boolean = false;
  isPastingTaxCodes                             : boolean = false;
  isPastingItemCodes                            : boolean = false;
  isPastingQuantities                           : boolean = false;
  isVisualizarAlmacen                           : boolean = false;
  isVisualizarImpuesto                          : boolean = false;
  isVisualizarArticulo                          : boolean = false;
  isLoadingInitialData                          : boolean = false;
  isPastingFormatCodes                          : boolean = false;
  isPastingDescriptions                         : boolean = false;
  isVisualizarPrintModal                        : boolean = false;
  isPastingOperationTypes                       : boolean = false;
  isDisplayGenerandoVisor                       : boolean = false;
  hasValidLinesAttachments                      : boolean = false;
  isVisualizarTipoOperacion                     : boolean = false;
  isVisualizarCuentaContable                    : boolean = false;
  isShowingLineValidationMessage                : boolean = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  contextMenuItems                              : MenuItem[];
  splitButtonItems                              : MenuItem[];
  splitButtonItemsCopyTo                        : MenuItem[];
  splitButtonAttachmentItems                    : MenuItem[];

  columnas                                      : TableColumn[];
  columnasAttachments                           : TableColumn[];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modeloLinesSelected                           : IOrdenVenta1Query;
  modeloLinesAttachmentsSelected                : IAttachments2LinesQuery;

  modeloLines                                   : IOrdenVenta1Query[] = [];
  modeloLinesAttachments                        : IAttachments2LinesQuery[] = [];
  modeloLinesOriginal                           : IOrdenVenta1Query[] = [];

  modeloLinesEliminate                          : IOrdenVenta1Query[] = [];
  modeloLinesAttachmentsEliminate               : IAttachments2LinesQuery[] = [];

  uploadedFiles                                 : any[] = [];
  isDataBlob                                    : Blob | null = null;


  // ===========================
  // 🔹 7. COMBOS / LISTS
  // ===========================
  currencyList                                  : SelectItem[] = [];
  docTypesList                                  : SelectItem[] = [];
  payAddressList                                : SelectItem[] = [];
  shipAddressList                               : SelectItem[] = [];
  freightTypeList                               : SelectItem[] = [];
  salesPersonsList                              : SelectItem[] = [];
  agencyAddressList                             : SelectItem[] = [];
  printModelTypesList                           : SelectItem[] = [];
  operationsTypesList                           : SelectItem[] = [];
  paymentsTermsTypesList                        : SelectItem[] = [];


  // ===========================
  // 🔹 8. DOC TYPE CONTROL
  // ===========================
  docTypeSelected                               : any;
  initialSnapshot!                              : any;


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
  sysRate                                       : number = 0;
  docEntry                                      : number = 0;
  vatPrcnt                                      : number = 0;
  cntctCode                                     : number = 0;
  indexAlmacen                                  : number = 0;
  indexImpuesto                                 : number = 0;
  indexArticulo                                 : number = 0;
  uploadProgress                                : number = 0;
  indexFileUpload                               : number = 0;
  indexTipoOperacion                            : number = 0;
  indexCentroCuentaContable                     : number = 0;


  // ===========================
  // 🔹 10. TEXT / AUX / FILTERS
  // ===========================
  titulo                                        : string = 'Orden de Venta';
  taxCode                                       : string = '';
  cardCode                                      : string = '';
  currencies                                    : string = '';
  itemCode                                      : string = '';
  docStatus                                     : string = '';
  wddStatus                                     : string = '';
  mainCurncy                                    : string = '';
  u_BPP_MDCT                                    : string = '';
  inactiveAlmacenItem                           : string = 'N';
  private readonly orderLoadStateKey            : string = 'orderLoadState';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly itemsService: ItemsService,
    private readonly draftsService: DraftsService,
    private readonly ordersService: OrdersService,
    private readonly addressesService: AddressesService,
    private readonly taxGroupsService: TaxGroupsService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly chartOfAccountsService: ChartOfAccountsService,
    private readonly operationsTypesService: OperationsTypesService,
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly paymentTermsTypesService: PaymentTermsTypesService,
    private readonly userDefinedFieldsService: UserDefinedFieldsService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.taxGroupSubscription?.unsubscribe();
    this.taxGroupSubscription = null;

    this.shipAddressSubscription?.unsubscribe();
    this.shipAddressSubscription = null;

    this.agenciaLoadSubscription?.unsubscribe();
    this.agenciaLoadSubscription = null;

    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion



  //#region <<< 2. INITIALIZATION >>>

  private initializeComponent(): void {
    // 1️⃣ Crear formularios
    this.buildForms();

    // 2️⃣ Cargar datos base
    this.loadAllCombos();

    // 3️⃣ Registrar listeners reactivos
    this.wireCurrencyControl();
    this.wireDiscountControls();
    this.wirePayAddressControl();
    this.wireShipAddressControl();
    this.wireAgencyAddressControl();

    // 4️⃣ Inicializar UI
    this.onBuildColumns();
    this.buildTableOptions();
    this.buildColumnsAttachments();
    this.buildTableOptionsCopyTo();
    this.buildContextMenuOptions();
    this.buildTableAttachmentsOptions();

    // 5️⃣ Inicializar líneas
    this.addLine(0);
    this.addLineAttachments(0);
  }

  private buildForms(): void {
    const r = (value: number, dec: number) => this.utilService.onRedondearDecimalConCero(value, dec);

    const fc = this.utilService.fc.bind(this.utilService);

    this.modeloFormSoc = this.fb.group({
      cardCode          : fc('', true),
      cardName          : fc('', true),
      cntctCode         : fc(),
      numAtCard         : fc(),
      currencies          : fc('', true),
      docRate           : fc(r(0, 3), true),
    });

    this.modeloFormDoc = this.fb.group({
      docNum            : fc(),
      docStatus         : fc('Abierto', true),
      docDate           : fc(null, true),
      docDueDate        : fc(null, true),
      taxDate           : fc(null, true),
    });

    this.modeloFormCon = this.fb.group({
      docTypes           : fc('', true),
    });

    this.modeloFormLog = this.fb.group({
      shipAddress       : fc(),
      address2          : fc(),
      payAddress        : fc(),
      address           : fc(),
    });

    this.modeloFormFin = this.fb.group({
      paymentsTermsTypes: fc('', true),
    });

    this.modeloFormAge = this.fb.group({
      u_BPP_MDCT        : fc(),
      u_BPP_MDRT        : fc(),
      u_BPP_MDNT        : fc(),
      agencyAddress     : fc(),
      u_BPP_MDDT        : fc(),
    });

    this.modeloFormExp = this.fb.group({
      freightType       : fc(),
      u_ValorFlete      : fc(r(0, 0)),
      u_FIB_TFLETE      : fc(r(0, 2)),
      u_FIB_IMPSEG      : fc(r(0, 2)),
      u_FIB_PUERTO      : fc(),
      u_FIB_NEMBA       : fc(),
      u_FIB_DEMBA       : fc(),
    });

    this.modeloFormSal = this.fb.group({
      salesPersons      : fc('', true),
      u_NroOrden        : fc(),
      u_OrdenCompra     : fc(),
      comments          : fc(),
    });

    this.modeloFormTot = this.fb.group({
      subTotal          : fc(r(0, 2)),
      discPrcnt         : fc(r(0, 2)),
      discSum           : fc(r(0, 2)),
      vatSum            : fc(r(0, 2)),
      docTotal          : fc(r(0, 2)),
    });

    this.modeloFormMod = this.fb.group({
      printModelTypes   : fc('', true),
    });

    this.mainCurncy = this.userContextService.getMainCurncy();
  }

  private loadAllCombos(): void {
  const paramTipoFlete: any = { tableID: 'ORDR', aliasID: 'TipoFlete' };
  const paramTipoVenta: any = { tableID: 'ORDR', aliasID: 'STR_TVENTA' };

  this.isDisplay = true;

  const docTypes = this.localDataService.docTypes;
  this.docTypesList = docTypes.map(s => ({
    label: s.name,
    value: s.code
  }));

  const defaultDocType = this.docTypesList.find(x => x.value === 'I');

  if (defaultDocType) {
    this.docTypeSelected = defaultDocType;

    this.modeloFormCon
      .get('docTypes')
      ?.setValue(defaultDocType, { emitEvent: false });

    this.onBuildColumns();
  }

  const printModelTypes: any = this.localDataService.printModelTypesOrders;
    this.printModelTypesList = printModelTypes.map(s => ({
      label: s.name,
      value: s.code
    }));

    forkJoin({
      groups: this.paymentTermsTypesService
        .getList()
        .pipe(catchError(() => of([] as IPaymentTermsTypes[]))),

      tipoFlete: this.userDefinedFieldsService
        .getList(paramTipoFlete)
        .pipe(catchError(() => of([] as IUserDefinedFields[]))),

      tipoVenta: this.userDefinedFieldsService
        .getList(paramTipoVenta)
        .pipe(catchError(() => of([] as IUserDefinedFields[]))),

      salesPersons: this.salesPersonsService
        .getList()
        .pipe(catchError(() => of([] as ISalesPersons[]))),

      operationsTypes: this.operationsTypesService
        .getList()
        .pipe(catchError(() => of([] as IOperationsTypes[])))
    })
    .pipe(
      takeUntil(this.destroy$),

      tap((res) => {
        this.freightTypeList = (res.tipoFlete || []).map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        this.salesPersonsList = (res.salesPersons || []).map(item => ({
          label: item.slpName,
          value: item.slpCode
        }));

        this.operationsTypesList = (res.operationsTypes || []).map(item => ({
          label: item.fullDescr,
          value: item.code
        }));

        this.paymentsTermsTypesList = (res.groups || []).map(item => ({
          label: item.pymntGroup,
          value: item.groupNum
        }));
      }),

      switchMap(() => this.loadData()),

      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      error: (e) => {
        this.utilService.handleErrorSingle(
          e,
          'loadAllCombos',
          this.swaCustomService
        );
      }
    });
  }

  private onBuildColumns() {
    if(this.isItem){
      this.columnas = [
        { field: 'itemCode',        header: 'Código' },
        { field: 'dscription',      header: 'Descripción' },
        { field: 'whsCode',         header: 'Almacén' },
        { field: 'unitMsr',         header: 'UM' },
        { field: 'onHand',          header: 'Stock' },
        { field: 'quantity',        header: 'Cantidad' },
        { field: 'priceBefDi',      header: 'Precio' },
        { field: 'taxCode',         header: 'Impuesto' },
        { field: 'u_tipoOpT12',     header: 'Tipo de operación' },
        { field: 'lineTotal',       header: 'Total' },
      ];
    }
    else{
      this.columnas = [
        { field: 'dscription',      header: 'Descripción' },
        { field: 'formatCode',      header: 'Cuenta mayor' },
        { field: 'acctName',        header: 'Nombre de la cuenta de mayor' },
        { field: 'priceBefDi',      header: 'Precio' },
        { field: 'taxCode',         header: 'Impuesto' },
        { field: 'u_tipoOpT12',     header: 'Tipo de operación' },
        { field: 'lineTotal',       header: 'Total' },
      ];
    }
  }

  private buildColumnsAttachments() {
    this.columnasAttachments = [
      { field: 'trgtPath',        header: 'Vía de acceso destino' },
      { field: 'fileName',        header: 'Nombre de archivo' },
      { field: 'date',            header: 'Fecha del anexo' },
    ];
  }

  private buildTableOptions() {
    this.splitButtonItems = [
      { value: '1', label: 'Insertar arriba',     icon: 'pi pi-plus',                   command: () => this.onClickAddLineAbove() },
      { value: '2', label: 'Insertar abajo',      icon: 'pi pi-plus',                   command: () => this.onClickAddLineBelow() },
      { value: '3', label: 'Eliminar línea',      icon: 'pi pi-trash',                  command: () => this.onClickDelete()  },
    ];
  }

  private buildTableOptionsCopyTo(): void {
    this.splitButtonItemsCopyTo = [
      { value: '1',  label: 'Entrega',            icon: 'pi pi-cart-plus',            command: () =>  {} },
      { value: '2',  label: 'Fact. deudores',     icon: 'pi pi-check',                   command: () =>  {} },
      { value: '3',  label: 'Fact. reserva',      icon: 'pi pi-check',                   command: () => this.onClickToCopyReserveInvoice() },
    ];
  }

  private buildContextMenuOptions(): void {
    this.contextMenuItems = [
      { value: '1', label: 'Duplicar',                            icon: 'pi pi-copy',                   command: () => { this.onClickDuplicate() } },
      { value: '2', label: 'Imprimir',                            icon: 'pi pi-print',                  command: () => { this.onClickModelPrintOpen() } },
      { value: '3', label: 'Ganancia bruta',                      icon: 'pi pi-building',               command: () => {} },
      { value: '4', label: 'Cáculos de comisión y peso',          icon: 'pi pi-chart-bar',              command: () => {} },
      { value: '5', label: 'Comentarios iniciales y final',       icon: 'pi pi-check',                  command: () => {} }
    ];
  }

  private buildTableAttachmentsOptions() {
    this.splitButtonAttachmentItems = [
      { value: '1', label: 'Insertar línea',      icon: 'pi pi-plus',                   command: () => this.onClickAddLineAttachments() },
      { value: '2', label: 'Borrar línea',        icon: 'pi pi-trash',                  command: () => this.onClickDeleteAttachments()  },
    ];
  }

  //#endregion



  //#region <<< 3. GETTERS >>>

  private get docTypes(): string {
    return this.modeloFormCon.get('docTypes')?.value?.value;
  }

  get isItem(): boolean {
    return this.docTypes === 'I';
  }

  get isService(): boolean {
    return this.docTypes === 'S';
  }

  //#endregion



  //#region <<< 4. CONTEXT MENU EVENTS >>>

  onContextMenuShow(): void {
    this.updateMenuContextVisibility();
  }

  onPanelContextMenu(event: MouseEvent, cm: any): void {
    const target = event.target as HTMLElement;

    const isControl = !!target.closest(`
      label,
      input,
      textarea,
      select,
      button,
      p-table,
      p-tabView,
      .p-inputtext,
      .p-dropdown,
      .p-calendar,
      .p-button,
      .p-splitbutton,
      .p-dialog,
      app-modal-socio-negocio,
      app-modal-persona-contacto
    `);

    if (isControl) {
      event.stopPropagation();
      return;
    }

    cm.show(event);
  }

  private updateMenuContextVisibility(): void {
    const canSaveDraft =
      this.modeloFormSoc.valid &&
      this.modeloFormDoc.valid &&
      this.modeloFormFin.valid &&
      this.modeloFormSal.valid &&
      this.hasValidLines;

    const draftItem = this.contextMenuItems.find(x => x.value === '6');

    if (draftItem) {
      draftItem.visible = canSaveDraft;
    }

    const hasDocEntry = this.docEntry > 0;

    const duplicateItem = this.contextMenuItems.find(x => x.value === '1');
    const printItem     = this.contextMenuItems.find(x => x.value === '2');

    if (duplicateItem) {
      duplicateItem.visible = hasDocEntry;
    }

    if (printItem) {
      printItem.visible = hasDocEntry;
    }
  }

  onClickDuplicate(): void {
    sessionStorage.setItem(
      this.orderLoadStateKey,
      JSON.stringify({
        mode: 'sendOrderDuplicate',
        docEntry: this.docEntry
      })
    );

    this.router.navigate(
      ['/main/modulo-ven/panel-orden-venta-create'],
      {
        state: {
          mode: 'sendOrderDuplicate',
          docEntry: this.docEntry
        }
      }
    );
  }

  //#endregion



  //#region <<< 4. TABLE / CONTEXT MENU >>>
  
  onClickModelPrintOpen(): void {
    this.isVisualizarPrintModal = !this.isVisualizarPrintModal;
  }

  onClickPrint(): void {
    const f = this.modeloFormMod.getRawValue();

    const type = this.h.p(this.h.v(f.printModelTypes));

    const actions: Record<string, () => void> = {
      '01': () => this.onClickPrintNational(),
      '02': () => this.onClickPrintExportPlanta(),
      '03': () => this.onClickPrintExportCliente(),
    };

    const action = actions[type];

    if (!action) {
      this.swaCustomService.swaMsgInfo('Seleccione un modelo de impresión.');
      return;
    }

    action();
  }

  private printDocument(request$: Observable<any>, errorContext: string): void {
    this.isDisplayGenerandoVisor = true;

    request$
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplayGenerandoVisor = false)
    )
    .subscribe({
      next: (resp: any) => {
        if (resp.type === HttpEventType.Response) {
          this.isDataBlob = new Blob([resp.body], { type: resp.body.type });
          this.isDisplayVisor = true;
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, errorContext, this.swaCustomService);
      }
    });
  }

  private onClickPrintNational(): void {
    this.printDocument(
      this.ordersService.getPrintNationalDocEntry(this.docEntry),
      'onClickPrintNational'
    );
  }

  private onClickPrintExportPlanta(): void {
    this.printDocument(
      this.ordersService.getPrintExportPlantaDocEntry(this.docEntry),
      'onClickPrintExportPlanta'
    );
  }

  private onClickPrintExportCliente(): void {
    this.printDocument(
      this.ordersService.getPrintExportClienteDocEntry(this.docEntry),
      'onClickPrintExportCliente'
    );
  }

  onClickModelPrintClose(): void {
    this.isVisualizarPrintModal = !this.isVisualizarPrintModal;
  }

  /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
  onSelectedItem(modelo: IOrdenVenta1Query) {
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
  }

  onClickAddLineAbove(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    this.addLineAbove(index);
  }

  onClickAddLineBelow(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    this.addLineBelow(index);
  }

  onClickDelete(): void {
    /** Elimina la línea seleccionada; agrega una vacía si quedan sin líneas */
    // Existe en la base de datos
    if (this.modeloLinesSelected.record === 2) {
      this.modeloLinesSelected.record = 3;
      this.modeloLinesEliminate.push(this.modeloLinesSelected);
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

  private hasData(line: any): boolean {
    const p = (v: any) => this.utilService.normalizePrimitive(v);

    return this.isItem
      ? !!p(line.itemCode)
      : !!p(line.dscription);
  }

  private hasEmptyLine(): boolean {
    return this.modeloLines.some(line => !this.hasData(line));
  }

  private updateMenuVisibility(): void {
    const hasEmptyLines = this.hasEmptyLine();
    const hasLines      = this.modeloLines.length > 0;

    const addLineOption1    = this.splitButtonItems.find(x => x.value === '1');
    const addLineOption2    = this.splitButtonItems.find(x => x.value === '2');
    const deleteLineOption  = this.splitButtonItems.find(x => x.value === '3');

    if (addLineOption1) addLineOption1.visible = !hasEmptyLines;
    if (addLineOption2) addLineOption2.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }


  onSelectedItemAttachments(modelo: IAttachments2LinesQuery) {
    this.modeloLinesAttachmentsSelected = modelo;
    this.updateMenuAttachmentsVisibility();
  }

  onClickAddLineAttachments(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloLinesAttachments.indexOf(this.modeloLinesAttachmentsSelected);
    const insertIndex = index + 1;
    this.addLineAttachments(insertIndex);

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickDeleteAttachments(): void {
    /** Elimina la línea seleccionada; agrega una vacía si quedan sin líneas */

    // No existe ne la base de datos
    if (this.modeloLinesAttachmentsSelected.record === 1) {
      const fileName = this.modeloLinesAttachmentsSelected.fileName;
      const fileExt  = this.modeloLinesAttachmentsSelected.fileExt;

      const fullName = `${fileName}.${fileExt}`;

      this.uploadedFiles = this.uploadedFiles.filter(file => {
        const incomingName = file?.name || '';
        return incomingName !== fullName;
      });
    }

    // Existe en la base de datos
    if (this.modeloLinesAttachmentsSelected.record === 2) {
      const deletedLine = {
        ...this.modeloLinesAttachmentsSelected,
        record: 3
      };

      this.modeloLinesAttachmentsEliminate.push(deletedLine);
    }

    /** Elimina la línea seleccionada; agrega una vacía si quedan sin líneas */
    const index = this.modeloLinesAttachments.indexOf(this.modeloLinesAttachmentsSelected);
    if (index > -1) {
      this.modeloLinesAttachments.splice(index, 1);
    }

    if (this.modeloLinesAttachments.length === 0) {
      this.addLineAttachments(0);
    }

    this.updateHasValidLinesAttachments();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  private hasDataAttachments(line: any): boolean {
    const p = (v: any) => this.utilService.normalizePrimitive(v);

    return !!p(line.trgtPath)
  }

  private hasEmptyLineAttachments(): boolean {
    return this.modeloLinesAttachments.some(line => !this.hasDataAttachments(line));
  }

  private updateMenuAttachmentsVisibility(): void {
    const hasEmptyLines = this.hasEmptyLineAttachments();
    const hasLines      = this.modeloLinesAttachments.length > 0;

    const addLineOption1    = this.splitButtonAttachmentItems.find(x => x.value === '1');
    const deleteLineOption  = this.splitButtonAttachmentItems.find(x => x.value === '2');

    if (addLineOption1) addLineOption1.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  //#endregion



  //#region <<< 5. LINES (CORE) >>>

  private insertLine(index: number): void {
    const newLine: IOrdenVenta1Query = this.createEmptyLine();

    this.modeloLines = [
      ...this.modeloLines.slice(0, index),
      newLine,
      ...this.modeloLines.slice(index)
    ];

    this.reindexLines();
    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 obligatorio
  }

  addLineAbove(index: number): void {
    this.insertLine(index); // 👆 encima
  }

  addLineBelow(index: number): void {
    this.insertLine(index + 1); // 👇 debajo
  }

  private addLine(index: number): void {
    this.insertLine(index); // mismo comportamiento que antes
  }

  private reindexLines(): void {
    this.modeloLines = this.modeloLines.map((line, i) => ({
      ...line,
      lineNum: i
    }));
  }

  private createEmptyLine(): IOrdenVenta1Query {
    return {
      docEntry                  : 0,
      lineNum                   : 0,
      lineStatus                : 'O',
      itemCode                  : '',
      dscription                : '',
      acctCode                  : '',
      formatCode                : '',
      acctName                  : '',
      whsCode                   : '',
      unitMsr                   : '',
      onHand                    : 0,
      quantity                  : 0,
      openQty                   : 0,
      currency                  : '',
      priceBefDi                : 0,
      discPrcnt                 : 0,
      price                     : 0,
      taxCode                   : '',
      vatPrcnt                  : 0,
      vatSum                    : 0,
      lineTotal                 : 0,
      u_FIB_LinStPkg            : 'O',
      u_FIB_OpQtyPkg            : 0,
      u_S_PartAranc1            : '',
      u_tipoOpT12               : '',
      u_tipoOpT12Nam            : '',

      record                    : 1,

      isItemCodeValidated       : false,
      validatedItemCode         : '',

      isWhsCodeValidated        : false,
      validatedWhsCode          : '',

      isTaxCodeValidated        : false,
      validatedTaxCode          : '',

      isFormatCodeValidated     : false,
      validatedFormatCode       : '',

      isOperationTypeValidated  : false,
      validatedOperationType    : '',
    } as any;
  }

  private updateHasValidLines(): void {
    this.hasValidLines =
      this.modeloLines.length > 0 &&
      !this.hasEmptyLine();
  }

  private addLineAttachments(index: number): void {
    const newLine: IAttachments2LinesQuery = {
      absEntry          : 0,
      trgtPath          : '',
      fileName          : '',
      fileExt           : '',
      date              : null,
      file              : '',
      record            : 1,
    };

    // 🔥 Crear nueva referencia
    this.modeloLinesAttachments = [
      ...this.modeloLinesAttachments.slice(0, index),
      newLine,
      ...this.modeloLinesAttachments.slice(index)
    ];

    this.updateHasValidLinesAttachments();
  }

  private updateHasValidLinesAttachments(): void {
    this.hasValidLinesAttachments =
      this.modeloLinesAttachmentsEliminate.length > 0 ||
      this.modeloLinesAttachments.every(line => !this.hasDataAttachments(line)) ||
      !this.hasEmptyLineAttachments();
  }

  //#endregion



  //#region <<< 6. CURRENCY / TIPO CAMBIO >>>

  private fetchTipoCambioRate(currCode: any): Observable<IExchangeRates | null> {
    const docDate: Date = this.modeloFormDoc?.controls['docDate']?.value;
    const currencies      = String(currCode || '').trim().toUpperCase();
    const sysCurrncy    = this.userContextService.getSysCurrncy();

    const params: any = { rateDate: this.utilService.normalizeDateOrToday(docDate), currencies: currencies, sysCurrncy: sysCurrncy };
    return this.exchangeRatesService.getByDocDateAndCurrency(params)
    .pipe(
      map((data: IExchangeRates) => data ?? null),
      catchError(() => of(null))
    );
  }

  get isMainCurrency(): boolean {
    return !this.currencies || this.currencies === '##' || this.currencies === this.mainCurncy;
  }

  get currencyColClass(): string {
    return this.isMainCurrency ? 'col-12 md:col-12' : 'col-12 md:col-6';
  }

  private loadTipoCambio(currCode: any) {
    this.isDisplay = true;
    return this.fetchTipoCambioRate(currCode).pipe(
      takeUntil(this.destroy$),
      tap((data: IExchangeRates | null) => {
        //Determinar tipo de cambio según la moneda seleccionada
        const safeRate  = currCode === this.mainCurncy ? data?.sysRate ?? 0 : data?.rate ?? 0;
        // Tipo de cambio del sistema
        this.sysRate    = data?.sysRate ?? 0;

        const formattedRate = this.utilService.onRedondearDecimalConCero(safeRate, 3);

        this.modeloFormSoc.patchValue({ docRate: formattedRate }, { emitEvent: false });
      }),

      catchError((e) => {
        this.utilService.handleErrorSingle(e, 'loadTipoCambio', this.swaCustomService);
        return of(null);
      }),

      finalize(() => { this.isDisplay = false; })
    );
  }

  private valTipoCambio() {
    const selected  : any     = this.modeloFormSoc.controls['currencies']?.value;
    const rate      : number  = Number(this.modeloFormSoc.controls['docRate'].value) || 0;

    if (!selected)
    {
      this.swaCustomService.swaMsgInfo('Seleccione la moneda.');
      return false;
    }

    const currCode = selected?.value ?? null;

    if (!currCode) return false;

    // Si la moneda es la misma que la moneda principal, el tipo de cambio se debe validar contra sysRate
    if (currCode && currCode.toUpperCase() === String(this.mainCurncy || '').trim().toUpperCase()) {
      if (this.sysRate === 0) {
        this.swaCustomService.swaMsgInfo('Ingrese el tipo de cambio.');
        return false;
      }
    }

    // Si la moneda es diferente a la moneda principal, el tipo de cambio se debe validar contra rate
    if (rate === 0) {
      this.swaCustomService.swaMsgInfo('Ingrese el tipo de cambio.');
      return false;
    }

    return true;
  }

  private refreshAfterCurrencyChange(): void {
    this.loadTipoCambio(this.currencies)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.calculateTotals();
    });
  }

  private wireCurrencyControl(): void {
    this.modeloFormSoc.get('currencies')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(selected => {

      if (!selected) return;

      this.currencies = selected?.value || '';

      this.refreshAfterCurrencyChange(); // 🔥 limpio
    });
  }

  //#endregion



  //#region <<< 7. ADDRESS / LOGÍSTICA >>>

  private wireShipAddressControl(): void {
    this.modeloFormLog.get('shipAddress')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),

      switchMap((selected) => {

        if (!selected) return EMPTY;

        const address = selected.value;

        const linesWithData = this.modeloLines.filter(l => this.hasData(l));

        const hasLines = linesWithData.length > 0;

        return this.loadAddress(this.cardCode, address, 'S').pipe(
          tap((fullAddress: string | null) => {
            if (fullAddress !== null && fullAddress !== undefined) {
              this.modeloFormLog.patchValue(
                { address2: fullAddress },
                { emitEvent: false }
              );
            }
          }),

          switchMap(() => {
            if (!hasLines) {
              return this.loadTaxGroup(this.cardCode, address).pipe(
                tap((taxGroup) => {
                  this.taxCode  = taxGroup?.code ?? '';
                  this.vatPrcnt = taxGroup?.rate ?? 0;
                })
              );
            }

            return from(
              this.swaCustomService.swaConfirmation(
                this.globalConstants.titleChangeTaxGroup,
                this.globalConstants.subTitleChangeTaxGroup,
                this.globalConstants.icoSwalQuestion
              )
            ).pipe(
              switchMap((result: any) => {
                if (!result?.isConfirmed) return EMPTY;
                return this.loadTaxGroup(this.cardCode, address).pipe(
                  tap((taxGroup) => this.applyTaxToDocument(taxGroup))
                );
              })
            );
          }),
          catchError((e) => {
            this.utilService.handleErrorSingle(e, 'wireShipAddressControl', this.swaCustomService);
            return EMPTY;
          })
        );
      })
    )
    .subscribe();
  }

  private wirePayAddressControl(): void {
    this.modeloFormLog.get('payAddress')?.valueChanges
      .pipe(
        takeUntil(this.destroy$),
        filter(selected => !!selected?.value),
        switchMap(selected =>
          this.loadAddress(this.cardCode, selected.value, 'B')
        )
      )
      .subscribe({
        next: (fullAddress: string | null) => {
          if (fullAddress !== null && fullAddress !== undefined) {
            this.modeloFormLog.patchValue(
              { address: this.utilService.normalizePrimitive(fullAddress) },
              { emitEvent: false }
            );

            this.detectRealChanges();
          }
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'wirePayAddressControl', this.swaCustomService);
        }
      });
  }

  private loadAddress(cardCode: string, address: string, adresType: string): Observable<string | null> {
    const params = { cardCode, address, adresType };

    return this.addressesService
    .getByCode(params)
    .pipe(
      takeUntil(this.destroy$),
      map((data: IAddresses) => data?.fullAddress ?? null),
      catchError((e) => {
        this.utilService.handleErrorSingle(e, 'loadAddress', this.swaCustomService);
        return of(null);
      })
    );
  }

  //#endregion



  //#region <<< 8. TAX / IMPUESTOS >>>

  private loadTaxGroup(cardCode: string, address: string): Observable<ITaxGroups | null> {
    const formConValues = this.modeloFormSal.getRawValue();
    const slpCode = formConValues.salesPersons?.value || formConValues.salesPersons || -1;

    const params = { cardCode, address, slpCode };

    return this.taxGroupsService
    .getByCardCode(params)
    .pipe(
      takeUntil(this.destroy$),
      map((data: ITaxGroups) => data ?? null),
      catchError((e) => {
        this.utilService.handleErrorSingle(e, 'loadTaxGroup', this.swaCustomService);
        return of(null);
      })
    );
  }

  private applyTaxToDocument(tax: ITaxGroups | null): void {
    this.taxCode  = tax?.code ?? '';
    this.vatPrcnt = tax?.rate ?? 0;

    // ✅ Refrescar taxCode/vatPrcnt en líneas ya cargadas (si aplica)
    for (let i = 0; i < this.modeloLines.length; i++) {
      const line = this.modeloLines[i];

      const hasData = this.hasData(line);

      if (!hasData) continue;

      line.taxCode  = this.taxCode;
      line.vatPrcnt = this.vatPrcnt;

      this.calculateTotalLine(line, i);
    }

    this.calculateTotals();
  }

  //#endregion



  //#region <<< 9. AGENCY >>>

  onClickCleanAgencia(): void {
    Object.keys(this.modeloFormAge.controls).forEach(key => {
      this.modeloFormAge.get(key)?.setValue('');
    });

    this.u_BPP_MDCT = '';
  }

  onSelectedAgencia(value) {
    // garantizar orden: limpiar controles primero, luego iniciar la carga
    this.onClickCleanAgencia();

    // cancelar cualquier carga previa pendiente
    if (this.agenciaLoadSubscription) {
      this.agenciaLoadSubscription.unsubscribe();
      this.agenciaLoadSubscription = null;
    }

    // iniciar nueva carga y guardar la suscripción para posible cancelación
    this.agenciaLoadSubscription = this.loadAgenciaByCode(value.cardCode)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.detectRealChanges();
    });
  }

  private loadAgenciaByCode(cardCode: string): Observable<any> {
    this.isDisplay = true;
    return this.businessPartnersService
    .getByCode(cardCode).pipe(
      takeUntil(this.destroy$),
      tap(agencia => {
        this.u_BPP_MDCT    = agencia.cardCode;
        this.modeloFormAge.patchValue({ 'u_BPP_MDCT': agencia.cardCode, 'u_BPP_MDRT': agencia.licTradNum, 'u_BPP_MDNT': agencia.cardName }, { emitEvent: false });
      }),
      map((agencia: IBusinessPartnersQuery) => ({
        agencia,
        shipAddr: agencia.shipAddressLines ?? []
      })),
      // Actualizamos listas y preselecciones sin disparar eventos
      tap(({ shipAddr, agencia }) => {
        this.agencyAddressList = (shipAddr || []).map(d => ({ label: d.address, value: d.address }));

        // Selección por defecto de direcciones y otros campos
        const defaultShipItem = this.agencyAddressList.find(it => it.value === agencia.shipToDef) || null;
        if (defaultShipItem) {
          this.modeloFormAge.patchValue({ agencyAddress: defaultShipItem }, { emitEvent: false });
        }
      }),
      // Encadenar las cargas dependientes y esperar a que terminen
      switchMap(({ shipAddr, agencia }) => {
        const tasks: Observable<any>[] = [];

        const defaultShip = (shipAddr || []).find((d: IAddresses) => d.address === agencia.shipToDef);
        if (defaultShip) {
          tasks.push(
            this.loadAddressAgency(agencia.cardCode, agencia.shipToDef, 'S').pipe(
              tap((street: string | null) => {
                if (street !== null && street !== undefined) {
                  this.modeloFormAge.patchValue({ u_BPP_MDDT: street }, { emitEvent: false });
                }
              })
            )
          );
        }

        if (tasks.length === 0) return of({ shipAddr, agencia });
        return forkJoin(tasks).pipe(map(() => ({ shipAddr, agencia })));
      }),
      catchError(e => {
        this.utilService.handleErrorSingle(e, 'loadAgenciaByCode', this.swaCustomService);
        return of(null);
      }),
      finalize(() => { this.isDisplay = false; })
    );
  }

  private loadAddressAgency(cardCode: string, address: string, adresType: string): Observable<string | null> {
    const params = { cardCode, address, adresType };

    return this.addressesService.getByCode(params).pipe(
      takeUntil(this.destroy$),
      map((data: IAddresses) => data?.street ?? null),
      catchError((e) => {
        this.utilService.handleErrorSingle(e, 'loadAddressAgency', this.swaCustomService);
        return of(null);
      })
    );
  }

  private wireAgencyAddressControl(): void {
    this.modeloFormAge.get('agencyAddress')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      filter(selected => !!selected),
      switchMap(selected => {

        const address = selected.value;

        return this.loadAddressAgency(this.u_BPP_MDCT, address, 'S');
      })
    )
    .subscribe({
      next: (street) => {
        if (street !== null && street !== undefined) {
          this.modeloFormAge.patchValue({ u_BPP_MDDT: this.utilService.normalizePrimitive(street) }, { emitEvent: false });

          this.detectRealChanges();
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'wireAgencyAddressControl', this.swaCustomService);
      }
    });
  }

  //#endregion



  //#region <<< 10. CODIGO DE ARTÍCULO >>>

  private validateDocumentBaseData(): boolean {
    const f = this.modeloFormSoc.getRawValue();

    if (!this.h.p(f.cardCode)) {
      this.swaCustomService.swaMsgInfo('Seleccione el cliente.');
      return false;
    }

    const currCode = this.h.p(this.h.v(f.currencies));

    if (!currCode) {
      this.swaCustomService.swaMsgInfo('Seleccione la moneda.');
      return false;
    }

    const isMainCurrency =
      currCode.toUpperCase() === this.h.p(this.mainCurncy).toUpperCase();

    const rate = isMainCurrency
      ? this.h.n(this.sysRate)
      : this.h.n(f.docRate);

    if (rate === 0) {
      this.swaCustomService.swaMsgInfo('Ingrese el tipo de cambio.');
      return false;
    }

    return true;
  }

  onClickOpenArticulo(index: number) {
    if (!this.validateDocumentBaseData()) return;
    this.indexArticulo = index;
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  onClickSelectedArticulo(value: IArticulo) {
    this.getListByCode(value.itemCode, this.indexArticulo);
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  onClickCloseArticulo()
  {
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  private mapToOrderLine(element: any): IOrdenVenta1Query {
    const f           = this.modeloFormSoc.getRawValue();

    return {
      itemCode       : this.h.p(element.itemCode),
      dscription     : this.h.p(element.itemName),
      whsCode        : this.h.p(element.dfltWH),
      unitMsr        : this.h.p(element.salUnitMsr),
      onHand         : this.h.n(element.onHand),
      currency       : this.h.p(this.h.v(f.currencies)),
      priceBefDi     : this.h.n(element.priceBefDi),
      discPrcnt      : this.h.n(element.discPrcnt),
      price          : this.h.n(element.price),
      taxCode        : this.h.p(this.taxCode),
      vatPrcnt       : this.h.n(this.vatPrcnt),
      u_tipoOpT12    : this.h.p(element.u_tipoOpT12),
      u_tipoOpT12Nam : this.h.p(element.u_tipoOpT12Nam),
      quantity       : 1,
      openQty        : 1,
    };
  }

  private setItem(data: any, index: number): void {
    const element = data[0];

    const newItem = this.utilService.mapLine(
      this.mapToOrderLine(element)
    );

    this.modeloLines = this.modeloLines.map((line, i) => {
      if (i !== index) return line;

      return {
        ...line,
        ...newItem,
        record: line.record === 1 ? 1 : 2,
        isItemCodeValidated: true,
        validatedItemCode: newItem.itemCode
      };
    });

    this.calculateTotalLine(this.modeloLines[index], index);
    this.calculateTotals();

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  getListByCode(itemCode: string, index: number): void {
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

        this.setItem(data, index);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListByCode', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(itemCode: string): ItemsFindByListCodeModel {

    return {
      itemCode,
      cardCode            : this.modeloFormSoc.get('cardCode')?.value ?? '',
      currency            : this.currencies,
      operationTypeCode   : '01',
      warehouseType       : 'P'
    };
  }


  //======================================================================================
  // COPIAR Y PEGAR
  //======================================================================================
  onItemCodeChange(modelo: IOrdenVenta1Query): void {
    const itemCode = String(modelo.itemCode ?? '').trim();
    const validatedItemCode = String((modelo as any).validatedItemCode ?? '').trim();

    (modelo as any).isItemCodeValidated = itemCode === validatedItemCode;
  }

  async onEnterItemCode(event: KeyboardEvent, modelo: IOrdenVenta1Query, index: number): Promise<void> {
    event.preventDefault();

    if (!this.validateDocumentBaseData()) {
      modelo.itemCode = this.h.p((modelo as any).validatedItemCode);
      this.focusInput('itemCode', index);
      return;
    }

    await this.onBlurItemCode(modelo, index);
  }

  async onBlurItemCode(modelo: IOrdenVenta1Query, index: number): Promise<void> {
    if (this.isShowingLineValidationMessage) return;
    if (this.isPastingItemCodes) return;

    const itemCode = this.h.p(modelo.itemCode);
    const validatedItemCode = this.h.p((modelo as any).validatedItemCode);

    if (!itemCode) return;

    if ((modelo as any).isItemCodeValidated && itemCode === validatedItemCode) return;

    if (!this.validateDocumentBaseData()) {
      modelo.itemCode = validatedItemCode;
      this.focusInput('itemCode', index);
      return;
    }

    const exists = await this.getListByCodeAsync(itemCode, index);

    if (!exists) {
      this.clearLineKeepItemCode(index, itemCode);
      this.focusInput('itemCode', index);
      return;
    }

    this.reindexLines();
    this.updateHasValidLines();
    this.calculateTotals();
  }

  private clearLineKeepItemCode(index: number, itemCode: string): void {
    this.modeloLines[index] = {
      ...this.createEmptyLine(),
      lineNum: index,
      itemCode,
      isItemCodeValidated: false,
      validatedItemCode: ''
    } as any;

    this.updateHasValidLines();
    this.calculateTotals();
  }

  private getListByCodeAsync(itemCode: string, index: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.itemsService
        .getListByCode(this.buildFilterParams(itemCode))
        .pipe(
          takeUntil(this.destroy$),
          catchError((e) => {
            this.utilService.handleErrorSingle(e, 'getListByCodeAsync', this.swaCustomService);
            return of([]);
          })
        )
        .subscribe((data: any[]) => {
          if (!data || data.length === 0) {
            this.swaCustomService.swaMsgError(`No existe el código: ${itemCode}`);
            resolve(false);
            return;
          }

          this.setItem(data, index);
          resolve(true);
        });
    });
  }

  async onPasteItemCodes(event: ClipboardEvent, rowIndex: number): Promise<void> {
    const text = event.clipboardData?.getData('text') ?? '';

    const itemCodes = text
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(x => x !== '');

    if (itemCodes.length === 0) return;

    if (!this.validateDocumentBaseData()) {
      this.focusInput('itemCode', rowIndex);
      return;
    }

    event.preventDefault();

    this.isPastingItemCodes = true;

    try {
      let currentIndex = rowIndex;

      for (let i = 0; i < itemCodes.length; i++) {
        const itemCode = itemCodes[i];

        this.modeloLines[currentIndex].itemCode = itemCode;
        this.focusInput('itemCode', currentIndex);

        const exists = await this.getListByCodeAsync(itemCode, currentIndex);

        if (!exists) {
          this.clearLineKeepItemCode(currentIndex, itemCode);
          this.focusInput('itemCode', currentIndex);
          return;
        }

        this.reindexLines();
        this.updateHasValidLines();
        this.calculateTotals();

        const isLastItem = i === itemCodes.length - 1;

        if (!isLastItem) {
          this.insertLine(currentIndex + 1);
          currentIndex++;
          this.focusInput('itemCode', currentIndex);

          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }
    } finally {
      this.isPastingItemCodes = false;
    }
  }

  //#endregion



  //#region <<< 10. DESCRIPCIÓN DE ARTÍCULO >>>

  onChangeDescriptions(value: IOrdenVenta1Query) {
    if (!this.validateDocumentBaseData()) {

      // ✅ Si es nueva línea, limpiar
      if (value.record === 1) {
        value.dscription = '';
        return;
      }

      // ✅ Si es línea existente (record=2), restaurar texto original
      if (value.record === 2) {
        const original = (this.initialSnapshot?.lines || [])
          .find((x: any) => x.lineNum === value.lineNum); // <-- usa tu key real

        if (original) {
          value.dscription = original.dscription ?? '';
        }

        return;
      }

      return;
    }

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }


  //======================================================================================
  // COPIAR Y PEGAR
  //======================================================================================
  async onPasteDescriptions(event: ClipboardEvent, rowIndex: number): Promise<void> {
    const text = event.clipboardData?.getData('text') ?? '';

    const descriptions = text
      .split(/\r?\n/)
      .map(x => this.h.p(x))
      .filter(x => x !== '');

    if (descriptions.length === 0) return;

    event.preventDefault();

    this.isPastingDescriptions = true;

    try {
      let currentIndex = rowIndex;

      for (let i = 0; i < descriptions.length; i++) {
        const line = this.modeloLines[currentIndex];

        if (!line) {
          this.insertLine(currentIndex);
        }

        this.modeloLines[currentIndex].dscription = descriptions[i];

        this.calculateTotalLine(this.modeloLines[currentIndex], currentIndex);

        const isLast = i === descriptions.length - 1;

        if (!isLast) {
          currentIndex++;

          if (!this.modeloLines[currentIndex]) {
            this.insertLine(currentIndex);
          }

          this.focusInput('dscription', currentIndex);

          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }

      this.reindexLines();
      this.updateHasValidLines();
      this.calculateTotals();
    } finally {
      this.isPastingDescriptions = false;
    }
  }
  //#endregion



  //#region <<< 11. CUENTA CONTABLE >>>

  onClickOpenCuentaContable(index: number): void {
    this.indexCentroCuentaContable  = index;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  onClickSelectedCuentaContable(value: any): void {
    const f = this.modeloFormSoc.getRawValue();

    const line = this.modeloLines[this.indexCentroCuentaContable];

    line.acctCode               = value.acctCode;
    line.formatCode             = value.formatCode;
    line.acctName               = value.acctName;
    line.currency               = this.h.p(this.h.v(f.currencies));
    line.taxCode                = this.taxCode;
    line.vatPrcnt               = this.vatPrcnt;
    line.isFormatCodeValidated  = true;
    line.validatedFormatCode    = value.formatCode;

    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseCuentaContable(): void {
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }



  //======================================================================================
  // COPIAR Y PEGAR
  //======================================================================================
  onFormatCodeChange(modelo: IOrdenVenta1Query): void {
    const formatCode = String((modelo as any).formatCode ?? '').trim();
    const validatedFormatCode = String((modelo as any).validatedFormatCode ?? '').trim();

    (modelo as any).isFormatCodeValidated = formatCode === validatedFormatCode;
  }

  async onEnterFormatCode(event: KeyboardEvent, modelo: IOrdenVenta1Query, index: number): Promise<void> {
    event.preventDefault();
    await this.onBlurFormatCode(modelo, index);
  }

  async onBlurFormatCode(modelo: IOrdenVenta1Query, index: number): Promise<void> {
    if (this.isShowingLineValidationMessage) return;
    if (this.isPastingFormatCodes) return;

    const formatCode = this.h.p((modelo as any).formatCode);
    const dscription = this.h.p(modelo.dscription);
    const validatedFormatCode = this.h.p((modelo as any).validatedFormatCode);

    if (!formatCode) return;

    if (!dscription) {
      (modelo as any).formatCode = validatedFormatCode;
      await this.showLineValidationMessage('No puede asignar cuenta contable a una línea sin descripción.');
      return;
    }

    if ((modelo as any).isFormatCodeValidated && formatCode === validatedFormatCode) return;

    const exists = await this.getChartOfAccountsByFormatCodeAsync(formatCode, index);

    if (!exists) {
      this.clearLineKeepFormatCode(index, formatCode);
      this.focusInput('formatCode', index);
      return;
    }

    this.reindexLines();
    this.updateHasValidLines();
    this.calculateTotals();
  }

  private getChartOfAccountsByFormatCodeAsync(formatCode: string, index: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.chartOfAccountsService
        .getByFormatCode(formatCode)
        .pipe(
          takeUntil(this.destroy$),
          catchError((e) => {
            this.utilService.handleErrorSingle(e, 'getChartOfAccountsByFormatCodeAsync', this.swaCustomService);
            return of(null);
          })
        )
        .subscribe((data: any) => {
          if (!data) {
            this.swaCustomService.swaMsgError(`No existe la cuenta contable: ${formatCode}`);
            resolve(false);
            return;
          }

          this.modeloLines[index] = {
            ...this.modeloLines[index],
            acctCode: data.acctCode ?? '',
            formatCode: data.formatCode ?? formatCode,
            acctName: data.acctName ?? '',
            isFormatCodeValidated: true,
            validatedFormatCode: data.formatCode ?? formatCode
          } as any;

          resolve(true);
        });
    });
  }

  private clearLineKeepFormatCode(index: number, formatCode: string): void {
    this.modeloLines[index] = {
      ...this.modeloLines[index],
      acctCode: '',
      formatCode,
      acctName: '',
      isFormatCodeValidated: false,
      validatedFormatCode: ''
    } as any;

    this.updateHasValidLines();
    this.calculateTotals();
  }

  async onPasteFormatCodes(event: ClipboardEvent, rowIndex: number): Promise<void> {
    const text = event.clipboardData?.getData('text') ?? '';

    const formatCodes = text
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(x => x !== '');

    if (formatCodes.length === 0) return;

    event.preventDefault();

    this.isPastingFormatCodes = true;

    try {
      let currentIndex = rowIndex;

      for (let i = 0; i < formatCodes.length; i++) {
        const formatCode = formatCodes[i];
        const line = this.modeloLines[currentIndex];

        if (!line) return;

        const dscription = String(line.dscription ?? '').trim();

        if (!dscription) {
          this.swaCustomService.swaMsgInfo('No puede asignar cuenta contable a una línea sin descripción.');
          this.focusInput('formatCode', currentIndex);
          return;
        }

        (line as any).formatCode = formatCode;
        this.focusInput('formatCode', currentIndex);

        const exists = await this.getChartOfAccountsByFormatCodeAsync(formatCode, currentIndex);

        if (!exists) {
          this.updateHasValidLines();
          this.focusInput('formatCode', currentIndex);
          return;
        }

        this.reindexLines();
        this.updateHasValidLines();
        this.calculateTotals();

        const isLastFormatCode = i === formatCodes.length - 1;

        if (!isLastFormatCode) {
          const nextIndex = currentIndex + 1;
          const nextLine = this.modeloLines[nextIndex];

          if (!nextLine) return;

          const nextDscription = String(nextLine.dscription ?? '').trim();

          if (!nextDscription) {
            this.swaCustomService.swaMsgInfo('No puede continuar. La siguiente línea no tiene descripción.');
            this.focusInput('formatCode', currentIndex);
            return;
          }

          currentIndex = nextIndex;
          this.focusInput('formatCode', currentIndex);

          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }
    } finally {
      this.isPastingFormatCodes = false;
    }
  }

  //#endregion



  //#region <<< 12. ALMACÉN >>>

  onClickOpenAlmacen(index: number) {
    this.indexAlmacen = index;
    this.itemCode = this.modeloLines[this.indexAlmacen].itemCode;
    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;
  }

  onClickSelectedAlmacen(value: IWarehouses) {
    const line = this.modeloLines[this.indexAlmacen];

    line.whsCode              = value.whsCode;
    line.isWhsCodeValidated   = true;
    line.validatedWhsCode     = value.whsCode;

    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseAlmacen()
  {
    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;
  }


  //======================================================================================
  // COPIAR Y PEGAR
  //======================================================================================
  onWhsCodeChange(modelo: IOrdenVenta1Query): void {
  const whsCode = String(modelo.whsCode ?? '').trim();
  const validatedWhsCode = String((modelo as any).validatedWhsCode ?? '').trim();

  (modelo as any).isWhsCodeValidated = whsCode === validatedWhsCode;
  }

  async onEnterWhsCode(event: KeyboardEvent, modelo: IOrdenVenta1Query, index: number): Promise<void> {
    event.preventDefault();
    await this.onBlurWhsCode(modelo, index);
  }

  async onBlurWhsCode(modelo: IOrdenVenta1Query, index: number): Promise<void> {
    if (this.isShowingLineValidationMessage) return;
    if (this.isPastingWhsCodes) return;

    const whsCode = this.h.p(modelo.whsCode);
    const itemCode = this.h.p(modelo.itemCode);
    const validatedWhsCode = this.h.p((modelo as any).validatedWhsCode);

    if (!whsCode) return;

    if (!itemCode) {
      modelo.whsCode = validatedWhsCode;
      await this.showLineValidationMessage('No puede asignar almacén a una línea sin artículo.');
      return;
    }

    if ((modelo as any).isWhsCodeValidated && whsCode === validatedWhsCode) return;

    const exists = await this.getWarehouseByCodeAsync(whsCode, index);

    if (!exists) {
      this.clearLineKeepWhsCode(index, whsCode);
      //this.focusWhsCode(index);
      this.focusInput('whsCode', index);
      return;
    }

    this.reindexLines();
    this.updateHasValidLines();
    this.calculateTotals();
  }

  private clearLineKeepWhsCode(index: number, whsCode: string): void {
    this.modeloLines[index] = {
      ...this.modeloLines[index],
      whsCode,
      isWhsCodeValidated: false,
      validatedWhsCode: ''
    } as any;

    this.updateHasValidLines();
    this.calculateTotals();
  }

  private getWarehouseByCodeAsync(whsCode: string, index: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.warehousesService
        .getByCode(whsCode)
        .pipe(
          takeUntil(this.destroy$),
          catchError((e) => {
            this.utilService.handleErrorSingle(e, 'getWarehouseByCodeAsync', this.swaCustomService);
            return of(null);
          })
        )
        .subscribe((data: any) => {
          if (!data) {
            this.swaCustomService.swaMsgError(`No existe el almacén: ${whsCode}`);
            resolve(false);
            return;
          }

          this.modeloLines[index].whsCode = data.whsCode ?? whsCode;

          (this.modeloLines[index] as any).isWhsCodeValidated = true;
          (this.modeloLines[index] as any).validatedWhsCode = data.whsCode ?? whsCode;

          resolve(true);
        });
    });
  }

  async onPasteWhsCodes(event: ClipboardEvent, rowIndex: number): Promise<void> {
    const text = event.clipboardData?.getData('text') ?? '';

    const whsCodes = text
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(x => x !== '');

    if (whsCodes.length === 0) return;

    event.preventDefault();

    this.isPastingWhsCodes = true;

    try {
      let currentIndex = rowIndex;

      for (let i = 0; i < whsCodes.length; i++) {
        const whsCode = whsCodes[i];
        const line = this.modeloLines[currentIndex];

        if (!line) return;

        const itemCode = String(line.itemCode ?? '').trim();

        if (!itemCode) {
          this.swaCustomService.swaMsgInfo('No puede asignar almacén a una línea sin artículo.');
          this.focusInput('whsCode', currentIndex);
          return;
        }

        line.whsCode = whsCode;
        this.focusInput('whsCode', currentIndex);

        const exists = await this.getWarehouseByCodeAsync(whsCode, currentIndex);

        if (!exists) {
          this.updateHasValidLines();
          this.focusInput('whsCode', currentIndex);
          return;
        }

        this.reindexLines();
        this.updateHasValidLines();
        this.calculateTotals();

        const isLastWhsCode = i === whsCodes.length - 1;

        if (!isLastWhsCode) {
          const nextIndex = currentIndex + 1;
          const nextLine = this.modeloLines[nextIndex];

          if (!nextLine) return;

          const nextItemCode = String(nextLine.itemCode ?? '').trim();

          if (!nextItemCode) {
            this.swaCustomService.swaMsgInfo('No puede continuar. La siguiente línea no tiene artículo.');
            this.focusInput('whsCode', currentIndex);
            return;
          }

          currentIndex = nextIndex;
          this.focusInput('whsCode', currentIndex);

          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }
    } finally {
      this.isPastingWhsCodes = false;
    }
  }

  //#endregion



  //#region <<< 19. CANTIDAD >>>

  onChangeQuantity(value: IOrdenVenta1Query, index: number)
  {
    this.calculateTotalLine(value, index);
    this.calculateTotals();

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }


  //======================================================================================
  // COPIAR Y PEGAR
  //======================================================================================
  async onEnterQuantity(event: KeyboardEvent, modelo: IOrdenVenta1Query, index: number): Promise<void> {
    event.preventDefault();
    await this.onBlurQuantity(modelo, index);
  }

  async onBlurQuantity(modelo: IOrdenVenta1Query, index: number): Promise<void> {
    if (this.isShowingLineValidationMessage) return;
    if (this.isPastingQuantities) return;

    const itemCode = this.h.p(modelo.itemCode);

    if (!itemCode) {
      modelo.quantity = 0;
      await this.showLineValidationMessage('No puede asignar cantidad a una línea sin artículo.');
      return;
    }

    this.calculateTotalLine(modelo, index);
    this.calculateTotals();
  }

  async onPasteQuantities(event: ClipboardEvent, rowIndex: number): Promise<void> {
    const text = event.clipboardData?.getData('text') ?? '';

    const quantities = text
      .split(/\r?\n/)
      .map(x => x.trim())
      .filter(x => x !== '');

    if (quantities.length === 0) {
      return;
    }

    event.preventDefault();

    this.isPastingQuantities = true;

    try {

      let currentIndex = rowIndex;

      for (let i = 0; i < quantities.length; i++) {

        const quantity = Number(quantities[i]);

        const line = this.modeloLines[currentIndex];

        if (!line) {
          return;
        }

        const itemCode = String(line.itemCode ?? '').trim();

        if (!itemCode) {

          this.swaCustomService.swaMsgInfo(
            'No puede continuar. La línea no tiene artículo.'
          );

          //this.focusQuantity(currentIndex);
          this.focusInput('quantity', currentIndex);
          return;
        }

        line.quantity = isNaN(quantity) ? 0 : quantity;

        this.calculateTotalLine(line, currentIndex);

        const isLast = i === quantities.length - 1;

        if (!isLast) {

          const nextIndex = currentIndex + 1;
          const nextLine = this.modeloLines[nextIndex];

          if (!nextLine) {

            this.swaCustomService.swaMsgInfo(
              'No existen más líneas para asignar cantidades.'
            );

            return;
          }

          const nextItemCode = String(nextLine.itemCode ?? '').trim();

          if (!nextItemCode) {

            this.swaCustomService.swaMsgInfo(
              'No puede continuar. La siguiente línea no tiene artículo.'
            );

            //this.focusQuantity(currentIndex);
            this.focusInput('quantity', currentIndex);
            return;
          }

          currentIndex = nextIndex;

          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }

      this.calculateTotals();

    }
    finally {
      this.isPastingQuantities = false;
    }
  }

  //#endregion



  //#region <<< 20. PRECIO >>>

  onChangePrice(value: IOrdenVenta1Query, index: number)
  {
    this.calculateTotalLine(value, index);
    this.calculateTotals();

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }


  //======================================================================================
  // COPIAR Y PEGAR
  //======================================================================================
  async onEnterPrice(event: KeyboardEvent, modelo: IOrdenVenta1Query, index: number): Promise<void> {
    event.preventDefault();
    await this.onBlurPrice(modelo, index);
  }

  async onBlurPrice(modelo: IOrdenVenta1Query, index: number): Promise<void> {
    if (this.isShowingLineValidationMessage) return;
    if (this.isPastingPrices) return;

    if (!this.validateLineForPrice(modelo, index)) {
      modelo.priceBefDi = 0;
      return;
    }

    this.calculateTotalLine(modelo, index);
    this.calculateTotals();
  }

  private validateLineForPrice(modelo: IOrdenVenta1Query, index: number): boolean {
    const f = this.modeloFormCon.getRawValue();

    const docTypes    = this.h.p(this.h.v(f.docTypes));
    const itemCode   = this.h.p(modelo.itemCode);
    const dscription = this.h.p(modelo.dscription);

    if (docTypes === 'I' && !itemCode) {
      this.showLineValidationMessage('No puede asignar precio a una línea sin artículo.');
      return false;
    }

    if (docTypes === 'S' && !dscription) {
      this.showLineValidationMessage('No puede asignar precio a una línea sin descripción.');
      return false;
    }

    return true;
  }

  async onPastePrices(event: ClipboardEvent, rowIndex: number): Promise<void> {
    const text = event.clipboardData?.getData('text') ?? '';

    const prices = text
      .split(/\r?\n/)
      .map(x => this.h.p(x))
      .filter(x => x !== '');

    if (prices.length === 0) return;

    event.preventDefault();

    this.isPastingPrices = true;

    try {
      let currentIndex = rowIndex;

      for (let i = 0; i < prices.length; i++) {
        const line = this.modeloLines[currentIndex];

        if (!line) return;

        if (!this.validateLineForPrice(line, currentIndex)) {
          this.focusInput('priceBefDi', currentIndex);
          return;
        }

        const price = this.h.n(prices[i]);

        line.priceBefDi = price;

        this.calculateTotalLine(line, currentIndex);

        const isLast = i === prices.length - 1;

        if (!isLast) {
          const nextIndex = currentIndex + 1;
          const nextLine = this.modeloLines[nextIndex];

          if (!nextLine) {
            this.swaCustomService.swaMsgInfo('No existen más líneas para asignar precios.');
            return;
          }

          if (!this.validateLineForPrice(nextLine, nextIndex)) {
            this.focusInput('priceBefDi', currentIndex);
            return;
          }

          currentIndex = nextIndex;

          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }

      this.calculateTotals();
    } finally {
      this.isPastingPrices = false;
    }
  }

  //#endregion



  //#region <<< 13. IMPUESTO >>>

  onClickOpenImpuesto(index: number) {
    this.indexImpuesto = index;
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  onClickSelectedImpuesto(value: ITaxGroups) {
    const line = this.modeloLines[this.indexImpuesto];

    line.taxCode              = value.code;
    line.vatPrcnt             = value.rate;
    line.isTaxCodeValidated   = true;
    line.validatedTaxCode     = value.code;

    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;

    this.calculateTotalLine(this.modeloLines[this.indexImpuesto], this.indexImpuesto);
    this.calculateTotals();

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseImpuesto()
  {
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }


  //======================================================================================
  // COPIAR Y PEGAR
  //======================================================================================
  onTaxCodeChange(modelo: IOrdenVenta1Query): void {
    const taxCode = this.h.p(modelo.taxCode);
    const validatedTaxCode = this.h.p((modelo as any).validatedTaxCode);

    (modelo as any).isTaxCodeValidated = taxCode === validatedTaxCode;
  }

  async onEnterTaxCode(event: KeyboardEvent, modelo: IOrdenVenta1Query, index: number): Promise<void> {
    event.preventDefault();
    await this.onBlurTaxCode(modelo, index);
  }

  async onBlurTaxCode(modelo: IOrdenVenta1Query, index: number): Promise<void> {
    if (this.isShowingLineValidationMessage) return;
    if (this.isPastingTaxCodes) return;

    const taxCode = this.h.p(modelo.taxCode);
    const validatedTaxCode = this.h.p((modelo as any).validatedTaxCode);

    if (!taxCode) return;

    if (!this.validateLineForTax(modelo, index)) {
      modelo.taxCode = validatedTaxCode;
      return;
    }

    if ((modelo as any).isTaxCodeValidated && taxCode === validatedTaxCode) return;

    const exists = await this.getTaxByCodeAsync(taxCode, index);

    if (!exists) {
      this.clearLineKeepTaxCode(index, taxCode);
      this.focusInput('taxCode', index);
      return;
    }

    this.reindexLines();
    this.updateHasValidLines();
    this.calculateTotalLine(this.modeloLines[index], index);
    this.calculateTotals();
  }

  private clearLineKeepTaxCode(index: number, taxCode: string): void {
    this.modeloLines[index] = {
      ...this.modeloLines[index],
      taxCode,
      vatPrcnt: 0,
      isTaxCodeValidated: false,
      validatedTaxCode: ''
    } as any;

    this.calculateTotalLine(this.modeloLines[index], index);
    this.updateHasValidLines();
    this.calculateTotals();
  }

  private getTaxByCodeAsync(taxCode: string, index: number): Promise<boolean> {
    return new Promise((resolve) => {
      this.taxGroupsService
        .getByCode(taxCode)
        .pipe(
          takeUntil(this.destroy$),
          catchError((e) => {
            this.utilService.handleErrorSingle(e, 'getTaxByCodeAsync', this.swaCustomService);
            return of(null);
          })
        )
        .subscribe((data: any) => {
          if (!data) {
            this.swaCustomService.swaMsgError(`No existe el impuesto: ${taxCode}`);
            resolve(false);
            return;
          }

          this.modeloLines[index].taxCode = data.code ?? taxCode;
          this.modeloLines[index].vatPrcnt = data.rate ?? 0;

          (this.modeloLines[index] as any).isTaxCodeValidated = true;
          (this.modeloLines[index] as any).validatedTaxCode = data.code ?? taxCode;

          this.calculateTotalLine(this.modeloLines[index], index);
          this.calculateTotals();

          resolve(true);
        });
    });
  }

  async onPasteTaxCodes(event: ClipboardEvent, rowIndex: number): Promise<void> {
    const text = event.clipboardData?.getData('text') ?? '';

    const taxCodes = text
      .split(/\r?\n/)
      .map(x => this.h.p(x))
      .filter(x => x !== '');

    if (taxCodes.length === 0) return;

    event.preventDefault();

    this.isPastingTaxCodes = true;

    try {
      let currentIndex = rowIndex;

      for (let i = 0; i < taxCodes.length; i++) {
        const taxCode = taxCodes[i];
        const line = this.modeloLines[currentIndex];

        if (!line) return;

        if (!this.validateLineForTax(line, currentIndex)) {
          return;
        }

        line.taxCode = taxCode;
        this.focusInput('taxCode', currentIndex);

        const exists = await this.getTaxByCodeAsync(taxCode, currentIndex);

        if (!exists) {
          this.updateHasValidLines();
          this.focusInput('taxCode', currentIndex);
          return;
        }

        this.reindexLines();
        this.updateHasValidLines();
        this.calculateTotalLine(this.modeloLines[currentIndex], currentIndex);
        this.calculateTotals();

        const isLastTaxCode = i === taxCodes.length - 1;

        if (!isLastTaxCode) {
          const nextIndex = currentIndex + 1;
          const nextLine = this.modeloLines[nextIndex];

          if (!nextLine) return;

          if (!this.validateLineForTax(nextLine, nextIndex)) {
            return;
          }

          currentIndex = nextIndex;
          this.focusInput('taxCode', currentIndex);

          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }
    } finally {
      this.isPastingTaxCodes = false;
    }
  }

  private validateLineForTax(modelo: IOrdenVenta1Query, index: number): boolean {
    const f = this.modeloFormCon.getRawValue();

    const docTypes = this.h.p(this.h.v(f.docTypes));
    const itemCode = this.h.p(modelo.itemCode);
    const dscription = this.h.p(modelo.dscription);

    if (docTypes === 'I' && !itemCode) {
      this.showLineValidationMessage('No puede asignar impuesto a una línea sin artículo.');
      return false;
    }

    if (docTypes === 'S' && !dscription) {
      this.showLineValidationMessage('No puede asignar impuesto a una línea sin descripción.');
      return false;
    }

    return true;
  }

  //#endregion



  //#region <<< 22. TIPO DE OPERACIÓN >>>

  onClickOpenTipoOperacion(index: number) {
    this.indexTipoOperacion = index;
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }

  onClickSelectedTipoOperacion(value: IOperationsTypes) {
    const line = this.modeloLines[this.indexTipoOperacion];

    line.u_tipoOpT12              = value.code;
    line.u_tipoOpT12Nam           = value.fullDescr;
    line.isOperationTypeValidated = true;
    line.validatedOperationType   = value.fullDescr;

    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }

  onClickCloseTipoOperacion()
  {
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }


  //======================================================================================
  // COPIAR Y PEGAR
  //======================================================================================
  private normalizeOperationTypeCode(value: string): string {
    const text = String(value ?? '').trim();

    if (!text) return '';

    return text
      .split('-')[0]
      .trim();
  }

  onOperationTypeChange(modelo: IOrdenVenta1Query): void {
  const operationType = String((modelo as any).u_tipoOpT12Nam ?? '').trim();
  const validatedOperationType = String((modelo as any).validatedOperationType ?? '').trim();

  (modelo as any).isOperationTypeValidated = operationType === validatedOperationType;
  }

  async onEnterOperationType(event: KeyboardEvent, modelo: IOrdenVenta1Query, index: number): Promise<void> {
    event.preventDefault();
    await this.onBlurOperationType(modelo, index);
  }

  async onBlurOperationType(modelo: IOrdenVenta1Query, index: number): Promise<void> {
    if (this.isShowingLineValidationMessage) return;
    if (this.isPastingOperationTypes) return;

    const value = this.h.p((modelo as any).u_tipoOpT12Nam);
    const code = this.normalizeOperationTypeCode(value);
    const validatedOperationType = this.h.p((modelo as any).validatedOperationType);

    if (!code) return;

    if (!this.validateOperationTypeLine(modelo)) {
      (modelo as any).u_tipoOpT12Nam = validatedOperationType;
      this.focusInput('u_tipoOpT12Nam', index);
      return;
    }

    if ((modelo as any).isOperationTypeValidated && value === validatedOperationType) return;

    const data = await this.getOperationTypeByCodeAsync(code, index);

    if (!data) {
      this.clearLineKeepOperationType(index);
      this.focusInput('u_tipoOpT12Nam', index);
      return;
    }

    this.reindexLines();
    this.updateHasValidLines();
    this.calculateTotals();
  }

  private validateOperationTypeLine(modelo: IOrdenVenta1Query): boolean {
    if (this.isItem) {
      const itemCode = this.h.p(modelo.itemCode);

      if (!itemCode) {
        this.swaCustomService.swaMsgInfo('No puede asignar tipo de operación a una línea sin artículo.');
        return false;
      }
    }

    if (this.isService) {
      const dscription = this.h.p(modelo.dscription);

      if (!dscription) {
        this.swaCustomService.swaMsgInfo('No puede asignar tipo de operación a una línea sin descripción.');
        return false;
      }
    }

    return true;
  }

  private getOperationTypeByCodeAsync(code: string, index: number): Promise<IOperationsTypes | null> {
    return new Promise((resolve) => {
      this.operationsTypesService
        .getByCode(code)
        .pipe(
          takeUntil(this.destroy$),
          catchError((e) => {
            this.utilService.handleErrorSingle(e, 'getOperationTypeByCodeAsync', this.swaCustomService);
            return of(null);
          })
        )
        .subscribe((data: IOperationsTypes | null) => {
          if (!data) {
            this.swaCustomService.swaMsgError(`No existe el tipo de operación: ${code}`);
            resolve(null);
            return;
          }

          this.modeloLines[index] = {
            ...this.modeloLines[index],
            u_tipoOpT12: data.code ?? code,
            u_tipoOpT12Nam: data.fullDescr ?? '',
            isOperationTypeValidated: true,
            validatedOperationType: data.fullDescr ?? code
          } as any;

          resolve(data);
        });
    });
  }

  private clearLineKeepOperationType(index: number): void {
    this.modeloLines[index] = {
      ...this.modeloLines[index],
      u_tipoOpT12: '',
      u_tipoOpT12Nam: '',
      isOperationTypeValidated: false,
      validatedOperationType: ''
    } as any;

    this.updateHasValidLines();
    this.calculateTotals();
  }

  async onPasteOperationTypes(event: ClipboardEvent, rowIndex: number): Promise<void> {
    const text = event.clipboardData?.getData('text') ?? '';

    const codes = text
      .split(/\r?\n/)
      .map(x => this.normalizeOperationTypeCode(x))
      .filter(x => x !== '');

    if (codes.length === 0) return;

    event.preventDefault();

    this.isPastingOperationTypes = true;

    try {
      let currentIndex = rowIndex;

      for (let i = 0; i < codes.length; i++) {
        const code = codes[i];
        const line = this.modeloLines[currentIndex];

        if (!line) return;

        if (!this.validateOperationTypeLine(line)) {
          this.focusInput('u_tipoOpT12Nam', currentIndex);
          return;
        }

        (line as any).u_tipoOpT12Nam = code;
        this.focusInput('u_tipoOpT12Nam', currentIndex);

        const data = await this.getOperationTypeByCodeAsync(code, currentIndex);

        if (!data) {
          this.clearLineKeepOperationType(currentIndex);
          this.focusInput('u_tipoOpT12Nam', currentIndex);
          return;
        }

        this.reindexLines();
        this.updateHasValidLines();
        this.calculateTotals();

        const isLastCode = i === codes.length - 1;

        if (!isLastCode) {
          const nextIndex = currentIndex + 1;
          const nextLine = this.modeloLines[nextIndex];

          if (!nextLine) return;

          currentIndex = nextIndex;
          this.focusInput('u_tipoOpT12Nam', currentIndex);

          await new Promise(resolve => setTimeout(resolve, 80));
        }
      }
    } finally {
      this.isPastingOperationTypes = false;
    }
  }

  //#endregion



  //#region <<< 15. CALCULOS EN LÍNEAS >>>

  onChangeDiscPrcnt(value: IOrdenVenta1Query, index: number)
  {
    this.calculateTotalLine(value, index);
    this.calculateTotals();

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  roundDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  }

  truncateDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.trunc(value * factor) / factor;
  }

  private calculateTotalLine(value: IOrdenVenta1Query, index: number): void {
    let quantity       : number;
    let openQty        : number;
    let u_FIB_OpQtyPkg : number;
    let priceBefDi     : number;
    let discPrcnt      : number;
    let price          : number;
    let lineTotal      : number;
    let vatSum         : number;

    const hasData = this.hasData(value);

    // 1️⃣ Cantidad (ROUND 3)
    quantity = !hasData ? 0 : this.utilService.onRedondearDecimal(value.quantity, 3);

    openQty        = quantity;
    u_FIB_OpQtyPkg = quantity;

    // 2️⃣ Precio base (ROUND 3)
    priceBefDi = value.itemCode === '' ? (this.isItem ? 0 : this.utilService.onRedondearDecimal(value.priceBefDi, 3)) : this.utilService.onRedondearDecimal(value.priceBefDi, 3);

    // 3️⃣ Descuento (ROUND 2)
    discPrcnt = value.itemCode === '' ?  (this.isItem ? 0 : this.utilService.onRedondearDecimal(value.discPrcnt, 2))  : this.utilService.onRedondearDecimal(value.discPrcnt, 2);

    // 4️⃣ Precio tras descuento (ROUND 3) ❗ SAP NO TRUNCA
    const rawPrice = discPrcnt === 0 ? priceBefDi : priceBefDi * (1 - (discPrcnt / 100));

    price = this.utilService.onRedondearDecimal(rawPrice, 3);

    // 5️⃣ Total de línea (ROUND 2)
    lineTotal = this.isItem ? this.utilService.onRedondearDecimal(quantity * price, 2) : this.utilService.onRedondearDecimal(price, 2);

    // 6️⃣ Impuesto (ROUND 2)
    vatSum = this.utilService.onRedondearDecimal((lineTotal * value.vatPrcnt) / 100, 2);

    // 7️⃣ Asignar valores
    const currentLine           = this.modeloLines[index];
    currentLine.quantity        = quantity;
    currentLine.openQty         = openQty;
    currentLine.u_FIB_OpQtyPkg  = u_FIB_OpQtyPkg;
    currentLine.priceBefDi      = priceBefDi;
    currentLine.discPrcnt       = discPrcnt;
    currentLine.price           = price;
    currentLine.lineTotal       = lineTotal;
    currentLine.vatSum          = vatSum;
  }

  private wireDiscountControls(): void {
    const prcntCtrl = this.modeloFormTot.get('discPrcnt');
    const sumCtrl   = this.modeloFormTot.get('discSum');
    if (!prcntCtrl || !sumCtrl) return;

    prcntCtrl.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      const subTotal = this.toNumber(this.modeloFormTot.get('subTotal')?.value);
      let discPrcnt  = this.toNumber(prcntCtrl.value);

      discPrcnt = Math.min(100, Math.max(0, discPrcnt));

      const discSum = this.utilService.onRedondearDecimal(subTotal * (discPrcnt / 100), 2);

      // ✅ Solo actualiza el "otro" campo
      sumCtrl.patchValue(this.utilService.onRedondearDecimalConCero(discSum, 2), { emitEvent: false });

      // ✅ ahora sí recalcula totales
      this.calculateTotals();
    });

    sumCtrl.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      const subTotal = this.toNumber(this.modeloFormTot.get('subTotal')?.value);
      const discSum  = Math.max(0, this.toNumber(sumCtrl.value));

      let discPrcnt = 0;
      if (subTotal > 0) discPrcnt = (discSum / subTotal) * 100;

      discPrcnt = this.utilService.onRedondearDecimal(discPrcnt, 2);
      discPrcnt = Math.min(100, Math.max(0, discPrcnt));

      // ✅ Solo actualiza el "otro" campo
      prcntCtrl.patchValue(this.utilService.onRedondearDecimalConCero(discPrcnt, 2), { emitEvent: false });

      // ✅ ahora sí recalcula totales
      this.calculateTotals();
    });
  }

  private calculateTotals(): void {
    const subTotal   = this.calculateSubTotal();
    const discSum    = this.toNumber(this.modeloFormTot.get('discSum')?.value);
    const discPrcnt  = this.toNumber(this.modeloFormTot.get('discPrcnt')?.value);

    const { vatSumDoc } = this.calculateVat(subTotal, discPrcnt);

    const docTotal = this.calculateDocTotal(subTotal, discSum, vatSumDoc);

    this.patchTotals(subTotal, vatSumDoc, docTotal);
  }

  private calculateSubTotal(): number {
    let subTotal = 0;

    for (const line of this.modeloLines) {
      if (this.hasData(line)) {
        subTotal += Number(line.lineTotal) || 0;
      }
    }

    return this.utilService.onRedondearDecimal(subTotal, 2);
  }

  private calculateVat(subTotal: number, discPrcnt: number): { vatSumDoc: number } {
    const factorExact = 1 - (discPrcnt / 100);
    const factorLine  = this.utilService.onRedondearDecimal(factorExact, 3);

    let sumLineVat   = 0;
    let rawVatDocTot = 0;
    const taxableIdx: number[] = [];

    for (let i = 0; i < this.modeloLines.length; i++) {

      const line     = this.modeloLines[i];
      const vatPrcnt = Number(line.vatPrcnt) || 0;

      if (!this.hasData(line) || vatPrcnt === 0) {
        line.vatSum = 0;
        continue;
      }

      const lineTotal = Number(line.lineTotal) || 0;

      const vatLine0 = this.utilService.onRedondearDecimal((lineTotal * vatPrcnt) / 100, 2);
      const vatLine  = this.utilService.onRedondearDecimal(vatLine0 * factorLine, 2);

      line.vatSum = vatLine;
      sumLineVat += vatLine;

      rawVatDocTot += ((lineTotal * factorExact) * vatPrcnt) / 100;
      taxableIdx.push(i);
    }

    const vatSumDoc = this.utilService.onRedondearDecimal(rawVatDocTot, 2);

    this.adjustVatDifference(vatSumDoc, sumLineVat, taxableIdx);

    return { vatSumDoc };
  }

  private adjustVatDifference(vatSumDoc: number, sumLineVat: number, taxableIdx: number[]): void {

    let diffCents = Math.round((vatSumDoc - sumLineVat) * 100);

    if (diffCents === 0 || taxableIdx.length === 0) return;

    let k = taxableIdx.length - 1;

    while (diffCents !== 0) {

      const idx  = taxableIdx[k];
      const step = diffCents > 0 ? 0.01 : -0.01;

      this.modeloLines[idx].vatSum = this.utilService.onRedondearDecimal(
        (Number(this.modeloLines[idx].vatSum) || 0) + step,
        2
      );

      diffCents += diffCents > 0 ? -1 : 1;

      k--;
      if (k < 0) k = taxableIdx.length - 1;
    }
  }

  private calculateDocTotal(subTotal: number, discSum: number, vatSumDoc: number): number {

    const total = subTotal - discSum + vatSumDoc;

    return this.utilService.onRedondearDecimal(total, 2);
  }

  private patchTotals(subTotal: number, vatSumDoc: number, docTotal: number): void {

    this.modeloFormTot.patchValue({
      subTotal: this.utilService.onRedondearDecimalConCero(subTotal, 2),
      vatSum  : this.utilService.onRedondearDecimalConCero(vatSumDoc, 2),
      docTotal: this.utilService.onRedondearDecimalConCero(docTotal, 2),
    }, { emitEvent: false });
  }

  private toNumber(value: any): number {
    if (value === null || value === undefined) return 0;
    const s = String(value).trim();
    if (!s) return 0;

    // soporta "1,234.56"
    const normalized = s.replace(/,/g, '');
    const n = Number(normalized);
    return isNaN(n) ? 0 : n;
  }

  //#endregion



  //#region <<< 16. IMPORT FILES >>>

  private mapToOrderLineAttachments(file: any): any {
    const p = (v: any) => this.utilService.normalizePrimitive(v);

    const fullName = file.name;
    const index = fullName.lastIndexOf('.');

    const fileName = fullName.substring(0, index);
    const fileExt = fullName.substring(index + 1).toLowerCase();

    const fileAttachments = this.userContextService.getFileAttachments();

    return {
      trgtPath: p(fileAttachments),
      fileName: p(fileName),
      fileExt: fileExt,
      date: new Date()
    };
  }

  private setItemAttachments(file: any, index: number): void {
    const mapped = this.mapToOrderLineAttachments(file);

    this.modeloLinesAttachments = this.modeloLinesAttachments.map((line, i) =>
      i === index
        ? {
            ...line,
            ...mapped,
            file: file
          }
        : line
    );
  }

  onClickSelectedFile(index: number): void {
    if (!this.validateDocumentBaseData()) return;

    this.indexFileUpload = index;
    this.isDisplayUpload = !this.isDisplayUpload;
  }

  onClickUpload(file: any): void {

    this.isDisplayUpload = false;

    const realFile =
    file instanceof File
    ? file
    : file?.files?.[0] || file;


    if (!realFile) return;

    // 🔥 Obtener nombre y extensión
    const fullName = realFile.name;
    const index = fullName.lastIndexOf('.');

    const fileName = fullName.substring(0, index);
    const fileExt = fullName.substring(index + 1).toLowerCase();

    // 🔥 Validar duplicado en modeloLinesAttachments
    const exists = this.modeloLinesAttachments.some(line =>
      line.fileName === fileName && line.fileExt === fileExt
    );

    if (exists) {
      this.swaCustomService.swaMsgInfo('El archivo ya ha sido agregado.');
      return;
    }

    this.setItemAttachments(realFile, this.indexFileUpload);
    this.uploadedFiles.push(realFile);

    this.updateHasValidLinesAttachments();
    this.detectRealChanges();
  }

  //#endregion



  //#region <<< 23. UI HELPERS >>>

  private focusInput(controlName: string, index: number): void {
    setTimeout(() => {
      const input = document.getElementById(`${controlName}-${index}`) as HTMLInputElement;

      if (input) {
        input.focus();
        input.select();
      }
    }, 100);
  }

  private async showLineValidationMessage(message: string): Promise<void> {
    if (this.isShowingLineValidationMessage) return;

    this.isShowingLineValidationMessage = true;

    await this.swaCustomService.swaMsgInfo(message);

    setTimeout(() => {
      this.isShowingLineValidationMessage = false;
    }, 150);
  }

  //#endregion



  //#region <<< 17. LOAD DATA (EDICIÓN) >>>

  private loadData(): Observable<IOrdersQuery | null> {
    return combineLatest([
      this.route.params,
      this.route.queryParams
    ])
    .pipe(
      take(1),

      switchMap(([params, queryParams]) => {
        const id = Number(params['id']);
        const wddStatus = queryParams['wddStatus'] ?? '';

        if (!id) {
          return of(null);
        }

        const request$ =
          wddStatus === 'N'
            ? this.draftsService.getByDocEntry(id)
            : this.ordersService.getByDocEntry(id);

        return request$.pipe(
          tap((data: IOrdersQuery) => {
            this.setFormValues(data);
          }),

          catchError((e) => {
            this.utilService.handleErrorSingle(
              e,
              'loadData',
              this.swaCustomService
            );

            return of(null);
          })
        );
      })
    );
  }

  private setFormValues(value: IOrdersQuery): void {
    this.isLoadingInitialData = true;

    this.setHeaderState(value);
    this.setSocioForm(value);
    this.setDocumentoForm(value);
    this.setCondicionesForm(value);
    this.setDireccionesForm(value);
    this.setAgenciaForm(value);
    this.setExportacionForm(value);
    this.setVendedorForm(value);
    this.setTaxGroup(value);
    this.setTotalesForm(value);
    this.setLines(value);

    this.isLoadingInitialData = false;

    this.setInitialSnapshot();
    this.markFormsAsPristine();

    this.watchChanges();
    this.detectRealChanges();
  }

  private setHeaderState(value: IOrdersQuery): void {
    const statusMap = {
      A: '[Autorizado]',
      P: '[Autorizado]',
      Y: '[Autorizado]',
      N: '[Rechazado]',
      W: '[Pendiente]'
    };

    this.wddStatus  = this.h.p(value.wddStatus);
    this.docStatus  = this.h.p(value.docStatus);
    const statusName = statusMap[this.wddStatus] || '';

    if (this.wddStatus !== '-') {
      this.titulo += ` ${statusName}`;
    }

    this.isLocked     = this.docStatus !== 'O';
    this.docEntry     = value?.docEntry;
    this.cardCode     = this.h.p(value.cardCode);
    this.currencies     = this.h.p(value?.docCur);
    this.cntctCode    = value?.cntctCode;
    this.isInvoice    = this.wddStatus === 'N';
    this.u_BPP_MDCT   = this.h.p(value?.u_BPP_MDCT);
    this.isAuthorized = ['A', 'P', 'Y'].includes(this.wddStatus);
  }

  private setSocioForm(value: IOrdersQuery): void {
    this.currencyList = (value.currencyList || [])
      .map(m => ({ label: m.currName, value: m.currCode }));

    const currencyItem = this.h.findItem(this.currencyList, value.docCur);

    this.h.patch(this.modeloFormSoc, {
      cardCode : this.h.p(value.cardCode),
      cardName : this.h.p(value.cardName),
      cntctCode: this.h.n(value.cntctCode),
      numAtCard: this.h.p(value.numAtCard),
      currencies : currencyItem,
      docRate  : this.h.r(value.docRate, 3),
    });
  }

  private setDocumentoForm(value: IOrdersQuery): void {
    const docStatus = this.h.p(value.docStatus);

    this.h.patch(this.modeloFormDoc, {
      docNum    : this.h.p(value.docNum),
      docStatus : docStatus === 'O' ? 'Abierto' : 'Cerrado',
      docDate   : this.h.d(value.docDate),
      docDueDate: this.h.d(value.docDueDate),
      taxDate   : this.h.d(value.taxDate),
    });

    const docTypesItem = this.h.findItem(this.docTypesList, value.docType);
    this.docTypeSelected = docTypesItem;

    this.h.patch(this.modeloFormCon, {
      docTypes: docTypesItem
    });
  }

  private setCondicionesForm(value: IOrdersQuery): void {
    const paymentsTermsTypesItem = this.h.findItem(this.paymentsTermsTypesList, value.groupNum);

    this.h.patch(this.modeloFormFin, {
      paymentsTermsTypes: paymentsTermsTypesItem
    });
  }

  private setDireccionesForm(value: IOrdersQuery): void {
    this.shipAddressList = (value.shipAddressList || [])
      .map(d => ({ label: d.address, value: d.address }));

    this.payAddressList = (value.payAddressList || [])
      .map(d => ({ label: d.address, value: d.address }));

    const shipAddressItem = this.h.findItem(this.shipAddressList, value.shipToCode);
    const payAddressItem  = this.h.findItem(this.payAddressList, value.payToCode);

    this.h.patch(this.modeloFormLog, {
      shipAddress: shipAddressItem || null,
      address    : this.h.p(value.address),
      payAddress : payAddressItem || null,
      address2   : this.h.p(value.address2)
    });
  }

  private setAgenciaForm(value: IOrdersQuery): void {
    this.agencyAddressList = (value.agencyAddressList || [])
      .map(d => ({ label: d.address, value: d.address }));

    const agencyAddressItem = this.h.findItem(this.agencyAddressList, value.u_FIB_CODT);

    this.h.patch(this.modeloFormAge, {
      u_BPP_MDCT   : this.h.p(value.u_BPP_MDCT),
      u_BPP_MDRT   : this.h.p(value.u_BPP_MDRT),
      u_BPP_MDNT   : this.h.p(value.u_BPP_MDNT),
      agencyAddress: agencyAddressItem,
      u_BPP_MDDT   : this.h.p(value.u_BPP_MDDT)
    });
  }

  private setExportacionForm(value: IOrdersQuery): void {
    const freightTypeItem = this.h.findItem(this.freightTypeList, value.u_TipoFlete);

    this.h.patch(this.modeloFormExp, {
      freightType : freightTypeItem,
      u_ValorFlete: this.h.r(value.u_ValorFlete, 0),
      u_FIB_TFLETE: this.h.r(value.u_FIB_TFLETE, 2),
      u_FIB_IMPSEG: this.h.r(value.u_FIB_IMPSEG, 2),
      u_FIB_PUERTO: this.h.p(value.u_FIB_PUERTO),
      u_FIB_NEMBA : this.h.p(value.u_FIB_NEMBA),
      u_FIB_DEMBA : this.h.p(value.u_FIB_DEMBA),
    });
  }

  private setVendedorForm(value: IOrdersQuery): void {
    const salesPersonsItem = this.h.findItem(this.salesPersonsList, value.slpCode);

    this.h.patch(this.modeloFormSal, {
      salesPersons  : salesPersonsItem,
      u_NroOrden    : this.h.p(value.u_NroOrden),
      u_OrdenCompra : this.h.p(value.u_OrdenCompra),
      comments      : this.h.p(value.comments)
    });
  }

  private setTaxGroup(value: IOrdersQuery): void {
    const shipToCodeTax = (value.shipToCode ?? '').toString().trim();

    this.taxGroupSubscription?.unsubscribe();
    this.taxGroupSubscription = null;

    if (this.cardCode && shipToCodeTax) {
      this.taxGroupSubscription = this.loadTaxGroup(this.cardCode, shipToCodeTax)
        .pipe(take(1))
        .subscribe((taxGroup) => {
          this.taxCode  = taxGroup?.code ?? '';
          this.vatPrcnt = Number(taxGroup?.rate ?? 0);
        });
    } else {
      this.taxCode  = '';
      this.vatPrcnt = 0;
    }
  }

  private setTotalesForm(value: IOrdersQuery): void {
    this.h.patch(this.modeloFormTot, {
      subTotal : this.h.r(value.subTotal, 2),
      discPrcnt: this.h.r(value.discPrcnt, 2),
      discSum  : this.h.r(value.discSum, 2),
      vatSum   : this.h.r(value.vatSum, 2),
      docTotal : this.h.r(value.docTotal, 2),
    });
  }

  private setLines(value: IOrdersQuery): void {
    this.onBuildColumns();

    const wddStatus = this.h.p(value.wddStatus);

    this.modeloLines = (value.lines || [])
    .map(linea => this.utilService.mapLine(linea, wddStatus));

    this.modeloLinesOriginal = structuredClone(value.lines);

    this.modeloLinesAttachments = value.attachments2?.lines ?? [];

    if (this.modeloLinesAttachments.length === 0) {
      this.addLineAttachments(0);
    }

    this.updateHasValidLines();
    this.updateHasValidLinesAttachments();
  }

  private setInitialSnapshot(): void {
    this.initialSnapshot = {
      soc  : this.modeloFormSoc.getRawValue(),
      doc  : this.modeloFormDoc.getRawValue(),
      log  : this.modeloFormLog.getRawValue(),
      fin  : this.modeloFormFin.getRawValue(),
      age  : this.modeloFormAge.getRawValue(),
      exp  : this.modeloFormExp.getRawValue(),
      sal  : this.modeloFormSal.getRawValue(),
      tot  : this.modeloFormTot.getRawValue(),
      lines: structuredClone(this.modeloLines)
    };
  }

  private markFormsAsPristine(): void {
    [
      this.modeloFormSoc,
      this.modeloFormDoc,
      this.modeloFormLog,
      this.modeloFormFin,
      this.modeloFormAge,
      this.modeloFormExp,
      this.modeloFormSal,
      this.modeloFormTot
    ].forEach(f => f.markAsPristine());
  }

  //#endregion



  //#region <<< 18. SAVE >>>

  onClickSave() {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.onToSave();
      }
    });
  }

  private onToSave() {
    if (!this.validatedSave()) return;

    this.isSaving = true;
    this.uploadProgress = 0;

    const modeloToSave = this.buildModelToSave();

    this.ordersService.setUpdate(modeloToSave, this.uploadedFiles)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isSaving = false;
        this.uploadProgress = 0; // reset opcional
      })
    )
    .subscribe({
      next: (event: HttpEvent<any>) => {

        switch (event.type) {

          // 🔄 progreso de subida
          case HttpEventType.UploadProgress:
            if (event.total) {
              this.uploadProgress = Math.round((event.loaded / event.total) * 100);
            }
            break;

          // ✅ respuesta final
          case HttpEventType.Response:
            this.swaCustomService.swaMsgExito(null);
            this.onClickBack();
            break;
        }
      },
      error: (e) => {
        console.error('Error:', e);
        this.utilService.handleErrorSingle(e, 'save', this.swaCustomService);
      }
    });
  }

  private validatedSave(): boolean {
    const showError = (message: string): boolean => {
      this.swaCustomService.swaMsgInfo(message);
      return false;
    };

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
      { cond: !f.docDate, msg: 'Ingrese la fecha de contabilidación.' },
      { cond: !f.docDueDate, msg: 'Ingrese la fecha de vencimiento del documento.' },
      { cond: !f.taxDate, msg: 'Ingrese la fecha del documento.' },
      { cond: !this.h.v(f.salesPersons), msg: 'Seleccione el empleado de ventas.' }
    ])) return false;

    /** 🔹 DETALLE */
    for (let i = 0; i < this.modeloLines.length; i++) {

      const line = this.modeloLines[i];
      const row  = i + 1;

      const validations = [

        /** comunes */
        { cond: !this.h.p(line.taxCode), msg: `Línea ${row}: Seleccione el impuesto.` },
        { cond: !this.h.p(line.u_tipoOpT12), msg: `Línea ${row}: Seleccione el tipo de operación.` },

        /** servicio */
        ...(this.isService ? [
          { cond: !this.h.p(line.acctCode), msg: `Línea ${row}: Seleccione la cuenta contable.` }
        ] : []),

        /** artículo */
        ...(this.isItem ? [
          { cond: !this.h.p(line.whsCode), msg: `Línea ${row}: Seleccione el almacén.` },
          { cond: !line.quantity || line.quantity <= 0, msg: `Línea ${row}: La cantidad debe ser mayor que cero (0).` }
        ] : [])
      ];

      if (!runValidations(validations)) return false;
    }

    return true;
  }

  private mergeForms() {
    return {
      ...this.modeloFormSoc.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormCon.getRawValue(),
      ...this.modeloFormLog.getRawValue(),
      ...this.modeloFormFin.getRawValue(),
      ...this.modeloFormAge.getRawValue(),
      ...this.modeloFormExp.getRawValue(),
      ...this.modeloFormSal.getRawValue(),
      ...this.modeloFormTot.getRawValue(),
    };
  }

  private mapLinesUpdate(): Orders1UpdateModel[] {
    const f          = this.modeloFormSoc.getRawValue();

    const allLines = [...this.modeloLines, ...this.modeloLinesEliminate];

    return allLines
    .filter(line => this.isItem ? this.h.p(line.itemCode) !== '' : this.h.p(line.dscription) !== '')
    .map<Orders1UpdateModel>(line => ({
      lineStatus     : this.h.p(line.lineStatus),
      lineNum        : this.h.n(line.lineNum),

      itemCode       : this.h.p(line.itemCode),
      dscription     : this.h.p(line.dscription),

      acctCode       : this.h.p(line.acctCode),
      whsCode        : this.h.p(line.whsCode),

      unitMsr        : this.h.p(line.unitMsr),
      quantity       : this.h.n(line.quantity),

      currency       : this.h.p(line.currency) || this.h.p(this.h.v(f.currencies)),
      priceBefDi     : this.h.n(line.priceBefDi),
      discPrcnt      : this.h.n(line.discPrcnt),
      price          : this.h.n(line.price),

      taxCode        : this.h.p(line.taxCode),
      lineTotal      : this.h.n(line.lineTotal),

      u_FIB_LinStPkg : this.h.p(line.u_FIB_LinStPkg),
      u_FIB_OpQtyPkg : this.h.n(line.u_FIB_OpQtyPkg),
      u_S_PartAranc1 : this.h.p(line.u_S_PartAranc1),
      u_tipoOpT12    : this.h.p(line.u_tipoOpT12),

      record         : this.h.n(line.record)
    }));
  }

  private buildModelAttachments2(): Attachments2UpdateModel {
    return {
      absEntry    : 0,
      lines: this.mapAttachments2Lines().map(l => ({
        absEntry: l.absEntry,
        trgtPath: l.trgtPath,
        fileName: l.fileName,
        fileExt : l.fileExt,
        date    : l.date,
        record  : l.record
      }))
    };
  }

  private mapAttachments2Lines(): Attachments2LinesUpdateModel[] {
    // ✅ SOLO NUEVOS Y EXISTENTES EN LA DB (record = 1 y 2)
    const nuevos = this.modeloLinesAttachments
    .filter(line => this.h.p(line.trgtPath) !== '')
    .map(line => ({
      absEntry : this.h.n(line.absEntry),
      trgtPath : this.h.p(line.trgtPath),
      fileName : this.h.p(line.fileName),
      fileExt  : this.h.p(line.fileExt),
      date     : this.h.d(line.date),
      record   : this.h.n(line.record)
    }));

    // ✅ TODOS LOS ELIMINADOS (sin restricción)
    const eliminados = this.modeloLinesAttachmentsEliminate
    .map(line => ({
      absEntry : this.h.n(line.absEntry),
      trgtPath : this.h.p(line.trgtPath),
      fileName : this.h.p(line.fileName),
      fileExt  : this.h.p(line.fileExt),
      date     : this.h.d(line.date),
      record   : this.h.n(line.record)
    }));

    // 🔥 UNIR
    return [...nuevos, ...eliminados];
  }

  private buildModelToSave(): OrdersUpdateModel {
    const f             = this.mergeForms();

    const userId        = this.userContextService.getIdUsuario();

    const attachments2  = this.buildModelAttachments2()

    const lines         = this.mapLinesUpdate();

    return {
      ...new OrdersUpdateModel(),

      docEntry      : this.docEntry,
      docDate       : this.h.d(f.docDate),
      docDueDate    : this.h.d(f.docDueDate),
      taxDate       : this.h.d(f.taxDate),
      docType       : this.h.p(this.h.v(f.docTypes)),
      docStatus     : this.docStatus,
      wddStatus     : this.wddStatus,

      cardCode      : this.h.p(f.cardCode),
      cardName      : this.h.p(f.cardName),
      cntctCode     : this.h.n(f.cntctCode),
      numAtCard     : this.h.p(f.numAtCard),
      docCur        : this.h.p(this.h.v(f.currencies)),
      docRate       : this.h.p(this.h.v(f.currencies)) === this.mainCurncy ? 1 : this.h.n(f.docRate),

      payToCode     : this.h.p(this.h.l(f.payAddress)),
      address       : this.h.p(f.address),
      shipToCode    : this.h.p(this.h.l(f.shipAddress)),
      address2      : this.h.p(f.address2),

      groupNum      : this.h.n(this.h.v(f.paymentsTermsTypes)),

      u_BPP_MDCT    : this.h.p(this.u_BPP_MDCT),
      u_BPP_MDRT    : this.h.p(f.u_BPP_MDRT),
      u_BPP_MDNT    : this.h.p(f.u_BPP_MDNT),
      u_FIB_CODT    : this.h.p(this.h.l(f.agencyAddress)),
      u_BPP_MDDT    : this.h.p(f.u_BPP_MDDT),

      u_TipoFlete   : this.h.p(this.h.v(f.freightType)),
      u_ValorFlete  : this.h.n(f.u_ValorFlete),
      u_FIB_TFLETE  : this.h.n(f.u_FIB_TFLETE),
      u_FIB_IMPSEG  : this.h.n(f.u_FIB_IMPSEG),
      u_FIB_PUERTO  : this.h.p(f.u_FIB_PUERTO),
      u_FIB_NEMBA   : this.h.p(f.u_FIB_NEMBA),
      u_FIB_DEMBA   : this.h.p(f.u_FIB_DEMBA),

      slpCode       : this.h.n(this.h.v(f.salesPersons) ?? -1),
      u_NroOrden    : this.h.p(f.u_NroOrden),
      u_OrdenCompra : this.h.p(f.u_OrdenCompra),
      comments      : this.h.p(f.comments),

      discPrcnt     : this.h.n(f.discPrcnt),
      discSum       : this.h.n(f.discSum),
      vatSum        : this.h.n(f.vatSum),
      docTotal      : this.h.n(f.docTotal),

      u_UsrUpdate   : userId,

      attachments2,

      lines
    };
  }

  //#endregion



  //#region <<< 19. NAVIGATION >>>

  onClickBack() {
    this.router.navigate(['/main/modulo-ven/panel-orden-venta-list']);
  }

  //#endregion



  //#region <<< 20. OBSERVABLES / WATCHERS >>>

  private watchChanges(): void {
    if (this.isWatchingChanges) return;

    this.isWatchingChanges = true;

    merge(
      this.modeloFormSoc.valueChanges,
      this.modeloFormDoc.valueChanges,
      this.modeloFormLog.valueChanges,
      this.modeloFormFin.valueChanges,
      this.modeloFormAge.valueChanges,
      this.modeloFormExp.valueChanges,
      this.modeloFormSal.valueChanges,
      this.modeloFormTot.valueChanges
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.detectRealChanges());
  }

  //#endregion



  //#region <<< 21. ACTIONS / COMMANDS >>>

  public detectRealChanges(): void {
    // =========================
    // VALIDACIÓN BÁSICA
    // =========================
    const formsValid =
    this.modeloFormSoc.valid &&
    this.modeloFormDoc.valid &&
    this.modeloFormLog.valid &&
    this.modeloFormFin.valid &&
    this.modeloFormAge.valid &&
    this.modeloFormExp.valid &&
    this.modeloFormSal.valid &&
    this.modeloFormTot.valid &&
    this.modeloLines.length > 0;

    if (!formsValid) {
      this.hasRealChanges = false;
      return;
    }

    // =========================
    // 1️⃣ CAMBIOS EN FORMULARIOS (POR SNAPSHOT)
    // =========================
    const socChanged = this.utilService.hasFormChanged(
      this.modeloFormSoc,
      this.initialSnapshot.soc
    );

    const docChanged = this.utilService.hasFormChanged(
      this.modeloFormDoc,
      this.initialSnapshot.doc
    );

    const logChanged = this.utilService.hasFormChanged(
      this.modeloFormLog,
      this.initialSnapshot.log
    );

    const finChanged = this.utilService.hasFormChanged(
      this.modeloFormFin,
      this.initialSnapshot.fin
    );

    const ageChanged = this.utilService.hasFormChanged(
      this.modeloFormAge,
      this.initialSnapshot.age
    );

    const expChanged = this.utilService.hasFormChanged(
      this.modeloFormExp,
      this.initialSnapshot.exp
    );

    const salChanged = this.utilService.hasFormChanged(
      this.modeloFormSal,
      this.initialSnapshot.sal
    );

    const totChanged = this.utilService.hasFormChanged(
      this.modeloFormTot,
      this.initialSnapshot.tot
    );

    const formChanged = socChanged || docChanged || logChanged || finChanged || ageChanged || expChanged || salChanged || totChanged;

    // =========================
    // 2️⃣ LÍNEAS NUEVAS (record = 1)
    // =========================
    const hasNewLines =
    this.modeloLines.some(l => l.record === 1);

    // =========================
    // 3️⃣ LÍNEAS ELIMINADAS BD
    // =========================
    const hasDeletedLines =
    this.modeloLinesEliminate.length > 0;

    // =========================
    // 4️⃣ LÍNEAS EXISTENTES MODIFICADAS (record = 2)
    // =========================
    const FIELDS_TO_COMPARE = [
      'itemCode',
      'dscription',
      'acctCode',
      'formatCode',
      'acctName',
      'whsCode',
      'quantity',
      'openQty',
      'u_FIB_OpQtyPkg',
      'priceBefDi',
      'discPrcnt',
      'price',
      'taxCode',
      'u_tipoOpT12',
      'u_tipoOpT12Nam',
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
    // 5️⃣ ANEXOS NUEVOS CON trgtPath
    // =========================
    const p = (v: any) => this.utilService.normalizePrimitive(v);

    const hasNewAttachments =
      this.modeloLinesAttachments.some(line =>
        line.record === 1 && p(line.trgtPath) !== ''
      );

    // =========================
    // 6️⃣ ANEXOS ELIMINADOS
    // =========================
    const hasDeletedAttachments =
      this.modeloLinesAttachmentsEliminate.length > 0;


    // =========================
    // ✅ REGLA FINAL
    // =========================
    this.hasRealChanges =
      formChanged ||
      hasNewLines ||
      hasDeletedLines ||
      hasUpdatedLines ||
      hasNewAttachments ||
      hasDeletedAttachments;
  }

  //#endregion



  //#region <<< 22. ACTIONS / COMMANDS >>>

  onClickToCopyReserveInvoice() {
    this.isDisplay = true;

    this.ordersService.getToCopy(this.docEntry)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (data) => {
        // respaldo para refresh
        sessionStorage.setItem('ordenVentaCopyTo',JSON.stringify(data));

        this.router.navigate(['/main/modulo-ven/panel-factura-reserva-create'], { state: { mode: 'copy', ordenVenta: data } });
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onClickToCopyReserveInvoice', this.swaCustomService);
      }
    });
  }

  //#endregion
}
