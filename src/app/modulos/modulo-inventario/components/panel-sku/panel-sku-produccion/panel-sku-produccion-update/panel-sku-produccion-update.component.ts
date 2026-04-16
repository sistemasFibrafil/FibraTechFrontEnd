import { ActivatedRoute, Params, Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';

import { IOSKP, ISKP1 } from 'src/app/modulos/modulo-inventario/interfaces/oskp.interface';
import { OSKPUpdateModel } from 'src/app/modulos/modulo-inventario/models/oskp.model';
import { OSKPService } from 'src/app/modulos/modulo-inventario/services/oskp.service';
import { finalize, switchMap, take } from 'rxjs/operators';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-inv-panel-sku-produccion-update',
  templateUrl: './panel-sku-produccion-update.component.html',
  styleUrls: ['./panel-sku-produccion-update.component.css']
})
export class PanelSkuProduccionUpdateComponent implements OnInit {
  // Titulo del componente
  titulo                        = 'SKU producción';

  modeloFormDatCom              : FormGroup;
  modeloFormDatPrd              : FormGroup;
  modeloFormFacPrd              : FormGroup;
  modeloFormFacCal              : FormGroup;
  modeloFormCostDet             : FormGroup;
  globalConstants               : GlobalsConstantsForm = new GlobalsConstantsForm();

  // MODAL: Progreso
  isSaving                      : boolean = false;
  isDisplay                     : boolean = false;
  // MODAL: CLiente
  docEntry                      : number = 0;
  number                        : string = '';
  rollWeight                    : number = 0;

  // DETALLE
  columns                       : any[];
  opciones                      : any[];

  // MODAL: Artículo
  indexArticulo                 : number = 0;
  indexProceso                  : number = 0;
  isVisualizarArticulo          : boolean = false;
  isVisualizarProceso           : boolean = false;

  modelo                        : IOSKP;
  detalle                       : ISKP1[] = [];
  detalleSelected               : ISKP1;
  modeloSave                    : OSKPUpdateModel = new OSKPUpdateModel();

  constructor
  (
    private router                    : Router,
    private fb                        : FormBuilder,
    public app                        : LayoutComponent,
    private datePipe                  : DatePipe,
    private readonly route            : ActivatedRoute,
    public readonly utilService       : UtilService,
    private readonly swaCustomService : SwaCustomService,
    private oSKPService               : OSKPService,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
    this.opcionesTabla();

    this.route.params.pipe(
      take(1),
      switchMap((params: Params) => {
        this.docEntry = params['id'];
        this.isDisplay = true;
        return this.oSKPService.getByDocEntry(this.docEntry);
      })
    ).subscribe({
      next: (data: IOSKP) => {
        this.modelo = data;
        this.set(this.modelo);
        this.isDisplay = false;
      },
      error: (e) => {
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onBuildForm() {
    this.modeloFormDatCom = this.fb.group({
      u_Number: [{ value: '', disabled: true }],
      u_ItemCode: [{ value: '', disabled: true }],
      u_ItemName: [{ value: '', disabled: true }],
      u_CardCode: [{ value: '', disabled: true }],
      u_CardName: [{ value: '', disabled: true }],
    });

    this.modeloFormDatPrd = this.fb.group({
      u_PrdStrDate: [null, Validators.required],
      u_PrdEndDate: [null, Validators.required],
      u_PrdEndHour: [null, Validators.required],
      u_RollWeight: ['0'],
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
    this.columns =
    [
      { field: 'u_processName',     header: 'PROCESO' },
      { field: 'u_Porcentaje1',     header: '% DE SCRAP' },
      { field: 'u_ItemCode',        header: 'CÓDIGO' },
      { field: 'u_ItemName',        header: 'DESCRIPCIÓN' },
      { field: 'u_Porcentaje2',     header: 'PORCENTAJE' },
    ];
  }

  opcionesTabla() {
    this.opciones = [
      { label: 'Añadir línea',      icon: 'pi pi-pencil',      command: () => { this.onClickAddLine() } },
      { label: 'Borrar línea',      icon: 'pi pi-times',       command: () => { this.onClickDelete() } },
    ];
  }

  onSelectedItem(modelo: ISKP1) {
    this.detalleSelected = modelo;
    const anadirLineaOption = this.opciones.find(x => x.label === 'Añadir línea');
    if (anadirLineaOption) {
      anadirLineaOption.visible = this.detalle.every(x => x.u_ProcessCode !== '');
    }

    const borrarLineaOption = this.opciones.find(x => x.label === 'Borrar línea');
    if (borrarLineaOption) {
      borrarLineaOption.visible = this.detalle.length > 0;
    }
  }

  onSelectedSKC(value: any) {
    this.number = value.u_Number;
    this.modeloFormDatCom.patchValue({ 'u_Number': value.u_Number, 'u_ItemName': value.u_ItemName, 'u_CardCode': value.u_CardCode, 'u_CardName': value.u_CardName });
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

  onClickCloseProceso()
  {
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

  onClickCloseArticulo()
  {
    this.isVisualizarArticulo = !this.isVisualizarArticulo;
  }

  addLine()
  {
    this.detalle.push({lineId: 0, u_ProcessCode: '', u_ProcessName: '', u_Percentage1: 0 , u_ItemCode: '', u_ItemName: '', u_Percentage2: 0 });
  }

  onClickAddLine()
  {
    this.addLine();
  }

  onClickDelete()
  {
    let index = this.detalle.indexOf(this.detalleSelected);
    this.detalle.splice(+index, 1);
    if(this.detalle.length === 0) this.addLine();
  }
  //#endregion


  set(value: IOSKP) {
    this.number = value.u_Number;

    this.modeloFormDatCom.patchValue(value);

    this.modeloFormDatPrd.patchValue({
      u_PrdStrDate: value.u_PrdStrDate ? new Date(value.u_PrdStrDate) : null,
      u_PrdEndDate: value.u_PrdEndDate ? new Date(value.u_PrdEndDate) : null,
      u_PrdEndHour: value.u_PrdEndHour ? new Date(value.u_PrdEndHour) : null,
      u_RollWeight: this.utilService.onRedondearDecimalConCero(value.u_RollWeight, 3),
      u_PrdForDetail: value.u_PrdForDetail,
      u_PrdPresBale: value.u_PrdPresBale
    });

    this.modeloFormFacPrd.patchValue(value);
    this.modeloFormFacCal.patchValue(value);

    this.modeloFormCostDet.patchValue({
      u_CosStrDate: value.u_CosStrDate ? new Date(value.u_CosStrDate) : null,
      u_CosEndDate: value.u_CosEndDate ? new Date(value.u_CosEndDate) : null,
      u_CosEndHour: value.u_CosEndHour ? new Date(value.u_CosEndHour) : null,
      u_CosDetail: value.u_CosDetail
    });

    this.detalle = value.line;
  }



  //#region <<< SAVE >>>
  onValidatedSave(){
    const number = this.modeloFormDatCom.controls['u_Number'].value;
    const itemCode = this.modeloFormDatCom.controls['u_ItemCode'].value;

    if(number === "")
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('El SKU prodcción no tiene el N° Correlativo.');
      return false;
    }

    if(itemCode === "")
    {
      this.isSaving = false;
      this.swaCustomService.swaMsgInfo('El código de artículo está vacío.');
      return false;
    }

    for (const [index, detailLine] of this.detalle.entries()) {
      if(detailLine.u_ProcessCode === "")
      {
        this.isSaving = false;
        this.swaCustomService.swaMsgInfo('Seleccione el <b>proceso</b> en la pestaña <b>Datos de producción</b>. Línea: ' + (index + 1).toString());
        return false;
      }
      if(detailLine.u_Percentage1 === 0)
      {
        this.isSaving = false;
        this.swaCustomService.swaMsgInfo('Ingrese el <b>porcentaje</b> de proceso en la pestaña <b>Datos de producción</b>. Línea: ' + (index + 1).toString());
        return false;
      }
    }

    return true;
  }

  save() {
    this.isSaving = true;
    if(!this.onValidatedSave()) return;

    const formValues = {
      ...this.modeloFormDatCom.getRawValue(),
      ...this.modeloFormDatPrd.getRawValue(),
      ...this.modeloFormFacPrd.getRawValue(),
      ...this.modeloFormFacCal.getRawValue(),
      ...this.modeloFormCostDet.getRawValue()
    };

    this.modeloSave = {
      docEntry: this.docEntry,
      ...formValues,
      u_PrdStrDate: new Date(formValues.u_PrdStrDate),
      u_PrdEndDate: new Date(formValues.u_PrdEndDate),
      u_PrdEndHour: this.datePipe.transform(formValues.u_PrdEndHour, 'yyyy-MM-ddTHH:mm:ss'),
      u_CosStrDate: formValues.u_CosStrDate ? new Date(formValues.u_CosStrDate) : null,
      u_CosEndDate: formValues.u_CosEndDate ? new Date(formValues.u_CosEndDate) : null,
      u_CosEndHour: this.datePipe.transform(formValues.u_CosEndHour, 'yyyy-MM-ddTHH:mm:ss'),
      line: this.detalle.map(({ lineId, u_ProcessCode, u_Percentage1, u_ItemCode, u_Percentage2 }) => ({
        lineId,
        u_ProcessCode,
        u_Percentage1,
        u_ItemCode,
        u_Percentage2
      }))
    };
    
    this.oSKPService.setUpdate(this.modeloSave).pipe(
      finalize(() => {
        this.isSaving = false;
      })
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
