import { SelectItem } from 'primeng/api';
import { ActivatedRoute, Router } from '@angular/router';
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, finalize, forkJoin, switchMap, takeUntil } from 'rxjs';
import { LayoutComponent } from '../../../../../layout/layout.component';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from '../../../../../constants/globals-constants-form';

import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { DocumentSeriesConfiguration1CreateModel, DocumentSeriesConfigurationCreateModel, DocumentSeriesConfigurationFindModel } from '../../../models/document-series-configuration.model';

import { MenuItem, TableColumn } from 'src/app/interface/common-ui.interface';
import { IDocumentSeriesConfiguration1Query, IDocumentSeriesConfigurationQuery } from '../../../interfaces/document-series-configuration.interface';

import { UtilService } from '../../../../../services/util.service';
import { SwaCustomService } from '../../../../../services/swa-custom.service';
import { DocumentSeriesConfigurationService } from '../../../services/document-series-configuration.service';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/user-defined-fields.service';


@Component({
  selector: 'app-seg-persona-configuracion-serie-documento',
  templateUrl: './persona-configuracion-serie-documento.component.html',
  styleUrls: ['./persona-configuracion-serie-documento.component.css']
})
export class PersonaConfigSerieDocumentoComponent implements OnInit, OnDestroy {
  // Lifecycle management
    private readonly destroy$                   = new Subject<void>();
  modeloForm                                    : FormGroup;
  // Titulo del componente
  titulo                                        = 'Permiso logístico';
  // Name de los botones de accion
  buttonAcces                                   : ButtonAcces = new ButtonAcces();
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  idUsuario                                     : number = 0;

  modeloLines                                   : IDocumentSeriesConfiguration1Query[] = [];
  modeloLinesDelete                             : IDocumentSeriesConfiguration1Query[] = [];
  modeloLinesSelected                           : IDocumentSeriesConfiguration1Query;
  // UI State
  isSaving                                      : boolean = false;
  isDisplay                                     : boolean = false;
  hasChanges                                    : boolean = false;
  hasValidLines                                 : boolean = false;
  originalActiveValue                           : boolean = false;
  formChanged                                   : boolean = false;

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
    public app: LayoutComponent,
    private utilService: UtilService,
    private readonly route: ActivatedRoute,
    private readonly swaCustomService: SwaCustomService,
    private readonly camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
    private readonly documentSeriesConfigurationService: DocumentSeriesConfigurationService
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
      { field: 'u_Type',          header: 'Tipo de documento' },
      { field: 'u_Series',        header: 'Serie' },
      { field: 'u_SalesInvoices', header: 'Factura de venta' },
      { field: 'u_Delivery',      header: 'Entrega' },
      { field: 'u_Transfer',      header: 'Transferencia' },
      { field: 'u_Default',       header: 'Por defecto' },
      { field: 'u_Active',        header: 'Activo' },
    ];
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
      {
        'code'            : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'apellidoPaterno' : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'apellidoMaterno' : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'nombre'          : new FormControl({ value: '', disabled: true }, Validators.compose([Validators.required, Validators.maxLength(50), Validators.minLength(2)])),
        'u_Active'        : new FormControl({value: true, disabled: false}),
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

  // Verifica si todas las líneas son válidas
  private updateHasValidLines(): void {
    const p = (v:any)=>this.utilService.normalizePrimitive(v);

    const hasInvalidLines =
      this.modeloLines.some(line =>
        (line.record === 1 || line.record === 3) &&
        (!p(line.u_Type) || !p(line.u_Series))
      );

    const hasValidLines =
      this.modeloLines.some(line =>
        (line.record === 1 || line.record === 3) &&
        p(line.u_Type) && p(line.u_Series)
      );

    const hasDeletedLines =
      this.modeloLinesDelete.length > 0;

    this.hasValidLines =
      !hasInvalidLines &&
      (hasValidLines || hasDeletedLines);
  }

  private loadAllCombos(): void {
    const paramType: any = { tableID: '@FIB_CSD1', aliasID: 'type' };

    forkJoin({
      objectType: this.camposDefinidoUsuarioService.getList(paramType)
    })
    .pipe(takeUntil(this.destroy$))
    .subscribe({
      next: (result) => {
        this.documentTypeList = result.objectType.map(item => ({
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
        this.idUsuario = +params['id'];

        // 🔥 aquí sí se activa de forma confiable
        this.isDisplay = true;

        const param: DocumentSeriesConfigurationFindModel = {
          idUsuario: this.idUsuario
        };

        return this.documentSeriesConfigurationService
          .getById(param)
          .pipe(
            finalize(() => {
              this.isDisplay = false;
            })
          );
      })
    )
    .subscribe({
      next: (data: IDocumentSeriesConfigurationQuery) => {
        const {
          code,
          apellidoPaterno,
          apellidoMaterno,
          nombre,
          u_Active,
          lines
        } = data;

        this.modeloForm.patchValue({
          code,
          apellidoPaterno,
          apellidoMaterno,
          nombre,
          u_Active
        });

        this.modeloLines = lines?.length ? lines : [this.createEmptyLine()];

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

  private createEmptyLine(): IDocumentSeriesConfiguration1Query {
    return {
      code            : '',
      lineId          : 0,
      u_Type          : '',
      u_Series        : '',
      u_SalesInvoices : false,
      u_Delivery      : false,
      u_Transfer      : false,
      u_Default       : false,
      u_Active        : true,
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

  markAsModified(row: IDocumentSeriesConfiguration1Query): void {
    if (row.record === 2) {
      row.record = 3;
    }

    this.updateHasValidLines();
    this.detectRealChanges();
  }

  private detectRealChanges(): void {
    if (!this.initialSnapshot) return;

    this.formChanged =
      this.modeloForm.get('u_Active')?.value !==
      this.initialSnapshot.form.u_Active;

    const hasNewLines =
      this.modeloLines.some(l => l.record === 1 && l.u_Type && l.u_Series);

    const hasDeletedLines =
      this.modeloLinesDelete.length > 0;

    const hasUpdatedLines =
      this.modeloLines.some(line => {

        if (line.record === 1) return false;

        const original = this.initialSnapshot.lines.find(
          o => o.lineId === line.lineId
        );

        if (!original) return false;

        return (
          line.u_Type !== original.u_Type ||
          line.u_Series !== original.u_Series ||
          line.u_SalesInvoices !== original.u_SalesInvoices ||
          line.u_Delivery !== original.u_Delivery ||
          line.u_Transfer !== original.u_Transfer ||
          line.u_Default !== original.u_Default ||
          line.u_Active !== original.u_Active
        );

      });

    this.hasChanges =
      this.formChanged ||
      hasNewLines ||
      hasDeletedLines ||
      hasUpdatedLines;
  }

  getDocumentTypeLabel(value: any): string {
    if (!Array.isArray(this.documentTypeList) || this.documentTypeList.length === 0) {
      return '';
    }

    const item = this.documentTypeList.find(x => x.value === value);
    return item ? item.label : '';
  }

  private validateSave(): boolean {
    const { code } = this.modeloForm.getRawValue();

    if (!code) {
      this.swaCustomService.swaMsgInfo('El código es obligatorio.');
      return false;
    }

    for (const line of this.modeloLines) {

      if (!line.u_Type) {
        this.swaCustomService.swaMsgInfo('Debe seleccionar el tipo de documento.');
        return false;
      }

      if (!line.u_Series) {
        this.swaCustomService.swaMsgInfo('Debe seleccionar la serie.');
        return false;
      }
    }

    return true;
  }

  private toYN(value: boolean): string {
    return value ? 'Y' : 'N';
  }

  private mapLinesCreate(): DocumentSeriesConfiguration1CreateModel[] {
    const p = (v:any)=>this.utilService.normalizePrimitive(v);

    return [...this.modeloLines, ...this.modeloLinesDelete]
    .filter(x => x.record !== 2 && p(x.u_Type) && p(x.u_Series))
    .map<DocumentSeriesConfiguration1CreateModel>(line => ({
      code            : p(line.code),
      lineId          : line.lineId,
      u_Type          : p(line.u_Type),
      u_Series        : p(line.u_Series),
      u_SalesInvoices : this.toYN(line.u_SalesInvoices),
      u_Delivery      : this.toYN(line.u_Delivery),
      u_Transfer      : this.toYN(line.u_Transfer),
      u_Default       : this.toYN(line.u_Default),
      u_Active        : this.toYN(line.u_Active),
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
      ... new DocumentSeriesConfigurationCreateModel(),
      code          : formValues.code,
      u_IdUser      : this.idUsuario,
      u_Active      : this.toYN(formValues.u_Active),

      lines         : this.mapLinesCreate()
    };

    this.documentSeriesConfigurationService.setCreate(modeloToSave)
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
    this.router.navigate(['/main/modulo-seg/panel-persona']);
  }
}
