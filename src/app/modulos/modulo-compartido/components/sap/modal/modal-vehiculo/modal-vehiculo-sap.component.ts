import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IVehiculoSap } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/socio-negocios/vehiculo-sap.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { VehiculoSapService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/socio-negocios/vehiculo.service';



@Component({
  selector: 'app-modal-vehiculo-sap',
  templateUrl: './modal-vehiculo-sap.component.html'
})
export class ModalVehiculoSapComponent implements OnInit, OnChanges {
  modeloFormVisor: FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;
  isVisualizar: Boolean = false;

  columnas: any[];
  list: IVehiculoSap[] = [];
  params: FilterRequestModel = new FilterRequestModel();

  @Input() codTransportista: string;
  @Input() numPlaca: string;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IVehiculoSap>();
  @Output() eventoCancelar = new EventEmitter<IVehiculoSap>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private vehiculoSapService: VehiculoSapService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
    if (this.codTransportista === undefined || this.codTransportista === null || this.codTransportista.trim() === '') {
      return;
    }

    if (this.numPlaca === undefined || this.numPlaca === null || this.numPlaca.trim() === '') {
      return;
    }

    this.modeloFormVisor.patchValue({
      'numPlaca': this.numPlaca
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
      'numPlaca' : new FormControl({ value: '', disabled: true }),
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
      { field: 'numPlaca', header: 'Placa' },
      { field: 'marca', header: 'Marca' },
      { field: 'modelo', header: 'Modelo' },
    ];
  }

  getParams()
  {
    this.params = this.modeloFormBusqueda.getRawValue();
    this.params.cod1 = this.codTransportista;
  }

  onToBuscar() {
    debugger
    this.isDisplay = true;
    this.list = [];
    this.getParams();
    this.vehiculoSapService.getListByFiltro(this.params)
    .subscribe({next:(data: IVehiculoSap[]) =>{
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

  onToSelected(value: IVehiculoSap) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'numPlaca': value.numPlaca
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
