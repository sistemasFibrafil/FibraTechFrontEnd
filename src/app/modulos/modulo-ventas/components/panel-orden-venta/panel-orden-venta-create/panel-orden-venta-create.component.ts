import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { catchError, switchMap, map, finalize, tap, filter, take } from 'rxjs/operators';
import { Subject, forkJoin, of, takeUntil, Subscription, Observable, EMPTY, from } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';

import { ItemsFindByListCodeModel } from '@app/modulos/modulo-inventario/models/items.model';

import { Orders1CreateModel, Orders1UpdateModel } from '@app/modulos/modulo-ventas/models/sap-business-one/orders.model';
import { Attachments2CreateModel, Attachments2UpdateModel } from '@app/modulos/modulo-ventas/models/sap-business-one/attachments2.model';

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
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
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
import { DocumentNumberingSeriesService } from '@app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series.service';




@Component({
  selector: 'app-ven-panel-orden-venta-create',
  templateUrl: './panel-orden-venta-create.component.html',
  styleUrls: ['./panel-orden-venta-create.component.css']
})
export class PanelOrdenVentaCreateComponent implements OnInit, OnDestroy {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly h                            = this.utilService.getHelpers();
  private readonly destroy$                     = new Subject<void>();
  private taxGroupSubscription                  : Subscription | null = null;
  private socioLoadSubscription                 : Subscription | null = null;
  private agenciaLoadSubscription               : Subscription | null = null;


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
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
  isLocked                                      : boolean = false;
  isSaving                                      : boolean = false;
  isEarring                                     : boolean = false;
  isDisplay                                     : boolean = false;
  isauthorized                                  : boolean = false;
  isCreatedraft                                 : boolean = true;
  hasValidLines                                 : boolean = false;
  isDisplayVisor                                : boolean = false;
  isPastingPrices                               : boolean = false;
  isDisplayUpload                               : boolean = false;
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
  isDisplayGenerandoVisor                       : boolean = false;
  isPastingOperationTypes                       : boolean = false;
  isVisualizarTipoOperacion                     : boolean = false;
  isVisualizarCuentaContable                    : boolean = false;
  isShowingLineValidationMessage                : boolean = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  contextMenuItems                              : MenuItem[];
  splitButtonItems                              : MenuItem[];
  splitButtonAttachmentItems                    : MenuItem[];

  columnas                                      : TableColumn[];
  columnasAttachments                           : TableColumn[];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modeloLinesSelected                           : IOrdenVenta1Query;
  modeloLinesAttachmentsSelected                : IAttachments2LinesQuery;

  modeloLines                                   : IOrdenVenta1Query[] = [];
  modeloLinesOriginal                           : IOrdenVenta1Query[] = [];
  modeloLinesAttachments                        : IAttachments2LinesQuery[] = [];

  modeloLinesAttachmentsEliminate               : IAttachments2LinesQuery[] = [];

  isDataBlob                                    : Blob | null = null;
  uploadedFiles                                 : any[] = [];


  // ===========================
  // 🔹 7. COMBOS / LISTS
  // ===========================
  docTypesList                                  : SelectItem[] = [];
  currenciesList                                : SelectItem[] = [];
  payAddressList                                : SelectItem[] = [];
  shipAddressList                               : SelectItem[] = [];
  freightTypesList                              : SelectItem[] = [];
  salesPersonsList                              : SelectItem[] = [];
  agencyAddressList                             : SelectItem[] = [];
  printModelTypesList                           : SelectItem[] = [];
  operationsTypesList                           : SelectItem[] = [];
  paymentsTermsTypesList                        : SelectItem[] = [];


  // ===========================
  // 🔹 8. DOC TYPE CONTROL
  // ===========================
  docTypePrevious                               : any;
  docTypeSelected                               : any;


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
  wddStatus                                     : string = '';
  mainCurncy                                    : string = '';
  u_BPP_MDCT                                    : string = '';
  inactiveAlmacenItem                           : string = 'N';
  private readonly orderLoadStateKey            : string = 'orderLoadState';



  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
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
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly chartOfAccountsService: ChartOfAccountsService,
    private readonly operationsTypesService: OperationsTypesService,
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly paymentTermsTypesService: PaymentTermsTypesService,
    private readonly userDefinedFieldsService: UserDefinedFieldsService,
    private readonly documentNumberingSeriesService: DocumentNumberingSeriesService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  ngOnInit() {
    // 1️⃣ Inicializa UI
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.taxGroupSubscription?.unsubscribe();
    this.taxGroupSubscription = null;

    this.socioLoadSubscription?.unsubscribe();
    this.socioLoadSubscription = null;

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
    this.wireDocTypeControl();
    this.wireCurrencyControl();
    this.wireDiscountControls();
    this.wirePayAddressControl();
    this.wireShipAddressControl();
    this.wireAgencyAddressControl();

    // 4️⃣ Inicializar UI
    this.buildColumns();
    this.buildColumnsAttachments();
    this.buildTableOptions();
    this.buildTableAttachmentsOptions();
    this.buildContextMenuOptions();

    // 5️⃣ Inicializar líneas
    this.onAddLine(0);
    this.onAddLineAttachments(0);
  }

  private buildForms(): void {
    this.modeloFormSoc = this.fb.group({
      cardCode            : this.h.fc('', true),
      cardName            : this.h.fc('', true),
      cntctCode           : this.h.fc(),
      numAtCard           : this.h.fc(),
      currencies          : this.h.fc('', true),
      docRate             : this.h.fc(this.h.r(0, 3), true),
    });

    this.modeloFormDoc = this.fb.group({
      docNum              : this.h.fc(),
      docStatus           : this.h.fc('Abierto', true),
      docDate             : this.h.fc(new Date(), true),
      docDueDate          : this.h.fc(null, true),
      taxDate             : this.h.fc(new Date(), true),
    });

    this.modeloFormCon = this.fb.group({
      docTypes            : this.h.fc('', true),
    });

    this.modeloFormLog = this.fb.group({
      shipAddress         : this.h.fc(),
      address2            : this.h.fc(),
      payAddress          : this.h.fc(),
      address             : this.h.fc(),
    });

    this.modeloFormFin = this.fb.group({
      paymentsTermsTypes  : this.h.fc('', true),
    });

    this.modeloFormAge = this.fb.group({
      u_BPP_MDCT          : this.h.fc(),
      u_BPP_MDRT          : this.h.fc(),
      u_BPP_MDNT          : this.h.fc(),
      agencyAddress       : this.h.fc(),
      u_BPP_MDDT          : this.h.fc(),
    });

    this.modeloFormExp = this.fb.group({
      freightTypes        : this.h.fc(),
      u_ValorFlete        : this.h.fc(this.h.r(0, 0)),
      u_FIB_TFLETE        : this.h.fc(this.h.r(0, 2)),
      u_FIB_IMPSEG        : this.h.fc(this.h.r(0, 2)),
      u_FIB_PUERTO        : this.h.fc(),
      u_FIB_NEMBA         : this.h.fc(),
      u_FIB_DEMBA         : this.h.fc(),
    });

    this.modeloFormSal = this.fb.group({
      salesPersons        : this.h.fc('', true),
      u_NroOrden          : this.h.fc(),
      u_OrdenCompra       : this.h.fc(),
      comments            : this.h.fc(),
    });

    this.modeloFormTot = this.fb.group({
      subTotal            : this.h.fc(this.h.r(0, 2)),
      discPrcnt           : this.h.fc(this.h.r(0, 2)),
      discSum             : this.h.fc(this.h.r(0, 2)),
      vatSum              : this.h.fc(this.h.r(0, 2)),
      docTotal            : this.h.fc(this.h.r(0, 2)),
    });

    this.modeloFormMod = this.fb.group({
      printModelTypes     : this.h.fc('', true),
    });

    this.mainCurncy = this.userContextService.getMainCurncy();

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones(
      'app-ven-panel-orden-venta-list'
    );
  }

  private loadAllCombos(): void {
    const paramNumero   : any = { objectCode: '17', docSubType: '--' };
    const paramTipoFlete: any = { tableID: 'ORDR', aliasID: 'TipoFlete' };

    this.isDisplay = true;

    const docTypes: any = this.localDataService.docTypes;
    this.docTypesList = docTypes.map(s => ({
      label: s.name,
      value: s.code
    }));

    const defaultDocType = this.docTypesList.find(x => x.value === 'I');

    if (defaultDocType) {
      this.docTypePrevious = defaultDocType;
      this.docTypeSelected = defaultDocType;

      this.modeloFormCon
        .get('docTypes')
        ?.setValue(defaultDocType, { emitEvent: false });

      this.buildColumns();
    }

    const printModelTypes: any = this.localDataService.printModelTypesOrders;
    this.printModelTypesList = printModelTypes.map(s => ({
      label: s.name,
      value: s.code
    }));

    forkJoin({
      numero: this.documentNumberingSeriesService
        .getNumero(paramNumero)
        .pipe(catchError(() => of(null))),

      groups: this.paymentTermsTypesService
        .getList()
        .pipe(catchError(() => of([] as IPaymentTermsTypes[]))),

      freightTypes: this.userDefinedFieldsService
        .getList(paramTipoFlete)
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
        this.modeloFormDoc.patchValue(
          { docNum: res.numero?.nextNumber ?? 0 },
          { emitEvent: false }
        );

        this.freightTypesList = (res.freightTypes || []).map(item => ({
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

        const defaultFreightTypeValue = res.freightTypes?.[0]?.dflt || '';

        if (defaultFreightTypeValue) {
          const defaultFreightType = this.freightTypesList.find(
            x => x.value === defaultFreightTypeValue
          );

          if (defaultFreightType) {
            this.modeloFormExp
              .get('freightTypes')
              ?.setValue(defaultFreightType, { emitEvent: false });
          }
        }
      }),

      switchMap(() => this.loadData()),

      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  private buildColumns() {
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
        { field: 'u_tipoOpT12Nam',  header: 'Tipo de operación' },
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
        { field: 'u_tipoOpT12Nam',  header: 'Tipo de operación' },
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
      { value: '3', label: 'Borrar línea',        icon: 'pi pi-trash',                  command: () => this.onClickDelete()  }
    ];
  }

  private buildContextMenuOptions(): void {
    this.contextMenuItems = [
      { value: '1', label: 'Duplicar',                            icon: 'pi pi-copy',                   command: () => { this.onClickDuplicate() } },
      { value: '2', label: 'Imprimir',                            icon: 'pi pi-print',                  command: () => { this.onClickModelPrintOpen() } },
      { value: '3', label: 'Ganancia bruta',                      icon: 'pi pi-building',               command: () => {} },
      { value: '4', label: 'Cáculos de comisión y peso',          icon: 'pi pi-chart-bar',              command: () => {} },
      { value: '5', label: 'Comentarios iniciales y final',       icon: 'pi pi-check',                  command: () => {} },
      { value: '6', label: 'Grabar como preliminar',              icon: 'pi pi-eye',                    command: () => { this.onClickSave('draft') } },
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
    const docEntry = this.docEntry;

    if (!docEntry) {
      this.swaCustomService.swaMsgInfo('No existe un documento para duplicar.');
      return;
    }

    sessionStorage.setItem(
      this.orderLoadStateKey,
      JSON.stringify({
        mode: 'sendDraftDuplicate',
        docEntry
      })
    );

    this.resetAll();
    this.loadAllCombos();
  }

  //#endregion



  //#region <<< 5. PRINT EVENTS >>>

  private onClickModelPrintOpen(): void {
    this.isVisualizarPrintModal = !this.isVisualizarPrintModal;
  }

  onClickModelPrint(): void {
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
      this.draftsService.getPrintNationalDocEntry(this.docEntry),
      'onClickPrintNational'
    );
  }

  private onClickPrintExportPlanta(): void {
    this.printDocument(
      this.draftsService.getPrintExportPlantaDocEntry(this.docEntry),
      'onClickPrintExportPlanta'
    );
  }

  private onClickPrintExportCliente(): void {
    this.printDocument(
      this.draftsService.getPrintExportClienteDocEntry(this.docEntry),
      'onClickPrintExportCliente'
    );
  }

  onClickModelPrintClose(): void {
    this.isVisualizarPrintModal = !this.isVisualizarPrintModal;
  }

  //#endregion



  //#region <<< 6. TABLE LINE EVENTS >>>

  onSelectedItem(modelo: IOrdenVenta1Query): void {
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
  }

  onClickAddLineAbove(): void {
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    this.onAddLineAbove(index);
  }

  onClickAddLineBelow(): void {
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    this.onAddLineBelow(index);
  }

  onClickDelete(): void {
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);

    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }

    if (this.modeloLines.length === 0) {
      this.onAddLine(0);
    }

    this.updateHasValidLines();
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

    const addAboveOption = this.splitButtonItems.find(x => x.value === '1');
    const addBelowOption = this.splitButtonItems.find(x => x.value === '2');
    const deleteOption   = this.splitButtonItems.find(x => x.value === '3');

    if (addAboveOption) addAboveOption.visible = !hasEmptyLines;
    if (addBelowOption) addBelowOption.visible = !hasEmptyLines;
    if (deleteOption)   deleteOption.visible = hasLines;
  }

  //#endregion



  //#region <<< 7. ATTACHMENT TABLE EVENTS >>>

  onSelectedItemAttachments(modelo: IAttachments2LinesQuery): void {
    this.modeloLinesAttachmentsSelected = modelo;
    this.updateMenuAttachmentsVisibility();
  }

  onClickAddLineAttachments(): void {
    const index = this.modeloLinesAttachments.indexOf(
      this.modeloLinesAttachmentsSelected
    );

    this.onAddLineAttachments(index + 1);
  }

  onClickDeleteAttachments(): void {
    if (this.modeloLinesAttachmentsSelected.record === 1) {
      const fileName = this.modeloLinesAttachmentsSelected.fileName;
      const fileExt  = this.modeloLinesAttachmentsSelected.fileExt;
      const fullName = `${fileName}.${fileExt}`;

      this.uploadedFiles = this.uploadedFiles.filter(file => {
        const incomingName = file?.name || '';
        return incomingName !== fullName;
      });
    }

    if (this.modeloLinesAttachmentsSelected.record === 2) {
      this.modeloLinesAttachmentsSelected.record = 3;
      this.modeloLinesAttachmentsEliminate.push(
        this.modeloLinesAttachmentsSelected
      );
    }

    const index = this.modeloLinesAttachments.indexOf(
      this.modeloLinesAttachmentsSelected
    );

    if (index > -1) {
      this.modeloLinesAttachments.splice(index, 1);
    }

    if (this.modeloLinesAttachments.length === 0) {
      this.onAddLineAttachments(0);
    }
  }

  private hasDataAttachments(line: any): boolean {
    const p = (v: any) => this.utilService.normalizePrimitive(v);

    return !!p(line.trgtPath);
  }

  private hasEmptyLineAttachments(): boolean {
    return this.modeloLinesAttachments.some(line =>
      !this.hasDataAttachments(line)
    );
  }

  private updateMenuAttachmentsVisibility(): void {
    const hasEmptyLines = this.hasEmptyLineAttachments();
    const hasLines      = this.modeloLinesAttachments.length > 0;

    const addOption    = this.splitButtonAttachmentItems.find(x => x.value === '1');
    const deleteOption = this.splitButtonAttachmentItems.find(x => x.value === '2');

    if (addOption)    addOption.visible = !hasEmptyLines;
    if (deleteOption) deleteOption.visible = hasLines;
  }

  //#endregion



  //#region <<< 8. LINES (CORE) >>>

  private insertLine(index: number): void {
    const newLine: IOrdenVenta1Query = this.createEmptyLine();

    this.modeloLines = [
      ...this.modeloLines.slice(0, index),
      newLine,
      ...this.modeloLines.slice(index)
    ];

    this.reindexLines();
    this.updateHasValidLines();
  }

  private onAddLineAbove(index: number): void {
    this.insertLine(index); // 👆 encima
  }

  private onAddLineBelow(index: number): void {
    this.insertLine(index + 1); // 👇 debajo
  }

  private onAddLine(index: number): void {
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

  private onAddLineAttachments(index: number): void {
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
  }

  //#endregion



  //#region <<< 9. DOC TYPE >>>

  private wireDocTypeControl(): void {
    this.modeloFormCon.get('docTypes')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(docTypes => {

      const hasLines = this.modeloLines.some(n => n.dscription?.trim());

      if (!hasLines) {

        this.docTypeSelected = docTypes;
        this.docTypePrevious = docTypes;

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
          this.onAddLine(0);

          this.docTypeSelected = docTypes;
          this.docTypePrevious = docTypes;

          this.buildColumns();
          this.updateHasValidLines();
        }
        else {
          this.modeloFormCon.get('docTypes')?.setValue(this.docTypePrevious, { emitEvent: false });
        }
      });
    });
  }

  //#endregion



  //#region <<< 10. BUSINESS PARTNER >>>

  onSelectedCliente(value: IBusinessPartnersQuery) {
    // garantizar orden: limpiar controles primero, luego iniciar la carga
    this.resetAll();

    // cancelar cualquier carga previa pendiente
    if (this.socioLoadSubscription) {
      this.socioLoadSubscription.unsubscribe();
      this.socioLoadSubscription = null;
    }

    // iniciar nueva carga y guardar la suscripción para posible cancelación
    this.socioLoadSubscription = this.loadSocioNeogocioByCode(value.cardCode)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private loadSocioNeogocioByCode(cardCode: string): Observable<any> {
    this.isDisplay = true;

    return this.businessPartnersService.getByCode(cardCode).pipe(
      takeUntil(this.destroy$),

      tap(socio => this.mapSocioToForm(socio)),

      map(socio => this.prepareSocioData(socio)),

      tap(data => this.setDefaultValues(data)),

      switchMap(data => this.buildSocioRequests(data)),

      tap(result => this.applySocioResults(result)),

      catchError(e => {
        this.utilService.handleErrorSingle(e, 'loadSocioNeogocioByCode', this.swaCustomService);
        return of(null);
      }),

      finalize(() => { this.isDisplay = false; })
    );
  }

  private mapSocioToForm(socio: IBusinessPartnersQuery): void {
    this.cardCode  = socio.cardCode;
    this.cntctCode = socio.cntctCode;

    this.modeloFormSoc.patchValue({
      cardCode : socio.cardCode,
      cardName : socio.cardName,
      cntctCode: socio.cntctCode
    }, { emitEvent: false });
  }

  private prepareSocioData(socio: IBusinessPartnersQuery) {
    return {
      socio,
      monedas  : socio.currencyCodesLines ?? [],
      shipAddr : socio.shipAddressLines ?? [],
      payAddr  : socio.payAddressLines ?? []
    };
  }

  private setDefaultValues({ monedas, shipAddr, payAddr, socio }): void {
  this.currenciesList    = monedas.map(m => ({ label: m.currName, value: m.currCode }));
  this.shipAddressList = shipAddr.map(d => ({ label: d.address, value: d.address }));
  this.payAddressList  = payAddr.map(d => ({ label: d.address, value: d.address }));

  this.setDefaultCurrency();
  this.setDefaultAddresses(socio);
  this.setDefaultPayment(socio);
  this.setDefaultSalesEmployee(socio);
}

  private setDefaultCurrency(): void {
    if (!this.currenciesList.length) return;

    let preferred =
      this.currenciesList.length === 1
        ? this.currenciesList[0]
        : this.currenciesList.find(c =>
            String(c.value).toUpperCase() === String(this.mainCurncy).trim().toUpperCase()
          );

    if (preferred) {
      this.currencies = preferred.value;
      this.modeloFormSoc.get('currencies')?.setValue(preferred, { emitEvent: false });
    }
  }

  private setDefaultAddresses(socio: IBusinessPartnersQuery): void {
    const ship = this.shipAddressList.find(it => it.value === socio.shipToDef);
    const pay  = this.payAddressList.find(it => it.value === socio.billToDef);

    if (ship) {
      this.modeloFormLog.patchValue({ shipAddress: ship }, { emitEvent: false });
    }

    if (pay) {
      this.modeloFormLog.patchValue({ payAddress: pay }, { emitEvent: false });
    }
  }

  private setDefaultPayment(socio: IBusinessPartnersQuery): void {
    const group = this.paymentsTermsTypesList.find(it => it.value === socio.groupNum);

    if (group) {
      this.modeloFormFin.patchValue({ paymentsTermsTypes: group }, { emitEvent: false });
    }
  }

  private setDefaultSalesEmployee(socio: IBusinessPartnersQuery): void {
    const slpCode = (socio.slpCode ?? 0) === 0 ? -1 : socio.slpCode;

    const employee = this.salesPersonsList.find(it => it.value === slpCode);

    if (employee) {
      this.modeloFormSal.patchValue({ salesPersons: employee }, { emitEvent: false });
    }
  }

  private buildSocioRequests({ socio, shipAddr, payAddr }) {
    const defaultShip = shipAddr.find(d => d.address === socio.shipToDef);
    const defaultPay  = payAddr.find(d => d.address === socio.billToDef);

    const shipToDef = String(socio.shipToDef ?? '').trim();

    return forkJoin({
      tipoCambio: this.currencies ? this.loadTipoCambio(this.currencies) : of(null),
      shipStreet: defaultShip ? this.loadAddress(socio.cardCode, socio.shipToDef, 'S') : of(null),
      payStreet : defaultPay ? this.loadAddress(socio.cardCode, socio.billToDef, 'B') : of(null),
      taxGroup  : shipToDef ? this.loadTaxGroup(socio.cardCode, shipToDef) : of(null)
    });
  }

  private applySocioResults({ shipStreet, payStreet, taxGroup }): void {
    if (shipStreet) {
      this.modeloFormLog.patchValue({ address2: shipStreet }, { emitEvent: false });
    }

    if (payStreet) {
      this.modeloFormLog.patchValue({ address: payStreet }, { emitEvent: false });
    }

    this.applyTaxToDocument(taxGroup);
  }

  //#endregion



  //#region <<< 11. CUERRENCY / TIPO CAMBIO >>>

  private fetchTipoCambioRate(currCode: any): Observable<IExchangeRates | null> {
    const docDate: Date = this.modeloFormDoc?.controls['docDate']?.value;
    const currencies      = String(currCode || '').trim().toUpperCase();
    const sysCurrncy    = this.userContextService.getSysCurrncy();

    debugger

    const params: any = { rateDate: this.utilService.normalizeDateOrToday(docDate), currency: currencies, sysCurrncy: sysCurrncy };
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



  //#region <<< 12. ADDRESS / LOGÍSTICA >>>

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
        next: (fullAddress) => {
          if (fullAddress) {
            this.modeloFormLog.patchValue(
              { address: fullAddress },
              { emitEvent: false }
            );
          }
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'wirePayAddressControl', this.swaCustomService);
        }
      });
  }

  private loadAddress(cardCode: string, address: string, adresType: string): Observable<string | null> {
    const params = { cardCode, address, adresType };

    return this.addressesService.getByCode(params).pipe(
      takeUntil(this.destroy$),
      map((data: IAddresses) => data?.fullAddress ?? null),
      catchError((e) => {
        this.utilService.handleErrorSingle(e, 'loadAddress', this.swaCustomService);
        return of(null);
      })
    );
  }

  //#endregion



  //#region <<< 13. TAX / IMPUESTOS >>>

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



  //#region <<< 14. AGENCY >>>

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
      .subscribe();
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
          this.modeloFormAge.patchValue({ u_BPP_MDDT: street }, { emitEvent: false });
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'wireAgencyAddressControl', this.swaCustomService);
      }
    });
  }

  //#endregion



  //#region <<< 15. CODIGO DE ARTÍCULO >>>

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
      itemCode            : this.h.p(element.itemCode),
      dscription          : this.h.p(element.itemName),
      whsCode             : this.h.p(element.dfltWH),
      unitMsr             : this.h.p(element.salUnitMsr),
      onHand              : this.h.n(element.onHand),
      currency            : this.h.p(this.h.v(f.currencies)),
      priceBefDi          : this.h.n(element.priceBefDi),
      discPrcnt           : this.h.n(element.discPrcnt),
      price               : this.h.n(element.price),
      taxCode             : this.h.p(this.taxCode),
      vatPrcnt            : this.h.n(this.vatPrcnt),
      u_tipoOpT12         : this.h.p(element.u_tipoOpT12),
      u_tipoOpT12Nam      : this.h.p(element.u_tipoOpT12Nam),
      quantity            : 1,
      openQty             : 1
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
      } as any;
    });

    this.calculateTotalLine(this.modeloLines[index], index);
    this.calculateTotals();

    this.updateHasValidLines();
  }

  private getListByCode(itemCode: string, index: number): void {
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



  //#region <<< 16. DESCRIPCIÓN DE ARTÍCULO >>>

  onChangeDescriptions(value: IOrdenVenta1Query) {
    if (!this.validateDocumentBaseData())
      {
        value.dscription = '';
        return;
      };
    this.updateHasValidLines();
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



  //#region <<< 17. CUENTA CONTABLE >>>

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



  //#region <<< 18. ALMACÉN >>>

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

  onChangeQuantity(value: IOrdenVenta1Query, index: number): void {
    this.calculateTotalLine(value, index);
    this.calculateTotals();
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

  onChangePrice(value: IOrdenVenta1Query, index: number): void {
    this.calculateTotalLine(value, index);
    this.calculateTotals();
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



  //#region <<< 21. IMPUESTO >>>

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



  //#region <<< 24. CÁLCULO DE LÍNEA >>>

  calculateTotalLine(value: IOrdenVenta1Query, index: number): void {
    let quantity       : number;
    let openQty        : number;
    let u_FIB_OpQtyPkg : number;
    let priceBefDi     : number;
    let discPrcnt      : number;
    let price          : number;
    let lineTotal      : number;
    let vatSum         : number;

    const hasData = this.hasData(value);

    quantity = !hasData ? 0 : this.utilService.onRedondearDecimal(value.quantity, 3);

    openQty        = quantity;
    u_FIB_OpQtyPkg = quantity;

    priceBefDi = value.itemCode === ''
      ? (this.isItem ? 0 : this.utilService.onRedondearDecimal(value.priceBefDi, 3))
      : this.utilService.onRedondearDecimal(value.priceBefDi, 3);

    discPrcnt = value.itemCode === ''
      ? (this.isItem ? 0 : this.utilService.onRedondearDecimal(value.discPrcnt, 2))
      : this.utilService.onRedondearDecimal(value.discPrcnt, 2);

    const rawPrice = discPrcnt === 0
      ? priceBefDi
      : priceBefDi * (1 - (discPrcnt / 100));

    price = this.utilService.onRedondearDecimal(rawPrice, 3);

    lineTotal = this.isItem
      ? this.utilService.onRedondearDecimal(quantity * price, 2)
      : this.utilService.onRedondearDecimal(price, 2);

    vatSum = this.utilService.onRedondearDecimal((lineTotal * value.vatPrcnt) / 100, 2);

    const currentLine = this.modeloLines[index];

    currentLine.quantity       = quantity;
    currentLine.openQty        = openQty;
    currentLine.u_FIB_OpQtyPkg = u_FIB_OpQtyPkg;
    currentLine.priceBefDi     = priceBefDi;
    currentLine.discPrcnt      = discPrcnt;
    currentLine.price          = price;
    currentLine.lineTotal      = lineTotal;
    currentLine.vatSum         = vatSum;
  }

  //#endregion



  //#region <<< 25. DESCUENTO GENERAL DEL DOCUMENTO >>>

  private wireDiscountControls(): void {
    const prcntCtrl = this.modeloFormTot.get('discPrcnt');
    const sumCtrl   = this.modeloFormTot.get('discSum');

    if (!prcntCtrl || !sumCtrl) return;

    prcntCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const subTotal = this.h.n(this.modeloFormTot.get('subTotal')?.value);
        let discPrcnt  = this.h.n(prcntCtrl.value);

        discPrcnt = Math.min(100, Math.max(0, discPrcnt));

        const discSum = this.utilService.onRedondearDecimal(subTotal * (discPrcnt / 100), 2);

        sumCtrl.patchValue(
          this.utilService.onRedondearDecimalConCero(discSum, 2),
          { emitEvent: false }
        );

        this.calculateTotals();
      });

    sumCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const subTotal = this.h.n(this.modeloFormTot.get('subTotal')?.value);
        const discSum  = Math.max(0, this.h.n(sumCtrl.value));

        let discPrcnt = 0;

        if (subTotal > 0) {
          discPrcnt = (discSum / subTotal) * 100;
        }

        discPrcnt = this.utilService.onRedondearDecimal(discPrcnt, 2);
        discPrcnt = Math.min(100, Math.max(0, discPrcnt));

        prcntCtrl.patchValue(
          this.utilService.onRedondearDecimalConCero(discPrcnt, 2),
          { emitEvent: false }
        );

        this.calculateTotals();
      });
  }

  //#endregion



  //#region <<< 26. TOTALES DEL DOCUMENTO >>>

  private calculateTotals(): void {
    const subTotal  = this.calculateSubTotal();
    const discSum   = this.h.n(this.modeloFormTot.get('discSum')?.value);
    const discPrcnt = this.h.n(this.modeloFormTot.get('discPrcnt')?.value);

    const { vatSumDoc } = this.calculateVat(discPrcnt);

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

  private calculateVat(discPrcnt: number): { vatSumDoc: number } {
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

  //#endregion



  //#region <<< 27. IMPORT FILES >>>

  private mapToOrderLineAttachments(file: any): any {
    const fullName = file.name;
    const index = fullName.lastIndexOf('.');

    const fileName = fullName.substring(0, index);
    const fileExt = fullName.substring(index + 1).toLowerCase();

    const fileAttachments = this.userContextService.getFileAttachments();

    return {
      trgtPath: this.h.p(fileAttachments),
      fileName: this.h.p(fileName),
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
    this.isDisplayUpload = !this.isDisplayUpload;

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
  }

  //#endregion



  //#region <<< 28. RESET / LIMPIEZA >>>

  private resetAll(): void {
  this.clearLoadSubscriptions();
  this.resetHeaderState();
  this.resetUiState();
  this.resetIndexes();
  this.resetDependentLists();
  this.resetForms();
  this.resetLines();
  this.markAllFormsPristineUntouched();
  }

  private clearLoadSubscriptions(): void {
    this.taxGroupSubscription?.unsubscribe();
    this.socioLoadSubscription?.unsubscribe();
    this.agenciaLoadSubscription?.unsubscribe();

    this.taxGroupSubscription = null;
    this.socioLoadSubscription = null;
    this.agenciaLoadSubscription = null;
  }

  private resetHeaderState(): void {
    this.docEntry = 0;
    this.cardCode = '';
    this.cntctCode = 0;
    this.taxCode = '';
    this.vatPrcnt = 0;
    this.sysRate = 0;
    this.currencies = '';
    this.itemCode = '';
    this.wddStatus = '';
    this.u_BPP_MDCT = '';
    this.inactiveAlmacenItem = 'N';

    this.isLocked = false;
    this.isEarring = false;
    this.isauthorized = false;
    this.isCreatedraft = true;
    this.hasValidLines = false;
  }

  private resetUiState(): void {
    this.isSaving = false;
    this.isDisplayVisor = false;
    this.isDisplayUpload = false;
    this.isDisplayGenerandoVisor = false;

    this.isVisualizarAlmacen = false;
    this.isVisualizarImpuesto = false;
    this.isVisualizarArticulo = false;
    this.isVisualizarPrintModal = false;
    this.isVisualizarTipoOperacion = false;
    this.isVisualizarCuentaContable = false;

    this.isPastingPrices = false;
    this.isPastingWhsCodes = false;
    this.isPastingTaxCodes = false;
    this.isPastingItemCodes = false;
    this.isPastingQuantities = false;
    this.isPastingFormatCodes = false;
    this.isPastingDescriptions = false;
    this.isPastingOperationTypes = false;

    this.isShowingLineValidationMessage = false;
  }

  private resetIndexes(): void {
    this.indexAlmacen = 0;
    this.indexImpuesto = 0;
    this.indexArticulo = 0;
    this.uploadProgress = 0;
    this.indexFileUpload = 0;
    this.indexTipoOperacion = 0;
    this.indexCentroCuentaContable = 0;
  }

  private resetDependentLists(): void {
    this.currenciesList = [];
    this.shipAddressList = [];
    this.payAddressList = [];
    this.agencyAddressList = [];
  }

  private resetForms(): void {
    const defaultDocType = this.docTypesList?.find(x => x.value === 'I') ?? null;
    const currentDocNum = this.modeloFormDoc.get('docNum')?.value ?? '';
    const currentFreight = this.modeloFormExp.get('freightTypes')?.value ?? '';

    this.docTypeSelected = defaultDocType;
    this.docTypePrevious = defaultDocType;

    this.modeloFormSoc.reset({
      cardCode: '',
      cardName: '',
      cntctCode: '',
      numAtCard: '',
      currencies: '',
      docRate: this.h.r(0, 3),
    }, { emitEvent: false });

    this.modeloFormDoc.reset({
      docNum: currentDocNum,
      docStatus: 'Abierto',
      docDate: new Date(),
      docDueDate: null,
      taxDate: new Date(),
    }, { emitEvent: false });

    this.modeloFormCon.reset({
      docTypes: defaultDocType,
    }, { emitEvent: false });

    this.modeloFormLog.reset({
      shipAddress: '',
      address2: '',
      payAddress: '',
      address: '',
    }, { emitEvent: false });

    this.modeloFormFin.reset({
      paymentsTermsTypes: '',
    }, { emitEvent: false });

    this.modeloFormAge.reset({
      u_BPP_MDCT: '',
      u_BPP_MDRT: '',
      u_BPP_MDNT: '',
      agencyAddress: '',
      u_BPP_MDDT: '',
    }, { emitEvent: false });

    this.modeloFormExp.reset({
      freightTypes: currentFreight,
      u_ValorFlete: this.h.r(0, 0),
      u_FIB_TFLETE: this.h.r(0, 2),
      u_FIB_IMPSEG: this.h.r(0, 2),
      u_FIB_PUERTO: '',
      u_FIB_NEMBA: '',
      u_FIB_DEMBA: '',
    }, { emitEvent: false });

    this.modeloFormSal.reset({
      salesPersons: '',
      u_NroOrden: '',
      u_OrdenCompra: '',
      comments: '',
    }, { emitEvent: false });

    this.modeloFormTot.reset({
      subTotal: this.h.r(0, 2),
      discPrcnt: this.h.r(0, 2),
      discSum: this.h.r(0, 2),
      vatSum: this.h.r(0, 2),
      docTotal: this.h.r(0, 2),
    }, { emitEvent: false });

    this.modeloFormMod.reset({
      printModelTypes: '',
    }, { emitEvent: false });
  }

  private resetLines(): void {
    this.buildColumns();

    this.modeloLines = [];
    this.onAddLine(0);
    this.modeloLinesSelected = this.modeloLines[0];

    this.modeloLinesAttachments = [];
    this.onAddLineAttachments(0);
    this.modeloLinesAttachmentsSelected = this.modeloLinesAttachments[0];

    this.modeloLinesOriginal = [];
    this.modeloLinesAttachmentsEliminate = [];
    this.uploadedFiles = [];
    this.isDataBlob = null;

    this.calculateTotals();
    this.updateMenuVisibility();
    this.updateMenuAttachmentsVisibility();
    this.updateMenuContextVisibility();
  }

  private markAllFormsPristineUntouched(): void {
    const forms: FormGroup[] = [
      this.modeloFormSoc,
      this.modeloFormDoc,
      this.modeloFormCon,
      this.modeloFormLog,
      this.modeloFormFin,
      this.modeloFormAge,
      this.modeloFormExp,
      this.modeloFormSal,
      this.modeloFormTot,
      this.modeloFormMod,
    ];

    forms.forEach(form => {
      form.markAsPristine();
      form.markAsUntouched();
      form.updateValueAndValidity({ emitEvent: false });
    });
  }

  //#endregion



  //#region <<< 29. LOAD DATA (EDICIÓN) >>>

  private loadData(): Observable<IOrdersQuery | null> {
    let mode = history.state?.mode as
      | 'create'
      | 'sendDraft'
      | 'sendDraftDuplicate'
      | 'sendOrderDuplicate'
      | undefined;

    let docEntry = Number(history.state?.docEntry ?? 0);

    const storedStateRaw = sessionStorage.getItem(this.orderLoadStateKey);

    if (storedStateRaw) {
      try {
        const storedState = JSON.parse(storedStateRaw);

        if (storedState?.mode && storedState?.docEntry) {
          mode = storedState.mode;
          docEntry = Number(storedState.docEntry);
        }
      } catch {
        this.clearOrderLoadState();
      }
    }

    if (!mode || mode === 'create') {
      this.clearOrderLoadState();
      return of(null);
    }

    if (!docEntry) {
      this.clearOrderLoadState();
      return of(null);
    }

    const request$ =
      mode === 'sendDraft' || mode === 'sendDraftDuplicate'
        ? this.draftsService.getByDocEntry(docEntry)
        : this.ordersService.getByDocEntry(docEntry);

    return request$.pipe(
      tap((data: IOrdersQuery) => {
        this.setFormValues(data, mode);
      }),
      catchError((e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
        return of(null);
      })
    );
  }

  private setFormValues(value: IOrdersQuery, mode: string): void {
    this.isLoadingInitialData = true;

    try {
      const isDraft = mode === 'sendDraft';

      const isDuplicate =
        mode === 'sendOrderDuplicate' ||
        mode === 'sendDraftDuplicate';

      if (isDuplicate) {
        this.setHeaderDuplicateState(value);
      }

      if (isDraft) {
        this.setHeaderDraftState(value);
        this.setDocumentoForm(value);
      }

      this.setSocioForm(value);
      this.setContenidoForm(value);
      this.setCondiciones(value);
      this.setDirecciones(value);
      this.setAgencia(value);
      this.setExportacion(value);
      this.setVendedor(value);
      this.setTaxGroup(value);
      this.setTotales(value);
      this.setLines(value);
    }
    finally {
      this.isLoadingInitialData = false;
    }
  }

  private setHeaderDuplicateState(value: IOrdersQuery) {
    this.cardCode         = this.h.p(value.cardCode);
    this.currencies         = this.h.p(value.docCur);
    this.cntctCode        = value?.cntctCode;
    this.u_BPP_MDCT       = this.h.p(value.u_BPP_MDCT);
  }

  private setHeaderDraftState(value: IOrdersQuery) {
    const statusMap = {
      Y   : '[Autorizado]',
      N   : '[Rechazado]',
      W   : '[Pendiente]',
      '-' : '[Borrador]',
    };

    this.wddStatus      = this.h.p(value.wddStatus);
    const statusName    = statusMap[this.wddStatus] || '';

    this.titulo       += ` ${statusName}`;

    if(this.wddStatus === '-')
    {
      this.isCreatedraft  = false;
    }

    this.isLocked         = true;
    this.docEntry         = value?.docEntry;
    this.cardCode         = this.h.p(value.cardCode);
    this.currencies       = this.h.p(value.docCur);
    this.isEarring        = this.wddStatus === 'W';
    this.cntctCode        = value?.cntctCode;
    this.u_BPP_MDCT       = this.h.p(value.u_BPP_MDCT);
    this.isauthorized     = ['Y', 'W'].includes(this.wddStatus);
  }

  private setSocioForm(value: IOrdersQuery) {
    this.currenciesList = (value.currencyList || [])
      .map(m => ({ label: m.currName, value: m.currCode }));

    const currencyItem = this.h.findItem(this.currenciesList, value.docCur);

    this.h.patch(this.modeloFormSoc, {
      cardCode : this.h.p(value.cardCode),
      cardName : this.h.p(value.cardName),
      cntctCode: value.cntctCode,
      numAtCard: this.h.p(value.numAtCard),
      currencies : currencyItem,
      docRate  : this.h.r(value.docRate, 3),
    });
  }

  private setDocumentoForm(value: IOrdersQuery) {
    this.h.patch(this.modeloFormDoc, {
      docNum    : this.h.n(value.docNum),
      docStatus : 'Borrador',
      docDate   : this.h.d(value.docDate),
      docDueDate: this.h.d(value.docDueDate),
      taxDate   : this.h.d(value.taxDate),
    });
  }

  private setContenidoForm(value: IOrdersQuery) {
    const docTypesItem = this.h.findItem(this.docTypesList, value.docType);
    this.docTypeSelected = docTypesItem;

    this.h.patch(this.modeloFormCon, {
      docTypes: docTypesItem
    });
  }

  private setCondiciones(value: IOrdersQuery) {
    const item = this.h.findItem(this.paymentsTermsTypesList, value.groupNum);

    this.h.patch(this.modeloFormFin, {
      paymentsTermsTypes: item
    });
  }

  private setDirecciones(value: IOrdersQuery) {
    this.shipAddressList = (value.shipAddressList || [])
    .map(d => ({ label: d.address, value: d.address }));

    this.payAddressList = (value.payAddressList || [])
    .map(d => ({ label: d.address, value: d.address }));

    const ship = this.h.findItem(this.shipAddressList, value.shipToCode);
    const pay  = this.h.findItem(this.payAddressList, value.payToCode);

    this.h.patch(this.modeloFormLog, {
      shipAddress: ship || null,
      address    : this.h.p(value.address),
      payAddress : pay || null,
      address2   : this.h.p(value.address2)
    });
  }

  private setAgencia(value: IOrdersQuery) {
    this.agencyAddressList = (value.agencyAddressList || [])
    .map(d => ({ label: d.address, value: d.address }));

    const agency = this.h.findItem(this.agencyAddressList, value.u_FIB_CODT);

    this.h.patch(this.modeloFormAge, {
      u_BPP_MDCT   : value.u_BPP_MDCT,
      u_BPP_MDRT   : this.h.p(value.u_BPP_MDRT),
      u_BPP_MDNT   : this.h.p(value.u_BPP_MDNT),
      agencyAddress: agency,
      u_BPP_MDDT   : this.h.p(value.u_BPP_MDDT)
    });
  }

  private setExportacion(value: IOrdersQuery) {
    const item = this.h.findItem(this.freightTypesList, value.u_TipoFlete);

    this.h.patch(this.modeloFormExp, {
      freightTypes : item,
      u_ValorFlete: this.h.r(value.u_ValorFlete, 0),
      u_FIB_TFLETE: this.h.r(value.u_FIB_TFLETE, 2),
      u_FIB_IMPSEG: this.h.r(value.u_FIB_IMPSEG, 2),
      u_FIB_PUERTO: this.h.p(value.u_FIB_PUERTO)
    });
  }

  private setVendedor(value: IOrdersQuery) {
    const item = this.h.findItem(this.salesPersonsList, value.slpCode);

    this.h.patch(this.modeloFormSal, {
      salesPersons  : item,
      u_NroOrden    : this.h.p(value.u_NroOrden),
      u_OrdenCompra : this.h.p(value.u_OrdenCompra),
      comments      : this.h.p(value.comments)
    });
  }

  private setTaxGroup(value: IOrdersQuery) {
    const shipToCode = (value.shipToCode ?? '').toString().trim();

    this.taxGroupSubscription?.unsubscribe();

    if (this.cardCode && shipToCode) {
      this.taxGroupSubscription = this.loadTaxGroup(this.cardCode, shipToCode)
        .pipe(take(1))
        .subscribe(tax => {
          this.taxCode  = tax?.code ?? '';
          this.vatPrcnt = Number(tax?.rate ?? 0);
        });
    } else {
      this.taxCode  = '';
      this.vatPrcnt = 0;
    }
  }

  private setTotales(value: IOrdersQuery) {
    this.h.patch(this.modeloFormTot, {
      subTotal : this.h.r(value.subTotal, 2),
      discPrcnt: this.h.r(value.discPrcnt, 2),
      discSum  : this.h.r(value.discSum, 2),
      vatSum   : this.h.r(value.vatSum, 2),
      docTotal : this.h.r(value.docTotal, 2),
    });
  }

  private setLines(value: IOrdersQuery) {
    this.buildColumns();

    this.modeloLines = (value.lines || [])
    .map(l => this.utilService.mapLine(l));

    this.modeloLinesOriginal = structuredClone(value.lines);

    this.modeloLinesAttachments = value.attachments2?.lines ?? [];
    if(this.modeloLinesAttachments.length === 0)
    {
      this.onAddLineAttachments(0);
    }

    this.updateHasValidLines();
  }

  //#endregion



  //#region <<< 30. SAVE >>>

  onClickSave(type: 'order' | 'draft') {
    this.confirmAndExecute(() => {

    if (type === 'order') {
      (this.wddStatus === 'Y' || this.wddStatus === '-')
        ? this.onToDraftToDocumentCreate()
        : this.onToOrderCreate();
    } else {
      this.isCreatedraft
        ? this.onToDraftCreate()
        : this.onToDraftUpdate();
    }

    });
  }

  private confirmAndExecute(action: () => void) {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then(({ isConfirmed }) => {
      if (!isConfirmed) return;
      if (!this.validatedSave()) return;

      this.isSaving = true;
      action();
    });
  }

  private validatedSave(): boolean {
    const showError = (message: string): boolean => {
      this.swaCustomService.swaMsgInfo(message);
      return false;
    };

    const f = this.mergeForms();


    /** 🔹 HEADER */
    if (!this.h.d(f.docDate)) {
      return showError('Ingrese la fecha de contabilidación.');
    }

    if (!this.h.d(f.docDueDate)) {
      return showError('Ingrese la fecha de vencimiento del documento.');
    }

    if (!this.h.d(f.taxDate)) {
      return showError('Ingrese la fecha del documento.');
    }

    if (!this.h.v(f.salesPersons)) {
      return showError('Seleccione el empleado de ventas.');
    }


    /** 🔹 DETALLE */
    for (let i = 0; i < this.modeloLines.length; i++) {
      const line = this.modeloLines[i];
      const row  = i + 1;

      const itemCode   = this.h.p(line.itemCode);
      const dscription = this.h.p(line.dscription);

      if (this.isItem) {
        if (!itemCode) {
          return showError(`Línea ${row}: Seleccione el artículo.`);
        }

        if (!this.h.p(line.whsCode)) {
          return showError(`Línea ${row} - Artículo ${itemCode}: Seleccione el almacén.`);
        }

        if (!this.h.p(line.unitMsr)) {
          return showError(`Línea ${row} - Artículo ${itemCode}: No tiene configurada una unidad de medida de venta. Para continuar, defínala en "Datos maestros de artículo" → pestaña "Datos de ventas".`);
        }

        if (!line.quantity || line.quantity <= 0) {
          return showError(`Línea ${row} - Artículo ${itemCode}: La cantidad debe ser mayor que cero (0).`);
        }
      }

      if (this.isService) {
        if (!dscription) {
          return showError(`Línea ${row}: Ingrese la descripción.`);
        }

        if (!this.h.p(line.acctCode)) {
          return showError(`Línea ${row} - Servicio ${dscription}: Seleccione la cuenta contable.`);
        }
      }

      /** comunes */
      const referencia = this.isItem
        ? `Artículo ${itemCode}`
        : `Servicio ${dscription}`;

      if (!this.h.p(line.taxCode)) {
        return showError(`Línea ${row} - ${referencia}: Seleccione el impuesto.`);
      }

      if (!this.h.p(line.u_tipoOpT12)) {
        return showError(`Línea ${row} - ${referencia}: Seleccione el tipo de operación.`);
      }
    }

    return true;
  }

  private executeRequest(request$: Observable<HttpEvent<any>>) {
    this.uploadProgress = 0;

    request$
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isSaving = false;
          this.uploadProgress = 0;
        })
      )
      .subscribe({
        next: (event) => {

          if (event.type === HttpEventType.UploadProgress && event.total) {
            this.uploadProgress = Math.round((event.loaded / event.total) * 100);
          }

          if (event.type === HttpEventType.Response) {
            this.swaCustomService.swaMsgExito(null);
            this.onClickBack();
          }
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'save', this.swaCustomService);
        }
      });
  }

  private onToOrderCreate() {
    this.executeRequest(
      this.ordersService.setCreate(this.buildModelToCreate(), this.uploadedFiles)
    );
  }

  private onToDraftCreate() {
    this.executeRequest(
      this.draftsService.setCreate(this.buildModelToCreate(), this.uploadedFiles)
    );
  }

  private onToDraftUpdate() {
    this.executeRequest(
      this.draftsService.setUpdate(this.buildModelToUpdate(), this.uploadedFiles)
    );
  }

  private onToDraftToDocumentCreate() {
    this.executeRequest(
      this.draftsService.setSaveDraftToDocument(this.buildDraftModelToDocumentCreate(), this.uploadedFiles)
    );
  }

  private buildBaseModel(): any {
    const f = this.mergeForms();

    return {
      docDate         : this.h.d(f.docDate),
      docDueDate      : this.h.d(f.docDueDate),
      taxDate         : this.h.d(f.taxDate),

      docType         : this.h.p(this.h.v(f.docTypes)),

      u_FIB_DocStPkg  : 'O',
      u_FIB_IsPkg     : this.isItem ? 'Y' : 'N',

      cardCode        : this.h.p(f.cardCode),
      cardName        : this.h.p(f.cardName),
      cntctCode       : this.h.n(f.cntctCode),

      docCur          : this.h.p(this.h.v(f.currencies)),
      docRate         : this.h.p(this.h.v(f.currencies)) === this.mainCurncy ? 1 : this.h.n(f.docRate),

      numAtCard       : this.h.p(f.numAtCard),

      payToCode       : this.h.p(this.h.l(f.payAddress)),
      address         : this.h.p(f.address),
      shipToCode      : this.h.p(this.h.l(f.shipAddress)),
      address2        : this.h.p(f.address2),

      groupNum        : this.h.n(this.h.v(f.paymentsTermsTypes)),

      u_BPP_MDCT      : this.h.p(this.u_BPP_MDCT),
      u_BPP_MDRT      : this.h.p(f.u_BPP_MDRT),
      u_BPP_MDNT      : this.h.p(f.u_BPP_MDNT),
      u_FIB_CODT      : this.h.p(this.h.l(f.agencyAddress)),
      u_BPP_MDDT      : this.h.p(f.u_BPP_MDDT),

      u_TipoFlete     : this.h.p(this.h.v(f.freightTypes)),
      u_ValorFlete    : this.h.n(f.u_ValorFlete),
      u_FIB_TFLETE    : this.h.n(f.u_FIB_TFLETE),
      u_FIB_IMPSEG    : this.h.n(f.u_FIB_IMPSEG),
      u_FIB_PUERTO    : this.h.p(f.u_FIB_PUERTO),
      u_FIB_NEMBA     : this.h.p(f.u_FIB_NEMBA),
      u_FIB_DEMBA     : this.h.p(f.u_FIB_DEMBA),

      slpCode         : this.h.n(this.h.v(f.salesPersons) ?? -1),

      u_NroOrden      : this.h.p(f.u_NroOrden),
      u_OrdenCompra   : this.h.p(f.u_OrdenCompra),
      comments        : this.h.p(f.comments),

      discPrcnt       : this.h.n(f.discPrcnt),
      discSum         : this.h.n(f.discSum),
      vatSum          : this.h.n(f.vatSum),
      docTotal        : this.h.n(f.docTotal)
    };
  }

  private buildModelToCreate(): any {
    return {
      ...this.buildBaseModel(),
      u_UsrCreate: this.userContextService.getIdUsuario(),

      attachments2: this.buildModelAttachments2(),
      lines: this.mapLinesCreate()
    };
  }

  private buildModelToUpdate(): any {
    return {
      ...this.buildBaseModel(),
      docEntry: this.docEntry,
      u_UsrUpdate: this.userContextService.getIdUsuario(),

      attachments2: this.buildModelAttachments2Update(),
      lines: this.mapLinesUpdate()
    };
  }

  private buildDraftModelToDocumentCreate(): any {
    return {
      ...this.buildBaseModel(),
      docEntry: this.docEntry,
      u_UsrCreate: this.userContextService.getIdUsuario(),

      attachments2: this.buildModelAttachments2(),
      lines: this.mapLinesCreate()
    };
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

  private buildModelAttachments2(): Attachments2CreateModel {
    return {
      absEntry: 0,
      lines: this.modeloLinesAttachments
        .filter(line => this.h.p(line.trgtPath) !== '')
        .map(line => ({
          trgtPath: this.h.p(line.trgtPath),
          fileName: this.h.p(line.fileName),
          fileExt : this.h.p(line.fileExt),
          date    : this.h.d(line.date)
        }))
    };
  }

  private buildModelAttachments2Update(): Attachments2UpdateModel {
    // ✅ SOLO NUEVOS Y EXISTENTES EN LA DB (record = 1 y 2)
    const nuevos = this.modeloLinesAttachments
    .filter(line => this.h.p(line.trgtPath) !== '')
    .map(line => ({
      absEntry : line.absEntry,
      trgtPath : this.h.p(line.trgtPath),
      fileName : this.h.p(line.fileName),
      fileExt  : this.h.p(line.fileExt),
      date     : this.h.d(line.date),
      record   : line.record
    }));

    // ✅ TODOS LOS ELIMINADOS (sin restricción)
    const eliminados = this.modeloLinesAttachmentsEliminate
    .map(line => ({
      absEntry : line.absEntry,
      trgtPath : this.h.p(line.trgtPath),
      fileName : this.h.p(line.fileName),
      fileExt  : this.h.p(line.fileExt),
      date     : this.h.d(line.date),
      record   : line.record
    }));

    // 🔥 UNIR
    const lines = [
      ...nuevos,
      ...eliminados
    ];

    return {
      absEntry: 0,
      lines
    };
  }

  private mapLinesCreate(): Orders1CreateModel[] {
    const f          = this.modeloFormSoc.getRawValue();

    return this.modeloLines
    .filter(line => this.isItem ? this.h.p(line.itemCode) !== '' : this.h.p(line.dscription) !== '')
    .map<Orders1CreateModel>(line => ({
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
    }));
  }

  private mapLinesUpdate(): Orders1UpdateModel[] {
    const f          = this.modeloFormSoc.getRawValue();

    return this.modeloLines
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
  //#endregion



  //#region <<< 31. NAVIGATION >>>

  onClickBack() {
    this.clearOrderLoadState();

    this.router.navigate(['/main/modulo-ven/panel-orden-venta-list']);
  }

  private clearOrderLoadState(): void {
    sessionStorage.removeItem(this.orderLoadStateKey);
  }

  //#endregion
}
