import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, map, Observable, of, Subject, take, takeUntil } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { InvoiceFilterModel } from '@app/modulos/modulo-ventas/models/sap-business-one/invoice.model';

import { MenuItem, TableColumn } from '@app/interface/common-ui.interface';
import { IInvoiceQuery } from '@app/modulos/modulo-ventas/interfaces/sap-business-one/invoice.interface';
import { IExchangeRates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';

import { UtilService } from '@app/services/util.service';
import { LocalDataService } from '@app/services/local-data.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
import { InvoicesService } from '@app/modulos/modulo-ventas/services/sap-business-one/invoices.service';
import { ExchangeRatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';



@Component({
  selector: 'app-ven-panel-factura-reserva-list',
  templateUrl: './panel-factura-reserva-list.component.html',
  styleUrls: ['./panel-factura-reserva-list.component.css']
})
export class PanelFacturaReservaListComponent implements OnInit, OnDestroy {
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
  modelo                                        : IInvoiceQuery[] = [];
  modeloSelected                                : IInvoiceQuery | null = null;


  // ===========================
  // 🔹 8. COMBOS / LISTS
  // ===========================
  docStatusList                                 : SelectItem[] = [];


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
  rows                                          = 20;
  codGrpCustNat                                 : number = 0;
  codGrpCustFor                                 : number = 0;


  // ===========================
  // 🔹 10. TEXT / AUX / FILTERS
  // ===========================
  titulo                                        : string = 'Factura de Reserva';


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly invoicesService: InvoicesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
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

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-factura-reserva-list');
  }

  private onBuildColumn() {
    this.columnas = [
      { field: 'docNum',        header: 'Número' },
      { field: 'docStatus',     header: 'Estado' },
      { field: 'u_BPP_MDCD',    header: 'Factura' },
      { field: 'docDate',       header: 'Fecha de contabilización' },
      { field: 'docDueDate',    header: 'Fecha de vencimiento' },
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
      { value: '4', label: 'Cancelar',    icon: 'pi pi-ban',      command: () => { this.onClickCancelar(); } },
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

  onToItemSelected(modelo: IInvoiceQuery): void {
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

  private updateMenuVisibility(modelo: IInvoiceQuery): void {
    // Determine basic flags based on document state and permissions
    const isView      = !(this.buttonAcces.btnVer);
    const isEditable  = !(this.buttonAcces.btnEditar);
    const isCancel    = !(this.buttonAcces.btnCancelar || modelo.docStatus !== 'O');

    this.opcionesMap.get('Ver')!.visible    = isView;
    this.opcionesMap.get('Editar')!.visible = isEditable;
    this.opcionesMap.get('Cancelar')!.visible = isCancel;
  }

  //#endregion




  //#region <<< 4. LOAD DATA / FILTERS >>>

  onClickBuscar(): void {
    this.loadData();
  }

  private loadData(): void {
    this.isDisplay = true;

    this.invoicesService
    .getListByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IInvoiceQuery[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(): InvoiceFilterModel {
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
      docSubType: '--',
      isIns: 'Y',
      searchText
    };
  }

  //#endregion




  //#region <<< 5. UI HELPERS >>>

  getEstado(modelo: IInvoiceQuery) {
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

  getGroupType(modelo: IInvoiceQuery) {
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
      this.router.navigate(['/main/modulo-ven/panel-factura-reserva-create'], { state: { mode: 'create' } });
    });
  }

  onClickVer(){
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-ven/panel-factura-reserva-view', this.modeloSelected!.docEntry]);
    });
  }

  onClickEditar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-ven/panel-factura-reserva-edit', this.modeloSelected!.docEntry]);
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

    this.invoicesService
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

  //#endregion
}
