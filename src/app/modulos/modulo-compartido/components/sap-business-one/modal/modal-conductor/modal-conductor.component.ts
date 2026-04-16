import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';

import { IDrivers } from 'src/app/modulos/modulo-socios-negocios/interfaces/drivers.interface';

import { DriversService } from 'src/app/modulos/modulo-socios-negocios/services/drivers.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-modal-conductor',
  templateUrl: './modal-conductor.component.html'
})
export class ModalConductorComponent implements OnInit {
  modeloFormVisor             : FormGroup;
  modeloFormBusqueda          : FormGroup;
  globalConstants             : GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay                   : boolean = false;
  isVisualizar                : boolean = false;

  columnas                    : any[];
  modelo                      : IDrivers[] = [];

  @Input() u_FIB_COTR         : string;
  @Input() u_FIB_CHND         : string;
  @Input() isHabilitaControl  : boolean;
  @Input() isHabilitarButton  : boolean;
  @Input() isVisibleLimpiar   : boolean = false;

  @Output() eventoAceptar     = new EventEmitter<IDrivers>();
  @Output() eventoCancelar    = new EventEmitter<IDrivers>();
  @Output() eventoLimpiar     = new EventEmitter<boolean>();

  constructor
  (
    private router: Router,
    private readonly fb: FormBuilder,
    private driversService: DriversService,
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
      if (!this.modeloFormVisor || !this.modeloFormBusqueda) {
      return;
      }

      // limpiar campos
      this.modeloFormVisor.patchValue({ u_FIB_CHND: '' });
      this.modeloFormBusqueda.patchValue({ searchText: '' });

      if (!this.u_FIB_COTR?.trim()) {
        return;
      }

      if (!this.u_FIB_CHND?.trim()) {
        return;
      }

      this.modeloFormVisor.patchValue({
        'u_FIB_CHND': this.u_FIB_CHND
      });

      this.modeloFormBusqueda.patchValue({
        'searchText': ''
      });
    }

  ngOnInit(): void {
    this.buildFormVisor();
    this.buildFormBusqueda();
    this.onBuildColum();
  }

  private buildFormVisor() {
    this.modeloFormVisor = this.fb.group({
      'u_FIB_CHND' : new FormControl({ value: '', disabled: false }),
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
      { field: 'u_BPP_CHNO', header: 'Nombre' },
      { field: 'u_FIB_CHAP', header: 'Apellido' },
      { field: 'u_FIB_CHND', header: 'Número de documento' },
      { field: 'u_BPP_CHLI', header: 'Licencia' },
    ];
  }

  private buildFilterParams(): any {
    const {
      searchText
    } = this.modeloFormBusqueda.getRawValue();

    return {
      u_FIB_COTR: this.u_FIB_COTR,
      searchText
    };
  }

  onToBuscar() {
    this.isDisplay = true;
    this.modelo = [];
    this.driversService.getListByFilter(this.buildFilterParams())
    .subscribe({next:(data: IDrivers[]) =>{
      this.isDisplay = false;
      this.modelo = data;
      },error:(e)=>{
        this.modelo = [];
        this.isDisplay = false;
        let swalWithBootstrapButtons = Swal.mixin({ customClass: { container: 'my-swal' }, target: document.getElementById('modal') });
        swalWithBootstrapButtons.fire(this.globalConstants.msgInfoSummary, e.error.resultadoDescripcion, 'error');
      }
    });
  }

  onToSelected(value: IDrivers) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'u_FIB_CHND': value.u_FIB_CHND
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

  onClickNew()
  {
    const url = this.router.serializeUrl(this.router.createUrlTree(['/main/modulo-soc/panel-conductor', this.u_FIB_COTR]));
    window.open(url, '_blank');
  }

  onClickClose()
  {
    this.setClearFiltro();
    this.isVisualizar = false;
  }
}
