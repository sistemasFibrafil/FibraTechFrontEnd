import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, map, Observable, of, Subject, take, takeUntil } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { OrdersFilterModel } from '@app/modulos/modulo-ventas/models/sap-business-one/orders.model';

import { TableColumn, MenuItem } from '@app/interface/common-ui.interface';
import { IOrdersQuery } from '@app/modulos/modulo-ventas/interfaces/sap-business-one/orders.interface';
import { IExchangeRates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';

import { UtilService } from '@app/services/util.service';
import { LocalDataService } from '@app/services/local-data.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
import { OrdersService } from '@app/modulos/modulo-ventas/services/sap-business-one/orders.service';
import { ExchangeRatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';



@Component({
  selector: 'app-ven-panel-orden-venta-list',
  templateUrl: './panel-orden-venta-list.component.html',
  styleUrls: ['./panel-orden-venta-list.component.css']
})
export class PanelOrdenVentaListComponent implements OnInit, OnDestroy {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly destroy$                     = new Subject<void>();


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();


  // ===========================
  // 🔹 3. FORMS
  // ===========================
  modeloForm                                    : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isClosing                                     : boolean = false;
  isDisplay                                     : boolean = false;
  isDeleting                                    : boolean = false;
  isDisplayVisor                                : boolean = false;
  isDisplayGenerandoVisor                       : boolean = false;


  // ===========================
  // 🔹 5. UI DATA
  // ===========================
  isDataBlob: Blob | null = null;


  // ===========================
  // 🔹 6. TABLE CONFIG
  // ===========================
  opciones                                      : MenuItem[] = [];
  columnas                                      : TableColumn[] = [];
  opcionesMap                                   : Map<string, MenuItem>;
  rowsPerPageOptions                            = [20, 40, 60, 80, 100];


  // ===========================
  // 🔹 7. DATA (CORE)
  // ===========================
  modelo                                        : IOrdersQuery[] = [];
  modeloSelected                                : IOrdersQuery | null = null;


  // ===========================
  // 🔹 8. COMBOS / LISTS
  // ===========================
  docStatusList                                 : SelectItem[] = [];


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
  rows                                          : number = 20;
  codGrpCustNat                                 : number = 0;
  codGrpCustFor                                 : number = 0;


  // ===========================
  // 🔹 10. TEXT / AUX / FILTERS
  // ===========================
  titulo                                        : string = 'Orden de Venta';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly ordersService: OrdersService,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  //#endregion




  //#region <<< 2. INITIALIZATION >>>

  private initializeComponent(): void {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
    this.loadStatusList();

    this.codGrpCustNat = Number(this.userContextService.getCodGrpCustNat());
    this.codGrpCustFor = Number(this.userContextService.getCodGrpCustFor());

    if (!this.buttonAcces.btnBuscar) {
      this.loadData();
    }
  }

  private onBuildForm(): void {
    this.modeloForm = this.fb.group({
      startDate   : [this.utilService.firstDayMonth(), Validators.required],
      endDate     : [this.utilService.currentDate(), Validators.required],
      docStatus   : ['', Validators.required],
      searchText  : ['']
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-orden-venta-list');
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'docNum',        header: 'Número' },
      { field: 'docStatus',     header: 'Estado' },
      { field: 'docType',       header: 'Clase' },
      { field: 'docDate',       header: 'Fecha de contabilización' },
      { field: 'docDueDate',    header: 'Fecha de entrega' },
      { field: 'groupCode',     header: 'Tipo venta' },
      { field: 'cardCode',      header: 'Código de cliente' },
      { field: 'cardName',      header: 'Nombre de cliente' },
      { field: 'slpName',       header: 'Vendedor' },
      { field: 'docTotal',      header: 'Total MN' },
      { field: 'docTotalSy',    header: 'Total ME' }
    ];
  }

  private opcionesTabla(): void {
    this.opciones = [
      { value: '1', label: 'Ver',                   icon: 'pi pi-eye',      command: () => { this.onClickVer(); } },
      { value: '2', label: 'Editar',                icon: 'pi pi-pencil',   command: () => { this.onClickEditar(); } },
      { value: '3', label: 'Cerrar',                icon: 'pi pi-times',    command: () => { this.onClickCerrar(); } },
      { value: '4', label: 'Nacional',              icon: 'pi pi-print',    command: () => { this.onClickPrintNational(); } },
      { value: '5', label: 'Exp. Planta',           icon: 'pi pi-print',    command: () => { this.onClickPrintExportPlanta(); } },
      { value: '6', label: 'Exp. Cliente',          icon: 'pi pi-print',    command: () => { this.onClickPrintExportCliente(); } },
    ];

    // Mapa para controlar visibilidad de opciones por etiqueta
    this.opcionesMap = new Map(this.opciones.map(op => [op.label, op]));
  }

  private loadStatusList(): void {
    const statuses = this.localDataService.statusDocuments;
    this.docStatusList = statuses.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('docStatus')?.setValue(statuses);
  }

  //#endregion




  //#region <<< 3. TABLE / MENU >>>

  onToItemSelected(modelo: IOrdersQuery): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  private updateMenuVisibility(modelo: IOrdersQuery): void {
    // Determine basic flags based on document state and permissions
    const isEditable  = !(this.buttonAcces.btnEditar);
    const isClose     = !(this.buttonAcces.btnCerrar || modelo.docStatus !== 'O');

    this.opcionesMap.get('Ver')!.visible    = !this.buttonAcces.btnVer;
    this.opcionesMap.get('Editar')!.visible = isEditable;
    this.opcionesMap.get('Cerrar')!.visible = isClose;

    // 🔹 NUEVA LÓGICA PARA IMPRESIÓN
    const isExport = Number(modelo.groupCode) == this.codGrpCustFor;

    this.opcionesMap.get('Nacional')!.visible        = !isExport;
    this.opcionesMap.get('Exp. Planta')!.visible     = isExport;
    this.opcionesMap.get('Exp. Cliente')!.visible    = isExport;
  }

  private validateSelection(): boolean {
    if (!this.modeloSelected) {
      this.swaCustomService.swaMsgInfo('Debe seleccionar un registro');
      return false;
    }
    return true;
  }

  //#endregion




  //#region <<< 4. LOAD DATA / FILTERS >>>

  onClickBuscar(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isDisplay = true;

    this.ordersService
    .getListByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: IOrdersQuery[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(): OrdersFilterModel {
    const {
      startDate,
      endDate,
      docStatus,
      searchText
    } = this.modeloForm.getRawValue();

    return {
      startDate,
      endDate,
      docStatus: (docStatus || []).map(x => x.code).join(','),
      searchText
    };
  }

  //#endregion




  //#region <<< 5. UI HELPERS >>>

  getEstado(modelo: IOrdersQuery) {
    if (modelo.canceled === 'Y') {
      return { text: 'Cancelado', class: 'estado-cancelado' };
    }

    if (modelo.docStatus === 'O') {
      return { text: 'Abierto', class: 'estado-abierto' };
    }

    if (modelo.docStatus === 'C') {
      return { text: 'Cerrado', class: 'estado-cerrado' };
    }

    return { text: '', class: '' };
  }

  getGroupType(modelo: IOrdersQuery) {
    const groupCode = Number(modelo?.groupCode);

    return groupCode === this.codGrpCustFor
      ? { text: 'Exportación', class: 'type-exportacion' }
      : { text: 'Nacional', class: 'type-nacional' };
  }

  getDocType(modelo: IOrdersQuery) {
    return modelo.docType === 'I'
      ? { text: 'Artículos', class: 'docType-articulos' }
      : { text: 'Servicios', class: 'docType-servicios' };
  }

  //#endregion




  //#region <<< 6. TIPO CAMBIO >>>

  private fetchTipoCambioRate(): Observable<IExchangeRates | null> {
    const docDate: Date = new Date();
    const sysCurrncy    = this.userContextService.getSysCurrncy();

    if (!docDate) {
      return of(null);
    }

    const params = {
      rateDate: this.utilService.normalizeDateOrToday(docDate),
      currency: '', // Se envía vacío por diseño (backend define moneda)
      sysCurrncy
    };

    return this.exchangeRatesService.getByDocDateAndCurrency(params)
    .pipe(
      map(data => data ?? null),
      catchError(() => of(null))
    );
  }

  private validarTipoCambioYContinuar(continuar: () => void): void {
    this.fetchTipoCambioRate()
    .pipe(take(1))
    .subscribe(rate => {
      if (!rate || rate.sysRate === 0) {
        this.swaCustomService.swaMsgInfo(
          'Falta registrar el tipo de cambio de hoy en SAP Business One.'
        );
        return;
      }

      // ✅ Si pasa la validación
      continuar();
    });
  }

  //#endregion




  //#region <<< 7. ACTIONS >>>

  onClickCreate() {
    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-ven/panel-orden-venta-create'], { state: { mode: 'create' } });
    });
  }

  onClickVer(): void {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-ven/panel-orden-venta-view', this.modeloSelected!.docEntry]);
    });
  }

  onClickEditar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-ven/panel-orden-venta-edit', this.modeloSelected!.docEntry]);
    });
  }

  onClickCerrar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.swaCustomService.swaConfirmation(
        this.globalConstants.titleCerrar,
        this.globalConstants.subTitleCerrar,
        this.globalConstants.icoSwalQuestion
      ).then((result) => {
        if (result.isConfirmed) {
          this.close();
        }
      });
    });
  }

  private close(): void {
    this.isClosing = true;

    const param = {
      docEntry: this.modeloSelected!.docEntry,
      u_UsrClose: this.userContextService.getIdUsuario()
    };

    this.ordersService
    .setClose(param)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isClosing = false)
    )
    .subscribe({
      next: () => {
        this.loadData();
        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  //#endregion




  //#region <<< 8. PRINT / VISOR >>>

  private printDocument(request$: Observable<any>, errorContext: string): void {
    if (!this.validateSelection()) return;

    this.isDisplayGenerandoVisor = true;

    request$
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplayGenerandoVisor = false)
    )
    .subscribe({
      next: (resp: any) => {
        if (resp.type === HttpEventType.Response) {
          this.isDataBlob = new Blob([resp.body], { type: resp.body.type });
          this.isDisplayVisor = true;
        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, errorContext, this.swaCustomService);
      }
    });
  }

  private onClickPrintNational(): void {
    this.printDocument(
      this.ordersService.getPrintNationalDocEntry(this.modeloSelected!.docEntry),
      'onClickPrintNational'
    );
  }

  private onClickPrintExportPlanta(): void {
    this.printDocument(
      this.ordersService.getPrintExportPlantaDocEntry(this.modeloSelected!.docEntry),
      'onClickPrintExportPlanta'
    );
  }

  private onClickPrintExportCliente(): void {
    this.printDocument(
      this.ordersService.getPrintExportClienteDocEntry(this.modeloSelected!.docEntry),
      'onClickPrintExportCliente'
    );
  }

  //#endregion
}
