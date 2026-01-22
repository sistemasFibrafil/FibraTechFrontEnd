import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { INumeracionDocumentoSunat } from 'src/app/modulos/modulo-gestion/interfaces/sap/inicializacion-sistema/numeracion-documento-sunat.interface';
import { NumeracionDocumentoSunatService } from 'src/app/modulos/modulo-gestion/services/sap/inicializacion-sistema/numeracion-documento-sunat.service';



@Component({
  selector: 'app-modal-serie-documento',
  templateUrl: './modal-serie-documento.component.html'
})
export class ModalSerieDocumentoComponent implements OnInit, OnChanges {
  modeloFormVisor   : FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants   : GlobalsConstantsForm = new GlobalsConstantsForm();
  isDisplay         : Boolean = false;
  isVisualizar      : Boolean = false;
  columnas          : any[];
  list              : INumeracionDocumentoSunat[] = [];

  @Input() u_BPP_NDTD: string;
  @Input() u_BPP_NDSD: string;
  @Input() u_FIB_TDED: string;
  @Input() u_FIB_TDTD: string;
  @Input() u_FIB_SEDE: number;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<INumeracionDocumentoSunat>();
  @Output() eventoCancelar = new EventEmitter<INumeracionDocumentoSunat>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private numeracionDocumentoSunatService: NumeracionDocumentoSunatService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
    if(this.modeloFormVisor !== undefined)
    {
      this.modeloFormVisor.patchValue({
        'u_BPP_NDSD': ''
      });
    }
    if(this.modeloFormBusqueda !== undefined)
    {
      this.modeloFormBusqueda.patchValue({
        'u_BPP_NDCD': ''
      });
    }

    if (this.u_BPP_NDSD !== undefined || this.u_BPP_NDSD !== null || this.u_BPP_NDSD !== '') {
      if(this.modeloFormVisor !== undefined)
      {
        this.modeloFormVisor.patchValue({
          'u_BPP_NDSD': this.u_BPP_NDSD
        });
      }
    }
  }

  ngOnInit(): void {
    this.buildFormVisor();
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormVisor() {
    this.modeloFormVisor = this.fb.group({
      'u_BPP_NDSD' : new FormControl({ value: '', disabled: false }),
    });
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'u_BPP_NDCD' : new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'u_BPP_NDTD', header: 'Tipo' },
      { field: 'u_BPP_NDSD', header: 'Serie' },
      { field: 'u_BPP_NDCD', header: 'Número' },
    ];
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];
    const params = {
      ...this.modeloFormBusqueda.getRawValue(),
      u_BPP_NDTD  : this.u_BPP_NDTD,
      u_FIB_TDED  : this.u_FIB_TDED,
      u_FIB_TDTD  : this.u_FIB_TDTD,
      u_FIB_SEDE  : this.u_FIB_SEDE
    }
    this.numeracionDocumentoSunatService.getListSerieDocumento(params)
    .subscribe({next:(data: INumeracionDocumentoSunat[]) =>{
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

  onToSelected(value: INumeracionDocumentoSunat) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'u_BPP_NDSD': value.u_BPP_NDSD
    });
    this.isVisualizar = false;
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'u_BPP_NDCD': ''
    });
    this.list = [];
  }

  onVisible()
  {
    this.isVisualizar = true;
  }

  onHide()
  {
    this.onClickClose();
  }

  onClickClose()
  {
    this.setClearFiltro();
    this.isVisualizar = false;
  }
}
