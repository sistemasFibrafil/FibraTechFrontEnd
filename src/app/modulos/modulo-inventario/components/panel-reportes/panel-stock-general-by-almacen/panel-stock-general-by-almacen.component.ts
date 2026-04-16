// Angular core & common
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Third-party libraries
import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';

// RxJS
import { finalize, map, Subject, switchMap, takeUntil } from 'rxjs';

// Models & constants
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

// Interfaces
import { IArticuloReporte } from '../../../interfaces/items.interface';
import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/warehouses.interface';

// Services
import { UtilService } from 'src/app/services/util.service';
import { ItemsService } from '../../../services/items.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/warehouses.service';


@Component({
  selector: 'app-inv-panel-stock-general-by-almacen',
  templateUrl: './panel-stock-general-by-almacen.component.html',
  styleUrls: ['./panel-stock-general-by-almacen.component.css']
})
export class PanelStockGeneralByAlmacenComponent implements OnInit, OnDestroy {
  // Control de ciclo de vida para desuscribir observables
  private readonly destroy$ = new Subject<void>();

  // Formulario principal del reporte
  modeloForm          : FormGroup;

  // Títulos a mostrar en la UI
  titulo              = 'Stock General';
  subtitulo           = 'Stock General';

  // Catálogo global de constantes y permisos de botones
  globalConstants     : GlobalsConstantsForm = new GlobalsConstantsForm();
  buttonAcces         : ButtonAcces = new ButtonAcces();

  // Estado visual de la página (loaders, modales)
  isDisplay           : boolean = false;
  isVisualizarAlmacen : boolean = false;

  // Datos de almacenes y artículos
  almacenList         : SelectItem[];
  list                : IArticuloReporte[] = [];
  listOriginal        : IArticuloReporte[] = [];
  columnas            : any[];

  // Texto para filtrar resultados en tabla
  filtroTexto         : string = '';

  // Paginación de la tabla
  rows                = 20;
  rowsPerPageOptions  = [20, 40, 60, 80, 100];

  // Formato de fecha y nombre de archivo para exportar
  fecha               : string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo       : string = `Artículos - Stock - ${this.fecha}`;

  // Datos del modal de detalle por almacén
  whsCode             : string = '';
  itemCode            : string = '';


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private warehousesService: WarehousesService,
    private itemsService: ItemsService,
    private readonly utilService: UtilService
  ) {}

  // Libera suscripciones activas
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Inicializa el componente
  ngOnInit() {
    this.initializeComponent();
  }

  // Arranca configuraciones base del componente
  private initializeComponent(): void {
    this.buildForms();
    this.onBuildColumn();
     // Cargar lista de almacenes
    this.loadWarehouse();

    // Iniciamos el acceso a las opciones disponibles para el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-inv-panel-stock-general-by-almacen');
  }

  // Construye el formulario reactivo
  private buildForms(): void {
    this.modeloForm = this.fb.group({
      excluirInactivo         : [{ value: true, disabled: false }],
      excluirSinStock         : [{ value: true, disabled: false }],
      warehouse               : [{ value: '', disabled: false }, Validators.required]
    });
  }

  // Define las columnas mostradas en la tabla principal
  private onBuildColumn(): void {
    this.columnas = [
      { field: 'itemCode',          header: 'Código' },
      { field: 'itemName',          header: 'Descripción' },
      { field: 'invntryUom',        header: 'UM' },
      { field: 'onHand',            header: 'Stock' },
      { field: 'isCommited',        header: 'Comprometido' },
      { field: 'onOrder',           header: 'Solicitado' },
      { field: 'available',         header: 'Disponible' },
      { field: 'pesoKg',            header: 'Peso Kg' },
      { field: 'pesoPromedioKg',    header: 'Peso Promedio Kg' },
      { field: 'fecProduccion',     header: 'Fecha de Producción' },
    ];
  }

  // Carga la lista de almacenes activos y precarga los de producción
  loadWarehouse(): void {
    this.isDisplay = true;

    const param: any = { inactive: 'N' }; // inactivos

    // Cargar activos primero y luego llamar a producción para poder calcular la selección por defecto
    this.warehousesService
      .getListByInactive(param)
      .pipe(
        switchMap((activos: IWarehouses[]) =>
          this.warehousesService.getListProduccion().pipe(
            map((produccion: IWarehouses[]) => ({ activos, produccion }))
          )
        ),
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDisplay = false;
        })
      )
      .subscribe({
        next: result => {
          const activos: IWarehouses[] = result.activos ?? [];
          const produccion: IWarehouses[] = result.produccion ?? [];

          // Opciones del MultiSelect
          this.almacenList = activos.map(a => ({
            label: a.fullDescr,
            value: a.whsCode
          }));

          // Preselección
          const activosCodes = new Set(activos.map(a => a.whsCode));
          const defaultSelectedCodes = produccion
            .map(p => p.whsCode)
            .filter(c => activosCodes.has(c));

          this.modeloForm.get('warehouse')?.setValue(defaultSelectedCodes);

          // Carga inicial de datos SIN volver a mostrar loader
          if (defaultSelectedCodes.length > 0) {
            this.loadData();
          }
        },
        error: e => {
          this.utilService.handleErrorSingle(e, 'loadWarehouse', this.swaCustomService);
        }
      });
  }

  // Arma los parámetros del servicio según el formulario
  private buildParams(): any {
    const selectedCodes: string[] = this.modeloForm.get('warehouse')?.value ?? [];

    return {
      whsCode         : selectedCodes.length ? selectedCodes.join(',') : '',
      excluirInactivo : this.modeloForm.get('excluirInactivo')?.value,
      excluirSinStock : this.modeloForm.get('excluirSinStock')?.value
    };
  }

  // Dispara búsqueda manual desde la vista
  onClickSearch() {
    this.loadData();
  }

  // Obtiene el listado principal de stock
  loadData() {
    this.isDisplay = true;

    this.filtroTexto = '';
    this.list = [];
    this.listOriginal = [];

    const params = this.buildParams();

    this.itemsService.getListStockGeneralSummary(params)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: data => {
        this.listOriginal = data;
        this.list = data;
      },
      error: e => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  // Aplica filtro de texto en memoria sobre código o descripción
  onFiltroTexto(valor: string): void {
    // Si no hay texto, restaurar lista completa
    if (!valor || !valor.trim()) {
      this.list = [...this.listOriginal];
      return;
    }

    // Reemplaza espacios por .* (similar a %texto%texto%)
    const regexTexto = valor.trim().replace(/\s+/g, '.*');
    const regex = new RegExp(regexTexto, 'i');

    this.list = this.listOriginal.filter(n =>
      regex.test(n.itemName) ||
      regex.test(n.itemCode)
    );
  }

  // Exporta el resultado a Excel
  onToExcel(): void {
    this.isDisplay = true;

    const params = this.buildParams();

    this.itemsService
      .getStockGeneralSummaryExcel(params)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.isDisplay = false;
        })
      )
      .subscribe({
        next: (response) => {
          saveAs(
            new Blob([response], {
              type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            }),
            `${this.nombreArchivo}-${this.fecha}.xlsx`
          );

          this.swaCustomService.swaMsgExito(null);
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'getStockGeneralByAlmacenExcel', this.swaCustomService);
        }
      });
  }

  // Muestra modal de detalle por almacén
  onToRowSelectView(modelo: IArticuloReporte) {
    const selectedCodes: string[] = this.modeloForm.controls['warehouse'].value || [];
    this.whsCode = (selectedCodes && selectedCodes.length > 0) ? selectedCodes.join(',') : '';
    this.itemCode = modelo.itemCode;
    this.isVisualizarAlmacen = true;
  }

  // Cierra modal de detalle
  onClickAlmacenClose()
  {
    this.isVisualizarAlmacen = false;
  }

  // Regresa a la pantalla de bienvenida
  onToSalir()
  {
    this.router.navigate(['/main/bienvenido/bienvenido']);
  }
}
