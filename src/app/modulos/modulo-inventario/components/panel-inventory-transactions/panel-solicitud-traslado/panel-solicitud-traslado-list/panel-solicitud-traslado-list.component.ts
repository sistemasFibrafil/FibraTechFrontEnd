import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { takeUntil } from 'rxjs/operators';
import { HttpEventType } from '@angular/common/http';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableColumn, MenuItem } from 'src/app/interface/common-ui.interface';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ISolicitudTraslado, ISolicitudTraslado1 } from 'src/app/modulos/modulo-inventario/interfaces/solicitud-traslado.interface';
import { SolicitudTrasladoFilterModel } from 'src/app/modulos/modulo-inventario/models/solicitud-traslado.model';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { SolicitudTrasladoService } from 'src/app/modulos/modulo-inventario/services/solicitud-traslado.service';

@Component({
  selector: 'app-inv-panel-solicitud-traslado-list',
  templateUrl: './panel-solicitud-traslado-list.component.html',
  styleUrls: ['./panel-solicitud-traslado-list.component.css']
})
export class PanelSolicitudTrasladoListComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               = 'Solicitud de Traslado';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     = false;
  isClosing                                     = false;
  isDisplayVisor                                = false;
  isDisplayGenerandoVisor                       = false;

  // Table configuration
  columnas                                      : TableColumn[] = [];
  opciones                                      : MenuItem[] = [];
  docStatusList                                 : SelectItem[] = [];
  opcionesMap                                   : Map<string, MenuItem>;

  // Data
  isDataBlob                                    : Blob;
  modeloSelected                                : ISolicitudTraslado;
  modelo                                        : ISolicitudTraslado[] = [];

  // Paginación de la tabla
  rows                = 20;
  rowsPerPageOptions  = [20, 40, 60, 80, 100];

  // Filters
  params                                        : SolicitudTrasladoFilterModel = new SolicitudTrasladoFilterModel();


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly utilService: UtilService,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly solicitudTrasladoService: SolicitudTrasladoService,
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

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-solicitud-traslado-list');

    if (!this.buttonAcces.btnBuscar) {
      this.getList();
    }
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      startDate     : [this.utilService.firstDayMonth(), Validators.required],
      endDate       : [this.utilService.currentDate(), Validators.required],
      docStatus     : ['', Validators.required],
      searchText    : ['']
    });
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'docNum',        header: 'Número' },
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

  private updateMenuVisibility(modelo: ISolicitudTraslado): void {
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

  // ===========================
  // Table Events
  // ===========================

  onSelectedItem(modelo: ISolicitudTraslado): void {
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

  private onSetParametro(): void {
    this.params = this.modeloForm.getRawValue();
    const selectedStatuses = this.modeloForm.value.docStatus || [];
    this.params.docStatus = selectedStatuses.map(x => x.code).join(',');
  }

  getList(): void {
    this.isDisplay = true;
    this.onSetParametro();
    this.solicitudTrasladoService.getListByFilter(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: ISolicitudTraslado[]) => {
          this.isDisplay = false;
          this.modelo = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'getList', () => this.isDisplay = false, this.swaCustomService);
        }
      });
  }

  private close(): void {
    this.isClosing = true;
    const param = { docEntry: this.modeloSelected.docEntry, u_UsrUpdate: this.userContextService.getIdUsuario() };
    this.solicitudTrasladoService.setClose(param)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.getList();
          this.isClosing = false;
          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'close', () => this.isClosing = false, this.swaCustomService);
        }
      });
  }

  // ===========================
  // UI Actions
  // ===========================

  onClickBuscar(): void {
    this.getList();
  }

  onClickCreate(): void {
    const data: ISolicitudTraslado1[] = [{ lineStatus: 'O', itemCode: '', dscription: '', fromWhsCod: '', whsCode: '', u_tipoOpT12: '', u_tipoOpT12Nam: '', unitMsr: '', quantity: 0, u_FIB_OpQtyPkg: 0, openQty: 0 }];
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-create', JSON.stringify(data)]);
  }

  onClickVer(): void {
    if (!this.validateSelection()) return;
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-view', this.modeloSelected.docEntry]);
  }

  onClickEditar(): void {
    if (!this.validateSelection()) return;
    this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-edit', this.modeloSelected.docEntry]);
  }

  onClickCerrar(): void {
    if (!this.validateSelection()) return;

    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleCerrar,
      this.globalConstants.subTitleCerrar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.close();
      }
    });
  }

  onClickImprimir(): void {
    if (!this.validateSelection()) return;

    this.isDisplayGenerandoVisor = true;
    this.solicitudTrasladoService.getFormatoPdfByDocEntry(this.modeloSelected.docEntry)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (resp: any) => {
          switch (resp.type) {
            case HttpEventType.DownloadProgress:
              break;
            case HttpEventType.Response:
              this.isDataBlob = new Blob([resp.body], { type: resp.body.type });
              this.isDisplayGenerandoVisor = false;
              this.isDisplayVisor = true;
              break;
          }
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onClickImprimir', () => this.isDisplayGenerandoVisor = false, this.swaCustomService);
        }
      });
  }

  onClickTransferir(): void {
    if (!this.validateSelection()) return;
    this.solicitudTrasladoService.getToTransferenciaByDocEntry(this.modeloSelected.docEntry)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-create', JSON.stringify(data)]);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onClickTransferir', () => {}, this.swaCustomService);
      }
    });
  }
}
