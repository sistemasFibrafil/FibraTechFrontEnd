import swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/items.interface';

import { ItemsService } from 'src/app/modulos/modulo-inventario/services/items.service';


@Component({
  selector: 'app-busqueda-articulo',
  templateUrl: './busqueda-articulo.component.html'
})
export class BusquedaArticuloComponent implements OnInit {
  modeloForm                : FormGroup;

  globalConstants           : GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay                 : boolean = false;

  columnas                  : any[];

  modelo                    : IArticulo[] = [];
  modeloOriginal            : IArticulo[] = [];

  @Input() sellItem         : string;
  @Input() invntItem        : string;
  @Input() prchseItem       : string;

  @Output() eventoAceptar   = new EventEmitter<IArticulo>();
  @Output() eventoCancelar  = new EventEmitter<IArticulo>();

  @Output() eventoLimpiar   = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private itemsService: ItemsService
  ) { }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormBusqueda() {
    this.modeloForm = this.fb.group({
      'searchText' : new FormControl(''),
    });

    this.loadData();
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

  // Aplica filtro de texto en memoria sobre código o descripción
  onFiltroTexto(): void {
    const searchText = this.modeloForm.get('searchText')?.value?.trim();

    if (!searchText) {
      this.modelo = [...this.modeloOriginal];
      return;
    }

    const regex = new RegExp(
      searchText.replace(/\s+/g, '.*'),
      'i'
    );

    this.modelo = this.modeloOriginal.filter(modelo =>
      regex.test(modelo.itemCode ?? '') ||
      regex.test(modelo.itemName ?? '')
    );
  }

  onClickBuscar() {
    this.loadData();
  }

  loadData(): void {
    this.isDisplay = true;
    this.modelo = [];
    this.modeloOriginal = [];

    this.itemsService
    .getListByFilter(this.buildFilterParams())
    .subscribe({
      next: (data: IArticulo[]) => {
        this.modeloOriginal = data ?? [];
        this.modelo = [...this.modeloOriginal];
        this.isDisplay = false;
      },
      error: (e) => {
        this.modelo = [];
        this.modeloOriginal = [];
        this.isDisplay = false;

        const swalWithBootstrapButtons = swal.mixin({customClass: { container: 'my-swal' }, target: document.getElementById('modal')});
        swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, e?.error?.resultadoDescripcion ?? 'Ocurrió un error al obtener la información.', 'error');
      }
    });
  }

  private buildFilterParams(): any {
    this.modeloForm.patchValue({
      searchText: ''
    });

    return {
      item: '',
      invntItem: this.invntItem ?? '',
      sellItem: this.sellItem ?? '',
      prchseItem: this.prchseItem ?? ''
    };
  }

  getActive(modelo: IArticulo) {
    return modelo.frozenFor === 'N'
      ? { text: 'Sí', class: 'item-active-si' }
      : { text: 'No', class: 'item-active-no' };
  }

  onToSelected(value: IArticulo) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloForm.patchValue({
      'searchText': ''
    });
    this.modelo = [];
  }
}
