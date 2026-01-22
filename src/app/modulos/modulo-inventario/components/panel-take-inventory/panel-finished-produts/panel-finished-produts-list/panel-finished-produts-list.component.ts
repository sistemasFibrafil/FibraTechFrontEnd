import Swal from 'sweetalert2';
import { forkJoin } from 'rxjs';
import { Subject } from 'rxjs';
import { finalize, switchMap, takeUntil } from 'rxjs/operators';
import { saveAs } from 'file-saver';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { UtilService } from 'src/app/services/util.service';
import { UserContextService } from 'src/app/services/user-context.service';

import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/warehouses.service';
import { TakeInventoryFinishedProductsService } from 'src/app/modulos/modulo-inventario/services/take-inventory-finished-products.service';
import { ITakeInventoryFinishedProducts, ITakeInventoryFinishedProducts1 } from 'src/app/modulos/modulo-inventario/interfaces/take-inventory-finished-products.interface';
import { TakeInventoryFinishedProductsFilterModel } from 'src/app/modulos/modulo-inventario/models/take-inventory-finished-products.model';
import { UsuarioService } from 'src/app/modulos/modulo-seguridad/services/usuario.service';



@Component({
  selector: 'app-inv-panel-take-inventory-finished-products-list',
  templateUrl: './panel-finished-produts-list.component.html',
  styleUrls: ['./panel-finished-produts-list.component.css']
})
export class TakeInventoryFinishedProductsListComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                   : FormGroup;
  modeloFormModal                               : FormGroup;

  // Configuration
  readonly titulo                               = 'Producto terminado';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     = false;
  isDeleting                                    = false;
  isVisualizar                                  = false;

  // Table configuration
  columnas                                      : any[] = [];
  columnasModal                                 : any[] = [];
  opciones                                      : any[] = [];
  opciones2                                     : any[] = [];
  opciones3                                     : any[] = [];
  usuarioList                                   : SelectItem[] = [];
  warehouseList                                 : SelectItem[] = [];

  // Data
  modelo                                        : ITakeInventoryFinishedProducts[] = [];
  modeloModal                                   : ITakeInventoryFinishedProducts1[] = [];
  modeloDelete                                  : ITakeInventoryFinishedProducts;
  modeloSelected                                : ITakeInventoryFinishedProducts;
  modeloModalSeleted                            : ITakeInventoryFinishedProducts1;
  modeloCopyToSelected                          : ITakeInventoryFinishedProducts[] = [];
  params                                        : TakeInventoryFinishedProductsFilterModel = new TakeInventoryFinishedProductsFilterModel();


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly usuarioService: UsuarioService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly takeInventoryFinishedProductsService: TakeInventoryFinishedProductsService,
    public  readonly utilService: UtilService
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
    this.loadAllCombos();
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      rangeDates                : [[this.utilService.currentDate(), this.utilService.currentDate()], [Validators.required, this.rangeDatesValidator]],
      usuario                   : [[], Validators.required],
      warehouse                 : [[], Validators.required],
      item                      : ['']
    });

    this.modeloFormModal = this.fb.group({
      codeBar                 : ['', Validators.required]
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-take-inventory-finished-products-list');
  }

  // Validador que requiere que rangeDates sea un array con fecha inicial y final
  private rangeDatesValidator(control: AbstractControl): ValidationErrors | null {
    const val = control.value;
    if (!Array.isArray(val)) {
      return { invalidRange: true };
    }
    const [start, end] = val;
    if (!start || !end) {
      return { invalidRange: true };
    }
    return null;
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'ItemCode',        header: 'Código' },
      { field: 'Dscription',      header: 'Descripción' },
      { field: 'WhsCode',         header: 'Almacén' },
      { field: 'UnitMsr',         header: 'UM' },
      { field: 'OnHandPhy',       header: 'Físico' },
      { field: 'OnHandSys',       header: 'Sistema' },
      { field: 'Difference',      header: 'Diferencia' },
      { field: 'Quantity',        header: 'Cantidad' },
      { field: 'WeightKg',        header: 'Peso (Kg)' },
    ];
    this.columnasModal = [
      { field: 'CodeBar',         header: 'Barcode' },
      { field: 'ProductionDate',  header: 'Fecha de Producción' },
      { field: 'WeightKg',        header: 'Peso' }
    ];
  }

  private buildMenuOptions(): void {
    this.opciones = [
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.onClickDelete() },
      { label: 'Visualizar', icon: 'pi pi-eye', command: () => this.onClickVisualize() }
    ];
    this.opciones2 = [
      { label: 'Resumido ítem',  icon: 'pi pi-download', command: () => this.onClickSummaryItemExcel() },
      { label: 'Resumido User',  icon: 'pi pi-download', command: () => this.onClickSummaryUserExcel() },
      { label: 'Detallado',      icon: 'pi pi-download', command: () => this.onClickDetailedExcel() }
    ];
    this.opciones3 = [
      { value: '1',  label: 'Solicitud', icon: 'pi pi-cart-plus', command: () => this.onClickToCopy() }
    ];
  }

  // ===========================
  // Data Operations
  // ===========================

  private loadAllCombos(): void {
    const paramAlmacen: any = { inactive: 'N' };

    // Mostrar spinner mientras cargan los combos y la lista resultante
    this.isDisplay = true;

    forkJoin({
      usuarios: this.usuarioService.getList(),
      almacenes: this.warehousesService.getListByInactive(paramAlmacen)
    })
    .pipe(
      takeUntil(this.destroy$),
      switchMap(res => {
        // Usuarios
        const usuarioData = (res.usuarios || []) as any[];
        this.usuarioList = usuarioData.map(i => ({ label: i.nombreCompleto, value: i.idUsuario }));
        const idUsuarioActual = this.userContextService.getIdUsuario();
        const defaultUsuario = usuarioData.find(i => i.idUsuario === idUsuarioActual);
        if (defaultUsuario) {
          this.modeloForm.get('usuario').setValue([defaultUsuario.idUsuario], { emitEvent: false });
        }

        // Almacenes
        const activos = (res.almacenes || []) as any[];
        this.warehouseList = activos.map(a => ({ label: a.fullDescr, value: a.whsCode }));

        // Seleccionar por defecto todos los códigos de almacén (sin emitir eventos)
        const defaultSelectedCodes = activos.map(a => a.whsCode);
        this.modeloForm.get('warehouse')?.setValue(defaultSelectedCodes, { emitEvent: false });

        // Preparar parámetros para la búsqueda y devolver la petición de la lista
        this.setParams();
        return this.takeInventoryFinishedProductsService.getListByFilter(this.params);
      }),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (data: ITakeInventoryFinishedProducts[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  private setParams(): void {
    const formValue = this.modeloForm.getRawValue();

    const usuarios = Array.isArray(formValue.usuario) ? formValue.usuario.join(',') : formValue.usuario;
    const warehouse= Array.isArray(formValue.warehouse) ? formValue.warehouse.join(',') : formValue.warehouse;
    const itemCode = (this.modeloCopyToSelected || []).map(x => x.itemCode).join(',');

    // Obtener fechas desde rangeDates si existe (espera [start, end])
    const range = formValue.rangeDates;
    const startRaw = Array.isArray(range) && range.length > 0 ? range[0] : formValue.startDate;
    const endRaw = Array.isArray(range) && range.length > 1 ? range[1] : formValue.endDate;

    this.params =
    {
      ...formValue,
      startDate : this.utilService.normalizeDate(startRaw),
      endDate   : this.utilService.normalizeDate(endRaw),
      usuario   : usuarios,
      whsCode   : warehouse,
      itemCode  : itemCode
    };
  }

  private getList(): void {
    this.isDisplay = true;
    this.setParams();
    this.takeInventoryFinishedProductsService.getListByFilter(this.params)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (data: ITakeInventoryFinishedProducts[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getList', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  // ===========================
  // UI Actions
  // ===========================

  onClickSearch(): void {
    this.getList();
  }

  onClickSummaryItemExcel(): void {
    this.isDisplay = true;
    this.setParams();
    this.takeInventoryFinishedProductsService.getSummaryItemExcelByFilter(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          saveAs(
            new Blob([response], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            'Toma de inventario-resumido por artículo-' + this.utilService.fecha_DD_MM_YYYY()
          );
          this.isDisplay = false;
          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onClickSummaryItemExcel', () => { this.isDisplay = false; }, this.swaCustomService);
        }
      });
  }

  onClickSummaryUserExcel(): void {
    this.isDisplay = true;
    this.setParams();
    this.takeInventoryFinishedProductsService.getSummaryUserExcelByFilter(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          saveAs(
            new Blob([response], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            'Toma de inventario-resumido por usuario-' + this.utilService.fecha_DD_MM_YYYY()
          );
          this.isDisplay = false;
          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onClickSummaryUserExcel', () => { this.isDisplay = false; }, this.swaCustomService);
        }
      });
  }

  onClickDetailedExcel(): void {
    this.isDisplay = true;
    this.setParams();
    this.takeInventoryFinishedProductsService.getDetailedExcelByFilter(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          saveAs(
            new Blob([response], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            'Toma de inventario-detallado-' + this.utilService.fecha_DD_MM_YYYY()
          );
          this.isDisplay = false;
          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onClickDetailedExcel', () => { this.isDisplay = false; }, this.swaCustomService);
        }
      });
  }

  onClickCreate(): void {
    this.router.navigate(['/main/modulo-inv/panel-take-inventory-finished-products-create']);
  }

  onToItemSelected(modelo: ITakeInventoryFinishedProducts): void {
    this.modeloSelected = modelo;
  }

  private delete(): void {
    this.isDeleting = true;
    const params: any = {
      docEntry    : this.modeloSelected.docEntry,
      isDelete    : 'Y',
      usrDelete   : this.userContextService.getIdUsuario(),
      deleteDate  : this.utilService.fechaApi_POST(new Date()),
      deleteTime  : this.utilService.horaMinutoToInt(new Date()),
    };

    this.takeInventoryFinishedProductsService.setDelete(params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.getList();
          this.isDeleting = false;
          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'delete', () => { this.isDeleting = false; }, this.swaCustomService);
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

  onClickVisualize(): void {
    this.isVisualizar = !this.isVisualizar;
    this.loadModalData();
  }

  // ===========================
  // Modal Operations
  // ===========================

  onClickSearchModal(): void {
    this.loadModalData();
  }

  private loadModalData(): void {
    this.isDisplay = true;
    this.modeloModal = [];
    const { codeBar } = this.modeloFormModal.value;
    const value: any = {
      docEntry: this.modeloSelected.docEntry,
      codeBar: codeBar
    };

    this.takeInventoryFinishedProductsService.getListByItemCode(value)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: ITakeInventoryFinishedProducts1[]) => {
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

  onClickSelectedDeleteRow(modelo: ITakeInventoryFinishedProducts1): void {
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
    this.isDeleting = true;
    const params: any = {
      docEntry    : this.modeloModalSeleted.docEntry,
      lineId      : this.modeloModalSeleted.lineId,
      isDelete    : 'Y',
      usrDelete   : this.userContextService.getIdUsuario(),
      deleteDate  : this.utilService.fechaApi_POST(new Date()),
      deleteTime  : this.utilService.horaMinutoToInt(new Date()),
    };

    debugger;

    this.takeInventoryFinishedProductsService.setDeleteLine(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => { this.isDeleting = false; })
      )
      .subscribe({
        next: () => {
          this.getList();
          this.loadModalData();
          this.showModalSuccess(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'deleteRow', () => { this.isDeleting = false; }, this.swaCustomService);
        }
      });
  }

  onClickClose(): void {
    this.modeloModal = [];
    this.modeloFormModal.patchValue({ CodeBar: '' });
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

  onClickToCopy(): void {
    if (!this.modeloCopyToSelected) return;
    this.takeInventoryFinishedProductsService.getToCopy(this.params)
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-create', JSON.stringify(data)]);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onClickToCopy', () => {}, this.swaCustomService);
      }
    });
  }
}
