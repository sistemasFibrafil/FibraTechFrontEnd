import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Subject, forkJoin } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/campo-defnido-usuario.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/sales-persons.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/warehouses.service';
import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/articulo.interface';
import { ISolicitudTraslado1 } from 'src/app/modulos/modulo-inventario/interfaces/solicitud-traslado.interface';
import { SolicitudTrasladoCreateModel } from 'src/app/modulos/modulo-inventario/models/solicitud-traslado.model';
import { ArticuloService } from 'src/app/modulos/modulo-inventario/services/articulo.service';
import { SolicitudTrasladoService } from 'src/app/modulos/modulo-inventario/services/solicitud-traslado.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { UtilService } from 'src/app/services/util.service';
import { NumeracionDocumentoService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/numeracion-documento.service';


@Component({
  selector: 'app-inv-panel-solicitud-traslado-create',
  templateUrl: './panel-solicitud-traslado-create.component.html',
  styleUrls: ['./panel-solicitud-traslado-create.component.css']
})
export class PanelSolicitudTrasladoCreateComponent implements OnInit, OnDestroy {
  // Lifecycle management
  /** Gestión de ciclo de vida y estado inicial */
  private readonly destroy$                     = new Subject<void>();

  // Forms
  /** Formularios reactivos de la vista */
  modeloFormSn                                  : FormGroup;
  modeloFormDoc                                 : FormGroup;
  modeloFormOtr                                 : FormGroup;
  modeloFormPie                                 : FormGroup;

  // Configuration
  /** Configuración general y constantes */
  readonly titulo                               = 'Solicitud de Traslado';
  readonly jrnlMemo                             = 'Solicitud de traslado - ';
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // Combos
  /** Listas de soporte para dropdowns */
  warehouseList                                 : SelectItem[] = [];
  tipoSalidaList                                : SelectItem[] = [];
  tipoTrasladoList                              : SelectItem[] = [];
  motivoTrasladoList                            : SelectItem[] = [];
  salesEmployeesList                            : SelectItem[] = [];

  // UI State
  /** Estados de overlays, modales y banderas UI */
  isSaving                                      = false;
  isDisplay                                     = false;
  isUploadItem                                  = false;
  isDisplayUpload                               = false;
  isVisualizarArticulo                          = false;
  isVisualizarTipoOperacion                     = false;
  isVisualizarAlmacenOrigen                     = false;
  isVisualizarAlmacenDestino                    = false;

  // Table configuration
  /** Configuración de tabla y menús */
  items                                         : MenuItem[];
  opciones                                      : MenuItem[];
  columnas                                      : TableColumn[];

  // Data
  /** Modelos de detalle y selección */
  modeloLines                                   : ISolicitudTraslado1[] = [];
  modeloLinesSelected                           : ISolicitudTraslado1;
  modeloLinesSelectedContext                    : ISolicitudTraslado1;

  // Filters / Additional properties
  /** Identificadores y auxiliares */
  cardCode                                      = '';
  cntctCode                                     = 0;
  itemCode                                      = '';
  indexArticulo                                 = 0;
  indexTipoOperacion                            = 0;
  indexAlmacenOrigen                            = 0;
  indexAlmacenDestino                           = 0;
  inactiveAlmacenItem                           = 'N';
  hasValidLines                                 = false;

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly route: ActivatedRoute,
    private readonly userContextService: UserContextService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly articuloService: ArticuloService,
    private readonly salesPersonsService: SalesPersonsService,
    private readonly solicitudTrasladoService: SolicitudTrasladoService,
    private readonly numeracionDocumentoService: NumeracionDocumentoService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    public  readonly utilService: UtilService,
  ) {}

  // ===========================
  // Lifecycle Hooks
  // ==========================


  ngOnInit(): void {
    this.initializeComponent();
  }

  /** Limpia suscripciones para evitar fugas de memoria */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // Initialization
  // ===========================

  private initializeComponent(): void {
    this.buildForms();
    this.onBuildColumn();
    this.opcionesTabla();
    this.opcionesContextMenu();
    // Cargar todos los combos en paralelo y aplicar valores por defecto sin emitir eventos
    this.loadAllCombos();
  }

  /**
   * Carga en paralelo las listas de soporte (numeración, almacenes, tipos y empleados)
   * y establece los valores por defecto en los formularios usando { emitEvent: false } para
   * evitar triggers no deseados en valueChanges.
   */
  private loadAllCombos(): void {
    const paramNumero     : any = { objectCode: '1250000001' };
    const paramAlmacen    : any = { inactive: 'N' };
    const paramTipoTras   : any = { tableID: 'OWTQ', aliasID: 'FIB_TIP_TRAS' };
    const paramMotivo     : any = { tableID: 'OWTQ', aliasID: 'BPP_MDMT' };
    const paramTipoSalida : any = { tableID: 'OWTQ', aliasID: 'BPP_MDTS' };

    // Mostrar spinner mientras cargan los combos
    this.isDisplay = true;

    forkJoin({
      numero          : this.numeracionDocumentoService.getNumero(paramNumero),
      almacenes       : this.warehousesService.getListByInactive(paramAlmacen),
      tipoTraslado    : this.camposDefinidoUsuarioService.getList(paramTipoTras),
      motivoTraslado  : this.camposDefinidoUsuarioService.getList(paramMotivo),
      tipoSalida      : this.camposDefinidoUsuarioService.getList(paramTipoSalida),
      salesEmployee   : this.salesPersonsService.getList()
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (res) => {
        // Numeracion
        this.modeloFormDoc.patchValue({ docNum: res.numero.nextNumber }, { emitEvent: false });

        // Almacenes
        const whsData = (res.almacenes || []) as any[];
        this.warehouseList = whsData.map(i => ({ label: i.fullDescr, value: i.whsCode }));
        const dftWhs = this.userContextService.getDfltWhs();
        if (dftWhs) {
          const defaultWhs = whsData.find(i => i.whsCode === dftWhs);
          if (defaultWhs) {
            this.modeloFormDoc.get('filler').setValue({ label: defaultWhs.fullDescr, value: defaultWhs.whsCode }, { emitEvent: false });
            this.modeloFormDoc.get('toWhsCode').setValue({ label: defaultWhs.fullDescr, value: defaultWhs.whsCode }, { emitEvent: false });
          }
        }


        // Tipo Traslado
        const tipoTrasData = (res.tipoTraslado || []) as any[];
        this.tipoTrasladoList = tipoTrasData.map(i => ({ label: i.descr, value: i.fldValue }));
        const defaultTipo = tipoTrasData.find(i => i.fldValue === '01');
        if (defaultTipo) {
          this.modeloFormOtr.get('u_FIB_TIP_TRAS').setValue({ label: defaultTipo.descr, value: defaultTipo.fldValue }, { emitEvent: false });
        }

        // Motivo Traslado
        const motivoData = (res.motivoTraslado || []) as any[];
        this.motivoTrasladoList = motivoData.map(i => ({ label: i.descr, value: i.fldValue }));
        const defaultMotivo = motivoData.find(i => i.fldValue === '04');
        if (defaultMotivo) {
          this.modeloFormOtr.get('u_BPP_MDMT').setValue({ label: defaultMotivo.descr, value: defaultMotivo.fldValue }, { emitEvent: false });
        }

        // Tipo Salida
        const tipoSalidaData = (res.tipoSalida || []) as any[];
        this.tipoSalidaList = tipoSalidaData.map(i => ({ label: i.descr, value: i.fldValue }));
        const defaultTipoSalida = tipoSalidaData.find(i => i.fldValue === 'TSI');
        if (defaultTipoSalida) {
          this.modeloFormOtr.get('u_BPP_MDTS').setValue({ label: defaultTipoSalida.descr, value: defaultTipoSalida.fldValue }, { emitEvent: false });
        }

        // Sales Employee
        this.salesEmployeesList = (res.salesEmployee || []).map((i: any) => ({ label: i.slpName, value: i.slpCode }));

        // AHORA SÍ cargar datos - los combos están listos
        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  private buildForms(): void {
    /** Construye los formularios con validadores requeridos */
    this.modeloFormSn = this.fb.group({
      cardCode                : [{ value: '', disabled: true }],
      cardName                : [{ value: '', disabled: true }],
      cntctCode               : [{ value: '', disabled: true }],
      address                 : [{ value: '', disabled: true }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: true }],
      docStatus               : [{ value: 'Abierto', disabled: true }, Validators.required],
      docDate                 : [new Date(), Validators.required],
      docDueDate              : [new Date(), Validators.required],
      taxDate                 : [new Date(), Validators.required],
      u_FIB_IsPkg             : [false],
      filler                  : ['', Validators.required],
      toWhsCode               : ['', Validators.required]
    });

    this.modeloFormOtr = this.fb.group({
      u_FIB_TIP_TRAS          : ['', Validators.required],
      u_BPP_MDMT              : ['', Validators.required],
      u_BPP_MDTS              : ['', Validators.required]
    });

    this.modeloFormPie = this.fb.group({
      slpCode                 : ['', Validators.required],
      jrnlMemo                : [this.jrnlMemo],
      comments                : ['']
    });

    this.addLine(0);
  }

  private onBuildColumn(): void {
    /** Construye la definición de columnas para la tabla */
    this.columnas = [
      { field: 'itemCode',        header: 'Código' },
      { field: 'itemName',        header: 'Descripción' },
      { field: 'fromWhsCod',      header: 'De almacén' },
      { field: 'whsCode',         header: 'Almacén destino' },
      { field: 'u_tipoOpT12Nam',  header: 'Tipo operación' },
      { field: 'unitMsr',         header: 'UM' },
      { field: 'quantity',        header: 'Cantidad' }
    ];
  }

  private opcionesTabla(): void {
    /** Define las acciones del split-button para operaciones de fila */
    this.opciones = [
      { value: '1', label: 'Añadir línea', icon: 'pi pi-pencil',  command: () => this.onClickAddLine() },
      { value: '2', label: 'Borrar línea', icon: 'pi pi-times',   command: () => this.onClickDelete() }
    ];
  }

  private opcionesContextMenu(): void {
    /** Define las acciones del menú contextual para las filas */
    this.items = [
      { value: '1', label: 'Añadir línea',    icon: 'pi pi-fw pi-plus',     command: () => this.onClickContextMenuAddLine(this.modeloLinesSelectedContext) },
      { value: '2', label: 'Borrar línea',    icon: 'pi pi-fw pi-times',    command: () => this.onClickContextMenuDelete(this.modeloLinesSelectedContext) },
      { value: '3', label: 'Subir artículos', icon: 'pi pi-fw pi-arrow-up', command: () => this.onClickContextMenuUpload() },
    ];
  }

  onContextMenuShow(event: any): void {
    /** Actualiza la selección del menú contextual y visibilidad de opciones */
    // No sobrescribir la selección del contexto si el evento no trae datos de fila.
    // El p-table ya actualiza `modeloLinesSelectedContext` vía [(contextMenuSelection)].
    if (event?.item?.data) {
      this.modeloLinesSelectedContext = event.item.data;
    }
    this.updateMenuContextVisibility();
  }

  onClickContextMenuAddLine(modelo: ISolicitudTraslado1)
  {
    /** Agrega una nueva línea después de la línea seleccionada en el menú contextual */
    // Manejar casos donde el objeto 'modelo' no es pasado correctamente
    const target = modelo || this.modeloLinesSelectedContext;

    let insertIndex = this.modeloLines.length; // por defecto al final
    if (target) {
      const idx = this.modeloLines.indexOf(target);
      insertIndex = idx > -1 ? idx + 1 : this.modeloLines.length;
    }

    this.addLine(insertIndex);
  }

  onClickContextMenuDelete(modelo: ISolicitudTraslado1)
  {
    /** Elimina la línea seleccionada en el menú contextual */
    const index = this.modeloLines.indexOf(modelo);
    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }
    // Si se quedó sin líneas, agregar una vacía como comportamiento por defecto
    if (this.modeloLines.length === 0) {
      this.addLine(0);
    }

    this.updateHasValidLines();
  }

  onClickContextMenuUpload()
  {
    /** Abre el modal de carga masiva de artículos */
    this.isUploadItem = true;
    this.isDisplayUpload = true;
  }

  // ===========================
  // Table Events
  // ===========================

  onSelectedItem(modelo: ISolicitudTraslado1): void {
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

    this.updateHasValidLines();
  }

  // ===========================
  // Helper Methods
  // ===========================

  private updateMenuVisibility(): void {
    /** Activa/desactiva opciones del split-button según líneas presentes y vacías */
    const hasEmptyLines     = this.modeloLines.some(x => x.itemCode === '');
    const hasLines          = this.modeloLines.length > 0;

    const addLineOption     = this.opciones.find(x => x.label === 'Añadir línea');
    const deleteLineOption  = this.opciones.find(x => x.label === 'Borrar línea');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  private updateMenuContextVisibility(): void {
    /** Activa/desactiva opciones del menú contextual según líneas presentes y vacías */
    const hasEmptyLines     = this.modeloLines.some(x => x.itemCode === '');
    const hasLines          = this.modeloLines.length > 0;

    const addLineOption     = this.items.find(x => x.label === 'Añadir línea');
    const deleteLineOption  = this.items.find(x => x.label === 'Borrar línea');

    if (addLineOption) addLineOption.visible = !hasEmptyLines;
    if (deleteLineOption) deleteLineOption.visible = hasLines;
  }

  // Verifica si todas las líneas son válidas
  private updateHasValidLines(): void {
    this.hasValidLines =
    this.modeloLines.length > 0 &&
    this.modeloLines.every(line =>!!line.itemCode?.trim());
  }

  private addLine(index: number): void {
    /** Inserta una nueva línea vacía en el índice especificado */
    this.modeloLines.splice(index, 0, { lineStatus: 'O', itemCode: '', dscription: '', fromWhsCod: '', whsCode: '', u_tipoOpT12: '', u_tipoOpT12Nam: '', unitMsr: '', quantity: 0, u_FIB_OpQtyPkg: 0, openQty: 0 });
    this.updateHasValidLines();
  }

  private loadData(): void {
    /** Carga los datos iniciales desde los parámetros de ruta */
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe((params: Params) => {
        if (params['json']) {
          try {
            this.modeloLines = JSON.parse(params['json']);
            this.updateHasValidLines();
          } catch (error) {
            this.swaCustomService.swaMsgError('Los datos para la solicitud son inválidos.');
            this.onClickBack();
          }
        } else {
          this.swaCustomService.swaMsgInfo('No se encontraron datos para la solicitud.');
          this.onClickBack();
        }
      });
  }

  // ===========================
  // Data Operations
  // ===========================

  onSelectedSocioNegocio(value: any): void {
    /** Actualiza los datos del socio de negocio seleccionado */
    this.cardCode = value.cardCode;
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({
      cardCode  : value.cardCode,
      cardName  : value.cardName,
      address   : value.address2,
      cntctCode : value.cntctCode
    });

    const jrnlMemoNew = `${this.jrnlMemo}${this.cardCode}`;
    this.modeloFormPie.patchValue({ jrnlMemo: jrnlMemoNew });
  }

  onSelectedPersonaContacto(value: any): void {
    /** Actualiza el código de contacto seleccionado */
    this.cntctCode = value.cntctCode;
    this.modeloFormSn.patchValue({ cntctCode: value.cntctCode });
  }

  onChangeAlmacenOrigen(event: any): void {
    /** Maneja cambios en el almacén origen; actualiza todas las líneas si confirma */
    const hasValidLines = this.modeloLines.some(x => x.itemCode && x.itemCode.trim() !== '');
    if (event.value && hasValidLines) {
      this.swaCustomService.swaConfirmation(
      this.globalConstants.titleActualizarDeAlmacen,
      this.globalConstants.subTitleActualizarDeAlmacen,
      this.globalConstants.icoSwalQuestion
      ).then((result) => {
        if (result.isConfirmed) {
          const whsCode = event.value.value || event.value;
          this.applyAlmacenOrigenTomodeloLines(whsCode);
        }
      });
    }
  }

  /**
   * Aplica el código de almacén origen a todas las líneas del modeloLines
   * que ya tengan un itemCode definido.
   */
  private applyAlmacenOrigenTomodeloLines(whsCode: string): void {
    this.modeloLines.forEach(x => {
      if (x.itemCode !== '') {
        x.fromWhsCod = whsCode;
      }
    });
  }

  onChangeAlmacenDestino(event: any): void {
    /** Maneja cambios en el almacén destino; actualiza todas las líneas si confirma */
    const hasValidLines = this.modeloLines.some(x => x.itemCode && x.itemCode.trim() !== '');
    if (event.value && hasValidLines) {
      this.swaCustomService.swaConfirmation(
        this.globalConstants.titleActualizarAAlmacen,
        this.globalConstants.subTitleActualizarAAlmacen,
        this.globalConstants.icoSwalQuestion
      ).then((result) => {
        if (result.isConfirmed) {
          const whsCode = event.value.value || event.value;
          this.applyAlmacenDestinoTomodeloLines(whsCode);
        }
      });
    }
  }

  /**
   * Aplica el código de almacén destino a todas las líneas del modeloLines
   * que ya tengan un itemCode definido.
   */
  private applyAlmacenDestinoTomodeloLines(whsCode: string): void {
    this.modeloLines.forEach(x => {
      if (x.itemCode !== '') {
        x.whsCode = whsCode;
      }
    });
  }

  onOpenArticulo(index: number): void {
    /** Abre el modal para buscar/seleccionar un artículo para la línea indicada */
    this.isUploadItem = false;
    this.indexArticulo = index;
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  setItem(data: IArticulo[]): void {
    /** Asigna el primer artículo seleccionado a la línea actual */
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
        item.openQty        = 1;
        item.u_FIB_OpQtyPkg = 1;
      }
    }

    this.updateHasValidLines();
  }

  setItems(data: IArticulo[]): void {
    /** Agrega múltiples artículos como nuevas líneas en la tabla */
    const fillerControl     = this.modeloFormDoc.controls['filler'].value;
    const toWhsCodeControl  = this.modeloFormDoc.controls['toWhsCode'].value;
    const fillerValue       = fillerControl?.value || fillerControl || '';
    const toWhsCodeValue    = toWhsCodeControl?.value || toWhsCodeControl || '';

    // Si la última línea actual está vacía (sin itemCode), removerla antes de añadir nuevas
    if (this.modeloLines.length > 0) {
      const last = this.modeloLines[this.modeloLines.length - 1];
      if (!last?.itemCode || (typeof last.itemCode === 'string' && last.itemCode.trim() === '')) {
        this.modeloLines.pop();
      }
    }

    for (let index = 0; index < data.length; index++) {
      const element = data[index];
      const item: ISolicitudTraslado1 = {
        lineStatus      : 'O',
        itemCode        : element.itemCode,
        dscription      : element.itemName,
        fromWhsCod      : fillerValue || element.dfltWH || '',
        whsCode         : toWhsCodeValue || element.dfltWH || '',
        u_tipoOpT12     : element.u_tipoOpT12 || '',
        u_tipoOpT12Nam  : element.u_tipoOpT12Nam || '',
        unitMsr         : element.invntryUom,
        quantity        : 1,
        openQty         : 1,
        u_FIB_OpQtyPkg  : 1,
      };
      this.modeloLines.push(item);
    }

    this.updateHasValidLines();
    this.isUploadItem = false;
  }

  getListByCode(itemCode: string): void {
    /** Busca artículos por código desde el servicio */
    this.isDisplay = true;

    const params = {
      itemCode,
      cardCode          : '',
      currency          : '',
      slpCode           : 0,
      codTipoOperacion  : '11'
    };

    this.articuloService.getListByCode(params)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data: IArticulo[]) => {
        this.isDisplay = false;
        if(this.isUploadItem) {
          // Modo carga masiva
          this.setItems(data);
        } else {
          // Modo selección individual
          this.setItem(data);
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListByCode', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  onSelectedArticulo(value: any): void {
    /** Maneja la selección de un artículo desde el modal de búsqueda */
    this.isVisualizarArticulo = false;
    this.getListByCode(value.itemCode);
  }

  onClickUpload(file: any): void {
    /** Procesa la carga de archivo con códigos de artículos */
    this.isDisplayUpload = false;

    // Aceptamos tanto File como el evento de p-fileUpload (event.files[0])
    const fileObj: File = (file instanceof File) ? file : (file?.files ? file.files[0] : file);

    if (!fileObj || !(fileObj instanceof File)) {
      this.swaCustomService.swaMsgInfo('Archivo inválido.');
      return;
    }

    if (fileObj.size === 0) {
      this.swaCustomService.swaMsgInfo('El archivo está vacío.');
      return;
    }

    // Leer archivo como texto con Promise para evitar callback nesting
    const readFileAsText = (f: File, encoding = 'utf-8'): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (ev: any) => resolve(ev.target.result as string || '');
        reader.onerror = (err) => reject(err);
        try {
          reader.readAsText(f, encoding);
        } catch (e) {
          reject(e);
        }
      });
    };

    readFileAsText(fileObj)
      .then((content) => {
        // Normalizar saltos, limpiar y obtener códigos únicos
        const codes = Array.from(new Set(
          (content || '')
            .split(/\r?\n/)
            .map(s => (s || '').trim().replace(/\r/g, ''))
            .filter(Boolean)
            .map(s => s.replace(/^\[|\]$/g, '').replace(/^"|"$/g, '').trim())
        ));

        if (codes.length === 0) {
          this.swaCustomService.swaMsgInfo('No se encontraron códigos válidos en el archivo.');
          return;
        }

        debugger

        // Si hay muchos códigos, podríamos hacer chunking aquí — por ahora concatenamos
        const itemCode = codes.join(',');

        // Ejecutar la búsqueda existente
        this.getListByCode(itemCode);
      })
      .catch((err) => {
        this.utilService.handleErrorSingle(err, 'onClickUpload', () => {}, this.swaCustomService);
      });
  }

  onClickCloseArticulo(): void {
    /** Cierra el modal de búsqueda de artículos */
    this.isVisualizarArticulo = false;
  }

  onOpenAlmacenOrigenItem(value: ISolicitudTraslado1, index: number): void {
    /** Abre el modal para seleccionar almacén origen de la línea indicada */
    this.indexAlmacenOrigen = index;
    this.itemCode = value.itemCode;
    this.isVisualizarAlmacenOrigen = !this.isVisualizarAlmacenOrigen;
  }

  onOpenAlmacenDestinoItem(value: ISolicitudTraslado1, index: number): void {
    /** Abre el modal para seleccionar almacén destino de la línea indicada */
    this.indexAlmacenDestino = index;
    this.itemCode = value.itemCode;
    this.isVisualizarAlmacenDestino = !this.isVisualizarAlmacenDestino;
  }

  onSelectedAlmacenOrigenItem(value: any): void {
    /** Maneja la selección de almacén origen desde el modal */
    this.modeloLines[this.indexAlmacenOrigen].fromWhsCod = value.whsCode;
    this.isVisualizarAlmacenOrigen = false;
  }

  onSelectedAlmacenDestinoItem(value: any): void {
    /** Maneja la selección de almacén destino desde el modal */
    this.modeloLines[this.indexAlmacenDestino].whsCode = value.whsCode;
    this.isVisualizarAlmacenDestino = false;
  }

  onClickCloseAlmacenOrigenItem(): void {
    /** Cierra el modal de búsqueda de almacén origen */
    this.isVisualizarAlmacenOrigen = false;
  }

  onClickCloseAlmacenDestinoItem(): void {
    /** Cierra el modal de búsqueda de almacén destino */
    this.isVisualizarAlmacenDestino = false;
  }

  //=======================================================================================================================
  //============================= INI: TIPO DE OPERACION ==================================================================
  //=======================================================================================================================
  onOpenTipoOperacionItem(index: number): void {
    /** Abre el modal para seleccionar tipo de operación de la línea indicada */
    this.indexTipoOperacion = index;
    this.isVisualizarTipoOperacion = true;
  }

  onSelectedTipoOperacionItem(value: any): void {
    /** Maneja la selección de tipo de operación desde el modal */
    const currentLine               = this.modeloLines[this.indexTipoOperacion];
    currentLine.u_tipoOpT12         = value.code;
    currentLine.u_tipoOpT12Nam      = value.u_descrp;
    this.isVisualizarTipoOperacion  = false;
  }

  onClickCloseTipoOperacionItem(): void {
    /** Cierra el modal de búsqueda de tipos de operación */
    this.isVisualizarTipoOperacion = false;
  }
  //=======================================================================================================================
  //============================= FIN: TIPO DE OPERACION ==================================================================
  //=======================================================================================================================

  onChangeQuantity(value: ISolicitudTraslado1, index: number): void {
    /** Actualiza cantidades en la línea con validación de decimales */
    if (value.itemCode === '') {
      this.modeloLines[index].quantity = 0;
      this.modeloLines[index].openQty = 0;
      this.modeloLines[index].u_FIB_OpQtyPkg = 0;
      return;
    }

    const quantity = this.utilService.onRedondearDecimal(value.quantity, 3);
    this.modeloLines[index].quantity = quantity;
    this.modeloLines[index].openQty = quantity;
    this.modeloLines[index].u_FIB_OpQtyPkg = quantity;
  }

  private validateSave(): boolean {
    /** Valida que el documento esté completo antes de guardar */
    const showError = (message: string): boolean => {
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

  private buildModelToSave(): SolicitudTrasladoCreateModel {
    /** Construye el modelo de solicitud de traslado para enviar al backend */
    const formValues = {
      ...this.modeloFormSn.getRawValue(),
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormOtr.getRawValue(),
      ...this.modeloFormPie.getRawValue()
    };

    const userId = this.userContextService.getIdUsuario();

    return {
      ...new SolicitudTrasladoCreateModel(),
      cardCode            : formValues.cardCode,
      cardName            : formValues.cardName,
      cntctCode           : formValues.cntctCode || 0,
      address             : formValues.address,
      docDate             : this.utilService.normalizeDate(formValues.docDate),
      docDueDate          : this.utilService.normalizeDate(formValues.docDueDate),
      taxDate             : this.utilService.normalizeDate(formValues.taxDate),
      u_FIB_IsPkg         : formValues.u_FIB_IsPkg ? 'Y' : 'N',
      filler              : formValues.filler?.value || formValues.filler || '',
      toWhsCode           : formValues.toWhsCode?.value || formValues.toWhsCode || '',
      u_FIB_TIP_TRAS      : formValues.u_FIB_TIP_TRAS?.value || formValues.u_FIB_TIP_TRAS || '',
      u_BPP_MDMT          : formValues.u_BPP_MDMT?.value || formValues.u_BPP_MDMT || '',
      u_BPP_MDTS          : formValues.u_BPP_MDTS?.value || formValues.u_BPP_MDTS || '',
      slpCode             : formValues.slpCode?.value || formValues.slpCode || -1,
      jrnlMemo            : formValues.jrnlMemo,
      comments            : formValues.comments,
      u_UsrCreate         : userId,
      lines               : this.modeloLines
      .filter(line => line.itemCode !== '')
      .map(line => ({
        itemCode          : line.itemCode,
        dscription        : line.dscription,
        fromWhsCod        : line.fromWhsCod,
        whsCode           : line.whsCode,
        u_tipoOpT12       : line.u_tipoOpT12,
        unitMsr           : line.unitMsr,
        quantity          : line.quantity,
        openQty           : line.openQty,
        u_FIB_OpQtyPkg    : line.u_FIB_OpQtyPkg,
        idUsuarioCreate   : userId
      }))
    };
  }

  private save(): void {
    // Persiste el documento al servicio backend si los detalles son válidos
    if (!this.validateSave()) {
      return;
    }

    this.isSaving = true;

    const modeloToSave = this.buildModelToSave();

    this.solicitudTrasladoService.setCreate(modeloToSave)
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
  // UI Actions
  // ===========================

  onClickSave(): void {
    /** Muestra diálogo de confirmación antes de guardar el documento */
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
    /** Navega de vuelta a la lista de solicitudes de traslado */
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-list']);
  }
}
