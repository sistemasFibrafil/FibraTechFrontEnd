import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { TableColumn, MenuItem } from 'src/app/interface/common-ui.interface';

import { PickingService } from 'src/app/modulos/modulo-inventario/services/picking.service';
import { IPicking } from '../../../interfaces/picking.inteface';
import { PickingCopyToFindModel, PickingFilterModel } from '../../../models/picking.model';
import { SolicitudTrasladoService } from '../../../services/solicitud-traslado.service';


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
  opciones1                                     : MenuItem[];
  opciones2                                     : MenuItem[];
  objTypeList                                   : SelectItem[] = [];
  docStatusList                                 : SelectItem[] = [];

  // Data
  modelo                                        : IPicking[] = [];
  modeloSelected                                : IPicking;
  pickingSelected                               : IPicking[] = [];
  params                                        : PickingFilterModel = new PickingFilterModel();
  paramsCopyTo                                  : PickingCopyToFindModel = new PickingCopyToFindModel();

  // Modal data
  modeloModal                                   : IPicking[] = [];
  modeloModalSeleted                            : IPicking;
  sourceProducts                                : any[] = [];
  targetProducts                                : any[] = [];
  sourceNotPicking                              : IPicking[] = [];
  targetNotPicking                              : IPicking[] = [];

  // Paginación de la tabla
  rows                = 20;
  rowsPerPageOptions  = [20, 40, 60, 80, 100];


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly pickingService: PickingService,
    private readonly solicitudTrasladoService: SolicitudTrasladoService,
    public readonly utilService: UtilService
  ) {
    this.isRowSelectable = this.isRowSelectable.bind(this);
  }

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
    this.buildForms();
    this.buildColumns();
    this.buildMenuOptions();
    this.loadTypeDocuments();
    this.loadStatusList();

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
      { field: 'u_Quantity',      header: 'Cantidad' },
      { field: 'u_WeightKg',      header: 'Peso' }
    ];

    this.columnasModal = [
      { field: 'u_ItemCode',      header: 'Código' },
      { field: 'u_CodeBar',       header: 'Barcode' },
      { field: 'u_IsReleased',    header: 'Liberado' },
      { field: 'u_Quantity',      header: 'Cantidad' },
      { field: 'u_WeightKg',      header: 'Peso' }
    ];
  }

  private buildMenuOptions(): void {
    this.opciones1 = [
      { value: '1', label: 'Eliminar', icon: 'pi pi-trash', command: () => this.onClickEliminar() },
      { value: '2', label: 'Visualizar', icon: 'pi pi-eye', command: () => this.onClickVisualizar() }
    ];
    this.opciones2 = [
      { value: '1',  label: 'Despacho', icon: 'pi pi-cart-plus', command: () => this.onClickToCopy() }
    ];
  }

  private loadTypeDocuments(): void {
    const statuses = this.localDataService.getListTypeDocumentPicking();
    this.objTypeList = statuses.map(s => ({ label: s.name, value: s.code }));

    const defaultStatusCode = '1250000001';
    const defaultStatus = statuses.find(s => s.code === defaultStatusCode);

    if (defaultStatus) {
      const defaultSelectItem = { label: defaultStatus.name, value: defaultStatus.code };
      this.modeloForm.get('objType').setValue(defaultSelectItem);
    }
  }

  private loadStatusList(): void {
    const statuses = this.localDataService.getListStatusDocumentInventory();
    this.docStatusList = statuses.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('docStatus').setValue(statuses);
  }

  // ===========================
  // Data Operations
  // ===========================

  private setParameters(): void {
    const formValue = this.modeloForm.getRawValue();
    const selectedStatuses = formValue.docStatus || [];

    this.params = {
      startDate : formValue.startDate,
      endDate   : formValue.endDate,
      objType   : formValue.objType?.value,
      status    : selectedStatuses.map(x => x.code).join(','),
      searchText: formValue.searchText
    };
  }

  private loadData(): void {
    this.setParameters();
    this.isDisplay = true;

    this.pickingService.getListByFilter(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IPicking[]) => {
          this.isDisplay = false;
          this.modelo = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadData', () => { this.isDisplay = false; }, this.swaCustomService);
        }
      });
  }

  onClickBuscar(): void {
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
    const deleteOption = this.opciones1.find(x => x.label === 'Eliminar');
    const viewOption = this.opciones1.find(x => x.label === 'Visualizar');

    if (deleteOption) deleteOption.visible = !this.buttonAcces.btnEliminar && !isDocClosed;
    if (viewOption) viewOption.visible = !this.buttonAcces.btnVer;
  }

  isRowSelectable(event: any): boolean {
    return !this.isOutOfStock(event.data);
  }

  isOutOfStock(data: IPicking): boolean {
    return data.u_Status === 'C';
  }

  // ===========================
  // Delete Operations
  // ===========================

  private delete(): void {
    const params: any = {
      u_BaseEntry: this.modeloSelected.u_BaseEntry,
      u_BaseType: this.modeloSelected.u_BaseType,
      u_BaseLine: this.modeloSelected.u_BaseLine,
      u_IsReturned: this.modeloSelected.u_IsReturned
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
          this.utilService.handleErrorSingle(e, 'delete', () => { this.isDeleting = false; }, this.swaCustomService);
        }
      });
  }

  onClickEliminar(): void {
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

  onClickVisualizar(): void {
    this.isVisualizar = !this.isVisualizar;
    this.loadModalData();
  }

  onClickBuscarModal(): void {
    this.loadModalData();
  }

  private loadModalData(): void {
    this.isDisplay = true;
    this.modeloModal = [];

    const { u_CodeBar } = this.modeloFormBusqueda.value;
    const value: any = {
      u_Status: this.modeloSelected.u_Status,
      u_BaseEntry: this.modeloSelected.u_BaseEntry,
      u_BaseType: this.modeloSelected.u_BaseType,
      u_BaseLine: this.modeloSelected.u_BaseLine,
      u_IsReturned: this.modeloSelected.u_IsReturned,
      u_CodeBar: u_CodeBar
    };

    this.pickingService.getListByBaseEntry(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IPicking[]) => {
          this.isDisplay = false;
          this.modeloModal = data;
        },
        error: (e) => {
          this.modeloModal = [];
          this.isDisplay = false;
          this.showModalError(e.error?.resultadoDescripcion || 'Ocurrió un error inesperado.');
        }
      });
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

    return swalWithBootstrapButtons.fire(
      this.globalConstants.msgInfoSummary,
      message,
      'error'
    );
  }


  // ===========================
  // Not Picking Operations
  // ===========================

  private loadNotPickingItems(): void {
    this.isDisplay = true;

    this.solicitudTrasladoService.getListNotPicking()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IPicking[]) => {
          this.isDisplay = false;
          this.sourceNotPicking = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadNotPickingItems', () => { this.isDisplay = false; }, this.swaCustomService);
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

  private copyToTransfer(): void {
    if (this.pickingSelected.length === 0) return;

    this.paramsCopyTo.u_BaseEntry = this.pickingSelected[0].u_BaseEntry;
    this.paramsCopyTo.u_BaseType = this.pickingSelected[0].u_BaseType;
    this.paramsCopyTo.lines = this.pickingSelected.map(p => ({
      u_BaseEntry: p.u_BaseEntry,
      u_BaseType: p.u_BaseType,
      u_BaseLine: p.u_BaseLine,
      u_FIB_IsPkg: p.u_FIB_IsPkg,
      u_IsReturned: p.u_IsReturned
    }));

    this.executeCopyToTransfer();
  }

  onClickToCopy(): void {
    this.confirmAddItemNotPicking();
  }

  private copyToTransferWithNotPicking(): void {
    if (!this.pickingSelected || this.pickingSelected.length === 0) return;

    this.paramsCopyTo.u_BaseEntry = this.pickingSelected[0].u_BaseEntry;
    this.paramsCopyTo.u_BaseType = this.pickingSelected[0].u_BaseType;

    const linesFromSelected = this.pickingSelected.map(p => ({
      u_BaseEntry: p.u_BaseEntry,
      u_BaseType: p.u_BaseType,
      u_BaseLine: p.u_BaseLine,
      u_FIB_IsPkg: p.u_FIB_IsPkg,
      u_IsReturned: p.u_IsReturned
    }));

    const linesFromNotPicking = (this.targetNotPicking || []).map(p => ({
      u_BaseEntry: p.u_BaseEntry,
      u_BaseType: p.u_BaseType,
      u_BaseLine: p.u_BaseLine,
      u_FIB_IsPkg: p.u_FIB_IsPkg,
      u_IsReturned: p.u_IsReturned
    }));

    // Merge both sets of lines instead of overwriting
    this.paramsCopyTo.lines = [...linesFromSelected, ...linesFromNotPicking];

    this.executeCopyToTransfer();
  }

  private executeCopyToTransfer(): void {
    this.isDisplay = true;

    this.pickingService.getToCopy(this.paramsCopyTo)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isDisplay = false; })
      )
      .subscribe({
        next: (data) => {
          this.router.navigate(['/main/modulo-inv/panel-transferencia-stock-create', JSON.stringify(data)]);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'executeCopyToTransfer', () => { this.isDisplay = false; }, this.swaCustomService);
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
}
