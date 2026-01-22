import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ISubGrupoArticulo } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/grupo-articulo-sap.interface';
import { SubGrupoArticuloModel } from 'src/app/modulos/modulo-gestion/models/sap/definiciones/inventario/sub-grupo-articulo.model';
import { SubGrupoArticuloService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/sub-grupo-articulo-sap.service';



@Component({
  selector: 'app-busqueda-sub-grupo',
  templateUrl: './busqueda-sub-grupo.component.html'
})
export class BusquedaSubGrupoComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: ISubGrupoArticulo[] = [];
  params: SubGrupoArticuloModel = new SubGrupoArticuloModel();

  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<ISubGrupoArticulo>();
  @Output() eventoCancelar = new EventEmitter<ISubGrupoArticulo>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private subGrupoArticuloService: SubGrupoArticuloService,
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
    this.subGrupoArticuloService.getListByFiltro(this.params)
    .subscribe({next:(data: ISubGrupoArticulo[]) =>{
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

  onToSelected(value: ISubGrupoArticulo) {
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
