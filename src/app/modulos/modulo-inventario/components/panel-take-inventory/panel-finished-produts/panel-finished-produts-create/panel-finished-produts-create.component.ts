import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { MessageService, SelectItem } from 'primeng/api';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { TakeInventoryFinishedProductsCreateModel, TakeInventoryFinishedProductsFindModel } from 'src/app/modulos/modulo-inventario/models/take-inventory-finished-products.model';

import { TableColumn, MenuItem } from 'src/app/interface/common-ui.interface';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';
import { ITakeInventoryFinishedProducts } from 'src/app/modulos/modulo-inventario/interfaces/take-inventory-finished-products.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';
import { TakeInventoryFinishedProductsService } from 'src/app/modulos/modulo-inventario/services/take-inventory-finished-products.service';


@Component({
  selector: 'app-inv-panel-take-inventory-finished-products-create',
  templateUrl: './panel-finished-produts-create.component.html',
  styleUrls: ['./panel-finished-produts-create.component.css']
})
export class TakeInventoryFinishedProductsCreateComponent implements OnInit, OnDestroy {
  // Gestión del ciclo de vida
  private readonly destroy$                     = new Subject<void>();

  // Formularios
  modeloForm                                   : FormGroup;

  // Configuración
  readonly titulo                               = 'Producto terminado';
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // Estado de la UI
  isDisplay                                     = false;
  isDeleting                                    = false;
  isVisualizar                                  = false;

  // Configuración de la tabla
  columnas                                      : TableColumn[];
  opciones                                      : MenuItem[];
  warehouseList                                 : SelectItem[] = [];

  // Datos
  modelo                                        : ITakeInventoryFinishedProducts[] = [];
  modeloSelected                                : ITakeInventoryFinishedProducts;
  params                                        : TakeInventoryFinishedProductsFindModel = new TakeInventoryFinishedProductsFindModel();

  @ViewChild('codeBarInput')
  private codeBarInput: ElementRef<HTMLInputElement> | undefined;



  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly utilService: UtilService,
    private readonly messageService: MessageService,
    private readonly swaCustomService: SwaCustomService,
    private readonly warehousesService: WarehousesService,
    private readonly userContextService: UserContextService,
    private readonly takeInventoryFinishedProductsService: TakeInventoryFinishedProductsService,
  ) {}

  // ===========================
  // Hooks de ciclo de vida
  // ===========================

  ngOnInit(): void {
    this.initializeComponent();
  }


  // ===========================
  // Inicialización
  // ===========================

  private initializeComponent(): void {
    this.buildForms();
    this.buildColumns();
    this.loadWarehouseList();
    this.getListCurrentDate();
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      warehouse               : ['', Validators.required],
      codeBar                 : [{ value: '', disabled: true }, Validators.required]
    });
  }

  private buildColumns(): void {
    this.columnas = [
      { field: 'itemCode',        header: 'Código' },
      { field: 'dscription',      header: 'Descripción' },
      { field: 'whsCode',         header: 'Almacén' },
      { field: 'unitMsr',         header: 'UM' },
      { field: 'quantity',        header: 'Cantidad' },
      { field: 'weightKg',        header: 'Peso (Kg)' }
    ];
  }


  private getWarehouseValue(): string {
    const w = this.modeloForm.get('warehouse')?.value;
    return w?.value ?? w;
  }

  private resetCodeBar(): void {
    this.codeBarInput.nativeElement.value = '';
    this.modeloForm.get('codeBar')?.patchValue('', { emitEvent: false });
  }



  private loadWarehouseList(): void {
    const param: any = { inactive: 'N' }; // inactivo
    this.warehousesService.getListByInactive(param)
      .subscribe({
        next: (data: IWarehouses[]) => {
          this.warehouseList = data.map(item => ({ label: item.fullDescr, value: item.whsCode }));
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
      this.modelo = [];
    }
  }



  // ===========================
  // Operaciones de datos
  // ===========================

  private setParams(): void {
    // El combo de almacenes siempre estará lleno, así que leemos directamente el control
    const warehouse = this.modeloForm.get('warehouse').value;
    const warehouseValue = warehouse?.value ?? warehouse;

    // Enviar la fecha al backend (solo día).
    this.params = {
      whsCode     : warehouseValue,
      createDate  : this.utilService.normalizeDateOrToday(new Date()),
      usrCreate   : this.userContextService.getIdUsuario()
    };
  }

  private getListCurrentDate(): void {
    const warehouse = this.modeloForm.get('warehouse').value;

    if(!warehouse?.value) return;

    this.isDisplay = true;
    this.setParams();
    this.takeInventoryFinishedProductsService.getListCurrentDate(this.params)
    .pipe(
      finalize(() => { this.isDisplay = false; })
    )
    .subscribe({
      next: (data: any[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'getListCurrentDate', this.swaCustomService);
      }
    });
  }

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
    const formValues = { ...this.modeloForm.getRawValue() };
    const codeBar = formValues.codeBar;
    const warehouseValue = formValues.warehouse?.value ?? formValues.warehouse;

    // Evitar procesar código de barras vacío
    if (!codeBar) { return; }

    const modeloToSave: TakeInventoryFinishedProductsCreateModel = {
      createDate  : this.utilService.normalizeDateOrToday(new Date()),
      whsCode     : warehouseValue,
      codeBar     : codeBar,
      usrCreate   : this.userContextService.getIdUsuario()
    };

    // Construir payload para el backend (formatear fechas)
    const payload: any = {
      ...modeloToSave,
      createDate: this.utilService.fechaApi_POST(modeloToSave.createDate),
      createTime: this.utilService.horaMinutoToInt(new Date()),
    };

    // Evitar envíos concurrentes: deshabilitar el campo de código mientras procesamos
    const uCodeCtrl = this.modeloForm.get('codeBar');
    uCodeCtrl?.disable({ emitEvent: false });

    this.takeInventoryFinishedProductsService.setCreate(payload)
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
          this.modelo = data;
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

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // ===========================
  // Navegación
  // ===========================

  back(): void {
    this.router.navigate(['/main/modulo-inv/panel-take-inventory-finished-products-list']);
  }
}
