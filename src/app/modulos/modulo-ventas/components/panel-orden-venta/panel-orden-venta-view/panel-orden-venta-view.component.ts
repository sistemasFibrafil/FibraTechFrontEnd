import { SelectItem } from 'primeng/api';
import { Subject, forkJoin, of, takeUntil } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { catchError, switchMap, finalize, tap } from 'rxjs/operators';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { TableColumn } from 'src/app/interface/common-ui.interface';
import { IOrdenVenta1Query, IOrdersQuery } from '../../../interfaces/sap-business-one/orders.interface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IUserDefinedFields } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IPaymentTermsTypes } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/condicion-pago-sap.interface';

import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { OrdersService } from '../../../services/sap-business-one/orders.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { PaymentTermsTypesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/paymentTerms-types.service';



@Component({
  selector: 'app-ven-panel-orden-venta-view',
  templateUrl: './panel-orden-venta-view.component.html',
  styleUrls: ['./panel-orden-venta-view.component.css']
})
export class PanelOrdenVentaViewComponent implements OnInit, OnDestroy {

  isLoadingInitialData                          : boolean = false;
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

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
  docEntry                                      : number = 0;
  cntctCode                                     : number = 0;

  cardCode                                      : string = '';
  currency                                      : string = '';
  mainCurncy                                    : string = '';
  u_BPP_MDCT                                    : string = '';

  docTypeSelected                               : any;

  currencyList                                  : SelectItem[] = [];
  docTypesList                                  : SelectItem[] = [];
  salesTypeList                                 : SelectItem[] = [];
  payAddressList                                : SelectItem[] = [];
  shipAddressList                               : SelectItem[] = [];
  freightTypeList                               : SelectItem[] = [];
  agencyAddressList                             : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];
  paymentsTermsTypesList                        : SelectItem[] = [];

  // Progreso
  isDisplay                                     : boolean = false;

  // modeloLines
  columnas                                      : TableColumn[];
  modeloLines                                   : IOrdenVenta1Query[] = [];


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly ordersService: OrdersService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
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
    // Construir formularios y configuración básica
    this.buildForms();
    this.onBuildColumn();
    this.loadAllCombos();
  }

  buildForms() {
    // CABECERA - Datos del cliente y moneda
    this.modeloFormSoc = this.fb.group({
      cardCode            : new FormControl({ value: '', disabled: false }, Validators.required),
      cardName            : new FormControl({ value: '', disabled: false }, Validators.required),
      cntctCode           : new FormControl({ value: '', disabled: false }),
      numAtCard           : new FormControl({ value: '', disabled: false }),
      docCur              : new FormControl({ value: '', disabled: false }, Validators.required),
      docRate             : new FormControl({ value: this.utilService.onRedondearDecimalConCero(0,3), disabled: false }, Validators.required),
    });
    // CABECERA 2 - Números, estado y fechas
    this.modeloFormDoc = this.fb.group({
      docNum              : new FormControl({ value: '', disabled: false }),
      docStatus           : new FormControl({ value: 'Abierto', disabled: false }, Validators.required),
      docDate             : new FormControl({ value: null, disabled: false }, Validators.required),
      docDueDate          : new FormControl({ value: null, disabled: false }, Validators.required),
      taxDate             : new FormControl({ value: null, disabled: false }, Validators.required),
    });
    // FINANZAS
    this.modeloFormCon = this.fb.group({
      docType             : new FormControl({ value: '', disabled: false }, Validators.required),
    });
    // LOGÍSTICA - Direcciones
    this.modeloFormLog = this.fb.group({
      shipAddress         : new FormControl({ value: '', disabled: false }),
      address2            : new FormControl({ value: '', disabled: false }),
      payAddress          : new FormControl({ value: '', disabled: false }),
      address             : new FormControl({ value: '', disabled: false }),
    });
    // FINANZAS
    this.modeloFormFin = this.fb.group({
      paymentsTermsTypes  : new FormControl({ value: '', disabled: false }, Validators.required),
    });
    // AGENCIA
    this.modeloFormAge = this.fb.group({
      u_BPP_MDCT          : new FormControl({ value: '', disabled: false }),
      u_BPP_MDRT          : new FormControl({ value: '', disabled: false }),
      u_BPP_MDNT          : new FormControl({ value: '', disabled: false }),
      agencyAddress       : new FormControl({ value: '', disabled: false }),
      u_BPP_MDDT          : new FormControl({ value: '', disabled: false }),
    });
    // EXPORTACIÓN
    this.modeloFormExp = this.fb.group({
      freightType         : new FormControl({ value: '', disabled: false }),
      u_ValorFlete        : new FormControl({ value: this.utilService.onRedondearDecimalConCero(0,0), disabled: false }),
      u_FIB_TFLETE        : new FormControl({ value: this.utilService.onRedondearDecimalConCero(0,2), disabled: false }),
      u_FIB_IMPSEG        : new FormControl({ value: this.utilService.onRedondearDecimalConCero(0,2), disabled: false }),
      u_FIB_PUERTO        : new FormControl({ value: '', disabled: false }),
    });
    // OTROS
    this.modeloFormOtr = this.fb.group({
      salesType           : new FormControl({ value: '', disabled: false }, Validators.required),
    });
    // PIE - Información adicional y totales
    this.modeloFormSal = this.fb.group({
      salesEmployees      : new FormControl({ value: '', disabled: false }, Validators.required),
      u_NroOrden          : new FormControl({ value: '', disabled: false }),
      u_OrdenCompra       : new FormControl({ value: '', disabled: false }),
      comments            : new FormControl({ value: '', disabled: false }),
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

  private loadAllCombos(): void {
    const paramTipoFlete  : any = { tableID: 'ORDR', aliasID: 'TipoFlete' };
    const paramTipoVenta  : any = { tableID: 'ORDR', aliasID: 'STR_TVENTA' };

    // Mostrar spinner mientras cargan los combos
    this.isDisplay = true;

    const docTypes = this.localDataService.docTypes;
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
          this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
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

        return this.ordersService
          .getByDocEntry(this.id)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
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
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el modeloLines durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    const statusMap =
    {
      A: '[Autorizado]',
      P: '[Autorizado]',
      Y: '[Autorizado]',
      W: '[Pendiente]'
    };

    const statusName = statusMap[value.wddStatus] || '';

    // Asignar propiedades del componente
    if (value.wddStatus !== '-') {
      this.titulo += ` ${statusName}`;
    }
    this.docEntry   = value.docEntry;
    this.cardCode   = value.cardCode;
    this.cntctCode  = value.cntctCode;
    this.currency   = value.docCur || '';
    this.u_BPP_MDCT = value.u_BPP_MDCT || '';

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
        docCur   : currencyItem || null,
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
    this.isLoadingInitialData = false;
  }

  //#region <<< MODAL: CLIENTE >>>

  get isMainCurrency(): boolean {
    return !this.currency || this.currency === '##' || this.currency === this.mainCurncy;
  }

  get currencyColClass(): string {
    return this.isMainCurrency ? 'col-12 md:col-12' : 'col-12 md:col-6';
  }

  //#endregion


  //#region <<< CONTENIDO >>>
  //#endregion


  //#region <<< LOGÍSTICA >>>
  //#endregion


  //#region <<< AGENCIA >>>
  //#endregion


  //#region << EXPORTACIÓN >>>
  //#endregion


  //#region <<< TOTALES >>>
  //#endregion


  //#region <<< SAVE >>>
  //#endregion


  onClickBack() {
    this.router.navigate(['/main/modulo-ven/panel-orden-venta-list']);
  }
}
