import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { catchError, switchMap, map, finalize, tap } from 'rxjs/operators';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { Subject, forkJoin, of, takeUntil, Subscription, Observable } from 'rxjs';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { OrdenVentaCreateModel } from '../../../models/web/orden-venta.model';

import { IOrdenVenta, IOrdenVenta1 } from '../../../interfaces/sap/orden-venta.interface';
import { IDireccion } from 'src/app/modulos/modulo-socios-negocios/interfaces/direccion.interface';
import { ITipoCambio } from 'src/app/modulos/modulo-gestion/interfaces/sap/tipo-cambio-sap.interface';
import { ISocioNegocio } from 'src/app/modulos/modulo-socios-negocios/interfaces/socio-segocio.interface';
import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/articulo.interface';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/warehouses.interface';
import { IImpuestoSap } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/finanzas/impuesto-sap.iterface';
import { ISalesPersons } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/sales-persons.interface';
import { ICondicionPago } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/socio-negocios/condicion-pago-sap.interface';
import { ICampoDefnidoUsuario } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/campo-definido-usuario.interface';

import { UtilService } from 'src/app/services/util.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { OrdenVentaService } from '../../../services/sap/orden-venta.service';
import { ArticuloService } from 'src/app/modulos/modulo-inventario/services/articulo.service';
import { DireccionService } from 'src/app/modulos/modulo-socios-negocios/services/direccion.service';
import { TipoCambioService } from 'src/app/modulos/modulo-gestion/services/sap/tipo-cambio-sap.service';
import { SocioNegocioService } from 'src/app/modulos/modulo-socios-negocios/services/socio-negocios.service';
import { MonedaService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/finanzas/moneda.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/sales-persons.service';
import { CondicionPagoService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/socio-negocios/condicion-pago.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/campo-defnido-usuario.service';
import { NumeracionDocumentoService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/numeracion-documento.service';
import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-ven-panel-orden-venta-edit',
  templateUrl: './panel-orden-venta-edit.component.html',
  styleUrls: ['./panel-orden-venta-edit.component.css']
})
export class PanelOrdenVentaEditComponent implements OnInit, OnDestroy {
  // Lifecycle management
  /** Gestiona ciclo de vida y estado inicial */
  private readonly destroy$                     = new Subject<void>();
  isLoadingInitialData                          = false;

  // Titulo del componente
  titulo                                        = 'Orden de Venta';
  // Acceso de botones
  buttonAccess                                  : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  modeloFormSoc                                  : FormGroup;
  modeloFormDoc                                 : FormGroup;
  modeloFormCon                                 : FormGroup;
  modeloFormLog                                 : FormGroup;
  modeloFormFin                                 : FormGroup;
  modeloFormAge                                 : FormGroup;
  modeloFormExp                                 : FormGroup;
  modeloFormOtr                                 : FormGroup;
  modeloFormSal                                 : FormGroup;
  modeloFormTot                                 : FormGroup;

  id                                            = 0;
  docEntry                                      = 0;
  cardCode                                      : string = '';
  cntctCode                                     : number = 0;
  sysRate                                       : number = 0;
  currency                                      : string = '';
  mainCurncy                                    : string = '';
  u_BPP_MDCT                                    : string = '';

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
  isDisplay                                     : boolean = false;
  isSaving                                      : boolean = false;
  isVisualizarAlmacen                           : boolean = false;
  isVisualizarImpuesto                          : boolean = false;
  isVisualizarArticulo                          : boolean = false;
  isVisualizarTipoOperacion                     : boolean = false;
  isVisualizarCuentaContable                    : boolean = false;

  isLocked                                      : boolean = true;

  // modeloLines
  indexAlmacen                                  : number = 0;
  indexImpuesto                                 : number = 0;
  indexArticulo                                 : number = 0;
  indexCentroCuentaContable                     : number = 0;
  indexTipoOperacion                            : number = 0;
  itemCode                                      : string = '';
  inactiveAlmacenItem                           : string = 'N';

  // Table configuration
  /** Configuración de tabla y menús */
  opciones                                      : MenuItem[];
  columnas                                      : TableColumn[];

  modelo                                        : IOrdenVenta;
  modeloLinesSelected                           : IOrdenVenta1;
  modeloLines                                   : IOrdenVenta1[] = [];
  modeloLinesEliminar                           : IOrdenVenta1[] = [];
  modeloLinesOriginal                           : IOrdenVenta1[] = [];

  docTypePrevious                               : any;
  docTypeSelected                               : any;

  initialSnapshot!                              : any;
  hasRealChanges                                = false;
  hasValidLines                                 = false;

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly monedaService: MonedaService,
    private readonly articuloService: ArticuloService,
    private readonly direccionService: DireccionService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly ordenVentaService: OrdenVentaService,
    private readonly tipoCambioService: TipoCambioService,
    private readonly userContextService: UserContextService,
    private readonly socioNegocioService: SocioNegocioService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly condicionPagoService: CondicionPagoService,
    private readonly numeracionDocumentoService: NumeracionDocumentoService,
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
    this.wireDiscountControls();
    this.onBuildColumn();
    this.opcionesTabla();
    this.loadAllCombos();
    this.addLine(0);
    this.initializeBlur();

    // Cargar todos los combos en paralelo y esperar a que todos terminen
    //this.loadAllCombos();
  }

  buildForms() {
    // CABECERA - Datos del cliente y moneda
    this.modeloFormSoc = this.fb.group({
      cardCode            : new FormControl({ value: '', disabled: false }, Validators.required),
      cardName            : new FormControl('', Validators.required),
      cntctCode           : new FormControl(''),
      numAtCard           : new FormControl(''),
      docCur              : new FormControl('', Validators.required),
      docRate             : new FormControl('', Validators.required),
    });
    // CABECERA 2 - Números, estado y fechas
    this.modeloFormDoc = this.fb.group({
      docNum              : new FormControl({ value: '', disabled: false }),
      docStatus           : [{ value: 'Abierto', disabled: false }, Validators.required],
      docDate             : new FormControl(new Date(), Validators.required),
      docDueDate          : new FormControl(null, Validators.required),
      taxDate             : new FormControl(new Date(), Validators.required),
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
      freightType         : new FormControl('', Validators.required),
      u_ValorFlete        : new FormControl(''),
      u_FIB_TFLETE        : new FormControl(''),
      u_FIB_IMPSEG        : new FormControl(''),
      u_FIB_PUERTO        : new FormControl(''),
    });
    // OTROS
    this.modeloFormOtr = this.fb.group({
      salesType           : new FormControl('', Validators.required),
    });
    // PIE - Información adicional y totales
    this.modeloFormSal = this.fb.group({
      salesEmployees      : new FormControl('', Validators.required),
      u_OrdenCompra       : new FormControl(''),
      comments            : new FormControl(''),
    });
    this.modeloFormTot = this.fb.group({
      subTotal            : new FormControl(''),
      discPrcnt           : new FormControl(''),
      discSum             : new FormControl(''),
      vatSum              : new FormControl(''),
      docTotal            : new FormControl(''),
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
        { field: 'vatSum',          header: 'Importe del impuesto' },
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
        { field: 'vatSum',          header: 'Importe del impuesto' },
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

  onSelectedItem(modelo: IOrdenVenta1) {
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
    this.hasValidLines =
    this.modeloLines.length > 0 &&
    this.modeloLines.every(line =>!!line.itemCode?.trim());
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

  private initializeBlur(): void {
    this.blurDocRate();

    this.blurValorFlete();
    this.blurTotalFlete();
    this.blurImporteSeguro();

    this.blurSubTotal();
    this.blurDiscPrcnt();
    this.blurDiscSum();
    this.blurVatSum();
    this.blurDocTotal();
  }

  private loadAllCombos(): void {
    const paramNumero     : any = { objectCode: '17' };
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
      numero    : this.numeracionDocumentoService.getNumero(paramNumero),
      groups    : this.condicionPagoService.getList().pipe(catchError(() => of([] as ICondicionPago[]))),
      employees : this.salesPersonsService.getList().pipe(catchError(() => of([] as ISalesPersons[]))),
      tipoFlete : this.camposDefinidoUsuarioService.getList(paramTipoFlete).pipe(catchError(() => of([] as ICampoDefnidoUsuario[]))),
      tipoVenta : this.camposDefinidoUsuarioService.getList(paramTipoVenta).pipe(catchError(() => of([] as ICampoDefnidoUsuario[]))),
    })
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isDisplay = false; })
      )
      .subscribe({
        next: (res) => {
          this.modeloFormDoc.patchValue({ docNum: res.numero.nextNumber }, { emitEvent: false });

          this.paymentsTermsTypesList = (res.groups || []).map(item => ({ label: item.pymntGroup, value: item.groupNum }));
          this.salesEmployeesList     = (res.employees || []).map(item => ({ label: item.slpName, value: item.slpCode }));
          this.freightTypeList        = (res.tipoFlete || []).map(item => ({ label: item.descr, value: item.fldValue }));
          this.salesTypeList          = (res.tipoVenta || []).map(item => ({ label: item.descr, value: item.fldValue }));

          this.loadData();
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadAllCombos', () => { this.isDisplay = false; }, this.swaCustomService);
        }
      });
  }

  private loadData(): void {
    this.route.params
      .pipe(
        tap(params => this.id = +params['id']),
        switchMap(params => {
          this.isDisplay = true;
          return this.ordenVentaService.getByDocEntry(+params['id']);
        }),
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (data: IOrdenVenta) => {
          this.isDisplay = false;
          this.modelo = data;
          this.modeloLinesOriginal = JSON.parse(JSON.stringify(data.lines));
          this.setFormValues(this.modelo);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadData', () => { this.isDisplay = false; }, this.swaCustomService);
        }
      });
  }

  private setFormValues(value: IOrdenVenta): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el modeloLines durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.isLocked                 = value.docStatus !== 'O';
    this.docEntry                 = value.docEntry;
    this.cardCode                 = value.cardCode;
    this.cntctCode                = value.cntctCode;
    this.currency                 = value.docCur || '';
    this.u_BPP_MDCT               = value.u_BPP_MDCT || '';

    // Listar direcciones
    this.currencyList             = (value.currencyList  || []).map(m => ({ label: m.currName, value: m.currCode }));

    // Buscar y asignar valores como SelectItem para campo de moneda
    const currencyItem            = this.currencyList.find(item => item.value === value.docCur);

    // Actualizar formulario Socio de Negocio
    this.modeloFormSoc.patchValue(
      {
        cardCode                  : value.cardCode,
        cardName                  : value.cardName,
        cntctCode                 : value.cntctCode,
        numAtCard                 : value.numAtCard,
        docCur                    : currencyItem || null,
        docRate                   : value.docRate,
      },
      { emitEvent: false }
    );

    // Actualizar formulario de Documento
    this.modeloFormDoc.patchValue(
      {
        docNum                    : value.docNum,
        docStatus                 : value.docStatus === 'O' ? 'Abierto' : 'Cerrado',
        docDate                   : value.docDate ? new Date(value.docDate) : null,
        docDueDate                : value.docDueDate ? new Date(value.docDueDate) : null,
        taxDate                   : value.taxDate ? new Date(value.taxDate) : null,
      },
      { emitEvent: false }
    );

    // Habilitar o deshabilitar controles del formulario basados en el estado del documento
    // Para evitar 'changed after checked' manejamos el estado del control desde el componente
    const isEditable = value.docStatus === 'O';
    const docControls = ['docDate', 'docDueDate'];
    for (const ctrlName of docControls) {
      const ctrl = this.modeloFormDoc.get(ctrlName);
      if (!ctrl) { continue; }
      if (isEditable) {
        ctrl.enable({ emitEvent: false });
      } else {
        ctrl.disable({ emitEvent: false });
      }
    }

    // Buscar y asignar valores como SelectItem para campos definidos por usuario
    const docTypeItem        = this.docTypesList.find(item => item.value === value.docType);

    // Actualizar formulario de contenido
    this.modeloFormCon.patchValue(
      {
        docType                   : docTypeItem || null
      },
      { emitEvent: false }
    );


    // Buscar y asignar valores como SelectItem para condición de pago
    const paymentsTermsTypesItem   = this.paymentsTermsTypesList.find(item => item.value === value.groupNum);

    // Actualizar formulario de contenido
    this.modeloFormFin.patchValue(
      {
        paymentsTermsTypes        : paymentsTermsTypesItem || null,
      },
      { emitEvent: false }
    );

    // Listar direcciones
    this.shipAddressList          = (value.shipAddressList || []).map(d => ({ label: d.address, value: d }));
    this.payAddressList           = (value.payAddressList || []).map(d => ({ label: d.address, value: d }));

    // Buscar y asignar valores como SelectItem para Logistica
    const shipAddressItem         = this.shipAddressList.find(item => item.label === value.shipToCode);
    const payAddressItem          = this.payAddressList.find(item => item.label === value.payToCode);

    // Actualizar formulario de logística
    this.modeloFormLog.patchValue(
      {
        shipAddress               : shipAddressItem || null,
        address                   : value.address,
        payAddress                : payAddressItem || null,
        address2                  : value.address2
      },
      { emitEvent: false }
    );

    // Listar direcciones
    this.agencyAddressList    = (value.agencyAddressList || []).map(d => ({ label: d.address, value: d }));

    // Buscar y asignar valores como SelectItem para agencia
    const agencyAddressItem        = this.agencyAddressList.find(item => item.label === value.u_FIB_AgencyToCode);

    // Actualizar formulario de agencia
    this.modeloFormAge.patchValue(
      {
        u_BPP_MDCT                : value.u_BPP_MDCT,
        u_BPP_MDRT                : value.u_BPP_MDRT,
        u_BPP_MDNT                : value.u_BPP_MDNT,
        agencyAddress             : agencyAddressItem || null,
        u_BPP_MDDT                : value.u_BPP_MDDT
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para exportación
    const freightTypeItem         = this.freightTypeList.find(item => item.value === value.u_TipoFlete);

    // Actualizar formulario de exportación
    this.modeloFormExp.patchValue(
      {
        freightType               : freightTypeItem || null,
        u_ValorFlete              : value.u_ValorFlete,
        u_FIB_TFLETE              : value.u_FIB_TFLETE,
        u_FIB_IMPSEG              : value.u_FIB_IMPSEG,
        u_FIB_PUERTO              : value.u_FIB_PUERTO
      },
      { emitEvent: false }
    );


    // Buscar y asignar valores como SelectItem para campos definidos por usuario
    const salesTypeItem           = this.salesTypeList.find(item => item.value === value.u_STR_TVENTA);

    // Actualizar formulario de exportación
    this.modeloFormOtr.patchValue(
      {
        salesType                 : salesTypeItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valor como SelectItem para empleado de ventas
    const slpCodeItem             = this.salesEmployeesList.find(item => item.value === value.slpCode);

    // Actualizar formulario Pie
    this.modeloFormSal.patchValue(
      {
        salesEmployees            : slpCodeItem || null,
        u_OrdenCompra             : value.u_OrdenCompra,
        comments                  : value.comments
      },
      { emitEvent: false }
    );

    // Actualizar formulario Pie
    this.modeloFormTot.patchValue(
      {
        subTotal                  : this.utilService.onRedondearDecimalConCero(value.subTotal, 2),
        discPrcnt                 : this.utilService.onRedondearDecimalConCero(value.discPrcnt, 2),
        discSum                   : this.utilService.onRedondearDecimalConCero(value.discSum, 2),
        vatSum                    : this.utilService.onRedondearDecimalConCero(value.vatSum, 2),
        docTotal                  : this.utilService.onRedondearDecimalConCero(value.docTotal, 2),
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar modeloLines después de que los formularios estén actualizados
    // =========================================================================
    // Esto garantiza que los eventos onChange no sobrescriban los valores originales del modeloLines
    this.modeloLines = value.lines || [];
    this.updateHasValidLines();
    this.isLoadingInitialData = false;
    console.log('Líneas cargadas:', this.modeloLines);

    // =========================
    // SNAPSHOT ORIGINAL (CLAVE)
    // =========================
    this.initialSnapshot = {
      soc: this.modeloFormSoc.getRawValue(),
      doc: this.modeloFormDoc.getRawValue(),
      log: this.modeloFormLog.getRawValue(),
      fin: this.modeloFormFin.getRawValue(),
      age: this.modeloFormAge.getRawValue(),
      exp: this.modeloFormExp.getRawValue(),
      otr: this.modeloFormOtr.getRawValue(),
      sal: this.modeloFormSal.getRawValue(),
      tot: this.modeloFormTot.getRawValue(),
      lines: JSON.parse(JSON.stringify(this.modeloLines))
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

    // =========================
    // ESCUCHAR CAMBIOS DE FORMULARIOS
    // =========================
    this.watchChanges();

    // =========================
    // ESTADO INICIAL BOTÓN
    // =========================
    this.detectRealChanges();
  }

  // =========================
  // WATCH CHANGES (AGREGADO)
  // =========================
  private watchChanges(): void {
    this.modeloFormDoc.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormLog.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormFin.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormAge.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormExp.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormOtr.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormSal.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());

    this.modeloFormTot.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => this.detectRealChanges());
  }

  private normalizeDate(value: any): string | null {
    if (!value) return null;

    const date = value instanceof Date ? value : new Date(value);

    return isNaN(date.getTime())
      ? null
      : date.toISOString().substring(0, 10); // yyyy-mm-dd
  }

  private hasFormChanged(form: FormGroup, snapshot: any): boolean {
    const current = form.getRawValue();

    return Object.keys(snapshot).some(key => {
      const currentValue  = current[key];
      const snapshotValue = snapshot[key];

      // =========================
      // FECHAS (p-calendar)
      // =========================
      if (currentValue instanceof Date || snapshotValue instanceof Date) {
        return this.normalizeDate(currentValue) !== this.normalizeDate(snapshotValue);
      }

      // =========================
      // SelectItem (dropdowns)
      // =========================
      if (currentValue?.value !== undefined || snapshotValue?.value !== undefined) {
        return currentValue?.value !== snapshotValue?.value;
      }

      // =========================
      // VALORES NORMALES
      // =========================
      return currentValue !== snapshotValue;
    });
  }

  private detectRealChanges(): void {
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
    const socChanged = this.hasFormChanged(
      this.modeloFormSoc,
      this.initialSnapshot.soc
    );

    const docChanged = this.hasFormChanged(
      this.modeloFormDoc,
      this.initialSnapshot.doc
    );

    const logChanged = this.hasFormChanged(
      this.modeloFormLog,
      this.initialSnapshot.log
    );

    const finChanged = this.hasFormChanged(
      this.modeloFormFin,
      this.initialSnapshot.fin
    );

    const ageChanged = this.hasFormChanged(
      this.modeloFormAge,
      this.initialSnapshot.age
    );

    const expChanged = this.hasFormChanged(
      this.modeloFormExp,
      this.initialSnapshot.exp
    );

    const otrChanged = this.hasFormChanged(
      this.modeloFormOtr,
      this.initialSnapshot.otr
    );

    const salChanged = this.hasFormChanged(
      this.modeloFormSal,
      this.initialSnapshot.sal
    );

    const totChanged = this.hasFormChanged(
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

  cleanSocioNegocio(): void {
    this.cardCode           = '';
    this.cntctCode          = 0;
    this.currency           = '';
    this.modeloFormSoc.reset({
      'cardCode'            : '',
      'cardName'            : '',
      'cntctCode'           : '',
      'docCur'              : '',
      'docRate'             : ''
    });
    this.modeloFormLog.reset({
      'shipAddress'         : '',
      'address2'            : '',
      'payAddress'          : '',
      'address'             : ''
    });
    this.modeloFormFin.patchValue({
      'paymentsTermsTypes'  : ''
    });
    this.modeloFormSal.patchValue({
      'slpCode'             : ''
    });
  }

  onSelectedCliente(value: ISocioNegocio) {
    // garantizar orden: limpiar controles primero, luego iniciar la carga
    this.cleanSocioNegocio();

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

  private socioLoadSubscription: Subscription | null = null;

  private loadSocioNeogocioByCode(cardCode: string): Observable<any> {
    this.isDisplay = true;
    return this.socioNegocioService.getByCode(cardCode).pipe(
      takeUntil(this.destroy$),
      tap(socio => {
        this.cardCode     = socio.cardCode;
        this.cntctCode    = socio.cntctCode;
        this.modeloFormSoc.patchValue({ cardCode : socio.cardCode, cardName: socio.cardName, cntctCode: socio.cntctCode }, { emitEvent: false });
      }),
      map((socio: ISocioNegocio) => ({
        socio,
        monedas   : socio.currencyList ?? [],
        shipAddr  : socio.shipAddressList ?? [],
        payAddr   : socio.payAddressList ?? []
      })),
      // Actualizamos listas y preselecciones sin disparar eventos
      tap(({ monedas, shipAddr, payAddr, socio }) => {
        this.currencyList       = (monedas || []).map(m => ({ label: m.currName, value: m.currCode }));
        this.shipAddressList    = (shipAddr || []).map(d => ({ label: d.address, value: d }));
        this.payAddressList     = (payAddr || []).map(d => ({ label: d.address, value: d }));

        // Selección por defecto de moneda
        if (this.currencyList.length > 0) {
          let preferred: any;
          if (this.currencyList.length === 1) {
            preferred = this.currencyList[0];
          } else {
            // Si tiene más de un ítem, Preferir la moneda local
            preferred = this.currencyList.find(c => String(c.value).toUpperCase() === String(this.mainCurncy).trim().toUpperCase());
          }

          if (preferred) {
            this.currency = preferred.value;
            this.modeloFormSoc.get('docCur')?.setValue(preferred, { emitEvent: false });
          }
        }

        // Selección por defecto de direcciones y otros campos
        const defaultShipItem = this.shipAddressList.find(it => (it.value as IDireccion).address === socio.shipToDef) || null;
        if (defaultShipItem) {
          this.modeloFormLog.patchValue({ shipAddress: defaultShipItem }, { emitEvent: false });
        }

        const defaultPayItem = this.payAddressList.find(it => (it.value as IDireccion).address === socio.billToDef) || null;
        if (defaultPayItem) {
          this.modeloFormLog.patchValue({ payAddress: defaultPayItem }, { emitEvent: false });
        }

        const defaultGroup = this.paymentsTermsTypesList.find(it => it.value === socio.groupNum) || null;
        if (defaultGroup) {
          this.modeloFormFin.patchValue({ paymentsTermsTypes: defaultGroup }, { emitEvent: false });
        }

        const slpCodeNormalized = (socio.slpCode ?? 0) === 0 ? -1 : socio.slpCode;
        const defaultSalesEmployee = this.salesEmployeesList.find(it => it.value === slpCodeNormalized) || null;
        if (defaultSalesEmployee) {
          this.modeloFormSal.patchValue({ salesEmployees: defaultSalesEmployee }, { emitEvent: false });
        }
      }),
      // Encadenar las cargas dependientes y esperar a que terminen
      switchMap(({ monedas, shipAddr, payAddr, socio }) => {
        const tasks: Observable<any>[] = [];

        if (this.currency) {
          tasks.push(this.loadTipoCambio(this.currency));
        }

        const defaultShip = (shipAddr || []).find((d: IDireccion) => d.address === socio.shipToDef);
        if (defaultShip) {
          tasks.push(
            this.loadAddress(socio.cardCode, socio.shipToDef, 'S').pipe(
              tap((street: string | null) => {
                if (street !== null && street !== undefined) {
                  this.modeloFormLog.patchValue({ address2: street }, { emitEvent: false });
                }
              })
            )
          );
        }

        const defaultPay = (payAddr || []).find((d: IDireccion) => d.address === socio.billToDef);
        if (defaultPay) {
          tasks.push(
            this.loadAddress(socio.cardCode, socio.billToDef, 'B').pipe(
              tap((street: string | null) => {
                if (street !== null && street !== undefined) {
                  this.modeloFormLog.patchValue({ address: street }, { emitEvent: false });
                }
              })
            )
          );
        }

        if (tasks.length === 0) return of({ monedas, shipAddr, payAddr, socio });
        return forkJoin(tasks).pipe(map(() => ({ monedas, shipAddr, payAddr, socio })));
      }),
      catchError(e => {
        this.utilService.handleErrorSingle(e, 'loadSocioNeogocioByCode', () => { this.isDisplay = false; }, this.swaCustomService);
        return of(null);
      }),
      finalize(() => { this.isDisplay = false; })
    );
  }
  /**
   * Reutilizable: devuelve únicamente el valor numérico del tipo de cambio (o null).
   * No tiene side-effects sobre el formulario ni indicadores.
   */
  private fetchTipoCambioRate(currCode: any): Observable<ITipoCambio | null> {
    const docDate: Date = this.modeloFormDoc?.controls['docDate']?.value;
    const currency      = String(currCode || '').trim().toUpperCase();
    const sysCurrncy    = this.userContextService.getSysCurrncy();

    const params: any = { rateDate: this.utilService.normalizeDate(docDate), currency: currency, sysCurrncy: sysCurrncy };
    return this.tipoCambioService.getByDocDateAndCurrency(params)
      .pipe(
        map((data: ITipoCambio) => data ?? null),
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
      tap((data: ITipoCambio | null) => {
        //Determinar tipo de cambio según la moneda seleccionada
        const safeRate  = currCode === this.mainCurncy ? data?.sysRate ?? 0 : data?.rate ?? 0;
        // Tipo de cambio del sistema
        this.sysRate    = data?.sysRate ?? 0;

        const formattedRate = this.utilService.onRedondearDecimalConCero(safeRate, 3);

        this.modeloFormSoc.patchValue({ docRate: formattedRate }, { emitEvent: false });
      }),

      catchError((e) => {
        this.utilService.handleErrorSingle(e, 'loadTipoCambio', () => { this.isDisplay = false; }, this.swaCustomService);
        return of(null);
      }),

      finalize(() => { this.isDisplay = false; })
    );
  }

  valTipoCambio() {
    const selected  : any     = this.modeloFormSoc.controls['docCur']?.value;
    const rate      : number  = Number(this.modeloFormSoc.controls['docRate'].value) || 0;

    if (!selected) return;

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

  onChangeCurrency(event?: any) {
    const selected = event?.value ?? null;

    if (!selected) return;

    this.currency = selected?.value;

    // Pasar la moneda actual como fuente de verdad y, una vez cargado el tipo de cambio,
    // refrescar cada artículo del modeloLines que ya tenga itemCode.
    this.loadTipoCambio(this.currency)
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      for (let index = 0; index < this.modeloLines.length; index++) {
        if (this.modeloLines[index].itemCode) {
          this.getListByCode(this.modeloLines[index].itemCode, index);
        }
      }
    });
  }

  onChangeShipAddress(event?: any) {
    const selected = event?.value ?? null;
    if (!selected) return;
    const address = selected.value.address;

    // loadAddress ahora devuelve Observable; suscribirse para ejecutar y aplicar resultado
    this.loadAddress(this.cardCode, address, 'S')
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (street: string | null) => {
        if (street !== null && street !== undefined) {
          // aplicar el valor devuelto en el punto donde se captura
          this.modeloFormLog.patchValue({ address2: street }, { emitEvent: false });
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onChangeShipAddress', () => {}, this.swaCustomService);
      }
    });
  }

  onChangePayAddress(event?: any) {
    const selected = event?.value ?? null;
    if (!selected) return;
    const address = selected.value.address;

    // loadAddress ahora devuelve Observable; suscribirse para ejecutar y aplicar resultado
    this.loadAddress(this.cardCode, address, 'B')
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (street: string | null) => {
        if (street !== null && street !== undefined) {
          // aplicar el valor devuelto en el punto donde se captura
          this.modeloFormLog.patchValue({ address: street }, { emitEvent: false });
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onChangePayAddress', () => {}, this.swaCustomService);
      }
    });
  }

  private loadAddress(cardCode: string, address: string, adresType: string): Observable<string | null> {
    const params = { cardCode: cardCode, address: address, adresType: adresType };
    this.isDisplay = true;
    return this.direccionService.getByCode(params)
      .pipe(
        takeUntil(this.destroy$),
        map((data: IDireccion) => data?.street ?? null),
        catchError((e) => {
          this.utilService.handleErrorSingle(e, 'loadPayAddress', () => { this.isDisplay = false; }, this.swaCustomService);
          return of(null);
        }),
        finalize(() => { this.isDisplay = false; })
      );
  }

  blurDocRate(): void {
    this.utilService.formatNumericFormControl(this.modeloFormSoc, 'docRate', 3);
  }
  //#endregion


  //#region <<< CONTENIDO >>>
  /** Maneja cambios en el tipo de documento; limpia líneas si hay con confirmación */
  onChangeDocType(): void {
    const docTyp   = this.modeloFormCon.get('docType')?.value;
    const hasLines = this.modeloLines.filter(n => n.dscription.trim() !== '').length > 0;

    // 🔹 Caso 1: NO hay líneas → no preguntar
    if (!hasLines) {
      this.docTypeSelected = docTyp;
      this.docTypePrevious = docTyp;
      this.onBuildColumn();
      this.updateHasValidLines();
      return;
    }

    // 🔹 Caso 2: Hay líneas → preguntar
    this.swaCustomService.swaConfirmation(
    this.globalConstants.titleCerrar,
    this.globalConstants.subTitleCerrar,
    this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        // ✅ Acepta el cambio
        this.modeloLines = [];
        this.addLine(0);
        this.onBuildColumn();
        this.docTypeSelected = docTyp;

        // guarda el nuevo valor como anterior
        this.docTypePrevious = docTyp;

        this.updateHasValidLines();
      }
      else {
        // ❌ Rechaza el cambio → volver al valor anterior
        this.modeloFormCon.get('docType')?.setValue(this.docTypePrevious, { emitEvent: false });

        this.updateHasValidLines();
      }
    });
  }

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
      u_tipoOpT12       : '',
      u_tipoOpT12Nam    : '',
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
    Object.assign(this.modeloLines[index], {
      itemCode       : data.itemCode,
      dscription     : data.itemName,
      whsCode        : data.dfltWH,
      unitMsr        : data.salUnitMsr,
      onHand         : data.onHand,
      quantity       : data.quantity,
      openQty        : data.openQty,
      currency       : data.currency,
      priceBefDi     : data.priceBefDi,
      discPrcnt      : data.discPrcnt || 0,
      price          : data.price,
      taxCode        : data.taxCode,
      u_tipoOpT12    : data.u_tipoOpT12,
      u_tipoOpT12Nam : data.u_tipoOpT12Nam,
      vatPrcnt       : data.vatPrcnt,
      vatSum         : data.vatSum,
      lineTotal      : data.lineTotal
    });

    this.updateHasValidLines();
    this.detectRealChanges(); // 🔥 OBLIGATORIO
  }

  getListByCode(itemCode: string, index: number): void {
    this.isDisplay = true;

    const formValue = this.modeloFormSal.getRawValue();

    const params = {
      itemCode,
      cardCode          : this.modeloFormSoc.get('cardCode')?.value,
      currency          : this.currency,
      slpCode           : formValue.salesEmployees?.value || formValue.salesEmployees || '',
      codTipoOperacion  : '01'
    };

    this.articuloService.getListByCode(params)
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
        this.calculateTotals();
      },
      error: (e) => {
        this.swaCustomService.swaMsgError(e?.error?.resultadoDescripcion ?? 'Error al obtener el artículo');
      }
    });
  }

  /** Abre el modal para seleccionar cuenta contable de la línea indicada */
  onOpenCuentaContable(index: number): void {
    // Abre modal para seleccionar cuenta contable de la línea
    this.indexCentroCuentaContable  = index;
    this.isVisualizarCuentaContable = !this.isVisualizarCuentaContable;
  }
  /** Maneja la selección de una cuenta contable desde el modal */
  onSelectedCuentaContable(value: any): void {
    // Aplica el centro de costo seleccionado a la línea actual
    const currentLine               = this.modeloLines[this.indexCentroCuentaContable];
    currentLine.acctCode            = value.acctCode;
    currentLine.formatCode          = value.formatCode;
    currentLine.acctName            = value.acctName;
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

  onChangeQuantity(value: IOrdenVenta1, index: number)
  {
    this.calculateTotalLine(value, index);
  }

  onChangePrice(value: IOrdenVenta1, index: number)
  {
    this.calculateTotalLine(value, index);
  }

  onChangeDiscPrcnt(value: IOrdenVenta1, index: number)
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

  calculateTotalLine(value: IOrdenVenta1, index: number): void {
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

  onClickCloseArticulo()
  {
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  onDescChange() {
    this.updateHasValidLines();
  }

  onClickOpenImpuesto(index: number) {
    this.indexImpuesto = index;
    this.isVisualizarImpuesto = !this.isVisualizarImpuesto;
  }

  onClickSelectedImpuesto(value: IImpuestoSap) {
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
    return this.socioNegocioService.getByCode(cardCode).pipe(
      takeUntil(this.destroy$),
      tap(agencia => {
        this.u_BPP_MDCT    = agencia.cardCode;
        this.modeloFormAge.patchValue({ 'u_BPP_MDCT': agencia.cardCode, 'u_BPP_MDRT': agencia.licTradNum, 'u_BPP_MDNT': agencia.cardName }, { emitEvent: false });
      }),
      map((agencia: ISocioNegocio) => ({
        agencia,
        shipAddr: agencia.shipAddressList ?? []
      })),
      // Actualizamos listas y preselecciones sin disparar eventos
      tap(({ shipAddr, agencia }) => {
        this.agencyAddressList = (shipAddr || []).map(d => ({ label: d.address, value: d }));

        // Selección por defecto de direcciones y otros campos
        const defaultShipItem = this.agencyAddressList.find(it => (it.value as IDireccion).address === agencia.shipToDef) || null;
        if (defaultShipItem) {
          this.modeloFormAge.patchValue({ agencyAddress: defaultShipItem }, { emitEvent: false });
        }
      }),
      // Encadenar las cargas dependientes y esperar a que terminen
      switchMap(({ shipAddr, agencia }) => {
        debugger;
        const tasks: Observable<any>[] = [];

        const defaultShip = (shipAddr || []).find((d: IDireccion) => d.address === agencia.shipToDef);
        if (defaultShip) {
          tasks.push(
            this.loadAddress(agencia.cardCode, agencia.shipToDef, 'S').pipe(
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
        this.utilService.handleErrorSingle(e, 'loadAgenciaByCode', () => { this.isDisplay = false; }, this.swaCustomService);
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
      next: (street: string | null) => {
        if (street !== null && street !== undefined) {
          // aplicar el valor devuelto en el punto donde se captura
          this.modeloFormAge.patchValue({ u_BPP_MDDT: street }, { emitEvent: false });
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onChangeAgencyAddress', () => {}, this.swaCustomService);
      }
    });
  }

  //#endregion


  //#region << EXPORTACIÓN >>>

  blurValorFlete(): void {
    this.utilService.formatNumericFormControl(this.modeloFormExp, 'u_ValorFlete', 0);
  }
  blurTotalFlete(): void {
    this.utilService.formatNumericFormControl(this.modeloFormExp, 'u_FIB_TFLETE', 2);
  }
  blurImporteSeguro(): void {
    this.utilService.formatNumericFormControl(this.modeloFormExp, 'u_FIB_IMPSEG', 2);
  }

  //#endregion


  //#region <<< TOTALES >>>

  blurSubTotal(): void {
    this.utilService.formatNumericFormControl(this.modeloFormTot, 'subTotal', 2);
  }
  blurDiscPrcnt(): void {
    this.utilService.formatNumericFormControl(this.modeloFormTot, 'discPrcnt', 2);
  }
  blurDiscSum(): void {
    this.utilService.formatNumericFormControl(this.modeloFormTot, 'discSum', 2);
  }
  blurVatSum(): void {
    this.utilService.formatNumericFormControl(this.modeloFormTot, 'vatSum', 2);
  }
  blurDocTotal(): void {
    this.utilService.formatNumericFormControl(this.modeloFormTot, 'docTotal', 2);
  }

  private wireDiscountControls(): void {
    const prcntCtrl = this.modeloFormTot.get('discPrcnt');
    const sumCtrl   = this.modeloFormTot.get('discSum');

    if (!prcntCtrl || !sumCtrl) return;

    // Cuando cambia %Dto -> recalcula Descuento
    prcntCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const subTotal  = this.toNumber(this.modeloFormTot.get('subTotal')?.value);
        let discPrcnt   = this.toNumber(prcntCtrl.value);

        if (discPrcnt < 0) discPrcnt = 0;
        if (discPrcnt > 100) discPrcnt = 100;

        const discSum = this.roundDecimal(subTotal * (discPrcnt / 100), 2);

        sumCtrl.patchValue(this.utilService.onRedondearDecimalConCero(discSum, 2), { emitEvent: false });
        this.calculateTotals();
      });

    // Cuando cambia Descuento -> recalcula %Dto
    sumCtrl.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        const subTotal = this.toNumber(this.modeloFormTot.get('subTotal')?.value);
        const discSum  = this.toNumber(sumCtrl.value);

        let discPrcnt = 0;
        if (subTotal > 0) discPrcnt = (discSum / subTotal) * 100;

        discPrcnt = this.roundDecimal(discPrcnt, 2);
        if (discPrcnt < 0) discPrcnt = 0;
        if (discPrcnt > 100) discPrcnt = 100;

        prcntCtrl.patchValue(this.utilService.onRedondearDecimalConCero(discPrcnt, 2), { emitEvent: false });
        this.calculateTotals();
      });
  }

  calculateTotals(): void {
    const docTypeValue = this.modeloFormCon.get('docType')?.value?.value;
    const isItemDoc    = docTypeValue === 'I';

    // 1) SubTotal (suma lineTotal)
    let subTotal = 0;
    for (const line of this.modeloLines) {
      const hasData = isItemDoc
        ? !!String(line.itemCode ?? '').trim()
        : !!String(line.dscription ?? '').trim();

      if (hasData) subTotal += (Number(line.lineTotal) || 0);
    }
    subTotal = this.utilService.onRedondearDecimal(subTotal, 2);

    // 2) Descuento global
    const discPrcnt   = this.toNumber(this.modeloFormTot.get('discPrcnt')?.value); // ej: 17.11
    const factorExact = (1 - (discPrcnt / 100));                                  // 0.8289
    const factorLine  = this.utilService.onRedondearDecimal(factorExact, 3);       // 0.829 (SAP)
    const discSum     = this.utilService.onRedondearDecimal(subTotal * (discPrcnt / 100), 2);

    // 3) IGV por línea (SAP)
    let sumLineVat   = 0;   // suma IGV redondeado por línea
    let rawVatDocTot = 0;   // IGV doc calculado con factorExact (sin cortar en líneas)

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

      // A) IGV de línea sin dto doc (SAP redondea a 2)
      const vatLine0 = this.utilService.onRedondearDecimal((lineTotal * vatPrcnt) / 100, 2);

      // B) Aplicar dto documento con factorLine (3 decimales)
      const rawVatLine = vatLine0 * factorLine;
      const vatLine    = this.utilService.onRedondearDecimal(rawVatLine, 2);

      line.vatSum = vatLine;
      sumLineVat += vatLine;

      // C) IGV documento con factorExact (preciso)
      rawVatDocTot += ((lineTotal * factorExact) * vatPrcnt) / 100;

      taxableIdx.push(i);
    }

    // IGV total del documento (SAP)
    const vatSumDoc = this.utilService.onRedondearDecimal(rawVatDocTot, 2);

    // 4) Ajuste de centavos: SAP suele ajustar desde la última línea
    let diffCents = Math.round((vatSumDoc - sumLineVat) * 100);

    if (diffCents !== 0 && taxableIdx.length > 0) {
      let k = taxableIdx.length - 1; // última línea primero

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

    // 6) Reflejar en el formulario
    this.modeloFormTot.patchValue({
      subTotal : this.utilService.onRedondearDecimalConCero(subTotal, 2),
      discSum  : this.utilService.onRedondearDecimalConCero(discSum, 2),
      vatSum   : this.utilService.onRedondearDecimalConCero(vatSumDoc, 2),
      docTotal : this.utilService.onRedondearDecimalConCero(docTotal, 2),
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

    let line: number = 0;
    for (let index = 0; index < this.modeloLines.length; index++) {
      if(this.modeloLines[index].itemCode)
      {
        line++;
      }
    }

    if(line === 0)
    {
      return showError('El detalle debe tener al menos un articulo.');
    }


    for (let index = 0; index < this.modeloLines.length; index++) {
      if(this.modeloLines[index].itemCode)
      {
        if (this.modeloLines[index].whsCode === '')
        {
          return showError('Seleccion el almacén para el artículo en la línea ' + (index + 1) + '.');
        }
        if (this.modeloLines[index].u_tipoOpT12 === '')
        {
          return showError('Seleccion el tipo de operación para el artículo en la línea ' + (index + 1) + '.');
        }
        if (this.modeloLines[index].taxCode === '')
        {
          return showError('Seleccion el impuesto para el artículo en la línea ' + (index + 1) + '.');
        }
        if (this.modeloLines[index].quantity === 0)
        {
          return showError('La cantidad debe ser mayor que CERO (0) en la línea ' + (index + 1) + '.');
        }
        if (this.modeloLines[index].priceBefDi === 0)
        {
          return showError('El precio debe ser mayor que CERO (0) en la línea ' + (index + 1) + '.');
        }
      }
    }

    return true;
  }

  private buildModelToSave(): OrdenVentaCreateModel {
    /** Construye el modelo de solicitud de traslado para enviar al backend */
    const formValues = {
      ...this.modeloFormSoc.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormLog.getRawValue(),
      ...this.modeloFormFin.getRawValue(),
      ...this.modeloFormAge.getRawValue(),
      ...this.modeloFormExp.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormCon.getRawValue(),
      ...this.modeloFormSal.getRawValue(),
      ...this.modeloFormTot.getRawValue(),
    };

    const userId  = this.userContextService.getIdUsuario();
    const docCur  = formValues.docCur?.value || formValues.docCur || '';
    const docType = formValues.docType?.value || formValues.docType || '';

    debugger;

    return {
      ...new OrdenVentaCreateModel(),
      docDate             : this.utilService.normalizeDate(formValues.docDate),
      docDueDate          : this.utilService.normalizeDate(formValues.docDueDate),
      taxDate             : this.utilService.normalizeDate(formValues.taxDate),
      docType             : docType,

      u_FIB_DocStPkg      : 'O',
      u_FIB_IsPkg         : docType === 'I' ? 'Y' : 'N',

      cardCode            : formValues.cardCode,
      cardName            : formValues.cardName,
      cntctCode           : formValues.cntctCode || 0,
      docCur              : docCur,
      docRate             : docCur === this.mainCurncy ? 1 : Number(formValues.docRate) || 0,
      numAtCard           : formValues.numAtCard,

      shipToCode          : formValues.shipAddress?.label || formValues.shipAddress || '',
      address2            : formValues.address2,
      payToCode           : formValues.payAddress?.label || formValues.payAddress || '',
      address             : formValues.address,

      groupNum            : formValues.paymentsTermsTypes?.value || formValues.paymentsTermsTypes || 0,

      u_BPP_MDCT          : this.u_BPP_MDCT,
      u_BPP_MDRT          : formValues.u_BPP_MDRT,
      u_BPP_MDNT          : formValues.u_BPP_MDNT,
      u_FIB_AgencyToCode  : formValues.agencyAddress?.label || formValues.agencyAddress || '',
      u_BPP_MDDT          : formValues.u_BPP_MDDT,

      u_TipoFlete         : formValues.freightType?.value || formValues.freightType || '',
      u_ValorFlete        : Number(formValues.u_ValorFlete) || 0,
      u_FIB_TFLETE        : Number(String(formValues.u_FIB_TFLETE).replace(/,/g, '').trim() || 0),
      u_FIB_IMPSEG        : Number(String(formValues.u_FIB_IMPSEG).replace(/,/g, '').trim() || 0),
      u_FIB_PUERTO        : formValues.u_FIB_PUERTO,

      u_STR_TVENTA        : formValues.salesType.value || formValues.salesType || '',

      slpCode             : formValues.salesEmployees?.value || formValues.salesEmployees || -1,
      u_OrdenCompra       : formValues.u_OrdenCompra,
      comments            : formValues.comments,

      discPrcnt           : Number(formValues.discPrcnt) || 0,
      discSum             : Number(String(formValues.discSum).replace(/,/g, '').trim() || 0),
      vatSum              : Number(String(formValues.vatSum).replace(/,/g, '').trim() || 0),
      docTotal            : Number(String(formValues.docTotal).replace(/,/g, '').trim() || 0),

      u_UsrCreate         : userId,
      lines               : this.modeloLines
      .filter(line => line.itemCode !== '')
      .map(line => ({
        itemCode          : line.itemCode,
        dscription        : line.dscription,
        whsCode           : line.whsCode,
        unitMsr           : line.unitMsr,
        quantity          : line.quantity,
        u_FIB_OpQtyPkg    : line.u_FIB_OpQtyPkg,
        currency          : line.currency,
        priceBefDi        : line.priceBefDi,
        discPrcnt         : line.discPrcnt,
        price             : line.price,
        taxCode           : line.taxCode,
        vatPrcnt          : line.vatPrcnt,
        vatSum            : line.vatSum,
        u_tipoOpT12       : line.u_tipoOpT12,
        lineTotal         : line.lineTotal,
      }))
    };
  }

  onToSave() {
    if(!this.validatedSave()) return;

    this.isSaving = true;

    const modeloToSave = this.buildModelToSave();

    this.ordenVentaService.setCreate(modeloToSave)
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
        this.utilService.handleErrorSingle(e, 'save', () => { this.isSaving = false; }, this.swaCustomService);
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
    this.router.navigate(['/main/modulo-ven/panel-orden-venta-list']);
  }
}
