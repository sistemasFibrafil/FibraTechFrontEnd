import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IConductorSap } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/socio-negocios/conductor-sap.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { ConductorSapService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/socio-negocios/conductor.service';



@Component({
  selector: 'app-modal-conductor',
  templateUrl: './modal-conductor.component.html'
})
export class ModalConductorComponent implements OnInit {
  modeloFormVisor: FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;
  isVisualizar: Boolean = false;

  columnas: any[];
  list: IConductorSap[] = [];
  params: FilterRequestModel = new FilterRequestModel();

  @Input() codTransportista: string;
  @Input() numDocIdeConductor: string;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IConductorSap>();
  @Output() eventoCancelar = new EventEmitter<IConductorSap>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private conductorSapService: ConductorSapService,
  ) { }

  ngOnInit(): void {
    this.buildFormVisor();
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormVisor() {
    this.modeloFormVisor = this.fb.group({
      'numDocIdeConductor' : new FormControl({ value: '', disabled: true }),
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
      { field: 'numDocIdeConductor', header: 'Documento' },
      { field: 'denConductor', header: 'Nombre' },
      { field: 'licConductor', header: 'Licencia' },
    ];
  }

  getParams()
  {
    this.params = this.modeloFormBusqueda.getRawValue();
    this.params.cod1 = this.codTransportista;
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];
    this.getParams();
    this.conductorSapService.getListByFiltro(this.params)
    .subscribe({next:(data: IConductorSap[]) =>{
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

  onToSelected(value: IConductorSap) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'numDocIdeConductor': value.numDocIdeConductor
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
