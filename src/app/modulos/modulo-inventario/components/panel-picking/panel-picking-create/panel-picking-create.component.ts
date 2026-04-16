import Swal from 'sweetalert2';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { MessageService, SelectItem } from 'primeng/api';
import { UtilService } from 'src/app/services/util.service';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { TableColumn, MenuItem } from 'src/app/interface/common-ui.interface';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import { PickingCreateModel } from '../../../models/picking.model';

import { IPicking } from '../../../interfaces/picking.inteface';
import { IWarehouses } from '../../../../modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';

import { UserContextService } from 'src/app/services/user-context.service';
import { PickingService } from 'src/app/modulos/modulo-inventario/services/picking.service';
import { OrdersService } from 'src/app/modulos/modulo-ventas/services/sap-business-one/orders.service';
import { InventoryTransferRequestService } from 'src/app/modulos/modulo-inventario/services/inventory-transfer-request.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { InvoicesService } from 'src/app/modulos/modulo-ventas/services/sap-business-one/invoices.service';


@Component({
  selector: 'app-inv-picking-create',
  templateUrl: './panel-picking-create.component.html',
  styleUrls: ['./panel-picking-create.component.css']
})
export class PanelPickingCreateComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloFormDoc                                 : FormGroup;
  modeloFormPkg                                 : FormGroup;
  modeloFormModal                               : FormGroup;

  // Configuration
  readonly titulo                               = 'Picking';
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     = false;
  isSaving                                      = false;
  isDeleting                                    = false;
  isVisualizar                                  = false;

  // Table configuration
  columnas                                      : TableColumn[];
  columnasModal                                 : TableColumn[];
  opciones                                      : MenuItem[];
  almacenList                                   : SelectItem[] = [];
  documentoList                                 : SelectItem[] = [];
  objTypeList                                   : SelectItem[] = [];

  // Data
  modeloSelected                                : IPicking;

  modeloList                                    : IPicking[] = [];
  modeloDocumento                               : any[] = [];

  // Modal data
  listModeloModal                               : IPicking[] = [];
  deleteModeloModal                             : IPicking;

  @ViewChild('codeBarInput')
    private codeBarInput: ElementRef<HTMLInputElement> | undefined;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly utilService: UtilService,
    private readonly ordersService: OrdersService,
    private readonly pickingService: PickingService,
    private readonly messageService: MessageService,
    private readonly invoicesService: InvoicesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly InventoryTransferRequestService: InventoryTransferRequestService,
    public readonly app: LayoutComponent
  ) {}

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
    this.loadWarehouseList();
  }

  private buildForms(): void {
    this.modeloFormDoc = this.fb.group({
      objType                   : ['', Validators.required],
      documento                 : ['', Validators.required],
      almacen                   : ['', Validators.required],
    });

    this.modeloFormPkg = this.fb.group({
      u_CodeBar                 : [{ value: '', disabled: true }, Validators.required]
    });

    this.modeloFormModal = this.fb.group({
      u_CodeBar                 : ['']
    });
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'u_BaseNum', header: 'Número' },
      { field: 'u_ItemCode', header: 'Código' },
      { field: 'u_ItemName', header: 'Descripción' },
      { field: 'u_UnitMsr', header: 'UM' },
      { field: 'u_Quantity', header: 'Cantidad' },
      { field: 'u_WeightKg', header: 'Peso' },
      { field: 'u_FIB_OpQtyPkg', header: 'Pendiente' }
    ];

    this.columnasModal = [
      { field: 'u_ItemCode', header: 'Código' },
      { field: 'u_CodeBar', header: 'Barcode' },
      { field: 'u_Quantity', header: 'Cantidad' },
      { field: 'u_WeightKg', header: 'Peso' }
    ];
  }

  private buildMenuOptions(): void {
    this.opciones = [
      { value: '1', label: 'Eliminar', icon: 'pi pi-trash', command: () => this.onClickEliminar() },
      { value: '2', label: 'Visualizar', icon: 'pi pi-eye', command: () => this.onClickVisualizar() }
    ];
  }

  private loadTypeDocuments(): void {
    const statuses = this.localDataService.getListTypeDocumentPicking();
    this.objTypeList = statuses.map(s => ({ label: s.name, value: s.code }));
  }

  private loadWarehouseList(): void {
    const param: any = { inactive: 'N' }; // inactive
    this.warehousesService.getListByInactive(param)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IWarehouses[]) => {
          this.almacenList = data.map(item => ({ label: item.fullDescr, value: item.whsCode }));
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadWarehouseList', this.swaCustomService);
        }
    });
  }

  // ===========================
  // Event Handlers
  // ===========================

  onSelectedItem(modelo: IPicking): void {
    this.modeloSelected = modelo;
  }

  onChangeObjType(): void {
    this.loadDocumentList();
    this.checkAndEnableCodeBar();
  }

  private loadDocumentList(): void {
    this.modeloList = [];
    this.documentoList = [];

    const raw = this.modeloFormDoc.getRawValue();
    const objTypeValue: string = String(raw.objType?.value ?? raw.objType ?? '').trim();

    if (!objTypeValue) return;

    const handlers: Record<string, () => void> = {
      '1250000001': () => this.loadSolicitudOpenList(),
      '17'        : () => this.loadOrdenVentaOpenList(),
      '13'        : () => this.loadFacturaReservaOpenList(),
    };

    const handler = handlers[objTypeValue];

    if (!handler) {
      // Opcional: si quieres avisar o simplemente no hacer nada
      // this.messageService.add({ severity:'warn', summary:'Atención', detail:'Tipo de documento no soportado.' });
      this.documentoList = [];
      return;
    }

    handler();
  }

  private loadSolicitudOpenList(): void {
    this.loadOpenDocuments(
      this.InventoryTransferRequestService.getListOpen(),
      'loadSolicitudOpenList',
      (data) => (this.modeloDocumento = data)
    );
  }

  private loadOrdenVentaOpenList(): void {
    this.loadOpenDocuments(
      this.ordersService.getListOpen(),
      'loadOrdenVentaOpenList',
      (data) => (this.modeloDocumento = data)
    );
  }

  private loadFacturaReservaOpenList(): void {
    this.loadOpenDocuments(
      this.invoicesService.getListOpen(),
      'loadFacturaReservaOpenList',
      (data) => (this.modeloDocumento = data)
    );
  }

  private loadOpenDocuments<T extends { docNum: number; docEntry: number }>(source$: import('rxjs').Observable<T[]>, methodName: string, afterLoad?: (data: T[]) => void): void {
    this.isDisplay = true;
    this.documentoList = [];

    source$
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => (this.isDisplay = false))
    )
    .subscribe({
      next: (data: T[]) => {
        afterLoad?.(data);

        this.documentoList = (data ?? []).map(item => ({
          label: String(item.docNum),
          value: item.docEntry
        }));
      },
      error: (e) => {
        this.documentoList = [];
        this.utilService.handleErrorSingle(e, methodName, this.swaCustomService);
      }
    });
  }

  onChangeDocumento(): void {
    const { documento } = this.modeloFormDoc.getRawValue();
    const solicitudSelected = this.modeloDocumento.find(item => item.docEntry === documento?.value);

    if (solicitudSelected) {
      const defaultSelectItem = this.almacenList.find(item => item.value === solicitudSelected.whsCode);
      this.modeloFormDoc.get('almacen').setValue(defaultSelectItem);
    }
    this.checkAndEnableCodeBar();
  }

  onChangeAlmacen(): void {
    this.checkAndEnableCodeBar();
  }

  private checkAndEnableCodeBar(): void {
    const { objType, documento, almacen } = this.modeloFormDoc.getRawValue();
    const uCodeCtrl = this.modeloFormPkg.get('u_CodeBar');

    // Verificar si los 3 combos están seleccionados
    const objTypeValue = objType?.value ?? objType;
    const documentoValue = documento?.value ?? documento;
    const almacenValue = almacen?.value ?? almacen;

    if (objTypeValue && documentoValue && almacenValue) {
      uCodeCtrl?.enable({ emitEvent: false });
      // Enfocar el input para comenzar a escanear códigos de barras
      setTimeout(() => this.codeBarInput?.nativeElement.focus(), 50);
    } else {
      uCodeCtrl?.disable({ emitEvent: false });
      uCodeCtrl?.patchValue('', { emitEvent: false });
    }
  }

  // ===========================
  // Data Operations
  // ===========================

  private loadDataByBaseEntryBaseType(): void {
    const { objType } = this.modeloFormDoc.getRawValue();
    const { documento } = this.modeloFormDoc.getRawValue();
    const params: any = { u_BaseEntry: documento?.value, u_BaseType: objType?.value };

    this.pickingService.getListByBaseEntryBaseType(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: IPicking[]) => {
          this.modeloList = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadDataByBaseEntryBaseType', this.swaCustomService);
        }
      });
  }

  private validateSave(): boolean {
    const showError = (message: string): boolean => {
      this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail: message });
      return false;
    };
    const { objType, documento, almacen } = this.modeloFormDoc.value;
    const { u_CodeBar } = this.modeloFormPkg.value;

    if (!objType?.value) {
      return showError('Seleccione el tipo de documento.');
    }

    if (!documento?.value) {
      return showError('Seleccione el documento.');
    }

    if (!almacen?.value) {
      return showError('Seleccione el almacén.');
    }

    if (!u_CodeBar) {
      return showError('Ingrese el código de barras.');
    }

    return true;
  }

  private save(): void {
    if (!this.validateSave()) {
      return;
    }

    const modeloToSave = this.buildPickingCreateModel();

    // Evitar envíos concurrentes: deshabilitar el campo de código mientras procesamos
    const uCodeCtrl = this.modeloFormPkg.get('u_CodeBar');
    uCodeCtrl?.disable({ emitEvent: false });

    this.pickingService.setCreate(modeloToSave)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.modeloFormPkg.patchValue({ u_CodeBar: '' }, { emitEvent: false });

          // Re-habilitar el control sólo si los 3 combos están seleccionados
          try {
            const { objType, documento, almacen } = this.modeloFormDoc.getRawValue();
            const objTypeValue = objType?.value ?? objType;
            const documentoValue = documento?.value ?? documento;
            const almacenValue = almacen?.value ?? almacen;
            if (objTypeValue && documentoValue && almacenValue) {
              uCodeCtrl?.enable({ emitEvent: false });
            }
          } catch {
            // noop
          }

          // Reenfocar para el siguiente escaneo
          requestAnimationFrame(() => { try { this.codeBarInput?.nativeElement.focus(); } catch {} });
        })
      )
      .subscribe({
      next: (data) => {
        this.modeloList = data;
        this.messageService.add({ severity: 'success', summary: this.globalConstants.msgExitoSummary, detail: 'Se realizo correctamente.' });
      },
      error: (e) => {
        //this.isSaving = false;
        this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail: e?.error?.resultadoDescripcion || e?.message || 'Error al guardar.' });
      }
    });
  }

  private buildPickingCreateModel(): PickingCreateModel {
    const formValues = {
      ...this.modeloFormDoc.getRawValue(),
      ...this.modeloFormPkg.getRawValue()
    };

    return {
      u_BaseType   : formValues.objType?.value,
      u_BaseEntry  : formValues.documento?.value,
      u_FromWhsCod : formValues.almacen?.value,
      u_CodeBar    : formValues.u_CodeBar,
      u_UsrCreate  : this.userContextService.getIdUsuario()
    };
  }

  onClickSave(): void {
    this.save();
  }

  // ===========================
  // Delete Operations
  // ===========================

  onClickEliminar(): void {
    this.confirmDelete();
  }

  private confirmDelete(): void {
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

  private delete(): void {
    const params: any = {
      u_BaseEntry: this.modeloSelected.u_BaseEntry,
      u_BaseType: this.modeloSelected.u_BaseType,
      u_BaseLine: this.modeloSelected.u_BaseLine,
    };

    this.isDeleting = true;

    this.pickingService.setDeleteMassive(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isDeleting = false; })
      )
      .subscribe({
        next: () => {
          this.loadDataByBaseEntryBaseType();
          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'delete', this.swaCustomService);
        }
      });
  }

  // ===========================
  // Modal Operations
  // ===========================

  onClickVisualizar(): void {
    this.isVisualizar = true;
    this.loadModalData();
  }

  onToBuscar(): void {
    this.loadModalData();
  }

  private loadModalData(): void {
    if (!this.modeloSelected) {
      return;
    }

    this.isDisplay = true;
    this.listModeloModal = [];

    const params = this.buildModalParams();

    this.pickingService.getListByBaseEntry(params)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IPicking[]) => {
        this.listModeloModal = data;
      },
      error: (e) => {
        this.listModeloModal = [];
        this.showModalError(e?.error?.resultadoDescripcion ?? 'Ocurrió un error inesperado.');
      }
    });
  }

  private buildModalParams(): any {
    const { u_CodeBar } = this.modeloFormModal.getRawValue();

    return {
      u_Status    : this.modeloSelected.u_Status,
      u_BaseEntry : this.modeloSelected.u_BaseEntry,
      u_BaseType  : this.modeloSelected.u_BaseType,
      u_BaseLine  : this.modeloSelected.u_BaseLine,
      u_CodeBar
    };
  }

  onRowSelectedDelete(modelo: IPicking): void {
    this.deleteModeloModal = modelo;
    this.confirmDeleteRow();
  }

  private confirmDeleteRow(): void {
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
    const params: any = { docEntry: this.deleteModeloModal.docEntry };
    this.isDeleting = true;

    this.pickingService.setDelete(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isDeleting = false; })
      )
      .subscribe({
        next: () => {
          this.loadModalData();
          this.loadDataByBaseEntryBaseType();
          this.showModalSuccess(null);
        },
        error: (e) => {
          this.showModalError(e.error?.resultadoDescripcion || 'Ocurrió un error inesperado.');
        }
      });
  }

  onClickClose(): void {
    this.listModeloModal = [];
    this.modeloFormModal.patchValue({ u_CodeBar: '' });
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
  // Navigation
  // ===========================

  back(): void {
    this.router.navigate(['/main/modulo-inv/panel-picking-list']);
  }
}
