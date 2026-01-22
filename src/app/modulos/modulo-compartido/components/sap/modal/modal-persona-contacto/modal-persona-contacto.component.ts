import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';

import { FilterRequestModel } from 'src/app/models/filter-request.model';

import { IPersonaContactoSap } from 'src/app/modulos/modulo-socios-negocios/interfaces/persona-contacto.interface';

import { PersonaContactoSapService } from 'src/app/modulos/modulo-socios-negocios/services/persona-contacto.service';


@Component({
  selector: 'app-modal-persona-contacto',
  templateUrl: './modal-persona-contacto.component.html'
})
export class ModalPersonaContactoComponent implements OnInit, OnChanges {
  modeloFormVisor: FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;
  isVisualizar: Boolean = false;

  columnas: any[];
  list: IPersonaContactoSap[] = [];
  params: FilterRequestModel = new FilterRequestModel();

  @Input() cardCode: string;
  @Input() cntctCode: number;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IPersonaContactoSap>();
  @Output() eventoCancelar = new EventEmitter<IPersonaContactoSap>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private personaContactoSapService: PersonaContactoSapService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
    if(this.modeloFormVisor !== undefined)
    {
      this.modeloFormVisor.patchValue({
        'name': ''
      });
    }
    if(this.modeloFormBusqueda !== undefined)
    {
      this.modeloFormBusqueda.patchValue({
        'text1': ''
      });
    }

    if (this.cardCode === undefined || this.cardCode === null || this.cardCode.trim() === '') {
      return;
    }

    if (this.cntctCode === undefined || this.cntctCode === null || this.cntctCode === 0) {
      return;
    }

    this.getByCode();
  }

  ngOnInit(): void {
    this.buildFormVisor();
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormVisor() {
    this.modeloFormVisor = this.fb.group({
      'name' : new FormControl({ value: '', disabled: false }),
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
      { field: 'name', header: 'Código' },
      { field: 'fullName', header: 'Nombre' },
    ];
  }

  getParams()
  {
    this.params = this.modeloFormBusqueda.getRawValue();
    this.params.id1 = this.cntctCode;
    this.params.cod1 = this.cardCode;
  }

  onToBuscar() {
    this.isDisplay = true;
    this.list = [];
    this.getParams();
    this.personaContactoSapService.getListByFiltro(this.params)
    .subscribe({next:(data: IPersonaContactoSap[]) =>{
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

  getByCode() {
    this.getParams();
    this.personaContactoSapService.getById(this.params)
    .subscribe({next:(value: IPersonaContactoSap) =>{
        this.modeloFormVisor.patchValue({
          'name': value.name
        });
        this.eventoAceptar.emit(value);
      },error:(e)=>{
        let swalWithBootstrapButtons = Swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
        swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
      }
    });
  }

  onToSelected(value: IPersonaContactoSap) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'name': value.name
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
