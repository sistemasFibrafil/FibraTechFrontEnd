import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Subject, of, Observable, takeUntil, map, catchError, take, finalize } from 'rxjs';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { StockTransfersFilterModel } from 'src/app/modulos/modulo-inventario/models/stock-transfers.model';

import { TableColumn, MenuItem } from 'src/app/interface/common-ui.interface';
import { IStockTransfers } from 'src/app/modulos/modulo-inventario/interfaces/stock-transfers.interface';
import { IExchangeRates } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';

import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { PickingService } from 'src/app/modulos/modulo-inventario/services/picking.service';
import { StockTransfersService } from 'src/app/modulos/modulo-inventario/services/stock-transfers.service';
import { ExchangeRatesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';
import { GuiaElectronicaSapService } from 'src/app/modulos/modulo-facturacion-electronica/services/guia-electronica-sap.service';



@Component({
  selector: 'app-inv-panel-transferencia-stock-list',
  templateUrl: './panel-transferencia-stock-list.component.html',
  styleUrls: ['./panel-transferencia-stock-list.component.css']
})
export class PanelPanelTransferenciaStockListComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$         = new Subject<void>();

  // Forms
  modeloForm                        : FormGroup;

  // Configuration
  readonly titulo                   = 'Transferencia de Stock';
  tituloVisor                       = '';
  buttonAcces                       : ButtonAcces = new ButtonAcces();
  globalConstants                   : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                         = false;
  isClosing                         = false;
  isDisplayVisor                    = false;
  isDisplayGenerandoVisor           = false;

  // Table configuration
  columnas                          : TableColumn[];
  opciones                          : MenuItem[];
  private opcionesMap               : Map<string, MenuItem>;

  docStatusList                     : SelectItem[] = [];

  // Data
  isDataBlob                        : Blob;

  modeloDelete                      : IStockTransfers;
  modeloSelected                    : IStockTransfers;

  modelo                            : IStockTransfers[] = [];

  // Paginación de la tabla
  rows                              = 20;
  rowsPerPageOptions                = [20, 40, 60, 80, 100];


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
    public  readonly utilService: UtilService,
  ) {}

  // ===========================
  // Lifecycle Hooks
  // ===========================

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // Initialization
  // ===========================

  private initializeComponent(): void {
    this.buildForm();
    this.buildColumns();
    this.buildMenuOptions();
    this.getListStatus();

    if (!this.buttonAcces.btnBuscar) {
      this.loadData();
    }
  }

  private buildForm(): void {
    const today = new Date();

    this.modeloForm = this.fb.group({
      startDate     : [new Date(today.getFullYear(), today.getMonth(), 1), Validators.required],
      endDate       : [new Date(), Validators.required],
      docStatus     : ['', Validators.required],
      searchText    : ['']
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-transferencia-stock-list');
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'docNum',          header: 'Número' },
      { field: 'u_BPP_MDCD',      header: 'Guía' },
      { field: 'u_FIB_FromPkg',   header: '¿Picking?' },
      { field: 'docDate',         header: 'Fecha de contabilización' },
      { field: 'taxDate',         header: 'Fecha de traslado' },
      { field: 'filler',          header: 'De almacén' },
      { field: 'toWhsCode',       header: 'Almacén destino' }
    ];
  }

  private buildMenuOptions(): void {
    this.opciones = [
      { value: '1', label: 'Ver',       icon: 'pi pi-eye',      command: () => this.onClickVer() },
      { value: '2', label: 'Editar',    icon: 'pi pi-pencil',   command: () => this.onClickEditar() },
      { value: '3', label: 'Picking',   icon: 'pi pi-print',    command: () => this.onClickImprimir2() },
      { value: '4', label: 'Formato',   icon: 'pi pi-print',    command: () => this.onClickImprimir1() },
    ];
    this.opcionesMap = new Map(this.opciones.map(op => [op.label, op]));
  }

  // ===========================
  // Helper Methods
  // ===========================

  private validateSelection(): boolean {
    if (!this.modeloSelected) {
      this.swaCustomService.swaMsgInfo('Debe seleccionar un registro');
      return false;
    }
    return true;
  }

  private updateMenuVisibility(modelo: IStockTransfers): void {
    const viewOption    = this.opcionesMap.get('Ver');
    const editOption    = this.opcionesMap.get('Editar');
    const pickingOption = this.opcionesMap.get('Picking');
    const formatOption  = this.opcionesMap.get('Formato');

    if (viewOption) viewOption.visible        = !this.buttonAcces.btnVer;
    if (editOption) editOption.visible        = !this.buttonAcces.btnEditar;
    if (pickingOption) pickingOption.visible  = !this.buttonAcces.btnImprimirPickingList && modelo?.u_FIB_FromPkg === 'Y';
    if (formatOption) formatOption.visible    = !this.buttonAcces.btnImprimir;
  }

  // ===========================
  // Table Events
  // ===========================

  onSelectedItem(modelo: IStockTransfers): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  // ===========================
  // Data Operations
  // ===========================
  private getListStatus(): void {
    const statuses = this.localDataService.getListStatusDocuments();
    this.docStatusList = statuses.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('docStatus')?.setValue(statuses);
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
        next: (data: IStockTransfers[]) => {
          this.modelo = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
        }
      });
  }

  // ===========================
  // UI Actions
  // ===========================

  onClickBuscar(): void {
    this.loadData();
  }

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

  onClickCreate() {
    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-create'], { state: { mode: 'create' } });
    });
  }

  onClickVer(): void {
    if (!this.validateSelection()) return;

    this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-view', this.modeloSelected.docEntry]);
  }

  onClickEditar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-edit', this.modeloSelected.docEntry]);
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

  private handlePdfResponse(resp: any): void {
  switch (resp.type) {
    case HttpEventType.DownloadProgress:
      // Progress tracking if needed
      break;

    case HttpEventType.Response:
      this.isDataBlob = new Blob([resp.body], { type: resp.body.type });
      this.isDisplayVisor = true;
      break;
  }
}

  onClickImprimir1(): void {
    if (!this.validateSelection()) return;

    this.tituloVisor = 'FORMATO DE REGISTRO';
    this.isDisplayGenerandoVisor = true;

    this.stockTransfersService
      .getFormatoPdfByDocEntry(this.modeloSelected.docEntry)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDisplayGenerandoVisor = false;
        })
      )
      .subscribe({
        next: (resp: any) => {
          this.handlePdfResponse(resp);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onClickImprimir1', this.swaCustomService);
        }
      });
  }

  onClickImprimir2(): void {
    if (!this.validateSelection()) return;

    this.tituloVisor = 'PICKING LIST';
    this.isDisplayGenerandoVisor = true;

    const params = {
      u_TrgetEntry: this.modeloSelected.docEntry,
      u_TargetType: Number(this.modeloSelected.objType)
    };

    this.pickingService
      .getPickingPrint(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDisplayGenerandoVisor = false;
        })
      )
      .subscribe({
        next: (resp: any) => {
          this.handlePdfResponse(resp);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onClickImprimir2', this.swaCustomService);
        }
      });
  }
}
