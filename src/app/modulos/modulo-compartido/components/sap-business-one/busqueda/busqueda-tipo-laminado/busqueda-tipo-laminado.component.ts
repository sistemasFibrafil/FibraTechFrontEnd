import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { ITipoLaminado } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/inventario/tipo-laminado.interface';
import { TipoLaminadoModel } from 'src/app/modulos/modulo-gestion/models/sap-business-one/definiciones/inventario/tipo-laminado.model';
import { TipoLaminadoService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/inventario/tipo-unidad.service';




@Component({
  selector: 'app-busqueda-tipo-laminado',
  templateUrl: './busqueda-tipo-laminado.component.html'
})
export class BusquedaTpoLaminadoComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: ITipoLaminado[] = [];
  params: TipoLaminadoModel = new TipoLaminadoModel();

  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<ITipoLaminado>();
  @Output() eventoCancelar = new EventEmitter<ITipoLaminado>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private tipoLaminadoService: TipoLaminadoService,
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
    this.tipoLaminadoService.getListByFiltro(this.params)
    .subscribe({next:(data: ITipoLaminado[]) =>{
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

  onToSelected(value: ITipoLaminado) {
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
