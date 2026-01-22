import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IOrdenVentaSodimacConsulta } from 'src/app/modulos/modulo-ventas/interfaces/web/orden-venta-sodimac.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { OrdenVentaSodimacService } from 'src/app/modulos/modulo-ventas/services/web/orden-venta-sodimac.service';



@Component({
  selector: 'app-modal-sodimac-ov-pendiente',
  templateUrl: './modal-sodimac-ov-pendiente.component.html'
})
export class ModalSodimacOvPendienteComponent implements OnInit, OnChanges {
  modeloFormVisor: FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;
  isVisualizar: Boolean = false;

  columnas: any[];
  list: IOrdenVentaSodimacConsulta[] = [];
  params: FilterRequestModel = new FilterRequestModel();

  @Input() doEntry: number;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IOrdenVentaSodimacConsulta>();
  @Output() eventoCancelar = new EventEmitter<IOrdenVentaSodimacConsulta>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private ordenVentaSodimacService: OrdenVentaSodimacService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
    this.modeloFormVisor.patchValue({
      'docNum': ''
    });

    this.modeloFormBusqueda.patchValue({
      'text1': ''
    });
  }

  ngOnInit(): void {
    this.buildFormVisor();
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormVisor() {
    this.modeloFormVisor = this.fb.group({
      'docNum' : new FormControl({ value: '', disabled: true }),
    });
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'text1': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'docNum',            header: 'Número' },
      { field: 'numOrdenCompra',    header: 'OC' },
      { field: 'cardCode',          header: 'Código de cliente' },
      { field: 'cardName',          header: 'Nombre de cliente' },
    ];
  }

  getParams()
  {
    this.params = this.modeloFormBusqueda.getRawValue();
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];
    this.getParams();
    this.ordenVentaSodimacService.getListOrdenVentaSodimacPendienteLpnByFiltro(this.params)
    .subscribe({next:(data: IOrdenVentaSodimacConsulta[]) =>{
        this.isDisplay = false;
        this.list = data;
      },error:(e)=>{
        this.list = [];
        this.isDisplay = false;
        let swalWithBootstrapButtons = Swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
        swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
      }
    });
  }

  onToRowSelected(value: IOrdenVentaSodimacConsulta) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'docNum': value.docNum
    });
    this.isVisualizar = false;
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'text1': ''
    });
    this.list = [];
  }

  onClickClose()
  {
    this.setClearFiltro();
    this.isVisualizar = false;
  }
}
