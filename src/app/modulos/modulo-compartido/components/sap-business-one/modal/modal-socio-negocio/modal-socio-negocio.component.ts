import Swal from 'sweetalert2';
import { finalize } from 'rxjs/operators';
import { FormGroup, FormBuilder, FormControl } from '@angular/forms';
import { Component, EventEmitter, Input, OnInit, Output, OnChanges, SimpleChanges } from '@angular/core';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { IBusinessPartnersQuery } from 'src/app/modulos/modulo-socios-negocios/interfaces/business-partners.interface';

import { BusinessPartnersService } from 'src/app/modulos/modulo-socios-negocios/services/business-partners.service';


@Component({
  selector: 'app-modal-socio-negocio',
  templateUrl: './modal-socio-negocio.component.html'
})
export class ModalSocioNegocioComponent implements OnInit, OnChanges {
  modeloFormVisor             : FormGroup;
  modeloFormBusqueda          : FormGroup;

  globalConstants             : GlobalsConstantsForm = new GlobalsConstantsForm();

  isLocked                    : boolean = true;
  isDisplay                   : boolean = false;
  isVisualizar                : boolean = false;

  columnas                    : any[];

  modelo                       : IBusinessPartnersQuery[] = [];
  modeloOriginal               : IBusinessPartnersQuery[] = [];

  @Input() title              : string;
  @Input() cardCode           : string;
  @Input() cardType           : string;
  @Input() transType          : string;
  @Input() isVisibleLimpiar   : boolean = false;
  @Input() isHabilitarButton  : boolean = false;
  @Input() isHabilitaControl  : boolean = false;

  @Output() eventoAceptar     = new EventEmitter<IBusinessPartnersQuery>();
  @Output() eventoCancelar    = new EventEmitter<IBusinessPartnersQuery>();

  @Output() eventoLimpiar     = new EventEmitter<boolean>();

  constructor
  (
    private readonly fb: FormBuilder,
    private businessPartnersService: BusinessPartnersService
  ) {
    this.buildFormVisor();
    this.buildFormBusqueda();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.modeloFormVisor || !this.modeloFormBusqueda) {
      return;
    }

    if (changes['cardCode']) {
      this.modeloFormVisor.patchValue({
        cardCode: this.cardCode ?? ''
      }, { emitEvent: false });
    }

    this.modeloFormBusqueda.patchValue({
      businessPartner: ''
    }, { emitEvent: false });
  }

  onOpenModal(): void {
    this.isVisualizar = true;
    this.loadData();
  }

  ngOnInit(): void {
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

  // Aplica filtro de texto en memoria sobre código o descripción
  onFiltroTexto(): void {
    const searchText = this.modeloFormBusqueda.get('businessPartner')?.value?.trim();

    if (!searchText) {
      this.modelo = [...this.modeloOriginal];
      return;
    }

    const regex = new RegExp(
      searchText.replace(/\s+/g, '.*'),
      'i'
    );

    this.modelo = this.modeloOriginal.filter(modelo =>
      regex.test(modelo.cardCode ?? '') ||
      regex.test(modelo.cardName ?? '')
    );
  }

  onClickBuscar(): void {
    this.loadData();
  }

  loadData(): void {
    this.isDisplay = true;
    this.modelo = [];
    this.modeloOriginal = [];

    this.businessPartnersService
    .getListModalByFilter(this.buildFilterParams())
    .pipe(
      finalize(() => this.isDisplay = false)
    )
    .subscribe({
      next: (data: IBusinessPartnersQuery[]) => {
        this.modeloOriginal = data ?? [];
        this.modelo = [...this.modeloOriginal];
      },
      error: (e) => {
        this.modelo = [];
        this.modeloOriginal = [];
        this.showError(e);
      }
    });
  }

  private buildFilterParams(): any {
    this.modeloFormBusqueda.patchValue({
      businessPartner: ''
    });

    return {
      businessPartner: '',
      cardType: this.cardType ?? '',
      transType: this.transType ?? ''
    };
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

  onToSelected(value: IBusinessPartnersQuery) {
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
    this.modelo = [];
  }

  onClickNew(): void {
    const appBase = window.location.pathname.split('/')[1];

    const url = `${window.location.origin}/${appBase}/main/modulo-soc/panel-socio-negocio-create`;

    window.open(url, '_blank');
  }

  onClickClose()
  {
    this.setClearFiltro();
    this.isVisualizar = false;
  }
}
