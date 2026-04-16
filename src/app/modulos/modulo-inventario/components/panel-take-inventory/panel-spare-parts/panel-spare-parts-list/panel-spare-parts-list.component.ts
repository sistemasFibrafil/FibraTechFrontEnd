import { Subject } from 'rxjs';
import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
import { MessageService, SelectItem } from 'primeng/api';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { finalize, forkJoin, switchMap, takeUntil } from 'rxjs';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators } from '@angular/forms';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { TakeInventorySparePartsDeleteModel, TakeInventorySparePartsModel, TakeInventorySparePartsUpdateModel } from 'src/app/modulos/modulo-inventario/models/take-inventory-spare-parts.model';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { UsuarioService } from 'src/app/modulos/modulo-seguridad/services/usuario.service';
import { TakeInventorySparePartsService } from 'src/app/modulos/modulo-inventario/services/take-inventory-spare-parts.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';


@Component({
  selector: 'app-inv-panel-take-inventory-spare-parts-list',
  templateUrl: './panel-spare-parts-list.component.html',
  styleUrls: ['./panel-spare-parts-list.component.css']
})
export class PanelTakeInventorySparePartsListComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               = 'Repuesto';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     = false;

  // Table configuration
  columnas                                      : any[] = [];
  usuarioList                                   : SelectItem[] = [];
  warehouseList                                 : SelectItem[] = [];

  // Data
  modeloDelete                                  : TakeInventorySparePartsModel;
  modeloList                                    : TakeInventorySparePartsModel[] = [];
  modelocloned                                  : { [s: string]: TakeInventorySparePartsModel; } = {};
  fileName                                      = 'Toma de inventario - repuestos-' + this.utilService.fecha_DD_MM_YYYY();


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly usuarioService: UsuarioService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly takeInventorySparePartsService: TakeInventorySparePartsService,
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
    this.loadAllCombos();
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      rangeDates    : [ [this.utilService.currentDate(), this.utilService.currentDate()], [Validators.required, this.rangeDatesValidator.bind(this)] ],
      usuario       : ['', Validators.required],
      warehouse     : ['', Validators.required],
      item          : ['']
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-take-inventory-spare-parts-list');
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
      { field: 'u_ItemCode',    header: 'Código' },
      { field: 'u_Dscription',  header: 'Descripción' },
      { field: 'u_WhsCode',     header: 'Almacén' },
      { field: 'u_UnitMsr',     header: 'UM' },
      { field: 'u_OnHandPhy',   header: 'Físico' },
      { field: 'u_OnHandSys',   header: 'Sistema' },
      { field: 'u_Difference',  header: 'Diferencia' }
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

        const whsCodeSapareParts = this.userContextService.getWhsCodeSpareParts();

        if (whsCodeSapareParts) {
          // Preseleccionar solo los código de repuestos
          const warehouseSpareParts = res.almacenes.filter(a => a.whsCode === whsCodeSapareParts);

          // Preseleccionar todos los códigos de activos
          const activosCodes = new Set(activos.map(a => a.whsCode));
          const defaultSelectedCodes = warehouseSpareParts.map(p => p.whsCode).filter(c => activosCodes.has(c));
          this.modeloForm.get('warehouse')?.setValue(defaultSelectedCodes, { emitEvent: false });
        }

        // Preparar parámetros para la búsqueda y devolver la petición de la lista
        return this.takeInventorySparePartsService.getListByFilter(this.buildFilterParams());
      }),
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (data: TakeInventorySparePartsModel[]) => {
        this.modeloList = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(): any {
    const formValue = this.modeloForm.getRawValue();

    const usuarios = Array.isArray(formValue.usuario)
      ? formValue.usuario.join(',')
      : formValue.usuario;

    const warehouses = Array.isArray(formValue.warehouse)
      ? formValue.warehouse.join(',')
      : formValue.warehouse;

    // Obtener fechas desde rangeDates si existe ([start, end])
    const range = formValue.rangeDates;
    const startRaw = Array.isArray(range) && range.length > 0
      ? range[0]
      : formValue.startDate;

    const endRaw = Array.isArray(range) && range.length > 1
      ? range[1]
      : formValue.endDate;

    return {
      ...formValue,
      startDate : this.utilService.normalizeDateOrToday(startRaw),
      endDate   : this.utilService.normalizeDateOrToday(endRaw),
      usuario   : usuarios,
      whsCode   : warehouses
    };
  }

  private loadData(): void {
      this.isDisplay = true;

    this.takeInventorySparePartsService
    .getListByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: TakeInventorySparePartsModel[]) => {
        this.modeloList = data;
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

  onClickExcel(): void {
    this.isDisplay = true;

    this.takeInventorySparePartsService
      .getExcelByFilter(this.buildFilterParams())
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
            this.fileName
          );

          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'onClickSummaryExcel', this.swaCustomService);
        }
      });
  }

  onClickCreate(): void {
    this.router.navigate(['/main/modulo-inv/panel-take-inventory-spare-parts-create']);
  }

  onChangeQuantity(value: TakeInventorySparePartsModel, index: number): void {
    const onHandPhy   = this.utilService.onRedondearDecimal(value.u_OnHandPhy, 3);
    const onHandSys   = this.utilService.onRedondearDecimal(value.u_OnHandSys, 3);
    const difference  = this.utilService.onRedondearDecimal(onHandPhy - onHandSys, 3);

    this.modeloList[index].u_Difference = difference;
  }

  onRowEditInit(modelo: TakeInventorySparePartsModel) {
    this.modelocloned[modelo.docEntry] = {...modelo};
  }

  onRowEditSave(modelo: TakeInventorySparePartsModel) {
    const modeloToSave: TakeInventorySparePartsUpdateModel = {
      docEntry    : Number(modelo.docEntry),
      u_WhsCode   : modelo.u_WhsCode,
      u_OnHandPhy : Number(modelo.u_OnHandPhy),
      u_Difference: Number(modelo.u_Difference),
      u_UsrUpdate : Number(this.userContextService.getIdUsuario()),
      u_UpdateDate: this.utilService.fechaApi_POST(new Date()),
      u_UpdateTime: this.utilService.fechaApi_POST_HHMM(new Date()),
    };

    this.takeInventorySparePartsService.setUpdate(modeloToSave)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          delete this.modelocloned[modelo.docEntry];
        })
      )
      .subscribe({
      next: () => {
        // Después de actualizar, recargar la lista para reflejar cambios desde el backend
        try {
          this.takeInventorySparePartsService.getListByFilter(this.buildFilterParams())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (data: any[]) => {
                this.modeloList = data;
                this.messageService.add({ severity: 'success', summary: this.globalConstants.msgExitoSummary, detail: 'Se realizo correctamente.' });
              },
              error: (err) => {
                const detail = err?.error?.resultadoDescripcion || err?.message || 'Error al obtener la lista.';
                this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail });
              }
            });
        } catch (err) {
          const detail = (err as any)?.message || 'Error al recargar lista.';
          this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail: e?.error?.resultadoDescripcion || e?.message || 'Error al actualizar.' });
      }
    });
  }

  onRowEditCancel(modelo: TakeInventorySparePartsModel, index: number) {
    this.modeloList[index] = this.modelocloned[modelo.docEntry];
    delete this.modelocloned[modelo.docEntry];
  }

  private delete(): void {
    const modeloToDelete: TakeInventorySparePartsDeleteModel = {
      docEntry    : Number(this.modeloDelete.docEntry),
      u_WhsCode   : this.modeloDelete.u_WhsCode,
      u_IsDelete  : 'Y',
      u_UsrDelete : Number(this.userContextService.getIdUsuario()),
      u_DeleteDate: this.utilService.fechaApi_POST(new Date()),
      u_DeleteTime: this.utilService.fechaApi_POST_HHMM(new Date()),
    };

    this.takeInventorySparePartsService.setDelete(modeloToDelete)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { })
    )
    .subscribe({
    next: () => {
        // Recargar la lista desde el backend usando el filtro actual
        try {
          this.takeInventorySparePartsService.getListByFilter(this.buildFilterParams())
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (data: TakeInventorySparePartsModel[]) => {
                this.modeloList = data;
                this.messageService.add({ severity: 'success', summary: this.globalConstants.msgExitoSummary, detail: 'Se realizo correctamente.' });
              },
              error: (err) => {
                const detail = err?.error?.resultadoDescripcion || err?.message || 'Error al obtener la lista.';
                this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail });
              }
            });
        } catch (err) {
          const detail = (err as any)?.message || 'Error al recargar lista.';
          this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail });
        }
      },
      error: (e) => {
        this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail: e?.error?.resultadoDescripcion || e?.message || 'Error al eliminar.' });
      }
    });
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

  onRowSelectDelete(modelo: TakeInventorySparePartsModel) {
    this.modeloDelete = modelo;
    this.confirmDelete();
  }
}
