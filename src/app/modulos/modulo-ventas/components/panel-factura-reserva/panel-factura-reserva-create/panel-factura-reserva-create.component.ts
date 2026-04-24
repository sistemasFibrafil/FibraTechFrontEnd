import { SelectItem } from 'primeng/api';
import { NavigationStart, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { catchError, switchMap, map, finalize, tap } from 'rxjs/operators';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';
import { Subject, forkJoin, of, from, EMPTY, Subscription, Observable, takeUntil, filter, combineLatest } from 'rxjs';

import { Invoice1CreateModel, InvoiceCreateModel } from '../../../models/sap-business-one/invoice.model';

import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/items.interface';
import { IAddresses } from 'src/app/modulos/modulo-socios-negocios/interfaces/addresses.interface';
import { IInvoice1Query, IInvoiceQuery } from '../../../interfaces/sap-business-one/invoice.interface';
import { IExchangeRates } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';
import { IBusinessPartnersQuery } from 'src/app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';
import { ITaxGroups } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/impuesto-sap.iterface';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IUserDefinedFields } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IPaymentTermsTypes } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/condicion-pago-sap.interface';
import { IDocumentNumberingSeriesSunat, IDocumentNumberingSeriesSunatQuery } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.interface';

import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { InvoicesService } from '../../../services/sap-business-one/invoices.service';
import { ItemsService } from 'src/app/modulos/modulo-inventario/services/items.service';
import { AddressesService } from 'src/app/modulos/modulo-socios-negocios/services/addresses.service';
import { BusinessPartnersService } from 'src/app/modulos/modulo-socios-negocios/services/business-partners.service';
import { ExchangeRatesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';
import { TaxGroupsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/finanzas/impuesto-sap.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { DocumentTypeSunatService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-type-sunat.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { PaymentTermsTypesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/paymentTerms-types.service';
import { DocumentNumberingSeriesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series.service';
import { DocumentNumberingSeriesSunatService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.service';
import { ItemsFindByListCodeModel } from '../../../../modulo-inventario/models/items.model';


@Component({
  selector: 'app-ven-panel-factura-reserva-create',
  templateUrl: './panel-factura-reserva-create.component.html',
  styleUrls: ['./panel-factura-reserva-create.component.css']
})
export class PanelFacturaReservaCreateComponent implements OnInit, OnDestroy {

  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();
  private socioLoadSubscription                 : Subscription | null = null;
  private shipAddressSubscription               : Subscription | null = null;
  // Titulo del componente
  titulo                                        = 'Factura de Reserva';
  // Acceso de botones
  buttonAccess                                  : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

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
  modeloFormCod                                 : FormGroup;

  sysRate                                       : number = 0;
  vatPrcnt                                      : number = 0;
  docEntry                                      : number = 0;
  cntctCode                                     : number = 0;
  idUsuario                                     : number = 0;

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

  docTypePrevious                               : any;
  docTypeSelected                               : any;

  currencyList                                  : SelectItem[] = [];
  docTypesList                                  : SelectItem[] = [];
  salesTypeList                                 : SelectItem[] = [];
  payAddressList                                : SelectItem[] = [];
  shipAddressList                               : SelectItem[] = [];
  freightTypeList                               : SelectItem[] = [];
  agencyAddressList                             : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];
  documentTypeSunatList                         : SelectItem[] = [];
  paymentsTermsTypesList                        : SelectItem[] = [];

  // Progreso
  isLocked                                      : boolean = true;
  isSaving                                      : boolean = false;
  isDisplay                                     : boolean = false;
  hasValidLines                                 : boolean = false;
  manualTransport                               : boolean = true;
  isVisualizarBarcode                           : boolean = false;
  isVisualizarAlmacen                           : boolean = false;
  isVisualizarImpuesto                          : boolean = false;
  isVisualizarArticulo                          : boolean = false;
  isVisualizarTipoOperacion                     : boolean = false;
  isVisualizarCuentaContable                    : boolean = false;

  // modeloLines
  indexAlmacen                                  : number = 0;
  indexImpuesto                                 : number = 0;
  indexArticulo                                 : number = 0;
  indexTipoOperacion                            : number = 0;
  indexCentroCuentaContable                     : number = 0;

  opciones                                      : MenuItem[];

  columnas                                      : TableColumn[];

  modeloLinesSelected                           : IInvoice1Query;

  modeloLines                                   : IInvoice1Query[] = [];

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
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly paymentTermsTypesService: PaymentTermsTypesService,
    private readonly documentTypeSunatService: DocumentTypeSunatService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    private readonly documentNumberingSeriesService: DocumentNumberingSeriesService,
    private readonly DocumentNumberingSeriesSunatService: DocumentNumberingSeriesSunatService,
    public  readonly utilService: UtilService,
  ) {}

  ngOnInit() {
    // 1️⃣ Inicializa UI
    this.initializeComponent();

    // 2️⃣ Escucha flecha atrás / adelante
    this.listenBrowserBack();
  }

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

  // ===========================
  // 2. Initialization
  // ===========================
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
    this.wireFechaVencimientoByDocDate();
    this.wireFechaVencimientoByCondicionPago();

    // 4️⃣ Inicializar UI
    this.onBuildColumn();
    this.opcionesTabla();

    // 5️⃣ Inicializar líneas
    this.addLine(0);
  }

  buildForms() {
    // CABECERA - Datos del cliente y moneda
    this.modeloFormSoc = this.fb.group({
      cardCode                      : new FormControl({ value: '', disabled: false }, Validators.required),
      cardName                      : new FormControl('', Validators.required),
      cntctCode                     : new FormControl(''),
      numAtCard                     : new FormControl(''),
      currency                      : new FormControl('', Validators.required),
      docRate                       : new FormControl(this.utilService.onRedondearDecimalConCero(0,3), Validators.required),
    });
    // CABECERA 2 - Números, estado y fechas
    this.modeloFormDoc = this.fb.group({
      docNum                        : new FormControl({ value: '', disabled: false }),
      docStatus                     : [{ value: 'Abierto', disabled: false }, Validators.required],
      u_BPP_MDTD                    : new FormControl('', Validators.required),
      u_BPP_MDSD                    : new FormControl('', Validators.required),
      u_BPP_MDCD                    : new FormControl('', Validators.required),
      docDate                       : new FormControl(new Date(), Validators.required),
      docDueDate                    : new FormControl(null, Validators.required),
      taxDate                       : new FormControl(new Date(), Validators.required),
    });
    // FINANZAS
    this.modeloFormCon = this.fb.group({
      docType                       : new FormControl('', Validators.required),
    });
    // LOGÍSTICA - Direcciones
    this.modeloFormLog = this.fb.group({
      shipAddress                   : new FormControl(''), //shipToCode
      address2                      : new FormControl({ value: '', disabled: false }),
      payAddress                    : new FormControl(''), // payToCode
      address                       : new FormControl({ value: '', disabled: false }),
    });
    // FINANZAS
    this.modeloFormFin = this.fb.group({
      paymentsTermsTypes            : new FormControl('', Validators.required), // groupNum
    });
    // AGENCIA
    this.modeloFormAge = this.fb.group({
      u_BPP_MDCT                    : new FormControl(''),
      u_BPP_MDRT                    : new FormControl(''),
      u_BPP_MDNT                    : new FormControl(''),
      agencyAddress                 : new FormControl(''), // u_FIB_CODT
      u_BPP_MDDT                    : new FormControl(''),
    });
    // EXPORTACIÓN
    this.modeloFormExp = this.fb.group({
      freightType         : new FormControl(''),
      u_ValorFlete        : new FormControl(this.utilService.onRedondearDecimalConCero(0,0)),
      u_FIB_TFLETE        : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      u_FIB_IMPSEG        : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      u_FIB_PUERTO        : new FormControl(''),
    });
    // OTROS
    this.modeloFormOtr = this.fb.group({
      salesType                     : new FormControl('', Validators.required) // u_STR_TVENTA
    });
    // PIE - Información adicional y totales
    this.modeloFormSal = this.fb.group({
      salesEmployees                : new FormControl('', Validators.required), // slpCode
      u_NroOrden                    : new FormControl(''),
      u_OrdenCompra                 : new FormControl(''),
      comments                      : new FormControl(''),
    });
    this.modeloFormTot = this.fb.group({
      subTotal                      : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      discPrcnt                     : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      discSum                       : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      vatSum                        : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      docTotal                      : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
    });
    this.modeloFormCod = this.fb.group({
      u_CodeBar                     : ''
    });

    // Moneda principal del usuario
    this.mainCurncy = this.userContextService.getMainCurncy();
  }

  onBuildColumn() {
    // Usar docTypeSelected si está disponible, sino leer del formulario
    const docTypeValue = this.modeloFormCon.get('docType')?.value?.value;
    const isItemDoc         = docTypeValue === 'I';

    if(isItemDoc){
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

  // ===========================
  // Helper Methods
  // ===========================

  private updateMenuVisibility(): void {
    const docTypeValue      = this.modeloFormCon.get('docType')?.value?.value;
    const isItemDoc         = docTypeValue === 'I';

    const hasView =
    !!this.modeloLinesSelected?.itemCode?.trim() &&
    (this.modeloLinesSelected?.u_FIB_FromPkg ?? 'N') === 'Y';

    const hasEmptyLines = isItemDoc
    ? this.modeloLines.some(l => !String(l.itemCode ?? '').trim())
    : this.modeloLines.some(l => !String(l.dscription ?? '').trim());

    const hasLines          = this.modeloLines.length > 0;

    const viewOption        = this.opciones.find(x => x.value === "1");
    const addLineOption     = this.opciones.find(x => x.value === '2');
    const deleteLineOption  = this.opciones.find(x => x.value === '3');

    if (viewOption)       viewOption.visible        = hasView;
    if (addLineOption)    addLineOption.visible     = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible  = hasLines;
  }

  onSelectedItem(modelo: IInvoice1Query) {
    /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
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

    // Se borra el registro en el detalle
    this.modeloLines.filter(x => x.baseEntry === this.modeloLinesSelected.baseEntry && x.baseLine === this.modeloLinesSelected.baseLine).forEach(x => this.modeloLines.splice(this.modeloLines.indexOf(x), 1));

    this.updateHasValidLines();
  }

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

  // ===========================
  // RESET / LIMPIEZA TOTAL
  // ===========================
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
    // (NO borro docTypesList/reasonTransferList/etc porque son combos generales ya cargados)
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

  private loadAllCombos(): void {
    this.idUsuario                          = this.userContextService.getIdUsuario();
    const paramSalesType                    : any = { tableID: 'OINV', aliasID: 'STR_TVENTA' };
    const paramFreightType                  : any = { tableID: 'OINV', aliasID: 'TipoFlete' };
    const paramdocumentTypeSunat            : any = { u_FIB_ENTR: '', u_FIB_FAVE: 'Y', u_FIB_TRAN: '' };
    const paramDocumentNumberingSeries      : any = { objectCode: '13', docSubType: '--' };

    // Mostrar spinner mientras cargan los combos
    this.isDisplay = true;

    const docTypes = this.localDataService.docTypes;
    this.docTypesList = docTypes.map(s => ({ label: s.name, value: s.code }));

    const defaultDocType = this.docTypesList.find(x => x.value === 'I');
    if (defaultDocType) {
      this.docTypePrevious  = defaultDocType;
      this.docTypeSelected   = defaultDocType;
      this.modeloFormCon.get('docType').setValue(defaultDocType, { emitEvent: false });
      this.onBuildColumn();
    }

    forkJoin({
      salesType                     : this.camposDefinidoUsuarioService.getList(paramSalesType).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      freightType                   : this.camposDefinidoUsuarioService.getList(paramFreightType).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      salesEmployees                : this.salesPersonsService.getList().pipe(catchError(() => of([] as ISalesPersons[]))),
      documentTypeSunat             : this.documentTypeSunatService.getListByType(paramdocumentTypeSunat),
      paymentsTermsTypes            : this.paymentTermsTypesService.getList().pipe(catchError(() => of([] as IPaymentTermsTypes[]))),
      documentNumberingSeries       : this.documentNumberingSeriesService.getNumero(paramDocumentNumberingSeries)
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {
        this.modeloFormDoc.patchValue({ docNum: res.documentNumberingSeries.nextNumber }, { emitEvent: false });

        this.salesTypeList                    = (res.salesType || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.freightTypeList                  = (res.freightType || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.salesEmployeesList               = (res.salesEmployees || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.documentTypeSunatList            = (res.documentTypeSunat || []).map(item => ({ label: item.u_BPP_TDDD, value: item.u_BPP_TDTD }));
        this.paymentsTermsTypesList           = (res.paymentsTermsTypes || []).map(item => ({ label: item.pymntGroup, value: item.groupNum }));

        const defaultTipoDoc = res.documentTypeSunat.find(item => item.u_FIB_FVDF === 'Y');
        if (defaultTipoDoc) {
          this.u_BPP_NDTD = defaultTipoDoc.u_BPP_TDTD;
          this.modeloFormDoc.get('u_BPP_MDTD').setValue({
            label: defaultTipoDoc.u_BPP_TDDD,
            value: defaultTipoDoc.u_BPP_TDTD
          });

          const documentTypeSunat = this.modeloFormDoc.controls['u_BPP_MDTD'].value
          const u_BPP_TDDD = documentTypeSunat?.value || documentTypeSunat;

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
    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.docEntry     = value.docEntry;
    this.cardCode     = value.cardCode;
    this.cntctCode    = value.cntctCode;
    this.currency     = value.docCur || '';
    this.u_BPP_MDCT   = value.u_BPP_MDCT || '';

    // Listar monedas
    this.currencyList = (value.currencyList || []).map(m => ({ label: m.currName, value: m.currCode }));

    // Buscar y asignar valores como SelectItem para campo de moneda
    const currencyItem = this.currencyList.find(item => item.value === value.docCur);

    // Actualizar formulario Socio de Negocio
    this.modeloFormSoc.patchValue(
      {
        cardCode : this.utilService.normalizePrimitive(value.cardCode),
        cardName : this.utilService.normalizePrimitive(value.cardName),
        cntctCode: value.cntctCode,
        numAtCard: this.utilService.normalizePrimitive(value.numAtCard),
        currency : currencyItem || null
      },
      { emitEvent: false }
    );


    // ✅ Ejecutar tipo de cambio al cargar documento
    if (value.docCur) {
      this.loadTipoCambio(value.docCur)
      .pipe(takeUntil(this.destroy$))
      .subscribe();
    }

    // DocType
    const docTypeItem    = this.docTypesList.find(item => item.value === value.docType);
    this.docTypeSelected = docTypeItem;

    this.modeloFormCon.patchValue(
      { docType: docTypeItem || null },
      { emitEvent: false }
    );

    // Condición de pago
    const paymentsTermsTypesItem = this.paymentsTermsTypesList.find(item => item.value === value.groupNum);

    this.modeloFormFin.patchValue(
      { paymentsTermsTypes: paymentsTermsTypesItem || null },
      { emitEvent: false }
    );

    // ✅ Recalcular fecha de vencimiento al cargar documento si tiene condición de pago (groupNum)
    if (value.groupNum) {
      this.calcularFechaVencimientoPorCondicionPago$(value.groupNum)
        .pipe(takeUntil(this.destroy$))
        .subscribe(fecha => {
          if (fecha) {
            this.modeloFormDoc.patchValue(
              { docDueDate: fecha },
              { emitEvent: false }
            );
          }
        });
    }

    // Direcciones (OJO: aquí estás guardando value=d.address)
    this.shipAddressList = (value.shipAddressList || []).map(d => ({ label: d.address, value: d.address }));
    this.payAddressList  = (value.payAddressList  || []).map(d => ({ label: d.address, value: d.address }));

    const shipAddressItem = this.shipAddressList.find(item => item.label === value.shipToCode);
    const payAddressItem  = this.payAddressList.find(item => item.label === value.payToCode);

    this.modeloFormLog.patchValue(
      {
        shipAddress: shipAddressItem || null,
        address    : this.utilService.normalizePrimitive(value.address),
        payAddress : payAddressItem || null,
        address2   : this.utilService.normalizePrimitive(value.address2)
      },
      { emitEvent: false }
    );

    // Agencia
    this.agencyAddressList = (value.agencyAddressList || []).map(d => ({ label: d.address, value: d }));
    const agencyAddressItem = this.agencyAddressList.find(item => item.label === value.u_FIB_CODT);

    this.modeloFormAge.patchValue(
      {
        u_BPP_MDCT   : value.u_BPP_MDCT,
        u_BPP_MDRT   : this.utilService.normalizePrimitive(value.u_BPP_MDRT),
        u_BPP_MDNT   : this.utilService.normalizePrimitive(value.u_BPP_MDNT),
        agencyAddress: agencyAddressItem || null,
        u_BPP_MDDT   : this.utilService.normalizePrimitive(value.u_BPP_MDDT)
      },
      { emitEvent: false }
    );

    // Exportación
    const freightTypeItem = this.freightTypeList.find(item => item.value === value.u_TipoFlete);

    this.modeloFormExp.patchValue(
      {
        freightType : freightTypeItem || null,
        u_ValorFlete: this.utilService.onRedondearDecimalConCero(value.u_ValorFlete ?? 0, 0),
        u_FIB_TFLETE: this.utilService.onRedondearDecimalConCero(value.u_FIB_TFLETE ?? 0, 2),
        u_FIB_IMPSEG: this.utilService.onRedondearDecimalConCero(value.u_FIB_IMPSEG ?? 0, 2),
        u_FIB_PUERTO: this.utilService.normalizePrimitive(value.u_FIB_PUERTO)
      },
      { emitEvent: false }
    );

    // Otros
    const salesTypeItem = this.salesTypeList.find(item => item.value === value.u_STR_TVENTA);

    this.modeloFormOtr.patchValue(
      { salesType: salesTypeItem || null },
      { emitEvent: false }
    );

    // Vendedor
    const slpCodeItem = this.salesEmployeesList.find(item => item.value === value.slpCode);

    // ✅ PATCH SAL (tu bloque original)
    this.modeloFormSal.patchValue(
      {
        salesEmployees: slpCodeItem || null,
        u_NroOrden    : this.utilService.normalizePrimitive(value.u_NroOrden),
        u_OrdenCompra : this.utilService.normalizePrimitive(value.u_OrdenCompra),
        comments      : this.utilService.normalizePrimitive(value.comments)
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar modeloLines después de que los formularios estén actualizados
    // =========================================================================
    this.onBuildColumn();
    this.modeloLines = value.lines || [];
    this.updateHasValidLines();
    this.calculateTotalLines();
  }

  //#region <<< MODAL: CLIENTE >>>

  get isMainCurrency(): boolean {
    return !this.currency || this.currency === '##' || this.currency === this.mainCurncy;
  }

  get currencyColClass(): string {
    return this.isMainCurrency ? 'col-12 md:col-12' : 'col-12 md:col-6';
  }

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

    return this.businessPartnersService
    .getByCode(cardCode).pipe(
      takeUntil(this.destroy$),

      // 1) Setear cabecera básica
      tap(socio => {
        this.cardCode     = socio.cardCode;
        this.cntctCode    = socio.cntctCode;

        this.modeloFormSoc.patchValue(
          { cardCode: socio.cardCode, cardName: socio.cardName, cntctCode: socio.cntctCode },
          { emitEvent: false }
        );
      }),

      // 2) Preparar listas
      map((socio: IBusinessPartnersQuery) => ({
        socio,
        monedas  : socio.linesCurrency ?? [],
        shipAddr : socio.linesShipAddress ?? [],
        payAddr  : socio.linesPayAddress ?? []
      })),

      // 3) Actualizar combos + defaults (sin disparar eventos)
      tap(({ monedas, shipAddr, payAddr, socio }) => {
        this.currencyList    = (monedas || []).map(m => ({ label: m.currName, value: m.currCode }));
        this.shipAddressList = (shipAddr || []).map(d => ({ label: d.address, value: d }));
        this.payAddressList  = (payAddr || []).map(d => ({ label: d.address, value: d }));

        // Selección por defecto de moneda
        if (this.currencyList.length > 0) {
          let preferred: any;

          if (this.currencyList.length === 1) {
            preferred = this.currencyList[0];
          } else {
            preferred = this.currencyList.find(
              c => String(c.value).toUpperCase() === String(this.mainCurncy).trim().toUpperCase()
            );
          }

          if (preferred) {
            this.currency = preferred.value;
            this.modeloFormSoc.get('currency')?.setValue(preferred, { emitEvent: false });
          }
        }

        // Selección por defecto de direcciones y otros campos
        const defaultShipItem =
          this.shipAddressList.find(it => (it.value as IAddresses).address === socio.shipToDef) || null;

        if (defaultShipItem) {
          this.modeloFormLog.patchValue({ shipAddress: defaultShipItem }, { emitEvent: false });
        }

        const defaultPayItem =
          this.payAddressList.find(it => (it.value as IAddresses).address === socio.billToDef) || null;

        if (defaultPayItem) {
          this.modeloFormLog.patchValue({ payAddress: defaultPayItem }, { emitEvent: false });
        }

        const defaultGroup =
          this.paymentsTermsTypesList.find(it => it.value === socio.groupNum) || null;

        if (defaultGroup) {
          this.modeloFormFin.patchValue({ paymentsTermsTypes: defaultGroup }, { emitEvent: false });
        }

        const slpCodeNormalized = (socio.slpCode ?? 0) === 0 ? -1 : socio.slpCode;

        const defaultSalesEmployee =
          this.salesEmployeesList.find(it => it.value === slpCodeNormalized) || null;

        if (defaultSalesEmployee) {
          this.modeloFormSal.patchValue({ salesEmployees: defaultSalesEmployee }, { emitEvent: false });
        }
      }),

      // 4) Encadenar cargas dependientes + esperar a que terminen
      switchMap(({ monedas, shipAddr, payAddr, socio }) => {
        // OJO: aquí ya están seteados los defaults del form (salesEmployees, shipAddress, etc.)

        const defaultShip = (shipAddr || []).find((d: IAddresses) => d.address === socio.shipToDef);
        const defaultPay  = (payAddr  || []).find((d: IAddresses) => d.address === socio.billToDef);

        const shipToDef = String(socio.shipToDef ?? '').trim();

        // ✅ Ejecuta todo en paralelo y espera resultados
        return forkJoin({
          // Tipo cambio
          tipoCambio: this.currency ? this.loadTipoCambio(this.currency) : of(null),

          // Dirección entrega (fullAddress)
          shipStreet: defaultShip ? this.loadAddress(socio.cardCode, socio.shipToDef, 'S') : of(null),

          // Dirección factura (fullAddress)
          payStreet: defaultPay ? this.loadAddress(socio.cardCode, socio.billToDef, 'B') : of(null),

          // ✅ Impuesto por dirección (TaxGroup) - usando ShipToDef
          taxGroup: shipToDef ? this.loadTaxGroup(socio.cardCode, shipToDef) : of(null)
        }).pipe(
          map(result => ({ ...result, monedas, shipAddr, payAddr, socio }))
        );
      }),

      // 5) Aplicar resultados al final (direcciones + impuesto)
      tap(({ shipStreet, payStreet, taxGroup }) => {
        if (shipStreet !== null && shipStreet !== undefined) {
          this.modeloFormLog.patchValue({ address2: shipStreet }, { emitEvent: false });
        }

        if (payStreet !== null && payStreet !== undefined) {
          this.modeloFormLog.patchValue({ address: payStreet }, { emitEvent: false });
        }

        // ✅ Aquí ya terminó TODO: moneda, tipo cambio, direcciones, etc.
        // ✅ Ahora aplicas impuesto y “cargas” lo que necesites al final
        this.applyTaxToDocument(taxGroup);
      }),

      catchError(e => {
        this.utilService.handleErrorSingle(e, 'loadSocioNeogocioByCode', this.swaCustomService);
        return of(null);
      }),

      finalize(() => { this.isDisplay = false; })
    );
  }

  /**
   * Reutilizable: devuelve únicamente el valor numérico del tipo de cambio (o null).
   * No tiene side-effects sobre el formulario ni indicadores.
   */
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

  /**
   * Wrapper backward-compatible que mantiene comportamiento del componente
   * (spinner, parcheo del formulario y manejo de errores), pero delega
   * la obtención del valor a `fetchTipoCambioRate` para permitir reuso.
   */
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
        this.utilService.handleErrorSingle(e, 'loadTipoCambio', () => this.swaCustomService);
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

  private wireCurrencyControl(): void {
    this.modeloFormSoc.get('currency')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe((selected) => {

      this.currency = selected?.value ?? '';

      if (!this.currency) return;

      this.loadTipoCambio(this.currency)
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {

        for (let index = 0; index < this.modeloLines.length; index++) {
          if (this.modeloLines[index].itemCode) {
            this.getListByCode(this.modeloLines[index].itemCode, index);
          }
        }
      });
    });
  }

  //#endregion


  //#region <<< DOCUMENTO >>>

  private wireTipoControl(): void {
    this.modeloFormDoc.get('u_BPP_MDTD')?.valueChanges
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
    //const params = { u_BPP_NDTD: u_BPP_NDTD, u_BPP_NDCD: '', u_FIB_SEDE: 0, u_FIB_ENTR: this.u_FIB_ENTR, u_FIB_FAVE: this.u_FIB_FAVE, u_FIB_TRAN: this.u_FIB_TRAN };
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

              const documentTypeSunat = this.modeloFormDoc.controls['u_BPP_MDTD'].value
              const u_BPP_TDDD = documentTypeSunat?.value || documentTypeSunat;

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
    const tipo$   = this.modeloFormDoc.get('u_BPP_MDTD')!.valueChanges;
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


  //#region <<< CONTENIDO >>>

  get isItem(): boolean {
    return this.docTypeSelected?.value === 'I';
  }

  get isService(): boolean {
    return this.docTypeSelected?.value === 'S';
  }

  canSearchArticulo(): boolean {
    const cardCodeValid = !!this.cardCode;
    const salesEmployeeSelected = !!this.modeloFormSal.get('salesEmployees')?.value;

    return cardCodeValid && salesEmployeeSelected;
  }

  canSearchAccount(modelo: any): boolean {
    return this.isService && !!modelo.dscription?.trim();
  }

  canSearchWarehouse(modelo: any): boolean {
    return this.isItem && !!modelo.itemCode;
  }

  canSearchTax(modelo: any): boolean {
    return this.isService
      ? !!modelo.dscription?.trim()
      : !!modelo.itemCode;
  }

  canSearchTipoOperacion(modelo: any): boolean {
    return this.canSearchTax(modelo);
  }

  private wireDocTypeControl(): void {
    this.modeloFormCon.get('docType')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(docTyp => {

      const hasLines = this.modeloLines.filter(n => n.dscription.trim() !== '').length > 0;

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

  private addLine(index: number): void {
    this.modeloLines.splice(index, 0, {
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
    });
    this.updateHasValidLines();
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

    this.calculateLine(this.modeloLines[index], index);
    this.calculateTotals();
    this.updateHasValidLines();
  }

  getListByCode(itemCode: string, index: number): void {
    this.isDisplay = true;

    this.itemsService.getListByCode(this.buildFilterParams(itemCode))
      .pipe(
        finalize(() => this.isDisplay = false)
      )
      .subscribe({
      next: (data: any[]) => {
        if (!data || data.length === 0) {
          this.swaCustomService.swaMsgError('Artículo no encontrado');
          return;
        }
        this.setItem(data[0], index);
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
      warehouseProduction : 'Y',
      warehouseLogistics  : '',
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

  /** Abre el modal para seleccionar cuenta contable de la línea indicada */
  onOpenCuentaContable(index: number): void {
    // Abre modal para seleccionar cuenta contable de la línea
    this.indexCentroCuentaContable  = index;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }
  /** Maneja la selección de una cuenta contable desde el modal */
  onSelectedCuentaContable(value: any): void {
    const formValue = this.modeloFormSoc.getRawValue();
    const currency  = formValue.currency?.value || formValue.currency || '';

    // Aplica el centro de costo seleccionado a la línea actual
    const currentLine               = this.modeloLines[this.indexCentroCuentaContable];
    currentLine.acctCode            = value.acctCode;
    currentLine.formatCode          = value.formatCode;
    currentLine.acctName            = value.acctName;
    currentLine.currency            = currency;
    currentLine.taxCode             = this.taxCode;
    currentLine.vatPrcnt            = this.vatPrcnt;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }
  /** Cierra el modal de búsqueda de cuentas contables */
  onClickCloseCuentaContable(): void {
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }

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

  onChangeQuantity(value: IInvoice1Query, index: number)
  {
    this.calculateLine(value, index);
  }

  onChangePrice(value: IInvoice1Query, index: number)
  {
    this.calculateLine(value, index);
  }

  onChangeDiscPrcnt(value: IInvoice1Query, index: number)
  {
    this.calculateLine(value, index);
  }

  roundDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  }

  truncateDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.trunc(value * factor) / factor;
  }

  calculateLine(value: IInvoice1Query, index: number): void {
    let quantity       : number;
    let openQty        : number;
    let u_FIB_OpQtyPkg : number;
    let priceBefDi     : number;
    let discPrcnt      : number;
    let price          : number;
    let lineTotal      : number;
    let vatSum         : number;

    const docTypeValue = this.modeloFormCon.get('docType')?.value?.value;
    const isItemDoc         = docTypeValue === 'I';

    // 1️⃣ Cantidad (ROUND 3)
    quantity = value.itemCode === '' ? 0 : this.utilService.onRedondearDecimal(value.quantity, 3);

    openQty        = quantity;
    u_FIB_OpQtyPkg = quantity;

    // 2️⃣ Precio base (ROUND 3)
    priceBefDi = value.itemCode === '' ? (isItemDoc ? 0 : this.utilService.onRedondearDecimal(value.priceBefDi, 3)) : this.utilService.onRedondearDecimal(value.priceBefDi, 3);

    // 3️⃣ Descuento (ROUND 2)
    discPrcnt = value.itemCode === '' ?  (isItemDoc ? 0 : this.utilService.onRedondearDecimal(value.discPrcnt, 2))  : this.utilService.onRedondearDecimal(value.discPrcnt, 2);

    // 4️⃣ Precio tras descuento (ROUND 3) ❗ SAP NO TRUNCA
    const rawPrice = discPrcnt === 0 ? priceBefDi : priceBefDi * (1 - (discPrcnt / 100));

    price = this.utilService.onRedondearDecimal(rawPrice, 3);

    // 5️⃣ Total de línea (ROUND 2)
    lineTotal = isItemDoc ? this.utilService.onRedondearDecimal(quantity * price, 2) : this.utilService.onRedondearDecimal(price, 2);

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

  calculateTotalLines(): void {
    this.modeloLines.forEach((line, index) => {
      this.calculateLine(line, index);
    });
  }

  onClickCloseArticulo()
  {
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  onClickOpenImpuesto(index: number) {
    this.indexImpuesto = index;
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  onClickSelectedImpuesto(value: ITaxGroups) {
    this.modeloLines[this.indexImpuesto].taxCode      = value.code;
    this.modeloLines[this.indexImpuesto].vatPrcnt     = value.rate;
    this.calculateLine(this.modeloLines[this.indexImpuesto], this.indexImpuesto);
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  onClickCloseImpuesto()
  {
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  /** Abre el modal para seleccionar tipo de operación de la línea indicada */
  onOpenTipoOperacion(index: number): void {
    // Abre modal para seleccionar tipo de operación de la línea
    this.indexTipoOperacion = index;
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }
  /** Maneja la selección de un tipo de operación desde el modal */
  onSelectedTipoOperacion(value: any): void {
    // Aplica el tipo de operación seleccionado a la línea actual
    const currentLine               = this.modeloLines[this.indexTipoOperacion];
    currentLine.u_tipoOpT12         = value.code;
    currentLine.u_tipoOpT12Nam      = value.u_descrp;
    this.isVisualizarTipoOperacion  = !this.isVisualizarTipoOperacion;
  }
  /** Cierra el modal de búsqueda de tipos de operación */
  onClickCloseTipoOperacion(): void {
    this.isVisualizarTipoOperacion = !this.isVisualizarTipoOperacion;
  }

  //#endregion


  //#region <<< LOGÍSTICA >>>

  private wireShipAddressControl(): void {
    this.modeloFormLog.get('shipAddress')?.valueChanges
    .pipe(
      takeUntil(this.destroy$),

      switchMap((selected) => {

        if (!selected) return EMPTY;

        const address = selected.value;

        const formConValues = this.modeloFormCon.getRawValue();
        const docTypeValue  = formConValues.docType?.value;
        const isItemDoc     = docTypeValue === 'I';

        const linesWithData = this.modeloLines.filter(l =>
          isItemDoc
            ? !!String(l.itemCode ?? '').trim()
            : !!String(l.dscription ?? '').trim()
        );

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

        if (!selected) return EMPTY;

        const address = selected.value;

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

      const hasData =
        !!String(line.itemCode ?? '').trim() ||
        !!String(line.dscription ?? '').trim();

      if (!hasData) continue;

      line.taxCode  = this.taxCode;
      line.vatPrcnt = this.vatPrcnt;

      this.calculateLine(line, i);
    }

    this.calculateTotals();
  }

  //#endregion


  //#region <<< FINANZAS >>>

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


  //#region <<< AGENCIA >>>

  onClickCleanAgencia()
  {
    this.u_BPP_MDCT     = '';
    this.modeloFormAge.reset({
      'u_BPP_MDCT'      : '',
      'u_BPP_MDRT'      : '',
      'u_BPP_MDNT'      : '',
      'agencyAddress'   : '',
      'u_BPP_MDDT'      : ''
    });
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

  private agenciaLoadSubscription: Subscription | null = null;

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

  onChangeAgencyAddress(event?: any) {
    const selected = event?.value ?? null;
    if (!selected) return;
    const address = selected.value.address;

    // loadAddress ahora devuelve Observable; suscribirse para ejecutar y aplicar resultado
    this.loadAddress(this.u_BPP_MDCT, address, 'S')
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (fullAddress: string | null) => {
        if (fullAddress !== null && fullAddress !== undefined) {
          this.modeloFormAge.patchValue({ u_BPP_MDDT: fullAddress }, { emitEvent: false });
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onChangeAgencyAddress', this.swaCustomService);
      }
    });
  }

  //#endregion


  //#region << TRANSPORTISTA >>>

  onChangeTransportista({ checked }: any): void {
    this.manualTransport = !checked;
  }

  get colSize(): string {
    return this.manualTransport ? 'col-12 md:col-3' : 'col-12 md:col-4';
  }

  //#endregion


  //#region << EXPORTACIÓN >>>
  //#endregion


  //#region <<< TOTALES >>>

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

  calculateTotals(): void {
    const docTypeValue = this.modeloFormCon.get('docType')?.value?.value;
    const isItemDoc    = docTypeValue === 'I';

    // 1) SubTotal
    let subTotal = 0;
    for (const line of this.modeloLines) {
      const hasData = isItemDoc
        ? !!String(line.itemCode ?? '').trim()
        : !!String(line.dscription ?? '').trim();

      if (hasData) subTotal += (Number(line.lineTotal) || 0);
    }
    subTotal = this.utilService.onRedondearDecimal(subTotal, 2);

    // 2) Descuento: ✅ tomar discSum ya calculado por wireDiscountControls
    const discSum = this.toNumber(this.modeloFormTot.get('discSum')?.value);

    // Si necesitas el porcentaje para factorExact, puedes leerlo también
    const discPrcnt   = this.toNumber(this.modeloFormTot.get('discPrcnt')?.value);
    const factorExact = 1 - (discPrcnt / 100);
    const factorLine  = this.utilService.onRedondearDecimal(factorExact, 3);

    let sumNumBults   = 0;
    let sumWeightKg   = 0;

    // 3) IGV por línea (tu lógica SAP igual)
    let sumLineVat    = 0;
    let rawVatDocTot  = 0;
    const taxableIdx  : number[] = [];

    for (let i = 0; i < this.modeloLines.length; i++) {
      const line     = this.modeloLines[i];
      const vatPrcnt = Number(line.vatPrcnt) || 0;

      const hasData = isItemDoc
        ? !!String(line.itemCode ?? '').trim()
        : !!String(line.dscription ?? '').trim();

      if (!hasData || vatPrcnt === 0) {
        line.vatSum = 0;
        continue;
      }

      const numBulk   = this.utilService.onRedondearDecimal(line.u_FIB_NBulto, 2);
      const weightKg  = this.utilService.onRedondearDecimal(line.u_FIB_PesoKg, 2);

      sumNumBults += numBulk;
      sumWeightKg += weightKg;

      const lineTotal = Number(line.lineTotal) || 0;

      const vatLine0  = this.utilService.onRedondearDecimal((lineTotal * vatPrcnt) / 100, 2);
      const vatLine   = this.utilService.onRedondearDecimal(vatLine0 * factorLine, 2);

      line.vatSum = vatLine;
      sumLineVat += vatLine;

      rawVatDocTot += ((lineTotal * factorExact) * vatPrcnt) / 100;
      taxableIdx.push(i);
    }

    const vatSumDoc = this.utilService.onRedondearDecimal(rawVatDocTot, 2);

    // 4) Ajuste de centavos (igual)
    let diffCents = Math.round((vatSumDoc - sumLineVat) * 100);
    if (diffCents !== 0 && taxableIdx.length > 0) {
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

    // 5) Total doc
    let docTotal = subTotal - discSum + vatSumDoc;
    docTotal = this.utilService.onRedondearDecimal(docTotal, 2);

    this.modeloFormSal.patchValue({
      u_FIB_NBULTOS   : this.utilService.onRedondearDecimalConCero(sumNumBults, 2),
      u_FIB_KG        : this.utilService.onRedondearDecimalConCero(sumWeightKg, 2)
    }, { emitEvent: false });

    // 6) Patch final: ✅ NO tocar discSum ni discPrcnt aquí
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


  //#region <<< SAVE >>>

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

    const docType   = p(val(f.docType));
    const isItemDoc = docType === 'I';

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
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormSal.getRawValue(),
      ...this.modeloFormTot.getRawValue(),
    };
  }

  private mapLinesCreate(isItemDoc:boolean): Invoice1CreateModel[] {
    /** helpers para evitar repetición */
    const u          = this.utilService;
    const p          = (v:any)=>u.normalizePrimitive(v);
    const n          = (v:any)=>u.normalizeNumber(v);
    const val        = (v:any)=>v?.value ?? v;

    const f          = this.modeloFormSoc.getRawValue();

    return this.modeloLines
    .filter(line => isItemDoc ? p(line.itemCode) !== '' : p(line.dscription) !== '')
    .map<Invoice1CreateModel>(line => ({
      baseType        : line.baseType == null || line.baseType === 0 ? -1   : n(line.baseType),
      baseEntry       : line.baseType == null || line.baseType === 0 ? null : n(line.baseEntry),
      baseLine        : line.baseType == null || line.baseType === 0 ? null : n(line.baseLine),

      itemCode        : p(line.itemCode),
      dscription      : p(line.dscription),

      acctCode        : p(line.acctCode),
      formatCode      : p(line.formatCode),
      acctName        : p(line.acctName),

      whsCode         : p(line.whsCode),

      unitMsr         : p(line.unitMsr),
      quantity        : n(line.quantity),

      currency        : p(line.currency) || p(val(f.currency)),
      priceBefDi      : n(line.priceBefDi),
      discPrcnt       : n(line.discPrcnt),
      price           : n(line.price),

      taxCode         : p(line.taxCode),
      lineTotal       : n(line.lineTotal),

      u_FIB_OpQtyPkg  : n(line.u_FIB_OpQtyPkg),
      u_tipoOpT12     : p(line.u_tipoOpT12),
    }));
  }

  private buildModelToSave(): InvoiceCreateModel {
    /** helpers para evitar repetición */
    const u           = this.utilService;
    const p           = (v:any)=>u.normalizePrimitive(v);
    const n           = (v:any)=>u.normalizeNumber(v);
    const d           = (v:any)=>u.normalizeDateOrToday(v);
    const val         = (v:any)=>v?.value ?? v;
    const label       = (v:any)=>v?.label ?? v ?? '';

    /** combinar tod  os los formularios */
    const f           = this.mergeForms();

    const docCur      = p(val(f.currency));
    const docType     = p(val(f.docType));

    const userId      = this.userContextService.getIdUsuario();

    const docRate     = docCur === this.mainCurncy ? 1 : n(f.docRate);

    const isItemDoc   = docType === 'I';
    const u_FIB_IsPkg = isItemDoc ? 'Y' : 'N';

    const lines       = this.mapLinesCreate(isItemDoc);

    return {
      ...new InvoiceCreateModel(),

      docDate         : d(f.docDate),
      docDueDate      : d(f.docDueDate),
      taxDate         : d(f.taxDate),
      reserveInvoice  : 'Y',
      docType         : docType,

      // SUNAT
      u_BPP_MDTD      : p(val(f.u_BPP_MDTD)),
      u_BPP_MDSD      : p(f.u_BPP_MDSD),
      u_BPP_MDCD      : p(f.u_BPP_MDCD),

      u_FIB_IsPkg     : u_FIB_IsPkg,

      // SOCIO DE NEGOCIOS
      cardCode        : p(f.cardCode),
      cardName        : p(f.cardName),
      cntctCode       : n(f.cntctCode),
      numAtCard       : p(f.numAtCard),
      docCur          : docCur,
      docRate         : docRate,

      // LOGISTICA
      payToCode       : p(label(f.payAddress)),
      address         : p(f.address),
      shipToCode      : p(label(f.shipAddress)),
      address2        : p(f.address2),

      // FINANZAS
      groupNum        : n(val(f.paymentsTermsTypes)),

      // AGENCIA
      u_BPP_MDCT      : p(f.u_BPP_MDCT),
      u_BPP_MDRT      : p(f.u_BPP_MDRT),
      u_BPP_MDNT      : p(f.u_BPP_MDNT),
      u_FIB_CODT      : p(label(f.agencyAddress)),
      u_BPP_MDDT      : p(f.u_BPP_MDDT),

      // EXPORTACION
      u_TipoFlete     : p(val(f.freightType)),
      u_ValorFlete    : n(f.u_ValorFlete),
      u_FIB_TFLETE    : n(f.u_FIB_TFLETE),
      u_FIB_IMPSEG    : n(f.u_FIB_IMPSEG),
      u_FIB_PUERTO    : p(f.u_FIB_PUERTO),

      // OTROS
      u_STR_TVENTA    : p(val(f.salesType)),

      // VENDEDOR
      slpCode         : n(val(f.salesEmployees) ?? -1),

      u_NroOrden      : p(f.u_NroOrden),
      u_OrdenCompra   : p(f.u_OrdenCompra),
      comments        : p(f.comments),

      // TOTALES
      discPrcnt       : n(f.discPrcnt),
      docTotal        : n(f.docTotal),

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

  private clearSession(): void {
    sessionStorage.removeItem('ordenVentaCopyTo');
  }

  onClickBack() {
    this.clearSession();
    this.router.navigate(['/main/modulo-ven/panel-factura-reserva-list']);
  }
}
