import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { takeUntil, finalize } from 'rxjs/operators';
import { Subject, forkJoin, catchError, of } from 'rxjs';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';
import { DraftsDocumentReportFilterModel } from '@app/modulos/modulo-documentos-borrador/models/drafts.model';

import { UtilService } from '@app/services/util.service';
import { LocalDataService } from '@app/services/local-data.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
import { UsersService } from '@app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/users.service';



@Component({
  selector: 'app-dra-panel-documento-preliminar-options',
  templateUrl: './panel-documento-preliminar-options.component.html',
  styleUrls: ['./panel-documento-preliminar-options.component.css']
})
export class PanelDocumentoPreliinarOptionsComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               = 'Informe documento preliminar';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     : boolean = false;
  isBuscarDisabled                              : boolean = true;

  userList                                      : SelectItem[];
  draftDateList                                 : SelectItem[];



  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly usersService: UsersService,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    public  readonly utilService: UtilService,
  ) {}

  // ===========================
  // Lifecycle Hooks
  // ==========================


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

    this.buttonAcces =
      this.accesoOpcionesService
        .getObtieneOpciones(
          'app-dra-panel-documento-preliminar-options'
        );

    this.loadAllCombos();

    this.modeloForm.valueChanges
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.isBuscarDisabled =
          !this.validarCheckboxes();
      });

    this.isBuscarDisabled =
      !this.validarCheckboxes();
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      user                              : ['', Validators.required],
      pending                           : [true],

      draftDate                         : ['', Validators.required],
      startDate                         : [this.utilService.currentDate(), Validators.required],
      endDate                           : [this.utilService.currentDate(), Validators.required],

      orders                            : [true, Validators.required],
    });
  }

  private loadAllCombos(): void {
    this.isDisplay = true;

    this.draftDateList =
      this.localDataService.draftDate.map(s => ({
        label: s.name,
        value: String(s.code)
      }));

    forkJoin({
      users: this.usersService.getList()
        .pipe(catchError(() => of([])))
    })
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (res) => {

        this.userList = (res.users || []).map(item => ({
          label: item.userName,
          value: item
        }));

        const session = sessionStorage.getItem(
          'filtrosInformeDocumentoPreliminar'
        );

        if (session) {
          this.cargarFiltrosSession();
        } else {

          this.modeloForm.patchValue({
            user: res.users,
            draftDate: '01'
          }, { emitEvent: false });

        }
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
  }

  private cargarFiltrosSession(): void {
    const data = sessionStorage.getItem(
      'filtrosInformeDocumentoPreliminar'
    );

    if (!data) return;

    const filtros = JSON.parse(data);

    let usuariosSeleccionados = [];

    if (filtros.user) {

      const userIds = filtros.user
      .split(',')
      .map((x: string) => Number(x));

      usuariosSeleccionados =
        this.userList
        .filter(x =>
          userIds.includes(
            Number(x.value.userId)
          )
        )
        .map(x => x.value);
    }

    this.modeloForm.patchValue({
      user: usuariosSeleccionados,
      pending: filtros.pending,

      draftDate: String(filtros.draftDate),

      startDate: filtros.startDate
        ? new Date(filtros.startDate)
        : null,

      endDate: filtros.endDate
        ? new Date(filtros.endDate)
        : null,

      orders: filtros.orders
    }, { emitEvent: false });
  }

  validarCheckboxes(): boolean {
    const form = this.modeloForm.value;

    const grupoInferiorKeys = [
      'orders'
    ];

    const grupoInferior = grupoInferiorKeys.some(k => form[k]);

    return grupoInferior;
  }

  get isDisabledBuscar(): boolean {
    return this.buttonAcces.btnBuscar || this.isBuscarDisabled;
  }

  private buildFilterParams(): DraftsDocumentReportFilterModel {
    /** helpers */
    const u = this.utilService;
    const d = (v: any) => u.normalizeDateOrToday(v);

    const {
      user,
      pending,

      draftDate,
      startDate,
      endDate,

      orders
    } = this.modeloForm.getRawValue();

    return {
      user:  this.utilService.mapJoin(user, 'userId'),
      pending,

      draftDate,
      startDate: startDate ? d(startDate) : null,
      endDate: endDate ? d(endDate) : null,

      orders
    };
  }

  // ===========================
  // UI Actions
  // ===========================

  onClickBuscar(): void {
    const filtrosInformeDocumentoPreliminar = this.buildFilterParams();

    console.log("PARAMS: ", filtrosInformeDocumentoPreliminar);

    sessionStorage.setItem('filtrosInformeDocumentoPreliminar', JSON.stringify(filtrosInformeDocumentoPreliminar));

    this.router.navigate(['/main/modulo-dra/panel-documento-preliminar'], { state: { filtrosInformeDocumentoPreliminar }});
  }
}
