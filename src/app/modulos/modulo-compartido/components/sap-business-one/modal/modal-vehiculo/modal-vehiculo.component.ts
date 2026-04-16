import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';

import { IVehicles } from 'src/app/modulos/modulo-socios-negocios/interfaces/vehicles.interface';

import { VehiclesService } from 'src/app/modulos/modulo-socios-negocios/services/vehicles.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-modal-vehiculo',
  templateUrl: './modal-vehiculo.component.html'
})
export class ModalVehiculoComponent implements OnInit, OnChanges {
  modeloFormVisor             : FormGroup;
  modeloFormBusqueda          : FormGroup;
  globalConstants             : GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay                   : Boolean = false;
  isVisualizar                : Boolean = false;

  columnas                    : any[];
  modelo                      : IVehicles[] = [];

  @Input() u_FIB_COTR         : string;
  @Input() u_BPP_VEPL         : string;
  @Input() isHabilitaControl  : boolean;
  @Input() isHabilitarButton  : boolean;
  @Input() isVisibleLimpiar   : boolean = false;

  @Output() eventoAceptar     = new EventEmitter<IVehicles>();
  @Output() eventoCancelar    = new EventEmitter<IVehicles>();
  @Output() eventoLimpiar     = new EventEmitter<boolean>();

  constructor
  (
    private router: Router,
    private readonly fb: FormBuilder,
    private vehiclesService: VehiclesService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
    if (!this.modeloFormVisor || !this.modeloFormBusqueda) {
    return;
    }

    // limpiar campos
    this.modeloFormVisor.patchValue({ u_BPP_VEPL: '' });
    this.modeloFormBusqueda.patchValue({ searchText: '' });

    if (!this.u_FIB_COTR?.trim()) {
      return;
    }

    if (!this.u_BPP_VEPL?.trim()) {
      return;
    }

    this.modeloFormVisor.patchValue({
      'u_BPP_VEPL': this.u_BPP_VEPL
    });

    this.modeloFormBusqueda.patchValue({
      'searchText': ''
    });
  }

  ngOnInit(): void {
    this.buildFormVisor();
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormVisor() {
    this.modeloFormVisor = this.fb.group({
      'u_BPP_VEPL' : new FormControl({ value: '', disabled: false }),
    });
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'searchText': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'u_BPP_VEPL',    header: 'Placa' },
      { field: 'u_BPP_VEMA',    header: 'Marca' },
      { field: 'u_BPP_VEMO',    header: 'Modelo' },
    ];
  }

  private buildFilterParams(): any {
    const {
      searchText
    } = this.modeloFormBusqueda.getRawValue();

    return {
      u_FIB_COTR: this.u_FIB_COTR,
      searchText
    };
  }

  onToBuscar() {
    this.isDisplay = true;
    this.modelo = [];
    this.vehiclesService.getListByFilter(this.buildFilterParams())
    .subscribe({next:(data: IVehicles[]) =>{
        this.isDisplay = false;
        this.modelo = data;
      },error:(e)=>{
        this.modelo = [];
        this.isDisplay = false;
        let swalWithBootstrapButtons = Swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
        swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
      }
    });
  }

  onToSelected(value: IVehicles) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'u_BPP_VEPL': value.u_BPP_VEPL
    });
    this.isVisualizar = false;
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'searchText': ''
    });
    this.modelo = [];
  }

  onClickNew()
  {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/main/modulo-soc/panel-vehiculo', this.u_FIB_COTR]));
    window.open(url, '_blank');
  }

  onClickClose()
  {
    this.setClearFiltro();
    this.isVisualizar = false;
  }
}
