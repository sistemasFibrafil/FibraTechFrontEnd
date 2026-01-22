import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IWarehouses } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/warehouses.interface';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/warehouses.service';


@Component({
  selector: 'app-busqueda-almacen-by-articulo',
  templateUrl: './busqueda-almacen-by-articulo.component.html'
})
export class BusquedaAlmacenByArticuloComponent implements OnInit, OnChanges {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  lista: IWarehouses[] = [];


  @Input() itemCode   : string;
  @Input() inactive   : string;

  @Output() eventoAceptar = new EventEmitter<IWarehouses>();
  @Output() eventoCancelar = new EventEmitter<IWarehouses>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private warehousesService: WarehousesService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
  }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'Warehouse': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'whsCode', header: 'Código' },
      { field: 'whsName', header: 'Nombre' },
      { field: 'onHand', header: 'Stock' },
    ];
  }

  onToBuscar() {
    this.isDisplay = true;
    this.lista = [];
    const formValue = this.modeloFormBusqueda.getRawValue();
    const params = {
      ...formValue,
      itemCode: this.itemCode,
      inactive: this.inactive
    };
    this.warehousesService.getListByItem(params)
    .subscribe({next:(data: IWarehouses[]) =>{
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

  onToSelected(value: IWarehouses) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'Warehouse': ''
    });
    this.lista = [];
  }
}
