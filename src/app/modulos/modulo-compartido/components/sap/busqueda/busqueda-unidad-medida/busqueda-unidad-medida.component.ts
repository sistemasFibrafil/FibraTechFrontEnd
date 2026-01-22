import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { UnidadMedidaService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/unidad-medida.service';
import { IUnidadMedida } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/unidad-medidad.interface';
import { UnidadMedidaModel } from 'src/app/modulos/modulo-gestion/models/sap/definiciones/inventario/unidad-medida.model';



@Component({
  selector: 'app-busqueda-unidad-medida',
  templateUrl: './busqueda-unidad-medida.component.html'
})
export class BusquedaUnidadMedidaComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: IUnidadMedida[] = [];
  params: UnidadMedidaModel = new UnidadMedidaModel();

  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IUnidadMedida>();
  @Output() eventoCancelar = new EventEmitter<IUnidadMedida>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private unidadMedidaService: UnidadMedidaService,
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
    this.unidadMedidaService.getListByFiltro(this.params)
    .subscribe({next:(data: IUnidadMedida[]) =>{
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

  onToSelected(value: IUnidadMedida) {
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
