import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, map, Observable, of, Subject, take, takeUntil } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { StockTransfersFilterModel } from '@app/modulos/modulo-inventario/models/stock-transfers.model';

import { TableColumn, MenuItem } from '@app/interface/common-ui.interface';
import { IStockTransfers, IStockTransfersQuery } from '@app/modulos/modulo-inventario/interfaces/stock-transfers.interface';
import { IExchangeRates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';

import { UtilService } from '@app/services/util.service';
import { LocalDataService } from '@app/services/local-data.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
import { PickingService } from '@app/modulos/modulo-inventario/services/picking.service';
import { StockTransfersService } from '@app/modulos/modulo-inventario/services/stock-transfers.service';
import { ExchangeRatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';
import { GuiaElectronicaSapService } from '@app/modulos/modulo-facturacion-electronica/services/guia-electronica-sap.service';
import { FacturacionElectronicaSapService } from '@app/modulos/modulo-facturacion-electronica/services/facturacion-electronica.service';



@Component({
  selector: 'app-inv-panel-transferencia-stock-list',
  templateUrl: './panel-transferencia-stock-list.component.html',
  styleUrls: ['./panel-transferencia-stock-list.component.css']
})
export class PanelPanelTransferenciaStockListComponent implements OnInit, OnDestroy {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly destroy$         = new Subject<void>();


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  buttonAcces                       : ButtonAcces = new ButtonAcces();
  globalConstants                   : GlobalsConstantsForm = new GlobalsConstantsForm();


  // ===========================
  // 🔹 3. FORMS
  // ===========================
  modeloForm                        : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isDisplay                         = false;
  isClosing                         = false;
  isDisplayVisor                    = false;
  isDisplayGenerandoVisor           = false;


  // ===========================
  // 🔹 5. UI DATA
  // ===========================
  isDataBlob: Blob | null = null;


  // ===========================
  // 🔹 6. TABLE CONFIG
  // ===========================
  columnas                          : TableColumn[];
  opciones                          : MenuItem[];
  opcionesMap                       : Map<string, MenuItem>;
  rowsPerPageOptions                = [20, 40, 60, 80, 100];


  // ===========================
  // 🔹 7. DATA (CORE)
  // ===========================
    modelo                            : IStockTransfersQuery[] = [];
    modeloSelected                    : IStockTransfersQuery | null = null;


  // ===========================
  // 🔹 8. COMBOS / LISTS
  // ===========================
  docStatusList                     : SelectItem[] = [];


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
  rows                              = 20;


  // ===========================
  // 🔹 10. TEXT / AUX / FILTERS
  // ===========================
  tituloVisor                       : string = '';
  titulo                            : string = 'Transferencia de Stock';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly pickingService: PickingService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly stockTransfersService: StockTransfersService,
    private readonly guiaElectronicaSapService: GuiaElectronicaSapService,
    private readonly facturacionElectronicaSapService: FacturacionElectronicaSapService,
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
    this.buildForm();
    this.buildColumns();
    this.buildMenuOptions();
    this.loadStatusList();

    if (!this.buttonAcces.btnBuscar) {
      this.loadData();
    }
  }

  private buildForm(): void {
    this.modeloForm = this.fb.group({
      startDate     : [this.utilService.firstDayMonth(), Validators.required],
      endDate       : [this.utilService.currentDate(), Validators.required],
      docStatus     : ['', Validators.required],
      searchText    : ['']
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-transferencia-stock-list');
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'docNum',              header: 'Número' },
      { field: 'u_BPP_MDCD',          header: 'Guía' },
      { field: 'u_FIB_FromPkg',       header: '¿Picking?' },
      { field: 'docDate',             header: 'Fecha de contabilización' },
      { field: 'taxDate',             header: 'Fecha de traslado' },
      { field: 'filler',              header: 'De almacén' },
      { field: 'toWhsCode',           header: 'Almacén destino' },
      { field: 'u_FIB_EstadoSunat',   header: 'Estado SUNAT' },
    ];
  }

  private buildMenuOptions(): void {
    this.opciones = [
      { value: '1', label: 'Ver',       icon: 'pi pi-eye',      command: () => this.onClickView() },
      { value: '2', label: 'Editar',    icon: 'pi pi-pencil',   command: () => this.onClickEdit() },
      { value: '3', label: 'Picking',   icon: 'pi pi-print',    command: () => this.onClickPrintPicking() },
      { value: '4', label: 'Formato',   icon: 'pi pi-print',    command: () => this.onClickPrintFormat() },
      { value: '5', label: 'Enviar',    icon: 'pi pi-send',     command: () => this.onClickSend() },
    ];
    this.opcionesMap = new Map(this.opciones.map(op => [op.label, op]));
  }

  private loadStatusList(): void {
    const statuses = this.localDataService.statusDocuments;
    this.docStatusList = statuses.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('docStatus')?.setValue(statuses);
  }

  //#endregion




  //#region <<< 3. TABLE / MENU >>>

  onSelectedItem(modelo: IStockTransfersQuery): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  private updateMenuVisibility(modelo: IStockTransfersQuery): void {
    const viewOption    = this.opcionesMap.get('Ver');
    const editOption    = this.opcionesMap.get('Editar');
    const pickingOption = this.opcionesMap.get('Picking');
    const formatOption  = this.opcionesMap.get('Formato');
    const sendOption    = this.opcionesMap.get('Enviar');

    if (viewOption) viewOption.visible        = !this.buttonAcces.btnVer;
    if (editOption) editOption.visible        = !this.buttonAcces.btnEditar;
    if (pickingOption) pickingOption.visible  = !this.buttonAcces.btnImprimirPickingList && modelo?.u_FIB_FromPkg === 'Y';
    if (formatOption) formatOption.visible    = !this.buttonAcces.btnImprimir;

    if (sendOption) {
      const estadoPermitido = ['0', '3', '4'].includes(
        (modelo?.u_FIB_EstadoSunat ?? '').toString()
      );

      const empiezaConT = (modelo?.u_BPP_MDSD ?? '')
        .toString()
        .trim()
        .toUpperCase()
        .startsWith('T');

      sendOption.visible = empiezaConT && estadoPermitido;
    }
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

    this.stockTransfersService
      .getListByFilter(this.buildFilterParams())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDisplay = false;
        })
      )
      .subscribe({
        next: (data: IStockTransfersQuery[]) => {
          this.modelo = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
        }
      });
  }

  private buildFilterParams(): StockTransfersFilterModel {
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

  getEstadoSunat(modelo: IStockTransfersQuery) {
    if (modelo.u_FIB_EstadoSunat === '0') {
      return { text: 'Pendiente', class: 'estado-sunat-pendiente' };
    }

    if (modelo.u_FIB_EstadoSunat === '1') {
      return { text: 'Enviado', class: 'estado-sunat-enviado' };
    }

    if (modelo.u_FIB_EstadoSunat === '2') {
      return { text: 'Aceptado', class: 'estado-suant-aceptado' };
    }

    if (modelo.u_FIB_EstadoSunat === '3') {
      return { text: 'Rechazado', class: 'estado-sunat-rechazado' };
    }

    if (modelo.u_FIB_EstadoSunat === '4') {
      return { text: 'Observado', class: 'estado-sunat-observado' };
    }

    return { text: '', class: '' };
  }

  getPickingType(modelo: IStockTransfers) {
    const isPicking = modelo?.u_FIB_FromPkg ?? 'N';

    return isPicking === 'Y'
      ? { text: 'Sí', class: 'picking-si' }
      : { text: 'No', class: 'picking-no' };
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
      this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-create'], { state: { mode: 'create' } });
    });
  }

  onClickView(): void {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-view', this.modeloSelected!.docEntry]);
    });
  }

  onClickEdit() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-edit', this.modeloSelected!.docEntry]);
    });
  }

  onClickEnviar(): void {
    if (!this.validateSelection()) return;

    this.isDisplay = true;

    const params = {
      cod1: this.modeloSelected.objType,
      id1: this.modeloSelected.docEntry
    };

    this.guiaElectronicaSapService
      .setEnviar(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDisplay = false;
        })
      )
      .subscribe({
        next: () => {
          this.swaCustomService.swaMsgExito(null);
          setTimeout(() => {
            this.loadData();
          }, 100);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onClickEnviar', this.swaCustomService);
        }
      });
  }

  //#endregion




  //#region <<< 8. PRINT / VISOR >>>

  private handlePdfResponse(resp: any): void {
    if (resp.type !== HttpEventType.Response || !resp.body) return;

    this.isDataBlob = new Blob([resp.body], { type: resp.body.type || 'application/pdf' });

    this.isDisplayVisor = true;
  }

  private printPdf(title: string, request$: Observable<any>, methodName: string): void {
    this.tituloVisor = title;
    this.isDisplayGenerandoVisor = true;

    request$
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplayGenerandoVisor = false)
    )
    .subscribe({
      next: resp => this.handlePdfResponse(resp),
      error: e => this.utilService.handleErrorSingle(
        e,
        methodName,
        this.swaCustomService
      )
    });
  }

  onClickPrintPicking(): void {
    if (!this.validateSelection()) return;

    const params = {
      u_TrgetEntry: this.modeloSelected!.docEntry,
      u_TargetType: Number(this.modeloSelected!.objType)
    };

    const request$ = this.pickingService.getPickingPrint(params);

    this.printPdf('PICKING LIST', request$, 'onClickPrintPicking');
  }

  onClickPrintFormat(): void {
    if (!this.validateSelection()) return;

    const request$ =
    this.stockTransfersService
    .getFormatoPdfByDocEntry(this.modeloSelected!.docEntry);

    this.printPdf('FORMATO DE REGISTRO', request$, 'onClickPrintFormat'
    );
  }

  onClickSend(): void {
    if (!this.validateSelection()) return;

    this.isDisplay = true;

    const value = {
      cod1: this.modeloSelected?.objType,
      id1 : this.modeloSelected?.docEntry
    };

    this.facturacionElectronicaSapService
    .setEnviar(value)
    .pipe(
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: () => {
        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {this.swaCustomService.swaMsgError(e?.error?.resultadoDescripcion ?? 'Ocurrió un error al enviar.');
      }
    });
  }

  //#endregion
}
