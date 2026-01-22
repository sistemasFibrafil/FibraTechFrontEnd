import { Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { UtilService } from 'src/app/services/util.service';
import { SelectItem } from 'primeng/api';
import { LocalDataService } from 'src/app/services/local-data.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { TableColumn, MenuItem } from 'src/app/interface/common-ui.interface';
import { OrdenVentaService } from '../../../services/sap/orden-venta.service';
import { IOrdenVenta } from '../../../interfaces/sap/orden-venta.interface';



@Component({
  selector: 'app-ven-panel-orden-venta-list',
  templateUrl: './panel-orden-venta-list.component.html',
  styleUrls: ['./panel-orden-venta-list.component.css']
})
export class PanelOrdenVentaListComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               : string = 'Orden de Venta';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     : boolean = false;
  isDeleting                                    : boolean = false;
  isDisplayGenerandoVisor                       : boolean = false;

  // Table configuration
  columnas                                      : TableColumn[] = [];
  opciones                                      : MenuItem[] = [];
  private opcionesMap                           : Map<string, MenuItem>;
  docStatusList                                 : SelectItem[] = [];

  // Paginación de la tabla
  rows                = 20;
  rowsPerPageOptions  = [20, 40, 60, 80, 100];

  // Data
  modeloSelected                                : IOrdenVenta;
  modelo                                        : IOrdenVenta[] = [];


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly utilService: UtilService,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService,
    private readonly ordenVentaService: OrdenVentaService,
    private readonly accesoOpcionesService: AccesoOpcionesService
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
    this.getListStatus();

    if (!this.buttonAcces.btnBuscar) {
      this.getList();
    }
  }

  private onBuildForm(): void {
    this.modeloForm = this.fb.group({
      startDate: [this.utilService.firstDayMonth(), Validators.required],
      endDate: [this.utilService.currentDate(), Validators.required],
      docStatus: ['', Validators.required],
      searchText: ['']
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-orden-venta-list');
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'docNum',        header: 'Número' },
      { field: 'docDate',       header: 'Fecha de contabilización' },
      { field: 'docDueDate',    header: 'Fecha de entrega' },
      { field: 'taxDate',       header: 'Fecha documento' },
      { field: 'cardCode',      header: 'Código de Cliente' },
      { field: 'cardName',      header: 'Nombre de Cliente' },
      { field: 'docCur',        header: 'Moneda' },
      { field: 'docTotal',      header: 'Total MN' },
      { field: 'docTotalSy',    header: 'Total ME' }
    ];
  }

  private opcionesTabla(): void {
    this.opciones = [
      { value: '1', label: 'Ver',         icon: 'pi pi-eye',      command: () => { this.onClickVer(); } },
      { value: '2', label: 'Editar',      icon: 'pi pi-pencil',   command: () => { this.onClickEditar(); } },
      { value: '3', label: 'Cerrar',      icon: 'pi pi-times',    command: () => { this.onClickCerrar(); } },
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

  private updateMenuVisibility(list: IOrdenVenta): void {
    // Determine basic flags based on document state and permissions
    const isEditable  = !(this.buttonAcces.btnEditar || list.docStatus === '02' || list.docStatus === '03');
    const isClose     = !(this.buttonAcces.btnCerrar || list.docStatus === '02' || list.docStatus === '03');

    this.opcionesMap.get('Ver')!.visible    = !this.buttonAcces.btnVer;
    this.opcionesMap.get('Editar')!.visible = isEditable;
    this.opcionesMap.get('Cerrar')!.visible = isClose;
  }

  // ===========================
  // Table Events
  // ===========================

  onToItemSelected(modelo: IOrdenVenta): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  // ===========================
  // Data Operations
  // ===========================

  private getListStatus(): void {
    const statuses = this.localDataService.getListStatusDocumentInventory();
    this.docStatusList = statuses.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('docStatus')?.setValue(statuses);
  }

  private onSetParametro(): any {
    const params = this.modeloForm.getRawValue();
    // If docStatus is a multiselect of status objects, convert to comma-separated codes
    const selectedStatuses = this.modeloForm.value.docStatus || [];
    if (Array.isArray(selectedStatuses) && selectedStatuses.length > 0 && selectedStatuses[0].code !== undefined) {
      params.docStatus = selectedStatuses.map((x: any) => x.code).join(',');
    }
    return params;
  }

  private getList(): void {
    this.isDisplay = true;
    const params = this.onSetParametro();
    this.ordenVentaService.getListByFilter(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IOrdenVenta[]) => {
          this.isDisplay = false;
          this.modelo = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'getList', () => this.isDisplay = false, this.swaCustomService);
        }
      });
  }

  private close(): void {
    // deletion currently not implemented for OrdenVenta list; placeholder for future
  }

  // ===========================
  // UI Actions
  // ===========================

  onClickBuscar(): void {
    this.getList();
  }

  onToCreate(): void {
    this.router.navigate(['/main/modulo-ven/panel-orden-venta-create']);
  }

  onClickVer(): void {
    if (!this.validateSelection()) return;
    this.router.navigate(['/main/modulo-ven/panel-orden-venta-view', this.modeloSelected.docEntry]);
  }

  onClickEditar(): void {
    if (!this.validateSelection()) return;
    this.router.navigate(['/main/modulo-ven/panel-orden-venta-edit', this.modeloSelected.docEntry]);
  }

  onClickCerrar(): void {
    if (!this.validateSelection()) return;
    
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleEliminar,
      this.globalConstants.subTitleEliminar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.close();
      }
    });
  }
}
