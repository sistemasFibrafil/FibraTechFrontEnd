import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { ISolicitudCompra } from '../../../interfaces/sap/solicitud-compra.interface';
import { SolicitudCompraService } from '../../../services/sap/solicitud-compra.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { UtilService } from 'src/app/services/util.service';
import { SolicitudCompraFilterModel } from '../../../models/sap/solicitud-compra.model';
import { Subject, takeUntil } from 'rxjs';
import { MenuItem } from 'src/app/interface/common-ui.interface';

interface DocStatus {
  statusCode  : string,
  statusName  : string
}

@Component({
  selector: 'app-com-panel-solicitud-compra-list',
  templateUrl: './panel-solicitud-compra-list.component.html',
  styleUrls: ['./panel-solicitud-compra-list.component.css']
})
export class PanelSolicitdCompraListComponent implements OnInit {
  // Lifecycle management
    private readonly destroy$                     = new Subject<void>();
  modeloForm                                      : FormGroup;

  // Titulo del componente
  titulo = 'Solicitud de Compra';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  columnas: any[];
  opciones: any = [];

  modeloDelete: ISolicitudCompra;
  modeloSelected: ISolicitudCompra;
  modelo: ISolicitudCompra[] = [];

  docStatus: DocStatus[];
  docStatusList: SelectItem[];
  opcionesMap                                   : Map<string, MenuItem>;

  // Paginación de la tabla
  rows                = 20;
  rowsPerPageOptions  = [20, 40, 60, 80, 100];

  params: SolicitudCompraFilterModel = new SolicitudCompraFilterModel();
  isDisplay: Boolean = false;
  isClosing: boolean = false;


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    private readonly utilService: UtilService,
    private userContextService: UserContextService,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly solicitudCompraService: SolicitudCompraService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
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
    this.onBuildColumn();
    this.opcionesTabla();
    this.getListStatus();

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-com-panel-solicitud-compra-list');

    if (!this.buttonAcces.btnBuscar) {
      this.getList();
    }
  }

  buildForms() {
    this.modeloForm = this.fb.group({
      startDate     : [this.utilService.firstDayMonth(), Validators.required],
      endDate       : [this.utilService.currentDate(), Validators.required],
      docStatus     : ['', Validators.required],
      searchText    : ['']
    });
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'docNum',          header: 'Número' },
      { field: 'docDate',         header: 'Fecha de contabilización' },
      { field: 'docDueDate',      header: 'Fecha de entrega' },
      { field: 'taxDate',         header: 'Fecha de documento' },
      { field: 'reqDate',         header: 'Fecha necesaria' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { value: '1', label: 'Ver',       icon: 'pi pi-eye',                    command: () => this.onClickVer() },
      { value: '2', label: 'Editar',    icon: 'pi pi-pencil',                 command: () => this.onClickEditar() },
      { value: '3', label: 'Cerrar',    icon: 'pi pi-times',                  command: () => this.onClickCerrar() },
      { value: '4', label: 'Formato',   icon: 'pi pi-print',                  command: () => this.onClickImprimir() },
    ];
    this.opcionesMap = new Map(this.opciones.map(op => [op.label, op]));
  }

  // ===========================
  // Helper Methods
  // ===========================

  private validateSelection(): boolean {
    if (!this.modeloSelected) {
      this.swaCustomService.swaMsgInfo('Debe seleccionar al menos un registro');
      return false;
    }
    return true;
  }

  private updateMenuVisibility(modelo: ISolicitudCompra): void {
    const isOpen        = modelo.docStatus === 'O';

    this.opcionesMap.get('Ver')!.visible        = !this.buttonAcces.btnVer;
    this.opcionesMap.get('Editar')!.visible     = !this.buttonAcces.btnEditar;
    this.opcionesMap.get('Cerrar')!.visible     = !this.buttonAcces.btnCerrar && isOpen;
    this.opcionesMap.get('Formato')!.visible    = !this.buttonAcces.btnImprimir;
  }

  // ===========================
  // Table Events
  // ===========================

  onSelectedItem(modelo: ISolicitudCompra) {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }


  // ===========================
  // Data Operations
  // ===========================

  private getListStatus(): void {
    const statuses = this.localDataService.getListStatusDocumentInventory();
    this.docStatusList = statuses.map(s => ({ label: s.name, value: s }));
    this.modeloForm.get('docStatus')?.setValue(statuses);
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
    const selectedStatuses = this.modeloForm.value.docStatus || [];
    this.params.docStatus = selectedStatuses.map(x => x.code).join(',');
  }

  getList(): void {
    this.isDisplay = true;
    this.onSetParametro();
    this.solicitudCompraService.getListByFilter(this.params)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data: ISolicitudCompra[]) => {
          this.isDisplay = false;
          this.modelo = data;
        },
        error: (e) => {
          this.utilService.handleErrorSingle(e, 'getList', () => this.isDisplay = false, this.swaCustomService);
        }
      });
  }

  onClickBuscar() {
    this.getList();
  }

  onClickCreate() {
    this.router.navigate(['/main/modulo-com/panel-solicitud-compra-create']);
  }

  onClickVer(){
    if (!this.validateSelection()) return;
    this.router.navigate(['/main/modulo-com/panel-solicitud-compra-view', this.modeloSelected.docEntry]);
  }

  onClickEditar(){
    if (!this.validateSelection()) return;
    this.router.navigate(['/main/modulo-com/panel-solicitud-compra-edit', this.modeloSelected.docEntry]);
  }

  close() {
    this.isClosing = true;
    const param: any = { id: this.modeloSelected.docEntry, docEntry: this.modeloSelected.docEntry, u_UsrUpdate: this.userContextService.getIdUsuario() };
    this.solicitudCompraService.setClose(param)
    .subscribe({ next: ()=>{
        this.getList();
        this.isClosing = false;
        this.swaCustomService.swaMsgExito(null);
      },
      error:(e)=>{
        this.isClosing = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickCerrar()
  {
    if (!this.validateSelection()) return;

    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleCerrar,
      this.globalConstants.subTitleCerrar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.close();
      }
    });
  }

  onClickImprimir(): void {
    if (!this.validateSelection()) return;

    // this.isDisplayGenerandoVisor = true;
    // this.solicitudTrasladoService.getFormatoPdfByDocEntry(this.modeloSelected.docEntry)
    // .pipe(takeUntil(this.destroy$))
    // .subscribe({
    //   next: (resp: any) => {
    //     switch (resp.type) {
    //       case HttpEventType.DownloadProgress:
    //         break;
    //       case HttpEventType.Response:
    //         this.isDataBlob = new Blob([resp.body], { type: resp.body.type });
    //         this.isDisplayGenerandoVisor = false;
    //         this.isDisplayVisor = true;
    //         break;
    //     }
    //   },
    //   error: (e) => {
    //     this.utilService.handleErrorSingle(e, 'onClickImprimir', () => this.isDisplayGenerandoVisor = false, this.swaCustomService);
    //   }
    // });
  }
}
