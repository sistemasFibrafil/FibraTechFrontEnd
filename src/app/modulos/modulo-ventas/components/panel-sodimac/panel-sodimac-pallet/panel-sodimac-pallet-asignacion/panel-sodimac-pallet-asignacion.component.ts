import swal from 'sweetalert2';
import { Router } from '@angular/router';
import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, FormControl, Validators } from '@angular/forms';

import { UtilService } from 'src/app/services/util.service';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { LayoutComponent } from 'src/app/layout/layout.component';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { OrdenVentaSodimacLpnUpdateModel } from 'src/app/modulos/modulo-ventas/models/web/orden-venta-sodimac.model';
import { IOrdenVentaSodimacGeneralQuery } from 'src/app/modulos/modulo-ventas/interfaces/web/orden-venta-sodimac.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { OrdenVentaSodimacService } from 'src/app/modulos/modulo-ventas/services/web/orden-venta-sodimac.service';



@Component({
  selector: 'app-ven-panel-sodimac-pallet-asignacion',
  templateUrl: './panel-sodimac-pallet-asignacion.component.html',
  styleUrls: ['./panel-sodimac-pallet-asignacion.component.css']
})
export class PanelSodimacPalletAsignacionComponent implements OnInit {

  // Titulo del componente
  titulo = 'Pallet';

  modeloForm: FormGroup;
  // modeloFormCab2: FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  docEntry: number = 0;
  numOrdenCompra: string = '';
  cntctCode: number = 0;
  modeloSave: OrdenVentaSodimacLpnUpdateModel = new OrdenVentaSodimacLpnUpdateModel();

  //MODAL:
  isVisualizarOrdenVenta: boolean = false;

  // MODAL: Progreso
  isDisplay: boolean = false;
  isSaving: boolean = false;
  isDeleting: boolean = false;

  // DETALLE
  columnas: any[];
  detail: IOrdenVentaSodimacGeneralQuery[] = [];

  // MODAL
  columnasModal: any[];
  selected: IOrdenVentaSodimacGeneralQuery[] = [];
  listModal: IOrdenVentaSodimacGeneralQuery[] = [];
  params: FilterRequestModel = new FilterRequestModel();


  constructor
  (
    private router: Router,
    private fb: FormBuilder,
    public app: LayoutComponent,
    public readonly utilService: UtilService,
    private readonly swaCustomService: SwaCustomService,
    private ordenVentaSodimacService: OrdenVentaSodimacService,
  ) {}

  ngOnInit() {
    this.onBuildForm();
    this.onBuildColumn();
  }

  onBuildForm() {
    this.modeloForm = this.fb.group(
    {
      'id'                : new FormControl('', Validators.compose([Validators.required])),
      'numOrdenCompra'    : new FormControl('', Validators.compose([Validators.required])),
    });

    this.modeloFormBusqueda = this.fb.group({
      'text1': new FormControl(''),
    });
  }

  onBuildColumn() {
    this.columnas =
    [
      { field: 'line2',               header: '#' },
      { field: 'sku',                 header: 'Sku' },
      { field: 'dscription',          header: 'Descripción' },
      { field: 'dscriptionLarga',     header: 'Descripción larga' },
      { field: 'nomLocal',            header: 'Local' },
      { field: 'ean',                 header: 'EAN' },
      { field: 'quantity',            header: 'Cantidad' }
    ];

    this.columnasModal =
    [
      { field: 'line2',               header: '#' },
      { field: 'sku',                 header: 'Sku' },
      { field: 'dscriptionLarga',     header: 'Descripción larga' },
      { field: 'nomLocal',            header: 'Local' },
      { field: 'quantity',            header: 'Cantidad' },
    ];
  }

  onToSelectedOrdenVenta(value: IOrdenVentaSodimacGeneralQuery)
  {
    this.modeloForm.patchValue({
      'id'              : value.id,
      'numOrdenCompra'  : value.numOrdenCompra
    });
  }

  onClickOpenOrdenVenta() {
    this.isVisualizarOrdenVenta = !this.isVisualizarOrdenVenta;
  }

  onToBuscar()
  {
    this.isDisplay = true;
    this.listModal = [];
    this.params = this.modeloFormBusqueda.getRawValue();
    this.params.id1 = this.modeloForm.controls['id'].value;
    this.ordenVentaSodimacService.getListOrdenVentaSodimacDetallePendienteLpnByIdAndFiltro(this.params)
    .subscribe({next:(data: IOrdenVentaSodimacGeneralQuery[]) =>{
        this.isDisplay = false;
        this.listModal = data;
      },error:(e)=>{
        this.listModal = [];
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onClickAceptOrdenVenta()
  {
    let existe = false;
    let line1: number = 0;
    let sku: string = '';
    let nomLocal: string = '';

    let swalWithBootstrapButtons = swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
    if(this.selected.length === 0)
    {
      swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, 'Seleccione al menos un artículo.', 'info');
      return;
    }

    this.selected.forEach(element => {
      const reg = this.detail.filter(x => x.line1 === element.line1 && x.numLocal === element.numLocal);

      if(reg.length > 0)
      {
        existe = true;
        line1 = element.line1;
        sku = element.sku;
        nomLocal = element.nomLocal;
        return;
      }
    });

    if(existe)
    {
      swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, 'El registro: Línea ' + line1.toString() + '. Sku ' + sku + '. Local ' + nomLocal + '. Existe.', 'info');
      return;
    }

    this.selected.forEach(element => {
      this.detail.push(element);
    });

    this.selected = [];
    this.listModal = [];
    this.onClickCloseOrdenVenta();
  }

  onToRowSelected(value: IOrdenVentaSodimacGeneralQuery)
  {
    let swalWithBootstrapButtons = swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });

    const reg = this.detail.filter(x => x.line1 === value.line1 && x.numLocal === value.numLocal);

    if(reg.length > 0)
    {
      swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, 'El registro: Línea ' + value.line1.toString() + '. Sku ' + value.sku + '. Local ' + value.nomLocal + '. Existe.', 'info');
      return;
    }

    this.detail.push(value)
    this.onClickCloseOrdenVenta();
  }

  onClickCloseOrdenVenta()
  {
    this.isVisualizarOrdenVenta = !this.isVisualizarOrdenVenta;
  }


  onToRowDelete(value: IOrdenVentaSodimacGeneralQuery, index: number)
  {
    this.detail.splice(index, 1);
  }

  onToSave() {
    this.isSaving = true;

    this.modeloSave.item = [];

    for (let index = 0; index < this.detail.length; index++) {
      this.modeloSave.item.push
        ({
          id            : this.detail[index].id,
          line2          : this.detail[index].line2,
          numLocal      : this.detail[index].numLocal,
        });
    }

    this.ordenVentaSodimacService.setLpnUpdate(this.modeloSave)
    .subscribe({ next: (data:any)=>{
        this.isSaving = false;
        this.swaCustomService.swaMsgExito(null);
        this.back();
      },
      error:(e)=>{
        this.isSaving = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
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
        this.onToSave();
      }
    });
  }

  back() {
    this.router.navigate(['/main/modulo-ven/panel-sodimac-pallet-list']);
  }
}
