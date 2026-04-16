import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';
import { catchError, switchMap, map, finalize, tap, take, filter } from 'rxjs/operators';
import { Subject, forkJoin, of, takeUntil, Subscription, Observable, merge, EMPTY, from } from 'rxjs';

import { Drafts1UpdateModel, DraftsUpdateModel } from '../../../models/drafts.model';

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



@Component({
  selector: 'app-bor-panel-documento-borrador-edit',
  templateUrl: './panel-documento-borrador-edit.component.html',
  styleUrls: ['./panel-documento-borrador-edit.component.css']
})
export class PanelDocumentoBorradorEditComponent implements OnInit, OnDestroy {

  isLoadingInitialData                          : boolean = false;
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();
  private taxGroupSubscription                  : Subscription | null = null;
  private shipAddressSubscription               : Subscription | null = null;

  // Titulo del componente
  titulo                                        = 'Orden de Venta';
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

  id                                            : number = 0;
  sysRate                                       : number = 0;
  docEntry                                      : number = 0;
  vatPrcnt                                      : number = 0;
  cntctCode                                     : number = 0;

  taxCode                                       : string = '';
  cardCode                                      : string = '';
  currency                                      : string = '';
  itemCode                                      : string = '';
  mainCurncy                                    : string = '';
  u_BPP_MDCT                                    : string = '';
  inactiveAlmacenItem                           : string = 'N';

  docTypeSelected                               : any;
  initialSnapshot!                              : any;

  currencyList                                  : SelectItem[] = [];
  docTypesList                                  : SelectItem[] = [];
  payAddressList                                : SelectItem[] = [];
  shipAddressList                               : SelectItem[] = [];
  agencyAddressList                             : SelectItem[] = [];
  freightTypeList                               : SelectItem[] = [];
  salesTypeList                                 : SelectItem[] = [];
  paymentsTermsTypesList                        : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];

  // Progreso
  isLocked                                      : boolean = true;
  isSaving                                      : boolean = false;
  isDisplay                                     : boolean = false;
  hasValidLines                                 : boolean = false;
  hasRealChanges                                : boolean = false;
  isVisualizarAlmacen                           : boolean = false;
  isVisualizarImpuesto                          : boolean = false;
  isVisualizarArticulo                          : boolean = false;
  isVisualizarTipoOperacion                     : boolean = false;
  isVisualizarCuentaContable                    : boolean = false;

  // modeloLines
  indexAlmacen                                  : number = 0;
  indexImpuesto                                 : number = 0;
  indexArticulo                                 : number = 0;
  indexCentroCuentaContable                     : number = 0;
  indexTipoOperacion                            : number = 0;

  modeloLinesSelected                           : IDraftsLineQuery;

  opciones                                      : MenuItem[];
  menuOptions                                   : MenuItem[];
  columnas                                      : TableColumn[];
  modeloLines                                   : IDraftsLineQuery[] = [];
  modeloLinesEliminar                           : IDraftsLineQuery[] = [];
  modeloLinesOriginal                           : IDraftsLineQuery[] = [];


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly draftsService: DraftsService,
    private readonly itemsService: ItemsService,
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
    public  readonly utilService: UtilService,
  ) {}

  ngOnInit() {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.wireCurrencyControl();
    this.wireDiscountControls();
    this.wirePayAddressControl()
    this.wireShipAddressControl();
    this.wireAgencyAddressControl();

    // 4️⃣ Inicializar UI
    this.onBuildColumn();
    this.opcionesTabla();
    this.buildBulkMenuOptions();
    this.addLine(0);
  }

  buildForms() {
    // CABECERA - Datos del cliente y moneda
    this.modeloFormSoc = this.fb.group({
      cardCode            : new FormControl({ value: '', disabled: false }, Validators.required),
      cardName            : new FormControl('', Validators.required),
      cntctCode           : new FormControl(''),
      numAtCard           : new FormControl(''),
      currency            : new FormControl('', Validators.required),
      docRate             : new FormControl(this.utilService.onRedondearDecimalConCero(0,3), Validators.required),
    });
    // CABECERA 2 - Números, estado y fechas
    this.modeloFormDoc = this.fb.group({
      docNum              : new FormControl({ value: '', disabled: false }),
      docStatus           : [{ value: 'Abierto', disabled: false }, Validators.required],
      docDate             : new FormControl(null, Validators.required),
      docDueDate          : new FormControl(null, Validators.required),
      taxDate             : new FormControl(null, Validators.required),
    });
    // FINANZAS
    this.modeloFormCon = this.fb.group({
      docType             : new FormControl('', Validators.required),
    });
    // LOGÍSTICA - Direcciones
    this.modeloFormLog = this.fb.group({
      shipAddress         : new FormControl(''),
      address2            : new FormControl({ value: '', disabled: false }),
      payAddress          : new FormControl(''),
      address             : new FormControl({ value: '', disabled: false }),
    });
    // FINANZAS
    this.modeloFormFin = this.fb.group({
      paymentsTermsTypes  : new FormControl('', Validators.required),
    });
    // AGENCIA
    this.modeloFormAge = this.fb.group({
      u_BPP_MDCT          : new FormControl(''),
      u_BPP_MDRT          : new FormControl(''),
      u_BPP_MDNT          : new FormControl(''),
      agencyAddress       : new FormControl(''),
      u_BPP_MDDT          : new FormControl(''),
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
      salesType           : new FormControl('', Validators.required),
    });
    // PIE - Información adicional y totales
    this.modeloFormSal = this.fb.group({
      salesEmployees      : new FormControl('', Validators.required),
      u_NroOrden          : new FormControl(''),
      u_OrdenCompra       : new FormControl(''),
      comments            : new FormControl(''),
    });
    this.modeloFormTot = this.fb.group({
      subTotal            : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      discPrcnt           : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      discSum             : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      vatSum              : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
      docTotal            : new FormControl(this.utilService.onRedondearDecimalConCero(0,2)),
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

  private buildBulkMenuOptions(): void {
    this.menuOptions = [
      { value: '1',  label: 'Entrega',            icon: 'pi pi-cart-plus', command: () =>  {} },
      { value: '2',  label: 'Fact. deudores',     icon: 'pi pi-cart-plus', command: () =>  {} },
    ];
  }

  // ===========================
  // Helper Methods
  // ===========================

  private updateMenuVisibility(): void {
    const docTypeValue      = this.modeloFormCon.get('docType')?.value?.value;
    const isItemDoc         = docTypeValue === 'I';

    /** Activa/desactiva opciones del split-button según líneas presentes y vacías */
    //const hasEmptyLines     = this.modeloLines.some(x => x.itemCode === '');
    // Para items: vacío = itemCode vacío
    // Para servicios: vacío = dscription vacío (o solo espacios)
    const hasEmptyLines = isItemDoc ? this.modeloLines.some(l => !String(l.itemCode ?? '').trim()) : this.modeloLines.some(l => !String(l.dscription ?? '').trim());
    const hasLines          = this.modeloLines.length > 0;

    const addLineOption     = this.opciones.find(x => x.value === '1');
    const deleteLineOption  = this.opciones.find(x => x.value === '2');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  onSelectedItem(modelo: IDraftsLineQuery) {
    /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
  }

  onClickAddLine(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    const insertIndex = index + 1;
    this.addLine(insertIndex);
    this.detectRealChanges(); // 🔥 OBLIGATORIO
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

  onClickDelete(): void {
    if (this.modeloLinesSelected.record === 2) {
      this.modeloLinesSelected.record = 3;
      this.modeloLinesEliminar.push(this.modeloLinesSelected);
    }

    /** Elimina la línea seleccionada; agrega una vacía si quedan sin líneas */
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

  private loadAllCombos(): void {
    const paramTipoFlete  : any = { tableID: 'ORDR', aliasID: 'TipoFlete' };
    const paramTipoVenta  : any = { tableID: 'ORDR', aliasID: 'STR_TVENTA' };

    // Mostrar spinner mientras cargan los combos
    this.isDisplay = true;

    const docTypes = this.localDataService.getListDocTypes();
    this.docTypesList = docTypes.map(s => ({ label: s.name, value: s.code }));

    const defaultDocType = this.docTypesList.find(x => x.value === 'I');
    if (defaultDocType) {
      this.docTypeSelected   = defaultDocType;
      this.modeloFormCon.get('docType').setValue(defaultDocType, { emitEvent: false });
      this.onBuildColumn();
    }

    forkJoin({
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
          this.paymentsTermsTypesList = (res.groups || []).map(item => ({ label: item.pymntGroup, value: item.groupNum }));
          this.salesEmployeesList     = (res.employees || []).map(item => ({ label: item.slpName, value: item.slpCode }));
          this.freightTypeList        = (res.tipoFlete || []).map(item => ({ label: item.descr, value: item.fldValue }));
          this.salesTypeList          = (res.tipoVenta || []).map(item => ({ label: item.descr, value: item.fldValue }));

          this.loadData();
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadAllCombos', () => this.swaCustomService);
        }
      });
  }

  private loadData(): void {
    this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.id = +params['id'];

        // 🔥 aquí sí se activa de forma confiable
        this.isDisplay = true;

        return this.draftsService
          .getByDocEntry(this.id)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IDraftsQuery) => {
        this.modeloLinesOriginal = structuredClone(data.lines);
        this.setFormValues(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: IDraftsQuery): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el modeloLines durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.isLocked     = value.docStatus !== 'O';
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

    // Actualizar formulario de Documento
    this.modeloFormDoc.patchValue(
      {
        docNum    : value.docNum,
        docStatus : value.docStatus === 'O' ? 'Abierto' : 'Cerrado',
        docDate   : value.docDate ? new Date(value.docDate) : null,
        docDueDate: value.docDueDate ? new Date(value.docDueDate) : null,
        taxDate   : value.taxDate ? new Date(value.taxDate) : null,
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
    this.agencyAddressList = (value.agencyAddressList || []).map(d => ({ label: d.address, value: d.address }));
    const agencyAddressItem = this.agencyAddressList.find(item => item.value === value.u_FIB_CODT);

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

    // ==========================================================
    // ✅ AQUÍ: CARGAR TAX GROUP DESPUÉS DE modeloFormSal.patchValue
    // ==========================================================
    const shipToCodeTax = (value.shipToCode ?? '').toString().trim();

    // Cancelar suscripción previa
    if (this.taxGroupSubscription) {
      this.taxGroupSubscription.unsubscribe();
      this.taxGroupSubscription = null;
    }

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

    // Totales
    this.modeloFormTot.patchValue(
      {
        subTotal : this.utilService.onRedondearDecimalConCero(value.subTotal, 2),
        discPrcnt: this.utilService.onRedondearDecimalConCero(value.discPrcnt, 2),
        discSum  : this.utilService.onRedondearDecimalConCero(value.discSum, 2),
        vatSum   : this.utilService.onRedondearDecimalConCero(value.vatSum, 2),
        docTotal : this.utilService.onRedondearDecimalConCero(value.docTotal, 2),
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar modeloLines después de que los formularios estén actualizados
    // =========================================================================
    this.onBuildColumn();
    this.modeloLines = value.lines || [];
    this.updateHasValidLines();
    this.isLoadingInitialData = false;

    // =========================
    // SNAPSHOT ORIGINAL (CLAVE)
    // =========================
    this.initialSnapshot = {
      soc  : this.modeloFormSoc.getRawValue(),
      doc  : this.modeloFormDoc.getRawValue(),
      log  : this.modeloFormLog.getRawValue(),
      fin  : this.modeloFormFin.getRawValue(),
      age  : this.modeloFormAge.getRawValue(),
      exp  : this.modeloFormExp.getRawValue(),
      otr  : this.modeloFormOtr.getRawValue(),
      sal  : this.modeloFormSal.getRawValue(),
      tot  : this.modeloFormTot.getRawValue(),
      lines: structuredClone(this.modeloLines)
    };

    // Marcar pristine
    this.modeloFormSoc.markAsPristine();
    this.modeloFormDoc.markAsPristine();
    this.modeloFormLog.markAsPristine();
    this.modeloFormFin.markAsPristine();
    this.modeloFormAge.markAsPristine();
    this.modeloFormExp.markAsPristine();
    this.modeloFormOtr.markAsPristine();
    this.modeloFormSal.markAsPristine();
    this.modeloFormTot.markAsPristine();

    // Escuchar cambios
    this.watchChanges();

    // Estado inicial botón
    this.detectRealChanges();
  }

  // =========================
  // WATCH CHANGES (AGREGADO)
  // =========================
  private watchChanges(): void {
    merge(
      this.modeloFormSoc.valueChanges,
      this.modeloFormDoc.valueChanges,
      this.modeloFormLog.valueChanges,
      this.modeloFormFin.valueChanges,
      this.modeloFormAge.valueChanges,
      this.modeloFormExp.valueChanges,
      this.modeloFormOtr.valueChanges,
      this.modeloFormSal.valueChanges,
      this.modeloFormTot.valueChanges
    )
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.detectRealChanges());
  }

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
    this.modeloFormOtr.valid &&
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

    const otrChanged = this.utilService.hasFormChanged(
      this.modeloFormOtr,
      this.initialSnapshot.otr
    );

    const salChanged = this.utilService.hasFormChanged(
      this.modeloFormSal,
      this.initialSnapshot.sal
    );

    const totChanged = this.utilService.hasFormChanged(
      this.modeloFormTot,
      this.initialSnapshot.tot
    );

    const formChanged = socChanged || docChanged || logChanged || finChanged || ageChanged || expChanged || otrChanged || salChanged || totChanged;

     // =========================
    // 2️⃣ LÍNEAS NUEVAS (record = 1)
    // =========================
    const hasNewLines =
    this.modeloLines.some(l => l.record === 1);

     // =========================
    // 3️⃣ LÍNEAS ELIMINADAS BD
    // =========================
    const hasDeletedLines =
    this.modeloLinesEliminar.length > 0;

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
    // ✅ REGLA FINAL
    // =========================
    this.hasRealChanges =
      formChanged ||
      hasNewLines ||
      hasDeletedLines ||
      hasUpdatedLines;
  }

  //#region <<< MODAL: CLIENTE >>>

  get isMainCurrency(): boolean {
    return !this.currency || this.currency === '##' || this.currency === this.mainCurncy;
  }

  get currencyColClass(): string {
    return this.isMainCurrency ? 'col-12 md:col-12' : 'col-12 md:col-6';
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


  //#region <<< CONTENIDO >>>

  private addLine(index: number): void {
    this.modeloLines.splice(index, 0, {
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
      u_FIB_OpQtyPkg    : 0,
      u_tipoOpT12       : '',
      u_tipoOpT12Nam    : '',

      record            : 1,
    });
    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

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
      u_tipoOpT12Nam : data.u_tipoOpT12Nam,
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

        this.setItem(data[0], index);
        this.calculateTotals();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListByCode', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(itemCode: string): any {
    const formValue = this.modeloFormSal.getRawValue();

    const salesEmployeeValue =
      formValue.salesEmployees?.value ?? formValue.salesEmployees ?? '';

    return {
      itemCode,
      cardCode            : this.modeloFormSoc.get('cardCode')?.value ?? '',
      currency            : this.currency,
      slpCode             : salesEmployeeValue,
      operationTypeCode   : '01'
    };
  }

  onDescChange(line: IDraftsLineQuery) {
    if (!this.valTipoCambio()) {

      // ✅ Si es nueva línea, limpiar
      if (line.record === 1) {
        line.dscription = '';
        return;
      }

      // ✅ Si es línea existente (record=2), restaurar texto original
      if (line.record === 2) {
        const original = (this.initialSnapshot?.lines || [])
          .find((x: any) => x.lineNum === line.lineNum); // <-- usa tu key real

        if (original) {
          line.dscription = original.dscription ?? '';
        }

        return;
      }

      return;
    }

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
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

    this.detectRealChanges(); // 🔥 OBLIGATORIO
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
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onClickCloseAlmacen()
  {
    this.isVisualizarAlmacen = !this.isVisualizarAlmacen;
  }

  onChangeQuantity(value: IDraftsLineQuery, index: number)
  {
    this.calculateTotalLine(value, index);

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onChangePrice(value: IDraftsLineQuery, index: number)
  {
    this.calculateTotalLine(value, index);

    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  onChangeDiscPrcnt(value: IDraftsLineQuery, index: number)
  {
    this.calculateTotalLine(value, index);

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

  calculateTotalLine(value: IDraftsLineQuery, index: number): void {
    let quantity       : number;
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

    u_FIB_OpQtyPkg = quantity;

    // Cuando existe el registro en BD (record = 2), se debe considerar la cantidad picada
    if(value.record === 2)
    {
      const modelomodeloLinesOriginal = this.modeloLinesOriginal.find(d => d.lineNum === value.lineNum && d.docEntry === value.docEntry);

      if (!modelomodeloLinesOriginal) return;

      const u_FIB_IsPkg = this.utilService.onRedondearDecimal(modelomodeloLinesOriginal.quantity - modelomodeloLinesOriginal.u_FIB_OpQtyPkg,3);

      u_FIB_OpQtyPkg = (quantity - u_FIB_IsPkg) > 0 ? (quantity - u_FIB_IsPkg) : 0;
    }

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
    currentLine.u_FIB_OpQtyPkg  = u_FIB_OpQtyPkg;
    currentLine.priceBefDi      = priceBefDi;
    currentLine.discPrcnt       = discPrcnt;
    currentLine.price           = price;
    currentLine.lineTotal       = lineTotal;
    currentLine.vatSum          = vatSum;

    this.calculateTotals();
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
    this.calculateTotalLine(this.modeloLines[this.indexImpuesto], this.indexImpuesto);
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
    this.detectRealChanges(); // 🔥 OBLIGATORIO
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
    this.detectRealChanges(); // 🔥 OBLIGATORIO
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
    .pipe(
      takeUntil(this.destroy$),
      filter(selected => !!selected),
      switchMap(selected => {

        const address = selected.value;

        return this.loadAddress(this.cardCode, address, 'B');
      })
    )
    .subscribe({
      next: (fullAddress: string | null) => {
        if (fullAddress !== null && fullAddress !== undefined) {
          this.modeloFormLog.patchValue({ address: this.utilService.normalizePrimitive(fullAddress) }, { emitEvent: false });

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

      this.calculateTotalLine(line, i);
    }

    this.calculateTotals();
  }

  //#endregion


  //#region <<< AGENCIA >>>

  onClickCleanAgencia()
  {
    this.u_BPP_MDCT   = '';
    this.modeloFormAge.reset({
      'u_BPP_MDCT'      : '',
      'u_BPP_MDRT'      : '',
      'u_BPP_MDNT'      : '',
      'agencyAddress'   : '',
      'u_BPP_MDDT'      : ''
    });
  }

  onSelectedAgencia(value) {
    this.onClickCleanAgencia();

    if (this.agenciaLoadSubscription) {
      this.agenciaLoadSubscription.unsubscribe();
      this.agenciaLoadSubscription = null;
    }

    this.agenciaLoadSubscription = this.loadAgenciaByCode(value.cardCode)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.detectRealChanges();
    });
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

        const address = selected.value;

        return this.loadAddress(this.u_BPP_MDCT, address, 'S');
      })
    )
    .subscribe({
      next: (fullAddress: string | null) => {
        if (fullAddress !== null && fullAddress !== undefined) {
          this.modeloFormAge.patchValue({ u_BPP_MDDT: this.utilService.normalizePrimitive(fullAddress) }, { emitEvent: false });

          this.detectRealChanges();
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'wireAgencyAddressControl', this.swaCustomService);
      }
    });
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

    // 3) IGV por línea (tu lógica SAP igual)
    let sumLineVat   = 0;
    let rawVatDocTot = 0;
    const taxableIdx: number[] = [];

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
      ...this.modeloFormExp.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormSal.getRawValue(),
      ...this.modeloFormTot.getRawValue(),
    };
  }

  private mapLines(isItemDoc:boolean): Drafts1UpdateModel[] {
    /** helpers para evitar repetición */
    const u          = this.utilService;
    const p          = (v:any)=>u.normalizePrimitive(v);
    const n          = (v:any)=>u.normalizeNumber(v);
    const val        = (v:any)=>v?.value ?? v;

    const f          = this.modeloFormSoc.getRawValue();

    const allLines = [...this.modeloLines, ...this.modeloLinesEliminar];

    return allLines
    .filter(line => isItemDoc ? p(line.itemCode) !== '' : p(line.dscription) !== '')
    .map<Drafts1UpdateModel>(line => ({
      lineStatus     : p(line.lineStatus),
      lineNum        : n(line.lineNum),

      itemCode       : p(line.itemCode),
      dscription     : p(line.dscription),

      acctCode       : p(line.acctCode),
      whsCode        : p(line.whsCode),

      unitMsr        : p(line.unitMsr),
      quantity       : n(line.quantity),

      currency       : p(line.currency) || p(val(f.currency)),
      priceBefDi     : n(line.priceBefDi),
      discPrcnt      : n(line.discPrcnt),
      price          : n(line.price),

      taxCode        : p(line.taxCode),
      lineTotal      : n(line.lineTotal),

      u_FIB_LinStPkg : p(line.u_FIB_LinStPkg),
      u_FIB_OpQtyPkg : n(line.u_FIB_OpQtyPkg),
      u_tipoOpT12    : p(line.u_tipoOpT12),

      record         : n(line.record)
    }));
  }

  private buildModelToSave(): DraftsUpdateModel {
    /** helpers para evitar repetición */
    const u         = this.utilService;
    const p         = (v:any)=>u.normalizePrimitive(v);
    const n         = (v:any)=>u.normalizeNumber(v);
    const d         = (v:any)=>u.normalizeDateOrToday(v);
    const val       = (v:any)=>v?.value ?? v;
    const label     = (v:any)=>v?.label ?? v ?? '';

    /** combinar todos los formularios */
    const f         = this.mergeForms();

    const userId    = this.userContextService.getIdUsuario();

    const currency    = p(val(f.currency));
    const docType   = p(val(f.docType));

    const docRate   = currency === this.mainCurncy ? 1 : n(f.docRate);

    const lines     = this.mapLines(docType === 'I');

    return {
      ...new DraftsUpdateModel(),

      docEntry      : this.docEntry,
      docDate       : d(f.docDate),
      docDueDate    : d(f.docDueDate),
      taxDate       : d(f.taxDate),
      docType       : docType,

      cardCode      : p(f.cardCode),
      cardName      : p(f.cardName),
      cntctCode     : n(f.cntctCode),
      numAtCard     : p(f.numAtCard),
      docCur        : currency,
      docRate       : docRate,

      payToCode     : p(label(f.payAddress)),
      address       : p(f.address),
      shipToCode    : p(label(f.shipAddress)),
      address2      : p(f.address2),

      groupNum      : n(val(f.paymentsTermsTypes)),

      u_BPP_MDCT    : p(this.u_BPP_MDCT),
      u_BPP_MDRT    : p(f.u_BPP_MDRT),
      u_BPP_MDNT    : p(f.u_BPP_MDNT),
      u_FIB_CODT    : p(label(f.agencyAddress)),
      u_BPP_MDDT    : p(f.u_BPP_MDDT),

      u_TipoFlete   : p(val(f.freightType)),
      u_ValorFlete  : n(f.u_ValorFlete),
      u_FIB_TFLETE  : n(f.u_FIB_TFLETE),
      u_FIB_IMPSEG  : n(f.u_FIB_IMPSEG),
      u_FIB_PUERTO  : p(f.u_FIB_PUERTO),

      u_STR_TVENTA  : p(val(f.salesType)),

      slpCode       : n(val(f.salesEmployees) ?? -1),
      u_NroOrden    : p(f.u_NroOrden),
      u_OrdenCompra : p(f.u_OrdenCompra),
      comments      : p(f.comments),

      discPrcnt     : n(f.discPrcnt),
      discSum       : n(f.discSum),
      vatSum        : n(f.vatSum),
      docTotal      : n(f.docTotal),

      u_UsrUpdate   : userId,

      lines
    };
  }

  onToSave() {
    if(!this.validatedSave()) return;

    this.isSaving = true;

    const modeloToSave = this.buildModelToSave();

    this.draftsService.setUpdate(modeloToSave)
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


  onClickBack() {
    this.router.navigate(['/main/modulo-bor/panel-documento-borrador-list']);
  }
}
