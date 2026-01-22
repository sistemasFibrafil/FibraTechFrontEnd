import swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IImpuestoSap } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/finanzas/impuesto-sap.iterface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { ImpuestoSapService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/finanzas/impuesto-sap.service';



@Component({
  selector: 'app-busqueda-impuesto',
  templateUrl: './busqueda-impuesto.component.html'
})
export class BusquedaImpuestoComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: IImpuestoSap[] = [];
  params: FilterRequestModel = new FilterRequestModel();

  @Input() invntItem: string;
  @Input() sellItem: string;
  @Input() prchseItem: string;

  @Output() eventoAceptar = new EventEmitter<IImpuestoSap>();
  @Output() eventoCancelar = new EventEmitter<IImpuestoSap>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();


  constructor
  (
    private readonly fb: FormBuilder,
    private impuestoSapService: ImpuestoSapService
  ) { }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'text1': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'code',    header: 'Código' },
      { field: 'name',    header: 'Nombre' },
      { field: 'rate',    header: 'Tasa' }
    ];
  }

  getParams()
  {
    this.params = this.modeloFormBusqueda.getRawValue();
    this.params.cod1 = this.invntItem;
    this.params.cod2 = this.sellItem;
    this.params.cod3 = this.prchseItem;
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];
    this.getParams();
    this.impuestoSapService.getListByFilter(this.params)
    .subscribe({next:(data: IImpuestoSap[]) =>{
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

  onToSelected(value: IImpuestoSap) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'text1': ''
    });
    this.list = [];
  }
}
