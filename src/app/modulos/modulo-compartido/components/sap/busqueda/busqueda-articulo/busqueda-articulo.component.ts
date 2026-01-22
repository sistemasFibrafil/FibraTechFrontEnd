import swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/articulo.interface';
import { ArticuloService } from 'src/app/modulos/modulo-inventario/services/articulo.service';



@Component({
  selector: 'app-busqueda-articulo',
  templateUrl: './busqueda-articulo.component.html'
})
export class BusquedaArticuloComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: IArticulo[] = [];
  params: any;

  @Input() invntItem: string;
  @Input() sellItem: string;
  @Input() prchseItem: string;

  @Output() eventoAceptar = new EventEmitter<IArticulo>();
  @Output() eventoCancelar = new EventEmitter<IArticulo>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private articuloService: ArticuloService
  ) { }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'item' : new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'itemCode',    header: 'Código' },
      { field: 'itemName',    header: 'Descripción' },
      { field: 'onHand',      header: 'Stock' },
      { field: 'frozenFor',   header: 'Activo' },
    ];
  }

  getParams()
  {
    this.params = this.modeloFormBusqueda.getRawValue();
    this.params.invntItem   = this.invntItem  === undefined ? '' : this.invntItem;
    this.params.sellItem    = this.sellItem   === undefined ? '' : this.sellItem;
    this.params.prchseItem  = this.prchseItem === undefined ? '' : this.prchseItem;
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];
    this.getParams();
    this.articuloService.getListByFilter(this.params)
    .subscribe({next:(data: IArticulo[]) =>{
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

  onToSelected(value: IArticulo) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'item': ''
    });
    this.list = [];
  }
}
