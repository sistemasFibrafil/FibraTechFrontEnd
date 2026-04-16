import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { HttpEventType } from '@angular/common/http';
import { Subject, of, Observable, takeUntil } from 'rxjs';
import { catchError, finalize, map, take } from 'rxjs/operators';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { DeliveryNotesFilterModel } from '../../../models/sap-business-one/delivery-notes.model';

import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IDeliveryNotesQuery } from '../../../interfaces/sap-business-one/delivery-notes.interface';
import { IExchangeRates } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';

import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { DeliveryNotesService } from '../../../services/sap-business-one/delivery-notes.service';
import { ExchangeRatesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';


@Component({
  selector: 'app-ven-panel-entrega-list',
  templateUrl: './panel-entrega-list.component.html',
  styleUrls: ['./panel-entrega-list.component.css']
})
export class PanelEntregaListComponent implements OnInit {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               : string = 'Entrega de Venta';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  codGrpCustNat                                 : number = 0;
  codGrpCustFor                                 : number = 0;

  // UI State
  isCancel                                     : boolean = false;
  isClosing                                     : boolean = false;
  isDisplay                                     : boolean = false;
  isDisplayVisor                                : boolean = false;
  isDisplayGenerandoVisor                       : boolean = false;

  // Table configuration
  opciones                                      : MenuItem[] = [];
  columnas                                      : TableColumn[] = [];
  private opcionesMap                           : Map<string, MenuItem>;

  docStatusList                                 : SelectItem[] = [];

  // Paginación de la tabla
  rows                                          = 20;
  rowsPerPageOptions                            = [20, 40, 60, 80, 100];

  // Data
  modelo                                        : IDeliveryNotesQuery[] = [];
  modeloSelected                                : IDeliveryNotesQuery;

  isDataBlob                                    : Blob;

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


  ngOnInit() {
    this.initializeComponent();
  }

  // ===========================
  // Initialization
  // ===========================

  private initializeComponent(): void {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
    this.loadStatusList();

    this.codGrpCustNat = this.userContextService.getCodGrpCustNat();
    this.codGrpCustFor = this.userContextService.getCodGrpCustFor();

    if (!this.buttonAcces.btnBuscar) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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

  onBuildColumn() {
    this.columnas = [
      { field: 'docNum',        header: 'Número' },
      { field: 'docStatus',     header: 'Estado' },
      { field: 'u_BPP_MDCD',    header: 'Guía' },
      { field: 'docDate',       header: 'Fecha de contabilización' },
      { field: 'docDueDate',    header: 'Fecha de entrega' },
      { field: 'taxDate',       header: 'Fecha de documento' },
      { field: 'groupCode',     header: 'Tipo venta' },
      { field: 'cardCode',      header: 'Código de cliente' },
      { field: 'cardName',      header: 'Nombre de cliente' },
      { field: 'slpName',       header: 'Vendedor' },
      { field: 'docCur',        header: 'Moneda' },
      { field: 'docTotal',      header: 'Total MN' },
      { field: 'docTotalSy',    header: 'Total ME' }
    ];
  }

  opcionesTabla() {
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

  // ===========================
  // Table Events
  // ===========================

  onToItemSelected(modelo: IDeliveryNotesQuery): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  // ===========================
  // Data Operations
  // ===========================

  private loadStatusList(): void {
    const statuses = this.localDataService.getListStatusDocuments();
    this.docStatusList = statuses.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('docStatus').setValue(statuses);
  }

  // ===========================
  // Data Operations
  // ===========================

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

  // ===========================
  // UI Actions
  // ===========================

  onClickBuscar(): void {
    this.loadData();
  }

  getEstado(modelo: any) {
    const reglas = [
      {
        cond: () => modelo.canceled === 'Y',
        value: { text: 'Cancelado', class: 'estado-cancelado' }
      },
      {
        cond: () => modelo.docStatus === 'O',
        value: { text: 'Abierto', class: 'estado-abierto' }
      },
      {
        cond: () => modelo.docStatus === 'C',
        value: { text: 'Cerrado', class: 'estado-cerrado' }
      }
    ];

    return reglas.find(r => r.cond())?.value ?? { text: '', class: '' };
  }

  getGroupType(modelo: any) {
    const reglas = [
      {
        cond: () => modelo?.groupCode != this.codGrpCustFor,
        value: { text: 'Nacional', class: 'type-nacional' }
      },
      {
        cond: () => modelo?.groupCode == this.codGrpCustFor,
        value: { text: 'Exportación', class: 'type-exportacion' }
      }
    ];

    return reglas.find(r => r.cond())?.value ?? { text: '', class: '' };
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
      this.router.navigate(['/main/modulo-ven/panel-entrega-create'], { state: { mode: 'create' } });
    });
  }

  onClickVer(){
    if (!this.validateSelection()) return;

    this.router.navigate(['/main/modulo-ven/panel-entrega-view', this.modeloSelected.docEntry]);
  }

  onClickEditar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-ven/panel-entrega-edit', this.modeloSelected.docEntry]);
    });
  }

  close(): void {
    this.isClosing = true;

    const userId        = this.userContextService.getIdUsuario();
    const { docEntry }  = this.modeloSelected;

    const param = {
      docEntry,
      u_UsrClose: userId
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

  cancel(): void {
    this.isCancel = true;

    const userId        = this.userContextService.getIdUsuario();
    const { docEntry }  = this.modeloSelected;

    const param = {
      docEntry,
      u_UsrCreate: userId,
      u_UsrCancel: userId
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

  onClickPrint(): void {
    if (!this.validateSelection()) {
      return;
    }

    if (!this.validateSelection()) return;


    const docEntry  = this.modeloSelected.docEntry;
    const groupCode = Number(this.modeloSelected.groupCode);

    // Solo 115 usa formato exportación, todo lo demás es nacional
    const request$ =
      groupCode === 115
        ? this.deliveryNotesService.getPrintExportDocEntry(docEntry)
        : this.deliveryNotesService.getPrintNationalDocEntry(docEntry);

    this.isDisplayGenerandoVisor = true;

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
}
