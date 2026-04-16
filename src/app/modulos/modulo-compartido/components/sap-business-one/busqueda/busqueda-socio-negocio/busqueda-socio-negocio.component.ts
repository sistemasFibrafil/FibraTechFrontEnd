import Swal from 'sweetalert2';
import { finalize } from 'rxjs';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IBusinessPartners, IBusinessPartnersQuery } from 'src/app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';
import { BusinessPartnersService } from 'src/app/modulos/modulo-socios-negocios/services/business-partners.service';



@Component({
  selector: 'app-busqueda-socio-negocio',
  templateUrl: './busqueda-socio-negocio.component.html'
})
export class BusquedaSocioNegocioComponent implements OnInit {
  modeloFormBusqueda: FormGroup;
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  isDisplay: Boolean = false;

  columnas: any[];
  list: IBusinessPartnersQuery[] = [];

  @Input() subTitle: string;
  @Input() cardType: string;
  @Input() transType: string;
  @Input() isHabilitaControl: boolean;
  @Input() isHabilitarButton: boolean;
  @Input() isVisibleLimpiar: boolean = false;

  @Output() eventoAceptar = new EventEmitter<IBusinessPartners>();
  @Output() eventoCancelar = new EventEmitter<IBusinessPartners>();
  @Output() eventoLimpiar = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private businessPartnersService: BusinessPartnersService
  ) { }

  ngOnInit(): void {
    this.buildFormBusqueda();
    this.onBuildColum();
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

    this.businessPartnersService
    .getListModalByFilter(params)
    .pipe(
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: IBusinessPartnersQuery[]) => {
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

  onToSelected(value: IBusinessPartners) {
    this.setClearFiltro();
    this.eventoAceptar.emit(value);
  }

  private setClearFiltro() {
    this.modeloFormBusqueda.patchValue({
      'businessPartner': ''
    });
    this.list = [];
  }
}
