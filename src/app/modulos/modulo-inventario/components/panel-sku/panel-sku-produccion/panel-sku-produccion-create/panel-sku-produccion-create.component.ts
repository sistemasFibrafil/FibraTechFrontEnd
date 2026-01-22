import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { ISKP1 } from 'src/app/modulos/modulo-inventario/interfaces/oskp.interface';
import { OSKPCreateModel } from 'src/app/modulos/modulo-inventario/models/oskp.model';
import { OSKPService } from 'src/app/modulos/modulo-inventario/services/oskp.service';
import { finalize } from 'rxjs';
import { DatePipe } from '@angular/common';

@Component({
  selector: 'app-inv-panel-sku-produccion-create',
  templateUrl: './panel-sku-produccion-create.component.html',
  styleUrls: ['./panel-sku-produccion-create.component.css']
})
export class PanelSkuProduccionCreateComponent implements OnInit {
  // Titulo del componente
  titulo = 'SKU producción';

  modeloFormDatCom: FormGroup;
  modeloFormDatPrd: FormGroup;
  modeloFormFacPrd: FormGroup;
  modeloFormFacCal: FormGroup;
  modeloFormCostDet: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // MODAL: Progreso
  isSaving = false;
  isDisplay = false;
  // MODAL: CLiente
  number = '';
  rollWeight = 0;

  // DETALLE
  columns: any[];
  opciones: any[];

  // MODAL: Artículo
  indexArticulo = 0;
  indexProceso = 0;
  isVisualizarArticulo = false;
  isVisualizarProceso = false;

  detalle: ISKP1[] = [];
  detalleSelected: ISKP1;
  modeloSave: OSKPCreateModel = new OSKPCreateModel();

  constructor(
    private router                    : Router,
    private fb                        : FormBuilder,
    public app                        : LayoutComponent,
    private datePipe                  : DatePipe,
    public readonly utilService       : UtilService,
    private readonly swaCustomService : SwaCustomService,
    private oSKPService               : OSKPService,
  ) { }

  ngOnInit() {
    this.onBuildForm();
    this.blurRollWeight();
    this.onBuildColumn();
    this.opcionesTabla();
  }

  onBuildForm() {
    this.modeloFormDatCom = this.fb.group({
      u_Number: [{ value: '', disabled: true }, Validators.required],
      u_ItemCode: ['', Validators.required],
      u_ItemName: [{ value: '', disabled: true }],
      u_CardCode: [{ value: '', disabled: true }],
      u_CardName: [{ value: '', disabled: true }],
    });

    this.modeloFormDatPrd = this.fb.group({
      u_PrdStrDate: [null, Validators.required],
      u_PrdEndDate: [null, Validators.required],
      u_PrdEndHour: [null, Validators.required],
      u_RollWeight: [this.utilService.onRedondearDecimalConCero(this.rollWeight, 3)],
      u_PrdForDetail: [''],
      u_PrdPresBale: [''],
    });

    this.modeloFormFacPrd = this.fb.group({
      u_PrdFeaYes: [''],
      u_PrdFeaNo: [''],
      u_PrdFeaObs: [''],
    });

    this.modeloFormFacCal = this.fb.group({
      u_FeaQuaInd: [''],
      u_FeaQuaJus: [''],
    });

    this.modeloFormCostDet = this.fb.group({
      u_CosStrDate: [null],
      u_CosEndDate: [null],
      u_CosEndHour: [null],
      u_CosDetail: [''],
    });

    this.addLine();
  }

  onBuildColumn() {
    this.columns = [
      { field: 'u_processName', header: 'PROCESO' },
      { field: 'u_Percentage1', header: '% DE SCRAP' },
      { field: 'u_ItemCode', header: 'CÓDIGO' },
      { field: 'u_ItemName', header: 'DESCRIPCIÓN' },
      { field: 'u_Percentage2', header: 'PORCENTAJE' },
    ];
  }

  opcionesTabla() {
    this.opciones =
      [
        { label: 'Añadir línea', icon: 'pi pi-pencil', command: () => { this.onClickAddLine(); } },
        { label: 'Borrar línea', icon: 'pi pi-times', command: () => { this.onClickDelete(); } }
      ];
  }

  onSelectedItem(modelo: ISKP1) {
    this.detalleSelected = modelo;
    const anadirLineaOption = this.opciones.find(x => x.label === 'Añadir línea');
    if (anadirLineaOption) {
      anadirLineaOption.visible = this.detalle.every(x => x.u_ItemCode !== '');
    }

    const borrarLineaOption = this.opciones.find(x => x.label === 'Borrar línea');
    if (borrarLineaOption) {
      borrarLineaOption.visible = this.detalle.length > 0;
    }
  }

  onSelectedSKC(value: any) {
    this.number = value.u_Number;
    this.modeloFormDatCom.patchValue({ u_Number: value.u_Number, u_ItemName: value.u_ItemName, u_CardCode: value.u_CardCode, u_CardName: value.u_CardName });
  }

  private formatNumericFormControl(controlName: string, precision: number = 3) {
    const control = this.modeloFormDatPrd.get(controlName);
    if (control) {
      const formattedValue = this.utilService.onRedondearDecimalConCero(Number(control.value) || 0, precision);
      control.setValue(formattedValue, { emitEvent: false });
    }
  }

  blurRollWeight() { this.formatNumericFormControl('u_RollWeight'); }

  //#region <<< DETALLE >>>
  onOpenProceso(index: number) {
    this.indexProceso = index;
    this.isVisualizarProceso = !this.isVisualizarProceso;
  }

  onSelectedProceso(value: any) {
    this.detalle[this.indexProceso].u_ProcessCode = value.code;
    this.detalle[this.indexProceso].u_ProcessName = value.name;
    this.isVisualizarProceso = !this.isVisualizarProceso;
  }

  onClickCloseProceso() {
    this.isVisualizarProceso = !this.isVisualizarProceso;
  }

  onOpenArticulo(index: number) {
    this.indexArticulo = index;
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  onSelectedArticulo(value: any) {
    this.detalle[this.indexArticulo].u_ItemCode = value.itemCode;
    this.detalle[this.indexArticulo].u_ItemName = value.itemName;
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  onClickCloseArticulo() {
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  addLine() {
    this.detalle.push({ lineId: 0, u_ProcessCode: '', u_ProcessName: '', u_Percentage1: 0, u_ItemCode: '', u_ItemName: '', u_Percentage2: 0 });
  }

  onClickAddLine() {
    this.addLine();
  }

  onClickDelete() {
    const index = this.detalle.indexOf(this.detalleSelected);
    this.detalle.splice(index, 1);
    if (this.detalle.length === 0) {
      this.addLine();
    }
  }
  //#endregion


  //#region <<< SAVE >>>
  onValidatedSave() {
    const { u_Number, u_ItemCode } = this.modeloFormDatCom.getRawValue();

    if (!u_Number) {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Seleccione el SKU comercial.');
      return false;
    }

    if (!u_ItemCode) {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('Ingrese el código de artículo.');
      return false;
    }

    for (const [index, detailLine] of this.detalle.entries()) {
      if (!detailLine.u_ProcessCode) {
        this.isSaving = false;
        this.swaCustomService.swaMsgInfo(`Seleccione el <b>proceso</b>. Línea: ${index + 1}`);
        return false;
      }
      if (detailLine.u_Percentage1 === 0) {
        this.isSaving = false;
        this.swaCustomService.swaMsgInfo(`Ingrese el <b>porcentaje de Scrap</b>. Línea: ${index + 1}`);
        return false;
      }

      if (!detailLine.u_ItemCode) {
        this.isSaving = false;
        this.swaCustomService.swaMsgInfo(`Seleccione el <b>producto</b>. Línea: ${index + 1}`);
        return false;
      }

      if (detailLine.u_Percentage2 === 0) {
        this.isSaving = false;
        this.swaCustomService.swaMsgInfo(`Ingrese el <b>porcentaje</b>. Línea: ${index + 1}`);
        return false;
      }
    }

    return true;
  }

    save() {
    this.isSaving = true;
    if (!this.onValidatedSave()) { return; }

    const formValues = {
      ...this.modeloFormDatCom.getRawValue(),
      ...this.modeloFormDatPrd.getRawValue(),
      ...this.modeloFormFacPrd.getRawValue(),
      ...this.modeloFormFacCal.getRawValue(),
      ...this.modeloFormCostDet.getRawValue()
    };

    this.modeloSave = {
      ...formValues,
      u_PrdStrDate: new Date(formValues.u_PrdStrDate),
      u_PrdEndDate: new Date(formValues.u_PrdEndDate),
      u_PrdEndHour: this.datePipe.transform(formValues.u_PrdEndHour, 'yyyy-MM-ddTHH:mm:ss'),
      u_CosStrDate: formValues.u_CosStrDate ? new Date(formValues.u_CosStrDate) : null,
      u_CosEndDate: formValues.u_CosEndDate ? new Date(formValues.u_CosEndDate) : null,
      u_CosEndHour: this.datePipe.transform(formValues.u_CosEndHour, 'yyyy-MM-ddTHH:mm:ss'),
      line: this.detalle.map(({ u_ProcessCode, u_Percentage1, u_ItemCode, u_Percentage2 }) => ({
        u_ProcessCode,
        u_Percentage1,
        u_ItemCode,
        u_Percentage2
      }))
    };

    this.oSKPService.setCreate(this.modeloSave).pipe(
      finalize(() => { this.isSaving = false; })
    ).subscribe({
      next: () => {
        this.swaCustomService.swaMsgExito(null);
        this.onClickBack();
      },
      error:(e)=>{
        if (e.error?.errors) {
          const allErrors = Object.values(e.error.errors).flat();
          this.swaCustomService.swaMsgError(allErrors.length > 0 ? allErrors.join('<br>') : (e.error.title || 'Ocurrió un error de validación.'));
        } else {
          this.swaCustomService.swaMsgError(e.error?.resultadoDescripcion || 'Ocurrió un error inesperado.');
        }
      }
    });
  }

  onClickSave() {
    this.swaCustomService.swaConfirmation(
      this.globalConstants.titleGrabar,
      this.globalConstants.subTitleGrabar,
      this.globalConstants.icoSwalQuestion
    ).then((result) => {
      if (result.isConfirmed) {
        this.save();
      }
    });
  }
  //#endregion


  onClickBack() {
    this.router.navigate(['/main/modulo-inv/panel-sku-produccion-list']);
  }
}
