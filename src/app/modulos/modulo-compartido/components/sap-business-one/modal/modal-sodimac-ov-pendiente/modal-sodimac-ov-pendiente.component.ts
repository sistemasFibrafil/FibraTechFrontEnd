import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';

import { FilterRequestModel } from 'src/app/models/filter-request.model';

import { IOrdersSodimacPendiente } from 'src/app/modulos/modulo-ventas/interfaces/sap-business-one/orders.interface';

import { OrdersService } from 'src/app/modulos/modulo-ventas/services/sap-business-one/orders.service';



@Component({
  selector: 'app-modal-sodimac-ov-pendiente-sap',
  templateUrl: './modal-sodimac-ov-pendiente.component.html'
})
export class ModalSodimacOvPendienteSapComponent implements OnInit, OnChanges {
  modeloFormVisor: FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;
  isVisualizar: Boolean = false;

  columnas: any[];
  list: IOrdersSodimacPendiente[] = [];
  params: FilterRequestModel = new FilterRequestModel();

  @Input() doEntry: number;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean = false;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IOrdersSodimacPendiente>();
  @Output() eventoCancelar = new EventEmitter<IOrdersSodimacPendiente>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private ordersService: OrdersService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.doEntry === undefined || this.doEntry === null || this.doEntry === 0) {
      return;
    }

    this.modeloFormVisor.patchValue({
      'docNum': ''
    });

    this.modeloFormBusqueda.patchValue({
      'text1': ''
    });

    this.getById(this.doEntry);
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
      { field: 'docNum',          header: 'Número' },
      { field: 'numOrdenCompra',  header: 'OC' },
      { field: 'cardCode',        header: 'Código de cliente' },
      { field: 'cardName',        header: 'Nombre de cliente' },
    ];
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];
    this.params = this.modeloFormBusqueda.getRawValue();
    this.ordersService.getListOrdenVentaSodimacPendienteByFiltro(this.params)
    .subscribe({next:(data: IOrdersSodimacPendiente[]) =>{
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

  getById(docEntry: number) {
    this.ordersService.getOrdenVentaSodimacPendienteByDocEntry(docEntry)
    .subscribe({next:(value: IOrdersSodimacPendiente) =>{
        this.modeloFormVisor.patchValue({
          'docNum': value.docNum
        });
        this.eventoAceptar.emit(value);
      },error:(e)=>{
        let swalWithBootstrapButtons = Swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
        swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
      }
    });
  }

  onToSelected(value: IOrdersSodimacPendiente) {
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
