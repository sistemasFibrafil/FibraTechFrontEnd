import { SelectItem } from 'primeng/api';
import { NavigationStart, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { catchError, switchMap, map, finalize, tap } from 'rxjs/operators';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject, forkJoin, of, from, EMPTY, Subscription, Observable, takeUntil, filter, combineLatest } from 'rxjs';

import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { ItemsFindByListCodeModel } from '../../../../modulo-inventario/models/items.model';
import { DeliveryNotesPickingUpdateModel } from 'src/app/modulos/modulo-inventario/models/picking.model';
import { DeliveryNotes1CreateModel, DeliveryNotesCreateModel } from '../../../models/sap-business-one/delivery-notes.model';

import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IPicking } from 'src/app/modulos/modulo-inventario/interfaces/picking.inteface';
import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/items.interface';
import { IAddresses } from 'src/app/modulos/modulo-socios-negocios/interfaces/addresses.interface';
import { IExchangeRates } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';
import { IBusinessPartnersQuery } from 'src/app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';
import { IDeliveryNotes1Query, IDeliveryNotesQuery } from '../../../interfaces/sap-business-one/delivery-notes.interface';
import { ITaxGroups } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/impuesto-sap.iterface';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { IDocumentNumberingSeriesSunat, IDocumentNumberingSeriesSunatQuery } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.interface';

import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { ItemsService } from 'src/app/modulos/modulo-inventario/services/items.service';
import { DeliveryNotesService } from '../../../services/sap-business-one/delivery-notes.service';
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


@Component({
  selector: 'app-ven-panel-entrega-create',
  templateUrl: './panel-entrega-create.component.html',
  styleUrls: ['./panel-entrega-create.component.css']
})
export class PanelEntregaCreateComponent implements OnInit, OnDestroy {

  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();
  private socioLoadSubscription                 : Subscription | null = null;
  // Titulo del componente
  titulo                                        = 'Entrega de Venta';
  // Acceso de botones
  buttonAccess                                  : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  modeloFormSoc                                 : FormGroup;
  modeloFormDoc                                 : FormGroup;
  modeloFormCon                                 : FormGroup;
  modeloFormLog                                 : FormGroup;
  modeloFormFin                                 : FormGroup;
  modeloFormAge                                 : FormGroup;
  modeloFormTra                                 : FormGroup;
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
  u_FIB_ENTR                                    : string = 'Y';
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
  documentTypeSunatList                         : SelectItem[] = [];
  agencyAddressList                             : SelectItem[] = [];
  typeTransportList                             : SelectItem[] = [];
  reasonTransferList                            : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];
  paymentsTermsTypesList                        : SelectItem[] = [];
  typeDriversIdentityDocumentList               : SelectItem[] = [];
  typeCarrierIdentityDocumentList               : SelectItem[] = [];

  // Progreso
  isLocked                                      : boolean = true;
  isSaving                                      : boolean = false;
  isDisplay                                     : boolean = false;
  hasValidLines                                 : boolean = false;
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

  modeloLinesSelected                           : IDeliveryNotes1Query;

  opciones                                      : MenuItem[];
  columnas                                      : TableColumn[];
  columnasModal                                 : TableColumn[];

  modeloLines                                   : IDeliveryNotes1Query[] = [];
  modeloPickingLines                            : IPicking[] = [];
  modeloPickingOriginalLines                    : IPicking[] = [];

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly itemsService: ItemsService,
    private readonly addressesService: AddressesService,
    private readonly taxGroupsService: TaxGroupsService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly deliveryNotesService: DeliveryNotesService,
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
    this.wireAgencyAddressControl();

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
      agencyAddress                 : new FormControl(''), // U_FIB_CODT
      u_BPP_MDDT                    : new FormControl(''),
    });
    // TRANSPORTISTA
    this.modeloFormTra = this.fb.group({
      typeTransport                 : new FormControl(''), // u_FIB_TIP_TRANS
      u_FIB_COD_TRA                 : new FormControl(''),
      typeCarrierIdentityDocument   : new FormControl(''), // u_FIB_TIPDOC_TRA
      u_FIB_RUC_TRANS2              : new FormControl(''),
      u_FIB_TRANS2                  : new FormControl(''),
      u_BPP_MDVC                    : new FormControl(''),

      typeDriversIdentityDocument   : new FormControl(''), // u_FIB_TIPDOC_COND
      u_FIB_NUMDOC_COD              : new FormControl(''),
      u_FIB_NOM_COND                : new FormControl(''),
      u_FIB_APE_COND                : new FormControl(''),
      u_BPP_MDFN                    : new FormControl(''),
      u_BPP_MDFC                    : new FormControl(''),
    });
    // EXPORTACIÓN
    this.modeloFormExp = this.fb.group({
      u_RUCDestInter                : new FormControl(''),
      u_DestGuiaInter               : new FormControl(''),
      u_DireccDestInter             : new FormControl(''),
      u_STR_NCONTENEDOR             : new FormControl(''),
      u_STR_NPRESCINTO              : new FormControl(''),
      u_FIB_NPRESCINTO2             : new FormControl(''),
      u_FIB_NPRESCINTO3             : new FormControl(''),
      u_FIB_NPRESCINTO4             : new FormControl(''),
    });
    // OTROS
    this.modeloFormOtr = this.fb.group({
      salesType                     : new FormControl('', Validators.required), // u_STR_TVENTA
      reasonTransfer                : new FormControl('', Validators.required), // u_BPP_MDMT
      u_BPP_MDOM                    : new FormControl(''),
    });
    // PIE - Información adicional y totales
    this.modeloFormSal = this.fb.group({
      salesEmployees                : new FormControl('', Validators.required), // slpCode
      u_FIB_NBULTOS                 : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      u_FIB_KG                      : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
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
        { field: 'u_FIB_NBulto',    header: 'N° bulto' },
        { field: 'u_FIB_PesoKg',    header: 'Kg' },
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

    this.columnasModal = [
      { field: 'u_ItemCode',      header: 'Código' },
      { field: 'u_CodeBar',       header: 'Barcode' },
      { field: 'u_UnitMsr',       header: 'UM' },
      { field: 'u_WeightKg',      header: 'Kg' },
      { field: 'u_Quantity',      header: 'Cantidad' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { value: '1', label: 'Ver',             icon: 'pi pi-eye',                    command: () => this.onClickView() },
      { value: '2', label: 'Añadir línea',    icon: 'pi pi-plus',                   command: () => this.onClickAddLine() },
      { value: '3', label: 'Borrar línea',    icon: 'pi pi-trash',                  command: () => this.onClickDelete()  },
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

  onSelectedItem(modelo: IDeliveryNotes1Query) {
    /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
  }

  onClickView(): void {
    this.modeloPickingLines = this.modeloPickingOriginalLines.filter(x => x.u_BaseEntry === this.modeloLinesSelected.baseEntry && x.u_BaseLine === this.modeloLinesSelected.baseLine);
    this.isVisualizarBarcode = true;
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

    // Se borra el registro de la lectura
    this.modeloPickingOriginalLines.filter(x => x.u_BaseEntry === this.modeloLinesSelected.baseEntry && x.u_BaseLine === this.modeloLinesSelected.baseLine).forEach(x => this.modeloPickingOriginalLines.splice(this.modeloPickingOriginalLines.indexOf(x), 1));

    this.updateHasValidLines();
  }

  onClickBuscarModal(): void {
    if (!this.modeloLinesSelected) return;

    const u_CodeBar = String(this.modeloFormCod.get('u_CodeBar')?.value ?? '' ).trim().toUpperCase();

    const { baseEntry, baseLine } = this.modeloLinesSelected;

    this.modeloPickingLines = this.modeloPickingOriginalLines.filter(x => x.u_BaseEntry === baseEntry && x.u_BaseLine === baseLine && (!u_CodeBar || String(x.u_CodeBar ?? '').toUpperCase().includes(u_CodeBar)));
  }

  onClickDeleteRowModal(value: IPicking): void {
    // Remover registro de modeloPickingOriginalLines y del modal
    this.modeloPickingOriginalLines.filter(x => x.docEntry === value.docEntry).forEach(x => this.modeloPickingOriginalLines.splice(this.modeloPickingOriginalLines.indexOf(x), 1));
    this.modeloPickingLines.filter(x => x.docEntry === value.docEntry).forEach(x => this.modeloPickingLines.splice(this.modeloPickingLines.indexOf(x), 1));

    const quantity  = this.modeloPickingLines.reduce((acc, x) => acc + x.u_Quantity, 0);
    const peso      = this.modeloPickingLines.reduce((acc, x) => acc + x.u_WeightKg, 0);
    const bulto     = this.modeloPickingLines.reduce((acc, x) => acc + x.u_NumBulk, 0);

    // Asumir que siempre existe modeloSelected: usar su índice para actualizar/eliminar la línea
    const selectedIndex = this.modeloLines.findIndex(l => l === this.modeloLinesSelected);
    if (selectedIndex > -1) {
      if (this.modeloPickingLines.length === 0) {
        // No quedan barcodes para la línea: eliminarla
        this.modeloLines.splice(selectedIndex, 1);
      } else {
        // Actualizar valores de la línea seleccionada
        const linea = this.modeloLines[selectedIndex];
        linea.quantity = quantity;
        linea.u_FIB_NBulto = bulto;
        linea.u_FIB_PesoKg = peso;
      }
    }

    this.calculateTotalLines();
  }

  onClearModal(): void {
    this.modeloPickingLines = [];
    this.isVisualizarBarcode = false;
    this.modeloFormCod.patchValue({ 'u_CodeBar' : '' });
  }

  onHideModal(): void {
    this.onClearModal();
  }

  onClickCloseModal(): void {
    this.onClearModal();
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
    const paramSalesType                    : any = { tableID: 'ORDR', aliasID: 'STR_TVENTA' };
    const paramTypeTransport                : any = { tableID: 'ODLN', aliasID: 'FIB_TIP_TRANS' };
    const paramReasonTransfer               : any = { tableID: 'ODLN', aliasID: 'BPP_MDMT' };
    const paramDocumentTypeSunat            : any = { u_FIB_ENTR: 'Y', u_FIB_FAVE: '', u_FIB_TRAN: '' };
    const paramDocumentNumberingSeries      : any = { objectCode: '15', docSubType: '--' };
    const paramTypeCarrierIdentityDocument  : any = { tableID: 'ODLN', aliasID: 'FIB_TIPDOC_TRA' };
    const paramTypeDriversIdentityDocument  : any = { tableID: 'ODLN', aliasID: 'FIB_TIPDOC_COND' };

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
      salesType                     : this.camposDefinidoUsuarioService.getList(paramSalesType),
      typeTransport                 : this.camposDefinidoUsuarioService.getList(paramTypeTransport),
      reasonTransfer                : this.camposDefinidoUsuarioService.getList(paramReasonTransfer),
      salesEmployees                : this.salesPersonsService.getList(),
      documentTypeSunat             : this.documentTypeSunatService.getListByType(paramDocumentTypeSunat),
      paymentsTermsTypes            : this.paymentTermsTypesService.getList(),
      documentNumberingSeries       : this.documentNumberingSeriesService.getNumero(paramDocumentNumberingSeries),
      typeCarrierIdentityDocument   : this.camposDefinidoUsuarioService.getList(paramTypeCarrierIdentityDocument),
      typeDriversIdentityDocument   : this.camposDefinidoUsuarioService.getList(paramTypeDriversIdentityDocument),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {
        this.modeloFormDoc.patchValue({ docNum: res.documentNumberingSeries.nextNumber }, { emitEvent: false });

        this.salesTypeList                    = (res.salesType || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.typeTransportList                = (res.typeTransport || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.reasonTransferList               = (res.reasonTransfer || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.salesEmployeesList               = (res.salesEmployees || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.documentTypeSunatList            = (res.documentTypeSunat || []).map(item => ({ label: item.u_BPP_TDDD, value: item.u_BPP_TDTD }));
        this.paymentsTermsTypesList           = (res.paymentsTermsTypes || []).map(item => ({ label: item.pymntGroup, value: item.groupNum }));
        this.typeCarrierIdentityDocumentList  = (res.typeCarrierIdentityDocument || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.typeDriversIdentityDocumentList  = (res.typeDriversIdentityDocument || []).map(item => ({ label: item.descr, value: item.fldValue }));

        const defaultTipoDoc = res.documentTypeSunat.find(item => item.u_FIB_ENDF === 'Y');
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
      this.swaCustomService.swaMsgInfo('La información de entrega se perdió. Vuelva a iniciar el proceso.');
      this.onClickBack();
      return;
    }

    this.setFormValues(ordenVenta);
  }

  private setFormValues(value: IDeliveryNotesQuery): void {
    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    //this.isLocked     = value.docStatus !== 'O';
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
        currency : currencyItem || null,
        docRate  : this.utilService.onRedondearDecimalConCero(value.docRate ?? 0, 3),
      },
      { emitEvent: false }
    );


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
    this.modeloPickingOriginalLines = value.pickingLines.map(line => ({ ...line }));
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

  private wireCurrencyControl(): void {
    this.modeloFormSoc.get('currency')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(selected => {

      if (!selected) return;

      this.currency = selected?.value || '';

      this.loadTipoCambio(this.currency)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {

          for (let index = 0; index < this.modeloLines.length; index++) {
            if (this.modeloLines[index].itemCode) {
              this.getListByCode(this.modeloLines[index].itemCode,index);
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
    const params = {
      idUsuario: this.userContextService.getIdUsuario(),
      u_BPP_NDTD,
      u_BPP_NDCD: '',
      u_Delivery: 'Y',
      u_SalesInvoices: '',
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
        u_FIB_PesoKg      : 0,
        u_FIB_NBulto      : 0,

        currency          : '',
        priceBefDi        : 0,
        discPrcnt         : 0,
        price             : 0,
        taxCode           : '',
        u_tipoOpT12       : '',
        u_tipoOpT12Nam    : '',
        vatPrcnt          : 0,
        vatSum            : 0,
        lineTotal         : 0,
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

  onDescChange(value: IDeliveryNotes1Query) {
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

  onChangeQuantity(value: IDeliveryNotes1Query, index: number)
  {
    this.calculateLine(value, index);
  }

  onChangePrice(value: IDeliveryNotes1Query, index: number)
  {
    this.calculateLine(value, index);
  }

  onChangeDiscPrcnt(value: IDeliveryNotes1Query, index: number)
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

  calculateLine(value: IDeliveryNotes1Query, index: number): void {
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


  //#region << TRANSPORTISTA >>>

  // ===========================
  // RESET / LIMPIEZA TOTAL
  // ===========================
  resetTransportista(): void {
    this.u_FIB_COD_TRA         = '';

    this.modeloFormTra.reset({
      typeTransport                 : '',
      u_FIB_COD_TRA                 : '',
      typeCarrierIdentityDocument   : '',
      u_FIB_RUC_TRANS2              : '',
      u_FIB_TRANS2                  : '',
      u_BPP_MDVC                    : '',

      typeDriversIdentityDocument   : '',
      u_FIB_NUMDOC_COD              : '',
      u_FIB_NOM_COND                : '',
      u_FIB_APE_COND                : '',
      u_BPP_MDFN                    : '',
      u_BPP_MDFC                    : '',
    }, { emitEvent: false });
  }

  onSelectedTransportista(value) {
    this.resetTransportista();

    this.u_FIB_COD_TRA = value.cardCode;

    const typeCarrierIdentityDocumentItem = this.typeCarrierIdentityDocumentList.find(item => item.value === value.u_BPP_BPTD);

    this.modeloFormTra.patchValue({
      'u_FIB_COD_TRA'               : this.utilService.normalizePrimitive(value.cardCode),
      'typeCarrierIdentityDocument' : typeCarrierIdentityDocumentItem || null,
      'u_FIB_RUC_TRANS2'            : this.utilService.normalizePrimitive(value.licTradNum),
      'u_FIB_TRANS2'                : this.utilService.normalizePrimitive(value.cardName)
    }, { emitEvent: false });
  }

  onSelectedVehiculo(value) {
    this.modeloFormTra.patchValue({
      'u_BPP_MDVC'                  : this.utilService.normalizePrimitive(value.u_BPP_VEPL)
    }, { emitEvent: false });
  }

  onSelectedConductor(value) {
    const typeDriversIdentityDocumentItem = this.typeDriversIdentityDocumentList.find(item => item.value === value.u_FIB_CHTD);

    this.modeloFormTra.patchValue({
      typeDriversIdentityDocument   : typeDriversIdentityDocumentItem || null,
      u_FIB_NUMDOC_COD              : this.utilService.normalizePrimitive(value.u_FIB_CHND),
      u_FIB_NOM_COND                : this.utilService.normalizePrimitive(value.u_BPP_CHNO),
      u_FIB_APE_COND                : this.utilService.normalizePrimitive(value.u_FIB_CHAP),
      u_BPP_MDFN                    : (this.utilService.normalizePrimitive(value?.u_BPP_CHNO) + ' ' + this.utilService.normalizePrimitive(value?.u_FIB_CHAP)).trim(),
      u_BPP_MDFC                    : this.utilService.normalizePrimitive(value.u_BPP_CHLI),
    }, { emitEvent: false });
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

  validatedSave(){
    /** Valida que el documento esté completo antes de guardar */
    const showError = (message: string): boolean => {
      this.swaCustomService.swaMsgInfo(message);
      return false;
    };

    const formConValues     = this.modeloFormCon.getRawValue();

    const docTypeValue      = formConValues.docType?.value;
    const isItemDoc         = docTypeValue === 'I';

    const line = this.modeloLines.filter(line => isItemDoc ? line.itemCode !== '' : line.dscription !== '')

    for (const line of this.modeloLines.filter(line => isItemDoc ? line.itemCode !== '' : line.dscription !== '')) {
      if (!isItemDoc && this.utilService.normalizePrimitive(line.acctCode) === '') {
        return showError('Seleccione la cuenta contable en el detalle.');
      }
      if (isItemDoc && this.utilService.normalizePrimitive(line.whsCode) === '')
      {
        return showError('Seleccion el almacén para el artículo en el detalle.');
      }
      if (isItemDoc && line.quantity === 0)
      {
        return showError('La cantidad debe ser mayor que CERO (0) en el detalle.');
      }
      if (this.utilService.normalizePrimitive(line.taxCode) === '')
      {
        return showError('Seleccion el impuesto para el artículo en el detalle.');
      }
      if (this.utilService.normalizePrimitive(line.u_tipoOpT12) === '')
      {
        return showError('Seleccion el tipo de operación para el artículo en el detalle.');
      }
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
      ...this.modeloFormTra.getRawValue(),
      ...this.modeloFormExp.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormSal.getRawValue(),
      ...this.modeloFormTot.getRawValue(),
    };
  }

  private mapLinesCreate(): DeliveryNotes1CreateModel[] {
    const u           = this.utilService;
    const p           = (v:any)=>u.normalizePrimitive(v);
    const n           = (v:any)=>u.normalizeNumber(v);
    const val         = (v:any)=>v?.value ?? v;

    const f           = this.modeloFormSoc.getRawValue();

    return this.modeloLines
    .filter(line => p(line.itemCode) !== '')
    .map<DeliveryNotes1CreateModel>(line => ({
      baseType        : line.baseType == null || line.baseType === 0 ? -1   : n(line.baseType),
      baseEntry       : line.baseType == null || line.baseType === 0 ? null : n(line.baseEntry),
      baseLine        : line.baseType == null || line.baseType === 0 ? null : n(line.baseLine),

      itemCode        : p(line.itemCode),
      dscription      : p(line.dscription),

      acctCode        : p(line.acctCode),
      whsCode         : p(line.whsCode),

      unitMsr         : p(line.unitMsr),
      quantity        : n(line.quantity),

      currency        : p(line.currency) || p(val(f.currency)),
      priceBefDi      : n(line.priceBefDi),
      discPrcnt       : n(line.discPrcnt),
      price           : n(line.price),

      taxCode         : p(line.taxCode),
      lineTotal       : n(line.lineTotal),

      u_FIB_FromPkg   : p(line.u_FIB_FromPkg),
      u_FIB_NBulto    : n(line.u_FIB_NBulto),
      u_FIB_PesoKg    : n(line.u_FIB_PesoKg),
      u_tipoOpT12     : p(line.u_tipoOpT12)
    }));
  }

  private mapPickingLines(userId:number): DeliveryNotesPickingUpdateModel[] {
    const u           = this.utilService;
    const p           = (v:any)=>u.normalizePrimitive(v);
    const n           = (v:any)=>u.normalizeNumber(v);

    return this.modeloPickingOriginalLines
    .map<DeliveryNotesPickingUpdateModel>(line => ({
      docEntry        : n(line.docEntry),
      u_BaseEntry     : n(line.u_BaseEntry),
      u_BaseLine      : n(line.u_BaseLine),

      u_Status        : p(line.u_Status),
      u_UsrUpdate     : n(userId)
    }));
  }

  private buildModelToSave(): DeliveryNotesCreateModel {
    /** helpers para evitar repetición */
    const u             = this.utilService;
    const p             = (v:any)=>u.normalizePrimitive(v);
    const n             = (v:any)=>u.normalizeNumber(v);
    const d             = (v:any)=>u.normalizeDateOrToday(v);
    const val           = (v:any)=>v?.value ?? v;
    const label         = (v:any)=>v?.label ?? v ?? '';

    /** combinar todos los formularios */
    const f             = this.mergeForms();

    const userId        = this.userContextService.getIdUsuario();

    const docCur        = p(val(f.currency));
    const docType       = p(val(f.docType));

    const docRate       = docCur === this.mainCurncy ? 1 : n(f.docRate);

    const lines         = this.mapLinesCreate();
    const pickingLines  = this.mapPickingLines(userId);

    return {
      ...new DeliveryNotesCreateModel(),

      docDate           : d(f.docDate),
      docDueDate        : d(f.docDueDate),
      taxDate           : d(f.taxDate),

      docType           : docType,

      u_BPP_MDTD        : p(val(f.u_BPP_MDTD)),
      u_BPP_MDSD        : p(f.u_BPP_MDSD),
      u_BPP_MDCD        : p(f.u_BPP_MDCD),

      cardCode          : p(f.cardCode),
      cardName          : p(f.cardName),
      cntctCode         : n(f.cntctCode),
      numAtCard         : p(f.numAtCard),
      docCur            : docCur,
      docRate           : docRate,

      payToCode         : p(label(f.payAddress)),
      address           : p(f.address),
      shipToCode        : p(label(f.shipAddress)),
      address2          : p(f.address2),

      groupNum          : n(val(f.paymentsTermsTypes)),

      u_BPP_MDCT        : p(f.u_BPP_MDCT),
      u_BPP_MDRT        : p(f.u_BPP_MDRT),
      u_BPP_MDNT        : p(f.u_BPP_MDNT),
      u_FIB_CODT        : p(label(f.agencyAddress)),
      u_BPP_MDDT        : p(f.u_BPP_MDDT),

      u_FIB_TIP_TRANS   : p(val(f.typeTransport)),
      u_FIB_COD_TRA     : p(f.u_FIB_COD_TRA),
      u_FIB_TIPDOC_TRA  : p(val(f.typeCarrierIdentityDocument)),
      u_FIB_RUC_TRANS2  : p(f.u_FIB_RUC_TRANS2),
      u_FIB_TRANS2      : p(f.u_FIB_TRANS2),
      u_BPP_MDVC        : p(f.u_BPP_MDVC),

      u_FIB_TIPDOC_COND : p(val(f.typeDriversIdentityDocument)),
      u_FIB_NUMDOC_COD  : p(f.u_FIB_NUMDOC_COD),
      u_FIB_NOM_COND    : p(f.u_FIB_NOM_COND),
      u_FIB_APE_COND    : p(f.u_FIB_APE_COND),
      u_BPP_MDFN        : p(f.u_BPP_MDFN),
      u_BPP_MDFC        : p(f.u_BPP_MDFC),

      u_RUCDestInter    : p(f.u_RUCDestInter),
      u_DestGuiaInter   : p(f.u_DestGuiaInter),
      u_DireccDestInter : p(f.u_DireccDestInter),
      u_STR_NCONTENEDOR : p(f.u_STR_NCONTENEDOR),
      u_STR_NPRESCINTO  : p(f.u_STR_NPRESCINTO),
      u_FIB_NPRESCINTO2 : p(f.u_FIB_NPRESCINTO2),
      u_FIB_NPRESCINTO3 : p(f.u_FIB_NPRESCINTO3),
      u_FIB_NPRESCINTO4 : p(f.u_FIB_NPRESCINTO4),

      u_STR_TVENTA      : p(val(f.salesType)),
      u_BPP_MDMT        : p(val(f.reasonTransfer)),
      u_BPP_MDOM        : p(f.u_BPP_MDOM),

      slpCode           : n(val(f.salesEmployees) ?? -1),

      u_FIB_NBULTOS     : n(f.u_FIB_NBULTOS),
      u_FIB_KG          : n(f.u_FIB_KG),

      u_NroOrden        : p(f.u_NroOrden),
      u_OrdenCompra     : p(f.u_OrdenCompra),

      comments          : p(f.comments),

      discPrcnt         : n(f.discPrcnt),
      docTotal          : n(f.docTotal),

      u_UsrCreate       : userId,

      lines,
      pickingLines
    };
  }

  onToSave() {
    if(!this.validatedSave()) return;

    this.isSaving = true;

    const modeloToSave = this.buildModelToSave();

    this.deliveryNotesService.setCreate(modeloToSave)
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
    this.router.navigate(['/main/modulo-ven/panel-entrega-list']);
  }
}
