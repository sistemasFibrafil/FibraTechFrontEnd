import Swal from 'sweetalert2';
import { saveAs } from 'file-saver';
import { Subject, forkJoin } from 'rxjs';
import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { finalize, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { TakeInventoryFinishedProductsFilterModel, TakeInventoryFinishedProductsToCopyFindModel } from 'src/app/modulos/modulo-inventario/models/take-inventory-finished-products.model';

import { ITakeInventoryFinishedProducts, ITakeInventoryFinishedProducts1 } from 'src/app/modulos/modulo-inventario/interfaces/take-inventory-finished-products.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { UsuarioService } from 'src/app/modulos/modulo-seguridad/services/usuario.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { TakeInventoryFinishedProductsService } from 'src/app/modulos/modulo-inventario/services/take-inventory-finished-products.service';


@Component({
  selector: 'app-inv-panel-take-inventory-finished-products-list',
  templateUrl: './panel-finished-produts-list.component.html',
  styleUrls: ['./panel-finished-produts-list.component.css']
})
export class TakeInventoryFinishedProductsListComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();
  // Forms
  modeloForm                                    : FormGroup;
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

  usuarioList                                   : SelectItem[] = [];
  warehouseList                                 : SelectItem[] = [];

  columnas                                      : any[] = [];
  opciones                                      : any[] = [];
  opciones2                                     : any[] = [];
  opciones3                                     : any[] = [];
  columnasModal                                 : any[] = [];

  // Data
  modeloDelete                                  : ITakeInventoryFinishedProducts;
  modeloSelected                                : ITakeInventoryFinishedProducts;
  modeloModalSeleted                            : ITakeInventoryFinishedProducts1;

  modelo                                        : ITakeInventoryFinishedProducts[] = [];
  modeloModal                                   : ITakeInventoryFinishedProducts1[] = [];
  modeloCopyToSelected                          : ITakeInventoryFinishedProducts[] = [];


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

    if (!this.buttonAcces.btnBuscar) {
      this.loadData();
    }
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
      { label: 'Ver',      icon: 'pi pi-eye',   command: () => this.onClickView() },
      { label: 'Eliminar', icon: 'pi pi-trash', command: () => this.onClickDelete() }
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

    this.isDisplay = true;

    forkJoin({
      usuarios: this.usuarioService.getList(),
      almacenes: this.warehousesService.getListByInactive(paramAlmacen)
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: res => {
        // Usuarios
        const usuarioData = (res.usuarios || []) as any[];
        this.usuarioList = usuarioData.map(i => ({
          label: i.nombreCompleto,
          value: i.idUsuario
        }));

        const idUsuarioActual = this.userContextService.getIdUsuario();
        const defaultUsuario = usuarioData.find(i => i.idUsuario === idUsuarioActual);

        if (defaultUsuario) {
          this.modeloForm.get('usuario')?.setValue([defaultUsuario.idUsuario], { emitEvent: false });
        }

        // Almacenes
        const activos = (res.almacenes || []) as any[];
        this.warehouseList = activos.map(a => ({
          label: a.fullDescr,
          value: a.whsCode
        }));

        // Seleccionar todos por defecto
        const defaultSelectedCodes = activos.map(a => a.whsCode);
        this.modeloForm.get('warehouse')?.setValue(defaultSelectedCodes, { emitEvent: false });
      },
      error: e => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }


  private buildFilterParams(): TakeInventoryFinishedProductsFilterModel {
    const {
      rangeDates,
      startDate,
      endDate,
      usuario,
      warehouse,
      item
    } = this.modeloForm.getRawValue();

    const range = rangeDates ?? [];

    const startRaw = range[0] ?? startDate;
    const endRaw   = range[1] ?? endDate;

    return {
      startDate: this.utilService.normalizeDateOrToday(startRaw),
      endDate: this.utilService.normalizeDateOrToday(endRaw),
      usuario: (usuario || []).join(','),
      whsCode: (warehouse || []).join(','),
      item: this.utilService.normalizePrimitive(item)
    };
  }

  private loadData(): void {
    this.isDisplay = true;

    this.takeInventoryFinishedProductsService
    .getListByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (data: ITakeInventoryFinishedProducts[]) => {
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

  onClickSearch(): void {
    this.loadData();
  }

  onClickSummaryItemExcel(): void {
    this.isDisplay = true;

    this.takeInventoryFinishedProductsService
    .getSummaryItemExcelByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (response: any) => {
        saveAs(
          new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }),
          'Toma de inventario-resumido por artículo-' + this.utilService.fecha_DD_MM_YYYY()
        );

        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onClickSummaryItemExcel', this.swaCustomService);
      }
    });
  }

  onClickSummaryUserExcel(): void {
    this.isDisplay = true;

    this.takeInventoryFinishedProductsService
    .getSummaryUserExcelByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (response: any) => {
        saveAs(
          new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }),
          'Toma de inventario-resumido por usuario-' + this.utilService.fecha_DD_MM_YYYY()
        );

        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onClickSummaryUserExcel', this.swaCustomService);
      }
    });
  }

  onClickDetailedExcel(): void {
    this.isDisplay = true;

    this.takeInventoryFinishedProductsService
    .getDetailedExcelByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (response: any) => {
        saveAs(
          new Blob([response], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
          }),
          'Toma de inventario-detallado-' + this.utilService.fecha_DD_MM_YYYY()
        );

        this.swaCustomService.swaMsgExito(null);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onClickDetailedExcel', this.swaCustomService);
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
      docEntry   : this.modeloSelected.docEntry,
      isDelete   : 'Y',
      usrDelete  : this.userContextService.getIdUsuario(),
      deleteDate : this.utilService.fechaApi_POST(new Date()),
      deleteTime : this.utilService.horaMinutoToInt(new Date()),
    };

    this.takeInventoryFinishedProductsService
      .setDelete(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDeleting = false;
        })
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

  onClickView(): void {
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

    this.takeInventoryFinishedProductsService
    .getListByItemCode(value)
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

    this.takeInventoryFinishedProductsService.setDeleteLine(params)
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
          this.utilService.handleErrorSingle(e, 'deleteRow', this.swaCustomService);
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

    return swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, message, 'error');
  }

  private buildFindParams(): TakeInventoryFinishedProductsToCopyFindModel {
    const {
      rangeDates,
      startDate,
      endDate,
      usuario,
      warehouse,
      item
    } = this.modeloForm.getRawValue();

    const range = rangeDates ?? [];

    const startRaw = range[0] ?? startDate;
    const endRaw   = range[1] ?? endDate;

    return {
      startDate : this.utilService.normalizeDateOrToday(startRaw),
      endDate   : this.utilService.normalizeDateOrToday(endRaw),
      usuario   : (usuario || []).join(','),
      whsCode   : (warehouse || []).join(','),
      item      : this.utilService.normalizePrimitive(item),
      itemCode  : (this.modeloCopyToSelected ?? []).map(x => x.itemCode).join(',')
    };
  }

  onClickToCopy(): void {
    if (!this.modeloCopyToSelected) return;

    this.takeInventoryFinishedProductsService.getToCopy(this.buildFindParams())
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (data) => {
        // respaldo para refresh
        sessionStorage.setItem('TomaInventarioCopyTo',JSON.stringify(data));

        this.router.navigate(['/main/modulo-inv/panel-solicitud-traslado-create'], { state: { mode: 'copy', tomaInventario: data } });
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'onClickToCopy', this.swaCustomService);
      }
    });
  }
}
