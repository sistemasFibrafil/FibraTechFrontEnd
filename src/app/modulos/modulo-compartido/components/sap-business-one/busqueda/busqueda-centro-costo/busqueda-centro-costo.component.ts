import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { CostCentersService } from 'src/app/modulos/modulo-finanzas/services/contabilidad-costos/cost-centers.service';
import { ICostCenters } from 'src/app/modulos/modulo-finanzas/interfaces/contabilidad-costos/cost-centers.interface';


@Component({
  selector: 'app-busqueda-centro-costo',
  templateUrl: './busqueda-centro-costo.component.html'
})
export class BusquedaCentroCostoComponent implements OnInit, OnChanges {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay : boolean = false;
  columnas  : any[];
  lista     : ICostCenters[] = [];

  @Input() active   : string;

  @Output() eventoAceptar = new EventEmitter<ICostCenters>();
  @Output() eventoCancelar = new EventEmitter<ICostCenters>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private costCentersService: CostCentersService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
  }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'costCenter': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'ocrCode', header: 'Código' },
      { field: 'ocrName', header: 'Nombre' }
    ];
  }

  onToBuscar() {
    this.isDisplay = true;
    this.lista = [];
    const formValue = this.modeloFormBusqueda.getRawValue();
    const params = {
      ...formValue,
      'active' : this.active
    };
    this.costCentersService.getListByFilter(params)
    .subscribe({next:(data: ICostCenters[]) =>{
        this.isDisplay = false;
        this.lista = data;
      },error:(e)=>{
        this.lista = [];
        this.isDisplay = false;
        let swalWithBootstrapButtons = Swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
        swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
      }
    });
  }

  onToSelected(value: ICostCenters) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'costCenter': ''
    });
    this.lista = [];
  }
}
