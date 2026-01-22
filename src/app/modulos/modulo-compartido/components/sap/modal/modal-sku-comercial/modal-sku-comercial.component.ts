import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { OSKCService } from 'src/app/modulos/modulo-inventario/services/oskc.service';
import { OSKCFindByFiltroModel } from 'src/app/modulos/modulo-inventario/models/oskc.model';
import { IOSKC } from 'src/app/modulos/modulo-inventario/interfaces/oskc.interface';



@Component({
  selector: 'app-modal-sku-comercial',
  templateUrl: './modal-sku-comercial.component.html'
})
export class ModalSkuComercialComponent implements OnInit, OnChanges {
  modeloFormVisor: FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;
  isVisualizar: Boolean = false;

  columnas: any[];
  list: IOSKC[] = [];
  params: OSKCFindByFiltroModel = new OSKCFindByFiltroModel();

  @Input() u_Number: string;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IOSKC>();
  @Output() eventoCancelar = new EventEmitter<IOSKC>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private oSKCService: OSKCService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
    if (this.u_Number === undefined || this.u_Number === null || this.u_Number.trim() === '') {
      return;
    }

    this.modeloFormVisor.patchValue({
      'u_Number': this.u_Number
    });

    this.modeloFormBusqueda.patchValue({
      'filtro': ''
    });
  }

  ngOnInit(): void {
    this.buildFormVisor();
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormVisor() {
    this.modeloFormVisor = this.fb.group({
      'u_Number': new FormControl({ value: '', disabled: true }),
    });
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'filtro': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'u_Number',    header: 'Número' },
      { field: 'u_ItemName',  header: 'Descripción de SKU' },
      { field: 'u_CardName',  header: 'Cliente' },
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
    this.oSKCService.getListByFiltro(this.params)
    .subscribe({next:(data: IOSKC[]) =>{
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

  onToSelected(value: IOSKC) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'u_Number': value.u_Number
    });
    this.isVisualizar = false;
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'filtro': ''
    });
    this.list = [];
  }

  onClickClose()
  {
    this.setClearFiltro();
    this.isVisualizar = false;
  }
}
