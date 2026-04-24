import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { HttpEvent, HttpEventType } from '@angular/common/http';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { catchError, switchMap, map, finalize, tap, filter, take } from 'rxjs/operators';
import { Subject, forkJoin, of, takeUntil, Subscription, Observable, from, EMPTY, merge } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { ItemsFindByListCodeModel } from '@app/modulos/modulo-inventario/models/items.model';
import { Orders1CreateModel } from '@app/modulos/modulo-ventas/models/sap-business-one/orders.model';
import { Attachments2CreateModel, Attachments2LinesCreateModel } from '@app/modulos/modulo-ventas/models/sap-business-one/attachments2.model';

import { MenuItem, TableColumn } from '@app/interface/common-ui.interface';
import { IArticulo } from '@app/modulos/modulo-inventario/interfaces/items.interface';
import { IAddresses } from '@app/modulos/modulo-socios-negocios/interfaces/addresses.interface';
import { IExchangeRates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';
import { IBusinessPartnersQuery } from '@app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';
import { IAttachments2LinesQuery } from '@app/modulos/modulo-ventas/interfaces/sap-business-one/attachments2.interface';
import { IOrdenVenta1Query, IOrdersQuery } from '@app/modulos/modulo-ventas/interfaces/sap-business-one/orders.interface';
import { ITaxGroups } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/finanzas/impuesto-sap.iterface';
import { IWarehouses } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { ISalesPersons } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IUserDefinedFields } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IPaymentTermsTypes } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/condicion-pago-sap.interface';

import { UtilService } from '@app/services/util.service';
import { LocalDataService } from '@app/services/local-data.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { ItemsService } from '@app/modulos/modulo-inventario/services/items.service';
import { DraftsService } from '@app/modulos/modulo-documentos-borrador/services/drafts.service';
import { AddressesService } from '@app/modulos/modulo-socios-negocios/services/addresses.service';
import { OrdersService } from '@app/modulos/modulo-ventas/services/sap-business-one/orders.service';
import { BusinessPartnersService } from '@app/modulos/modulo-socios-negocios/services/business-partners.service';
import { ExchangeRatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';
import { TaxGroupsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/finanzas/impuesto-sap.service';
import { SalesPersonsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { CamposDefinidoUsuarioService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { PaymentTermsTypesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/paymentTerms-types.service';
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
  isLoadingInitialData                          : boolean = false;
  private readonly destroy$                     = new Subject<void>();
  private taxGroupSubscription                  : Subscription | null = null;
  private socioLoadSubscription                 : Subscription | null = null;
  private agenciaLoadSubscription               : Subscription | null = null;


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  titulo                                        = 'Orden de Venta';
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
  modeloFormOtr                                 : FormGroup;
  modeloFormAne                                 : FormGroup;
  modeloFormSal                                 : FormGroup;
  modeloFormTot                                 : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isLocked                                      : boolean = false;
  isSaving                                      : boolean = false;
  isEarring                                     : boolean = false;
  isDisplay                                     : boolean = false;
  isauthorized                                  : boolean = false;
  hasValidLines                                 : boolean = false;
  isDisplayUpload                               : boolean = false;
  isVisualizarAlmacen                           : boolean = false;
  isVisualizarImpuesto                          : boolean = false;
  isVisualizarArticulo                          : boolean = false;
  isVisualizarTipoOperacion                     : boolean = false;
  isVisualizarCuentaContable                    : boolean = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  items                                         : MenuItem[];
  opciones                                      : MenuItem[];
  menuOptions                                   : MenuItem[];
  opcionesAttachments                           : MenuItem[];

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

  uploadedFiles                                 : any[] = [];


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
  uploadProgress                                : number = 0;
  indexFileUpload                               : number = 0;
  indexTipoOperacion                            : number = 0;
  indexCentroCuentaContable                     : number = 0;


  // ===========================
  // 🔹 10. AUX / FILTERS
  // ===========================
  taxCode                                       : string = '';
  cardCode                                      : string = '';
  currency                                      : string = '';
  itemCode                                      : string = '';
  wddStatus                                     : string = '';
  mainCurncy                                    : string = '';
  u_BPP_MDCT                                    : string = '';
  inactiveAlmacenItem                           : string = 'N';


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
    this.onBuildColumnAttachments();
    this.buildBulkMenuOptions();
    this.opcionesTabla();
    this.opcionesTablaAttachments();
    this.buildContextMenu();

    // 5️⃣ Inicializar líneas
    this.addLine(0);
    this.addLineAttachments(0);
  }

  private buildForms() {
    const r = (value: number, dec: number) => this.utilService.onRedondearDecimalConCero(value, dec);

    const fc = (value: any = '', required = false, disabled = false) =>
    new FormControl(
      { value, disabled },
      required ? Validators.required : []
    );

    // CABECERA
    this.modeloFormSoc = this.fb.group({
      cardCode            : fc('', true),
      cardName            : fc('', true),
      cntctCode           : fc(),
      numAtCard           : fc(),
      currency            : fc('', true),
      docRate             : fc(r(0, 3), true),
    });

    // CABECERA 2
    this.modeloFormDoc = this.fb.group({
      docNum              : fc(),
      docStatus           : fc('Abierto', true),
      docDate             : fc(new Date(), true),
      docDueDate          : fc(null, true),
      taxDate             : fc(new Date(), true),
    });

    // FINANZAS
    this.modeloFormCon = this.fb.group({
      docType             : fc('', true),
    });

    // LOGÍSTICA
    this.modeloFormLog = this.fb.group({
      shipAddress         : fc(),
      address2            : fc(),
      payAddress          : fc(),
      address             : fc(),
    });

    // FINANZAS 2
    this.modeloFormFin = this.fb.group({
      paymentsTermsTypes  : fc('', true),
    });

    // AGENCIA
    this.modeloFormAge = this.fb.group({
      u_BPP_MDCT          : fc(),
      u_BPP_MDRT          : fc(),
      u_BPP_MDNT          : fc(),
      agencyAddress       : fc(),
      u_BPP_MDDT          : fc(),
    });

    // EXPORTACIÓN
    this.modeloFormExp = this.fb.group({
      freightType         : fc(),
      u_ValorFlete        : fc(r(0, 0)),
      u_FIB_TFLETE        : fc(r(0, 2)),
      u_FIB_IMPSEG        : fc(r(0, 2)),
      u_FIB_PUERTO        : fc(),
    });

    // OTROS
    this.modeloFormOtr = this.fb.group({
      salesType           : fc('', true),
    });

    // PIE
    this.modeloFormSal = this.fb.group({
      salesEmployees      : fc('', true),
      u_NroOrden          : fc(),
      u_OrdenCompra       : fc(),
      comments            : fc(),
    });

    this.modeloFormTot = this.fb.group({
      subTotal            : fc(r(0, 2)),
      discPrcnt           : fc(r(0, 2)),
      discSum             : fc(r(0, 2)),
      vatSum              : fc(r(0, 2)),
      docTotal            : fc(r(0, 2)),
    });

    // Moneda principal
    this.mainCurncy = this.userContextService.getMainCurncy();
  }

  private loadAllCombos(): void {
    const paramNumero     : any = { objectCode: '17', docSubType: '--' };
    const paramTipoFlete  : any = { tableID: 'ORDR', aliasID: 'TipoFlete' };
    const paramTipoVenta  : any = { tableID: 'ORDR', aliasID: 'STR_TVENTA' };

    // Mostrar spinner mientras cargan los combos
    this.isDisplay = true;

    const docTypes: any = this.localDataService.docTypes;
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

  private onBuildColumn() {
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

  private onBuildColumnAttachments() {
    this.columnasAttachments = [
      { field: 'trgtPath',        header: 'Vía de acceso destino' },
      { field: 'fileName',        header: 'Nombre de archivo' },
      { field: 'date',            header: 'Fecha del anexo' },
    ];
  }

  private opcionesTabla() {
    this.opciones = [
      { value: '1', label: 'Insertar arriba',     icon: 'pi pi-plus',                   command: () => this.onClickAddLineAbove() },
      { value: '2', label: 'Insertar abajo',      icon: 'pi pi-plus',                   command: () => this.onClickAddLineBelow() },
      { value: '3', label: 'Borrar línea',        icon: 'pi pi-trash',                  command: () => this.onClickDelete()  }
    ];
  }

  private buildBulkMenuOptions(): void {
    this.menuOptions = [
      { value: '1',  label: 'Orden de venta',     icon: 'pi pi-check',                     command: () =>  { this.onClickSaveOrder() } },
      { value: '2',  label: 'Preliminar',         icon: 'pi pi-check',                     command: () =>  { this.onClickSaveDraft() } }
    ];
  }

  private opcionesTablaAttachments() {
    this.opcionesAttachments = [
      { value: '1', label: 'Insertar línea',      icon: 'pi pi-plus',                   command: () => this.onClickAddLineAttachments() },
      { value: '2', label: 'Borrar línea',        icon: 'pi pi-trash',                  command: () => this.onClickDeleteAttachments()  },
    ];
  }

  private buildContextMenu(): void {
    this.items = [
      { value: '1', label: 'Ganancia bruta',                      icon: 'pi pi-building',               command: () => {} },
      { value: '2', label: 'Cáculos de comisión y peso',          icon: 'pi pi-chart-bar',              command: () => {} },
      { value: '3', label: 'Comentarios iniciales y final',       icon: 'pi pi-check',                  command: () => {} },
      { value: '4', label: 'Grabar como preliminar',              icon: 'pi pi-eye',                    command: () => { this.onClickSaveDraft() } },
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

  onContextMenuShow(): void {
    this.updateMenuContextVisibility();

  }

  /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
  onSelectedItem(modelo: IOrdenVenta1Query) {
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
  }

  onClickAddLineAbove(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    //const insertIndex = index + 1;
    this.addLineAbove(index);
  }

  onClickAddLineBelow(): void {
    /** Agrega una nueva línea vacía después de la fila seleccionada */
    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    //const insertIndex = index + 1;
    this.addLineBelow(index);
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

  private updateMenuVisibility(): void {
    const hasEmptyLines = this.hasEmptyLine();
    const hasLines      = this.modeloLines.length > 0;

    const addLineOption1    = this.opciones.find(x => x.value === '1');
    const addLineOption2    = this.opciones.find(x => x.value === '2');
    const deleteLineOption  = this.opciones.find(x => x.value === '3');

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

      /** Elimina la línea seleccionada; agrega una vacía si quedan sin líneas */
      const index = this.modeloLinesAttachments.indexOf(this.modeloLinesAttachmentsSelected);
      if (index > -1) {
        this.modeloLinesAttachments.splice(index, 1);
      }

      if (this.modeloLinesAttachments.length === 0) {
        this.addLineAttachments(0);
      }

      //this.updateHasValidLinesAttachments();
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

      const addLineOption1    = this.opcionesAttachments.find(x => x.value === '1');
      const deleteLineOption  = this.opcionesAttachments.find(x => x.value === '2');

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
      docEntry: 0,
      lineNum: 0,
      lineStatus: 'O',
      itemCode: '',
      dscription: '',
      acctCode: '',
      formatCode: '',
      acctName: '',
      whsCode: '',
      unitMsr: '',
      onHand: 0,
      quantity: 0,
      openQty: 0,
      currency: '',
      priceBefDi: 0,
      discPrcnt: 0,
      price: 0,
      taxCode: '',
      vatPrcnt: 0,
      vatSum: 0,
      lineTotal: 0,
      u_FIB_LinStPkg: 'O',
      u_FIB_OpQtyPkg: 0,
      u_tipoOpT12: '',
      u_tipoOpT12Nam: '',
      record: 1,
    };
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
  }

  private updateMenuContextVisibility(): void {
    const canSaveDraft =
      this.modeloFormSoc.valid &&
      this.modeloFormDoc.valid &&
      this.modeloFormFin.valid &&
      this.modeloFormOtr.valid &&
      this.modeloFormSal.valid &&
      this.hasValidLines;

    const item = this.items.find(x => x.value === '4');

    if (item) {
      item.visible = canSaveDraft;
    }
  }

  //#endregion



  //#region <<< 6. DOC TYPE >>>

  private wireDocTypeControl(): void {
    this.modeloFormCon.get('docType')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(docTyp => {

      const hasLines = this.modeloLines.some(n => n.dscription?.trim());

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



  //#region <<< 7. BUSINESS PARTNER >>>

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
      monedas  : socio.linesCurrency ?? [],
      shipAddr : socio.linesShipAddress ?? [],
      payAddr  : socio.linesPayAddress ?? []
    };
  }

  private setDefaultValues({ monedas, shipAddr, payAddr, socio }): void {
  this.currencyList    = monedas.map(m => ({ label: m.currName, value: m.currCode }));
  this.shipAddressList = shipAddr.map(d => ({ label: d.address, value: d }));
  this.payAddressList  = payAddr.map(d => ({ label: d.address, value: d }));

  this.setDefaultCurrency();
  this.setDefaultAddresses(socio);
  this.setDefaultPayment(socio);
  this.setDefaultSalesEmployee(socio);
}

  private setDefaultCurrency(): void {
    if (!this.currencyList.length) return;

    let preferred =
      this.currencyList.length === 1
        ? this.currencyList[0]
        : this.currencyList.find(c =>
            String(c.value).toUpperCase() === String(this.mainCurncy).trim().toUpperCase()
          );

    if (preferred) {
      this.currency = preferred.value;
      this.modeloFormSoc.get('currency')?.setValue(preferred, { emitEvent: false });
    }
  }

  private setDefaultAddresses(socio: IBusinessPartnersQuery): void {
    const ship = this.shipAddressList.find(it => it.value.address === socio.shipToDef);
    const pay  = this.payAddressList.find(it => it.value.address === socio.billToDef);

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

    const employee = this.salesEmployeesList.find(it => it.value === slpCode);

    if (employee) {
      this.modeloFormSal.patchValue({ salesEmployees: employee }, { emitEvent: false });
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



  //#region <<< 8. CURRENCY / TIPO CAMBIO >>>

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



  //#region <<< 9. ADDRESS / LOGÍSTICA >>>

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

  //#endregion



  //#region <<< 10. TAX / IMPUESTOS >>>

  private loadTaxGroup(cardCode: string, address: string): Observable<ITaxGroups | null> {
    const formConValues = this.modeloFormSal.getRawValue();
    const slpCode = formConValues.salesEmployees?.value || formConValues.salesEmployees || -1;

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



  //#region <<< 11. AGENCY >>>

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



  //#region <<< 12. ARTÍCULO >>>

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

  private mapToOrderLine(element: any): IOrdenVenta1Query {
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
      warehouseProduction : 'Y',
      warehouseLogistics  : '',
    };
  }

  onDescChange(value: IOrdenVenta1Query) {
    if (!this.valTipoCambio())
      {
        value.dscription = '';
        return;
      };
    this.updateHasValidLines();
  }

  //#endregion



  //#region <<< 13. CUENTA CONTABLE >>>

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



  //#region <<< 14. ALMACÉN >>>

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



  //#region <<< 15. IMPUESTO >>>

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



  //#region <<< 16. TIPO OPERACIÓN >>>

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

  onChangeQuantity(value: IOrdenVenta1Query, index: number)
  {
    this.calculateTotalLine(value, index);
    this.calculateTotals();
  }

  onChangePrice(value: IOrdenVenta1Query, index: number)
  {
    this.calculateTotalLine(value, index);
    this.calculateTotals();
  }

  onChangeDiscPrcnt(value: IOrdenVenta1Query, index: number)
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



  //#region  <<< 16. IMPORT FILES >>>

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
    this.indexFileUpload = index;
    this.isDisplayUpload = true;
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
    const state = history.state;

    console.log("State:", state);

    const id = state?.docEntry;
    const mode = state?.mode;

    if (!id || mode !== 'draft') return;

    this.isDisplay = true;

    this.draftsService.getByDocEntry(id)
    .pipe(finalize(() => this.isDisplay = false))
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

    const helpers = this.getHelpers();

    this.setHeaderState(value, helpers);
    this.setSocioForm(value, helpers);
    this.setDocumentoForm(value, helpers);
    this.setCondiciones(value, helpers);
    this.setDirecciones(value, helpers);
    this.setAgencia(value, helpers);
    this.setExportacion(value, helpers);
    this.setOtros(value, helpers);
    this.setVendedor(value, helpers);
    this.setTaxGroup(value);
    this.setTotales(value, helpers);
    this.setLines(value);

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

  const r = (v: number, d: number) => onRedondearDecimalConCero(v ?? 0, d);

  return { n, toDate, findItem, patch, r };
}

private setHeaderState(value: IOrdersQuery, h: any) {
  const statusMap = {
    Y   : '[Autorizado]',
    N   : '[Rechazado]',
    W   : '[Pendiente]',
    '-' : '[Borrador]',
  };

  this.wddStatus = h.n(value.wddStatus);

  const statusName = statusMap[this.wddStatus] || '';

  if (this.wddStatus !== '-') {
    this.titulo += ` ${statusName}`;
  }

  this.isLocked     = true;
  this.docEntry     = value?.docEntry;
  this.cardCode     = h.n(value.cardCode);
  this.currency     = h.n(value.docCur);
  this.isEarring    = this.wddStatus === 'W';
  this.cntctCode    = value?.cntctCode;
  this.u_BPP_MDCT   = h.n(value.u_BPP_MDCT);
  this.isauthorized = this.wddStatus === 'Y';
}

private setSocioForm(value: IOrdersQuery, h: any) {
  this.currencyList = (value.currencyList || [])
    .map(m => ({ label: m.currName, value: m.currCode }));

  const currencyItem = h.findItem(this.currencyList, value.docCur);

  h.patch(this.modeloFormSoc, {
    cardCode : h.n(value.cardCode),
    cardName : h.n(value.cardName),
    cntctCode: value.cntctCode,
    numAtCard: h.n(value.numAtCard),
    currency : currencyItem,
    docRate  : h.r(value.docRate, 3),
  });
}

private setDocumentoForm(value: IOrdersQuery, h: any) {
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

private setCondiciones(value: IOrdersQuery, h: any) {
  const item = h.findItem(this.paymentsTermsTypesList, value.groupNum);

  h.patch(this.modeloFormFin, {
    paymentsTermsTypes: item
  });
}

private setDirecciones(value: IOrdersQuery, h: any) {
  this.shipAddressList = (value.shipAddressList || [])
  .map(d => ({ label: d.address, value: d.address }));

  this.payAddressList = (value.payAddressList || [])
  .map(d => ({ label: d.address, value: d.address }));

  const ship = h.findItem(this.shipAddressList, value.shipToCode);
  const pay  = h.findItem(this.payAddressList, value.payToCode);

  h.patch(this.modeloFormLog, {
    shipAddress: ship || null,
    address    : h.n(value.address),
    payAddress : pay || null,
    address2   : h.n(value.address2)
  });
}

private setAgencia(value: IOrdersQuery, h: any) {
  this.agencyAddressList = (value.agencyAddressList || [])
  .map(d => ({ label: d.address, value: d.address }));

  const agency = h.findItem(this.agencyAddressList, value.u_FIB_CODT);

  h.patch(this.modeloFormAge, {
    u_BPP_MDCT   : value.u_BPP_MDCT,
    u_BPP_MDRT   : h.n(value.u_BPP_MDRT),
    u_BPP_MDNT   : h.n(value.u_BPP_MDNT),
    agencyAddress: agency,
    u_BPP_MDDT   : h.n(value.u_BPP_MDDT)
  });
}

private setExportacion(value: IOrdersQuery, h: any) {
  const item = h.findItem(this.freightTypeList, value.u_TipoFlete);

  h.patch(this.modeloFormExp, {
    freightType : item,
    u_ValorFlete: h.r(value.u_ValorFlete, 0),
    u_FIB_TFLETE: h.r(value.u_FIB_TFLETE, 2),
    u_FIB_IMPSEG: h.r(value.u_FIB_IMPSEG, 2),
    u_FIB_PUERTO: h.n(value.u_FIB_PUERTO)
  });
}

private setOtros(value: IOrdersQuery, h: any) {
  const item = h.findItem(this.salesTypeList, value.u_STR_TVENTA);

  h.patch(this.modeloFormOtr, {
    salesType: item
  });
}

private setVendedor(value: IOrdersQuery, h: any) {
  const item = h.findItem(this.salesEmployeesList, value.slpCode);

  h.patch(this.modeloFormSal, {
    salesEmployees: item,
    u_NroOrden    : h.n(value.u_NroOrden),
    u_OrdenCompra : h.n(value.u_OrdenCompra),
    comments      : h.n(value.comments)
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

private setTotales(value: IOrdersQuery, h: any) {
  h.patch(this.modeloFormTot, {
    subTotal : h.r(value.subTotal, 2),
    discPrcnt: h.r(value.discPrcnt, 2),
    discSum  : h.r(value.discSum, 2),
    vatSum   : h.r(value.vatSum, 2),
    docTotal : h.r(value.docTotal, 2),
  });
}

private setLines(value: IOrdersQuery) {
  this.onBuildColumn();

  this.modeloLines = (value.lines || [])
    .map(l => this.utilService.mapLine(l));

  this.modeloLinesOriginal = structuredClone(value.lines);

  this.updateHasValidLines();
}

//#endregion



  //#region <<< 18. SAVE >>>

  onClickSaveOrder() {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        if (!this.validatedSave()) return;

        this.isSaving = true;

        this.wddStatus === 'Y'
          ? this.onToDraftToDocumentCreate()
          : this.onToOrderCreate();
      }
    });
  }

  onClickSaveDraft() {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        if (!this.validatedSave()) return;

        this.isSaving = true;

        console.log("DocEntry:::", this.docEntry);

        this.docEntry == 0
          ? this.onToDraftCreate()
          : this.onToDraftUpdate();
      }
    });
  }

  private onToOrderCreate() {
    this.uploadProgress = 0;

    const modeloToSave = this.buildModelToSave();

    this.ordersService.setCreate(modeloToSave, this.uploadedFiles)
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

  private onToDraftCreate() {
    this.uploadProgress = 0;

    const modeloToSave = this.buildModelToSave();

    this.draftsService.setCreate(modeloToSave, this.uploadedFiles)
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

  private onToDraftUpdate() {
    this.uploadProgress = 0;

    const modeloToSave = this.buildModelToSave();

    this.draftsService.setUpdate(modeloToSave, this.uploadedFiles)
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

  private onToDraftToDocumentCreate() {
    const modeloToSave = this.buildModelToSave();

    this.draftsService.setSaveDraftToDocument(modeloToSave)
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

  private validatedSave(): boolean {
    const showError = (message: string): boolean => {
      this.swaCustomService.swaMsgInfo(message);
      return false;
    };

    /** helpers */
    const u   = this.utilService;
    const p   = (v:any)=>u.normalizePrimitive(v);
    const val = (v:any)=>v?.value ?? v;

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
      { cond: !val(f.salesEmployees), msg: 'Seleccione el empleado de ventas.' }
    ])) return false;

    /** 🔹 DETALLE */
    for (let i = 0; i < this.modeloLines.length; i++) {

      const line = this.modeloLines[i];
      const row  = i + 1;

      const validations = [

        /** comunes */
        { cond: !p(line.taxCode), msg: `Línea ${row}: Seleccione el impuesto.` },
        { cond: !p(line.u_tipoOpT12), msg: `Línea ${row}: Seleccione el tipo de operación.` },

        /** servicio */
        ...(this.isService ? [
          { cond: !p(line.acctCode), msg: `Línea ${row}: Seleccione la cuenta contable.` }
        ] : []),

        /** artículo */
        ...(this.isItem ? [
          { cond: !p(line.whsCode), msg: `Línea ${row}: Seleccione el almacén.` },
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
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormSal.getRawValue(),
      ...this.modeloFormTot.getRawValue(),
    };
  }

  private mapLines(): Orders1CreateModel[] {
    /** helpers para evitar repetición */
    const u          = this.utilService;
    const p          = (v:any)=>u.normalizePrimitive(v);
    const n          = (v:any)=>u.normalizeNumber(v);
    const val        = (v:any)=>v?.value ?? v;

    const f          = this.modeloFormSoc.getRawValue();

    return this.modeloLines
    .filter(line => this.isItem ? p(line.itemCode) !== '' : p(line.dscription) !== '')
    .map<Orders1CreateModel>(line => ({
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
      u_tipoOpT12    : p(line.u_tipoOpT12)
    }));
  }

  private mapAttachments2Lines(): Attachments2LinesCreateModel[] {
    const u = this.utilService;
    const p = (v:any)=>u.normalizePrimitive(v);
    const d = (v:any)=>u.normalizeDateOrToday(v);

    return this.modeloLinesAttachments
    .filter(line => p(line.trgtPath) !== '')
    .map<any>(line => ({
      trgtPath : p(line.trgtPath),
      fileName : p(line.fileName),
      fileExt  : p(line.fileExt),
      date     : d(line.date)
    }));
  }

  private buildModelAttachments2(): Attachments2CreateModel {
    return {
      absEntry        : 0,
      lines: this.mapAttachments2Lines().map(l => ({
        trgtPath: l.trgtPath,
        fileName: l.fileName,
        fileExt : l.fileExt,
        date    : l.date
      }))
    };
  }

  private buildModelToSave(): any {
    /** helpers para evitar repetición */
    const u                 = this.utilService;
    const p                 = (v:any)=>u.normalizePrimitive(v);
    const n                 = (v:any)=>u.normalizeNumber(v);
    const d                 = (v:any)=>u.normalizeDateOrToday(v);
    const val               = (v:any)=>v?.value ?? v;
    const label             = (v:any)=>v?.label ?? v ?? '';

    /** combinar tod  os los formularios */
    const f                 = this.mergeForms();

    const currency          = p(val(f.currency));

    const userId            = this.userContextService.getIdUsuario();

    const docRate           = currency === this.mainCurncy ? 1 : n(f.docRate);

    const attachments2      = this.buildModelAttachments2();

    const lines             = this.mapLines();

    /** 🔥 condición para incluir docEntry --> Solo cuando es Autorizado */
    //const includeDocEntry   = p(this.wddStatus) === 'Y';

    return {
      // ...(includeDocEntry && { docEntry: this.docEntry }),

      docEntry        : this.docEntry,
      docDate         : d(f.docDate),
      docDueDate      : d(f.docDueDate),
      taxDate         : d(f.taxDate),

      docType         : p(val(f.docType)),

      u_FIB_DocStPkg  : 'O',
      u_FIB_IsPkg     : this.isItem ? 'Y' : 'N',

      cardCode        : p(f.cardCode),
      cardName        : p(f.cardName),
      cntctCode       : n(f.cntctCode),
      docCur          : currency,
      docRate         : docRate,
      numAtCard       : p(f.numAtCard),

      payToCode       : p(label(f.payAddress)),
      address         : p(f.address),
      shipToCode      : p(label(f.shipAddress)),
      address2        : p(f.address2),

      groupNum        : n(val(f.paymentsTermsTypes)),

      u_BPP_MDCT      : p(this.u_BPP_MDCT),
      u_BPP_MDRT      : p(f.u_BPP_MDRT),
      u_BPP_MDNT      : p(f.u_BPP_MDNT),
      u_FIB_CODT      : p(label(f.agencyAddress)),
      u_BPP_MDDT      : p(f.u_BPP_MDDT),

      u_TipoFlete     : p(val(f.freightType)),
      u_ValorFlete    : n(f.u_ValorFlete),
      u_FIB_TFLETE    : n(f.u_FIB_TFLETE),
      u_FIB_IMPSEG    : n(f.u_FIB_IMPSEG),
      u_FIB_PUERTO    : p(f.u_FIB_PUERTO),

      u_STR_TVENTA    : p(val(f.salesType)),

      slpCode         : n(val(f.salesEmployees) ?? -1),
      u_NroOrden      : p(f.u_NroOrden),
      u_OrdenCompra   : p(f.u_OrdenCompra),
      comments        : p(f.comments),

      discPrcnt       : n(f.discPrcnt),
      discSum         : n(f.discSum),
      vatSum          : n(f.vatSum),
      docTotal        : n(f.docTotal),
      u_UsrCreate     : userId,

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
}
