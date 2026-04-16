import { forkJoin, of } from 'rxjs';
import { SelectItem } from 'primeng/api';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { catchError, finalize, map } from 'rxjs/operators';
import { LayoutComponent } from 'src/app/layout/layout.component';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { OSKCCreateModel } from 'src/app/modulos/modulo-inventario/models/oskc.model';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { UserContextService } from 'src/app/services/user-context.service';
import { OSKCService } from 'src/app/modulos/modulo-inventario/services/oskc.service';
import { TiempoVidaService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/tiempo-vida.service';
import { SalesPersonsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/sales-persons.service';
import { TipoLaminadoService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/tipo-unidad.service';
import { UnidadMedidaService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/unidad-medida.service';
import { LongitudAnchoService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/longitud-ancho.service';
import { ColorImpresionService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/color-impresion.service';
import { GrupoItemsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/grupo-articulo-sap.service';
import { SubGrupoItemsService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/sub-grupo-articulo-sap.service';


interface Valor {
  code  : string,
  name  : string
}

@Component({
  selector: 'app-inv-panel-sku-comercial-create',
  templateUrl: './panel-sku-comercial-create.component.html',
  styleUrls: ['./panel-sku-comercial-create.component.css']
})
export class PanelSkuComercialCreateComponent implements OnInit {
  titulo                        = 'SKU comercial';
  modeloForm                    : FormGroup;
  globalConstants               : GlobalsConstantsForm = new GlobalsConstantsForm();

  isSaving                      : boolean = false;
  isDisplay                     : boolean = false;

  itemCode                      : string = '';
  cardCode                      : string = '';

  valor                         : Valor[];
  valorList                     : SelectItem[];
  oSlpList                      : SelectItem[];
  statusList                    : SelectItem[];
  grupoList                     : SelectItem[];
  subGrupoList                  : SelectItem[];
  unidadMedidaList              : SelectItem[];
  largoAnchoList                : SelectItem[];
  colorList                     : SelectItem[];
  tipoLaminadoList              : SelectItem[];
  colorImpresionList            : SelectItem[];
  tiempoVidaList                : SelectItem[];
  modeloSave                    : OSKCCreateModel = new OSKCCreateModel();

  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    private userContextService: UserContextService,
    public readonly utilService: UtilService,
    private readonly swaCustomService: SwaCustomService,
    private oSKCService: OSKCService,
    private tiempoVidaService: TiempoVidaService,
    private tipoLaminadoService: TipoLaminadoService,
    private unidadMedidaService: UnidadMedidaService,
    private salesPersonsService: SalesPersonsService,
    private grupoItemsService: GrupoItemsService,
    private longitudAnchoService: LongitudAnchoService,
    private colorImpresionService: ColorImpresionService,
    private subGrupoItemsService: SubGrupoItemsService
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.initBliur();
    this.initDefaultValues();
    this.loadInitialData();
  }

  onBuildForm() {
    this.modeloForm = this.fb.group({
      u_Number        : [{ value: '', disabled: false }, [Validators.required, Validators.maxLength(15), Validators.minLength(15)]],
      u_SlpCode       : ['',  Validators.required],
      u_Status        : [{ value: '', disabled: true }, Validators.required],
      u_DocDate       : [{ value: new Date(), disabled: true }, Validators.required],
      u_CardCode      : ['',  Validators.required],
      u_CardName      : [{ value: '', disabled: true }, Validators.required],
      u_ItemCodeBase  : [{ value: '', disabled: true }],
      u_ItemNameBase  : [{ value: '', disabled: true }],
      u_ItmsGrpCod    : ['',  Validators.required],
      u_ItmsSGrpCod   : ['',  Validators.required],
      u_ItemName      : ['',  Validators.required],
      u_Quantity      : ['0', [Validators.required, Validators.min(0.001)]],
      u_UnitMsrCode   : ['',  Validators.required],
      u_Wide          : ['0', Validators.required],
      u_UnitCode      : ['',  Validators.required],
      u_Long          : ['0', Validators.required],
      u_GrMtSq        : ['0', Validators.required],
      u_ItemWeight    : ['0', Validators.required],
      u_ColorCode     : ['',  Validators.required],
      u_Laminate      : ['',  Validators.required],
      u_LamTypCode    : [{ value: '', disabled: true }],
      u_Linner        : ['',  Validators.required],
      u_LinnWeight    : [{ value: '0', disabled: true }],
      u_Print         : ['',  Validators.required],
      u_PrintColCode  : [{ value: '', disabled: true }],
      u_Fuelle        : ['',  Validators.required],
      u_UvByMonCode   : ['',  Validators.required],
      u_PrjMonVol     : ['0', Validators.required],
      u_Price         : ['0', Validators.required],
      u_Observations  : [''],
    });
  }

  initDefaultValues() {
    this.valor = [ { code: 'Y', name: 'SI' }, { code: 'N', name: 'NO' } ];
    this.valorList = this.valor.map(item => ({ label: item.name, value: item.code }));

    const defaultValue = this.valorList.find(x => x.value === 'N');
    if (defaultValue) {
      this.modeloForm.patchValue({
        u_Laminate: defaultValue,
        u_Linner: defaultValue,
        u_Print: defaultValue,
        u_Fuelle: defaultValue
      });
    }
  }

  loadInitialData() {
    this.isDisplay = true;

    const sources = {
      oSlpList            : this.salesPersonsService.getList().pipe(map(data => data.map(item => ({ label: item.slpName, value: item.slpCode })))),
      //statusList          : this.camposDefinidoUsuarioService.getListByFiltro({ tableID: '@FIB_OSKC', aliasID: 'Status' }).pipe(map(data => data.map(item => ({ label: item.descr, value: item.fldValue })))),
      grupoList           : this.grupoItemsService.getList().pipe(map(data => data.map(item => ({ label: item.itmsGrpNam, value: item.itmsGrpCod })))),
      subGrupoList        : this.subGrupoItemsService.getList().pipe(map(data => data.map(item => ({ label: item.name, value: item.code })))),
      unidadMedidaList    : this.unidadMedidaService.getList().pipe(map(data => data.map(item => ({ label: item.name, value: item.code })))),
      largoAnchoList      : this.longitudAnchoService.getList().pipe(map(data => data.map(item => ({ label: item.unitName, value: item.unitCode })))),
      //colorList           : this.camposDefinidoUsuarioService.getListByFiltro({ tableID: 'OITM', aliasID: 'FIB_COLOR' }).pipe(map(data => data.map(item => ({ label: item.descr, value: item.fldValue })))),
      tipoLaminadoList    : this.tipoLaminadoService.getList().pipe(map(data => data.map(item => ({ label: item.name, value: item.code })))),
      colorImpresionList  : this.colorImpresionService.getList().pipe(map(data => data.map(item => ({ label: item.name, value: item.code })))),
      tiempoVidaList      : this.tiempoVidaService.getList().pipe(map(data => data.map(item => ({ label: item.name, value: item.code })))),
    };

    forkJoin(sources).pipe(
      catchError(err => {
        this.swaCustomService.swaMsgError(err.error?.resultadoDescripcion || 'Error al cargar datos iniciales.');
        return of(null);
      }),
      finalize(() => {
        this.isDisplay = false;
      })
    ).subscribe(results => {
      if (results) {
        Object.assign(this, results);
        const defaultStatus = this.statusList.find(x => x.value === '01');
        if (defaultStatus) {
          this.modeloForm.controls['u_Status'].setValue(defaultStatus);
        }
      }
    });
  }

  private formatNumericFormControl(controlName: string, precision: number) {
    const control = this.modeloForm.get(controlName);
    if (control) {
      const formattedValue = this.utilService.onRedondearDecimalConCero(Number(control.value) || 0, precision);
      control.setValue(formattedValue, { emitEvent: false });
    }
  }

  initBliur() {
    this.blurQuantity();
    this.blurWide();
    this.blurLong();
    this.blurGrMtSq();
    this.blurItemWeight();
    this.blurLinnWeight();
    this.blurPrjMonVol();
    this.blurPrice();
  }

  blurQuantity()    { this.formatNumericFormControl('u_Quantity', 3); }
  blurWide()        { this.formatNumericFormControl('u_Wide', 3); }
  blurLong()        { this.formatNumericFormControl('u_Long', 3); }
  blurGrMtSq()      { this.formatNumericFormControl('u_GrMtSq', 3); }
  blurItemWeight()  { this.formatNumericFormControl('u_ItemWeight', 3); }
  blurLinnWeight()  { this.formatNumericFormControl('u_LinnWeight', 3); }
  blurPrjMonVol()   { this.formatNumericFormControl('u_PrjMonVol', 3); }
  blurPrice()       { this.formatNumericFormControl('u_Price', 3); }

  onChangeLaminado(value: string) {
    const control = this.modeloForm.controls['u_LamTypCode'];
    if (value === 'N') {
      control.disable();
      control.setValue('');
    } else {
      control.enable();
    }
  }

  onChangeLinner(value: string) {
    const control = this.modeloForm.controls['u_LinnWeight'];
    if (value === 'N') {
      control.disable();
      control.setValue(this.utilService.onRedondearDecimalConCero(0, 3));
    } else {
      control.enable();
    }
  }

  onChangeImpresion(value: string) {
    const control = this.modeloForm.controls['u_PrintColCode'];
    if (value === 'N') {
      control.disable();
      control.setValue('');
    } else {
      control.enable();
    }
  }

  onSelectedSocioNegocio(value: any) {
    this.cardCode = value.cardCode;
    this.modeloForm.patchValue({ u_CardCode: value.cardCode, u_CardName: value.cardName });
  }

  onSelectedArticulo(value: any) {
    this.itemCode = value.itemCode;
    this.modeloForm.patchValue({ u_ItemCodeBase: value.itemCode, u_ItemNameBase: value.itemName, u_ItemName: value.itemName });
  }

  onValidatedSave(): boolean {
    const getControlValue = (name: string) => this.modeloForm.get(name)?.value?.value;

    if (getControlValue('u_Laminate') === 'Y' && !getControlValue('u_LamTypCode')) {
      this.swaCustomService.swaMsgInfo('Seleccione el tipo laminado.');
      return false;
    }

    if (getControlValue('u_Linner') === 'Y' && Number(this.modeloForm.get('u_LinnWeight')?.value) === 0) {
      this.swaCustomService.swaMsgInfo('Ingrese el peso linner.');
      return false;
    }

    if (getControlValue('u_Print') === 'Y' && !getControlValue('u_PrintColCode')) {
      this.swaCustomService.swaMsgInfo('Seleccione el color de impresión.');
      return false;
    }

    return true;
  }

  save() {
    if (!this.onValidatedSave()) return;

    this.isSaving = true;
    const formValues = this.modeloForm.getRawValue();

    this.modeloSave = {
      ...formValues,
      u_SlpCode       : formValues.u_SlpCode?.value,
      u_Status        : formValues.u_Status?.value,
      u_ItmsGrpCod    : formValues.u_ItmsGrpCod?.value,
      u_ItmsSGrpCod   : formValues.u_ItmsSGrpCod?.value,
      u_UnitMsrCode   : formValues.u_UnitMsrCode?.value,
      u_UnitCode      : formValues.u_UnitCode?.value,
      u_ColorCode     : formValues.u_ColorCode?.value,
      u_Laminate      : formValues.u_Laminate?.value,
      u_LamTypCode    : formValues.u_LamTypCode?.value,
      u_Linner        : formValues.u_Linner?.value,
      u_Print         : formValues.u_Print?.value,
      u_PrintColCode  : formValues.u_PrintColCode?.value,
      u_Fuelle        : formValues.u_Fuelle?.value,
      u_UvByMonCode   : formValues.u_UvByMonCode?.value,
    };



    this.oSKCService.setCreate(this.modeloSave).pipe(
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

  onClickBack() {
    this.router.navigate(['/main/modulo-inv/panel-sku-comercial-list']);
  }
}
