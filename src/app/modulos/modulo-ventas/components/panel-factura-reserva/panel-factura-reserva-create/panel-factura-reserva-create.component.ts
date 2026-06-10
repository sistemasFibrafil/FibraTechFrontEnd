import { SelectItem } from 'primeng/api';
import { FormGroup, FormBuilder } from '@angular/forms';
import { NavigationStart, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, switchMap, map, finalize, tap, take } from 'rxjs/operators';
import { Subject, forkJoin, of, from, EMPTY, Subscription, Observable, takeUntil, filter, combineLatest } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { ItemsFindByListCodeModel } from '@app/modulos/modulo-inventario/models/items.model';
import { Invoice1CreateModel, InvoiceCreateModel } from '@app/modulos/modulo-ventas/models/sap-business-one/invoice.model';

import { MenuItem, TableColumn } from '@app/interface/common-ui.interface';
import { IArticulo } from '@app/modulos/modulo-inventario/interfaces/items.interface';
import { IAddresses } from '@app/modulos/modulo-socios-negocios/interfaces/addresses.interface';
import { IExchangeRates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';
import { IBusinessPartnersQuery } from '@app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';
import { IInvoice1Query, IInvoiceQuery } from '@app/modulos/modulo-ventas/interfaces/sap-business-one/invoice.interface';
import { ITaxGroups } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/tax-groups.iterface';
import { IWarehouses } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { ISalesPersons } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IOperationsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/operation-type.interface';
import { IUserDefinedFields } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IDocumentTypeSunat } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/inicializacion-sistema/document-type-sunat.interface';
import { IPaymentTermsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/payment-terms-types.interface';
import { IDocumentNumberingSeriesSunat, IDocumentNumberingSeriesSunatQuery } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.interface';


import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { LocalDataService } from '@app/services/local-data.service';
import { UserContextService } from '@app/services/user-context.service';
import { ItemsService } from '@app/modulos/modulo-inventario/services/items.service';
import { AddressesService } from '@app/modulos/modulo-socios-negocios/services/addresses.service';
import { InvoicesService } from '@app/modulos/modulo-ventas/services/sap-business-one/invoices.service';
import { BusinessPartnersService } from '@app/modulos/modulo-socios-negocios/services/business-partners.service';
import { ExchangeRatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';
import { TaxGroupsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/finanzas/tax-groups.service';
import { SalesPersonsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { OperationsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/operation-type.service';
import { UserDefinedFieldsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { DocumentTypeSunatService } from '@app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-type-sunat.service';
import { PaymentTermsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/payment-terms-types.service';
import { DocumentNumberingSeriesService } from '@app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series.service';
import { DocumentNumberingSeriesSunatService } from '@app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.service';


@Component({
  selector: 'app-ven-panel-factura-reserva-create',
  templateUrl: './panel-factura-reserva-create.component.html',
  styleUrls: ['./panel-factura-reserva-create.component.css']
})
export class PanelFacturaReservaCreateComponent implements OnInit, OnDestroy {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly destroy$                     = new Subject<void>();
  private readonly h                            = this.utilService.getHelpers();
  private socioLoadSubscription                 : Subscription | null = null;
  private taxGroupSubscription                  : Subscription | null = null;
  private agenciaLoadSubscription               : Subscription | null = null;


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  // Acceso de botones
  buttonAccess                                  : ButtonAcces = new ButtonAcces();
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
  modeloFormCod                                 : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isLocked                                      : boolean = true;
  isSaving                                      : boolean = false;
  isDisplay                                     : boolean = false;
  hasValidLines                                 : boolean = false;
  manualTransport                               : boolean = true;
  isVisualizarBarcode                           : boolean = false;
  isVisualizarAlmacen                           : boolean = false;
  isVisualizarImpuesto                          : boolean = false;
  isVisualizarArticulo                          : boolean = false;
  isVisualizarCuentaContable                    : boolean = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  splitButtonItems                              : MenuItem[];

  columnas                                      : TableColumn[];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modeloLinesSelected                           : IInvoice1Query;

  modeloLines                                   : IInvoice1Query[] = [];


  // ===========================
  // 🔹 7. COMBOS / LISTS
  // ===========================
  docTypesList                                  : SelectItem[] = [];
  currencysList                                 : SelectItem[] = [];
  payAddressList                                : SelectItem[] = [];
  shipAddressList                               : SelectItem[] = [];
  freightTypesList                              : SelectItem[] = [];
  salesPersonsList                              : SelectItem[] = [];
  agencyAddressList                             : SelectItem[] = [];
  operationsTypesList                           : SelectItem[] = [];
  paymentsTermsTypesList                        : SelectItem[] = [];
  sunatDocumentsTypesList                       : SelectItem[] = [];


  // ===========================
  // 🔹 8. DOC TYPE CONTROL
  // ===========================
  docTypePrevious                               : any;
  docTypeSelected                               : any;


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
  sysRate                                       : number = 0;
  vatPrcnt                                      : number = 0;
  docEntry                                      : number = 0;
  cntctCode                                     : number = 0;
  idUsuario                                     : number = 0;
  indexAlmacen                                  : number = 0;
  indexImpuesto                                 : number = 0;
  indexArticulo                                 : number = 0;
  indexCuentaContable                           : number = 0;


  // ===========================
  // 🔹 10. TEXT / AUX / FILTERS
  // ===========================
  titulo                                        : string = 'Factura de Reserva';
  taxCode                                       : string = '';
  cardCode                                      : string = '';
  currency                                      : string = '';
  itemCode                                      : string = '';
  mainCurncy                                    : string = '';
  u_BPP_MDCT                                    : string = '';
  u_BPP_NDTD                                    : string = '';
  u_BPP_NDSD                                    : string = '';
  u_BPP_MDVC                                    : string = '';
  u_FIB_COD_TRA                                 : string = '';
  u_FIB_NUMDOC_COD                              : string = '';
  inactiveAlmacenItem                           : string = 'N';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly itemsService: ItemsService,
    private readonly invoicesService: InvoicesService,
    private readonly addressesService: AddressesService,
    private readonly taxGroupsService: TaxGroupsService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly operationsTypesService: OperationsTypesService,
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly paymentTermsTypesService: PaymentTermsTypesService,
    private readonly documentTypeSunatService: DocumentTypeSunatService,
    private readonly userDefinedFieldsService: UserDefinedFieldsService,
    private readonly documentNumberingSeriesService: DocumentNumberingSeriesService,
    private readonly DocumentNumberingSeriesSunatService: DocumentNumberingSeriesSunatService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  ngOnInit() {
    // 1️⃣ Inicializa UI
    this.initializeComponent();

    // 2️⃣ Escucha flecha atrás / adelante
    this.listenBrowserBack();
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
    this.wireTipoControl();
    this.wireDocTypeControl();
    this.wireCurrencyControl();
    this.wireNumAtCardBuilder();
    this.wireDiscountControls();
    this.wirePayAddressControl();
    this.wireShipAddressControl();
    this.wireAgencyAddressControl();
    this.wireFechaVencimientoByDocDate();
    this.wireFechaVencimientoByCondicionPago();

    // 4️⃣ Inicializar UI
    this.buildColumns();
    this.buildTableOptions();

    // 5️⃣ Inicializar líneas
    this.onAddLine(0);
  }

  private buildForms(): void {
    this.modeloFormSoc = this.fb.group({
      cardCode            : this.h.fc('', true),
      cardName            : this.h.fc('', true),
      cntctCode           : this.h.fc(),
      numAtCard           : this.h.fc(),
      currencys           : this.h.fc('', true),
      docRate             : this.h.fc(this.h.r(0, 3), true),
    });

    this.modeloFormDoc = this.fb.group({
      docNum              : this.h.fc(),
      docStatus           : this.h.fc('Abierto', true),
      sunatDocumentsTypes : this.h.fc('', true),
      u_BPP_MDSD          : this.h.fc('', true),
      u_BPP_MDCD          : this.h.fc('', true),
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
      u_FIB_EMBA          : this.h.fc(),
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

    this.modeloFormCod = this.fb.group({
      u_CodeBar           : this.h.fc(),
    });

    this.mainCurncy = this.userContextService.getMainCurncy();
  }

  private loadAllCombos(): void {
    this.idUsuario                          = this.userContextService.getIdUsuario();
    const paramFreightTypes                 : any = { tableID: 'OINV', aliasID: 'TipoFlete' };
    const paramSunatDocumentsTypes          : any = { u_FIB_ENTR: '', u_FIB_FAVE: 'Y', u_FIB_TRAN: '' };
    const paramDocumentNumberingSeries      : any = { objectCode: '13', docSubType: '--' };

    // Mostrar spinner mientras cargan los combos
    this.isDisplay = true;

    const docTypes = this.localDataService.docTypes;
    this.docTypesList = docTypes.map(s => ({ label: s.name, value: s.code }));

    const defaultDocType = this.docTypesList.find(x => x.value === 'I');
    if (defaultDocType) {
      this.docTypePrevious  = defaultDocType;
      this.docTypeSelected   = defaultDocType;
      this.modeloFormCon.get('docTypes').setValue(defaultDocType, { emitEvent: false });
      this.buildColumns();
    }

    forkJoin({
      freightTypes                  : this.userDefinedFieldsService.getList(paramFreightTypes).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      salesPersons                  : this.salesPersonsService.getList().pipe(catchError(() => of([] as ISalesPersons[]))),
      operationsTypes               : this.operationsTypesService.getList().pipe(catchError(() => of([] as IOperationsTypes[]))),
      paymentsTermsTypes            : this.paymentTermsTypesService.getList().pipe(catchError(() => of([] as IPaymentTermsTypes[]))),
      sunatDocumentsTypes           : this.documentTypeSunatService.getListByType(paramSunatDocumentsTypes).pipe(catchError(() => of([] as IDocumentTypeSunat[]))),
      documentNumberingSeries       : this.documentNumberingSeriesService.getNumero(paramDocumentNumberingSeries).pipe(catchError(() => of(null))),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {
        this.modeloFormDoc.patchValue({ docNum: res.documentNumberingSeries.nextNumber }, { emitEvent: false });

        this.freightTypesList        = (res.freightTypes || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.salesPersonsList        = (res.salesPersons || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.operationsTypesList     = (res.operationsTypes || []).map(item => ({ label: item.fullDescr, value: item.code }));
        this.paymentsTermsTypesList  = (res.paymentsTermsTypes || []).map(item => ({ label: item.pymntGroup, value: item.groupNum }));
        this.sunatDocumentsTypesList = (res.sunatDocumentsTypes || []).map(item => ({ label: item.u_BPP_TDDD, value: item.u_BPP_TDTD }));

        const defaultTipoDoc = res.sunatDocumentsTypes.find(item => item.u_FIB_FVDF === 'Y');
        if (defaultTipoDoc) {
          this.u_BPP_NDTD = defaultTipoDoc.u_BPP_TDTD;
          this.modeloFormDoc.get('sunatDocumentsTypes').setValue({
            label: defaultTipoDoc.u_BPP_TDDD,
            value: defaultTipoDoc.u_BPP_TDTD
          });

          const sunatDocumentsTypes = this.modeloFormDoc.controls['sunatDocumentsTypes'].value
          const u_BPP_TDDD = sunatDocumentsTypes?.value || sunatDocumentsTypes;

          if(u_BPP_TDDD) {
            this.getListSerieDocumento(u_BPP_TDDD);
          }
        }

        // AHORA SÍ cargar datos - los combos están listos
        this.loadData();
      },
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

  private buildTableOptions() {
    this.splitButtonItems = [
      { value: '1', label: 'Añadir línea',    icon: 'pi pi-plus',                   command: () => this.onClickAddLine() },
      { value: '2', label: 'Borrar línea',    icon: 'pi pi-trash',                  command: () => this.onClickDelete()  },
    ];
  }

  //#endregion



  //#region <<< 3. GETTERS >>>

  private get docType(): string {
    return this.modeloFormCon.get('docTypes')?.value?.value;
  }

  get isItem(): boolean {
    return this.docType === 'I';
  }

  get isService(): boolean {
    return this.docType === 'S';
  }

  //#endregion



  //#region <<< 4. TABLE / CONTEXT MENU >>>

  onSelectedItem(modelo: IInvoice1Query) {
    /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
  }

  private onClickAddLine(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    const insertIndex = index + 1;
    this.onAddLine(insertIndex);
  }

  private onClickDelete(): void {
    /** Elimina la línea seleccionada; agrega una vacía si quedan sin líneas */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }

    if (this.modeloLines.length === 0) {
      this.onAddLine(0);
    }

    this.updateHasValidLines();
  }

  private updateMenuVisibility(): void {
    const hasEmptyLines     = this.hasEmptyLine();
    const hasLines          = this.modeloLines.length > 0;

    const addLineOption     = this.splitButtonItems.find(x => x.value === '1');
    const deleteLineOption  = this.splitButtonItems.find(x => x.value === '2');

    if (addLineOption)    addLineOption.visible     = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible  = hasLines;
  }

  //#endregion



  //#region <<< 5. LINES (CORE) >>>

  private insertLine(index: number): void {
    const newLine: IInvoice1Query = this.createEmptyLine();

    this.modeloLines = [
      ...this.modeloLines.slice(0, index),
      newLine,
      ...this.modeloLines.slice(index)
    ];

    this.reindexLines();
    this.updateHasValidLines();
  }

  private reindexLines(): void {
    this.modeloLines = this.modeloLines.map((line, i) => ({
      ...line,
      lineNum: i
    }));
  }

  private createEmptyLine(): IInvoice1Query {
    return {
      docEntry          : 0,
        lineNum           : 0,
        lineStatus        : 'O',

        baseEntry         : 0,
        baseType          : 0,
        baseLine          : 0,

        u_FIB_FromPkg     : 'N',

        itemCode          : '',
        dscription        : '',
        acctCode          : '',
        formatCode        : '',
        acctName          : '',
        whsCode           : '',

        unitMsr           : '',
        onHand            : 0,
        quantity          : 0,
        openQty           : 0,
        u_FIB_OpQtyPkg    : 0,
        u_FIB_NBulto      : 0,
        u_FIB_PesoKg      : 0,

        currency          : '',
        priceBefDi        : 0,
        discPrcnt         : 0,
        price             : 0,
        taxCode           : '',
        vatPrcnt          : 0,
        vatSum            : 0,
        lineTotal         : 0,

        u_FIB_LinStPkg    : 'O',
        u_tipoOpT12       : '',
        u_tipoOpT12Nam    : '',

        record            : 1,
    };
  }

  private onAddLine(index: number): void {
    this.insertLine(index); // mismo comportamiento que antes
  }

  private updateHasValidLines(): void {
    this.hasValidLines =
      this.modeloLines.length > 0 &&
      !this.hasEmptyLine();
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

  //#endregion



  //#region <<< 6. DOC TYPE >>>

  private wireDocTypeControl(): void {
    this.modeloFormCon.get('docTypes')?.valueChanges
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
          this.onAddLine(0);

          this.docTypeSelected = docTyp;
          this.docTypePrevious = docTyp;

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



  //#region <<< 7. DOCUMENTO >>>

  private wireTipoControl(): void {
    this.modeloFormDoc.get('sunatDocumentsTypes')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((selected) => {
      this.u_BPP_NDTD = selected?.value ?? '';
      this.u_BPP_NDSD = '';

      this.modeloFormDoc.patchValue({
        u_BPP_MDSD: '',
        u_BPP_MDCD: ''
      }, { emitEvent: true });
    });
  }

  onClickSelectedSerieDocumento(value: any): void {
    this.modeloFormDoc.patchValue({
      u_BPP_MDSD: value.u_BPP_NDSD,
      u_BPP_MDCD: value.u_BPP_NDCD
    }, { emitEvent: true });
  }

  private getListSerieDocumento(u_BPP_NDTD: string): void {
    const params = {
      idUsuario: this.userContextService.getIdUsuario(),
      u_BPP_NDTD,
      u_BPP_NDCD: '',
      u_Delivery: '',
      u_SalesInvoices: 'Y',
      u_Transfer: ''
    };
    this.DocumentNumberingSeriesSunatService.getListSerieDocumento(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IDocumentNumberingSeriesSunatQuery[]) => {
          if(data.length > 0) {
            const defaultSerieDoc = data.find(item => item.u_Default === 'Y');

            if (defaultSerieDoc) {
              this.u_BPP_NDSD = defaultSerieDoc.u_BPP_NDSD;
              this.modeloFormDoc.patchValue({ 'u_BPP_MDSD': defaultSerieDoc.u_BPP_NDSD });

              const sunatDocumentsTypes = this.modeloFormDoc.controls['sunatDocumentsTypes'].value
              const u_BPP_TDDD = sunatDocumentsTypes?.value || sunatDocumentsTypes;

              if(u_BPP_TDDD) {
                const u_BPP_NDSD = this.modeloFormDoc.controls['u_BPP_MDSD'].value

                if(u_BPP_NDSD) {
                  this.getNumeroDocumentoByTipoSerie(u_BPP_TDDD, u_BPP_NDSD);
                }
              }
            }
          }
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'getListSerieDocumento', this.swaCustomService);
        }
      });
  }

  private getNumeroDocumentoByTipoSerie(u_BPP_NDTD: string, u_BPP_NDSD: string): void {
    const params = { u_BPP_NDTD: u_BPP_NDTD, u_BPP_NDSD: u_BPP_NDSD };
    this.DocumentNumberingSeriesSunatService.getNumeroDocumentoByTipoSerie(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IDocumentNumberingSeriesSunat) => {
          this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': data.u_BPP_NDCD });
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'getNumeroDocumentoByTipoSerie', this.swaCustomService);
        }
      });
  }

  private wireNumAtCardBuilder(): void {
    const tipo$   = this.modeloFormDoc.get('sunatDocumentsTypes')!.valueChanges;
    const serie$  = this.modeloFormDoc.get('u_BPP_MDSD')!.valueChanges;
    const numero$ = this.modeloFormDoc.get('u_BPP_MDCD')!.valueChanges;

    combineLatest([tipo$, serie$, numero$])
    .pipe(takeUntil(this.destroy$))
    .subscribe(([tipo, serie, numero]) => {

      const tipoVal   = tipo?.value ?? '';
      const serieVal  = serie ?? '';
      const numeroVal = numero ?? '';

      const numAtCard = [tipoVal, serieVal, numeroVal]
        .filter(v => !!v)
        .join('-');

      this.modeloFormSoc.patchValue(
        { numAtCard },
        { emitEvent: false }
      );
    });
  }

  //#endregion



  //#region <<< 8. BUSINESS PARTNER >>>

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
  this.currencysList    = monedas.map(m => ({ label: m.currName, value: m.currCode }));
  this.shipAddressList = shipAddr.map(d => ({ label: d.address, value: d.address }));
  this.payAddressList  = payAddr.map(d => ({ label: d.address, value: d.address }));

  this.setDefaultCurrency();
  this.setDefaultAddresses(socio);
  this.setDefaultPayment(socio);
  this.setDefaultSalesEmployee(socio);
}

  private setDefaultCurrency(): void {
    if (!this.currencysList.length) return;

    let preferred =
      this.currencysList.length === 1
        ? this.currencysList[0]
        : this.currencysList.find(c =>
            String(c.value).toUpperCase() === String(this.mainCurncy).trim().toUpperCase()
          );

    if (preferred) {
      this.currency = preferred.value;
      this.modeloFormSoc.get('currency')?.setValue(preferred, { emitEvent: false });
    }
  }

  private setDefaultAddresses(socio: IBusinessPartnersQuery): void {
    debugger;
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
      tipoCambio: this.currency ? this.loadTipoCambio(this.currency) : of(null),
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



  //#region <<< 9. CURRENCY / TIPO CAMBIO >>>

  private fetchTipoCambioRate(currCode: any): Observable<IExchangeRates | null> {
    const docDate: Date = this.modeloFormDoc?.controls['docDate']?.value;
    const currency      = String(currCode || '').trim().toUpperCase();
    const sysCurrncy    = this.userContextService.getSysCurrncy();

    const params: any = { rateDate: this.utilService.normalizeDateOrToday(docDate), currency: currency, sysCurrncy: sysCurrncy };
    return this.exchangeRatesService.getByDocDateAndCurrency(params)
    .pipe(
      map((data: IExchangeRates) => data ?? null),
      catchError(() => of(null))
    );
  }

  get isMainCurrency(): boolean {
    return !this.currency || this.currency === '##' || this.currency === this.mainCurncy;
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
    const selected  : any     = this.modeloFormSoc.controls['currency']?.value;
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
    this.loadTipoCambio(this.currency)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.calculateTotals();
    });
  }

  private wireCurrencyControl(): void {
    this.modeloFormSoc.get('currency')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(selected => {

      if (!selected) return;

      this.currency = selected?.value || '';

      this.refreshAfterCurrencyChange(); // 🔥 limpio
    });
  }

  //#endregion



  //#region <<< 10. ADDRESS / LOGÍSTICA >>>

  private wireShipAddressControl(): void {
    this.modeloFormLog.get('shipAddress')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),

      switchMap((selected) => {
        debugger;
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



  //#region <<< 11. TAX / IMPUESTOS >>>

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



  //#region <<< 12. FINANZAS >>>

  private wireFechaVencimientoByDocDate(): void {
  this.modeloFormDoc.get('taxDate')?.valueChanges
  .pipe(
    takeUntil(this.destroy$),
    switchMap(() => {
      const groupNum =
        this.modeloFormFin.get('paymentsTermsTypes')?.value?.value;

      return groupNum
        ? this.calcularFechaVencimientoPorCondicionPago$(groupNum)
        : of(null);
    })
  )
  .subscribe(fecha => {
    if (fecha) {
      this.modeloFormDoc.patchValue(
        { docDueDate: fecha },
        { emitEvent: false }
      );
    }
  });
}

  private wireFechaVencimientoByCondicionPago(): void {
    this.modeloFormFin.get('paymentsTermsTypes')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      map(v => v?.value),
      filter(Boolean),
      switchMap(groupNum =>
        this.calcularFechaVencimientoPorCondicionPago$(groupNum)
      )
    )
    .subscribe(fecha => {
      if (fecha) {
        this.modeloFormDoc.patchValue(
          { docDueDate: fecha },
          { emitEvent: false }
        );
      }
    });
  }

  private calcularFechaVencimiento(fechaDocumento: Date, extraMonth: number, extraDays: number): Date {
    let fecha = new Date(fechaDocumento);

    if (extraMonth > 0) {
      fecha.setMonth(fecha.getMonth() + extraMonth);
    }

    if (extraDays > 0) {
      fecha.setDate(fecha.getDate() + extraDays);
    }

    return fecha;
  }

  private calcularFechaVencimientoPorCondicionPago$(groupNum: number): Observable<Date | null> {
    const taxDate: Date =
      this.modeloFormDoc.get('taxDate')?.value;

    if (!groupNum || !taxDate) {
      return of(null);
    }

    return this.paymentTermsTypesService.getByCode(groupNum).pipe(
      map(term => {
        const extraMonth = Number(term?.extraMonth) || 0;
        const extraDays  = Number(term?.extraDays)  || 0;

        return this.calcularFechaVencimiento(taxDate, extraMonth, extraDays);
      }),
      catchError(() => of(null))
    );
  }


  //#endregion



  //#region <<< 13. AGENCY >>>

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
        debugger;
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

        debugger;

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



  //#region <<< 14. ARTÍCULO >>>

  onOpenArticulo(): boolean {
    const cardCodeValid = !!this.cardCode;

    return cardCodeValid;
  }

  onClickOpenArticulo(index: number) {
    if (!this.valTipoCambio()) return;
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

  private mapToOrderLine(element: any): IInvoice1Query {
    /** helpers para evitar repetición */
    const u          = this.utilService;
    const p          = (v:any)=>u.normalizePrimitive(v);
    const n          = (v:any)=>u.normalizeNumber(v);
    const val        = (v:any)=>v?.value ?? v;

    const f           = this.modeloFormSoc.getRawValue();

    return {
      itemCode       : p(element.itemCode),
      dscription     : p(element.itemName),
      whsCode        : p(element.dfltWH),
      unitMsr        : p(element.salUnitMsr),
      onHand         : n(element.onHand),
      currency       : p(val(f.currency)),
      priceBefDi     : n(element.priceBefDi),
      discPrcnt      : n(element.discPrcnt),
      price          : n(element.price),
      taxCode        : p(this.taxCode),
      vatPrcnt       : n(this.vatPrcnt),
      u_tipoOpT12    : p(element.u_tipoOpT12),
      u_tipoOpT12Nam : p(element.u_tipoOpT12Nam),
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
        record: line.record === 1 ? 1 : 2
      };
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
      currency            : this.currency,
      operationTypeCode   : '01',
      warehouseType       : 'P'
    };
  }

  onDescChange(value: IInvoice1Query) {
    if (!this.valTipoCambio())
      {
        value.dscription = '';
        return;
      };
    this.updateHasValidLines();
  }

  //#endregion



  //#region <<< 15. CUENTA CONTABLE >>>

  onOpenCuentaContable(index: number): void {
    this.indexCuentaContable  = index;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  onSelectedCuentaContable(value: any): void {
    const formValue = this.modeloFormSoc.getRawValue();
    const currency  = formValue.currency?.value || formValue.currency || '';

    const currentLine               = this.modeloLines[this.indexCuentaContable];
    currentLine.acctCode            = value.acctCode;
    currentLine.formatCode          = value.formatCode;
    currentLine.acctName            = value.acctName;
    currentLine.currency            = currency;
    currentLine.taxCode             = this.taxCode;
    currentLine.vatPrcnt            = this.vatPrcnt;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  onClickCloseCuentaContable(): void {
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  //#endregion



  //#region <<< 16. ALMACÉN >>>

  onClickOpenAlmacen(index: number) {
    this.indexAlmacen = index;
    this.itemCode = this.modeloLines[this.indexAlmacen].itemCode;
    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;
  }

  onToAlmacenSelected(value: IWarehouses) {
    this.modeloLines[this.indexAlmacen].whsCode  = value.whsCode;
    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;
  }

  onClickCloseAlmacen()
  {
    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;
  }

  //#endregion



  //#region <<< 17. IMPUESTO >>>

  onClickOpenImpuesto(index: number) {
    this.indexImpuesto = index;
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  onClickSelectedImpuesto(value: ITaxGroups) {
    this.modeloLines[this.indexImpuesto].taxCode      = value.code;
    this.modeloLines[this.indexImpuesto].vatPrcnt     = value.rate;
    this.calculateTotalLine(this.modeloLines[this.indexImpuesto], this.indexImpuesto);
    this.calculateTotals();
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  onClickCloseImpuesto()
  {
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  //#endregion



  //#region <<< 18. CALCULOS EN LÍNEAS >>>

  onChangeQuantity(value: IInvoice1Query, index: number)
  {
    this.calculateTotalLine(value, index);
    this.calculateTotals();
  }

  onChangePrice(value: IInvoice1Query, index: number)
  {
    this.calculateTotalLine(value, index);
    this.calculateTotals();
  }

  onChangeDiscPrcnt(value: IInvoice1Query, index: number)
  {
    this.calculateTotalLine(value, index);
    this.calculateTotals();
  }

  roundDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  }

  truncateDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.trunc(value * factor) / factor;
  }

  calculateTotalLine(value: IInvoice1Query, index: number): void {
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



  //#region <<< 19. RESET / LIMPIEZA >>>

  private resetAll(): void {
    this.clearLoadSubscriptions();
    this.resetHeaderState();
    this.resetDependentLists();
    this.resetForms();
    this.resetLines();
    this.markAllFormsPristineUntouched();
  }

  private clearLoadSubscriptions(): void {
    this.taxGroupSubscription?.unsubscribe();
    this.taxGroupSubscription = null;

    this.socioLoadSubscription?.unsubscribe();
    this.socioLoadSubscription = null;

    this.agenciaLoadSubscription?.unsubscribe();
    this.agenciaLoadSubscription = null;
  }

  private resetHeaderState(): void {
    this.cardCode   = '';
    this.cntctCode  = 0;
    this.taxCode    = '';
    this.vatPrcnt   = 0;
    this.sysRate    = 0;
    this.currency   = '';
    this.itemCode   = '';
    this.u_BPP_MDCT = '';
  }

  private resetDependentLists(): void {
    this.currencysList     = [];
    this.shipAddressList   = [];
    this.payAddressList    = [];
    this.agencyAddressList = [];
  }

  private resetForms(): void {
    const defaultDocType = this.docTypesList?.find(x => x.value === 'I') ?? null;
    const currentDocNum  = this.modeloFormDoc.get('docNum')?.value ?? '';
    const currentFreight = this.modeloFormExp.get('freightTypes')?.value ?? '';

    this.docTypeSelected = defaultDocType;
    this.docTypePrevious = defaultDocType;

    this.modeloFormSoc.reset({
      cardCode  : '',
      cardName  : '',
      cntctCode : '',
      numAtCard : '',
      currencys : '',
      docRate   : this.h.r(0, 3),
    }, { emitEvent: false });

    this.modeloFormDoc.reset({
      docNum     : currentDocNum,
      docStatus  : 'Abierto',
      docDate    : new Date(),
      docDueDate : null,
      taxDate    : new Date(),
    }, { emitEvent: false });

    this.modeloFormCon.reset({
      docTypes: defaultDocType,
    }, { emitEvent: false });

    this.modeloFormLog.reset({
      shipAddress : '',
      address2    : '',
      payAddress  : '',
      address     : '',
    }, { emitEvent: false });

    this.modeloFormFin.reset({
      paymentsTermsTypes: '',
    }, { emitEvent: false });

    this.modeloFormAge.reset({
      u_BPP_MDCT    : '',
      u_BPP_MDRT    : '',
      u_BPP_MDNT    : '',
      agencyAddress : '',
      u_BPP_MDDT    : '',
    }, { emitEvent: false });

    this.modeloFormExp.reset({
      freightTypes : currentFreight,
      u_ValorFlete : this.h.r(0, 0),
      u_FIB_TFLETE : this.h.r(0, 2),
      u_FIB_IMPSEG : this.h.r(0, 2),
      u_FIB_PUERTO : '',
      u_FIB_EMBA   : '',
    }, { emitEvent: false });

    this.modeloFormSal.reset({
      salesPersons  : '',
      u_NroOrden    : '',
      u_OrdenCompra : '',
      comments      : '',
    }, { emitEvent: false });

    this.modeloFormTot.reset({
      subTotal  : this.h.r(0, 2),
      discPrcnt : this.h.r(0, 2),
      discSum   : this.h.r(0, 2),
      vatSum    : this.h.r(0, 2),
      docTotal  : this.h.r(0, 2),
    }, { emitEvent: false });
  }

  private resetLines(): void {
    this.buildColumns();

    this.modeloLines = [];
    this.onAddLine(0);
    this.modeloLinesSelected = this.modeloLines[0];

    this.calculateTotals();
    this.updateMenuVisibility();
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
    ];

    for (const fg of forms) {
      fg.markAsPristine();
      fg.markAsUntouched();
      fg.updateValueAndValidity({ emitEvent: false });
    }
  }

  //#endregion



  //#region <<< 20. LOAD DATA >>>

  private loadData(): void {
    const mode = history.state?.mode;

    // 🆕 CREAR NUEVO → no necesita data
    if (mode === 'create') {
      return;
    }

    // 📋 COPIA
    let ordenVenta = history.state?.ordenVenta;

    if (!ordenVenta) {
      const cache = sessionStorage.getItem('ordenVentaCopyTo');
      ordenVenta = cache ? JSON.parse(cache) : null;
    }

    if (!ordenVenta) {
      // Cuando se pierde la información de entrega, se regresa a la página principal
      this.onClickBack();
      return;
    }

    this.setFormValues(ordenVenta);
  }

  private setFormValues(value: IInvoiceQuery): void {
    this.setHeaderState(value);
    this.setSocioForm(value);
    this.setTipoCambio(value);
    this.setDocumentoForm(value);
    this.setCondiciones(value);
    this.setDirecciones(value);
    this.setAgencia(value);
    this.setExportacion(value);
    this.setVendedor(value);
    this.setTaxGroup(value);
    this.setLines(value);
  }

  private setHeaderState(value: IInvoiceQuery): void {
    this.docEntry   = value.docEntry;
    this.cardCode   = this.h.p(value.cardCode);
    this.currency   = this.h.p(value.docCur);
    this.cntctCode  = value.cntctCode;
    this.u_BPP_MDCT = this.h.p(value.u_BPP_MDCT);
  }

  private setSocioForm(value: IInvoiceQuery): void {
    this.currencysList = (value.currencyList || [])
      .map(m => ({ label: m.currName, value: m.currCode }));

    const currencyItem = this.h.findItem(this.currencysList, value.docCur);

    this.h.patch(this.modeloFormSoc, {
      cardCode : this.h.p(value.cardCode),
      cardName : this.h.p(value.cardName),
      cntctCode: value.cntctCode,
      numAtCard: this.h.p(value.numAtCard),
      currencys: currencyItem || null
    });
  }

  private setTipoCambio(value: IInvoiceQuery): void {
    if (!value.docCur) return;

    this.loadTipoCambio(value.docCur)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
  }

  private setDocumentoForm(value: IInvoiceQuery): void {
    const docTypeItem = this.h.findItem(this.docTypesList, value.docType);
    this.docTypeSelected = docTypeItem;

    this.h.patch(this.modeloFormCon, {
      docTypes: docTypeItem || null
    });
  }

  private setCondiciones(value: IInvoiceQuery): void {
    const item = this.h.findItem(this.paymentsTermsTypesList, value.groupNum);

    this.h.patch(this.modeloFormFin, {
      paymentsTermsTypes: item || null
    });

    if (!value.groupNum) return;

    this.calcularFechaVencimientoPorCondicionPago$(value.groupNum)
      .pipe(takeUntil(this.destroy$))
      .subscribe(fecha => {
        if (fecha) {
          this.h.patch(this.modeloFormDoc, {
            docDueDate: fecha
          });
        }
      });
  }

  private setDirecciones(value: IInvoiceQuery): void {
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

  private setAgencia(value: IInvoiceQuery): void {
    this.agencyAddressList = (value.agencyAddressList || [])
      .map(d => ({ label: d.address, value: d }));

    const agency = this.agencyAddressList
      .find(item => item.label === value.u_FIB_CODT);

    this.h.patch(this.modeloFormAge, {
      u_BPP_MDCT   : this.h.p(value.u_BPP_MDCT),
      u_BPP_MDRT   : this.h.p(value.u_BPP_MDRT),
      u_BPP_MDNT   : this.h.p(value.u_BPP_MDNT),
      agencyAddress: agency || null,
      u_BPP_MDDT   : this.h.p(value.u_BPP_MDDT)
    });
  }

  private setExportacion(value: IInvoiceQuery): void {
    const item = this.h.findItem(this.freightTypesList, value.u_TipoFlete);

    this.h.patch(this.modeloFormExp, {
      freightTypes  : item || null,
      u_ValorFlete  : this.h.r(value.u_ValorFlete, 0),
      u_FIB_TFLETE  : this.h.r(value.u_FIB_TFLETE, 2),
      u_FIB_IMPSEG  : this.h.r(value.u_FIB_IMPSEG, 2),
      u_FIB_PUERTO  : this.h.p(value.u_FIB_PUERTO)
    });
  }

  private setVendedor(value: IInvoiceQuery): void {
    const item = this.h.findItem(this.salesPersonsList, value.slpCode);

    this.h.patch(this.modeloFormSal, {
      salesPersons : item || null,
      u_NroOrden   : this.h.p(value.u_NroOrden),
      u_OrdenCompra: this.h.p(value.u_OrdenCompra),
      comments     : this.h.p(value.comments)
    });
  }

  private setTaxGroup(value: IInvoiceQuery) {
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

  private setLines(value: IInvoiceQuery): void {
    this.buildColumns();

    this.modeloLines = (value.lines || [])
    .map(l => this.utilService.mapLine(l));

    this.updateHasValidLines();

    this.modeloLines.forEach((line, index) => {
      this.calculateTotalLine(line, index);
    });

    this.calculateTotals();
  }

  //#endregion



  //#region <<< 21. SAVE >>>

  validatedSave(): boolean {
    /** muestra error y detiene validación */
    const showError = (msg: string): boolean => {
      this.swaCustomService.swaMsgInfo(msg);
      return false;
    };

    /** helpers para evitar repetición */
    const u     = this.utilService;
    const p     = (v:any)=>u.normalizePrimitive(v);
    const n     = (v:any)=>u.normalizeNumber(v);
    const val   = (v:any)=>v?.value ?? v;

    /** obtener valores del formulario */
    const f = this.modeloFormCon.getRawValue();

    const docTypes   = p(val(f.docTypes));
    const isItemDoc = docTypes === 'I';

    for (const line of this.modeloLines) {

      const itemCode   = p(line.itemCode);
      const dscription = p(line.dscription);

      /** ignorar líneas vacías */
      if (isItemDoc ? itemCode === '' : dscription === '') continue;

      const acctCode = p(line.acctCode);
      const whsCode  = p(line.whsCode);
      const taxCode  = p(line.taxCode);
      const tipoOp   = p(line.u_tipoOpT12);
      const quantity = n(line.quantity);

      if (!isItemDoc && acctCode === '')
        return showError('Seleccione la cuenta contable en el detalle.');

      if (isItemDoc && whsCode === '')
        return showError('Seleccione el almacén para el artículo en el detalle.');

      if (isItemDoc && quantity <= 0)
        return showError('La cantidad debe ser mayor que CERO (0) en el detalle.');

      if (taxCode === '')
        return showError('Seleccione el impuesto para el artículo en el detalle.');

      if (tipoOp === '')
        return showError('Seleccione el tipo de operación para el artículo en el detalle.');
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

  private mapLinesCreate(isItemDoc:boolean): Invoice1CreateModel[] {
    const f          = this.modeloFormSoc.getRawValue();

    return this.modeloLines
    .filter(line => isItemDoc ? this.h.p(line.itemCode) !== '' : this.h.p(line.dscription) !== '')
    .map<Invoice1CreateModel>(line => ({
      baseType        : line.baseType == null || line.baseType === 0 ? -1   : this.h.n(line.baseType),
      baseEntry       : line.baseType == null || line.baseType === 0 ? null : this.h.n(line.baseEntry),
      baseLine        : line.baseType == null || line.baseType === 0 ? null : this.h.n(line.baseLine),

      itemCode        : this.h.p(line.itemCode),
      dscription      : this.h.p(line.dscription),

      acctCode        : this.h.p(line.acctCode),
      formatCode      : this.h.p(line.formatCode),
      acctName        : this.h.p(line.acctName),

      whsCode         : this.h.p(line.whsCode),

      unitMsr         : this.h.p(line.unitMsr),
      quantity        : this.h.n(line.quantity),

      currency        : this.h.p(line.currency) || this.h.p(this.h.v(f.currencys)),
      priceBefDi      : this.h.n(line.priceBefDi),
      discPrcnt       : this.h.n(line.discPrcnt),
      price           : this.h.n(line.price),

      taxCode         : this.h.p(line.taxCode),
      lineTotal       : this.h.n(line.lineTotal),

      u_FIB_OpQtyPkg  : this.h.n(line.u_FIB_OpQtyPkg),
      u_tipoOpT12     : this.h.p(line.u_tipoOpT12),
    }));
  }

  private buildModelToSave(): InvoiceCreateModel {
    const f           = this.mergeForms();

    const docCur      = this.h.p(this.h.v(f.currencys));
    const docTypes     = this.h.p(this.h.v(f.docTypes));

    const userId      = this.userContextService.getIdUsuario();

    const docRate     = docCur === this.mainCurncy ? 1 : this.h.n(f.docRate);

    const isItemDoc   = docTypes === 'I';

    const lines       = this.mapLinesCreate(isItemDoc);

    return {
      ...new InvoiceCreateModel(),

      docDate         : this.h.d(f.docDate),
      docDueDate      : this.h.d(f.docDueDate),
      taxDate         : this.h.d(f.taxDate),
      reserveInvoice  : 'Y',
      docType         : docTypes,

      // SUNAT
      u_BPP_MDTD      : this.h.p(this.h.v(f.sunatDocumentsTypes)),
      u_BPP_MDSD      : this.h.p(f.u_BPP_MDSD),
      u_BPP_MDCD      : this.h.p(f.u_BPP_MDCD),

      // SOCIO DE NEGOCIOS
      cardCode        : this.h.p(f.cardCode),
      cardName        : this.h.p(f.cardName),
      cntctCode       : this.h.n(f.cntctCode),
      numAtCard       : this.h.p(f.numAtCard),
      docCur          : docCur,
      docRate         : docRate,

      // LOGISTICA
      payToCode       : this.h.p(this.h.l(f.payAddress)),
      address         : this.h.p(f.address),
      shipToCode      : this.h.p(this.h.l(f.shipAddress)),
      address2        : this.h.p(f.address2),

      // FINANZAS
      groupNum        : this.h.n(this.h.v(f.paymentsTermsTypes)),

      // AGENCIA
      u_BPP_MDCT      : this.h.p(f.u_BPP_MDCT),
      u_BPP_MDRT      : this.h.p(f.u_BPP_MDRT),
      u_BPP_MDNT      : this.h.p(f.u_BPP_MDNT),
      u_FIB_CODT      : this.h.p(this.h.l(f.agencyAddress)),
      u_BPP_MDDT      : this.h.p(f.u_BPP_MDDT),

      // EXPORTACION
      u_TipoFlete     : this.h.p(this.h.v(f.freightTypes)),
      u_ValorFlete    : this.h.n(f.u_ValorFlete),
      u_FIB_TFLETE    : this.h.n(f.u_FIB_TFLETE),
      u_FIB_IMPSEG    : this.h.n(f.u_FIB_IMPSEG),
      u_FIB_PUERTO    : this.h.p(f.u_FIB_PUERTO),
      u_FIB_EMBA      : this.h.p(f.u_FIB_EMBA),

      // VENDEDOR
      slpCode         : this.h.n(this.h.v(f.salesPersons) ?? -1),

      u_NroOrden      : this.h.p(f.u_NroOrden),
      u_OrdenCompra   : this.h.p(f.u_OrdenCompra),
      comments        : this.h.p(f.comments),

      // TOTALES
      discPrcnt       : this.h.n(f.discPrcnt),
      docTotal        : this.h.n(f.docTotal),

      // AUDITORÍA
      u_UsrCreate     : userId,

      lines
    };
  }

  onToSave() {
    if(!this.validatedSave()) return;

    this.isSaving = true;

    const modeloToSave = this.buildModelToSave();

    this.invoicesService.setCreate(modeloToSave)
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

  //#endregion



  //#region <<< 22. NAVEGACIÓN >>>

  private clearSession(): void {
    sessionStorage.removeItem('ordenVentaCopyTo');
  }

  onClickBack(): void {
    this.clearSession();
    this.router.navigate(['/main/modulo-ven/panel-factura-reserva-list']);
  }

  //#endregion
}
