import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';
import { catchError, switchMap, map, finalize, tap, filter, take } from 'rxjs/operators';
import { Subject, forkJoin, of, takeUntil, Subscription, Observable, from, EMPTY } from 'rxjs';

import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IDraftsLineQuery, IDraftsQuery } from '../../../interfaces/drafts.interface';
import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/items.interface';
import { IAddresses } from 'src/app/modulos/modulo-socios-negocios/interfaces/addresses.interface';
import { IExchangeRates } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';
import { IBusinessPartnersQuery } from 'src/app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';
import { ITaxGroups } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/impuesto-sap.iterface';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IUserDefinedFields } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IPaymentTermsTypes } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/condicion-pago-sap.interface';

import { UtilService } from 'src/app/services/util.service';
import { DraftsService } from '../../../services/drafts.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { ItemsService } from 'src/app/modulos/modulo-inventario/services/items.service';
import { AddressesService } from 'src/app/modulos/modulo-socios-negocios/services/addresses.service';
import { BusinessPartnersService } from 'src/app/modulos/modulo-socios-negocios/services/business-partners.service';
import { ExchangeRatesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';
import { TaxGroupsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/finanzas/impuesto-sap.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { PaymentTermsTypesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/paymentTerms-types.service';
import { DocumentNumberingSeriesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series.service';


@Component({
  selector: 'app-bor-panel-documento-borrador-create',
  templateUrl: './panel-documento-borrador-create.component.html',
  styleUrls: ['./panel-documento-borrador-create.component.css']
})
export class PanelDocumentoBorradorCreateComponent implements OnInit, OnDestroy {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private isLoadingInitialData                  : boolean = false;
  private readonly destroy$                     = new Subject<void>();
  private taxGroupSubscription                  : Subscription | null = null;
  private socioLoadSubscription                 : Subscription | null = null;
  private agenciaLoadSubscription               : Subscription | null = null;


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  titulo                                        = 'Orden de Venta - Borrador';
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
  modeloFormOtr                                 : FormGroup;
  modeloFormSal                                 : FormGroup;
  modeloFormTot                                 : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isLocked                                      : boolean = true;
  isStatusApproval                              : boolean = true;
  isSaving                                      : boolean = false;
  isDisplay                                     : boolean = false;
  hasValidLines                                 : boolean = false;
  isVisualizarAlmacen                           : boolean = false;
  isVisualizarImpuesto                          : boolean = false;
  isVisualizarArticulo                          : boolean = false;
  isVisualizarTipoOperacion                     : boolean = false;
  isVisualizarCuentaContable                    : boolean = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  opciones                                      : MenuItem[];
  columnas                                      : TableColumn[];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modeloLines                                   : IDraftsLineQuery[] = [];
  modeloLinesSelected                           : IDraftsLineQuery;


  // ===========================
  // 🔹 7. COMBOS / LISTS
  // ===========================
  currencyList                                  : SelectItem[] = [];
  docTypesList                                  : SelectItem[] = [];
  salesTypeList                                 : SelectItem[] = [];
  payAddressList                                : SelectItem[] = [];
  freightTypeList                               : SelectItem[] = [];
  shipAddressList                               : SelectItem[] = [];
  agencyAddressList                             : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];
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
  indexTipoOperacion                            : number = 0;
  indexCentroCuentaContable                     : number = 0;


  // ===========================
  // 🔹 10. AUX / FILTERS
  // ===========================
  taxCode                                       : string = '';
  cardCode                                      : string = '';
  currency                                      : string = '';
  itemCode                                      : string = '';
  mainCurncy                                    : string = '';
  u_BPP_MDCT                                    : string = '';
  inactiveAlmacenItem                           : string = 'N';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly itemsService: ItemsService,
    private readonly draftsService: DraftsService,
    private readonly addressesService: AddressesService,
    private readonly taxGroupsService: TaxGroupsService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly paymentTermsTypesService: PaymentTermsTypesService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    private readonly documentNumberingSeriesService: DocumentNumberingSeriesService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  /**
   * Inicializa formularios y carga datos iniciales para combos.
   */
  ngOnInit() {
    this.initializeComponent();
  }

  /**
   * Limpia suscripciones/observadores para evitar fugas de memoria.
   */
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
    this.loadAllCombos();

    // 3️⃣ Registrar listeners reactivos
    this.wireDocTypeControl();
    this.wireCurrencyControl();
    this.wireDiscountControls();
    this.wirePayAddressControl();
    this.wireShipAddressControl();
    this.wireAgencyAddressControl();

    // 4️⃣ Inicializar UI
    this.onBuildColumn();
    this.opcionesTabla();

    // 5️⃣ Inicializar líneas
    this.addLine(0);
  }

  buildForms(): void {
    // Define y compone grupos de formulario con validadores
    this.modeloFormSoc = this.fb.group({
      cardCode           : [{ value: '', disabled: false }, Validators.required],
      cardName           : ['', Validators.required],
      cntctCode          : [''],
      numAtCard          : [''],
      currency           : ['', Validators.required],
      docRate            : [this.utilService.onRedondearDecimalConCero(0, 3), Validators.required],
    });

    this.modeloFormDoc = this.fb.group({
      docNum             : [{ value: '', disabled: false }],
      docStatus          : [{ value: 'Abierto', disabled: false }, Validators.required],
      docDate            : [new Date(), Validators.required],
      docDueDate         : [null, Validators.required],
      taxDate            : [new Date(), Validators.required],
    });

    this.modeloFormCon = this.fb.group({
      docType            : ['', Validators.required],
    });

    this.modeloFormLog = this.fb.group({
      shipAddress        : [''],
      address2           : [{ value: '', disabled: false }],
      payAddress         : [''],
      address            : [{ value: '', disabled: false }],
    });

    this.modeloFormFin = this.fb.group({
      paymentsTermsTypes : ['', Validators.required],
    });

    this.modeloFormAge = this.fb.group({
      u_BPP_MDCT         : [''],
      u_BPP_MDRT         : [''],
      u_BPP_MDNT         : [''],
      agencyAddress      : [''],
      u_BPP_MDDT         : [''],
    });

    this.modeloFormExp = this.fb.group({
      freightType        : [''],
      u_ValorFlete       : [this.utilService.onRedondearDecimalConCero(0, 0)],
      u_FIB_TFLETE       : [this.utilService.onRedondearDecimalConCero(0, 2)],
      u_FIB_IMPSEG       : [this.utilService.onRedondearDecimalConCero(0, 2)],
      u_FIB_PUERTO       : [''],
    });

    this.modeloFormOtr = this.fb.group({
      salesType          : ['', Validators.required],
    });

    this.modeloFormSal = this.fb.group({
      salesEmployees     : ['', Validators.required],
      u_NroOrden         : [''],
      u_OrdenCompra      : [''],
      comments           : [''],
    });

    this.modeloFormTot = this.fb.group({
      subTotal           : [this.utilService.onRedondearDecimalConCero(0, 2)],
      discPrcnt          : [this.utilService.onRedondearDecimalConCero(0, 2)],
      discSum            : [this.utilService.onRedondearDecimalConCero(0, 2)],
      vatSum             : [this.utilService.onRedondearDecimalConCero(0, 2)],
      docTotal           : [this.utilService.onRedondearDecimalConCero(0, 2)],
    });

    // Moneda principal del usuario
    this.mainCurncy = this.userContextService.getMainCurncy();
  }

  private loadAllCombos(): void {
    const paramNumero     : any = { objectCode: '17', docSubType: '--' };
    const paramTipoFlete  : any = { tableID: 'ORDR', aliasID: 'TipoFlete' };
    const paramTipoVenta  : any = { tableID: 'ORDR', aliasID: 'STR_TVENTA' };

    // Mostrar spinner mientras cargan los combos
    this.isDisplay = true;

    const docTypes = this.localDataService.getListDocTypes();
    this.docTypesList = docTypes.map(s => ({ label: s.name, value: s.code }));

    const defaultDocType = this.docTypesList.find(x => x.value === 'I');
    if (defaultDocType) {
      this.docTypePrevious  = defaultDocType;
      this.docTypeSelected   = defaultDocType;
      this.modeloFormCon.get('docType').setValue(defaultDocType, { emitEvent: false });
      this.onBuildColumn();
    }

    forkJoin({
      numero    : this.documentNumberingSeriesService.getNumero(paramNumero),
      groups    : this.paymentTermsTypesService.getList().pipe(catchError(() => of([] as IPaymentTermsTypes[]))),
      employees : this.salesPersonsService.getList().pipe(catchError(() => of([] as ISalesPersons[]))),
      tipoFlete : this.camposDefinidoUsuarioService.getList(paramTipoFlete).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      tipoVenta : this.camposDefinidoUsuarioService.getList(paramTipoVenta).pipe(catchError(() => of([] as IUserDefinedFields[]))),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {
        this.modeloFormDoc.patchValue({ docNum: res.numero.nextNumber }, { emitEvent: false });

        this.salesTypeList          = (res.tipoVenta || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.freightTypeList        = (res.tipoFlete || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.salesEmployeesList     = (res.employees || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.paymentsTermsTypesList = (res.groups || []).map(item => ({ label: item.pymntGroup, value: item.groupNum }));

        const defaultFreightTypeValue = res.tipoFlete?.[0]?.dflt || '';
        if (defaultFreightTypeValue) {
          const defaultFreightType = this.freightTypeList.find(x => x.value === defaultFreightTypeValue);
          if (defaultFreightType) {
            this.modeloFormExp.get('freightType')?.setValue(defaultFreightType, { emitEvent: false });
          }
        }

        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  onBuildColumn() {
    if(this.isItem){
      this.columnas = [
        { field: 'itemCode',        header: 'Código' },
        { field: 'dscription',      header: 'Descripción' },
        { field: 'whsCode',         header: 'Almacén' },
        { field: 'unitMsr',         header: 'UM' },
        { field: 'onHand',          header: 'Stock' },
        { field: 'quantity',        header: 'Cantidad' },
        { field: 'priceBefDi',      header: 'Precio' },
        { field: 'discPrcnt',       header: '% de descuento' },
        { field: 'price',           header: 'Precio tras el descuento' },
        { field: 'taxCode',         header: 'Impuesto' },
        { field: 'u_tipoOpT12Nam',  header: 'Tipo de operación' },
        { field: 'lineTotal',       header: 'Total' },
        // { field: 'vatSum',          header: 'Importe del impuesto' },
      ];
    }
    else{
      this.columnas = [
        { field: 'dscription',      header: 'Descripción' },
        { field: 'formatCode',      header: 'Cuenta mayor' },
        { field: 'acctName',        header: 'Nombre de la cuenta de mayor' },
        { field: 'priceBefDi',      header: 'Precio' },
        { field: 'discPrcnt',       header: '% de descuento' },
        { field: 'price',           header: 'Precio tras el descuento' },
        { field: 'taxCode',         header: 'Impuesto' },
        { field: 'u_tipoOpT12Nam',  header: 'Tipo de operación' },
        { field: 'lineTotal',       header: 'Total' },
        // { field: 'vatSum',          header: 'Importe del impuesto' },
      ];
    }
  }

  opcionesTabla() {
    this.opciones = [
      { value: '1', label: 'Añadir línea',    icon: 'pi pi-plus',                   command: () => this.onClickAddLine() },
      { value: '2', label: 'Borrar línea',    icon: 'pi pi-trash',                  command: () => this.onClickDelete()  },
    ];
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

  /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
  onSelectedItem(modelo: IDraftsLineQuery) {
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
    /** Elimina la línea seleccionada; agrega una vacía si quedan sin líneas */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }

    if (this.modeloLines.length === 0) {
      this.addLine(0);
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

  private hasAnyLine(): boolean {
    return this.modeloLines.some(line => this.hasData(line));
  }

  private updateMenuVisibility(): void {
    const hasEmptyLines = this.hasEmptyLine();
    const hasLines      = this.modeloLines.length > 0;

    const addLineOption    = this.opciones.find(x => x.value === '1');
    const deleteLineOption = this.opciones.find(x => x.value === '2');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  //#endregion



  //#region <<< 5. LINES (CORE) >>>

  private addLine(index: number): void {
    const newLine: IDraftsLineQuery = {
      docEntry          : 0,
      lineNum           : 0,
      lineStatus        : 'O',
      itemCode          : '',
      dscription        : '',
      acctCode          : '',
      formatCode        : '',
      acctName          : '',
      whsCode           : '',

      unitMsr           : '',
      onHand            : 0,
      quantity          : 0,
      u_FIB_OpQtyPkg    : 0,

      openQty           : 0,
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
      !this.hasEmptyLine();
  }

  //#endregion



  //#region <<< 6. DOC TYPE >>>

  private wireDocTypeControl(): void {
    this.modeloFormCon.get('docType')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(docTyp => {

      const hasLines = this.hasAnyLine();

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

  showIconDelete(modelo: any): boolean {
    const p = (v: any) => this.utilService.normalizePrimitive(v);

    return p(modelo.lineStatus) !== 'C'
      && !!p(modelo.lineVendor);
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
    if (!cardCode) return of(null);

    this.isDisplay = true;

    return this.businessPartnersService.getByCode(cardCode).pipe(
      takeUntil(this.destroy$),

      // ===========================
      // 🔹 1. HEADER
      // ===========================
      tap(socio => {
        this.cardCode  = socio.cardCode;
        this.cntctCode = socio.cntctCode;

        this.modeloFormSoc.patchValue({
          cardCode : socio.cardCode,
          cardName : socio.cardName,
          cntctCode: socio.cntctCode
        }, { emitEvent: false });
      }),

      // ===========================
      // 🔹 2. PREPARAR DATA
      // ===========================
      map((socio: IBusinessPartnersQuery) => ({
        socio,
        monedas : socio.linesCurrency ?? [],
        shipAddr: socio.linesShipAddress ?? [],
        payAddr : socio.linesPayAddress ?? []
      })),

      // ===========================
      // 🔹 3. COMBOS + DEFAULTS
      // ===========================
      tap(({ monedas, shipAddr, payAddr, socio }) => {

        this.currencyList = (monedas || []).map(m => ({
          label: m.currName,
          value: m.currCode
        }));

        this.shipAddressList = (shipAddr || []).map(d => ({
          label: d.address,
          value: d
        }));

        this.payAddressList = (payAddr || []).map(d => ({
          label: d.address,
          value: d
        }));

        // 🔥 MONEDA DEFAULT
        if (this.currencyList.length > 0) {
          let preferred: any;

          if (this.currencyList.length === 1) {
            preferred = this.currencyList[0];
          } else {
            preferred = this.currencyList.find(c =>
              this.isSameCurrency(c.value, this.mainCurncy)
            );
          }

          if (preferred) {
            this.currency = preferred.value;

            this.modeloFormSoc.get('currency')
              ?.setValue(preferred, { emitEvent: false });
          }
        }

        // 🔥 DIRECCIONES
        const defaultShip = this.shipAddressList
          .find(it => (it.value as IAddresses).address === socio.shipToDef);

        if (defaultShip) {
          this.modeloFormLog.patchValue(
            { shipAddress: defaultShip },
            { emitEvent: false }
          );
        }

        const defaultPay = this.payAddressList
          .find(it => (it.value as IAddresses).address === socio.billToDef);

        if (defaultPay) {
          this.modeloFormLog.patchValue(
            { payAddress: defaultPay },
            { emitEvent: false }
          );
        }

        // 🔥 CONDICIONES DE PAGO
        const defaultGroup = this.paymentsTermsTypesList
          .find(it => it.value === socio.groupNum);

        if (defaultGroup) {
          this.modeloFormFin.patchValue(
            { paymentsTermsTypes: defaultGroup },
            { emitEvent: false }
          );
        }

        // 🔥 VENDEDOR
        const slpCodeNormalized = (socio.slpCode ?? 0) === 0 ? -1 : socio.slpCode;

        const defaultSalesEmployee = this.salesEmployeesList
          .find(it => it.value === slpCodeNormalized);

        if (defaultSalesEmployee) {
          this.modeloFormSal.patchValue(
            { salesEmployees: defaultSalesEmployee },
            { emitEvent: false }
          );
        }
      }),

      // ===========================
      // 🔹 4. CARGAS DEPENDIENTES
      // ===========================
      switchMap(({ socio, shipAddr, payAddr }) => {

        const defaultShip = shipAddr.find(d => d.address === socio.shipToDef);
        const defaultPay  = payAddr.find(d => d.address === socio.billToDef);

        const shipToDef = String(socio.shipToDef ?? '').trim();

        return forkJoin({
          tipoCambio: this.currency
            ? this.fetchTipoCambioRate(this.currency)
            : of(null),

          shipStreet: defaultShip
            ? this.loadAddress(socio.cardCode, socio.shipToDef, 'S')
            : of(null),

          payStreet: defaultPay
            ? this.loadAddress(socio.cardCode, socio.billToDef, 'B')
            : of(null),

          taxGroup: shipToDef
            ? this.loadTaxGroup(socio.cardCode, shipToDef)
            : of(null)
        });
      }),

      // ===========================
      // 🔹 5. APLICAR RESULTADOS
      // ===========================
      tap(({ tipoCambio, shipStreet, payStreet, taxGroup }) => {

        // 🔥 TIPO CAMBIO
        if (tipoCambio) {

          const safeRate = this.isSameCurrency(this.currency, this.mainCurncy)
            ? tipoCambio?.sysRate ?? 0
            : tipoCambio?.rate ?? 0;

          this.sysRate = tipoCambio?.sysRate ?? 0;

          const formattedRate =
            this.utilService.onRedondearDecimalConCero(safeRate, 3);

          this.modeloFormSoc.patchValue({
            docRate: formattedRate
          }, { emitEvent: false });
        }

        // 🔥 DIRECCIONES
        if (shipStreet) {
          this.modeloFormLog.patchValue(
            { address2: shipStreet },
            { emitEvent: false }
          );
        }

        if (payStreet) {
          this.modeloFormLog.patchValue(
            { address: payStreet },
            { emitEvent: false }
          );
        }

        // 🔥 IMPUESTO
        this.applyTaxToDocument(taxGroup);

        // 🔥 RECÁLCULO FINAL (CLAVE)
        if (this.hasAnyLine()) {
          this.refreshAfterCurrencyChange();
        } else {
          this.calculateTotals();
        }
      }),

      // ===========================
      // 🔹 ERROR
      // ===========================
      catchError(e => {
        this.utilService.handleErrorSingle(e, 'loadSocioNeogocioByCode', this.swaCustomService);
        return of(null);
      }),

      finalize(() => { this.isDisplay = false; })
    );
  }

  private isSameCurrency(a: string, b: string): boolean {
    return String(a || '').trim().toUpperCase()
    === String(b || '').trim().toUpperCase();
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

  loadTipoCambio(currCode: any) {
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

  valTipoCambio() {
    const selected  : any     = this.modeloFormSoc.controls['currency']?.value;
    const rate      : number  = Number(this.modeloFormSoc.controls['docRate'].value) || 0;

    if (!selected)
    {
      this.swaCustomService.swaMsgInfo('Seleccione la moneda.');
      return false;
    }

    const currCode = selected?.value ?? null;

    if (!currCode) return;

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

      this.modeloLines.forEach((line, i) => {
        if (this.isItem && this.hasData(line)) {
          this.getListByCode(line.itemCode, i);
        }
      });

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
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (selected) => {

        const value = selected?.value ?? null;
        if (!value) return;

        const address = value;

        this.loadAddress(this.cardCode, address, 'B')
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (fullAddress: string | null) => {
            if (fullAddress !== null && fullAddress !== undefined) {
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
    const slpCode = formConValues.salesEmployees?.value || formConValues.salesEmployees || -1;

    const params = { cardCode, address, slpCode };

    return this.taxGroupsService.getByCardCode(params).pipe(
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



  //#region <<< 12. AGENCY >>>

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
        shipAddr: agencia.linesShipAddress ?? []
      })),
      // Actualizamos listas y preselecciones sin disparar eventos
      tap(({ shipAddr, agencia }) => {
        this.agencyAddressList = (shipAddr || []).map(d => ({ label: d.address, value: d }));

        // Selección por defecto de direcciones y otros campos
        const defaultShipItem = this.agencyAddressList.find(it => (it.value as IAddresses).address === agencia.shipToDef) || null;
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
            this.loadAddress(agencia.cardCode, agencia.shipToDef, 'S').pipe(
              tap((fullAddress: string | null) => {
                if (fullAddress !== null && fullAddress !== undefined) {
                  this.modeloFormAge.patchValue({ u_BPP_MDDT: fullAddress }, { emitEvent: false });
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

  private wireAgencyAddressControl(): void {
    this.modeloFormAge.get('agencyAddress')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      filter(selected => !!selected),
      switchMap(selected => {

        const address = selected.value.address;

        return this.loadAddress(this.u_BPP_MDCT, address, 'S');
      })
    )
    .subscribe({
      next: (fullAddress) => {
        if (fullAddress !== null && fullAddress !== undefined) {
          this.modeloFormAge.patchValue({ u_BPP_MDDT: fullAddress }, { emitEvent: false });
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'wireAgencyAddressControl', this.swaCustomService);
      }
    });
  }

  //#endregion



  //#region <<< 13. ARTÍCULO >>>

  onOpenArticulo(): boolean {
    const cardCodeValid = !!this.cardCode;
    const salesEmployeeSelected = !!this.modeloFormSal.get('salesEmployees')?.value;

    return cardCodeValid && salesEmployeeSelected;
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

  private setItem(data: any, index: number): void {
    const formValue = this.modeloFormSoc.getRawValue();
    const currency  = formValue.currency?.value || formValue.currency || '';

    Object.assign(this.modeloLines[index], {
      itemCode       : data.itemCode,
      dscription     : data.itemName,
      whsCode        : data.dfltWH,
      unitMsr        : data.salUnitMsr,
      onHand         : data.onHand,
      quantity       : data.quantity,
      openQty        : data.openQty,
      currency       : currency,
      priceBefDi     : data.priceBefDi,
      discPrcnt      : data.discPrcnt || 0,
      price          : data.price,
      taxCode        : this.taxCode,
      vatPrcnt       : this.vatPrcnt,
      u_tipoOpT12    : data.u_tipoOpT12,
      u_tipoOpT12Nam : data.u_tipoOpT12Nam
    });

    this.calculateTotalLine(this.modeloLines[index], index);
    this.calculateTotals();
    this.updateHasValidLines();
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

        this.setItem(data[0], index);
        this.calculateTotals();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListByCode', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(itemCode: string): any {
    const formValueSoc = this.modeloFormSoc.getRawValue();
    const formValueSal = this.modeloFormSal.getRawValue();

    const cardCode           = formValueSoc.cardCode ?? '';
    const currency           = formValueSoc.currency ?? '';
    const salesEmployeeValue = formValueSal.salesEmployees?.value ?? formValueSal.salesEmployees ?? '';

    return {
      itemCode,
      cardCode            : cardCode,
      currency            : currency,
      slpCode             : salesEmployeeValue,
      operationTypeCode   : '01'
    };
  }

  onDescChange(value: IDraftsLineQuery) {
    if (!this.valTipoCambio())
      {
        value.dscription = '';
        return;
      };
    this.updateHasValidLines();
  }

  //#endregion



  //#region <<< 14. CUENTA CONTABLE >>>

  onOpenCuentaContable(index: number): void {
    this.indexCentroCuentaContable  = index;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

  onSelectedCuentaContable(value: any): void {
    const formValue = this.modeloFormSoc.getRawValue();
    const currency  = formValue.currency?.value || formValue.currency || '';

    const currentLine               = this.modeloLines[this.indexCentroCuentaContable];
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



  //#region <<< 15. ALMACÉN >>>

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



  //#region <<< 16. IMPUESTO >>>

  onClickOpenImpuesto(index: number) {
    this.indexImpuesto = index;
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  onClickSelectedImpuesto(value: ITaxGroups) {
    this.modeloLines[this.indexImpuesto].taxCode      = value.code;
    this.modeloLines[this.indexImpuesto].vatPrcnt     = value.rate;
    this.calculateTotalLine(this.modeloLines[this.indexImpuesto], this.indexImpuesto);
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  onClickCloseImpuesto()
  {
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  //#endregion



  //#region <<< 17. TIPO OPERACIÓN >>>

  onOpenTipoOperacion(index: number): void {
    this.indexTipoOperacion = index;
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }

  onSelectedTipoOperacion(value: any): void {
    const currentLine               = this.modeloLines[this.indexTipoOperacion];
    currentLine.u_tipoOpT12         = value.code;
    currentLine.u_tipoOpT12Nam      = value.u_descrp;
    this.isVisualizarTipoOperacion  = !this.isVisualizarTipoOperacion;
  }

  onClickCloseTipoOperacion(): void {
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }

  //#endregion



  //#region <<< 18. CALCULOS EN LÍNEAS >>>

  onChangeQuantity(value: IDraftsLineQuery, index: number)
  {
    this.calculateTotalLine(value, index);
  }

  onChangePrice(value: IDraftsLineQuery, index: number)
  {
    this.calculateTotalLine(value, index);
  }

  onChangeDiscPrcnt(value: IDraftsLineQuery, index: number)
  {
    this.calculateTotalLine(value, index);
  }

  roundDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  }

  truncateDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.trunc(value * factor) / factor;
  }

  calculateTotalLine(value: IDraftsLineQuery, index: number): void {
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

    this.calculateTotals();
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

  changeDiscPrcnt() {
    const subTotal  = Number(this.modeloFormTot.get('subTotal')?.value) || 0;
    const discPrcnt = Number(this.modeloFormTot.get('discPrcnt')?.value) || 0;

    let newDiscSum = (subTotal * (discPrcnt / 100));
    newDiscSum = this.roundDecimal(newDiscSum, 2);

    this.modeloFormTot.patchValue({ discSum: newDiscSum }, { emitEvent: false });

    this.calculateTotals();
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

  changeDiscSum() {
    const subTotal  = Number(this.modeloFormTot.get('subTotal')?.value) || 0;
    const discSum   = Number(this.modeloFormTot.get('discSum')?.value) || 0;

    let newDiscPrcnt = (discSum /subTotal) * 100;
    newDiscPrcnt = this.roundDecimal(newDiscPrcnt, 2);

    this.modeloFormTot.patchValue({ discPrcnt: newDiscPrcnt }, { emitEvent: false });

    this.calculateTotals();
  }

  //#endregion



  //#region <<< 16. RESET / LIMPIEZA >>>

  resetAll(): void {
    // 1) Cancelar cargas en curso (si existieran)
    this.socioLoadSubscription?.unsubscribe();
    this.socioLoadSubscription = null;

    this.agenciaLoadSubscription?.unsubscribe();
    this.agenciaLoadSubscription = null;


    // 4) Reset variables de cabecera
    this.cardCode        = '';
    this.cntctCode       = 0;
    this.taxCode         = '';
    this.vatPrcnt        = 0;
    this.sysRate         = 0;

    this.currency        = '';
    this.itemCode        = '';
    this.u_BPP_MDCT      = '';

    // 5) Limpiar listas dependientes del socio/agencia
    // (NO borro docTypesList/salesTypeList/etc porque son combos generales ya cargados)
    this.currencyList      = [];
    this.shipAddressList   = [];
    this.payAddressList    = [];
    this.agencyAddressList = [];

    // 6) Reset Formularios a valores iniciales
    // IMPORTANTE: usa emitEvent:false para no disparar valueChanges (descuentos, etc.)
    this.modeloFormSoc.reset({
      cardCode  : '',
      cardName  : '',
      cntctCode : '',
      numAtCard : '',
      currency  : '',
      docRate   : this.utilService.onRedondearDecimalConCero(0, 3),
    }, { emitEvent: false });

    this.modeloFormDoc.reset({
      docNum     : this.modeloFormDoc.get('docNum')?.value ?? '', // si quieres mantener correlativo actual
      docStatus  : 'Abierto',
      docDate    : new Date(),
      docDueDate : null,
      taxDate    : new Date(),
    }, { emitEvent: false });

    // DocType: volver al default 'I' (si existe en tu lista)
    const defaultDocType = this.docTypesList?.find(x => x.value === 'I') ?? null;
    this.docTypeSelected  = defaultDocType;
    this.docTypePrevious  = defaultDocType;

    this.modeloFormCon.reset({
      docType: defaultDocType
    }, { emitEvent: false });

    this.modeloFormLog.reset({
      shipAddress : '',
      address2    : '',
      payAddress  : '',
      address     : '',
    }, { emitEvent: false });

    this.modeloFormFin.reset({
      paymentsTermsTypes: ''
    }, { emitEvent: false });

    this.modeloFormAge.reset({
      u_BPP_MDCT    : '',
      u_BPP_MDRT    : '',
      u_BPP_MDNT    : '',
      agencyAddress : '',
      u_BPP_MDDT    : '',
    }, { emitEvent: false });

    this.modeloFormExp.reset({
      freightType  : this.modeloFormExp.get('freightType')?.value ?? '', // si quieres mantener default
      u_ValorFlete : this.utilService.onRedondearDecimalConCero(0, 0),
      u_FIB_TFLETE : this.utilService.onRedondearDecimalConCero(0, 2),
      u_FIB_IMPSEG : this.utilService.onRedondearDecimalConCero(0, 2),
      u_FIB_PUERTO : '',
    }, { emitEvent: false });

    this.modeloFormOtr.reset({
      salesType: ''
    }, { emitEvent: false });

    this.modeloFormSal.reset({
      salesEmployees: '',
      u_NroOrden    : '',
      u_OrdenCompra : '',
      comments      : '',
    }, { emitEvent: false });

    this.modeloFormTot.reset({
      subTotal  : this.utilService.onRedondearDecimalConCero(0, 2),
      discPrcnt : this.utilService.onRedondearDecimalConCero(0, 2),
      discSum   : this.utilService.onRedondearDecimalConCero(0, 2),
      vatSum    : this.utilService.onRedondearDecimalConCero(0, 2),
      docTotal  : this.utilService.onRedondearDecimalConCero(0, 2),
    }, { emitEvent: false });

    // 7) Reiniciar columnas según docType por defecto
    this.onBuildColumn();

    // 8) Reiniciar detalle (tabla)
    this.modeloLines = [];
    this.addLine(0);
    this.modeloLinesSelected = this.modeloLines[0];

    // 9) Recalcular totales/visibilidad
    this.calculateTotals();
    this.updateMenuVisibility();

    // 10) Marcar formularios como pristine/untouched (para que no salgan errores visuales)
    this.markAllFormsPristineUntouched();
  }

  /** Marca todos los forms como limpios para evitar mensajes de required tras reset */
  private markAllFormsPristineUntouched(): void {
    const forms: FormGroup[] = [
      this.modeloFormSoc,
      this.modeloFormDoc,
      this.modeloFormCon,
      this.modeloFormLog,
      this.modeloFormFin,
      this.modeloFormAge,
      this.modeloFormExp,
      this.modeloFormOtr,
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



  //#region <<< 17. LOAD DATA (EDICIÓN) >>>

  private loadData(): void {
    this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        const id = +params['id'];

        // 🔥 aquí sí se activa de forma confiable
        this.isDisplay = true;

        return this.draftsService
          .getByDocEntry(id)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IDraftsQuery) => {
        this.setFormValues(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: IDraftsQuery): void {
    this.isLoadingInitialData = true;

    /** 🔹 HELPERS */
    const p = this.utilService.normalizePrimitive.bind(this.utilService);
    const r0 = this.utilService.onRedondearDecimalConCero.bind(this.utilService);

    const statusMap =
    {
      Y: '[Aprobado]',
      W: '[Pendiente]',
      N: '[Rechazado]'
    };

    const statusName = statusMap[value.wddStatus] || '';

    /** 🔹 HEADER */
    this.titulo           += ` ${statusName}`;
    this.isStatusApproval = value.wddStatus == 'Y'? true : false;
    this.isLocked         = value?.docStatus !== 'O';
    this.docEntry         = value.docEntry;
    this.cardCode         = value.cardCode;
    this.cntctCode        = value.cntctCode;
    this.currency         = value.docCur || '';
    this.u_BPP_MDCT       = value.u_BPP_MDCT || '';

    /** 🔹 LISTAS */
    this.currencyList = (value.currencyList || []).map(m => ({
      label: m.currName,
      value: m.currCode
    }));

    const findItem = (list: any[], val: any) =>
      list?.find(x => x.value === val || x.label === val) || null;

    /** 🔹 FORM SOC */
    const currencyItem = findItem(this.currencyList, value.docCur);

    this.modeloFormSoc.patchValue({
      cardCode : p(value.cardCode),
      cardName : p(value.cardName),
      cntctCode: value.cntctCode,
      numAtCard: p(value.numAtCard),
      currency : currencyItem,
      docRate  : r0(value.docRate ?? 0, 3),
    }, { emitEvent: false });

    /** 🔹 FORM DOC */
    this.modeloFormDoc.patchValue({
      docNum    : value.docNum,
      docStatus : value.docStatus === 'O' ? 'Abierto' : 'Cerrado',
      docDate   : value.docDate ? new Date(value.docDate) : null,
      docDueDate: value.docDueDate ? new Date(value.docDueDate) : null,
      taxDate   : value.taxDate ? new Date(value.taxDate) : null,
    }, { emitEvent: false });

    /** 🔹 DOC TYPE */
    const docTypeItem = findItem(this.docTypesList, value.docType);

    this.docTypeSelected = docTypeItem;

    this.modeloFormCon.patchValue({
      docType: docTypeItem
    }, { emitEvent: false });

    /** 🔹 FINANZAS */
    const paymentsItem = findItem(this.paymentsTermsTypesList, value.groupNum);

    this.modeloFormFin.patchValue({
      paymentsTermsTypes: paymentsItem
    }, { emitEvent: false });

    /** 🔹 DIRECCIONES */
    this.shipAddressList = (value.shipAddressList || []).map(d => ({
      label: d.address,
      value: d.address
    }));

    this.payAddressList = (value.payAddressList || []).map(d => ({
      label: d.address,
      value: d.address
    }));

    const shipItem = findItem(this.shipAddressList, value.shipToCode);
    const payItem  = findItem(this.payAddressList, value.payToCode);

    this.modeloFormLog.patchValue({
      shipAddress: shipItem,
      address    : p(value.address),
      payAddress : payItem,
      address2   : p(value.address2)
    }, { emitEvent: false });

    /** 🔹 AGENCIA */
    this.agencyAddressList = (value.agencyAddressList || []).map(d => ({
      label: d.address,
      value: d.address
    }));

    const agencyItem = findItem(this.agencyAddressList, value.u_FIB_CODT);

    this.modeloFormAge.patchValue({
      u_BPP_MDCT   : value.u_BPP_MDCT,
      u_BPP_MDRT   : p(value.u_BPP_MDRT),
      u_BPP_MDNT   : p(value.u_BPP_MDNT),
      agencyAddress: agencyItem,
      u_BPP_MDDT   : p(value.u_BPP_MDDT)
    }, { emitEvent: false });

    /** 🔹 EXPORTACIÓN */
    const freightItem = findItem(this.freightTypeList, value.u_TipoFlete);

    this.modeloFormExp.patchValue({
      freightType : freightItem,
      u_ValorFlete: r0(value.u_ValorFlete ?? 0, 0),
      u_FIB_TFLETE: r0(value.u_FIB_TFLETE ?? 0, 2),
      u_FIB_IMPSEG: r0(value.u_FIB_IMPSEG ?? 0, 2),
      u_FIB_PUERTO: p(value.u_FIB_PUERTO)
    }, { emitEvent: false });

    /** 🔹 OTROS */
    const salesTypeItem = findItem(this.salesTypeList, value.u_STR_TVENTA);

    this.modeloFormOtr.patchValue({
      salesType: salesTypeItem
    }, { emitEvent: false });

    /** 🔹 VENDEDOR */
    const slpItem = findItem(this.salesEmployeesList, value.slpCode);

    this.modeloFormSal.patchValue({
      salesEmployees: slpItem,
      u_NroOrden    : p(value.u_NroOrden),
      u_OrdenCompra : p(value.u_OrdenCompra),
      comments      : p(value.comments)
    }, { emitEvent: false });

    /** 🔥 TAX GROUP */
    const shipTo = String(value.shipToCode ?? '').trim();

    this.taxGroupSubscription?.unsubscribe();
    this.taxGroupSubscription = null;

    if (this.cardCode && shipTo) {
      this.taxGroupSubscription = this.loadTaxGroup(this.cardCode, shipTo)
        .pipe(take(1))
        .subscribe(tax => {
          this.taxCode  = tax?.code ?? '';
          this.vatPrcnt = Number(tax?.rate ?? 0);
        });
    } else {
      this.taxCode  = '';
      this.vatPrcnt = 0;
    }

    /** 🔹 TOTALES */
    this.modeloFormTot.patchValue({
      subTotal : r0(value.subTotal, 2),
      discPrcnt: r0(value.discPrcnt, 2),
      discSum  : r0(value.discSum, 2),
      vatSum   : r0(value.vatSum, 2),
      docTotal : r0(value.docTotal, 2),
    }, { emitEvent: false });

    /** 🔹 LÍNEAS */
    this.onBuildColumn();
    this.modeloLines = value.lines || [];

    this.updateHasValidLines();
    this.isLoadingInitialData = false;
  }

  //#endregion



  //#region <<< 18. SAVE >>>


  onToSave() {
    this.isSaving = true;

    const modeloToSave = { docEntry: this.docEntry }

    this.draftsService.setCreate(modeloToSave)
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



  //#region <<< 18. NAVIGATION >>>

  onClickBack() {
    this.router.navigate(['/main/modulo-bor/panel-documento-borrador-list']);
  }

  //#endregion
}
