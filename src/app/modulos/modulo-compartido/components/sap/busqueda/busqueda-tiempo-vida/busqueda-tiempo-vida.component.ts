import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ITiempoVida } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/tiempo-vida.interface';
import { TiempoVidaService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/tiempo-vida.service';
import { TiempoVidaModel } from 'src/app/modulos/modulo-gestion/models/sap/definiciones/inventario/tiempo-vida.model';



@Component({
  selector: 'app-busqueda-tiempo-vida',
  templateUrl: './busqueda-tiempo-vida.component.html'
})
export class BusquedaTiempoVidaComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: ITiempoVida[] = [];
  params: TiempoVidaModel = new TiempoVidaModel();

  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<ITiempoVida>();
  @Output() eventoCancelar = new EventEmitter<ITiempoVida>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private tiempoVidaService: TiempoVidaService,
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
    this.tiempoVidaService.getListByFiltro(this.params)
    .subscribe({next:(data: ITiempoVida[]) =>{
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

  onToSelected(value: ITiempoVida) {
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
