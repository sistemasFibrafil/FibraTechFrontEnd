import { SelectItem } from 'primeng/api';
import { Subject, forkJoin } from 'rxjs';
import { NavigationStart, Router } from '@angular/router';
import { filter, finalize, takeUntil } from 'rxjs/operators';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { StockTransferPickingUpdateModel } from 'src/app/modulos/modulo-inventario/models/picking.model';
import { StockTransfers1CreateModel, StockTransfersCreateModel } from 'src/app/modulos/modulo-inventario/models/stock-transfers.model';

import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IPicking } from 'src/app/modulos/modulo-inventario/interfaces/picking.inteface';
import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/items.interface';
import { ITransferenciaStock1 } from 'src/app/modulos/modulo-inventario/interfaces/stock-transfers.interface';
import { IInventoryTransferRequest } from 'src/app/modulos/modulo-inventario/interfaces/inventory-transfer-request.interface';
import { IDocumentNumberingSeriesSunat, IDocumentNumberingSeriesSunatQuery } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { ItemsService } from 'src/app/modulos/modulo-inventario/services/items.service';
import { StockTransfersService } from 'src/app/modulos/modulo-inventario/services/stock-transfers.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { DocumentTypeSunatService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-type-sunat.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';
import { DocumentNumberingSeriesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series.service';
import { DocumentNumberingSeriesSunatService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/inicializacion-sistema/document-numbering-series-sunat.service';


@Component({
  selector: 'app-inv-panel-transferencia-stock-create',
  templateUrl: './panel-transferencia-stock-create.component.html',
  styleUrls: ['./panel-transferencia-stock-create.component.css']
})
export class PanelPanelTransferenciaStockCreateComponent implements OnInit, OnDestroy {
  // Lifecycle management
  /** Gestión de ciclo de vida y carga inicial */
  private readonly destroy$                     = new Subject<void>();
  isLoadingInitialData                          = false;

  // Forms
  /** Formularios reactivos de la vista */
  modeloFormSn                                  : FormGroup;
  modeloFormDoc                                 : FormGroup;
  modeloFormTra                                 : FormGroup;
  modeloFormOtr                                 : FormGroup;
  modeloFormPie                                 : FormGroup;
  modeloFormCod                                 : FormGroup;

  // Configuration
  /** Configuración general y constantes */
  readonly titulo                               = 'Transferencia de Stock';
  readonly jrnlMemo                             = 'Traslado - ';
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // Combos
  /** Listas de soporte para dropdowns */
  warehouseList                                 : SelectItem[] = [];
  outputTypeList                                : SelectItem[] = [];
  transferTypeList                              : SelectItem[] = [];
  typeTransportList                             : SelectItem[] = [];
  reasonTransferList                            : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];
  documentTypeSunatList                         : SelectItem[] = [];
  typeCarrierIdentityDocumentList               : SelectItem[] = [];
  typeDriversIdentityDocumentList               : SelectItem[] = [];
  typeIdentityDocumentTransportList             : SelectItem[] = [];

  // UI State
  /** Estados de overlays y modales */
  isSaving                                      = false;
  isDisplay                                     = false;
  isVisualizarBarcode                           = false;
  isVisualizarArticulo                          = false;
  isVisualizarTipoOperacion                     = false;
  isVisualizarAlmacenOrigen                     = false;
  isVisualizarAlmacenDestino                    = false;




  // Número de documento
  /** Numeración y flags de documento */
  idUsuario                                     : number = 0;

  u_BPP_NDTD                                    : string = '';
  u_BPP_NDSD                                    : string = '';
  u_BPP_MDVC                                    : string = '';
  u_FIB_COD_TRA                                 : string = '';
  u_FIB_NUMDOC_COD                              : string = '';

  // Data
  /** Modelos y datos del documento */
  cardCode                                      = '';
  cntctCode                                     = 0;
  itemCode                                      = '';
  indexArticulo                                 = 0;
  indexTipoOperacion                            = 0;
  indexAlmacenOrigen                            = 0;
  indexAlmacenDestino                           = 0;
  inactiveAlmacenItem                           = 'N';
  demandanteAlmacenItem                         = 'Y';

  opciones                                      : MenuItem[];
  columnas                                      : TableColumn[];
  columnasModal                                 : TableColumn[];

  modeloSelected                                : ITransferenciaStock1;

  modeloLines                                   : ITransferenciaStock1[] = [];
  modeloPickingLines                            : IPicking[] = [];
  modeloPickingOriginalLines                    : IPicking[] = [];


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly ItemsService: ItemsService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly stockTransfersService: StockTransfersService,
    private readonly documentTypeSunatService: DocumentTypeSunatService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    private readonly documentNumberingSeriesService: DocumentNumberingSeriesService,
    private readonly DocumentNumberingSeriesSunatService: DocumentNumberingSeriesSunatService,
    public  readonly utilService: UtilService,
  ) {}

  // ===========================
  // 1. Lifecycle Hooks
  // ===========================
  ngOnInit(): void {
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
    // Construir formularios y configuración básica
    this.buildForms();
    this.buildColumns();
    this.buildTableOptions();
    this.initializeBlur();

    // Cargar todos los combos en paralelo y esperar a que todos terminen
    this.loadAllCombos();
  }

  private initializeBlur(): void {
    this.blurNBultos();
    this.blurPesoKg();
  }

  // ===========================
  // 3. Form Building
  // ===========================
  private buildForms(): void {
    this.modeloFormSn = this.fb.group({
      cardCode                : [{ value: '', disabled: true }],
      cardName                : [{ value: '', disabled: true }],
      cntctCode               : [{ value: '', disabled: true }],
      address                 : [{ value: '', disabled: true }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: false }],
      u_BPP_MDTD              : ['', Validators.required],
      u_BPP_MDSD              : ['', Validators.required],
      u_BPP_MDCD              : [{ value: '', disabled: false }, Validators.required],
      docDate                 : [new Date(), Validators.required],
      taxDate                 : [new Date(), Validators.required],
      filler                  : ['', Validators.required],
      toWhsCode               : ['', Validators.required]
    });

    this.modeloFormTra = this.fb.group({
      typeTransport               : [{ value: '', disabled: false }],
      u_FIB_COD_TRA               : [{ value: '', disabled: false }],
      typeCarrierIdentityDocument : [{ value: '', disabled: false }],
      u_BPP_MDRT                  : [{ value: '', disabled: false }],
      u_BPP_MDNT                  : [{ value: '', disabled: false }],
      u_BPP_MDVC                  : [{ value: '', disabled: false }],

      typeDriversIdentityDocument : [{ value: '', disabled: false }],
      u_FIB_NUMDOC_COD            : [{ value: '', disabled: false }],
      u_FIB_NOM_COND              : [{ value: '', disabled: false }],
      u_FIB_APE_COND              : [{ value: '', disabled: false }],
      u_BPP_MDFN                  : [{ value: '', disabled: true }],
      u_BPP_MDFC                  : [{ value: '', disabled: false }]
    });

    this.modeloFormOtr = this.fb.group({
      transferType              : [{ value: '', disabled: false }, [Validators.required]],
      reasonTransfer            : [{ value: '', disabled: false }, [Validators.required]],
      outputType                : [{ value: '', disabled: false }, [Validators.required]]
    });

    this.modeloFormPie = this.fb.group({
      slpCode                 : ['', Validators.required],
      u_FIB_NBULTOS           : ['0'],
      u_FIB_KG                : ['0'],
      jrnlMemo                : [this.jrnlMemo],
      comments                : ['']
    });

    this.modeloFormCod = this.fb.group({
      u_CodeBar               : ['']
    });
  }

  private buildColumns(): void {
    this.columnas =
    [
      { field: 'itemCode',        header: 'Código' },
      { field: 'itemName',        header: 'Descripción' },
      { field: 'fromWhsCod',      header: 'De almacén' },
      { field: 'whsCode',         header: 'Almacén destino' },
      { field: 'u_tipoOpT12Nam',  header: 'Tipo operación' },
      { field: 'unitMsr',         header: 'UM' },
      { field: 'u_FIB_NBulto',    header: 'N° bulto' },
      { field: 'u_FIB_PesoKg',    header: 'Kg' },
      { field: 'quantity',        header: 'Cantidad' }
    ];
    this.columnasModal =
    [
      { field: 'u_ItemCode',      header: 'Código' },
      { field: 'u_CodeBar',       header: 'Barcode' },
      { field: 'u_unitMsr',       header: 'UM' },
      { field: 'u_WeightKg',      header: 'Kg' },
      { field: 'u_Quantity',      header: 'Cantidad' },
    ];
  }

  private buildTableOptions(): void {
    this.opciones = [
      { value: '1', label: 'Ver',             icon: 'pi pi-eye',       command: () => this.onClickView() },
      { value: '2', label: 'Borrar línea',    icon: 'pi pi-times',     command: () => this.onClickDelete() },
    ];
  }

  // ===========================
  // 4. Data Loading
  // ===========================
  private loadAllCombos(): void {
    this.idUsuario                            = this.userContextService.getIdUsuario();
    const paramWarehouses                     : any = { inactive: 'N' };
    const paramOutputType                     : any = { tableID: 'OWTR', aliasID: 'BPP_MDTS' };
    const paramTransferType                   : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRAS' };
    const paramTypeTransport                  : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRANS' };
    const paramReasonTransfer                 : any = { tableID: 'OWTR', aliasID: 'BPP_MDMT' };
    const paramDocumentTypeSunat              : any = { u_FIB_ENTR: '', u_FIB_FAVE: '', u_FIB_TRAN: 'Y' };
    const paramDocumentNumberingSeries        : any = { objectCode: '67', docSubType: '--' };
    const paramTypeDriverIdentityDocument     : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_COND' };
    const paramTypeCarrierIdentityDocument    : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_TRA' };
    const paramTypeIdentityDocumentTransport  : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_TRA' };

    // Mostrar spinner mientras se cargan los combos
    this.isDisplay = true;

    forkJoin({
      warehouses                      : this.warehousesService.getListByInactive(paramWarehouses),
      outputType                      : this.camposDefinidoUsuarioService.getList(paramOutputType),
      transferType                    : this.camposDefinidoUsuarioService.getList(paramTransferType),
      typeTransport                   : this.camposDefinidoUsuarioService.getList(paramTypeTransport),
      reasonTransfer                  : this.camposDefinidoUsuarioService.getList(paramReasonTransfer),
      salesEmployees                  : this.salesPersonsService.getList(),
      documentTypeSunat               : this.documentTypeSunatService.getListByType(paramDocumentTypeSunat),
      documentNumberingSeries         : this.documentNumberingSeriesService.getNumero(paramDocumentNumberingSeries),
      typeDriverIdentityDocument      : this.camposDefinidoUsuarioService.getList(paramTypeDriverIdentityDocument),
      typeCarrierIdentityDocument     : this.camposDefinidoUsuarioService.getList(paramTypeCarrierIdentityDocument),
      typeIdentityDocumentTransport   : this.camposDefinidoUsuarioService.getList(paramTypeIdentityDocumentTransport),
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {
        //this.modeloFormDoc.patchValue({ docNum: res.documentNumberingSeries.nextNumber });
        this.modeloFormDoc.patchValue({ docNum: res.documentNumberingSeries.nextNumber }, { emitEvent: false });

        this.warehouseList = (res.warehouses || []).map(item => ({ label: item.fullDescr, value: item.whsCode }));
        this.outputTypeList = (res.outputType || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.transferTypeList = (res.transferType || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.typeTransportList = (res.typeTransport || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.reasonTransferList = (res.reasonTransfer || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.salesEmployeesList = (res.salesEmployees || []).map(item => ({ label: item.slpName, value: item.slpCode }));
        this.documentTypeSunatList = (res.documentTypeSunat || []).map(item => ({ label: item.u_BPP_TDDD, value: item.u_BPP_TDTD }));
        this.typeDriversIdentityDocumentList = (res.typeDriverIdentityDocument || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.typeCarrierIdentityDocumentList = (res.typeCarrierIdentityDocument || []).map(item => ({ label: item.descr, value: item.fldValue }));
        this.typeIdentityDocumentTransportList = (res.typeIdentityDocumentTransport || []).map(item => ({ label: item.descr, value: item.fldValue }));


        const defaultTipoDoc = res.documentTypeSunat.find(item => item.u_BPP_TDTD === '09');
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

        const defaultTipoTraslado = res.transferType.find(item => item.fldValue === '01');
        if (defaultTipoTraslado) {
          this.modeloFormOtr.get('transferType').setValue({
            label: defaultTipoTraslado.descr,
            value: defaultTipoTraslado.fldValue
          });
        }

        const defaultMotivo = res.reasonTransfer.find(item => item.fldValue === '04');
        if (defaultMotivo) {
          this.modeloFormOtr.get('reasonTransfer').setValue({
            label: defaultMotivo.descr,
            value: defaultMotivo.fldValue
          });
        }

        const defaultTipoSalida = res.outputType.find(item => item.fldValue === 'TSI');
        if (defaultTipoSalida) {
          this.modeloFormOtr.get('outputType').setValue({
            label: defaultTipoSalida.descr,
            value: defaultTipoSalida.fldValue
          });
        }

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
    let solicitud = history.state?.solicitud;

    if (!solicitud) {
      const cache = sessionStorage.getItem('SolicitudCopyTo');
      solicitud = cache ? JSON.parse(cache) : null;
    }

    if (!solicitud) {
      this.swaCustomService.swaMsgInfo('La información de trasferencia se perdió. Vuelva a iniciar el proceso.');
      this.onClickBack();
      return;
    }

    this.setFormValues(solicitud);
  }

  private setFormValues(value: IInventoryTransferRequest): void {
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.cardCode                 = value.cardCode;
    this.cntctCode                = value.cntctCode;

    // Actualizar formulario Socio de Negocio
    this.modeloFormSn.patchValue(
      {
        cardCode                  : value.cardCode,
        cardName                  : value.cardName,
        cntctCode                 : value.cntctCode,
        address                   : value.address
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para los dropdowns de Almacenes
    const fillerItem              = this.warehouseList.find(item => item.value === value.filler);
    const toWhsCodeItem           = this.warehouseList.find(item => item.value === value.toWhsCode);

    // Actualizar formulario Cab2 (contiene fechas y almacenes)
    this.modeloFormDoc.patchValue(
      {
        filler                    : fillerItem || null,
        toWhsCode                 : toWhsCodeItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valores como SelectItem para campos definidos por usuario
    const tipoTrasladoItem        = this.transferTypeList.find(item => item.value === value.u_FIB_TIP_TRAS);
    const motivoTrasladoItem      = this.reasonTransferList.find(item => item.value === value.u_BPP_MDMT);
    const tipoSalidaItem          = this.outputTypeList.find(item => item.value === value.u_BPP_MDTS);

    // Actualizar formulario Otros
    this.modeloFormOtr.patchValue(
      {
        transferType              : tipoTrasladoItem || null,
        reasonTransfer            : motivoTrasladoItem || null,
        outputType                : tipoSalidaItem || null
      },
      { emitEvent: false }
    );

    // Buscar y asignar valor como SelectItem para empleado de ventas
    const slpCodeItem             = this.salesEmployeesList.find(item => item.value === value.slpCode);

    // Actualizar formulario Pie
    this.modeloFormPie.patchValue(
      {
        slpCode                   : slpCodeItem || null
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar detalle después de que los formularios estén actualizados
    // =========================================================================
    // Esto garantiza que los eventos onChange no sobrescriban los valores originales del detalle

    // Cargar modeloLines con los valores originales
    this.modeloLines = value.lines.map(line => ({
      baseType                    : line.baseType,
      baseEntry                   : line.baseEntry,
      baseLine                    : line.baseLine,
      u_FIB_FromPkg               : line.u_FIB_FromPkg,
      itemCode                    : line.itemCode,
      dscription                  : line.dscription,
      fromWhsCod                  : line.fromWhsCod,
      whsCode                     : line.whsCode,
      u_tipoOpT12                 : line.u_tipoOpT12,
      u_tipoOpT12Nam              : line.u_tipoOpT12Nam,
      unitMsr                     : line.unitMsr,
      u_FIB_NBulto                : line.u_FIB_NBulto,
      u_FIB_PesoKg                : line.u_FIB_PesoKg,
      quantity                    : line.quantity,
      openQty                     : line.openQty,
    }));

    //this.modeloLines = value.lines.map(line => ({ ...line }));

    // Calcular totales basados en los valores originales
    this.getTotalBulto(this.modeloLines);
    this.getTotalKilo(this.modeloLines);

    // Cargar picking lines
    this.modeloPickingOriginalLines = value.pickingLines.map(line => ({ ...line }));
    this.isLoadingInitialData = false;
  }

  // ===========================
  // 5. Form Events & Selection Handlers
  // ===========================
  onSelectedItem(modelo: ITransferenciaStock1): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  private updateMenuVisibility(modelo: ITransferenciaStock1): void {
    const viewOption = this.opciones.find(x => x.label === "Ver");
    const deleteOption = this.opciones.find(x => x.label === "Borrar línea");

    if (viewOption) {
      viewOption.visible = modelo.itemCode === '' || modelo.u_FIB_FromPkg === 'Y';
    }

    if (deleteOption) {
      deleteOption.visible = modelo.itemCode !== '';
    }
  }

  onSelectedSocioNegocio(value: any): void {
    this.cardCode = value.cardCode;
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({
      'cardCode': value.cardCode,
      'cardName': value.cardName,
      'address': value.address2,
      'cntctCode': value.cntctCode
    });

    const jrnlMemoNew: string = this.jrnlMemo + this.cardCode;
    this.modeloFormPie.patchValue({ 'jrnlMemo' :  jrnlMemoNew });
  }

  onSelectedPersonaContacto(value: any): void {
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({ 'cntctCode' : value.cntctCode });
  }

  // Tipo y Serie de Documento
  onChangeTipoDocumento(event: any): void {
    if (event.value) {
      this.u_BPP_NDTD = event.value.value || event.value;
      const serDocumentoControl = this.modeloFormDoc.controls['u_BPP_MDSD'].value;
      const u_BPP_NDSD = serDocumentoControl?.value || serDocumentoControl;

      if (u_BPP_NDSD) {
        this.getNumeroDocumentoByTipoSerie(this.u_BPP_NDTD, u_BPP_NDSD);
      } else {
        this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': '' });
      }
    } else {
      this.u_BPP_NDTD = '';
      this.u_BPP_NDSD = '';
      this.modeloFormDoc.patchValue({ 'u_BPP_MDSD': '','u_BPP_MDCD': '' });
    }
  }

  onSelectedSerieDocumento(value: any): void {
    if(value) {
      this.modeloFormDoc.patchValue({
        'u_BPP_MDSD': value.u_BPP_NDSD,
        'u_BPP_MDCD': value.u_BPP_NDCD
      }, { emitEvent: false });
    }
  }

  private getListSerieDocumento(u_BPP_NDTD: string): void {
    const params = {
      idUsuario: this.userContextService.getIdUsuario(),
      u_BPP_NDTD,
      u_BPP_NDCD: '',
      u_Delivery: '',
      u_SalesInvoices: '',
      u_Transfer: 'Y'
    };

    this.DocumentNumberingSeriesSunatService.getListSerieDocumento(params)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: IDocumentNumberingSeriesSunatQuery[]) => {

        if (!data?.length) return;

        const defaultSerieDoc = data.find(x => x.u_Default === 'Y');
        if (!defaultSerieDoc) return;

        const u_BPP_NDSD = defaultSerieDoc.u_BPP_NDSD;

        this.u_BPP_NDSD = u_BPP_NDSD;
        this.modeloFormDoc.patchValue({ u_BPP_MDSD: u_BPP_NDSD });

        const documentTypeSunat = this.modeloFormDoc.controls['u_BPP_MDTD'].value;
        const u_BPP_TDDD = documentTypeSunat?.value ?? documentTypeSunat;

        if (!u_BPP_TDDD || !u_BPP_NDSD) return;

        this.getNumeroDocumentoByTipoSerie(u_BPP_TDDD, u_BPP_NDSD);
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

  onChangeAlmacenOrigen(event: any): void {
    const hasValidLines = this.modeloLines.some(x => x.itemCode && x.itemCode.trim() !== '');
    if (event.value && hasValidLines) {
      this.swaCustomService.swaConfirmation(
      this.globalConstants.titleActualizarDeAlmacen,
      this.globalConstants.subTitleActualizarDeAlmacen,
      this.globalConstants.icoSwalQuestion
      ).then((result) => {
        if (result.isConfirmed) {
          const whsCode = event.value.value || event.value;
          this.applyAlmacenOrigenToDetalle(whsCode);
        }
      });
    }
  }

  /**
   * Aplica el código de almacén origen a todas las líneas del detalle
   * que ya tengan un itemCode definido.
   */
  private applyAlmacenOrigenToDetalle(whsCode: string): void {
    this.modeloLines.forEach(x => {
      if (x.itemCode !== '') {
        x.fromWhsCod = whsCode;
      }
    });
  }

  onChangeAlmacenDestino(event: any): void {
    const hasValidLines = this.modeloLines.some(x => x.itemCode && x.itemCode.trim() !== '');
    if (event.value && hasValidLines) {
      this.swaCustomService.swaConfirmation(
        this.globalConstants.titleActualizarAAlmacen,
        this.globalConstants.subTitleActualizarAAlmacen,
        this.globalConstants.icoSwalQuestion
      ).then((result) => {
        if (result.isConfirmed) {
          const whsCode = event.value.value || event.value;
          this.applyAlmacenDestinoToDetalle(whsCode);
        }
      });
    }
  }

  /**
   * Aplica el código de almacén destino a todas las líneas del detalle
   * que ya tengan un itemCode definido.
   */
  private applyAlmacenDestinoToDetalle(whsCode: string): void {
    this.modeloLines.forEach(x => {
      if (x.itemCode !== '') {
        x.whsCode = whsCode;
      }
    });
  }

  resetTransportista(): void {
    const typeTransport = this.modeloFormTra.get('typeTransport')?.value;

    this.u_FIB_COD_TRA = '';

    this.modeloFormTra.reset({
      typeTransport: typeTransport,   // ← se mantiene
      u_FIB_COD_TRA: '',
      typeCarrierIdentityDocument: '',
      u_FIB_RUC_TRANS2: '',
      u_FIB_TRANS2: '',
      u_BPP_MDVC: '',

      typeDriversIdentityDocument: '',
      u_FIB_NUMDOC_COD: '',
      u_FIB_NOM_COND: '',
      u_FIB_APE_COND: '',
      u_BPP_MDFN: '',
      u_BPP_MDFC: '',
    }, { emitEvent: false });
  }

  onSelectedTransportista(value) {
    this.resetTransportista();

    this.u_FIB_COD_TRA = value.cardCode;

    const typeCarrierIdentityDocumentItem = this.typeCarrierIdentityDocumentList.find(item => item.value === value.u_BPP_BPTD);

    this.modeloFormTra.patchValue({
      'u_FIB_COD_TRA'               : this.utilService.normalizePrimitive(value.cardCode),
      'typeCarrierIdentityDocument' : typeCarrierIdentityDocumentItem || null,
      'u_BPP_MDRT'                  : this.utilService.normalizePrimitive(value.licTradNum),
      'u_BPP_MDNT'                  : this.utilService.normalizePrimitive(value.cardName)
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

  // ===========================
  // 7. Detalle Operations
  // ===========================
  //=======================================================================================================================
  //============================= INI: ARTICULO ===========================================================================
  //=======================================================================================================================
  onOpenArticulo(index: number): void {
    this.indexArticulo = index;
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  setItem(data: IArticulo[]): void {
    if (!data || data.length === 0) {
      return;
    }

    const element = data[0];
    const item = this.modeloLines[this.indexArticulo];

    const fillerControl    = this.modeloFormDoc.controls['filler']?.value;
    const toWhsCodeControl = this.modeloFormDoc.controls['toWhsCode']?.value;

    const fillerValue    = fillerControl?.value ?? fillerControl ?? '';
    const toWhsCodeValue = toWhsCodeControl?.value ?? toWhsCodeControl ?? '';

    item.itemCode       = element.itemCode;
    item.dscription     = element.itemName;
    item.fromWhsCod     = fillerValue || element.dfltWH || '';
    item.whsCode        = toWhsCodeValue || element.dfltWH || '';
    item.u_tipoOpT12    = element.u_tipoOpT12 ?? '';
    item.u_tipoOpT12Nam = element.u_tipoOpT12Nam ?? '';
    item.unitMsr        = element.invntryUom;
    item.quantity       = 1;
  }

  getListByCode(itemCode: string): void {
    this.isDisplay = true;

    this.ItemsService
    .getListByCode(this.buildFilterParams(itemCode))
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IArticulo[]) => {
        this.setItem(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListByCode', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(itemCode: string): any {
    return {
      itemCode,
      cardCode            : '',
      currency            : '',
      operationTypeCode   : '11',
      warehouseProduction : 'Y',
      warehouseLogistics  : '',
    };
  }

  onSelectedArticulo(value: any): void {
    this.isVisualizarArticulo = false;
    this.getListByCode(value.itemCode);
  }

  onClickCloseArticulo(): void {
    this.isVisualizarArticulo = false;
  }
  //=======================================================================================================================
  //============================= FIN: ARTICULO ===========================================================================
  //=======================================================================================================================

  //=======================================================================================================================
  //============================= INI: ALMACEN ============================================================================
  //=======================================================================================================================
  onOpenAlmacenOrigenItem(value: ITransferenciaStock1, index: number): void {
    this.indexAlmacenOrigen = index;
    this.itemCode = value.itemCode;
    this.isVisualizarAlmacenOrigen = true;
  }

  onSelectedAlmacenOrigenItem(value: any): void {
    const currentLine = this.modeloLines[this.indexAlmacenOrigen];

    currentLine.fromWhsCod = value.whsCode;

    // Actualizar modeloPickingOriginalLines relacionadas
    if (this.modeloPickingOriginalLines.length > 0) {
      this.modeloPickingOriginalLines
        .filter(x => x.u_BaseEntry === currentLine.baseEntry && x.u_BaseLine === currentLine.baseLine)
        .forEach(x => x.u_FromWhsCod = value.whsCode);
    }

    this.isVisualizarAlmacenOrigen = false;
  }

  onClickCloseAlmacenOrigenItem(): void {
    this.isVisualizarAlmacenOrigen = false;
  }

  onOpenAlmacenDestinoItem(value: ITransferenciaStock1, index: number): void {
    this.indexAlmacenDestino = index;
    this.itemCode = value.itemCode;
    this.isVisualizarAlmacenDestino = true;
  }

  onSelectedAlmacenDestinoItem(value: any): void {
    const currentLine = this.modeloLines[this.indexAlmacenDestino];
    currentLine.whsCode = value.whsCode;

    // Actualizar modeloPickingOriginalLines relacionadas
    if (this.modeloPickingOriginalLines.length > 0) {
      this.modeloPickingOriginalLines
        .filter(x => x.u_BaseEntry === currentLine.baseEntry && x.u_BaseLine === currentLine.baseLine)
        .forEach(x => x.u_WhsCode = value.whsCode);
    }

    this.isVisualizarAlmacenDestino = false;
  }

  onClickCloseAlmacenDestinoItem(): void {
    this.isVisualizarAlmacenDestino = false;
  }
  //=======================================================================================================================
  //============================= FIN: ALMACEN ============================================================================
  //=======================================================================================================================

  //=======================================================================================================================
  //============================= INI: TIPO DE OPERACION ==================================================================
  //=======================================================================================================================
  onOpenTipoOperacionItem(index: number): void {
    this.indexTipoOperacion = index;
    this.isVisualizarTipoOperacion = true;
  }

  onSelectedTipoOperacionItem(value: any): void {
    const currentLine = this.modeloLines[this.indexTipoOperacion];
    currentLine.u_tipoOpT12 = value.code;
    currentLine.u_tipoOpT12Nam = value.u_descrp;

    this.isVisualizarTipoOperacion = false;
  }

  onClickCloseTipoOperacionItem(): void {
    this.isVisualizarTipoOperacion = false;
  }
  //=======================================================================================================================
  //============================= FIN: TIPO DE OPERACION ==================================================================
  //=======================================================================================================================
  onChangeQuantity(value: ITransferenciaStock1, index: number): void {
    // Redondear la cantidad de entrada a 3 decimales.
    const roundedQuantity = this.utilService.onRedondearDecimal(value.quantity, 3);

    // Si no hay itemCode, la cantidad en el detalle es 0, de lo contrario es la cantidad redondeada.
    const detalleQuantity = value.itemCode ? roundedQuantity : 0;

    // Actualizar la línea de detalle principal en modeloLines.
    const detalle = this.modeloLines[index];
    detalle.quantity = detalleQuantity;
    detalle.openQty = detalleQuantity;
  }


  // ===========================
  // 8. Modal Methods
  // ===========================

  onClickView(): void {
    this.modeloPickingLines = this.modeloPickingOriginalLines.filter(x => x.u_BaseEntry === this.modeloSelected.baseEntry && x.u_BaseLine === this.modeloSelected.baseLine);
    this.isVisualizarBarcode = true;
  }

  onClickDelete(): void {
    // Asumir que siempre existe modeloSelected: usar su índice para actualizar/eliminar la línea
    const selectedIndex = this.modeloLines.findIndex(l => l === this.modeloSelected);

    // Se borra el registro en el detalle
    this.modeloLines.splice(selectedIndex, 1);

    if((this.modeloSelected?.u_FIB_FromPkg ?? 'N') === 'Y') {
      // Se borra el registro de la lectura
      this.modeloPickingOriginalLines.filter(x => x.u_BaseEntry === this.modeloSelected.baseEntry && x.u_BaseLine === this.modeloSelected.baseLine).forEach(x => this.modeloPickingOriginalLines.splice(this.modeloPickingOriginalLines.indexOf(x), 1));
    }

    this.getTotalBulto(this.modeloLines);
    this.getTotalKilo(this.modeloLines);
  }

  onClickBuscarModal(): void {
    if (!this.modeloSelected) return;

    const u_CodeBar = String(this.modeloFormCod.get('u_CodeBar')?.value ?? '' ).trim().toUpperCase();

    const { baseEntry, baseLine } = this.modeloSelected;

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
    const selectedIndex = this.modeloLines.findIndex(l => l === this.modeloSelected);
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

    // Recalcular totales generales (solo una vez)
    this.getTotalBulto(this.modeloLines);
    this.getTotalKilo(this.modeloLines);
  }

  onClearModal(): void {
    this.modeloPickingLines = [];
    this.isVisualizarBarcode = false;
    this.modeloFormCod.patchValue({ 'u_CodeBar' : '' });
  }

  onClickHideModal(): void {
    this.onClearModal();
  }

  onClickCloseModal(): void {
    this.onClearModal();
  }

  // ===========================
  // 9. Helper Methods
  // ===========================
  private getTotalBulto(value: ITransferenciaStock1[]): void {
    const totalBultos = value.reduce((acc, x) => acc + (x.u_FIB_NBulto > 0 ? x.u_FIB_NBulto : 0), 0);
    const numRedondeado = this.utilService.onRedondearDecimalConCero(totalBultos || 0, 3);
    this.modeloFormPie.get('u_FIB_NBULTOS').setValue(numRedondeado);
  }

  private getTotalKilo(value: ITransferenciaStock1[]): void {
    const totalKilos = value.reduce((acc, x) => acc + (x.u_FIB_PesoKg > 0 ? x.u_FIB_PesoKg : 0), 0);
    const numRedondeado = this.utilService.onRedondearDecimalConCero(totalKilos || 0, 3);
    this.modeloFormPie.get('u_FIB_KG').setValue(numRedondeado);
  }

  private formatNumericFormControl(controlName: string, precision: number): void {
    const control = this.modeloFormPie.get(controlName);
    if (control) {
      const valueStr = String(control.value).replace(/,/g, '').trim();
      const formattedValue = this.utilService.onRedondearDecimalConCero(Number(valueStr) || 0, precision);
      control.setValue(formattedValue, { emitEvent: false });
    }
  }

  blurNBultos(): void {
    this.formatNumericFormControl('u_FIB_NBULTOS', 3);
  }

  blurPesoKg(): void {
    this.formatNumericFormControl('u_FIB_KG', 3);
  }

  // ===========================
  // 10. Save Operations
  // ===========================
  private validateSave(): boolean {
    const showError = (message: string): boolean => {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo(message);
      return false;
    };

    const { filler, toWhsCode } = this.modeloFormDoc.getRawValue();
    const fillerValue = filler?.value || filler;
    const toWhsCodeValue = toWhsCode?.value || toWhsCode;

    if (fillerValue === toWhsCodeValue) {
      return showError('El almacén de destino no puede ser idéntico al almacén de origen.');
    }

    if (this.modeloLines.length === 0 || this.modeloLines.some(d => d.itemCode === '')) {
      return showError('Ingrese los datos en el detalle de la transferencia.');
    }

    for (const line of this.modeloLines) {
      if (line.fromWhsCod === line.whsCode) {
        return showError('El almacén de destino no puede ser idéntico al almacén de origen.');
      }
      if (!line?.u_tipoOpT12) {
        return showError('Seleccione el tipo operación en el detalle.');
      }
      if (line.quantity === 0) {
        return showError('La cantidad debe ser mayor que CERO (0).');
      }
    }

    return true;
  }

  private mergeForms() {
    return {
      ...this.modeloFormSn.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormTra.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormPie.getRawValue(),
    };
  }

  private mapLinesCreate(): StockTransfers1CreateModel[] {
    /** helpers para evitar repetición */
    const u         = this.utilService;
    const p         = (v:any)=>u.normalizePrimitive(v);
    const n         = (v:any)=>u.normalizeNumber(v);

    return this.modeloLines.map<StockTransfers1CreateModel>(line => ({
      baseType      : line.baseType == null || line.baseType === 0 ? -1   : n(line.baseType),
      baseEntry     : line.baseType == null || line.baseType === 0 ? null : n(line.baseEntry),
      baseLine      : line.baseType == null || line.baseType === 0 ? null : n(line.baseLine),

      itemCode      : p(line.itemCode),
      dscription    : p(line.dscription),
      fromWhsCod    : p(line.fromWhsCod),
      whsCode       : p(line.whsCode),

      unitMsr       : p(line.unitMsr),
      quantity      : n(line.quantity),

      u_FIB_FromPkg : p(line.u_FIB_FromPkg),
      u_tipoOpT12   : p(line.u_tipoOpT12),

      u_FIB_NBulto  : n(line.u_FIB_NBulto),
      u_FIB_PesoKg  : n(line.u_FIB_PesoKg)
    }));
  }

  private mapPickingLines(userId:number): StockTransferPickingUpdateModel[] {
    /** helpers para evitar repetición */
    const u         = this.utilService;
    const p         = (v:any)=>u.normalizePrimitive(v);
    const n         = (v:any)=>u.normalizeNumber(v);

    return this.modeloPickingOriginalLines.map<StockTransferPickingUpdateModel>(line => ({
      docEntry     : n(line.docEntry),
      u_BaseEntry  : n(line.u_BaseEntry),
      u_BaseLine   : n(line.u_BaseLine),

      u_Status     : p(line.u_Status),
      u_UsrUpdate  : n(userId)
    }));
  }

  private buildModelToSave(): StockTransfersCreateModel {
    /** helpers para evitar repetición */
    const u             = this.utilService;
    const p             = (v:any)=>u.normalizePrimitive(v);
    const n             = (v:any)=>u.normalizeNumber(v);
    const d             = (v:any)=>u.normalizeDateOrToday(v);
    const val           = (v:any)=>v?.value ?? v;

    /** combinar todos los formularios */
    const f             = this.mergeForms();

    const userId        = this.userContextService.getIdUsuario();

    const lines         = this.mapLinesCreate();
    const pickingLines  = this.mapPickingLines(userId);

    return {
      ...new StockTransfersCreateModel(),

      u_BPP_MDTD        : p(val(f.u_BPP_MDTD)),
      u_BPP_MDSD        : p(f.u_BPP_MDSD),
      u_BPP_MDCD        : p(f.u_BPP_MDCD),

      docDate           : d(f.docDate),
      taxDate           : d(f.taxDate),

      cardCode          : p(f.cardCode),
      cardName          : p(f.cardName),
      cntctCode         : n(f.cntctCode),
      address           : p(f.address),

      filler            : p(val(f.filler)),
      toWhsCode         : p(val(f.toWhsCode)),

      u_FIB_TIP_TRANS   : p(val(f.typeTransport)),
      u_FIB_COD_TRA     : p(f.u_FIB_COD_TRA),
      u_FIB_TIPDOC_TRA  : p(val(f.typeCarrierIdentityDocument)),
      u_BPP_MDRT        : p(f.u_BPP_MDRT),
      u_BPP_MDNT        : p(f.u_BPP_MDNT),
      u_BPP_MDVC        : p(f.u_BPP_MDVC),

      u_FIB_TIPDOC_COND : p(val(f.typeDriversIdentityDocument)),
      u_FIB_NUMDOC_COD  : p(f.u_FIB_NUMDOC_COD),
      u_FIB_NOM_COND    : p(f.u_FIB_NOM_COND),
      u_FIB_APE_COND    : p(f.u_FIB_APE_COND),
      u_BPP_MDFN        : p(f.u_BPP_MDFN),
      u_BPP_MDFC        : p(f.u_BPP_MDFC),

      u_FIB_TIP_TRAS    : p(val(f.transferType)),
      u_BPP_MDMT        : p(val(f.reasonTransfer)),
      u_BPP_MDTS        : p(val(f.outputType)),

      slpCode           : n(val(f.slpCode) ?? -1),

      u_FIB_NBULTOS     : n(f.u_FIB_NBULTOS),
      u_FIB_KG          : n(f.u_FIB_KG),

      jrnlMemo          : p(f.jrnlMemo),
      comments          : p(f.comments),

      u_UsrCreate       : userId,

      lines,
      pickingLines
    };
  }

  private save(): void {
    if (!this.validateSave()) {
      return;
    }

    this.isSaving = true;

    const modeloToSave = this.buildModelToSave();

    this.stockTransfersService.setCreate(modeloToSave)
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

  // ===========================
  // 11. UI Actions
  // ===========================
  onClickSave(): void {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.save();
      }
    });
  }

  private clearSession(): void {
    sessionStorage.removeItem('SolicitudCopyTo');
  }

  onClickBack(): void {
    this.clearSession();
    this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-list']);
  }
}
