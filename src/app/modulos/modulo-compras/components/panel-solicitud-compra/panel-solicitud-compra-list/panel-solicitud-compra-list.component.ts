import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { catchError, finalize, map, Observable, of, Subject, take, takeUntil } from 'rxjs';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { PurchaseRequestFilterModel } from '../../../models/sap-business-one/purchase-request.model';

import { MenuItem } from '@app/interface/common-ui.interface';
import { IPurchaseRequest } from '../../../interfaces/sap-business-one/purchase-request.interface';
import { IExchangeRates } from '@app/modulos/modulo-gestion/interfaces/sap-business-one/exchange-rates.interface';

import { UtilService } from '@app/services/util.service';
import { LocalDataService } from '@app/services/local-data.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { UserContextService } from '@app/services/user-context.service';
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
import { PurchaseRequestService } from '../../../services/sap-business-one/purchase-request.service';
import { ExchangeRatesService } from '@app/modulos/modulo-gestion/services/sap-business-one/exchange-rates.service';

interface DocStatus {
  statusCode  : string,
  statusName  : string
}

@Component({
  selector: 'app-com-panel-solicitud-compra-list',
  templateUrl: './panel-solicitud-compra-list.component.html',
  styleUrls: ['./panel-solicitud-compra-list.component.css']
})
export class PanelSolicitdCompraListComponent implements OnInit {
  // Lifecycle management
    private readonly destroy$                     = new Subject<void>();
  modeloForm                                      : FormGroup;

  // Titulo del componente
  titulo = 'Solicitud de Compra';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  columnas: any[];
  opciones: any = [];

  modeloDelete: IPurchaseRequest;
  modeloSelected: IPurchaseRequest;
  modelo: IPurchaseRequest[] = [];

  docStatus: DocStatus[];
  docStatusList: SelectItem[];
  opcionesMap                                   : Map<string, MenuItem>;

  // Paginación de la tabla
  rows                = 20;
  rowsPerPageOptions  = [20, 40, 60, 80, 100];

  params: PurchaseRequestFilterModel = new PurchaseRequestFilterModel();
  isDisplay: Boolean = false;
  isClosing: boolean = false;


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private userContextService: UserContextService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly exchangeRatesService: ExchangeRatesService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly purchaseRequestService: PurchaseRequestService,
    public  readonly utilService: UtilService,
  ) {}


  // ===========================
  // Lifecycle Hooks
  // ==========================


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
    this.buildForms();
    this.onBuildColumn();
    this.opcionesTabla();
    this.getListStatus();

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-com-panel-solicitud-compra-list');

    if (!this.buttonAcces.btnBuscar) {
      this.loadData();
    }
  }

  buildForms() {
    this.modeloForm = this.fb.group({
      startDate     : [this.utilService.firstDayMonth(), Validators.required],
      endDate       : [this.utilService.currentDate(), Validators.required],
      docStatus     : ['', Validators.required],
      searchText    : ['']
    });
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'docNum',          header: 'Número' },
      { field: 'docType',         header: 'Tipo documento' },
      { field: 'docDate',         header: 'Fecha de contabilización' },
      { field: 'docDueDate',      header: 'Fecha de entrega' },
      { field: 'taxDate',         header: 'Fecha de documento' },
      { field: 'reqDate',         header: 'Fecha necesaria' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { value: '1', label: 'Ver',       icon: 'pi pi-eye',                    command: () => this.onClickVer() },
      { value: '2', label: 'Editar',    icon: 'pi pi-pencil',                 command: () => this.onClickEditar() },
      { value: '3', label: 'Cerrar',    icon: 'pi pi-times',                  command: () => this.onClickCerrar() },
      { value: '4', label: 'Formato',   icon: 'pi pi-print',                  command: () => this.onClickImprimir() },
    ];
    this.opcionesMap = new Map(this.opciones.map(op => [op.label, op]));
  }

  // ===========================
  // Helper Methods
  // ===========================

  private validateSelection(): boolean {
    if (!this.modeloSelected) {
      this.swaCustomService.swaMsgInfo('Debe seleccionar al menos un registro');
      return false;
    }
    return true;
  }

  private updateMenuVisibility(modelo: IPurchaseRequest): void {
    const isOpen        = modelo.docStatus === 'O';

    this.opcionesMap.get('Ver')!.visible        = !this.buttonAcces.btnVer;
    this.opcionesMap.get('Editar')!.visible     = !this.buttonAcces.btnEditar;
    this.opcionesMap.get('Cerrar')!.visible     = !this.buttonAcces.btnCerrar && isOpen;
    this.opcionesMap.get('Formato')!.visible    = !this.buttonAcces.btnImprimir;
  }

  // ===========================
  // Table Events
  // ===========================

  onSelectedItem(modelo: IPurchaseRequest) {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }


  // ===========================
  // Data Operations
  // ===========================

  private getListStatus(): void {
    const statuses = this.localDataService.statusDocuments;
    this.docStatusList = statuses.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('docStatus')?.setValue(statuses);
  }

  onClickBuscar() {
    this.loadData();
  }

  loadData(): void {
    this.isDisplay = true;

    this.purchaseRequestService
    .getListByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IPurchaseRequest[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(): PurchaseRequestFilterModel {
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
      this.router.navigate(['/main/modulo-com/panel-solicitud-compra-create']);
    });
  }

  onClickVer(){
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-com/panel-solicitud-compra-view', this.modeloSelected.docEntry]);
    });
  }

  onClickEditar() {
    if (!this.validateSelection()) return;

    this.validarTipoCambioYContinuar(() => {
      this.router.navigate(['/main/modulo-com/panel-solicitud-compra-edit', this.modeloSelected.docEntry]);
    });
  }

  close() {
    this.isClosing = true;
    const param: any = { id: this.modeloSelected.docEntry, docEntry: this.modeloSelected.docEntry, u_UsrClose: this.userContextService.getIdUsuario() };
    this.purchaseRequestService.setClose(param)
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

  onClickImprimir(): void {
    if (!this.validateSelection()) return;

    // this.isDisplayGenerandoVisor = true;
    // this.InventoryTransferRequestService.getFormatoPdfByDocEntry(this.modeloSelected.docEntry)
    // .pipe(takeUntil(this.destroy$))
    // .subscribe({
    //   next: (resp: any) => {
    //     switch (resp.type) {
    //       case HttpEventType.DownloadProgress:
    //         break;
    //       case HttpEventType.Response:
    //         this.isDataBlob = new Blob([resp.body], { type: resp.body.type });
    //         this.isDisplayGenerandoVisor = false;
    //         this.isDisplayVisor = true;
    //         break;
    //     }
    //   },
    //   error: (e) => {
    //     this.utilService.handleErrorSingle(e, 'onClickImprimir', () => this.isDisplayGenerandoVisor = false, this.swaCustomService);
    //   }
    // });
  }
}
