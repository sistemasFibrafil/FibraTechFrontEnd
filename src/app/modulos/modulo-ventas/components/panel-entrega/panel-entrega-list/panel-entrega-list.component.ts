import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, map, Observable, of, Subject, take, takeUntil } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { DeliveryNotesFilterModel } from '@app/modulos/modulo-ventas/models/sap-business-one/delivery-notes.model';

import { MenuItem, TableColumn } from '@app/interface/common-ui.interface';
import { IExchangeRates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';
import { IDeliveryNotesQuery } from '@app/modulos/modulo-ventas/interfaces/sap-business-one/delivery-notes.interface';

import { UtilService } from '@app/services/util.service';
import { LocalDataService } from '@app/services/local-data.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
import { DeliveryNotesService } from '@app/modulos/modulo-ventas/services/sap-business-one/delivery-notes.service';
import { ExchangeRatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';



@Component({
  selector: 'app-ven-panel-entrega-list',
  templateUrl: './panel-entrega-list.component.html',
  styleUrls: ['./panel-entrega-list.component.css']
})
export class PanelEntregaListComponent implements OnInit, OnDestroy {
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
  isCancel                                      : boolean = false;
  isClosing                                     : boolean = false;
  isDisplay                                     : boolean = false;
  isDisplayVisor                                : boolean = false;
  isDisplayGenerandoVisor                       : boolean = false;


  // ===========================
  // 🔹 5. UI DATA
  // ===========================
  isDataBlob                                    : Blob | null = null;


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
  modelo                                        : IDeliveryNotesQuery[] = [];
  modeloSelected                                : IDeliveryNotesQuery | null = null;


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
  titulo                                        : string = 'Entrega de Venta';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly deliveryNotesService: DeliveryNotesService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    public  readonly utilService: UtilService
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

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-entrega-list');
  }

  private onBuildColumn() {
    this.columnas = [
      { field: 'docNum',        header: 'Número' },
      { field: 'docStatus',     header: 'Estado' },
      { field: 'u_BPP_MDCD',    header: 'Guía' },
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

  private opcionesTabla() {
    this.opciones = [
      { value: '1', label: 'Ver',         icon: 'pi pi-eye',      command: () => { this.onClickVer(); } },
      { value: '2', label: 'Editar',      icon: 'pi pi-pencil',   command: () => { this.onClickEditar(); } },
      { value: '3', label: 'Cerrar',      icon: 'pi pi-times',    command: () => { this.onClickCerrar(); } },
      { value: '4', label: 'Cancelar',    icon: 'pi pi-ban',      command: () => { this.onClickCancelar(); } },
      { value: '5', label: 'Imprimir',    icon: 'pi pi-print',    command: () => { this.onClickPrint(); } },
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

  onToItemSelected(modelo: IDeliveryNotesQuery): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  private validateSelection(): boolean {
    if (!this.modeloSelected) {
      this.swaCustomService.swaMsgInfo('Debe seleccionar un registro');
      return false;
    }
    return true;
  }

  private updateMenuVisibility(modelo: IDeliveryNotesQuery): void {
    // Determine basic flags based on document state and permissions
    const isView      = !(this.buttonAcces.btnVer);
    const isEditable  = !(this.buttonAcces.btnEditar);
    const isClose     = !(this.buttonAcces.btnCerrar || modelo.docStatus !== 'O');
    const isCancel    = !(this.buttonAcces.btnCancelar || modelo.docStatus !== 'O');

    this.opcionesMap.get('Ver')!.visible    = isView;
    this.opcionesMap.get('Editar')!.visible = isEditable;
    this.opcionesMap.get('Cerrar')!.visible = isClose;
    this.opcionesMap.get('Cancelar')!.visible = isCancel;
  }

  //#endregion




  //#region <<< 4. LOAD DATA / FILTERS >>>

  onClickBuscar(): void {
    this.loadData();
  }

  private loadData(): void {
      this.isDisplay = true;

    this.deliveryNotesService.getListByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: IDeliveryNotesQuery[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(): DeliveryNotesFilterModel {
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

  getEstado(modelo: IDeliveryNotesQuery) {
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

  getGroupType(modelo: IDeliveryNotesQuery) {
    const groupCode = Number(modelo?.groupCode);

    return groupCode === this.codGrpCustFor
      ? { text: 'Exportación', class: 'type-exportacion' }
      : { text: 'Nacional', class: 'type-nacional' };
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
      this.router.navigate(['/main/modulo-ven/panel-entrega-create'], { state: { mode: 'create' } });
    });
  }

  onClickVer(){
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-ven/panel-entrega-view', this.modeloSelected!.docEntry]);
    });
  }

  onClickEditar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-ven/panel-entrega-edit', this.modeloSelected!.docEntry]);
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

  close(): void {
    this.isClosing = true;

    const param = {
      docEntry: this.modeloSelected!.docEntry,
      u_UsrClose: this.userContextService.getIdUsuario()
    };

    this.deliveryNotesService
    .setClose(param)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.isClosing = false))
    )
    .subscribe({
      next: () => {
        this.loadData();
        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) =>
        this.utilService.handleErrorSingle(e, 'close', this.swaCustomService)
    });
  }

  onClickCancelar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.swaCustomService.swaConfirmation(
        this.globalConstants.titleCancelar,
        this.globalConstants.subTitleCancelar,
        this.globalConstants.icoSwalQuestion
      ).then((result) => {
        if (result.isConfirmed) {
          this.cancel();
        }
      });
    });
  }

  cancel(): void {
    this.isCancel = true;

    const param = {
      docEntry: this.modeloSelected!.docEntry,
      u_UsrCreate: this.userContextService.getIdUsuario(),
      u_UsrCancel: this.userContextService.getIdUsuario()
    };

    this.deliveryNotesService
    .setCancel(param)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.isCancel = false))
    )
    .subscribe({
      next: () => {
        this.loadData();
        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) =>
        this.utilService.handleErrorSingle(e, 'cancel', this.swaCustomService)
    });
  }

  //#endregion




  //#region <<< 8. PRINT / VISOR >>>

  onClickPrint(): void {
    if (!this.validateSelection()) return;

    this.isDisplayGenerandoVisor = true;

    const docEntry  = this.modeloSelected!.docEntry;
    const groupCode = Number(this.modeloSelected!.groupCode);

    const request$ =
    groupCode === this.codGrpCustFor
    ? this.deliveryNotesService.getPrintExportDocEntry(docEntry)
    : this.deliveryNotesService.getPrintNationalDocEntry(docEntry);

    request$
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
        this.utilService.handleErrorSingle(e, 'onClickPrint', this.swaCustomService);
      }
    });
  }

  //#endregion
}
