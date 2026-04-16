import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';

import { IContactEmployees } from 'src/app/modulos/modulo-socios-negocios/interfaces/contact-employees.interface';

import { ContactEmployeesService } from 'src/app/modulos/modulo-socios-negocios/services/contact-employees.service';


@Component({
  selector: 'app-modal-usuario',
  templateUrl: './modal-usuario.component.html'
})
export class ModalUsuarioComponent implements OnInit, OnChanges {
  modeloFormVisor             : FormGroup;
  modeloFormBusqueda          : FormGroup;
  globalConstants             : GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay                   : boolean = false;
  isVisualizar                : boolean = false;

  columnas                    : any[];
  modelo                       : IContactEmployees[] = [];

  @Input() cntctCode          : number;
  @Input() isHabilitaControl  : boolean;
  @Input() isHabilitarButton  : boolean;
  @Input() isVisibleLimpiar   : boolean = false;

  @Output() eventoAceptar     = new EventEmitter<IContactEmployees>();
  @Output() eventoCancelar    = new EventEmitter<IContactEmployees>();
  @Output() eventoLimpiar     = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private readonly contactEmployeesService: ContactEmployeesService
  ) {
    this.buildFormVisor();
    this.buildFormBusqueda();
  }

  ngOnChanges(changes: SimpleChanges): void{
    if (!this.modeloFormVisor || !this.modeloFormBusqueda) {
    return;
    }

    // limpiar campos
    this.modeloFormVisor.patchValue({ name: '' });
    this.modeloFormBusqueda.patchValue({ text1: '' });

    if (!this.cntctCode || this.cntctCode === 0) {
      return;
    }

    this.getByCode();
  }

  ngOnInit(): void {
    this.onBuildColum();
  }

  private buildFormVisor() {
    this.modeloFormVisor = this.fb.group({
      'name' : new FormControl({ value: '', disabled: false }),
    });
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'searchText': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'name', header: 'Código' },
      { field: 'fullName', header: 'Nombre' },
    ];
  }

  private buildFilterParams(): any {
    const {
      searchText
    } = this.modeloFormBusqueda.getRawValue();

    return {
      cntctCode : this.cntctCode || 0,
      searchText
    };
  }

  onToBuscar(): void {
    this.isDisplay = true;
    this.modelo = [];

    this.contactEmployeesService.getListByFilter(this.buildFilterParams())
    .pipe(
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: IContactEmployees[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.modelo = [];
        const swal = Swal.mixin({customClass: { container: 'my-swal' }, target: document.getElementById('modal')});
        swal.fire(this.globalConstants.msgInfoSummary, e.error?.resultadoDescripcion ?? 'Ocurrió un error inesperado', 'error');
      }
    });
  }

  getByCode(): void {
    this.contactEmployeesService.getById(this.buildFilterParams())
    .subscribe({
      next: (value: IContactEmployees) => {
        if (!value) return;

        this.modeloFormVisor.patchValue({
          name: value.name
        });

        this.eventoAceptar.emit(value);
      },
      error: (e) => {
        const swal = Swal.mixin({customClass: { container: 'my-swal' }, target: document.getElementById('modal')});
        swal.fire(this.globalConstants.msgInfoSummary, e.error?.resultadoDescripcion ?? 'Ocurrió un error inesperado', 'error');
      }
    });
  }

  onToSelected(value: IContactEmployees) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'name': value.name
    });
    this.isVisualizar = false;
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'searchText': ''
    });
    this.modelo = [];
  }

  onClickClose()
  {
    this.setClearFiltro();
    this.isVisualizar = false;
  }
}
