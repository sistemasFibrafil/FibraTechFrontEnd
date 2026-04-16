import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import {  IOperationType } from 'src/app/modulos/modulo-gestion/interfaces/sap-business-one/definiciones/general/operation-type.interface';
import { OperationTypeService } from 'src/app/modulos/modulo-gestion/services/sap-business-one/definiciones/general/operation-type.service';




@Component({
  selector: 'app-busqueda-tipo-operacion',
  templateUrl: './busqueda-tipo-operacion.component.html'
})
export class BusquedaTipoOperacionComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list:  IOperationType[] = [];

  @Input() title: string;
  @Input() nomTabla: string;
  @Input() nomCampo: string;
  @Input() fldValue: string;
  @Input() placeholder: string;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter< IOperationType>();
  @Output() eventoCancelar = new EventEmitter< IOperationType>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private operationTypeService: OperationTypeService
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

    this.operationTypeService.getListByFilter(params)
    .subscribe({next:(data:  IOperationType[]) =>{
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

  onToSelected(value:  IOperationType) {
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
