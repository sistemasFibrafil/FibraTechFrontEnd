import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { catchError, finalize, map, Observable, of, Subject, take, takeUntil } from 'rxjs';


import { IDraftsQuery } from '../../../interfaces/drafts.interface';
import { TableColumn, MenuItem } from 'src/app/interface/common-ui.interface';
import { IExchangeRates } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';

import { DraftsFilterModel } from '../../../models/drafts.model';

import { UtilService } from 'src/app/services/util.service';
import { DraftsService } from '../../../services/drafts.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { ExchangeRatesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';


@Component({
  selector: 'app-bor-panel-documento-borrador-list',
  templateUrl: './panel-documento-borrador-list.component.html',
  styleUrls: ['./panel-documento-borrador-list.component.css']
})
export class PanelDocumentoBorradorListComponent implements OnInit {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               : string = 'Orden de Venta - Borrador';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  codGrpCustNat                                 : number = 0;
  codGrpCustFor                                 : number = 0;


  // UI State
  isClosing                                     : boolean = false;
  isDisplay                                     : boolean = false;
  isDeleting                                    : boolean = false;
  isDisplayVisor                                : boolean = false;
  isDisplayGenerandoVisor                       : boolean = false;

  // Table configuration
  columnas                                      : TableColumn[] = [];
  opciones                                      : MenuItem[] = [];
  private opcionesMap                           : Map<string, MenuItem>;

  docStatusList                                 : SelectItem[] = [];

  // Paginación de la tabla
  rows                                          = 20;
  rowsPerPageOptions                            = [20, 40, 60, 80, 100];

  // Data
  modelo                                        : IDraftsQuery[] = [];
  modeloSelected                                : IDraftsQuery;

  isDataBlob                                    : Blob;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly draftsService: DraftsService,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    public  readonly utilService: UtilService,
  ) {}


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

  private onBuildForm(): void {
    this.modeloForm = this.fb.group({
      startDate   : [this.utilService.firstDayMonth(), Validators.required],
      endDate     : [this.utilService.currentDate(), Validators.required],
      docStatus   : ['', Validators.required],
      searchText  : ['']
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-bor-panel-documento-borrador-list');
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'docNum',        header: 'Número' },
      { field: 'docDate',       header: 'Fecha de contabilización' },
      { field: 'docDueDate',    header: 'Fecha de entrega' },
      { field: 'taxDate',       header: 'Fecha documento' },
      { field: 'groupCode',     header: 'Tipo venta' },
      { field: 'cardCode',      header: 'Código de Cliente' },
      { field: 'cardName',      header: 'Nombre de Cliente' },
      { field: 'slpName',       header: 'Vendedor' },
      { field: 'docCur',        header: 'Moneda' },
      { field: 'docTotal',      header: 'Total MN' },
      { field: 'docTotalSy',    header: 'Total ME' }
    ];
  }

  private opcionesTabla(): void {
    this.opciones = [
      { value: '1', label: 'Ver',                   icon: 'pi pi-eye',      command: () => { this.onClickVer(); } },
      { value: '2', label: 'Editar',                icon: 'pi pi-pencil',   command: () => { this.onClickEditar(); } },
      { value: '3', label: 'Cerrar',                icon: 'pi pi-times',    command: () => { this.onClickCerrar(); } }
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

  private updateMenuVisibility(modelo: IDraftsQuery): void {
    // Determine basic flags based on document state and permissions
    const isEditable  = !(this.buttonAcces.btnEditar);
    const isClose     = !(this.buttonAcces.btnCerrar || modelo.docStatus !== 'O');

    this.opcionesMap.get('Ver')!.visible    = !this.buttonAcces.btnVer;
    this.opcionesMap.get('Editar')!.visible = isEditable;
    this.opcionesMap.get('Cerrar')!.visible = isClose;
  }


  // ===========================
  // Table Events
  // ===========================

  onToItemSelected(modelo: IDraftsQuery): void {
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

  private buildFilterParams(): DraftsFilterModel {
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

    this.draftsService.getListByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: IDraftsQuery[]) => {
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
      this.router.navigate(['/main/modulo-bor/panel-documento-borrador-create']);
    });
  }

  onClickVer(): void {
    if (!this.validateSelection()) return;

    this.router.navigate(['/main/modulo-bor/panel-documento-borrador-view', this.modeloSelected.docEntry]);
  }

  onClickEditar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-bor/panel-documento-borrador-edit', this.modeloSelected.docEntry]);
    });
  }

  close() {
    this.isClosing = true;
    const param: any = { id: this.modeloSelected.docEntry, docEntry: this.modeloSelected.docEntry, u_UsrClose: this.userContextService.getIdUsuario() };
    this.draftsService.setClose(param)
    .subscribe({ next: ()=>{
        this.loadData();
        this.isClosing = false;
        this.swaCustomService.swaMsgExito(null);
      },
      error:(e)=>{
        this.isClosing = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
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
}
