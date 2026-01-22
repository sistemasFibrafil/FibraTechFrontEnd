import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IArticulo } from 'src/app/modulos/modulo-inventario/interfaces/articulo.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { ArticuloService } from 'src/app/modulos/modulo-inventario/services/articulo.service';



@Component({
  selector: 'app-modal-articulo',
  templateUrl: './modal-articulo.component.html'
})
export class ModalArticuloComponent implements OnInit, OnChanges {
  modeloFormVisor: FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;
  isVisualizar: Boolean = false;

  columnas: any[];
  list: IArticulo[] = [];
  params: FilterRequestModel = new FilterRequestModel();

  @Input() invntItem: string;
  @Input() sellItem: string;
  @Input() prchseItem: string;
  @Input() itemCode: string;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IArticulo>();
  @Output() eventoCancelar = new EventEmitter<IArticulo>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private ArticuloService: ArticuloService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
    if (this.itemCode === undefined || this.itemCode === null || this.itemCode.trim() === '') {
      return;
    }

    this.modeloFormVisor.patchValue({
      'itemCode': this.itemCode
    });

    this.modeloFormBusqueda.patchValue({
      'text1': ''
    });
  }

  ngOnInit(): void {
    this.buildFormVisor();
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormVisor() {
    this.modeloFormVisor = this.fb.group({
      'itemCode' : new FormControl({ value: '', disabled: true }),
    });
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'text1': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'itemCode', header: 'Código' },
      { field: 'itemName', header: 'Nombre' },
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
    this.ArticuloService.getListByFilter(this.params)
    .subscribe({next:(data: IArticulo[]) =>{
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

  onToSelected(value: IArticulo) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'itemCode': value.itemCode
    });
    this.isVisualizar = false;
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'text1': ''
    });
    this.list = [];
  }

  onClickClose()
  {
    this.setClearFiltro();
    this.isVisualizar = false;
  }
}
