import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, map, Observable, of, Subject, take, takeUntil } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { InventoryTransferRequestFilterModel } from '@app/modulos/modulo-inventario/models/inventory-transfer-request.model';

import { TableColumn, MenuItem } from '@app/interface/common-ui.interface';
import { IExchangeRates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';
import { IInventoryTransferRequest } from '@app/modulos/modulo-inventario/interfaces/inventory-transfer-request.interface';

import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { LocalDataService } from '@app/services/local-data.service';
import { UserContextService } from '@app/services/user-context.service';
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
import { ExchangeRatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';
import { InventoryTransferRequestService } from '@app/modulos/modulo-inventario/services/inventory-transfer-request.service';


@Component({
  selector: 'app-inv-panel-solicitud-traslado-list',
  templateUrl: './panel-solicitud-traslado-list.component.html',
  styleUrls: ['./panel-solicitud-traslado-list.component.css']
})
export class PanelSolicitudTrasladoListComponent implements OnInit, OnDestroy {
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
  isDisplay                                     = false;
  isClosing                                     = false;
  isDisplayVisor                                = false;
  isDisplayGenerandoVisor                       = false;


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
  modelo                                        : IInventoryTransferRequest[] = [];
  modeloSelected                                : IInventoryTransferRequest | null = null;


  // ===========================
  // 🔹 8. COMBOS / LISTS
  // ===========================
  docStatusList                                 : SelectItem[] = [];


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
  rows                                          = 20;


  // ===========================
  // 🔹 10. TEXT / AUX / FILTERS
  // ===========================
  titulo                                        : string = 'Solicitud de Traslado';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly InventoryTransferRequestService: InventoryTransferRequestService,
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
    this.buildForms();
    this.onBuildColumn();
    this.opcionesTabla();
    this.loadStatusList();

    if (!this.buttonAcces.btnBuscar) {
      this.loadData();
    }
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      startDate     : [this.utilService.firstDayMonth(), Validators.required],
      endDate       : [this.utilService.currentDate(), Validators.required],
      docStatus     : ['', Validators.required],
      searchText    : ['']
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-solicitud-traslado-list');
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'docNum',        header: 'Número' },
      { field: 'docStatus',     header: 'Estado' },
      { field: 'u_FIB_IsPkg',   header: '¿Picking?' },
      { field: 'docDate',       header: 'Fecha de contabilización' },
      { field: 'docDueDate',    header: 'Fecha de entrega' },
      { field: 'filler',        header: 'De almacén' },
      { field: 'toWhsCode',     header: 'Almacén destino' }
    ];
  }

  private opcionesTabla(): void {
    this.opciones = [
      { value: '1', label: 'Ver',       icon: 'pi pi-eye',                    command: () => this.onClickVer() },
      { value: '2', label: 'Editar',    icon: 'pi pi-pencil',                 command: () => this.onClickEditar() },
      { value: '3', label: 'Cerrar',    icon: 'pi pi-times',                  command: () => this.onClickCerrar() },
      { value: '4', label: 'Formato',   icon: 'pi pi-print',                  command: () => this.onClickImprimir() },
      { value: '5', label: 'Transferir',icon: 'pi pi-arrow-right-arrow-left', command: () => this.onClickTransferir() },
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

  onSelectedItem(modelo: IInventoryTransferRequest): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  private updateMenuVisibility(modelo: IInventoryTransferRequest): void {
    const isOpen        = modelo.docStatus === 'O';
    // Si u_FIB_IsPkg es null/undefined/empty lo consideramos 'N' (no picking)
    const pkgFlag       = modelo?.u_FIB_IsPkg;
    const isNotPicking  = (pkgFlag === undefined || pkgFlag === null || (typeof pkgFlag === 'string' && pkgFlag.trim() === '')) ? true : pkgFlag === 'N';

    this.opcionesMap.get('Ver')!.visible        = !this.buttonAcces.btnVer;
    this.opcionesMap.get('Editar')!.visible     = !this.buttonAcces.btnEditar;
    this.opcionesMap.get('Cerrar')!.visible     = !this.buttonAcces.btnCerrar && isOpen;
    this.opcionesMap.get('Formato')!.visible    = !this.buttonAcces.btnImprimir;
    this.opcionesMap.get('Transferir')!.visible = !this.buttonAcces.btnTransferir && isOpen && isNotPicking;
  }

  private validateSelection(): boolean {
    if (!this.modeloSelected) {
      this.swaCustomService.swaMsgInfo('Debe seleccionar al menos un registro');
      return false;
    }
    return true;
  }

  //#endregion




  //#region <<< 4. LOAD DATA / FILTERS >>>

  onClickBuscar(): void {
    this.loadData();
  }

  loadData(): void {
    this.isDisplay = true;

    this.InventoryTransferRequestService
      .getListByFilter(this.buildFilterParams())
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.isDisplay = false)
      )
      .subscribe({
        next: (data: IInventoryTransferRequest[]) => {
          this.modelo = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
        }
      });
  }

  private buildFilterParams(): InventoryTransferRequestFilterModel {
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

  getEstado(modelo: IInventoryTransferRequest) {
    if (modelo.docStatus === 'O') {
      return { text: 'Abierto', class: 'estado-abierto' };
    }

    if (modelo.docStatus === 'C') {
      return { text: 'Cerrado', class: 'estado-cerrado' };
    }

    return { text: '', class: '' };
  }

  getPickingType(modelo: IInventoryTransferRequest) {
    const isPicking = modelo?.u_FIB_IsPkg ?? 'N';

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
      this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-create'], { state: { mode: 'create' } });
    });
  }

  onClickVer(): void {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-view', this.modeloSelected!.docEntry]);
    });
  }

  onClickEditar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-edit', this.modeloSelected!.docEntry]);
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
      docEntry: this.modeloSelected.docEntry,
      u_UsrClose: this.userContextService.getIdUsuario()
    };

    this.InventoryTransferRequestService
      .setClose(param)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isClosing = false;
        })
      )
      .subscribe({
        next: () => {
          this.loadData();
          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'close', this.swaCustomService);
        }
      });
  }

  onClickTransferir(): void {
    if (!this.validateSelection()) return;
    this.InventoryTransferRequestService.getToTransferenciaByDocEntry(this.modeloSelected.docEntry)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        sessionStorage.setItem('SolicitudCopyTo',JSON.stringify(data));

        this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-create'], { state: { solicitud: data } });
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onClickTransferir', this.swaCustomService);
      }
    });
  }

  //#endregion



  //#region <<< 8. PRINT / VISOR >>>

  onClickImprimir(): void {
    if (!this.validateSelection()) return;

    this.isDisplayGenerandoVisor = true;

    this.InventoryTransferRequestService
      .getFormatoPdfByDocEntry(this.modeloSelected.docEntry)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDisplayGenerandoVisor = false;
        })
      )
      .subscribe({
        next: (resp: any) => {
          if (resp.type === HttpEventType.Response) {
            this.isDataBlob = new Blob([resp.body], { type: resp.body.type });
            this.isDisplayVisor = true;
          }
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onClickImprimir', this.swaCustomService);
        }
      });
  }

  //#endregion
}
