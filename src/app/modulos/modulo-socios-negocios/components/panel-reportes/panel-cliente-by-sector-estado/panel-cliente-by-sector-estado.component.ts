// Angular core & common
import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

// Third-party libraries
import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';

// RxJS (se mantienen todos los importados originales)
import { finalize, Subject, Subscription, takeUntil } from 'rxjs';

// Models & constants
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

// Interfaces
import { IBusinessPartners, IBusinessPartnersQuery } from '../../../interfaces/business-partners.interface';


// Services
import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { BusinessPartnersService } from '../../../services/business-partners.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { SectorSapService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/socio-negocios/sector-socio-negocio.service';
import { ISectorSocioNegocioSap } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/socio-negocios/sector-socio-negocio-sap.interface';


@Component({
  selector: 'app-soc-panel-cliente-by-sector-estado',
  templateUrl: './panel-cliente-by-sector-estado.component.html',
  styleUrls: ['./panel-cliente-by-sector-estado.component.css']
})
export class PanelClienteBySectorEstadoComponent implements OnInit, OnDestroy {
  // Control de ciclo de vida para desuscribir observables
  private readonly destroy$ = new Subject<void>();

  // Formulario principal del reporte
  modeloForm          : FormGroup;
  // Suscripción general (si se utiliza en el futuro)
  subscription        : Subscription;

  // Títulos a mostrar en la UI
  titulo              = 'Clientes';
  subtitulo           = 'Clientes';

  // Catálogo global de constantes y permisos de botones
  globalConstants     : GlobalsConstantsForm = new GlobalsConstantsForm();
  buttonAcces         : ButtonAcces = new ButtonAcces();

  // Estado visual de la página (loaders, modales)
  isDisplay           : boolean = false;

  // Datos para la tabla y selects
  columnas            : any[];
  sectorList          : SelectItem[];
  statusList          : SelectItem[];

  // Datos mostrados
  list                : IBusinessPartnersQuery[];
  listOriginal        : IBusinessPartnersQuery[];

  // Texto para filtrar resultados en tabla
  filtroTexto         : string = '';

  // Paginación de la tabla
  rows                = 20;
  rowsPerPageOptions  = [20, 40, 60, 80, 100];

  // Formato de fecha y nombre de archivo para exportar
  fecha               : string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo       : string = `Clientes - ${this.fecha}`;

  constructor
  (
    private readonly fb: FormBuilder,
    private readonly datePipe: DatePipe,
    public  readonly utilService: UtilService,
    private sectorSapService: SectorSapService,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private businessPartnersService: BusinessPartnersService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
  ) {}

  /**
   * Hook de Angular: se ejecuta al destruir el componente.
   * Emite el Subject `destroy$` para completar observables enlazados.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Hook de Angular: inicializa el componente.
   */
  ngOnInit() {
    this.initializeComponent();
  }

  /**
   * Inicializa formularios, columnas, carga combos y permisos de botones.
   */
  private initializeComponent(): void {
    this.buildForms();
    this.onBuildColumn();
    // Cargar combos (loadData se ejecutará después de que se carguen ambos)
    this.loadCombos();

    // Iniciamos el acceso a las opciones disponibles para el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-soc-panel-cliente-by-sector-estado');
  }

  /**
   * Construye el formulario reactivo y asigna validaciones.
   */
  private buildForms(): void {
    this.modeloForm = this.fb.group({
      sector            : ['', Validators.required],
      status            : ['', Validators.required],
    });
  }

  /**
   * Define la estructura de columnas para la tabla de resultados.
   */
  private onBuildColumn(): void {
    this.columnas = [
      { field: 'cardCode',          header: 'Código' },
      { field: 'licTradNum',        header: 'Documento' },
      { field: 'docType',           header: ' Tipo de Documento' },
      { field: 'cardName',          header: 'Nombre' },
      { field: 'unidadNegocio',     header: 'Unidad de Negocio' },
      { field: 'creditLine',        header: 'Línea de Crédito' },
      { field: 'nomStatus',         header: 'Estado' },
      { field: 'slpName',           header: 'Vendedor' },
      { field: 'nomSector',         header: 'Sector' },
      { field: 'createDate',        header: 'Fecha de Alta' },
      { field: 'fechaUltimaVenta',  header: 'Fecha Última Venta' },
    ];
  }

  private loadCombos(): void {
    this.sectorSapService.getList()
      .subscribe({
        next: (data: ISectorSocioNegocioSap[]) => {
          this.sectorList = data.map(item => ({ label: item.name, value: item.code }));

          const defaultSelectedCodes = data.map(item => item.code);
          this.modeloForm.get('sector')?.setValue(defaultSelectedCodes);

          // Cargar status después de los sectores
          const statuses = this.localDataService.statusBusinessPartners;
          this.statusList = statuses.map(s => ({ label: s.name, value: s }));
          this.modeloForm.get('status')?.setValue(statuses);

          // Después de cargar ambos combos, ejecutar loadData()
          this.loadData();
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'loadCombos', this.swaCustomService);
        }
    });
  }

  private buildParams(): any {
    const selectedCodesSector: string[] = this.modeloForm.get('sector')?.value ?? [];
    const selectedCodesStatus: any[]    = this.modeloForm.get('status')?.value ?? [];

    return {
      sector  : selectedCodesSector.length ? selectedCodesSector.join(',') : '',
      status  : selectedCodesStatus.map(x => x.code).join(','),
    };
  }

  onClickSearch() {
    this.loadData();
  }

  /**
   * Solicita al servicio la lista de clientes filtrada por sector y estado.
   * Gestiona estado de carga y maneja la respuesta (datos o error).
   */
  loadData() {
    this.isDisplay = true;

    this.filtroTexto = '';
    this.list = [];
    this.listOriginal = [];

    const params = this.buildParams();

    this.businessPartnersService
    .getListClienteBySectorStatus(params)
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
    /**
     * Filtra en memoria la lista de clientes usando el texto ingresado.
     * Busca coincidencias en `cardCode` o `cardName` de forma insensible a mayúsculas.
     * @param valor Texto a utilizar como filtro (puede contener espacios).
     */
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
        regex.test(n.cardCode) ||
        regex.test(n.cardName)
      );
    }

  /**
   * Genera y descarga un Excel con los clientes según filtros actuales.
   * Actualiza indicador de carga y muestra notificaciones de éxito/error.
   */
  onToExcel() {
    this.isDisplay = true;

    const params = this.buildParams();

    this.businessPartnersService
    .getClienteBySectorStatusExcel(params)
    .subscribe({next:(response: any) => {
        saveAs(
          new Blob([response],
          {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          this.nombreArchivo + this.fecha
        );
        this.isDisplay = false;
        this.swaCustomService.swaMsgExito(null);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

}
