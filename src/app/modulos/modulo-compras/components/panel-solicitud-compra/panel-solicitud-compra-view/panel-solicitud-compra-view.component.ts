import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { forkJoin, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { TableColumn } from 'src/app/interface/common-ui.interface';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ISolicitudCompra, ISolicitudCompra1 } from '../../../interfaces/sap/solicitud-compra.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { SolicitudCompraService } from '../../../services/sap/solicitud-compra.service';
import { UsersService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/users.service';
import { EmployeesInfoService } from 'src/app/modulos/modulo-recursos-humanos/services/employees-info.service';
import { BranchesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/branchs.service';
import { DepartmentsService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/departments.service';


@Component({
  selector: 'app-com-panel-solicitud-compra-view',
  templateUrl: './panel-solicitud-compra-view.component.html',
  styleUrls: ['./panel-solicitud-compra-view.component.css']
})
export class PanelSolicitudCompraViewComponent implements OnInit, OnDestroy, AfterViewInit {
  // Lifecycle management
  /** Gestión de ciclo de vida y ajustes visuales auxiliares */
  private readonly destroy$                    = new Subject<void>();
  isLoadingInitialData                         = false;
  paddingTop                                   = '20px';
  @ViewChild('notifyLabel') notifyLabel!       : ElementRef<HTMLElement>;
  private resizeObserver!                      : ResizeObserver;

  // Forms
  /** Formularios reactivos de la vista */
  modeloFormReq                                : FormGroup;
  modeloFormDoc                                : FormGroup;
  modeloFormCon                                : FormGroup;
  modeloFormPie                                : FormGroup;

  // Configuration
  /** Configuración general y constantes */
  readonly titulo                              = 'Solicitud de Compra';
  globalConstants                              : GlobalsConstantsForm = new GlobalsConstantsForm();

  // Combos
  /** Listas de soporte para dropdowns */
  reqTypesList                                 : SelectItem[] = [];
  docTypesList                                 : SelectItem[] = [];
  branchesList                                 : SelectItem[] = [];
  departmentsList                              : SelectItem[] = [];
  docStatusList                                : SelectItem[] = [];
  requesterList                                : SelectItem[] = [];
  employeesInfoList                            : SelectItem[] = [];

  // UI State
  /** Estado de overlays y modales */
  isDisplay                                    = false;

  // Table configuration
  /** Definición de columnas de la tabla */
  columnas                                     : TableColumn[] = [];

  // Data
  /** Modelos de cabecera y detalle */
  modelo                                       : ISolicitudCompra;
  modeloLines                                  : ISolicitudCompra1[] = [];
  docTypeSelected                              : any;

  // Filters / Additional properties
  /** Identificadores y auxiliares */
  id                                           = 0;
  docEntry                                     = 0;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    public  readonly app: LayoutComponent,
    private readonly route: ActivatedRoute,
    private readonly usersService: UsersService,
    private readonly branchesService: BranchesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly departmentsService: DepartmentsService,
    private readonly employeesInfoService: EmployeesInfoService,
    private readonly solicitudCompraService: SolicitudCompraService,
    public  readonly utilService: UtilService,
  ) {}

  // ===========================
  // Lifecycle Hooks
  // ===========================

  /**
   * Inicializa formularios y carga datos iniciales para combos.
   */
  ngOnInit(): void {
    this.initializeComponent();
  }

  /**
   * Limpia suscripciones/observadores para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Después de iniciar la vista: mide el quiebre del label y se suscribe a cambios de tamaño.
   */
  ngAfterViewInit(): void {
    // Primer cálculo
    this.recalculate();

    // Observa cambios reales del elemento
    this.resizeObserver = new ResizeObserver(() => {
      this.recalculate();
    });

    this.resizeObserver.observe(this.notifyLabel.nativeElement);
  }

  /** Detecta redimensionamiento de ventana y vuelve a medir */
  @HostListener('window:resize')
  onWindowResize(): void {
    this.recalculate();
  }

  /**
   * Mide si el label se quiebra en múltiples líneas y
   * actualiza el padding del checkbox en consecuencia.
   */
  private recalculate(): void {
    // Espera a que el DOM se re-renderice
    setTimeout(() => {
      const label = this.notifyLabel.nativeElement;

      const lineHeight = parseFloat(
        getComputedStyle(label).lineHeight
      );

      const isWrapped = label.scrollHeight > lineHeight;

      this.paddingTop = isWrapped ? '1px' : '20px';
    });
  }


  // ===========================
  // Initialization
  // ===========================

  private initializeComponent(): void {
    // Construye formularios reactivos y columnas/menús de UI
    this.buildForms();
    this.onBuildColumn();


    // Cargar todos los combos en paralelo y aplicar valores por defecto sin emitir eventos
    this.loadAllCombos();
  }

  private buildForms(): void {
    // Define y compone grupos de formulario con validadores
    this.modeloFormReq = this.fb.group({
      reqType                 : [{ value: '', disabled: true }, Validators.required],
      reqName                 : [{ value: '', disabled: true }, Validators.required],
      branch                  : [{ value: '', disabled: true }],
      department              : [{ value: '', disabled: true }],
      notify                  : [{ value: false, disabled: true }],
      email                   : [{ value: '', disabled: true }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: true }],
      docStatus               : [{ value: 'Abierto', disabled: true }, Validators.required],
      docDate                 : [{ value: '', disabled: true }, Validators.required],
      docDueDate              : [{ value: '', disabled: true }, Validators.required],
      taxDate                 : [{ value: '', disabled: true }, Validators.required],
      reqDate                 : [{ value: '', disabled: true }, Validators.required]
    });

    this.modeloFormCon = this.fb.group({
      docType                 : [{ value: '', disabled: true }, Validators.required]
    });

    this.modeloFormPie = this.fb.group({
      employeeInfo            : [{ value: '', disabled: true }, Validators.required],
      comments                : [{ value: '', disabled: true }]
    });
  }

  private onBuildColumn(): void {
    // Usar docTypeSelected si está disponible, sino leer del formulario
    const docTyp = this.modeloFormCon.get('docType')?.value?.value;

    if( docTyp === 'I'){
      this.columnas = [
        { field: 'itemCode',          header: 'Código' },
        { field: 'dscription',        header: 'Descripción' },
        { field: 'lineVendor',        header: 'Proveedor' },
        { field: 'pqtReqDate',        header: 'Fecha necesaria' },
        { field: 'formatCode',        header: 'Cuenta mayor' },
        { field: 'acctName',          header: 'Nombre de la cuenta de mayor' },
        { field: 'ocrCode',           header: 'Centro de costos' },
        { field: 'whsCode',           header: 'Almacén' },
        { field: 'u_tipoOpT12Nam',    header: 'Tipo de operación' },
        { field: 'u_FF_TIP_COM_NAM',  header: 'Tipo de compra' },
        { field: 'unitMsr',           header: 'UM' },
        { field: 'quantity',          header: 'Cantidad' },
      ];
    }
    else{
      this.columnas = [
        { field: 'dscription',        header: 'Descripción' },
        { field: 'lineVendor',        header: 'Proveedor' },
        { field: 'pqtReqDate',        header: 'Fecha necesaria' },
        { field: 'formatCode',        header: 'Cuenta mayor' },
        { field: 'acctName',          header: 'Nombre de la cuenta de mayor' },
        { field: 'ocrCode',           header: 'Centro de costos' },
        { field: 'u_tipoOpT12Nam',    header: 'Tipo de operación' },
        { field: 'u_FF_TIP_COM_NAM',  header: 'Tipo de compra' },
      ];
    }
  }
  // ===========================
  // Table Events
  // ===========================

  /**
   * Carga en paralelo las listas de soporte (numeración, almacenes, tipos y empleados)
   * y establece los valores por defecto en los formularios usando { emitEvent: false } para
   * evitar triggers no deseados en valueChanges.
   */
  private loadAllCombos(): void {

    // Cargar datos síncronos (LocalDataService)
    const reqTypes = this.localDataService.getListReqTypes();
    this.reqTypesList = reqTypes.map(s => ({ label: s.name, value: s.code }));

    const docTypes = this.localDataService.getListDocTypes();
    this.docTypesList = docTypes.map(s => ({ label: s.name, value: s.code }));

    forkJoin({
      requesterList     : this.usersService.getList(),
      branchesList      : this.branchesService.getList(),
      departmentsList   : this.departmentsService.getList(),
      employeesInfoList : this.employeesInfoService.getList()
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result: any) => {
        // Mapear requester list
        this.requesterList = result.requesterList.map(item => ({
          label: item.u_NAME,
          value: item.useR_CODE
        }));

        // Mapear branches list
        this.branchesList = result.branchesList.map(item => ({
          label: item.name,
          value: item.code
        }));


        // Mapear departments list
        this.departmentsList = result.departmentsList.map(item => ({
          label: item.name,
          value: item.code
        }));


        // Mapear employees info list
        this.employeesInfoList =  result.employeesInfoList.map(item => ({
          label: item.fullName,
          value: item.empID
        }));

        // 3. AHORA SÍ cargar datos - los combos están listos
        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', () => {}, this.swaCustomService);
      }
    });
  }

  private loadData(): void {
    this.route.params
    .pipe(
      tap(params => this.id = +params['id']),
      switchMap(params => {
        this.isDisplay = true;
        return this.solicitudCompraService.getByDocEntry(+params['id']);
      }),
      takeUntil(this.destroy$)
    )
    .subscribe({
      next: (data: ISolicitudCompra) => {
        this.isDisplay = false;

        const normalizedLines = data.lines.map(line => ({
          ...line,
          pqtReqDate: this.normalizeDateToDate(line.pqtReqDate)
        }));

        this.modelo = {
          ...data,
          lines: normalizedLines
        };

        this.setFormValues(this.modelo);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', () => { this.isDisplay = false; }, this.swaCustomService);
      }
    });
  }

  private setFormValues(value: ISolicitudCompra): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el modeloLines durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================

    // Asignar propiedades del componente
    this.docEntry                 = value.docEntry;


    // Buscar y asignar valores como SelectItem para los dropdowns de Almacenes
    if(value.reqType === 17){
      this.requesterList = this.employeesInfoList.map(item => ({
        label: item.label,
        value: item.value
      }));
    }

    const reqType                 = this.reqTypesList.find(item => item.value === value.reqType);
    const reqName                 = this.requesterList.find(item => item.value === value.requester);
    const branch                  = this.branchesList.find(item => item.value === value.branch);
    const department              = this.departmentsList.find(item => item.value === value.department);

    // Actualizar formulario de Requerimiento
    this.modeloFormReq.patchValue(
      {
        reqType                   : reqType || null,
        reqName                   : reqName || null,
        branch                    : branch || null,
        department                : department || null,
        notify                    : value.notify === 'Y' ? true : false,
        email                     : value.email || ''
      },
      { emitEvent: false }
    );

    // Actualizar formulario de Documento
    this.modeloFormDoc.patchValue(
      {
        docNum                    : value.docNum,
        docStatus                 : value.docStatus === 'O' ? 'Abierto' : 'Cerrado',
        docDate                   : value.docDate ? new Date(value.docDate) : null,
        docDueDate                : value.docDueDate ? new Date(value.docDueDate) : null,
        taxDate                   : value.taxDate ? new Date(value.taxDate) : null,
        reqDate                   : value.reqDate ? new Date(value.reqDate) : null,
      },
      { emitEvent: false }
    );

    const docType                 = this.docTypesList.find(item => item.value === value.docType);

    // Actualizar formulario de Contenido
      this.docTypeSelected   = docType;
    this.modeloFormCon.patchValue(
      {
        docType                  : docType || null,
      },
      { emitEvent: false }
    );

    // Buscar y asignar valor como SelectItem para empleado
    const employee                = this.employeesInfoList.find(item => item.value === value.ownerCode);

    // Actualizar formulario Pie
    this.modeloFormPie.patchValue(
      {
        employeeInfo              : employee || null,
        comments                  : value.comments
      },
      { emitEvent: false }
    );

    // =========================================================================
    // SEGUNDO BLOQUE: Cargar modeloLines después de que los formularios estén actualizados
    // =========================================================================
    // Esto garantiza que los eventos onChange no sobrescriban los valores originales del modeloLines
    this.onBuildColumn();
    this.modeloLines = value.lines || [];
    this.isLoadingInitialData = false;
  }

  private normalizeDateToDate(value: any): Date {
    const date = value instanceof Date ? value : new Date(value);

    if (isNaN(date.getTime())) {
      // valor por defecto obligatorio (elige uno válido)
      return new Date();
    }

    return date;
  }

  /** Navega de vuelta a la lista de solicitudes de compra */
  onClickBack(): void {
    this.router.navigate(['/main/modulo-com/panel-solicitud-compra-list']);
  }
}
