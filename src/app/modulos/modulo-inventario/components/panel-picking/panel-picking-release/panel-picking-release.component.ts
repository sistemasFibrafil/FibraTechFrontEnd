import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { finalize, takeUntil } from 'rxjs/operators';
import { MessageService, SelectItem } from 'primeng/api';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Component, OnInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';

import { PickingReleaseModel } from '../../../models/picking.model';

import { UtilService } from 'src/app/services/util.service';
import { LocalDataService } from 'src/app/services/local-data.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { PickingService } from 'src/app/modulos/modulo-inventario/services/picking.service';


@Component({
  selector: 'app-inv-panel-picking-release',
  templateUrl: './panel-picking-release.component.html',
  styleUrls: ['./panel-picking-release.component.css']
})
export class PanelPickingReleaseComponent implements OnInit, OnDestroy {
  // Lifecycle management
  private readonly destroy$                     = new Subject<void>();

  // Forms
  modeloForm                                   : FormGroup;

  // Configuration
  readonly titulo                               = 'Picking';
  globalConstants                               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // UI State
  isRelease                                     = false;

  // Table configuration
  objTypeList                                   : SelectItem[] = [];


  @ViewChild('codeBarInput')
    private codeBarInput: ElementRef<HTMLInputElement> | undefined;


  constructor(
    private readonly router: Router,
    private readonly fb: FormBuilder,
    public  readonly app: LayoutComponent,
    private readonly pickingService: PickingService,
    private readonly messageService: MessageService,
    private readonly localDataService: LocalDataService,
    private readonly swaCustomService: SwaCustomService,
    private readonly userContextService: UserContextService
  ) {}

  // ===========================
  // Lifecycle Hooks
  // ===========================

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
    this.loadTypeDocuments();
  }

  private buildForms(): void {
    this.modeloForm = this.fb.group({
      objType                   : ['', Validators.required],
      u_CodeBar                 : [{ value: '', disabled: true }, Validators.required]
    });
  }


  private loadTypeDocuments(): void {
    const statuses = this.localDataService.typePicking;
    this.objTypeList = statuses.map(s => ({ label: s.name, value: s.code }));
  }


  onChangeTypeDocument(): void {
    // Habilitar o deshabilitar el input de código de barras según la selección de almacén
    const objType = this.modeloForm.get('objType')?.value;
    const objTypeValue = objType?.value ?? objType;
    const uCodeCtrl = this.modeloForm.get('u_CodeBar');

    if (objTypeValue) {
      uCodeCtrl?.enable({ emitEvent: false });
      // enfocar el input para escaneo rápido
      setTimeout(() => this.codeBarInput?.nativeElement.focus(), 50);
    } else {
      uCodeCtrl?.disable({ emitEvent: false });
      uCodeCtrl?.patchValue('', { emitEvent: false });
    }
  }




  // ===========================
  // Data Operations
  // ===========================

  private validateRelease(): boolean {
    const showError = (message: string): boolean => {
      this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail: message });
      return false;
    };

    const { objType } = this.modeloForm.value;
    const { u_CodeBar } = this.modeloForm.value;

    if (!objType?.value) {
      return showError('Seleccione el tipo de documento.');
    }

    if (!u_CodeBar) {
      return showError('Ingrese el código de barras.');
    }

    return true;
  }

  private save(): void {
    if (!this.validateRelease()) {
      return;
    }

    const formValues = {
      ...this.modeloForm.getRawValue(),
    };

    const userId = this.userContextService.getIdUsuario();

    const modeloToRelease: PickingReleaseModel = {
      u_IsReleased  : 'Y',
      u_BaseType    : formValues.objType?.value,
      u_CodeBar     : formValues.u_CodeBar,
      u_UsrRelease  : userId
    };

    // Evitar envíos concurrentes: deshabilitar el campo de código mientras procesamos
    const uCodeCtrl = this.modeloForm.get('u_CodeBar');
    uCodeCtrl?.disable({ emitEvent: false });

    this.pickingService.setRelease(modeloToRelease)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          // Limpiar input sin emitir valueChanges
          this.modeloForm.patchValue({ u_CodeBar: '' }, { emitEvent: false });

          // Re-habilitar el control sólo si hay almacén seleccionado
            try {
              const objType = this.modeloForm.get('objType')?.value;
              const objTypeValue = objType?.value ?? objType;
              if (objTypeValue) { uCodeCtrl?.enable({ emitEvent: false }); }
            } catch {
              // noop
            }

            // Reenfocar para el siguiente escaneo
            requestAnimationFrame(() => { try { this.codeBarInput?.nativeElement.focus(); } catch {} });
        })
      )
      .subscribe({
        next: () => {
          this.messageService.add({ severity: 'success', summary: this.globalConstants.msgExitoSummary, detail: 'Se realizo correctamente.' });
        },
        error: (e) => {
          this.messageService.add({ severity: 'error', summary: this.globalConstants.msgErrorSummary, detail: e?.error?.resultadoDescripcion || e?.message || 'Error al guardar.' });
        }
      });
  }

  // ===========================
  // Release Operations
  // ===========================

  onClickRelease(): void {
    this.confirmRelease();
  }

  private confirmRelease(): void {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleLiberar,
      this.globalConstants.subTitleLiberar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.save();
      }
    });
  }


  // ===========================
  // Navigation
  // ===========================

  back(): void {
    this.router.navigate(['/main/modulo-inv/panel-picking-list']);
  }
}
