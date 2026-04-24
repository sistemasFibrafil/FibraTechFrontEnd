import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from '@app/models/acceso-button.model';

import { UtilService } from '@app/services/util.service';
import { AccesoOpcionesService } from '@app/services/acceso-opciones.service';
import { ApprovalStatusReportFilterModel } from '@app/modulos/modulo-aprobaciones/models/sap-business-one/procedimiento-autorizacion/approval-requests.model';



@Component({
  selector: 'app-apr-panel-informe-status-autorizacion-options',
  templateUrl: './panel-informe-status-autorizacion-options.component.html',
  styleUrls: ['./panel-informe-status-autorizacion-options.component.css']
})
export class PanelInformeStatusAutorizacionOptionsComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               = 'Informe status de autorización';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isBuscarDisabled                              : boolean = true;



  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
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

    this.cargarFiltrosSession();

     // 🔐 Permisos
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones(
      'app-apr-panel-informe-status-autorizacion-options'
    );

    // 🔄 Escuchar cambios del form
    this.modeloForm.valueChanges.subscribe(() => {
      this.isBuscarDisabled = !this.validarCheckboxes();
    });

    // 🔥 Estado inicial
    this.isBuscarDisabled = !this.validarCheckboxes();
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      pending                           : [true],
      authorized                        : [false],
      rejected                          : [false],
      createdBy                         : [false],
      createdByResponsibleAuthorization : [false],
      canceled                          : [false],

      startAuthorOf                     : [null],
      endAuthorOf                       : [null],
      startAuthorizerOf                 : [null],
      endAuthorizerOf                   : [null],
      startDate                         : [null],
      endDate                           : [null],
      startCardCode                     : [''],
      endCardCode                       : [''],

      quotations                        : [false],
      orders                            : [true],
    });
  }

  private cargarFiltrosSession(): void {
    const data = sessionStorage.getItem('filtrosInformeStatusAutorizacion');

    if (!data) return;

    const filtros = JSON.parse(data);

    this.modeloForm.patchValue({
      pending                           : filtros.pending,
      authorized                        : filtros.authorized,
      rejected                          : filtros.rejected,
      createdBy                         : filtros.createdBy,
      createdByResponsibleAuthorization : filtros.createdByResponsibleAuthorization,
      canceled                          : filtros.canceled,

      startAuthorOf                     : filtros.startAuthorOf,
      endAuthorOf                       : filtros.endAuthorOf,
      startAuthorizerOf                 : filtros.startAuthorizerOf,
      endAuthorizerOf                   : filtros.endAuthorizerOf,
      startDate                         : filtros.startDate ? new Date(filtros.startDate) : null,
      endDate                           : filtros.endDate ? new Date(filtros.endDate) : null,
      startCardCode                     : filtros.startCardCode,
      endCardCode                       : filtros.endCardCode,

      quotations                        : filtros.quotations,
      orders                            : filtros.orders
    });
  }

  onClickSelectedStartCardCode(modelo) {
    this.modeloForm.patchValue({
      startCardCode   : modelo.cardCode
    });
  }

  onClickSelectedEndCardCode(modelo) {
    this.modeloForm.patchValue({
      endCardCode     : modelo.cardCode
    });
  }

  validarCheckboxes(): boolean {
    const form = this.modeloForm.value;

    const grupoSuperiorKeys = [
      'pending',
      'authorized',
      'rejected',
      'createdBy',
      'createdByResponsibleAuthorization',
      'canceled'
    ];

    const grupoInferiorKeys = [
      'quotations',
      'orders'
    ];

    const grupoSuperior = grupoSuperiorKeys.some(k => form[k]);
    const grupoInferior = grupoInferiorKeys.some(k => form[k]);

    return grupoSuperior && grupoInferior;
  }

  get isDisabledBuscar(): boolean {
    return this.buttonAcces.btnBuscar || this.isBuscarDisabled;
  }

  private buildFilterParams(): ApprovalStatusReportFilterModel {
    /** helpers para evitar repetición */
    const u       = this.utilService;
    const d       = (v:any)=>u.normalizeDateOrToday(v);
    // 🔥 helper para limpiar valores vacíos
    const toNull  = (value: any) => value ? value : null;


    const {
      pending,
      authorized,
      rejected,
      createdBy,
      createdByResponsibleAuthorization,
      canceled,

      startAuthorOf,
      endAuthorOf,
      startAuthorizerOf,
      endAuthorizerOf,
      startDate,
      endDate,
      startCardCode,
      endCardCode,

      quotations,
      orders
    } = this.modeloForm.getRawValue();

    return {
      pending,
      authorized,
      rejected,
      createdBy,
      createdByResponsibleAuthorization,
      canceled,

      startAuthorOf     : toNull(startAuthorOf),
      endAuthorOf       : toNull(endAuthorOf),
      startAuthorizerOf : toNull(startAuthorizerOf),
      endAuthorizerOf   : toNull(endAuthorizerOf),
      startDate         : startDate ? d(startDate) : null,
      endDate           : endDate ? d(endDate) : null,
      startCardCode,
      endCardCode,

      quotations,
      orders
    };
  }

  // ===========================
  // UI Actions
  // ===========================

  onClickBuscar(): void {
    const filtrosInformeStatusAutorizacion = this.buildFilterParams();

    sessionStorage.setItem('filtrosInformeStatusAutorizacion', JSON.stringify(filtrosInformeStatusAutorizacion));

    this.router.navigate(['/main/modulo-apr/panel-informe-status-autorizacion'], { state: { filtrosInformeStatusAutorizacion }});
  }
}
