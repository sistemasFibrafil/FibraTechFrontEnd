import { Router } from '@angular/router';
import { SelectItem } from 'primeng/api';
import { Component, OnInit } from '@angular/core';
import {  finalize,  Subject, takeUntil } from 'rxjs';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IBusinessPartnersQuery } from '../../../interfaces/business-partners.interface';

import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';
import { BusinessPartnersService } from '../../../services/business-partners.service';



@Component({
  selector: 'app-soc-panel-socio-negocios-list',
  templateUrl: './panel-socio-negocios-list.component.html',
  styleUrls: ['./panel-socio-negocios-list.component.css']
})
export class PanelSocioNegociosListComponent implements OnInit {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                    : FormGroup;

  // Configuration
  readonly titulo                               : string = 'Socios de negocios';
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  codGrpCustNat                                 : number = 0;
  codGrpCustFor                                 : number = 0;

  // UI State
  isCancel                                      : boolean = false;
  isDisplay                                     : boolean = false;
  isDisplayVisor                                : boolean = false;
  isDisplayGenerandoVisor                       : boolean = false;

  // Table configuration
  opciones                                      : MenuItem[] = [];
  columnas                                      : TableColumn[] = [];
  private opcionesMap                           : Map<string, MenuItem>;

  cardTypeList                                  : SelectItem[] = [];

  // Paginación de la tabla
  rows                                          = 20;
  rowsPerPageOptions                            = [20, 40, 60, 80, 100];

  // Data
  modelo                                        : IBusinessPartnersQuery[] = [];
  modeloSelected                                : IBusinessPartnersQuery;

  isDataBlob                                    : Blob;

  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    private readonly swaCustomService: SwaCustomService,
    private readonly localDataService: LocalDataService,
    private readonly userContextService: UserContextService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly businessPartnersService: BusinessPartnersService,
    public  readonly utilService: UtilService
  ) {}


  ngOnInit() {
    this.initializeComponent();
  }

  // ===========================
  // Initialization
  // ===========================

  private initializeComponent(): void {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();
    this.loadCardTypeList();

    this.codGrpCustNat = this.userContextService.getCodGrpCustNat();
    this.codGrpCustFor = this.userContextService.getCodGrpCustFor();

    if (!this.buttonAcces.btnBuscar) {
      this.loadData();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onBuildForm(): void {
    this.modeloForm = this.fb.group({
      cardType    : ['', Validators.required],
      searchText  : ['']
    });

    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-soc-panel-socio-negocios-list');
  }

  onBuildColumn() {
    this.columnas = [
      { field: 'cardCode',      header: 'Código de cliente' },
      { field: 'cardName',      header: 'Nombre de cliente' },
      { field: 'groupName',     header: 'Grupo' },
      { field: 'u_BPP_BPAT',    header: 'Trasportista' },
      { field: 'slpName',       header: 'Vendedor' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { value: '1', label: 'Ver',         icon: 'pi pi-eye',      command: () => { this.onClickVer(); } },
      { value: '2', label: 'Editar',      icon: 'pi pi-pencil',   command: () => { this.onClickEditar(); } },
      { value: '3', label: 'Vehículo',    icon: 'pi pi-cog',      command: () => { this.onClickVehiculo(); } },
      { value: '4', label: 'Conductor',   icon: 'pi pi-cog',      command: () => { this.onClickConductor(); } },
    ];

    // Mapa para controlar visibilidad de opciones por etiqueta
    this.opcionesMap = new Map(this.opciones.map(op => [op.value, op]));
  }

  // ===========================
  // Helper Methods
  // ===========================

  private validateSelection(): boolean {
    if (!this.modeloSelected) {
      this.swaCustomService.swaMsgInfo('Debe seleccionar un registro');
      return false;
    }
    return true;
  }

  private updateMenuVisibility(modelo: IBusinessPartnersQuery): void {
    const isView      = !(this.buttonAcces.btnVer);
    const isEditable  = !(this.buttonAcces.btnEditar);

    const isVehiculo  = !(this.buttonAcces.btnVehiculo)  && modelo?.u_BPP_BPAT === 'Y';
    const isConductor = !(this.buttonAcces.btnConductor) && modelo?.u_BPP_BPAT === 'Y';

    this.opcionesMap.get('1')!.visible = isView;
    this.opcionesMap.get('2')!.visible = isEditable;
    this.opcionesMap.get('3')!.visible = isVehiculo;
    this.opcionesMap.get('4')!.visible = isConductor;
  }

  // ===========================
  // Table Events
  // ===========================

  onToItemSelected(modelo: IBusinessPartnersQuery): void {
    this.modeloSelected = modelo;
    this.updateMenuVisibility(modelo);
  }

  // ===========================
  // Data Operations
  // ===========================

  private loadCardTypeList(): void {
    const cardType = this.localDataService.cardType;

    this.cardTypeList = cardType.map(s => ({ label: s.name, value: s.code }));

    const defaultCardCode = 'C';
    const defaultValue = cardType.find(s => s.code === defaultCardCode);

    if (defaultValue) {
      const defaultSelectItem = { label: defaultValue.name, value: defaultValue.code };
      this.modeloForm.get('cardType')?.setValue(defaultSelectItem);
    }
  }

  // ===========================
  // Data Operations
  // ===========================

  private buildFilterParams(): any {
    const {
      cardType,
      searchText
    } = this.modeloForm.getRawValue();

    return {
      cardType: cardType.value ?? null,
      searchText
    };
  }

  private loadData(): void {
    this.isDisplay = true;

    this.businessPartnersService
    .getListByFilter(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IBusinessPartnersQuery[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  // ===========================
  // UI Actions
  // ===========================

  onClickBuscar(): void {
    this.loadData();
  }

  onClickCreate() {
    this.router.navigate(['/main/modulo-soc/panel-socio-negocio-create'], { state: { mode: 'create' } });
  }

  onClickVer(){
    if (!this.validateSelection()) return;

    this.router.navigate(['/main/modulo-soc/panel-socio-negocio-view', this.modeloSelected.cardCode]);
  }

  onClickEditar() {
    if (!this.validateSelection()) return;

    this.router.navigate(['/main/modulo-soc/panel-socio-negocio-edit', this.modeloSelected.cardCode]);
  }

  onClickVehiculo() {
    if (!this.validateSelection()) return;

    this.router.navigate(['/main/modulo-soc/panel-vehiculo', this.modeloSelected.cardCode]);
  }

  onClickConductor() {
    if (!this.validateSelection()) return;

    this.router.navigate(['/main/modulo-soc/panel-conductor', this.modeloSelected.cardCode]);
  }
}
