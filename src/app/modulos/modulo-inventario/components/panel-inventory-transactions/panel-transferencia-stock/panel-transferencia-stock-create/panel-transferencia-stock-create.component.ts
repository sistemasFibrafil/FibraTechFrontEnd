import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Subject, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { INumeracionDocumentoSunat } from 'src/app/modulos/modulo-gestion/interfaces/sap/inicializacion-sistema/numeracion-documento-sunat.interface';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/campo-defnido-usuario.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/sales-persons.service';
import { NumeracionDocumentoService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/numeracion-documento.service';
import { NumeracionDocumentoSunatService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/numeracion-documento-sunat.service';
import { TipoDocumentoSunatService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/tipo-documento-sunat.service';
import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/articulo.interface';
import { IPicking } from 'src/app/modulos/modulo-inventario/interfaces/picking.inteface';
import { ISolicitudTraslado } from 'src/app/modulos/modulo-inventario/interfaces/solicitud-traslado.interface';
import { ITransferenciaStock1 } from 'src/app/modulos/modulo-inventario/interfaces/transferencia-stock.interface';
import { TransferenciaStockCreateModel } from 'src/app/modulos/modulo-inventario/models/transferencia-stock.model';
import { ArticuloService } from 'src/app/modulos/modulo-inventario/services/articulo.service';
import { TransferenciaStockService } from 'src/app/modulos/modulo-inventario/services/transferencia-stock.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/warehouses.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { UtilService } from 'src/app/services/util.service';

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
  modeloFormBar                                 : FormGroup;

  // Configuration
  /** Configuración general y constantes */
  readonly titulo                               = 'Transferencia de Stock';
  readonly jrnlMemo                             = 'Traslado - ';
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // Combos
  /** Listas de soporte para dropdowns */
  tipoDocumentoList                             : SelectItem[] = [];
  warehouseList                                 : SelectItem[] = [];
  tipoTransporteList                            : SelectItem[] = [];
  tipoDocumentoIdentidadTranList                : SelectItem[] = [];
  tipoDocumentoIdentidadCondList                : SelectItem[] = [];
  tipoTrasladoList                              : SelectItem[] = [];
  motivoTrasladoList                            : SelectItem[] = [];
  tipoSalidaList                                : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];

  // UI State
  /** Estados de overlays y modales */
  isSaving                                      = false;
  isDisplay                                     = false;
  isVisualizarBarcode                           = false;
  isVisualizarArticulo                          = false;
  isVisualizarTipoOperacion                     = false;
  isVisualizarAlmacenOrigen                     = false;
  isVisualizarAlmacenDestino                    = false;

  // Table configuration
  /** Configuración de tablas y menú contextual */
  columnas                                      : any[];
  columnas2                                     : any[];
  opciones                                      : any = [];
  bardcodeList                                  : any[];

  // Número de documento
  /** Numeración y flags de documento */
  u_BPP_NDTD                                    : string = '';
  u_BPP_NDSD                                    : string = '';
  u_FIB_TDED                                    : string = 'N';
  u_FIB_TDTD                                    : string = 'Y';
  u_FIB_SEDE                                    : number = 0;

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
  modeloSolicitud                               : ISolicitudTraslado;
  modeloLines                                   : ITransferenciaStock1[] = [];
  modeloPickingLines                            : IPicking[] = [];
  modeloSelected                                : ITransferenciaStock1;

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly articuloService: ArticuloService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly tipoDocumentoSunatService: TipoDocumentoSunatService,
    private readonly transferenciaStockService: TransferenciaStockService,
    private readonly numeracionDocumentoService: NumeracionDocumentoService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    private readonly numeracionDocumentoSunatService: NumeracionDocumentoSunatService,
    public  readonly utilService: UtilService,
  ) {}

  // ===========================
  // 1. Lifecycle Hooks
  // ===========================
  ngOnInit(): void {
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
      docNum                  : [{ value: '', disabled: true }],
      u_BPP_MDTD              : ['', Validators.required],
      u_BPP_MDSD              : ['', Validators.required],
      u_BPP_MDCD              : [{ value: '', disabled: false }, Validators.required],
      docDate                 : [new Date(), Validators.required],
      taxDate                 : [new Date(), Validators.required],
      filler                  : ['', Validators.required],
      toWhsCode               : ['', Validators.required]
    });

    this.modeloFormTra = this.fb.group({
      u_FIB_TIP_TRANS         : [{ value: '', disabled: false }],
      u_FIB_TIPDOC_TRA        : [{ value: '', disabled: false }],
      u_BPP_MDRT              : [{ value: '', disabled: false }],
      u_BPP_MDNT              : [{ value: '', disabled: false }],
      u_BPP_MDVC              : [{ value: '', disabled: false }],
      u_FIB_TIPDOC_COND       : [{ value: '', disabled: false }],
      u_FIB_NUMDOC_COD        : [{ value: '', disabled: false }],
      u_FIB_NOM_COND          : [{ value: '', disabled: false }],
      u_FIB_APE_COND          : [{ value: '', disabled: false }],
      u_BPP_MDFN              : [{ value: '', disabled: true }],
      u_BPP_MDFC              : [{ value: '', disabled: false }]
    });

    this.modeloFormOtr = this.fb.group({
      u_FIB_TIP_TRAS          : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDMT              : [{ value: '', disabled: false }, [Validators.required]],
      u_BPP_MDTS              : [{ value: '', disabled: false }, [Validators.required]]
    });

    this.modeloFormPie = this.fb.group({
      slpCode                 : ['', Validators.required],
      u_FIB_NBULTOS           : ['0'],
      u_FIB_KG                : ['0'],
      jrnlMemo                : [this.jrnlMemo],
      comments                : ['']
    });

    this.modeloFormBar = this.fb.group({
      filtro                  : ['']
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
      { field: 'quantity',        header: 'Cantidad' }
    ];
    this.columnas2 =
    [
      { field: 'u_ItemCode',      header: 'Código' },
      { field: 'u_CodeBar',       header: 'Barcode' },
      { field: 'u_unitMsr',       header: 'UM' },
      { field: 'u_WeightKg',      header: 'Cantidad' },
    ];
  }

  private buildTableOptions(): void {
    this.opciones = [
      { label: 'Borrar línea',    icon: 'pi pi-times',      command: () => { this.onClickDelete() } },
      { label: 'Visualizar',      icon: 'pi pi-eye',        command: () => { this.onClickVisualizar() } },
    ];
  }

  // ===========================
  // 4. Data Loading
  // ===========================
  private loadAllCombos(): void {
    this.u_FIB_SEDE         = this.userContextService.getIdLocation()
    const paramCampo1       : any = { objectCode: '67' };
    const paramCampo2       : any = { u_FIB_TDTD: 'Y' };
    const paramCampo3       : any = { inactive: 'N' };
    const paramCampo4       : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRANS' };
    const paramCampo5       : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_TRA' };
    const paramCampo6       : any = { tableID: 'OWTR', aliasID: 'FIB_TIPDOC_COND' };
    const paramCampo7       : any = { tableID: 'OWTR', aliasID: 'FIB_TIP_TRAS' };
    const paramCampo8       : any = { tableID: 'OWTR', aliasID: 'BPP_MDMT' };
    const paramCampo9       : any = { tableID: 'OWTR', aliasID: 'BPP_MDTS' };

    // Mostrar spinner mientras se cargan los combos
    this.isDisplay = true;

    forkJoin({
      numeracionDocumento   : this.numeracionDocumentoService.getNumero(paramCampo1),
      tipoDocumento         : this.tipoDocumentoSunatService.getListByTipo(paramCampo2),
      warehouse             : this.warehousesService.getListByInactive(paramCampo3),
      tipoTransporte        : this.camposDefinidoUsuarioService.getList(paramCampo4),
      tipoDocIdentidadTrans : this.camposDefinidoUsuarioService.getList(paramCampo5),
      tipoDocIdentidadCond  : this.camposDefinidoUsuarioService.getList(paramCampo6),
      tipoTraslado          : this.camposDefinidoUsuarioService.getList(paramCampo7),
      motivoTraslado        : this.camposDefinidoUsuarioService.getList(paramCampo8),
      tipoSalida            : this.camposDefinidoUsuarioService.getList(paramCampo9),
      salesEmployee         : this.salesPersonsService.getList()
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (result) => {
        // Numeracion Documento
        this.modeloFormDoc.patchValue({ docNum: result.numeracionDocumento.nextNumber });

        // Tipo Documento
        this.tipoDocumentoList = result.tipoDocumento.map(item => ({
          label: item.u_BPP_TDDD,
          value: item.u_BPP_TDTD
        }));

        const defaultTipoDoc = result.tipoDocumento.find(item => item.u_BPP_TDTD === '09');
        if (defaultTipoDoc) {
          this.u_BPP_NDTD = defaultTipoDoc.u_BPP_TDTD;
          this.modeloFormDoc.get('u_BPP_MDTD').setValue({
            label: defaultTipoDoc.u_BPP_TDDD,
            value: defaultTipoDoc.u_BPP_TDTD
          });

          const tipoDocumento = this.modeloFormDoc.controls['u_BPP_MDTD'].value
          const u_BPP_TDDD = tipoDocumento?.value || tipoDocumento;

          if(u_BPP_TDDD) {
            this.getListSerieDocumento(u_BPP_TDDD);
          }
        }

        // Warehouse
        this.warehouseList = result.warehouse.map(item => ({
          label: item.fullDescr,
          value: item.whsCode
        }));

        // Tipo Transporte
        this.tipoTransporteList = result.tipoTransporte.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        // Tipo Documento Identidad transportista
        this.tipoDocumentoIdentidadTranList = result.tipoDocIdentidadTrans.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        // Tipo Documento Identidad conductor
        this.tipoDocumentoIdentidadCondList = result.tipoDocIdentidadCond.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));

        // Tipo Traslado
        this.tipoTrasladoList = result.tipoTraslado.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));
        const defaultTipoTraslado = result.tipoTraslado.find(item => item.fldValue === '01');
        if (defaultTipoTraslado) {
          this.modeloFormOtr.get('u_FIB_TIP_TRAS').setValue({
            label: defaultTipoTraslado.descr,
            value: defaultTipoTraslado.fldValue
          });
        }

        // Motivo Traslado
        this.motivoTrasladoList = result.motivoTraslado.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));
        const defaultMotivo = result.motivoTraslado.find(item => item.fldValue === '04');
        if (defaultMotivo) {
          this.modeloFormOtr.get('u_BPP_MDMT').setValue({
            label: defaultMotivo.descr,
            value: defaultMotivo.fldValue
          });
        }

        // Tipo Salida
        this.tipoSalidaList = result.tipoSalida.map(item => ({
          label: item.descr,
          value: item.fldValue
        }));
        const defaultTipoSalida = result.tipoSalida.find(item => item.fldValue === 'TSI');
        if (defaultTipoSalida) {
          this.modeloFormOtr.get('u_BPP_MDTS').setValue({
            label: defaultTipoSalida.descr,
            value: defaultTipoSalida.fldValue
          });
        }

        // Sales Employee
        this.salesEmployeesList = result.salesEmployee.map(item => ({
          label: item.slpName,
          value: item.slpCode
        }));

        // 4. AHORA SÍ cargar datos - los combos están listos
        this.loadData();
      },
      error: (e) => {
        // En caso de error, el finalize también ejecutará el apagado del spinner,
        // pero dejamos explícito el callback por compatibilidad con utilService
        this.utilService.handleErrorSingle(e, 'loadAllCombos', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  private loadData(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: Params) => {
        if (params['json']) {
          try {
            this.modeloSolicitud = JSON.parse(params['json']);
            this.setFormValues(this.modeloSolicitud);
          } catch (error) {
            this.swaCustomService.swaMsgError('Los datos para la transferencia son inválidos.');
            this.onClickBack();
          }
        } else {
          this.swaCustomService.swaMsgInfo('No se encontraron datos para la transferencia.');
          this.onClickBack();
        }
      });
  }

  // ===========================
  // 5. Form Events & Selection Handlers
  // ===========================
  onSelectedItem(modelo: ITransferenciaStock1): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  private updateMenuVisibility(modelo: ITransferenciaStock1): void {
    const deleteOption = this.opciones.find(x => x.label === "Borrar línea");
    const viewOption = this.opciones.find(x => x.label === "Visualizar");

    if (deleteOption) {
      deleteOption.visible = modelo.itemCode !== '';
    }

    if (viewOption) {
      viewOption.visible = modelo.itemCode === '' || modelo.u_FIB_FromPkg === 'Y';
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
      const u_BPP_NDTD = event.value.value || event.value;
      const serDocumentoControl = this.modeloFormDoc.controls['u_BPP_MDSD'].value;
      const u_BPP_NDSD = serDocumentoControl?.value || serDocumentoControl;

      if (u_BPP_NDSD) {
        this.getNumeroDocumentoByTipoSerie(u_BPP_NDTD, u_BPP_NDSD);
      } else {
        this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': '' });
      }
    } else {
      this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': '' });
    }
  }

  onChangeSerieDocumento(event: any): void {
    if (event.value) {
      const u_BPP_NDSD = event.value.value || event.value;
      const tipDocumentoControl = this.modeloFormDoc.controls['u_BPP_MDTD'].value;
      const u_BPP_NDTD = tipDocumentoControl?.value || tipDocumentoControl;

      if (u_BPP_NDTD) {
        this.getNumeroDocumentoByTipoSerie(u_BPP_NDTD, u_BPP_NDSD);
      } else {
        this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': '' });
      }
    } else {
      this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': '' });
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
    const params = { u_BPP_NDTD: u_BPP_NDTD, u_BPP_NDCD: '', u_FIB_TDED: this.u_FIB_TDED, u_FIB_TDTD: this.u_FIB_TDTD, u_FIB_SEDE: this.u_FIB_SEDE };
    this.numeracionDocumentoSunatService.getListSerieDocumento(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: INumeracionDocumentoSunat[]) => {
          if(data.length > 0) {
            const defaultSerieDoc = data.find(item => item.u_FIB_SDTD === 'Y');

            if (defaultSerieDoc) {
              this.u_BPP_NDSD = defaultSerieDoc.u_BPP_NDSD;
              this.modeloFormDoc.patchValue({ 'u_BPP_MDSD': defaultSerieDoc.u_BPP_NDSD });

              const tipoDocumento = this.modeloFormDoc.controls['u_BPP_MDTD'].value
              const u_BPP_TDDD = tipoDocumento?.value || tipoDocumento;

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
          this.utilService.handleErrorSingle(e, 'getListSerieDocumento', null, this.swaCustomService);
        }
      });
  }

  private getNumeroDocumentoByTipoSerie(u_BPP_NDTD: string, u_BPP_NDSD: string): void {
    const params = { u_BPP_NDTD: u_BPP_NDTD, u_BPP_NDSD: u_BPP_NDSD };
    this.numeracionDocumentoSunatService.getNumeroDocumentoByTipoSerie(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: INumeracionDocumentoSunat) => {
          this.modeloFormDoc.patchValue({ 'u_BPP_MDCD': data.u_BPP_NDCD });
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'getNumeroDocumentoByTipoSerie', null, this.swaCustomService);
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

  onChangeNomConductor(): void {
    // Se obtienen el nombre y el apellido del formulario.
    const { u_FIB_NOM_COND, u_FIB_APE_COND } = this.modeloFormTra.value;
    const nombreCompleto = `${u_FIB_NOM_COND || ''} ${u_FIB_APE_COND || ''}`.trim();

    this.modeloFormTra.get('u_BPP_MDFN').setValue(nombreCompleto);
  }

  // ===========================
  // 6. Set Form Values
  // ===========================
  private setFormValues(value: ISolicitudTraslado): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el detalle durante la carga
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
    const tipoTrasladoItem        = this.tipoTrasladoList.find(item => item.value === value.u_FIB_TIP_TRAS);
    const motivoTrasladoItem      = this.motivoTrasladoList.find(item => item.value === value.u_BPP_MDMT);
    const tipoSalidaItem          = this.tipoSalidaList.find(item => item.value === value.u_BPP_MDTS);

    // Actualizar formulario Otros
    this.modeloFormOtr.patchValue(
      {
        u_FIB_TIP_TRAS            : tipoTrasladoItem || null,
        u_BPP_MDMT                : motivoTrasladoItem || null,
        u_BPP_MDTS                : tipoSalidaItem || null
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
      quantity                    : line.quantity,
      openQty                     : line.openQty,
      u_FIB_NBulto                : line.u_FIB_NBulto,
      u_FIB_PesoKg                : line.u_FIB_PesoKg
    }));

    // Calcular totales basados en los valores originales
    this.getTotalBulto(this.modeloLines);
    this.getTotalKilo(this.modeloLines);

    // Cargar picking lines
    this.modeloPickingLines = value.pickingLines.map(line => ({ ...line }));

    this.isLoadingInitialData = false;
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
    const item              = this.modeloLines[this.indexArticulo];
    const fillerControl     = this.modeloFormDoc.controls['filler'].value;
    const toWhsCodeControl  = this.modeloFormDoc.controls['toWhsCode'].value;
    const fillerValue       = fillerControl?.value || fillerControl || '';
    const toWhsCodeValue    = toWhsCodeControl?.value || toWhsCodeControl || '';

    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      if(index === 0) {
        item.itemCode       = element.itemCode;
        item.dscription     = element.itemName;
        item.fromWhsCod     = fillerValue || element.dfltWH || '';
        item.whsCode        = toWhsCodeValue || element.dfltWH || '';
        item.u_tipoOpT12    = element.u_tipoOpT12 || '';
        item.u_tipoOpT12Nam = element.u_tipoOpT12Nam || '';
        item.unitMsr        = element.invntryUom;
        item.quantity       = 1;
      }
    }
  }

  getListByCode(itemCode: string): void {
    this.isDisplay = true;
    const params = { itemCode: itemCode, codTipoOperacion: '11' };
    this.articuloService.getListByCode(params)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: IArticulo[]) => {
        this.isDisplay = false;
        this.setItem(data);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListByCode', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
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

    // Actualizar modeloPickingLines relacionadas
    if (this.modeloPickingLines.length > 0) {
      this.modeloPickingLines
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

    // Actualizar modeloPickingLines relacionadas
    if (this.modeloPickingLines.length > 0) {
      this.modeloPickingLines
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

  onClickDelete(): void {
    // Se borra el registro en el detalle
    this.modeloLines.filter(x => x.baseEntry === this.modeloSelected.baseEntry && x.baseLine === this.modeloSelected.baseLine).forEach(x => this.modeloLines.splice(this.modeloLines.indexOf(x), 1));

    // Se borra el registro de la lectura
    this.modeloPickingLines.filter(x => x.u_BaseEntry === this.modeloSelected.baseEntry && x.u_BaseLine === this.modeloSelected.baseLine).forEach(x => this.modeloPickingLines.splice(this.modeloPickingLines.indexOf(x), 1));

    this.getTotalBulto(this.modeloLines);
    this.getTotalKilo(this.modeloLines);
  }

  // ===========================
  // 8. Modal Methods
  // ===========================
  onClickVisualizar(): void {
    this.bardcodeList = this.modeloPickingLines.filter(
      x => x.u_BaseEntry === this.modeloSelected.baseEntry && x.u_BaseLine === this.modeloSelected.baseLine
    );
    this.isVisualizarBarcode = true;
  }

  onClickBuscarModal(): void {
    const filtroRaw = this.modeloFormBar.controls['filtro'].value;
    const filtro = filtroRaw ? String(filtroRaw).trim().toUpperCase() : '';

    if (!this.modeloSelected) { return; }

    this.bardcodeList = this.modeloPickingLines.filter(x =>
      x.u_BaseEntry === this.modeloSelected.baseEntry && x.u_BaseLine === this.modeloSelected.baseLine && (filtro === '' || String(x.u_CodeBar || '').toUpperCase().includes(filtro))
    );
  }

  onClickDeleteRowModal(value: IPicking): void {
    // Remover registro de modeloPickingLines y del modal
    this.modeloPickingLines.filter(x => x.docEntry === value.docEntry).forEach(x => this.modeloPickingLines.splice(this.modeloPickingLines.indexOf(x), 1));
    this.bardcodeList.filter(x => x.docEntry === value.docEntry).forEach(x => this.bardcodeList.splice(this.bardcodeList.indexOf(x), 1));

    const quantity = this.bardcodeList.reduce((acc, x) => acc + x.u_Quantity, 0);
    const peso = this.bardcodeList.reduce((acc, x) => acc + x.u_WeightKg, 0);
    const bulto = this.bardcodeList.reduce((acc, x) => acc + x.u_NumBulk, 0);

    // Asumir que siempre existe modeloSelected: usar su índice para actualizar/eliminar la línea
    const selectedIndex = this.modeloLines.findIndex(l => l === this.modeloSelected);
    if (selectedIndex > -1) {
      if (this.bardcodeList.length === 0) {
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
    this.bardcodeList = [];
    this.modeloFormBar.patchValue({ 'filtro' : '' });
  }

  onClickHideModal(): void {
    this.onClearModal();
  }

  onClickCloseModal(): void {
    this.onClearModal();
    this.isVisualizarBarcode = false;
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

  private buildModelToSave(): TransferenciaStockCreateModel {
    const formValues = {
      ...this.modeloFormSn.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormTra.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormPie.getRawValue(),
    };

    const userId = this.userContextService.getIdUsuario();

    const u_FIB_NBULTOS : number = Number(String(formValues.u_FIB_NBULTOS).replace(/,/g, '').trim() || 0);
    const u_FIB_KG      : number = Number(String(formValues.u_FIB_KG).replace(/,/g, '').trim() || 0);

    return {
      ...new TransferenciaStockCreateModel(),
      ...formValues,
      cntctCode             : formValues.cntctCode || 0,
      docDate               : this.utilService.normalizeDate(formValues.docDate),
      taxDate               : this.utilService.normalizeDate(formValues.taxDate),
      u_BPP_MDTD            : formValues.u_BPP_MDTD?.value || formValues.u_BPP_MDTD || '',
      u_BPP_MDSD            : formValues.u_BPP_MDSD?.value || formValues.u_BPP_MDSD || '',
      u_BPP_MDCD            : formValues.u_BPP_MDCD || '',
      filler                : formValues.filler?.value || formValues.filler || '',
      toWhsCode             : formValues.toWhsCode?.value || formValues.toWhsCode || '',
      u_FIB_TIP_TRANS       : formValues.u_FIB_TIP_TRANS?.value || formValues.u_FIB_TIP_TRANS || '',
      u_FIB_TIPDOC_TRA      : formValues.u_FIB_TIPDOC_TRA?.value || formValues.u_FIB_TIPDOC_TRA || '',
      u_BPP_MDRT            : formValues.u_BPP_MDRT || '',
      u_BPP_MDNT            : formValues.u_BPP_MDNT || '',
      u_BPP_MDVC            : formValues.u_BPP_MDVC || '',
      u_FIB_TIPDOC_COND     : formValues.u_FIB_TIPDOC_COND?.value || formValues.u_FIB_TIPDOC_COND || '',
      u_FIB_NUMDOC_COD      : formValues.u_FIB_NUMDOC_COD || '',
      u_FIB_NOM_COND        : formValues.u_FIB_NOM_COND || '',
      u_FIB_APE_COND        : formValues.u_FIB_APE_COND || '',
      u_BPP_MDFN            : formValues.u_BPP_MDFN || '',
      u_BPP_MDFC            : formValues.u_BPP_MDFC || '',
      u_FIB_TIP_TRAS        : formValues.u_FIB_TIP_TRAS?.value || formValues.u_FIB_TIP_TRAS || '',
      u_BPP_MDMT            : formValues.u_BPP_MDMT?.value || formValues.u_BPP_MDMT || '',
      u_BPP_MDTS            : formValues.u_BPP_MDTS?.value || formValues.u_BPP_MDTS || '',
      u_FIB_NBULTOS         : u_FIB_NBULTOS,
      u_FIB_KG              : u_FIB_KG,
      slpCode               : formValues.slpCode?.value || formValues.slpCode || 1,
      u_UsrCreate           : userId,
      lines                 : this.modeloLines.map(line => ({ ...line })),
      pickingLines          : this.modeloPickingLines.map(line => ({
        docEntry            : line.docEntry,
        u_BaseEntry         : line.u_BaseEntry,
        u_BaseLine          : line.u_BaseLine,
        u_Status            : 'C', // Cerramos el picking al grabar la transferencia
        u_UsrUpdate         : userId,
      }))
    };
  }

  private save(): void {
    this.isSaving = true;

    if (!this.validateSave()) {
      return;
    }

    const modeloToSave = this.buildModelToSave();

    this.transferenciaStockService.setCreate(modeloToSave)
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

  onClickBack(): void {
    this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-list']);
  }
}
