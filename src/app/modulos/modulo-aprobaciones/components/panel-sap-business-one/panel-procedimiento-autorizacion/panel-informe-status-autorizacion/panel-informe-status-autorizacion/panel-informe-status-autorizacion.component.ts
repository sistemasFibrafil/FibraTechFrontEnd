import { Subject, Observable, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { ApprovalStatusReportFilterModel } from '@app/modulos/modulo-aprobaciones/models/sap-business-one/procedimiento-autorizacion/approval-requests.model';

import { TableColumn } from '@app/interface/common-ui.interface';
import { IDraftsStatusQuery } from '@app/modulos/modulo-documentos-borrador/interfaces/drafts.interface';
import { IApprovalStatusReportLines2Query, IApprovalStatusReportQuery } from '@app/modulos/modulo-aprobaciones/interfaces/sap-business-one/approval-requests.interface';

import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { DraftsService } from '@app/modulos/modulo-documentos-borrador/services/drafts.service';
import { ApprovalRequestsService } from '@app/modulos/modulo-aprobaciones/services/sap-business-one/approval-requests.service';



@Component({
  selector: 'app-apr-panel-informe-status-autorizacion',
  templateUrl: './panel-informe-status-autorizacion.component.html',
  styleUrls: ['./panel-informe-status-autorizacion.component.css']
})
export class PanelInformeStatusAutorizacionComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Configuration
  readonly titulo                               = 'Informe status de autorización';
  readonly subTitulo                            = 'Status de autorización';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     = false;

  // Table configuration
  columnas                                      : TableColumn[] = [];
  columnasAuthorizer                            : TableColumn[] = [];

  modelo                                        : IApprovalStatusReportQuery[] = [];
  modeloAuthorizer                              : IApprovalStatusReportLines2Query[] = [];

  // Paginación de la tabla
  rows                                          = 20;
  rowsPerPageOptions                            = [20, 40, 60, 80, 100];


  constructor(
    private readonly router: Router,
    private readonly draftsService: DraftsService,
    private readonly swaCustomService: SwaCustomService,
    private readonly approvalRequestsService: ApprovalRequestsService,
    public  readonly utilService: UtilService,
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private initializeComponent(): void {
    this.onBuildColumn();

    this.loadData();
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'objType',         header: 'Clase de documento' },
      { field: 'docNum',          header: 'N° de documento' },
      { field: 'docNum',          header: 'N° de documento preliminar' },
      { field: 'authorName',      header: 'Autor' },
      { field: 'modelName',       header: 'Modelo' },
      { field: 'approverStatus',  header: 'Estado' },
      { field: 'remarks',         header: 'Comentarios' },
      { field: 'createDate',      header: 'Fecha de producción' },
      { field: 'createTimeString',header: 'Tiempo de fabricación' },
      { field: 'docDate',         header: 'Fecha de contabilización' },
      { field: 'cardCode',        header: 'Código SN' },
      { field: 'cardName',        header: 'Nombre SN' },
    ];

    this.columnasAuthorizer = [
      { field: 'stapaName',       header: 'Etapa' },
      { field: 'authorizerName',  header: 'Autorizado por' },
      { field: 'status',          header: 'Respuesta' },
      { field: 'updateDate',      header: 'Fecha' },
      { field: 'updateTimeString',header: 'Hora' },
      { field: 'remarks',         header: 'Comentarios' },
    ];
  }

  loadData(): void {
    const params = this.buildFilterParams();

    if (!params) {
      console.warn('No hay filtros');
      return;
    }

    this.isDisplay = true;

    this.approvalRequestsService
    .getListApprovalStatusReport(params)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IApprovalStatusReportQuery[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(): any | null {
    const STORAGE_KEY = 'filtrosInformeStatusAutorizacion';

    let filtros: ApprovalStatusReportFilterModel | null = null;

    // 🔥 Obtener filtros
    const data = sessionStorage.getItem(STORAGE_KEY);
    filtros = data
      ? JSON.parse(data)
      : history.state?.filtrosInformeStatusAutorizacion ?? null;

    if (!filtros) return null;

    // 💾 Guardar si viene de history
    if (!data) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtros));
    }

    // 🔥 Normalizar fechas
    const normalizeDateOrToday = (d: any) => (d ? new Date(d) : null);

    filtros.startDate = normalizeDateOrToday(filtros.startDate);
    filtros.endDate   = normalizeDateOrToday(filtros.endDate);

    // 🔥 Helper para construir strings tipo "W,Y,N"
    const buildString = (conditions: [boolean, string][]) =>
      conditions
        .filter(([cond]) => cond)
        .map(([, val]) => val)
        .join(',');

    const statusDraf = buildString([
      [filtros.pending, 'W'],
      [filtros.authorized, 'Y'],
      [filtros.rejected, 'N'],
      [filtros.canceled, 'C']
    ]);

    const statusOrder = buildString([
      [filtros.createdBy, 'P'],
      [filtros.createdByResponsibleAuthorization, 'A']
    ]);

    const objType = buildString([
      [filtros.quotations, '23'],
      [filtros.orders, '17']
    ]);

    return {
      statusDraf,
      statusOrder,
      objType,

      startAuthorOf: filtros.startAuthorOf,
      endAuthorOf: filtros.endAuthorOf,
      startAuthorizerOf: filtros.startAuthorizerOf,
      endAuthorizerOf: filtros.endAuthorizerOf,
      startDate: filtros.startDate,
      endDate: filtros.endDate,
      startCardCode: filtros.startCardCode,
      endCardCode: filtros.endCardCode
    };
  }

  getEstado(status: string) {
    const estados = {
      P: { text: 'Creado', class: 'estado-creado' },
      W: { text: 'Pendiente', class: 'estado-pendiente' },
      N: { text: 'Rechazado', class: 'estado-rechazado' },
      Y: { text: 'Autorizado', class: 'estado-autorizado' },
      A: { text: 'Creado por resp. autorización', class: 'estado-autorizacion' }
    };

    return estados[status] ?? { text: '', class: '' };
  }

  getEstadoLine(status: string) {
    const estados = {
      W: { text: 'Pendiente', class: 'estado-pendiente' },
      N: { text: 'No aprobados', class: 'estado-rechazado' },
      Y: { text: 'Autorizado', class: 'estado-autorizado' },
    };

    return estados[status] ?? { text: '', class: '' };
  }

  onRowGroupHeaderClick() {
    this.modeloAuthorizer = [];
  }

  onRowExpansionClick(line: any) {
    this.modeloAuthorizer = [];
    this.modeloAuthorizer = line.lines;
  }

  onClickGoTo(modelo: any, idDrasf: boolean) {
    // 🔥 Caso directo (sin lógica)
    if (!idDrasf) {
      this.goToOrderEdit(modelo.docEntry);
      return;
    }

    // 🔥 Caso con validación
    this.fetchStatus(modelo.docEntry).subscribe(value => {
      const status = value?.wddStatus ?? '';

      const routesMap: Record<string, () => void> = {
        'A': () => this.goToOrderEdit(modelo.docEntry),
        'P': () => this.goToOrderEdit(modelo.docEntry),
        'N': () => this.goToOrderCreate(modelo.docEntry),
        'W': () => this.goToOrderCreate(modelo.docEntry),
        'Y': () => this.goToOrderCreate(modelo.docEntry),
      };

      routesMap[status]?.();
    });
  }

  // 🔥 métodos separados
  private goToOrderEdit(id: number) {
    this.router.navigate(['/main/modulo-ven/panel-orden-venta-edit', id]);
  }

  private goToOrderCreate(id: number) {
    this.router.navigate(
      ['/main/modulo-ven/panel-orden-venta-create'],
      { state: { mode: 'draft', docEntry: id } }
    );
  }

  private fetchStatus(docEntry: number): Observable<IDraftsStatusQuery | null> {
    return this.draftsService.getStatusByDocEntry(docEntry)
    .pipe(
      map(data => data ?? null),
      catchError(() => of(null))
    );
  }

  onClickBack() {
    this.router.navigate(['/main/modulo-apr/panel-informe-status-autorizacion-options']);
  }
}
