import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IUnidadMedida } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/unidad-medidad.interface';
import { IColorImpresion } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/color-impresion.interface';
import { ColorImpresionModel } from 'src/app/modulos/modulo-gestion/models/sap/definiciones/inventario/color-impresion.model';
import { ColorImpresionService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/color-impresion.service';



@Component({
  selector: 'app-busqueda-color-impresion',
  templateUrl: './busqueda-color-impresion.component.html'
})
export class BusquedaColorImpresionComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: IColorImpresion[] = [];
  params: ColorImpresionModel = new ColorImpresionModel();

  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IUnidadMedida>();
  @Output() eventoCancelar = new EventEmitter<IUnidadMedida>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private colorImpresionService: ColorImpresionService,
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
    this.colorImpresionService.getListByFiltro(this.params)
    .subscribe({next:(data: IColorImpresion[]) =>{
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

  onToSelected(value: IColorImpresion) {
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
