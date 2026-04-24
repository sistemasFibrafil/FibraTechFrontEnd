import { Subject, Observable, map, catchError, of } from 'rxjs';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { Component, OnInit, OnDestroy } from '@angular/core';

import { GlobalsConstantsForm } from '@app/constants/globals-constants-form';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { DraftsDocumentReportFilterModel } from '@app/modulos/modulo-documentos-borrador/models/drafts.model';

import { TableColumn } from '@app/interface/common-ui.interface';
import { IDraftsDocumentReportQuery, IDraftsStatusQuery } from '@app/modulos/modulo-documentos-borrador/interfaces/drafts.interface';

import { UtilService } from '@app/services/util.service';
import { SwaCustomService } from '@app/services/swa-custom.service';
import { DraftsService } from '@app/modulos/modulo-documentos-borrador/services/drafts.service';



@Component({
  selector: 'app-dra-panel-documento-preliminar',
  templateUrl: './panel-documento-preliminar.component.html',
  styleUrls: ['./panel-documento-preliminar.component.css']
})
export class PanelDocumentoPreliminarComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Configuration
  readonly titulo                               = 'Informe documento preliminar';
  readonly subTitulo                            = 'Documento preliminar';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isDisplay                                     = false;

  // Table configuration
  columnas                                      : TableColumn[] = [];

  modelo                                        : IDraftsDocumentReportQuery[] = [];

  // Paginación de la tabla
  rows                                          = 20;
  rowsPerPageOptions                            = [20, 40, 60, 80, 100];


  constructor(
    private readonly router: Router,
    private readonly draftsService: DraftsService,
    private readonly swaCustomService: SwaCustomService,
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
      { field: 'docNum',          header: 'N° de documento' },
      { field: 'docStatus',       header: 'Estado' },
      { field: 'createDate',      header: 'Fecha de creación' },
      { field: 'docDate',         header: 'Fecha de contabilización' },
      { field: 'taxDate',         header: 'Fecha de documento' },
      { field: 'updateDate',      header: 'Fecha de actualización' },
      { field: 'cardCode',        header: 'Código SN' },
      { field: 'cardName',        header: 'Nombre SN' },
      { field: 'docTotal',        header: 'Total MN' },
      { field: 'docTotalSys',     header: 'Total ME' }
    ];
  }

  loadData(): void {
    const params = this.buildFilterParams();

    if (!params) {
      console.warn('No hay filtros');
      return;
    }

    this.isDisplay = true;

    this.draftsService
    .getListDraftsDocumentReport(params)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IDraftsDocumentReportQuery[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private buildFilterParams(): any | null {
    const STORAGE_KEY = 'filtrosInformeDocumentoPreliminar';

    let filtros: DraftsDocumentReportFilterModel | null = null;

    // 🔥 Obtener filtros
    const data = sessionStorage.getItem(STORAGE_KEY);
    filtros = data
      ? JSON.parse(data)
      : history.state?.filtrosInformeDocumentoPreliminar ?? null;

    if (!filtros) return null;

    // 💾 Guardar si viene de history
    if (!data) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(filtros));
    }

    // 🔥 Normalizar fechas
    const normalizeDateOrToday = (d: any) => (d ? new Date(d) : null);

    filtros.startDate = normalizeDateOrToday(filtros.startDate);
    filtros.endDate   = normalizeDateOrToday(filtros.endDate);

    return filtros
  }

  getEstado(status: string) {
    const estados = {
      O: { text: 'Abierto', class: 'estado-pendiente' },
      C: { text: 'Creado',  class: 'estado-creado' },
    };

    return estados[status] ?? { text: '', class: '' };
  }

  onClickGoTo(modelo: any) {
    this.router.navigate(
      ['/main/modulo-ven/panel-orden-venta-create'],
      { state: { mode: 'draft', docEntry: modelo.docEntry } }
    );
  }

  onClickBack() {
    this.router.navigate(['/main/modulo-dra/panel-documento-preliminar-options']);
  }
}
