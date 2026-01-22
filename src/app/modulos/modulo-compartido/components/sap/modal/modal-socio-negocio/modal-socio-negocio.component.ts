import Swal from 'sweetalert2';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';

import { ISocioNegocio } from 'src/app/modulos/modulo-socios-negocios/interfaces/socio-segocio.interface';
import { SocioNegocioService } from 'src/app/modulos/modulo-socios-negocios/services/socio-negocios.service';
import { finalize } from 'rxjs';


@Component({
  selector: 'app-modal-socio-negocio',
  templateUrl: './modal-socio-negocio.component.html'
})
export class ModalSocioNegocioComponent implements OnInit, OnChanges {
  modeloFormVisor: FormGroup;
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;
  isVisualizar: Boolean = false;

  isLocked                                      : boolean = true;

  columnas: any[];
  list: ISocioNegocio[] = [];

  @Input() title: string;
  @Input() cardCode: string;
  @Input() cardType: string;
  @Input() transType: string;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<ISocioNegocio>();
  @Output() eventoCancelar = new EventEmitter<ISocioNegocio>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private socioNegocioService: SocioNegocioService
  ) { }

  ngOnChanges(changes: SimpleChanges): void{
    if (this.cardCode === undefined || this.cardCode === null || this.cardCode.trim() === '') {
      return;
    }

    this.modeloFormVisor.patchValue({
      'cardCode': this.cardCode
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
      'cardCode': new FormControl({ value: '', disabled: false }),
    });
  }

  private buildFormBusqueda() {
    this.modeloFormBusqueda = this.fb.group({
      'businessPartner': new FormControl(''),
    });
  }

  onBuildColum() {
    this.columnas =
    [
      { field: 'cardCode', header: 'Código' },
      { field: 'licTradNum', header: 'Número de documento' },
      { field: 'cardName', header: 'Nombre' },
    ];
  }

  onToBuscar(): void {
    this.isDisplay = true;
    this.list = [];

    const params = {
      ...this.modeloFormBusqueda.getRawValue(),
      cardType: this.cardType,
      transType: this.transType
    };

    this.socioNegocioService
    .getListByFilter(params)
    .pipe(
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: ISocioNegocio[]) => {
        this.list = data ?? [];
      },
      error: (e) => {
        this.list = [];
        this.showError(e);
      }
    });
  }

  private showError(e: any): void {
    const swal = Swal.mixin({
      customClass: { container: 'my-swal' },
      target: document.getElementById('modal')
    });

    swal.fire(
      this.globalConstants.msgInfoSummary,
      e?.error?.resultadoDescripcion ?? 'Error inesperado',
      'error'
    );
  }

  onToSelected(value: ISocioNegocio) {
    this.setClearFiltro();
    this.modeloFormVisor.patchValue({
      'cardCode': value.cardCode
    });
    this.isVisualizar = false;
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'businessPartner': ''
    });
    this.list = [];
  }

  onClickClose()
  {
    this.setClearFiltro();
    this.isVisualizar = false;
  }
}
