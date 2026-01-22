import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ICampoDefnidoUsuario } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/general/campo-definido-usuario.interface';
import { CampoDefinidoUsuarioFilterModel } from 'src/app/modulos/modulo-gestion/models/sap/definiciones/general/campo-defnido-usuario.model';
import { CamposDefinidoUsuarioService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/general/campo-defnido-usuario.service';


@Component({
  selector: 'app-busqueda-campo-definido-usuario',
  templateUrl: './busqueda-campo-definido-usuario.component.html'
})
export class BusquedaCampoDefinidoUsuarioComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: ICampoDefnidoUsuario[] = [];

  @Input() title: string;
  @Input() tableID: string;
  @Input() aliasID: string;
  @Input() placeholder: string;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<ICampoDefnidoUsuario>();
  @Output() eventoCancelar = new EventEmitter<ICampoDefnidoUsuario>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private camposDefinidoUsuarioService: CamposDefinidoUsuarioService,
  ) { }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'userDefinedFields': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'fldValue',      header: 'Código' },
      { field: 'descr',         header: 'Nombre' },
    ];
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];

    const formValues = this.modeloFormBusqueda.getRawValue();

    const params: CampoDefinidoUsuarioFilterModel = {
      ... formValues,
      tableID: this.tableID,
      aliasID: this.aliasID,
    };

    this.camposDefinidoUsuarioService.getListByFilter(params)
    .subscribe({next:(data: ICampoDefnidoUsuario[]) =>{
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

  onToSelected(value: ICampoDefnidoUsuario) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'userDefinedFields': ''
    });
    this.list = [];
  }
}
