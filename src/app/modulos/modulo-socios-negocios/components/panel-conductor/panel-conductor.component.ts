import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { Subject, finalize, forkJoin, switchMap, takeUntil } from 'rxjs';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { Drivers1CreateModel, DriversCreateModel } from '../../models/drivers.model';

import { IDrivers } from '../../interfaces/drivers.interface';
import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IBusinessPartnersQuery } from '../../interfaces/business-partners.interface';

import { UtilService } from 'src/app/services/util.service';
import { DriversService } from '../../services/drivers.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { BusinessPartnersService } from '../../services/business-partners.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';


@Component({
  selector: 'app-soc-panel-conductor',
  templateUrl: './panel-conductor.component.html',
  styleUrls: ['./panel-conductor.component.css']
})
export class PanelConductorComponent implements OnInit, OnDestroy {
  // Lifecycle management
    private readonly destroy$                   = new Subject<void>();
  modeloForm                                    : FormGroup;
  // Titulo del componente
  titulo                                        = 'Permiso logístico';
  // Name de los botones de accion
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  cardCode                                      : string;

  modeloLines                                   : IDrivers[] = [];
  modeloLinesDelete                             : IDrivers[] = [];
  modeloLinesSelected                           : IDrivers;
  // UI State
  isSaving                                      : boolean = false;
  isDisplay                                     : boolean = false;
  hasChanges                                    : boolean = false;
  hasValidLines                                 : boolean = false;
  originalActiveValue                           : boolean = false;

  // Table configuration
  columnas                                      : TableColumn[];
  opciones                                      : MenuItem[];
  identityDocumentTypeList                      : SelectItem[] = [];

  // Snapshot para detectar cambios reales
  initialSnapshot: any;


  constructor
  (
    private fb: FormBuilder,
    private router: Router,
    public  app: LayoutComponent,
    public  utilService: UtilService,
    private readonly route: ActivatedRoute,
    private readonly driversService: DriversService,
    private readonly swaCustomService: SwaCustomService,
    private readonly businessPartnersService: BusinessPartnersService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService
    ,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();

    this.loadAllCombos();

    this.watchChanges();   // 👈 escuchar cambios del formulario
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private onBuildColumn(): void {
    this.columnas = [
      { field: 'u_BPP_CHNO',      header: 'Nombre' },
      { field: 'u_FIB_CHAP',      header: 'Apellidos' },
      { field: 'u_FIB_CHTD',      header: 'Tipo de documento' },
      { field: 'u_FIB_CHND',      header: 'Número de documento' },
      { field: 'u_BPP_CHLI',      header: 'Licencia' },
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
        !p(line.u_BPP_CHLI)
      );

    const hasValidLines =
      this.modeloLines.some(line =>
        (line.record === 1 || line.record === 3) &&
        p(line.u_BPP_CHLI)
      );

    const hasDeletedLines =
      this.modeloLinesDelete.length > 0;

    this.hasValidLines =
      !hasInvalidLines &&
      (hasValidLines || hasDeletedLines);
  }

  private loadAllCombos(): void {
    const paramType: any = { tableID: '@BPP_CONDUC', aliasID: 'FIB_CHTD' };

    forkJoin({
      objectType: this.camposDefinidoUsuarioService.getList(paramType)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        this.identityDocumentTypeList = result.objectType.map(item => ({
          label: `${item.fldValue} - ${item.descr ?? ''}`,
          value: item.fldValue
        }));


        this.loadData();
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadAllCombos', this.swaCustomService);
      }
    });
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
          .getDriverByCode(this.cardCode)
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
          linesDrivers

        } = data;

        this.modeloForm.patchValue({
          cardCode,
          cardName,
          licTradNum
        });

        this.modeloLines = linesDrivers?.length ? linesDrivers : [this.createEmptyLine()];

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

  private createEmptyLine(): IDrivers {
    const { cardCode, cardName } = this.modeloForm.getRawValue();
    return {
      code            : '',
      name            : cardName,
      u_BPP_CHNO      : '',
      u_FIB_CHAP      : '',
      u_FIB_CHTD      : '',
      u_FIB_CHND      : '',
      u_BPP_CHLI      : '',
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

  public markAsModified(row: IDrivers): void {
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

    const normalizeLine = (l: any) => ({
      code        : p(l.code),
      name        : p(l.name),
      u_BPP_CHNO  : p(l.u_BPP_CHNO),
      u_FIB_CHAP  : p(l.u_FIB_CHAP),
      u_FIB_CHTD  : p(l.u_FIB_CHTD),
      u_FIB_CHND  : p(l.u_FIB_CHND),
      u_BPP_CHLI  : p(l.u_BPP_CHLI),
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
        l.record === 1 && p(l.u_BPP_CHLI) !== ''
      );

    this.hasChanges =
      hasUpdatedLines ||
      hasDeletedLines ||
      hasNewLines;
  }

  getIdentityDocumentTypeLabel(value: any): string {
    if (!Array.isArray(this.identityDocumentTypeList) || this.identityDocumentTypeList.length === 0) {
      return '';
    }

    const item = this.identityDocumentTypeList.find(x => x.value === value);
    return item ? item.label : '';
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
      if (!line.u_BPP_CHNO) {
        this.swaCustomService.swaMsgInfo('Debe ingresar el nombre.');
        return false;
      }

      if (!line.u_FIB_CHAP) {
        this.swaCustomService.swaMsgInfo('Debe ingresar el apellido.');
        return false;
      }

      if (!line.u_FIB_CHTD) {
        this.swaCustomService.swaMsgInfo('Debe seleccionar el tipo de documento.');
        return false;
      }

      if (!line.u_FIB_CHND) {
        this.swaCustomService.swaMsgInfo('Debe ingresar el número de documento.');
        return false;
      }

      if (!line.u_BPP_CHLI) {
        this.swaCustomService.swaMsgInfo('Debe ingresar el número de licencia.');
        return false;
      }
    }

    return true;
  }

  private mapLinesCreate(): Drivers1CreateModel[] {
    const u = this.utilService;
    const p = (v:any)=>u.normalizePrimitive(v);

    return [...this.modeloLines, ...this.modeloLinesDelete]
    .filter(x => x.record !== 2 && p(x.u_BPP_CHLI))
    .map<Drivers1CreateModel>(line => ({
      code            : p(line.code),
      name            : p(line.name),
      u_BPP_CHNO      : p(line.u_BPP_CHNO),
      u_FIB_CHAP      : p(line.u_FIB_CHAP),
      u_FIB_CHTD      : p(line.u_FIB_CHTD),
      u_FIB_CHND      : p(line.u_FIB_CHND),
      u_BPP_CHLI      : p(line.u_BPP_CHLI),
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
      ... new DriversCreateModel(),

      cardCode      : formValues.cardCode,
      lines         : this.mapLinesCreate()
    };

    this.driversService.setCreate(modeloToSave)
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
