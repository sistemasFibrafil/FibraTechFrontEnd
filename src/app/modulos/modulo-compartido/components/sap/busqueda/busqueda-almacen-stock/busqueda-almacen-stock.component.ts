import Swal from 'sweetalert2';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IArticuloAlmacenSap } from 'src/app/modulos/modulo-gestion/interfaces/sap/definiciones/inventario/articulo-almacen-sap.interface';
import { WarehousesService } from 'src/app/modulos/modulo-gestion/services/sap/definiciones/inventario/warehouses.service';



@Component({
  selector: 'app-busqueda-almacen-by-articulo-stock',
  templateUrl: './busqueda-almacen-stock.component.html',
  styleUrls: ['./busqueda-almacen-stock.component.css']
})
export class BusquedaAlmacenStockComponent implements OnInit {
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  lista: IArticuloAlmacenSap[] = [];

  @Input() whsCode: string;
  @Input() itemCode: string;

  @Output() eventoAceptar = new EventEmitter<IArticuloAlmacenSap>();
  @Output() eventoCancelar = new EventEmitter<IArticuloAlmacenSap>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private warehousesService: WarehousesService
  ) { }

  ngOnInit(): void {
    this.onBuildColum();
    this.onListar();
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'whsCode',     header: 'Código' },
      { field: 'whsName',     header: 'Nombre' },
      { field: 'onHand',      header: 'Stock' },
      { field: 'isCommited',  header: 'Comprometido' },
      { field: 'onOrder',     header: 'Solicitado' },
      { field: 'available',   header: 'Disponible' },
    ];
  }

  onListar() {
    this.isDisplay = true;
    this.lista = [];
    const params: any = { itemCode: this.itemCode, inactive: 'N', whsCode: this.whsCode };
    this.warehousesService.getListByWhsCodeAndItemCode(params)
    .subscribe({next:(data: IArticuloAlmacenSap[]) =>{
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
}
