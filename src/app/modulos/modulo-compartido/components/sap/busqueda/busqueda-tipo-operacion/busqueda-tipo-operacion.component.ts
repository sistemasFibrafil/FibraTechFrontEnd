import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ITipoOperacion } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/tipo-operacion-interface';
import { TipoOperacionSapService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/tipo-operacion-sap.service';



@Component({
  selector: 'app-busqueda-tipo-operacion',
  templateUrl: './busqueda-tipo-operacion.component.html'
})
export class BusquedaTipoOperacionComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: ITipoOperacion[] = [];

  @Input() title: string;
  @Input() nomTabla: string;
  @Input() nomCampo: string;
  @Input() fldValue: string;
  @Input() placeholder: string;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<ITipoOperacion>();
  @Output() eventoCancelar = new EventEmitter<ITipoOperacion>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private tipoOperacionSapService: TipoOperacionSapService,
  ) { }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'tipoOperacion': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'code',      header: 'Código' },
      { field: 'U_descrp',  header: 'Nombre' },
    ];
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];

    const params = this.modeloFormBusqueda.getRawValue();

    this.tipoOperacionSapService.getListByFilter(params)
    .subscribe({next:(data: ITipoOperacion[]) =>{
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

  onToSelected(value: ITipoOperacion) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'tipoOperacion': ''
    });
    this.list = [];
  }
}
