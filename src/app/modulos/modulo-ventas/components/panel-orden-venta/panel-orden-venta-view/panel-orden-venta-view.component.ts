import { SelectItem } from 'primeng/api';
import { FormGroup, FormBuilder } from '@angular/forms';
import { Subject, forkJoin, of, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, switchMap, finalize } from 'rxjs/operators';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { TableColumn } from '@app/interface/common-ui.interface';
import { IAttachments2LinesQuery } from '../../../interfaces/sap-business-one/attachments2.interface';
import { IOrdenVenta1Query, IOrdersQuery } from '@app/modulos/modulo-ventas/interfaces/sap-business-one/orders.interface';
import { ISalesPersons } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IOperationsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/operation-type.interface';
import { IUserDefinedFields } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IPaymentTermsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/payment-terms-types.interface';
import { PaymentTermsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/payment-terms-types.service';

import { UtilService } from '@app/services/util.service';
import { LocalDataService } from '@app/services/local-data.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { OrdersService } from '@app/modulos/modulo-ventas/services/sap-business-one/orders.service';
import { SalesPersonsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { OperationsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/operation-type.service';
import { UserDefinedFieldsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';



@Component({
  selector: 'app-ven-panel-orden-venta-view',
  templateUrl: './panel-orden-venta-view.component.html',
  styleUrls: ['./panel-orden-venta-view.component.css']
})
export class PanelOrdenVentaViewComponent implements OnInit, OnDestroy {
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
  modeloFormSoc                                 : FormGroup;
  modeloFormDoc                                 : FormGroup;
  modeloFormCon                                 : FormGroup;
  modeloFormLog                                 : FormGroup;
  modeloFormFin                                 : FormGroup;
  modeloFormAge                                 : FormGroup;
  modeloFormExp                                 : FormGroup;
  modeloFormSal                                 : FormGroup;
  modeloFormTot                                 : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isDisplay                                     : boolean = false;
  isLoadingInitialData                          : boolean = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  columnas                                      : TableColumn[];

  columnasAttachments                           : TableColumn[];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modeloLines                                   : IOrdenVenta1Query[] = [];
  modeloLinesAttachments                        : IAttachments2LinesQuery[] = [];


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
  operationsTypesList                           : SelectItem[] = [];
  paymentsTermsTypesList                        : SelectItem[] = [];


  // ===========================
  // 🔹 8. DOC TYPE CONTROL
  // ===========================
  docTypeSelected                               : any;


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
  id                                            : number = 0;
  docEntry                                      : number = 0;
  cntctCode                                     : number = 0;


  // ===========================
  // 🔹 10. AUX / FILTERS
  // ===========================
  titulo                                        : string = 'Orden de Venta';
  cardCode                                      : string = '';
  currency                                      : string = '';
  mainCurncy                                    : string = '';
  u_BPP_MDCT                                    : string = '';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly ordersService: OrdersService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly operationsTypesService: OperationsTypesService,
    private readonly paymentTermsTypesService: PaymentTermsTypesService,
    private readonly userDefinedFieldsService: UserDefinedFieldsService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion



  //#region <<< 2. INITIALIZATION >>>

  private initializeComponent(): void {
    // 1️⃣ Crear formularios
    this.buildForms();

    // 2️⃣ Cargar datos base
    this.onBuildColumn();
    this.onBuildColumnAttachments();

    // 3️⃣ Inicializar UI
    this.loadAllCombos();
  }

  private buildForms(): void {
    const r = (value: number, dec: number) => this.utilService.onRedondearDecimalConCero(value, dec);

    const fc = this.utilService.fc.bind(this.utilService);

    this.modeloFormSoc = this.fb.group({
      cardCode  : fc('', true),
      cardName  : fc('', true),
      cntctCode : fc(),
      numAtCard : fc(),
      docCur    : fc('', true),
      docRate   : fc(r(0, 3), true),
    });

    this.modeloFormDoc = this.fb.group({
      docNum     : fc(),
      docStatus  : fc('Abierto', true),
      docDate    : fc(null, true),
      docDueDate : fc(null, true),
      taxDate    : fc(null, true),
    });

    this.modeloFormCon = this.fb.group({
      docType: fc('', true),
    });

    this.modeloFormLog = this.fb.group({
      shipAddress : fc(),
      address2    : fc(),
      payAddress  : fc(),
      address     : fc(),
    });

    this.modeloFormFin = this.fb.group({
      paymentsTermsTypes: fc('', true),
    });

    this.modeloFormAge = this.fb.group({
      u_BPP_MDCT    : fc(),
      u_BPP_MDRT    : fc(),
      u_BPP_MDNT    : fc(),
      agencyAddress : fc(),
      u_BPP_MDDT    : fc(),
    });

    this.modeloFormExp = this.fb.group({
      freightType  : fc(),
      u_ValorFlete : fc(r(0, 0)),
      u_FIB_TFLETE : fc(r(0, 2)),
      u_FIB_IMPSEG : fc(r(0, 2)),
      u_FIB_PUERTO : fc(),
      u_FIB_NEMBA  : fc(),
      u_FIB_DEMBA  : fc(),
    });

    this.modeloFormSal = this.fb.group({
      salesPersons   : fc('', true),
      u_NroOrden     : fc(),
      u_OrdenCompra  : fc(),
      comments       : fc(),
    });

    this.modeloFormTot = this.fb.group({
      subTotal  : fc(r(0, 2)),
      discPrcnt : fc(r(0, 2)),
      discSum   : fc(r(0, 2)),
      vatSum    : fc(r(0, 2)),
      docTotal  : fc(r(0, 2)),
    });

    this.mainCurncy = this.userContextService.getMainCurncy();
  }

  private onBuildColumn() {
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

  private onBuildColumnAttachments() {
    this.columnasAttachments = [
      { field: 'trgtPath',        header: 'Vía de acceso destino' },
      { field: 'fileName',        header: 'Nombre de archivo' },
      { field: 'date',            header: 'Fecha del anexo' },
    ];
  }

  private loadAllCombos(): void {
    const paramTipoFlete = { tableID: 'ORDR', aliasID: 'TipoFlete' };

    this.isDisplay = true;
    this.loadLocalCombos();

    forkJoin({
      groups          : this.paymentTermsTypesService.getList().pipe(catchError(() => of([] as IPaymentTermsTypes[]))),
      tipoFlete       : this.userDefinedFieldsService.getList(paramTipoFlete).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      salesPersons    : this.salesPersonsService.getList().pipe(catchError(() => of([] as ISalesPersons[]))),
      operationsTypes : this.operationsTypesService.getList().pipe(catchError(() => of([] as IOperationsTypes[]))),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (res) => {
        this.freightTypeList        = (res.tipoFlete || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.salesPersonsList       = (res.salesPersons || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.operationsTypesList    = (res.operationsTypes || []).map(item => ({ label: item.fullDescr, value: item.code }));
        this.paymentsTermsTypesList = (res.groups || []).map(item => ({ label: item.pymntGroup, value: item.groupNum }));

        this.loadData(); // separado, como en tus otros componentes
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  private loadLocalCombos(): void {
    this.docTypesList = this.localDataService.docTypes
      .map(s => ({ label: s.name, value: s.code }));

    const defaultDocType = this.docTypesList.find(x => x.value === 'I');

    if (defaultDocType) {
      this.docTypeSelected = defaultDocType;
      this.modeloFormCon.get('docType')?.setValue(defaultDocType, { emitEvent: false });
      this.onBuildColumn();
    }
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



  //#region <<< 4. CURRENCY / TIPO CAMBIO >>>

  get isMainCurrency(): boolean {
    return !this.currency || this.currency === '##' || this.currency === this.mainCurncy;
  }

  get currencyColClass(): string {
    return this.isMainCurrency ? 'col-12 md:col-12' : 'col-12 md:col-6';
  }

  //#endregion



  //#region <<< 5. LOAD DATA (EDICIÓN) >>>

  private loadData(): void {
    this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.id = +params['id'];

        this.isDisplay = true;

        return this.ordersService
          .getByDocEntry(this.id)
          .pipe(
            finalize(() => { this.isDisplay = false; })
          );
      })
    )
    .subscribe({
      next: (data: IOrdersQuery) => {
        this.setFormValues(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: IOrdersQuery): void {
    this.isLoadingInitialData = true;

    const h = this.getHelpers();

    this.setHeader(value, h);
    this.setSocioForm(value, h);
    this.setDocumentoForm(value, h);
    this.setCondicionesForm(value, h);
    this.setDireccionesForm(value, h);
    this.setAgenciaForm(value, h);
    this.setExportacionForm(value, h);
    this.setVendedorForm(value, h);
    this.setTotalesForm(value, h);
    this.setLines(value, h);

    this.isLoadingInitialData = false;
  }

  private getHelpers() {
    const {
      normalizePrimitive: n,
      onRedondearDecimalConCero,
      normalizeDate: toDate,
      findSelectItem: findItem,
      patchForm: patch
    } = this.utilService;

    const r = (v: number, d: number) =>
      onRedondearDecimalConCero(v ?? 0, d);

    return { n, toDate, findItem, patch, r };
  }

  private setHeader(value: IOrdersQuery, h: any): void {
    const statusMap: Record<string, string> = {
      A: '[Autorizado]',
      P: '[Autorizado]',
      Y: '[Autorizado]',
      W: '[Pendiente]'
    };

    const wddStatus  = h.n(value.wddStatus);
    const statusName = statusMap[wddStatus] || '';

    if (wddStatus !== '-') {
      this.titulo = `Orden de Venta ${statusName}`.trim();
    }

    this.docEntry   = value.docEntry;
    this.cardCode   = h.n(value.cardCode);
    this.cntctCode  = value.cntctCode;
    this.currency   = h.n(value.docCur);
    this.u_BPP_MDCT = h.n(value.u_BPP_MDCT);
  }

  private setSocioForm(value: IOrdersQuery, h: any): void {
    this.currencyList = (value.currencyList || [])
      .map(m => ({ label: m.currName, value: m.currCode }));

    const currencyItem = h.findItem(this.currencyList, value.docCur);

    h.patch(this.modeloFormSoc, {
      cardCode : h.n(value.cardCode),
      cardName : h.n(value.cardName),
      cntctCode: value.cntctCode,
      numAtCard: h.n(value.numAtCard),
      docCur   : currencyItem,
      docRate  : h.r(value.docRate, 3),
    });
  }

  private setDocumentoForm(value: IOrdersQuery, h: any): void {
    const docStatus = h.n(value.docStatus);

    h.patch(this.modeloFormDoc, {
      docNum    : h.n(value.docNum),
      docStatus : docStatus === 'O' ? 'Abierto' : 'Cerrado',
      docDate   : h.toDate(value.docDate),
      docDueDate: h.toDate(value.docDueDate),
      taxDate   : h.toDate(value.taxDate),
    });

    const docTypeItem = h.findItem(this.docTypesList, value.docType);
    this.docTypeSelected = docTypeItem;

    h.patch(this.modeloFormCon, {
      docType: docTypeItem
    });
  }

  private setCondicionesForm(value: IOrdersQuery, h: any): void {
    const payment = h.findItem(this.paymentsTermsTypesList, value.groupNum);

    h.patch(this.modeloFormFin, {
      paymentsTermsTypes: payment
    });
  }

  private setDireccionesForm(value: IOrdersQuery, h: any): void {
    this.shipAddressList = (value.shipAddressList || [])
      .map(d => ({ label: d.address, value: d.address }));

    this.payAddressList = (value.payAddressList || [])
      .map(d => ({ label: d.address, value: d.address }));

    const ship = h.findItem(this.shipAddressList, value.shipToCode);
    const pay  = h.findItem(this.payAddressList, value.payToCode);

    h.patch(this.modeloFormLog, {
      shipAddress: ship,
      address    : h.n(value.address),
      payAddress : pay,
      address2   : h.n(value.address2)
    });
  }

  private setAgenciaForm(value: IOrdersQuery, h: any): void {
    this.agencyAddressList = (value.agencyAddressList || [])
      .map(d => ({ label: d.address, value: d }));

    const agency = this.agencyAddressList
      .find(x => x.label === value.u_FIB_CODT) || null;

    h.patch(this.modeloFormAge, {
      u_BPP_MDCT   : h.n(value.u_BPP_MDCT),
      u_BPP_MDRT   : h.n(value.u_BPP_MDRT),
      u_BPP_MDNT   : h.n(value.u_BPP_MDNT),
      agencyAddress: agency,
      u_BPP_MDDT   : h.n(value.u_BPP_MDDT)
    });
  }

  private setExportacionForm(value: IOrdersQuery, h: any): void {
    const freight = h.findItem(this.freightTypeList, value.u_TipoFlete);

    h.patch(this.modeloFormExp, {
      freightType : freight,
      u_ValorFlete: h.r(value.u_ValorFlete, 0),
      u_FIB_TFLETE: h.r(value.u_FIB_TFLETE, 2),
      u_FIB_IMPSEG: h.r(value.u_FIB_IMPSEG, 2),
      u_FIB_PUERTO: h.n(value.u_FIB_PUERTO),
      u_FIB_NEMBA : h.n(value.u_FIB_NEMBA),
      u_FIB_DEMBA : h.n(value.u_FIB_DEMBA),
    });
  }

  private setVendedorForm(value: IOrdersQuery, h: any): void {
    const employee = h.findItem(this.salesPersonsList, value.slpCode);

    h.patch(this.modeloFormSal, {
      salesPersons  : employee,
      u_NroOrden    : h.n(value.u_NroOrden),
      u_OrdenCompra : h.n(value.u_OrdenCompra),
      comments      : h.n(value.comments)
    });
  }

  private setTotalesForm(value: IOrdersQuery, h: any): void {
    h.patch(this.modeloFormTot, {
      subTotal : h.r(value.subTotal, 2),
      discPrcnt: h.r(value.discPrcnt, 2),
      discSum  : h.r(value.discSum, 2),
      vatSum   : h.r(value.vatSum, 2),
      docTotal : h.r(value.docTotal, 2),
    });
  }

  private setLines(value: IOrdersQuery, h: any): void {
    this.onBuildColumn();

    const wddStatus = h.n(value.wddStatus);

    this.modeloLines = (value.lines || [])
    .map(line => this.utilService.mapLine(line, wddStatus));

    this.modeloLinesAttachments = value.attachments2?.lines ?? [];
  }

  //#endregion



  //#region <<< 6. NAVIGATION >>>

  onClickBack() {
    this.router.navigate(['/main/modulo-ven/panel-orden-venta-list']);
  }

  //#endregion
}
