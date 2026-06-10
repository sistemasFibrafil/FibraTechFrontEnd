import swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IUbigeo } from '@app/modulos/modulo-socios-negocios/interfaces/ubigeo.interface';
import { UbigeoService } from '@app/modulos/modulo-socios-negocios/services/ubigeo.service';



@Component({
  selector: 'app-busqueda-ubigeo',
  templateUrl: './busqueda-ubigeo.component.html'
})
export class BusquedaUbigeoComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list    : IUbigeo[] = [];

  @Input() invntItem: string;
  @Input() sellItem: string;
  @Input() prchseItem: string;

  @Output() eventoAceptar = new EventEmitter<IUbigeo>();
  @Output() eventoCancelar = new EventEmitter<IUbigeo>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();


  constructor
  (
    private readonly fb: FormBuilder,
    private readonly ubigeoService: UbigeoService
  ) { }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'searchText': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'code',                header: 'Ubigeo' },
      { field: 'u_NomDistrito',       header: 'Distrito' },
      { field: 'u_NomProvincia',      header: 'Provincia' },
      { field: 'u_NomDepartamento',   header: 'Departamento' },
    ];
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];
    this.ubigeoService.getListByFilter(this.buildFilterParams())
    .subscribe({next:(data: IUbigeo[]) =>{
        this.isDisplay = false;
        this.list = data;
      },error:(e)=>{
        this.list = [];
        this.isDisplay = false;
        let swalWithBootstrapButtons = swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
        swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
      }
    });
  }

  private buildFilterParams(): any {
    const {
      searchText
    } = this.modeloFormBusqueda.getRawValue();

    return {
      searchText
    };
  }

  onToSelected(value: IUbigeo) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'searchText': ''
    });
    this.list = [];
  }
}
