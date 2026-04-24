import { Observable, Subject } from 'rxjs';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { finalize, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TableColumn, MenuItem } from 'src/app/interface/common-ui.interface';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IPicking } from '../../../interfaces/picking.inteface';
import { PickingCopyToFindModel, PickingFilterModel } from '../../../models/picking.model';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { PickingService } from 'src/app/modulos/modulo-inventario/services/picking.service';
import { InventoryTransferRequestService } from '../../../services/inventory-transfer-request.service';

enum PickingBaseType {
  solicitud = '1250000001',
  order     = '17',
  invoice   = '13',
}

interface PickingCopyLine {
  u_BaseEntry: number;
  u_BaseType: number;
  u_BaseLine: number;
  u_FIB_IsPkg: string;
}

@Component({
  selector: 'app-inv-panel-picking-list',
  templateUrl: './panel-picking-list.component.html',
  styleUrls: ['./panel-picking-list.component.css']
})
export class PanelPickingListComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;
  modeloFormBusqueda                            : FormGroup;

  // Configuration
  readonly titulo                               = 'Picking';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     = false;
  isDeleting                                    = false;
  isVisualizar                                  = false;
  isAddItemNotPicking                           = false;

  // Table configuration
  columnas                                      : TableColumn[];
  columnasModal                                 : TableColumn[];

  rowMenuOptions                                : MenuItem[];
  selectionMenuOptions                          : MenuItem[];

  objTypeList                                   : SelectItem[] = [];
  docStatusList                                 : SelectItem[] = [];

  // Data
  paramsCopyTo                                  : PickingCopyToFindModel = new PickingCopyToFindModel();

  modeloSelected                                : IPicking;

  modelo                                        : IPicking[] = [];
  pickingSelected                               : IPicking[] = [];

  // Modal data
  modeloModalSeleted                            : IPicking;

  sourceProducts                                : any[] = [];
  targetProducts                                : any[] = [];

  modeloModal                                   : IPicking[] = [];
  sourceNotPicking                              : IPicking[] = [];
  targetNotPicking                              : IPicking[] = [];

  // Paginación de la tabla
  rows                = 20;
  rowsPerPageOptions  = [20, 40, 60, 80, 100];


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly pickingService: PickingService,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly InventoryTransferRequestService: InventoryTransferRequestService,
    public  readonly utilService: UtilService
  ) {
    this.isRowSelectable = this.isRowSelectable.bind(this);
  }

  // ===========================
  // Lifecycle Hooks
  // ===========================

  ngOnInit(): void {
    this.initializeComponent();

    this.modeloForm.get('objType')?.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => this.onObjTypeChange());
  }

  private onObjTypeChange(): void {
    this.updateSelectionMenuByObjType();
    this.pickingSelected = [];
    this.loadData();
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
    this.buildColumns();
    this.loadTypeDocuments();
    this.loadStatusList();
    this.buildMenuOptions();
    this.updateSelectionMenuByObjType();

    if (!this.buttonAcces.btnBuscar) {
      this.loadData();
    }
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      startDate                 : [this.utilService.firstDayMonth(), Validators.required],
      endDate                   : [this.utilService.currentDate(), Validators.required],
      objType                   : ['', Validators.required],
      docStatus                 : ['', Validators.required],
      searchText                : ['']
    });

    this.modeloFormBusqueda = this.fb.group({
      u_CodeBar                 : ['']
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-picking-list');
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'u_BaseNum',       header: 'Número' },
      { field: 'u_DocDate',       header: 'Fecha de contabilización' },
      { field: 'u_DocDueDate',    header: 'Fecha de entrega' },
      { field: 'u_BaseLine',      header: 'Línea' },
      { field: 'u_ItemCode',      header: 'Código' },
      { field: 'u_Dscription',    header: 'Descripción' },
      { field: 'u_UnitMsr',       header: 'UM' },
      { field: 'u_NumBulk',       header: 'N° bulto' },
      { field: 'u_WeightKg',      header: 'Kg' },
      { field: 'u_Quantity',      header: 'Cantidad' },
    ];

    this.columnasModal = [
      { field: 'u_ItemCode',      header: 'Código' },
      { field: 'u_CodeBar',       header: 'Barcode' },
      { field: 'u_IsReleased',    header: 'Liberado' },
      { field: 'u_UnitMsr',       header: 'UM' },
      { field: 'u_WeightKg',      header: 'Kg' },
      { field: 'u_Quantity',      header: 'Cantidad' },
    ];
  }

  private buildMenuOptions(): void {
    this.buildRowMenuOptions();
    this.buildBulkMenuOptions();
  }

  private buildRowMenuOptions(): void {
    this.rowMenuOptions = [
      { value: '1', label: 'ver',       icon: 'pi pi-eye',    command: () => this.onClickView() },
      { value: '2', label: 'Eliminar',  icon: 'pi pi-trash',  command: () => this.onClickDelete() }
    ];
  }

  private buildBulkMenuOptions(): void {
    this.selectionMenuOptions = [
      { value: '1',  label: 'Transferencia',  icon: 'pi pi-cart-plus', command: () => this.onClickToCopyTransferRequest() },
      { value: '2',  label: 'Despacho',       icon: 'pi pi-cart-plus', command: () => this.onClickToCopyOrder() },
    ];
  }

  private loadTypeDocuments(): void {
    const statuses = this.localDataService.typePicking;
    this.objTypeList = statuses.map(s => ({ label: s.name, value: s.code }));

    const defaultStatusCode = '1250000001';
    const defaultStatus = statuses.find(s => s.code === defaultStatusCode);

    if (defaultStatus) {
      const defaultSelectItem = { label: defaultStatus.name, value: defaultStatus.code };
      this.modeloForm.get('objType').setValue(defaultSelectItem);
    }
  }

  private loadStatusList(): void {
    const statuses = this.localDataService.statusDocuments;
    this.docStatusList = statuses.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('docStatus').setValue(statuses);
  }

  // ===========================
  // Data Operations
  // ===========================

  private buildFilterParams(): PickingFilterModel {
    const {
      startDate,
      endDate,
      objType,
      docStatus,
      searchText
    } = this.modeloForm.getRawValue();

    return {
      startDate,
      endDate,
      objType: objType?.value,
      status: (docStatus || []).map(x => x.code).join(','),
      searchText
    };
  }

  private loadData(): void {
    this.isDisplay = true;

    this.pickingService
    .getListByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IPicking[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  onClickBuscar(): void {
    this.pickingSelected = [];
    this.loadData();
  }

  onClickCreate(): void {
    this.router.navigate(['/main/modulo-inv/panel-picking-create']);
  }

  onClickRelease(): void {
    this.router.navigate(['/main/modulo-inv/panel-picking-release']);
  }

  onClickRowSelected(modelo: IPicking): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  private updateMenuVisibility(modelo: IPicking): void {
    const isDocClosed = modelo.u_Status === 'C';
    const viewOption = this.rowMenuOptions.find(x => x.label === 'Ver');
    const deleteOption = this.rowMenuOptions.find(x => x.label === 'Eliminar');

    if (deleteOption) deleteOption.visible = !this.buttonAcces.btnEliminar && !isDocClosed;
    if (viewOption) viewOption.visible = !this.buttonAcces.btnVer;
  }

  isRowSelectable(event: any): boolean {
    return !this.isOutOfStock(event.data);
  }

  isOutOfStock(data: IPicking): boolean {
    return data.u_Status === 'C';
  }

  private updateSelectionMenuByObjType(): void {
    const objType = this.modeloForm.get('objType')?.value?.value;

    const transferencia = this.selectionMenuOptions.find(x => x.label === 'Transferencia');
    const despacho      = this.selectionMenuOptions.find(x => x.label === 'Despacho');

    // reset defensivo
    if (transferencia) transferencia.visible = false;
    if (despacho) despacho.visible = false;

    switch (objType) {
      case PickingBaseType.solicitud:
        if (transferencia) transferencia.visible = true;
        break;

      case PickingBaseType.order:
        if (despacho) despacho.visible = true;
        break;

      case PickingBaseType.invoice:
        if (despacho) despacho.visible = true;
        break;
    }
  }

  // ===========================
  // Delete Operations
  // ===========================

  private delete(): void {
    const params: any = {
      u_BaseEntry: this.modeloSelected.u_BaseEntry,
      u_BaseType: this.modeloSelected.u_BaseType,
      u_BaseLine: this.modeloSelected.u_BaseLine
    };

    this.isDeleting = true;

    this.pickingService.setDeleteMassive(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isDeleting = false; })
      )
      .subscribe({
        next: () => {
          this.loadData();
          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'delete', this.swaCustomService);
        }
      });
  }

  onClickDelete(): void {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleEliminar,
      this.globalConstants.subTitleEliminar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.delete();
      }
    });
  }

  // ===========================
  // Modal Operations
  // ===========================

  onClickView(): void {
    this.isVisualizar = !this.isVisualizar;
    this.loadModalData();
  }

  onClickBuscarModal(): void {
    this.loadModalData();
  }

  private loadModalData(): void {
    if (!this.modeloSelected) {
      return;
    }

    this.isDisplay = true;
    this.modeloModal = [];

    const params = this.buildModalFilterParams();

    this.pickingService
    .getListByBaseEntry(params)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IPicking[]) => {
        this.modeloModal = data;
      },
      error: (e) => {
        this.modeloModal = [];
        this.showModalError(
          e?.error?.resultadoDescripcion ?? 'Ocurrió un error inesperado.'
        );
      }
    });
  }

  private buildModalFilterParams(): any {
    const { u_CodeBar } = this.modeloFormBusqueda.getRawValue();

    return {
      u_Status    : this.modeloSelected.u_Status,
      u_BaseEntry : this.modeloSelected.u_BaseEntry,
      u_BaseType  : this.modeloSelected.u_BaseType,
      u_BaseLine  : this.modeloSelected.u_BaseLine,
      u_CodeBar
    };
  }

  onClickRowDelete(modelo: IPicking): void {
    this.modeloModalSeleted = modelo;
    this.confirmRowDelete();
  }

  private confirmRowDelete(): void {
    this.showModalConfirmation(
      this.globalConstants.titleEliminar,
      this.globalConstants.subTitleEliminar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.deleteRow();
      }
    });
  }

  private deleteRow(): void {
    const params: any = { docEntry: this.modeloModalSeleted.docEntry };
    this.isDeleting = true;

    this.pickingService.setDelete(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isDeleting = false; })
      )
      .subscribe({
        next: () => {
          this.loadData();
          this.loadModalData();
          this.showModalSuccess(null);
        },
        error: (e) => {
          this.showModalError(e.error?.resultadoDescripcion || 'Ocurrió un error inesperado.');
        }
      });
  }

  onClickCloseModel(): void {
    this.modeloModal = [];
    this.modeloFormBusqueda.patchValue({ u_CodeBar: '' });
    this.isVisualizar = false;
  }

  // ===========================
  // Modal Swal Helpers
  // ===========================

  private showModalConfirmation(title: string, text: string, icon: any): Promise<any> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: { container: 'my-swal' },
      target: document.getElementById('modal')
    });

    return swalWithBootstrapButtons.fire({
      title: title,
      html: text,
      icon: icon,
      showConfirmButton: true,
      confirmButtonText: this.globalConstants.confirmButtonText,
      confirmButtonColor: '#3085d6',
      showCancelButton: true,
      cancelButtonText: this.globalConstants.cancelButtonText,
      cancelButtonColor: '#d33000'
    });
  }

  private showModalSuccess(msgExitoDetail: string): Promise<any> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: { container: 'my-swal' },
      target: document.getElementById('modal')
    });

    return swalWithBootstrapButtons.fire(
      this.globalConstants.msgExitoSummary,
      msgExitoDetail || this.globalConstants.msgExitoDetail,
      this.globalConstants.icoSwalSuccess
    );
  }

  private showModalError(message: string): Promise<any> {
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: { container: 'my-swal' },
      target: document.getElementById('modal')
    });

    return swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, message, 'error');
  }

  // ===========================
  // Not Picking Operations
  // ===========================

  private loadNotPickingItems(): void {
    this.isDisplay = true;

    this.InventoryTransferRequestService
    .getListNotPicking()
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IPicking[]) => {
        this.sourceNotPicking = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadNotPickingItems', this.swaCustomService);
      }
    });
  }

  private confirmAddItemNotPicking(): void {
    this.showModalConfirmation(
      this.globalConstants.titleAddItemNotPicking,
      this.globalConstants.subTitleAddItemNotPicking,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.isAddItemNotPicking = true;
        this.loadNotPickingItems();
      } else {
        this.copyToTransfer();
      }
    });
  }

  // ===========================
  // Copy to Transfer Operations
  // ===========================

  private mapPickingLines(list: IPicking[]): PickingCopyLine[] {
    if (!list || list.length === 0) {
      return [];
    }

    return list.map((p: IPicking): PickingCopyLine => ({
      u_BaseEntry : p.u_BaseEntry,
      u_BaseType  : p.u_BaseType,
      u_BaseLine  : p.u_BaseLine,
      u_FIB_IsPkg : p.u_FIB_IsPkg
    }));
  }

  private copyToTransfer(): void {
    if (!this.pickingSelected || this.pickingSelected.length === 0) {
      return;
    }

    // Cabecera
    this.paramsCopyTo.u_BaseEntry = this.pickingSelected[0].u_BaseEntry;
    this.paramsCopyTo.u_BaseType  = this.pickingSelected[0].u_BaseType;

    // 🔹 AQUÍ se aplica el mapper
    this.paramsCopyTo.lines = this.mapPickingLines(this.pickingSelected);

    this.executeCopyToTransferStock();
  }

  onClickToCopyTransferRequest(): void {
    this.confirmAddItemNotPicking();
  }

  private copyToTransferWithNotPicking(): void {
    if (!this.pickingSelected || this.pickingSelected.length === 0) {
      return;
    }

    // Cabecera
    this.paramsCopyTo.u_BaseEntry = this.pickingSelected[0].u_BaseEntry;
    this.paramsCopyTo.u_BaseType  = this.pickingSelected[0].u_BaseType;

    // 🔹 Aplicación del mapper en ambos orígenes
    const linesFromSelected    = this.mapPickingLines(this.pickingSelected);
    const linesFromNotPicking = this.mapPickingLines(this.targetNotPicking);

    // 🔹 Unión limpia y segura
    this.paramsCopyTo.lines = [
      ...linesFromSelected,
      ...linesFromNotPicking
    ];

    this.executeCopyToTransferStock();
  }

  private executeCopyToTransferStock(): void {
    this.isDisplay = true;

    this.pickingService.getToCopyTransferRequest(this.paramsCopyTo)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (data) => {
        // respaldo para refresh
        sessionStorage.setItem('SolicitudCopyTo',JSON.stringify(data));

        this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-create'], { state: { mode: 'copy', solicitud: data } });
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'executeCopyToTransferStock', this.swaCustomService);
      }
    });
  }

  onClickAceptAddItemNotPincking(): void {
    this.isAddItemNotPicking = false;
    this.copyToTransferWithNotPicking();
  }

  onClickCloseAddItemNotPincking(): void {
    this.isAddItemNotPicking = false;
  }

  onClickToCopyOrder(): void {
    this.copyToDespacho();
  }

  private buildFilterCopyParams(): any {
    return {
      u_BaseEntry: this.pickingSelected[0].u_BaseEntry,
      u_BaseType: this.pickingSelected[0].u_BaseType,
      lines: this.mapPickingLines(this.pickingSelected)
    };
  }

  private copyToDespacho(): void {
    const objType = this.modeloForm.get('objType')?.value?.value;

    const serviceMap: Record<number, () => Observable<any>> = {
      [PickingBaseType.order]: () =>
        this.pickingService.getToCopyOrder(this.buildFilterCopyParams()),

      [PickingBaseType.invoice]: () =>
        this.pickingService.getToCopyInvoice(this.buildFilterCopyParams())
    };

    const request = serviceMap[objType];

    if (!request) return;

    this.executeCopy(request);
  }

  private executeCopy(requestFn: () => Observable<any>): void {
    this.isDisplay = true;

    requestFn()
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.isDisplay = false))
    )
    .subscribe({
      next: (data) => {
        sessionStorage.setItem('ordenVentaCopyTo', JSON.stringify(data));

        this.router.navigate(['/main/modulo-ven/panel-entrega-create'], { state: { mode: 'copy', ordenVenta: data } });
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'executeCopyToDespacho', this.swaCustomService);
      }
    });
  }
}
