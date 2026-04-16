import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IChartOfAccounts } from 'src/app/modulos/modulo-finanzas/interfaces/chart-of-accounts.interface';
import { ChartOfAccountsService } from 'src/app/modulos/modulo-finanzas/services/chart-of-accounts.service';


@Component({
  selector: 'app-busqueda-cuenta-contable',
  templateUrl: './busqueda-cuenta-contable.component.html'
})
export class BusquedaCuentaContableComponent implements OnInit, OnChanges {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay             : boolean = false;
  columnas              : any[];
  lista                 : IChartOfAccounts[] = [];


  @Output() eventoAceptar = new EventEmitter<IChartOfAccounts>();
  @Output() eventoCancelar = new EventEmitter<IChartOfAccounts>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private chartOfAccountsService: ChartOfAccountsService,

  ) { }

  ngOnChanges(changes: SimpleChanges): void{
  }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'accountingAccount': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'formatCode',  header: 'Código' },
      { field: 'acctName',    header: 'Nombre' }
    ];
  }

  onToBuscar() {
    this.isDisplay = true;
    this.lista = [];
    const formValue = this.modeloFormBusqueda.getRawValue();
    const params = {
      ...formValue
    };
    this.chartOfAccountsService.getListByFilter(params)
    .subscribe({next:(data: IChartOfAccounts[]) =>{
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

  onToSelected(value: IChartOfAccounts) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'accountingAccount': ''
    });
    this.lista = [];
  }
}
