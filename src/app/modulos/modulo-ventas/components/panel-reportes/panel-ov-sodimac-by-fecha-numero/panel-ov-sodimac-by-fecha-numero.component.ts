import { saveAs } from 'file-saver';
import { SelectItem } from 'primeng/api';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IOrdenVentaSodimacConsulta } from '../../../interfaces/web/orden-venta-sodimac.interface';
import { FilterRequestModel } from 'src/app/models/filter-request.model';
import { OrdenVentaSodimacService } from '../../../services/web/orden-venta-sodimac.service';



@Component({
  selector: 'app-ven-panel-ov-sodimac-by-fecha-numero',
  templateUrl: './panel-ov-sodimac-by-fecha-numero.component.html',
  styleUrls: ['./panel-ov-sodimac-by-fecha-numero.component.css']
})
export class PanelOrdenVentaSodimacByFechaNumeroComponent implements OnInit {
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
  reporteList: IOrdenVentaSodimacConsulta[];
  params: FilterRequestModel = new FilterRequestModel();

  fecha: string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo: string = 'Reporte - Despacho de Sodimac -';


  constructor
  (
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private ordenVentaSodimacService: OrdenVentaSodimacService
  ) {}

  ngOnInit() {
    this.modeloForm = this.fb.group(
    {
      'dat1'      : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'dat2'      : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'tipo'      : new FormControl('', Validators.compose([Validators.required])),
      'text1'     : new FormControl(''),
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

  onToBuscar() {
    this.onListar();
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

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
    if (this.modeloForm.controls['tipo'].value) {
      let itemTipo = this.modeloForm.controls['tipo'].value;
      this.params.cod1 = itemTipo.value;
    }
  }

  onListar() {
    this.isDisplay = true;
    this.reporteList = [];
    this.onSetParametro();
    this.ordenVentaSodimacService.getListOrdenVentaSodimacByFechaNumero(this.params)
    .subscribe({next:(data: IOrdenVentaSodimacConsulta[]) =>{
      if(data)
      {
        this.isDisplay = false;
        this.reporteList = data;
      }
      this.isDisplay = false;
      },error:(e)=>{
        this.isDisplay = false;
        this.swaCustomService.swaMsgError(e.error.resultadoDescripcion);
      }
    });
  }

  onToExcel() {
    this.isDisplay = true;
    this.onSetParametro();
    this.ordenVentaSodimacService.getListOrdenVentaSodimacExcelByFechaNumero(this.params)
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
