import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { finalize, forkJoin, Subject, switchMap, takeUntil, } from 'rxjs';
import { Component, OnDestroy, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener } from '@angular/core';

import { LayoutComponent } from '@app/layout/layout.component';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { TableColumn } from '@app/interface/common-ui.interface';
import { IPurchaseRequest, IPurchaseRequest1 } from '../../../interfaces/sap-business-one/purchase-request.interface';

import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { LocalDataService } from '@app/services/local-data.service';
import { PurchaseRequestService } from '../../../services/sap-business-one/purchase-request.service';
import { EmployeesInfoService } from '@app/modulos/modulo-recursos-humanos/services/employees-info.service';
import { UsersService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/users.service';
import { BranchesService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/branchs.service';
import { DepartmentsService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/departments.service';


@Component({
  selector: 'app-com-panel-solicitud-compra-view',
  templateUrl: './panel-solicitud-compra-view.component.html',
  styleUrls: ['./panel-solicitud-compra-view.component.css']
})
export class PanelSolicitudCompraViewComponent implements OnInit, OnDestroy, AfterViewInit {
  // ===========================
  // 🔹 1. LIFECYCLE / CORE
  // ===========================
  private readonly destroy$                    = new Subject<void>();
  private resizeObserver!                      : ResizeObserver;

  @ViewChild('notifyLabel') notifyLabel!       : ElementRef<HTMLElement>;
  paddingTop                                   = '20px';


  // ===========================
  // 🔹 2. CONFIG / CONSTANTS
  // ===========================
  readonly titulo                              = 'Solicitud de Compra';
  globalConstants                              : GlobalsConstantsForm = new GlobalsConstantsForm();


  // ===========================
  // 🔹 3. FORMS
  // ===========================
  modeloFormReq                                : FormGroup;
  modeloFormDoc                                : FormGroup;
  modeloFormCon                                : FormGroup;
  modeloFormPie                                : FormGroup;


  // ===========================
  // 🔹 4. UI STATE
  // ===========================
  isDisplay                                    = false;
  isLoadingInitialData                         = false;


  // ===========================
  // 🔹 5. TABLE CONFIG
  // ===========================
  columnas                                     : TableColumn[] = [];


  // ===========================
  // 🔹 6. DATA (CORE)
  // ===========================
  modeloLines                                  : IPurchaseRequest1[] = [];


  // ===========================
  // 🔹 7. COMBOS / LISTS
  // ===========================
  reqTypesList                                 : SelectItem[] = [];
  docTypesList                                 : SelectItem[] = [];
  branchesList                                 : SelectItem[] = [];
  departmentsList                              : SelectItem[] = [];
  docStatusList                                : SelectItem[] = [];
  requesterList                                : SelectItem[] = [];
  employeesInfoList                            : SelectItem[] = [];


  // ===========================
  // 🔹 8. DOC TYPE CONTROL
  // ===========================
  docTypeSelected                              : any;


  // ===========================
  // 🔹 9. INDEXES (UI CONTROL)
  // ===========================
  id                                           = 0;


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
    private readonly purchaseRequestService: PurchaseRequestService,
    public  readonly utilService: UtilService,
  ) {}



  //#region <<< 1. LIFECYCLE >>>

  /**
   * Inicializa formularios y carga datos iniciales para combos.
   */
  ngOnInit(): void {
    this.initializeComponent();
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

  /**
   * Limpia suscripciones/observadores para evitar fugas de memoria.
   */
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /** Detecta redimensionamiento de ventana y vuelve a medir */
  @HostListener('window:resize')
  onWindowResize(): void {
    this.recalculate();
  }

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

  //#endregion



  //#region <<< 2. INITIALIZATION >>>

  private initializeComponent(): void {
    // 1️⃣ Crear formularios
    this.buildForms();

    // 2️⃣ Cargar datos base
    this.loadAllCombos();

    // 3️⃣ Inicializar UI
    this.onBuildColumn();
  }

  private buildForms(): void {
    // Define y compone grupos de formulario con validadores
    this.modeloFormReq = this.fb.group({
      reqType                 : [{ value: '', disabled: false }, Validators.required],
      reqName                 : [{ value: '', disabled: false }, Validators.required],
      branch                  : [{ value: '', disabled: false }],
      department              : [{ value: '', disabled: false }],
      notify                  : [{ value: false, disabled: false }],
      email                   : [{ value: '', disabled: false }]
    });

    this.modeloFormDoc = this.fb.group({
      docNum                  : [{ value: '', disabled: false }],
      docStatus               : [{ value: 'Abierto', disabled: false }, Validators.required],
      docDate                 : [{ value: '', disabled: false }, Validators.required],
      docDueDate              : [{ value: '', disabled: false }, Validators.required],
      taxDate                 : [{ value: '', disabled: false }, Validators.required],
      reqDate                 : [{ value: '', disabled: false }, Validators.required]
    });

    this.modeloFormCon = this.fb.group({
      docType                 : [{ value: '', disabled: false }, Validators.required]
    });

    this.modeloFormPie = this.fb.group({
      employeeInfo            : [{ value: '', disabled: false }, Validators.required],
      comments                : [{ value: '', disabled: false }]
    });
  }

  private loadAllCombos(): void {

    // Cargar datos síncronos (LocalDataService)
    const reqTypes = this.localDataService.reqTypes;
    this.reqTypesList = reqTypes.map(s => ({ label: s.name, value: s.code }));

    const docTypes = this.localDataService.docTypes;
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
          label: item.userName,
          value: item.userCode
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
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
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
        { field: 'onHand',            header: 'Stock' },
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

  //#endregion



  //#region <<< 3. GETTERS >>>

  private get docType(): string {
    return this.modeloFormCon.get('docType')?.value?.value;
  }

  get isItem(): boolean {
    return this.docType === 'I';
  }

  get isService(): boolean {
    return this.docType === 'S';
  }

  //#endregion



  //#region <<< 4. NAVIGATION >>>

  onClickBack(): void {
    this.router.navigate(['/main/modulo-com/panel-solicitud-compra-list']);
  }

  //#endregion



  //#region <<< 19. DATA LOADING >>>

  private loadData(): void {
    this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.id = +params['id'];

        // 🔥 aquí sí se activa de forma confiable
        this.isDisplay = true;

        return this.purchaseRequestService
          .getByDocEntry(this.id)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IPurchaseRequest) => {
        const normalizedLines = data.lines.map(line => ({
          ...line,
          pqtReqDate: this.utilService.normalizeDateOrToday(line.pqtReqDate)
        }));

        const modelo = {
          ...data,
          lines: normalizedLines
        };

        this.setFormValues(modelo);
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private setFormValues(value: IPurchaseRequest): void {
    // Activar flag de carga inicial para evitar que onChange events
    // modifiquen el modeloLines durante la carga
    this.isLoadingInitialData = true;

    // =========================================================================
    // PRIMER BLOQUE: Cargar formularios y propiedades del componente
    // =========================================================================


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

  //#endregion
}
