import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ProcesoFindModel } from 'src/app/modulos/modulo-inventario/models/proceso.model';

import { IProceso } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/proceso.interface';

import { ProcesoService } from 'src/app/modulos/modulo-inventario/services/proceso.service';



@Component({
  selector: 'app-busqueda-proceso',
  templateUrl: './busqueda-proceso.component.html'
})
export class BusquedaProcesoComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: IProceso[] = [];
  params: ProcesoFindModel = new ProcesoFindModel();

  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IProceso>();
  @Output() eventoCancelar = new EventEmitter<IProceso>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private procesoService: ProcesoService,
  ) { }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'name' : new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'code', header: 'Código' },
      { field: 'name', header: 'Nombre' }
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
    this.procesoService.getListByFiltro(this.params)
    .subscribe({next:(data: IProceso[]) =>{
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

  onToSelected(value: IProceso) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'name': ''
    });
    this.list = [];
  }
}
