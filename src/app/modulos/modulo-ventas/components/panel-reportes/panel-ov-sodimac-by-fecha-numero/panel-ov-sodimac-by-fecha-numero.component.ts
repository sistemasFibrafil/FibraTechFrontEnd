import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { finalize, Subject, takeUntil } from 'rxjs';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { ButtonAcces } from 'src/app/models/acceso-button.model';

import { OrdenVentaSodimacService } from '../../../services/web/orden-venta-sodimac.service';
import { IOrdenVentaSodimacGeneralQuery } from '../../../interfaces/web/orden-venta-sodimac.interface';

import { UtilService } from 'src/app/services/util.service';
import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';



@Component({
  selector: 'app-ven-panel-ov-sodimac-by-fecha-numero',
  templateUrl: './panel-ov-sodimac-by-fecha-numero.component.html',
  styleUrls: ['./panel-ov-sodimac-by-fecha-numero.component.css']
})
export class PanelOrdenVentaSodimacByFechaNumeroComponent implements OnInit {
  private readonly destroy$                     = new Subject<void>();
  modeloForm: FormGroup;

  // Titulo del componente
  titulo = 'Despacho de Sodimac';
  subtitulo = 'Despacho de Sodimac';
  // Acceso de botones
  buttonAcces: ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants: GlobalsConstantsForm = new GlobalsConstantsForm();

  // Opcion Buscar
  isDisplay: boolean = false;

  columnas: any[];
  listTipo: SelectItem[];
  modelo: IOrdenVentaSodimacGeneralQuery[];

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Reporte - Despacho de Sodimac -';

  // Paginación de la tabla
  rows                                          = 20;
  rowsPerPageOptions                            = [20, 40, 60, 80, 100];

  constructor
  (
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private readonly ordenVentaSodimacService: OrdenVentaSodimacService,
    public  readonly utilService: UtilService,
  ) {}

  ngOnInit() {
    this.modeloForm = this.fb.group({
      startDate : [new Date(), Validators.required],
      endDate   : [new Date(), Validators.required],
      tipo      : ['', Validators.required],
      searchText: ['']
    });

    this.columnas = [
      { field: 'numOrdenCompra',    header: 'Número OC' },
      { field: 'taxDate',           header: 'Fecha esperada' },
      { field: 'docDueDate',        header: 'Fecha vencimiento' },
      { field: 'ean',               header: 'UPC' },
      { field: 'sku',               header: 'Sku' },
      { field: 'dscription',        header: 'Descripción' },
      { field: 'dscriptionLarga',   header: 'Descripción larga' },
      { field: 'nomLocal',          header: 'Local' },
      { field: 'quantity',          header: 'Cantidad' },
      { field: 'lpn',               header: 'CB' },
    ];

    this.getListTipo();

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-ov-sodimac-by-fecha-numero');
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  onToBuscar() {
    this.loadData();
  }

  getListTipo()
  {
    this.listTipo =
    [
      { label: 'Excuir oriente',    value: '01' },
      { label: 'Sólo oriente',      value: '02' },
    ];

    const item: any = this.listTipo.find(x=>x.value === '01');
    this.modeloForm.controls['tipo'].setValue({ label: item.label, value: item.value });
  }

  buildFilterParams(): any {
    const form = this.modeloForm.getRawValue();

    return {
      ...form,
      tipo: form.tipo?.value ?? ''
    };
  }

  loadData(): void {
    this.isDisplay = true;

    this.ordenVentaSodimacService
    .getListOrdenVentaSodimacByFechaNumero(this.buildFilterParams())
    .pipe(
      takeUntil(this.destroy$),
      finalize(() => {
        this.isDisplay = false;
      })
    )
    .subscribe({
      next: (data: IOrdenVentaSodimacGeneralQuery[]) => {
        this.modelo = data;
      },
      error: (e) => {
        this.utilService.handleErrorSingle(e, 'loadData', this.swaCustomService);
      }
    });
  }

  onToExcel() {
    this.isDisplay = true;
    this.ordenVentaSodimacService
    .getListOrdenVentaSodimacExcelByFechaNumero(this.buildFilterParams())
    .subscribe({next:(response: any) => {
        saveAs(
          new Blob([response],
          {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          }),
          this.nombreArchivo
        );
        this.isDisplay = false;
        this.swaCustomService.swaMsgExito(null);
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }
}
