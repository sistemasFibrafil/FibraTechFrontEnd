import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { MessageService, SelectItem } from 'primeng/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { TakeInventorySparePartsCreateModel, TakeInventorySparePartsDeleteModel, TakeInventorySparePartsFindModel, TakeInventorySparePartsModel, TakeInventorySparePartsUpdateModel } from 'src/app/modulos/modulo-inventario/models/take-inventory-spare-parts.model';

import { TableColumn } from 'src/app/interface/common-ui.interface';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { TakeInventorySparePartsService } from 'src/app/modulos/modulo-inventario/services/take-inventory-spare-parts.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';


@Component({
  selector: 'app-inv-panel-take-inventory-spare-parts-create',
  templateUrl: './panel-spare-parts-create.component.html',
  styleUrls: ['./panel-spare-parts-create.component.css']
})
export class PanelTakeInventorySparePartsCreateComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               = 'Repuesto';
  // Acceso de botones
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     = false;

  // Table configuration
  columnas                                      : TableColumn[];
  warehouseList                                 : SelectItem[] = [];

  // Data
  modeloDelete                                  : TakeInventorySparePartsModel;
  modeloList                                    : TakeInventorySparePartsModel[] = [];
  modelocloned                                  : { [s: string]: TakeInventorySparePartsModel; } = {};


  @ViewChild('codeBarInput')
  private codeBarInput: ElementRef<HTMLInputElement> | undefined;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly messageService: MessageService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly takeInventorySparePartsService: TakeInventorySparePartsService,
    public  readonly utilService: UtilService,
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
    this.loadWarehouseList();
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      warehouse                 : [{ value: '', disabled: false }, Validators.required],
      codeBar                   : ['', Validators.required],
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-take-inventory-spare-parts-list');
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

  private loadWarehouseList(): void {
    const param: any = { inactive: 'N' }; // inactivo
    this.warehousesService.getListByInactive(param)
      .subscribe({
        next: (data: IWarehouses[]) => {
          this.warehouseList = data.map(item => ({ label: item.fullDescr, value: item.whsCode }));

          const whsCode = this.userContextService.getWhsCodeSpareParts()

          if(whsCode) {
            // Buscar la opción correspondiente en la lista
            const match = this.warehouseList.find(w => w.value === whsCode);

            if (match) {
              // Asignar el valor primitivo y ejecutar la lógica de cambio (habilita codeBar)
              this.modeloForm.get('warehouse')?.setValue(match);
              this.onChangeWarehouse();
            }
          }
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadWarehouseList', this.swaCustomService);
        }
    });
  }

  onChangeWarehouse(): void {
    // Habilitar o deshabilitar el input de código de barras según la selección de almacén
    const warehouse = this.modeloForm.get('warehouse')?.value;
    const warehouseValue = warehouse?.value ?? warehouse;
    const uCodeCtrl = this.modeloForm.get('codeBar');

    if (warehouseValue) {
      uCodeCtrl?.enable({ emitEvent: false });
      // enfocar el input para escaneo rápido
      setTimeout(() => this.codeBarInput?.nativeElement.focus(), 50);
      this.getListCurrentDate();
    } else {
      uCodeCtrl?.disable({ emitEvent: false });
      uCodeCtrl?.patchValue('', { emitEvent: false });
      // limpiar resultados actuales cuando no hay almacén seleccionado
      this.modeloList = [];
    }
  }

  private buildFilterParams(): TakeInventorySparePartsFindModel {
    const warehouseControl = this.modeloForm.get('warehouse')?.value;
    const warehouseValue = warehouseControl?.value ?? warehouseControl;

    return {
      u_CreateDate: this.utilService.normalizeDateOrToday(new Date()),
      u_WhsCode   : warehouseValue,
      u_UsrCreate : this.userContextService.getIdUsuario()
    };
  }

  private getListCurrentDate(): void {
    const warehouse = this.modeloForm.get('warehouse').value;

    if(!warehouse?.value) return;

    this.isDisplay = true;

    this.takeInventorySparePartsService.getListCurrentDate(this.buildFilterParams())
    .pipe(
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (data: any[]) => {
        this.modeloList = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListCurrentDate', this.swaCustomService);
      }
    });
  }


  // ===========================
  // Data Operations
  // ===========================


  private validateSave(): boolean {
      const showError = (message: string): boolean => {
        this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail: message });
        return false;
      };

      const { warehouse, codeBar } = this.modeloForm.getRawValue();
      const warehouseValue = warehouse?.value ?? warehouse;

      if (!warehouseValue) {
        return showError('Seleccione el almacén.');
      }

      if (!codeBar) {
        return showError('Ingrese el código de barras.');
      }

      return true;
    }

    private save(): void {
      if (!this.validateSave()) {
        return;
      }

      // Construir el modelo para el guardado
      const formValues      = { ...this.modeloForm.getRawValue() };
      const codeBar         = formValues.codeBar;
      const warehouseValue  = formValues.warehouse?.value ?? formValues.warehouse;

      // Evitar procesar código de barras vacío
      if (!codeBar) { return; }

      const modeloToSave: TakeInventorySparePartsCreateModel = {
        u_WhsCode   : warehouseValue,
        u_CodeBar   : codeBar,
        u_UsrCreate : this.userContextService.getIdUsuario(),
        u_CreateDate: this.utilService.fechaApi_POST(new Date()),
        u_CreateTime: this.utilService.fechaApi_POST_HHMM(new Date()),
      };

      // Evitar envíos concurrentes: deshabilitar el campo de código mientras procesamos
      const uCodeCtrl = this.modeloForm.get('codeBar');
      uCodeCtrl?.disable({ emitEvent: false });

      //this.takeInventorySparePartsService.setCreate(payload)
      this.takeInventorySparePartsService.setCreate(modeloToSave)
        .pipe(
          takeUntil(this.destroy$),
          finalize(() => {
            // Limpiar input sin emitir valueChanges
            this.modeloForm.patchValue({ codeBar: '' }, { emitEvent: false });

            // Re-habilitar el control sólo si hay almacén seleccionado
            try {
              const warehouse = this.modeloForm.get('warehouse')?.value;
              const warehouseValue = warehouse?.value ?? warehouse;
              if (warehouseValue) { uCodeCtrl?.enable({ emitEvent: false }); }
            } catch {
              // noop
            }

            // Reenfocar para el siguiente escaneo
            requestAnimationFrame(() => { try { this.codeBarInput?.nativeElement.focus(); } catch {} });
          })
        )
        .subscribe({
        next: (data: any[]) => {
          this.modeloList = data;
          this.messageService.add({ severity: 'success', summary: this.globalConstants.msgExitoSummary, detail: 'Se realizo correctamente.' });
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail: e?.error?.resultadoDescripcion || e?.message || 'Error al guardar.' });
        }
      });
  }

  onClickSave(): void {
    this.save();
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
          this.takeInventorySparePartsService.getListCurrentDate(this.buildFilterParams())
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
        // Después de eliminar, recargar la lista desde el backend
        try {
          this.takeInventorySparePartsService.getListCurrentDate(this.buildFilterParams())
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

  // ===========================
  // Navigation
  // ===========================

  back(): void {
    this.router.navigate(['/main/modulo-inv/panel-take-inventory-spare-parts-list']);
  }
}
