import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, finalize, switchMap, takeUntil } from 'rxjs';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { VehiclesCreateModel, Vehicles1CreateModel } from '../../models/vehicles.model';

import { IVehicles } from '../../interfaces/vehicles.interface';
import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IBusinessPartnersQuery } from '../../interfaces/business-partners.interface';

import { UtilService } from 'src/app/services/util.service';
import { VehiclesService } from '../../services/vehicles.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { BusinessPartnersService } from '../../services/business-partners.service';


@Component({
  selector: 'app-soc-panel-vehiculo',
  templateUrl: './panel-vehiculo.component.html',
  styleUrls: ['./panel-vehiculo.component.css']
})
export class PanelVehiculoComponent implements OnInit, OnDestroy {
  // Lifecycle management
    private readonly destroy$                   = new Subject<void>();
  modeloForm                                    : FormGroup;
  // Titulo del componente
  titulo                                        = 'Permiso logístico';
  // Name de los botones de accion
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  cardCode                                      : string;

  modeloLines                                   : IVehicles[] = [];
  modeloLinesDelete                             : IVehicles[] = [];
  modeloLinesSelected                           : IVehicles;
  // UI State
  isSaving                                      : boolean = false;
  isDisplay                                     : boolean = false;
  hasChanges                                    : boolean = false;
  hasValidLines                                 : boolean = false;
  originalActiveValue                           : boolean = false;

  // Table configuration
  columnas                                      : TableColumn[];
  opciones                                      : MenuItem[];
  documentTypeList                              : SelectItem[] = [];

  // Snapshot para detectar cambios reales
  initialSnapshot: any;


  constructor
  (
    private fb: FormBuilder,
    private router: Router,
    public  app: LayoutComponent,
    public  utilService: UtilService,
    private readonly route: ActivatedRoute,
    private readonly vehiclesService: VehiclesService,
    private readonly swaCustomService: SwaCustomService,
    private readonly businessPartnersService: BusinessPartnersService,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();

    this.loadData();

    this.watchChanges();   // 👈 escuchar cambios del formulario
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'u_BPP_VEPL',      header: 'Placa' },
      { field: 'u_BPP_VEMA',      header: 'Marca' },
      { field: 'u_BPP_VEMO',      header: 'Modelo' },
      { field: 'u_BPP_VEAN',      header: 'Año' },
      { field: 'u_BPP_VECO',      header: 'Color' },
      { field: 'u_BPP_VESE',      header: 'Serie del motor' },
      { field: 'u_BPP_VEPM',      header: 'Peso máximo' },
    ];
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
      {
        'cardCode'    : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'cardName'    : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'licTradNum'  : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
      }
    );
  }

  private opcionesTabla(): void {
    this.opciones = [
      { value: '1', label: 'Añadir línea', icon: 'pi pi-pencil',  command: () => this.onClickAddLine() },
      { value: '2', label: 'Borrar línea', icon: 'pi pi-times',   command: () => this.onClickDelete() },
    ];
  }

  private addLine(index: number): void {
    this.modeloLines.splice(index, 0, this.createEmptyLine());

    this.updateHasValidLines();
    this.detectRealChanges();

  }

  // ===========================
  // Helper Methods
  // ===========================
  private validateSelection(): boolean {
    if (!this.modeloLinesSelected) {
      this.swaCustomService.swaMsgInfo('Debe seleccionar al menos un registro');
      return false;
    }
    return true;
  }

  onClickAddLine(): void {
    if (!this.validateSelection()) return;

    const index = this.modeloLines.indexOf(this.modeloLinesSelected);
    const insertIndex = index + 1;
    this.addLine(insertIndex);
  }

  onClickDelete(): void {
    if (!this.validateSelection()) return;

    if (this.modeloLinesSelected.record === 2 || this.modeloLinesSelected.record === 3) {
      this.modeloLinesSelected.record = 4;
      this.modeloLinesDelete.push(this.modeloLinesSelected);
    }

    const index = this.modeloLines.indexOf(this.modeloLinesSelected);

    if (index > -1) {
      this.modeloLines.splice(index, 1);
    }

    if (this.modeloLines.length === 0) {
      this.addLine(0);
    }

    this.updateHasValidLines();
    this.detectRealChanges();
  }

  onSelectedItem(modelo: any): void {
    this.modeloLinesSelected = modelo;
  }

  private updateHasValidLines(): void {
    const p = (v:any)=>this.utilService.normalizePrimitive(v);

    const hasInvalidLines =
      this.modeloLines.some(line =>
        (line.record === 1 || line.record === 3) &&
        !p(line.u_BPP_VEPL)
      );

    const hasValidLines =
      this.modeloLines.some(line =>
        (line.record === 1 || line.record === 3) &&
        p(line.u_BPP_VEPL)
      );

    const hasDeletedLines =
      this.modeloLinesDelete.length > 0;

    this.hasValidLines =
      !hasInvalidLines &&
      (hasValidLines || hasDeletedLines);
  }

  private loadData(): void {
    this.route.params
    .pipe(
      takeUntil(this.destroy$),
      switchMap(params => {
        this.cardCode = params['id'];

        // 🔥 aquí sí se activa de forma confiable
        this.isDisplay = true;

        return this.businessPartnersService
          .getVehicleByCode(this.cardCode)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IBusinessPartnersQuery) => {
        const {
          cardCode,
          cardName,
          licTradNum,
          linesVehicles

        } = data;

        this.modeloForm.patchValue({
          cardCode,
          cardName,
          licTradNum
        });

        this.modeloLines = linesVehicles?.length ? linesVehicles : [this.createEmptyLine()];

        /* =========================
          SNAPSHOT ORIGINAL
        ========================= */

        this.initialSnapshot = {
          form: structuredClone(this.modeloForm.getRawValue()),
          lines: structuredClone(this.modeloLines)
        };

        /* =========================
          ESCUCHAR CAMBIOS FORM
        ========================= */
        this.updateHasValidLines();
        this.detectRealChanges();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  private createEmptyLine(): IVehicles {
    const { cardCode, cardName } = this.modeloForm.getRawValue();
    return {
      code            : '',
      name            : cardName,
      u_BPP_VEPL      : '',
      u_BPP_VEMA      : '',
      u_BPP_VEMO      : '',
      u_BPP_VEAN      : '',
      u_BPP_VECO      : '',
      u_BPP_VESE      : '',
      u_BPP_VEPM      : 0,
      u_FIB_COTR      : cardCode,
      record          : 1
    };
  }

  private watchChanges(): void {

    this.modeloForm.valueChanges
    .pipe(takeUntil(this.destroy$))
    .subscribe(() => {
      this.detectRealChanges();
    });

  }

  public markAsModified(row: IVehicles): void {
    if (row.record === 2) {
      row.record = 3;
    }

    this.updateHasValidLines();
    this.detectRealChanges();
  }

  private detectRealChanges(): void {
    if (!this.initialSnapshot) return;

    /** helpers para evitar repetición */
    const u = this.utilService;
    const p = (v:any) => u.normalizePrimitive(v);
    const n = (v:any) => u.normalizeNumber(v);

    const normalizeLine = (l: any) => ({
      code        : p(l.code),
      name        : p(l.name),
      u_BPP_VEPL  : p(l.u_BPP_VEPL),
      u_BPP_VEMA  : p(l.u_BPP_VEMA),
      u_BPP_VEMO  : p(l.u_BPP_VEMO),
      u_BPP_VEAN  : p(l.u_BPP_VEAN),
      u_BPP_VECO  : p(l.u_BPP_VECO),
      u_BPP_VESE  : p(l.u_BPP_VESE),
      u_BPP_VEPM  : n(l.u_BPP_VEPM),
      u_FIB_COTR  : p(l.u_FIB_COTR)
    });

    const currentLines =
      this.modeloLines.map(normalizeLine);

    const originalLines =
      this.initialSnapshot.lines.map(normalizeLine);

    const hasUpdatedLines =
      JSON.stringify(currentLines) !== JSON.stringify(originalLines);

    const hasDeletedLines =
      this.modeloLinesDelete.length > 0;

    const hasNewLines =
      this.modeloLines.some(l =>
        l.record === 1 && p(l.u_BPP_VEPL) !== ''
      );

    this.hasChanges =
      hasUpdatedLines ||
      hasDeletedLines ||
      hasNewLines;

  }

  private validateSave(): boolean {
    const { cardCode, cardName } = this.modeloForm.getRawValue();

    if (!cardCode) {
      this.swaCustomService.swaMsgInfo('El código de cliente es obligatorio.');
      return false;
    }

    if (!cardName) {
      this.swaCustomService.swaMsgInfo('El nombre de cliente es obligatorio.');
      return false;
    }

    for (const line of this.modeloLines) {

      if (!line.u_BPP_VEPL) {
        this.swaCustomService.swaMsgInfo('Debe seleccionar el tipo de documento.');
        return false;
      }
    }

    return true;
  }

  private mapLinesCreate(): Vehicles1CreateModel[] {
    const u = this.utilService;
    const p = (v:any)=>u.normalizePrimitive(v);
    const n = (v:any)=>u.normalizeNumber(v);

    return [...this.modeloLines, ...this.modeloLinesDelete]
    .filter(x => x.record !== 2 && p(x.u_BPP_VEPL))
    .map<Vehicles1CreateModel>(line => ({
      code            : p(line.code),
      name            : p(line.name),
      u_BPP_VEPL      : p(line.u_BPP_VEPL),
      u_BPP_VEMA      : p(line.u_BPP_VEMA),
      u_BPP_VEMO      : p(line.u_BPP_VEMO),
      u_BPP_VEAN      : p(line.u_BPP_VEAN),
      u_BPP_VECO      : p(line.u_BPP_VECO),
      u_BPP_VESE      : p(line.u_BPP_VESE),
      u_BPP_VEPM      : n(line.u_BPP_VEPM),
      u_FIB_COTR      : p(line.u_FIB_COTR),
      record          : line.record
    }));
  }

  onClickSave() {
    if (!this.validateSave()) {
      return;
    }

    this.isSaving = true;

    const formValues = this.modeloForm.getRawValue();

    const modeloToSave: any = {
      ... new VehiclesCreateModel(),

      cardCode      : formValues.cardCode,
      lines         : this.mapLinesCreate()
    };

    this.vehiclesService.setCreate(modeloToSave)
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => { this.isSaving = false; })
    )
    .subscribe({
      next: () => {
        this.hasChanges = false;
        this.modeloLinesDelete = [];

        this.swaCustomService.swaMsgExito(null);
        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'save', this.swaCustomService);
      }
    });
  }

  back() {
    this.router.navigate(['/main/modulo-soc/panel-socio-negocios-list']);
  }
}
