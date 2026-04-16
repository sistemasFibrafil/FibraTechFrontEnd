import Swal from 'sweetalert2';
import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject, forkJoin, of, takeUntil, Subscription, Observable, merge } from 'rxjs';
import { catchError, switchMap, map, finalize, tap, filter, distinctUntilChanged } from 'rxjs/operators';

import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { DeliveryNotesUpdateModel } from '../../../models/sap-business-one/delivery-notes.model';

import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IPicking } from 'src/app/modulos/modulo-inventario/interfaces/picking.inteface';
import { IAddresses } from 'src/app/modulos/modulo-socios-negocios/interfaces/addresses.interface';
import { IBusinessPartnersQuery } from 'src/app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';
import { IDeliveryNotes1Query, IDeliveryNotesQuery } from '../../../interfaces/sap-business-one/delivery-notes.interface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/sales-persons.interface';
import { IUserDefinedFields } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/user-defined-fields.interface';
import { IPaymentTermsTypes } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/condicion-pago-sap.interface';

import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { PickingService } from 'src/app/modulos/modulo-inventario/services/picking.service';
import { DeliveryNotesService } from '../../../services/sap-business-one/delivery-notes.service';
import { AddressesService } from 'src/app/modulos/modulo-socios-negocios/services/addresses.service';
import { BusinessPartnersService } from 'src/app/modulos/modulo-socios-negocios/services/business-partners.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { DocumentTypeSunatService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-type-sunat.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { PaymentTermsTypesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/paymentTerms-types.service';



@Component({
  selector: 'app-ven-panel-entrega-edit',
  templateUrl: './panel-entrega-edit.component.html',
  styleUrls: ['./panel-entrega-edit.component.css']
})
export class PanelEntregaEditComponent implements OnInit, OnDestroy {

  isLoadingInitialData                          : boolean = false;
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();
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

  id                                            : number = 0;
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

  docTypeSelected                               : any;
  initialSnapshot!                              : any;

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
  hasRealChanges                                : boolean = false;
  isNumAtCardWired                              : boolean = false;
  isVisualizarBarcode                           : boolean = false;

  // modeloLines
  modelo                                        : IDeliveryNotesQuery;
  modeloLinesSelected                           : IDeliveryNotes1Query;

  opciones                                      : MenuItem[];
  columnas                                      : TableColumn[];
  columnasModal                                 : TableColumn[];

  modeloLines                                   : IDeliveryNotes1Query[] = [];
  modeloPickingLines                            : IPicking[] = [];


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly pickingService: PickingService,
    private readonly addressesService: AddressesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly deliveryNotesService: DeliveryNotesService,
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly paymentTermsTypesService: PaymentTermsTypesService,
    private readonly documentTypeSunatService: DocumentTypeSunatService,
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
    this.wireTipoControl();
    //this.wireNumAtCardBuilder();
    this.wirePayAddressControl();
    this.wireAgencyAddressControl();

    // 4️⃣ Inicializar UI
    this.onBuildColumn();
    this.opcionesTabla();
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
    // TRANSPORTISTA
    this.modeloFormTra = this.fb.group(
    {
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
      { value: '1', label: 'Ver',             icon: 'pi pi-eye',       command: () => this.onClickView() },
    ];
  }

  // ===========================
  // Helper Methods
  // ===========================

  private showModalError(message: string): Promise<any> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: { container: 'my-swal' },
      target: document.getElementById('modal')
    });

    return swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, message, 'error');
  }

  onClickView(): void {
    this.isVisualizarBarcode = true;
    this.loadModalData();
  }

  onClickBuscarModal(): void {
    this.loadModalData();
  }

  private loadModalData(): void {
    if (!this.modeloLinesSelected) {
      return;
    }

    this.isDisplay = true;
    this.modeloPickingLines = [];

    const params = this.buildModalFilterParams();

    this.pickingService.getListByTarget(params)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IPicking[]) => {
        this.modeloPickingLines = data;
      },
      error: (e) => {
        this.modeloPickingLines = [];
        this.showModalError(
          e?.error?.resultadoDescripcion ?? 'Ocurrió un error inesperado.'
        );
      }
    });
  }

  private buildModalFilterParams(): any {
    const { u_CodeBar } = this.modeloFormCod.getRawValue();

    return {
      u_TrgetEntry : this.modeloLinesSelected.docEntry,
      u_TargetType : this.modeloLinesSelected.objType,
      u_TrgetLine  : this.modeloLinesSelected.lineNum,
      u_CodeBar   : u_CodeBar || '',
    };
  }

  onClearModel(): void {
    this.modeloPickingLines = [];
    this.isVisualizarBarcode = false;
    this.modeloFormCod.patchValue({ u_CodeBar: '' });
  }

  onHideModal(): void {
    this.onClearModel();
  }

  onClickCloseModal(): void {
    this.onClearModel();
  }

  private updateMenuVisibility(): void {
    const hasFromPkgY = this.modeloLines.some(
      l => (l.u_FIB_FromPkg ?? '').trim() === 'Y'
    );

    const viewLineOption = this.opciones.find(x => x.value === '1');

    // Mostrar cuando hay al menos un 'Y'
    if (viewLineOption) {
      viewLineOption.visible = hasFromPkgY;
    }
  }

  onSelectedItem(modelo: IDeliveryNotes1Query) {
    /** Actualiza la línea seleccionada cuando el usuario hace clic en una fila */
    this.modeloLinesSelected = modelo;
    this.updateMenuVisibility();
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

  private loadAllCombos(): void {
    this.idUsuario                          = this.userContextService.getIdUsuario();
    const paramSalesType                    : any = { tableID: 'ORDR', aliasID: 'STR_TVENTA' };
    const paramTypeTransport                : any = { tableID: 'ODLN', aliasID: 'FIB_TIP_TRANS' };
    const paramReasonTransfer               : any = { tableID: 'ODLN', aliasID: 'BPP_MDMT' };
    const paramDocumentTypeSunat            : any = { u_FIB_ENTR: 'Y', u_FIB_FAVE: '', u_FIB_TRAN: '' };
    const paramTypeCarrierIdentityDocument  : any = { tableID: 'ODLN', aliasID: 'FIB_TIPDOC_TRA' };
    const paramTypeDriversIdentityDocument  : any = { tableID: 'ODLN', aliasID: 'FIB_TIPDOC_COND' };

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
      salesType                     : this.camposDefinidoUsuarioService.getList(paramSalesType).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      typeTransport                 : this.camposDefinidoUsuarioService.getList(paramTypeTransport).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      reasonTransfer                : this.camposDefinidoUsuarioService.getList(paramReasonTransfer).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      salesEmployees                : this.salesPersonsService.getList().pipe(catchError(() => of([] as ISalesPersons[]))),
      documentTypeSunat             : this.documentTypeSunatService.getListByType(paramDocumentTypeSunat),
      paymentsTermsTypes            : this.paymentTermsTypesService.getList().pipe(catchError(() => of([] as IPaymentTermsTypes[]))),
      typeCarrierIdentityDocument   : this.camposDefinidoUsuarioService.getList(paramTypeCarrierIdentityDocument).pipe(catchError(() => of([] as IUserDefinedFields[]))),
      typeDriversIdentityDocument   : this.camposDefinidoUsuarioService.getList(paramTypeDriversIdentityDocument).pipe(catchError(() => of([] as IUserDefinedFields[]))),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isDisplay = false; })
      )
      .subscribe({
        next: (res) => {
          this.salesTypeList                    = (res.salesType || []).map(item => ({ label: item.descr, value: item.fldValue }));
          this.typeTransportList                = (res.typeTransport || []).map(item => ({ label: item.descr, value: item.fldValue }));
          this.reasonTransferList               = (res.reasonTransfer || []).map(item => ({ label: item.descr, value: item.fldValue }));
          this.salesEmployeesList               = (res.salesEmployees || []).map(item => ({ label: item.slpName, value: item.slpCode }));
          this.documentTypeSunatList            = (res.documentTypeSunat || []).map(item => ({ label: item.u_BPP_TDDD, value: item.u_BPP_TDTD }));
          this.paymentsTermsTypesList           = (res.paymentsTermsTypes || []).map(item => ({ label: item.pymntGroup, value: item.groupNum }));
          this.typeCarrierIdentityDocumentList  = (res.typeCarrierIdentityDocument || []).map(item => ({ label: item.descr, value: item.fldValue }));
          this.typeDriversIdentityDocumentList  = (res.typeDriversIdentityDocument || []).map(item => ({ label: item.descr, value: item.fldValue }));

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

        return this.deliveryNotesService
          .getByDocEntry(this.id)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IDeliveryNotesQuery) => {
        this.setFormValues(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: IDeliveryNotesQuery): void {
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
    this.u_BPP_NDTD   = value.u_BPP_MDTD || '';
    this.u_BPP_NDSD   = value.u_BPP_MDSD || '';
    this.u_BPP_MDCT   = value.u_BPP_MDCT || '';


    // SOCIO DE NEGOCIOS
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


    // DOCUMENTO
    // Buscar y asignar valores como SelectItem para campo de moneda
    const tipoDocumentoItem = this.documentTypeSunatList.find(item => item.value === value.u_BPP_MDTD);

    // Actualizar formulario de Documento
    this.modeloFormDoc.patchValue(
      {
        docNum    : value.docNum,
        docStatus : value.docStatus === 'O' ? 'Abierto' : 'Cerrado',
        u_BPP_MDTD: tipoDocumentoItem || null,
        u_BPP_MDSD: this.utilService.normalizePrimitive(value.u_BPP_MDSD),
        u_BPP_MDCD: this.utilService.normalizePrimitive(value.u_BPP_MDCD),
        docDate   : value.docDate ? new Date(value.docDate) : null,
        docDueDate: value.docDueDate ? new Date(value.docDueDate) : null,
        taxDate   : value.taxDate ? new Date(value.taxDate) : null,
      },
      { emitEvent: false }
    );


    // CONTENIDO
    const docTypeItem    = this.docTypesList.find(item => item.value === value.docType);
    this.docTypeSelected = docTypeItem;

    this.modeloFormCon.patchValue(
      { docType: docTypeItem || null },
      { emitEvent: false }
    );


    // FINANZAS
    const paymentsTermsTypesItem = this.paymentsTermsTypesList.find(item => item.value === value.groupNum);

    this.modeloFormFin.patchValue(
      { paymentsTermsTypes: paymentsTermsTypesItem || null },
      { emitEvent: false }
    );


    // LOGISTICA
    this.shipAddressList = (value.shipAddressList || []).map(d => ({ label: d.address, value: d.address }));
    this.payAddressList  = (value.payAddressList  || []).map(d => ({ label: d.address, value: d.address }));


    const shipAddressItem = this.shipAddressList.find(item => item.value === value.shipToCode);
    const payAddressItem  = this.payAddressList.find(item => item.value === value.payToCode);

    this.modeloFormLog.patchValue(
      {
        shipAddress: shipAddressItem || null,
        address2   : this.utilService.normalizePrimitive(value.address2),
        payAddress : payAddressItem || null,
        address    : this.utilService.normalizePrimitive(value.address),
      },
      { emitEvent: false }
    );


    // AGENCIA
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


    // TRANSPORTISTA
    this.u_FIB_COD_TRA                    = value.u_FIB_COD_TRA || '';
    this.u_BPP_MDVC                       = value.u_BPP_MDVC || '';
    this.u_FIB_NUMDOC_COD                 = value.u_FIB_NUMDOC_COD || '';

    const typeTransportItem               = this.typeTransportList.find(item => item.value === value.u_FIB_TIP_TRANS);
    const typeCarrierIdentityDocumentItem = this.typeCarrierIdentityDocumentList.find(item => item.value === value.u_FIB_TIPDOC_TRA);
    const typeDriversIdentityDocumentItem = this.typeDriversIdentityDocumentList.find(item => item.value === value.u_FIB_TIPDOC_COND);

    this.modeloFormTra.patchValue(
      {
        typeTransport                     : typeTransportItem || null,
        u_FIB_COD_TRA                     : this.utilService.normalizePrimitive(value.u_FIB_COD_TRA),
        typeCarrierIdentityDocument       : typeCarrierIdentityDocumentItem || null,
        u_FIB_RUC_TRANS2                  : this.utilService.normalizePrimitive(value.u_FIB_RUC_TRANS2),
        u_FIB_TRANS2                      : this.utilService.normalizePrimitive(value.u_FIB_TRANS2),
        u_BPP_MDVC                        : this.utilService.normalizePrimitive(value.u_BPP_MDVC),
        typeDriversIdentityDocument       : typeDriversIdentityDocumentItem || null,
        u_FIB_NUMDOC_COD                  : this.utilService.normalizePrimitive(value.u_FIB_NUMDOC_COD),
        u_FIB_NOM_COND                    : this.utilService.normalizePrimitive(value.u_FIB_NOM_COND),
        u_FIB_APE_COND                    : this.utilService.normalizePrimitive(value.u_FIB_APE_COND),
        u_BPP_MDFN                        : this.utilService.normalizePrimitive(value.u_BPP_MDFN),
        u_BPP_MDFC                        : this.utilService.normalizePrimitive(value.u_BPP_MDFC)
      },
      { emitEvent: false }
    );

    // EXPORTACIÓN
    this.modeloFormExp.patchValue(
      {
        u_RUCDestInter      : this.utilService.normalizePrimitive(value.u_RUCDestInter),
        u_DestGuiaInter     : this.utilService.normalizePrimitive(value.u_DestGuiaInter),
        u_DireccDestInter   : this.utilService.normalizePrimitive(value.u_DireccDestInter),
        u_STR_NCONTENEDOR   : this.utilService.normalizePrimitive(value.u_STR_NCONTENEDOR),
        u_STR_NPRESCINTO    : this.utilService.normalizePrimitive(value.u_STR_NPRESCINTO),
        u_FIB_NPRESCINTO2   : this.utilService.normalizePrimitive(value.u_FIB_NPRESCINTO2),
        u_FIB_NPRESCINTO3   : this.utilService.normalizePrimitive(value.u_FIB_NPRESCINTO3),
        u_FIB_NPRESCINTO4   : this.utilService.normalizePrimitive(value.u_FIB_NPRESCINTO4)
      },
      { emitEvent: false }
    );

    // OTROS
    const salesTypeItem       = this.salesTypeList.find(item => item.value === value.u_STR_TVENTA);
    const reasonTransferItem  = this.reasonTransferList.find(item => item.value === value.u_BPP_MDMT);

    this.modeloFormOtr.patchValue(
      {
        salesType       : salesTypeItem || null,
        reasonTransfer  : reasonTransferItem || null,
        u_BPP_MDOM      : this.utilService.normalizePrimitive(value.u_BPP_MDOM)
      },
      { emitEvent: false }
    );

    // SALES EMPLOYEE
    const slpCodeItem = this.salesEmployeesList.find(item => item.value === value.slpCode);

    // ✅ PATCH SAL (tu bloque original)
    this.modeloFormSal.patchValue(
      {
        salesEmployees: slpCodeItem || null,
        u_FIB_NBULTOS : this.utilService.onRedondearDecimalConCero(value.u_FIB_NBULTOS, 2),
        u_FIB_KG      : this.utilService.onRedondearDecimalConCero(value.u_FIB_KG, 2),
        u_NroOrden    : this.utilService.normalizePrimitive(value.u_NroOrden),
        u_OrdenCompra : this.utilService.normalizePrimitive(value.u_OrdenCompra),
        comments      : this.utilService.normalizePrimitive(value.comments)
      },
      { emitEvent: false }
    );

    // TOTALES
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
      tra  : this.modeloFormTra.getRawValue(),
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
    this.modeloFormTra.markAsPristine();
    this.modeloFormExp.markAsPristine();
    this.modeloFormOtr.markAsPristine();
    this.modeloFormSal.markAsPristine();
    this.modeloFormTot.markAsPristine();

    // Escuchar cambios
    this.watchChanges();

    // Estado inicial botón
    this.detectRealChanges();

    // Actualización de número
    if (!this.isNumAtCardWired) {
      this.wireNumAtCardBuilder();
      this.isNumAtCardWired = true;
    }

    this.buildNumAtCard();
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
      this.modeloFormTra.valueChanges,
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
    this.modeloFormTra.valid &&
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

    const traChanged = this.utilService.hasFormChanged(
      this.modeloFormTra,
      this.initialSnapshot.tra
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

    const formChanged = socChanged || docChanged || logChanged || finChanged || ageChanged || traChanged || expChanged || otrChanged || salChanged || totChanged;

    // =========================
    // ✅ REGLA FINAL
    // =========================
    this.hasRealChanges =
      formChanged;
  }

  //#region <<< MODAL: CLIENTE >>>

  get isMainCurrency(): boolean {
    return !this.currency || this.currency === '##' || this.currency === this.mainCurncy;
  }

  get currencyColClass(): string {
    return this.isMainCurrency ? 'col-12 md:col-12' : 'col-12 md:col-6';
  }

  //#endregion


  //#region <<< DOCUMENTO >>>

  private wireTipoControl(): void {
    const tipoCtrl = this.modeloFormDoc.get('u_BPP_MDTD');

    tipoCtrl?.valueChanges
    .pipe(
      takeUntil(this.destroy$),
      // 🔥 evitar repetir mismo valor
      distinctUntilChanged((a, b) => (a?.value ?? a) === (b?.value ?? b))
    )
    .subscribe((selected) => {

      const tipoVal = selected?.value ?? '';

      // 🔥 actualizar variables internas
      this.u_BPP_NDTD = tipoVal;
      this.u_BPP_NDSD = '';

      // 🔥 limpiar sin disparar eventos globales
      this.modeloFormDoc.patchValue({
        u_BPP_MDSD: '',
        u_BPP_MDCD: ''
      }, { emitEvent: false });

      // 🔥 control manual (más eficiente)
      this.buildNumAtCard();
      this.detectRealChanges();
    });
  }

  onClickSelectedSerieDocumento(value: any): void {
    this.modeloFormDoc.patchValue({
      u_BPP_MDSD: value.u_BPP_NDSD,
      u_BPP_MDCD: value.u_BPP_NDCD
    }, { emitEvent: true });
  }

  private wireNumAtCardBuilder(): void {
    this.modeloFormDoc.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.buildNumAtCard());
  }

  private buildNumAtCard(): void {
    const tipoCtrl   = this.modeloFormDoc.get('u_BPP_MDTD');
    const serieCtrl  = this.modeloFormDoc.get('u_BPP_MDSD');
    const numeroCtrl = this.modeloFormDoc.get('u_BPP_MDCD');

    if (!tipoCtrl || !serieCtrl || !numeroCtrl) return;

    const tipoRaw   = tipoCtrl.value;
    const serieRaw  = serieCtrl.value;
    const numeroRaw = numeroCtrl.value;

    const tipoVal =
      typeof tipoRaw === 'object'
        ? (tipoRaw?.value ?? '')
        : (tipoRaw ?? '');

    const serieVal  = serieRaw ?? '';
    const numeroVal = numeroRaw ?? '';

    // 🔥 evitar basura
    if (!tipoVal && !serieVal && !numeroVal) {
      this.modeloFormSoc.patchValue({ numAtCard: '' }, { emitEvent: false });
      return;
    }

    const numAtCard = [tipoVal, serieVal, numeroVal]
      .filter(v => v)
      .join('-');

    // 🔥 evitar patch innecesario
    const current = this.modeloFormSoc.get('numAtCard')?.value;
    if (current === numAtCard) return;

    this.modeloFormSoc.patchValue(
      { numAtCard },
      { emitEvent: false }
    );
  }

  //#endregion


  //#region <<< CONTENIDO >>>

  get isItem(): boolean {
    return this.docTypeSelected?.value === 'I';
  }

  get isService(): boolean {
    return this.docTypeSelected?.value === 'S';
  }

  roundDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.floor(value * factor) / factor;
  }

  truncateDecimal(value: number, decimals: number): number {
    const factor = Math.pow(10, decimals);
    return Math.trunc(value * factor) / factor;
  }

  //#endregion


  //#region <<< LOGÍSTICA >>>

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
        this.agencyAddressList = (shipAddr || []).map(d => ({ label: d.address, value: d.address }));

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
                  this.modeloFormAge.patchValue({ u_BPP_MDDT: this.utilService.normalizePrimitive(fullAddress) }, { emitEvent: false });
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

  const typeCarrierIdentityDocumentItem =
  this.typeCarrierIdentityDocumentList.find(item => item.value === value.u_BPP_BPTD);

  this.modeloFormTra.patchValue({
    'u_FIB_COD_TRA'               : this.utilService.normalizePrimitive(value.cardCode),
    'typeCarrierIdentityDocument' : typeCarrierIdentityDocumentItem || null,
    'u_FIB_RUC_TRANS2'            : this.utilService.normalizePrimitive(value.licTradNum),
    'u_FIB_TRANS2'                : this.utilService.normalizePrimitive(value.cardName)
  }, { emitEvent: false });

  this.detectRealChanges();
}

  onSelectedVehiculo(value) {
    this.modeloFormTra.patchValue({
      'u_BPP_MDVC'                  : this.utilService.normalizePrimitive(value.u_BPP_VEPL)
    }, { emitEvent: false });

    this.detectRealChanges();
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

    this.detectRealChanges();
  }

  //#endregion


  //#region << EXPORTACIÓN >>>
  //#endregion


  //#region <<< TOTALES >>>

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
      ...this.modeloFormTra.getRawValue(),
      ...this.modeloFormExp.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormSal.getRawValue(),
      ...this.modeloFormTot.getRawValue(),
    };
  }

  private buildModelToSave(): DeliveryNotesUpdateModel {
    /** helpers para evitar repetición */
    const u             = this.utilService;
    const p             = (v:any)=>u.normalizePrimitive(v);
    const n             = (v:any)=>u.normalizeNumber(v);
    const d             = (v:any)=>u.normalizeDateOrToday(v);
    const val           = (v:any)=>v?.value ?? v;

    /** combinar formularios */
    const f             = this.mergeForms();

    const userId        = this.userContextService.getIdUsuario();
    const docType       = p(val(f.docType));

    return {
      ...new DeliveryNotesUpdateModel(),

      docEntry          : n(this.docEntry),
      docDueDate        : d(f.docDueDate),

      docType           : docType,

      u_BPP_MDTD        : p(val(f.u_BPP_MDTD)),
      u_BPP_MDSD        : p(f.u_BPP_MDSD),
      u_BPP_MDCD        : p(f.u_BPP_MDCD),

      cardCode          : p(f.cardCode),
      cntctCode         : n(f.cntctCode),
      numAtCard         : p(f.numAtCard),

      payToCode         : p(val(f.payAddress)),
      address           : p(f.address),

      groupNum          : n(val(f.paymentsTermsTypes)),

      u_BPP_MDCT        : p(f.u_BPP_MDCT),
      u_BPP_MDRT        : p(f.u_BPP_MDRT),
      u_BPP_MDNT        : p(f.u_BPP_MDNT),
      u_FIB_CODT        : p(val(f.agencyAddress)),
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

      u_UsrUpdate       : userId
    };
  }

  onToSave() {
    if(!this.validatedSave()) return;

    this.isSaving = true;

    const modeloToSave = this.buildModelToSave();

    debugger;

    this.deliveryNotesService.setUpdate(modeloToSave)
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
    this.router.navigate(['/main/modulo-ven/panel-entrega-list']);
  }
}
