import { saveAs } from 'file-saver';
import { Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ButtonAcces } from 'src/app/models/acceso-button.model';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';

import { GlobalsConstantsForm } from 'src/app/constants/globals-constants-form';

import { SwaCustomService } from 'src/app/services/swa-custom.service';
import { AccesoOpcionesService } from 'src/app/services/acceso-opciones.service';

import { IFacturaVentaByFecha } from 'src/app/modulos/modulo-ventas/interfaces/factura-venta.interface';
import { FacturaVentaService } from '../../../services/sap-business-one/factura-venta-sap.service';
import { FacturaVentaByFilterFindModel } from '../../../models/factura-venta.model';



@Component({
  selector: 'app-ven-panel-factura-venta-by-filter',
  templateUrl: './panel-factura-venta-by-filter.component.html',
  styleUrls: ['./panel-factura-venta-by-filter.component.css']
})
export class PanelFacturaVentaByFilterComponent implements OnInit {
  modeloForm      : FormGroup;
  // Titulo del componente
  titulo          = 'Facturas de Venta';
  subtitulo       = 'Facturas de Venta';
  // Acceso de botones
  buttonAcces     : ButtonAcces = new ButtonAcces();
  // Name de los botones de accion
  globalConstants : GlobalsConstantsForm = new GlobalsConstantsForm();
  // Opcion Buscar
  columnas        : any[];
  isDisplay       : boolean = false;
  reporteList     : IFacturaVentaByFecha[];
  params          : FacturaVentaByFilterFindModel = new FacturaVentaByFilterFindModel();
  fecha           : string = this.datePipe.transform(new Date(), 'dd-MM-yyyy');
  nombreArchivo   : string = 'Facturas de Venta -';

  constructor(
    private router: Router,
    private fb: FormBuilder,
    private datePipe: DatePipe,
    private readonly swaCustomService: SwaCustomService,
    private readonly accesoOpcionesService: AccesoOpcionesService,
    private facturaVentaService: FacturaVentaService) {}

  ngOnInit() {
    this.modeloForm = this.fb.group(
    {
      'startDate'    : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'endDate'      : new FormControl(new Date(new Date()), Validators.compose([Validators.required])),
      'customer'     : new FormControl(''),
    });

    this.columnas =
    [
      { field: 'cardName',            header: 'Nombre de Cliente' },
      { field: 'fecContabilizacion',  header: 'Fecha de Contabilización' },
      { field: 'fecVencimiento',      header: 'Fecha de Vencimiento' },
      { field: 'diaVencido',          header: 'Días Vencidas' },
      { field: 'numeroDocumento',     header: 'Número de Factura' },
      { field: 'nomVendedor',         header: 'Vendedor' },
      { field: 'codMoneda',           header: 'Moneda' },
      { field: 'total',               header: 'Total' },
      { field: 'cobrado',             header: 'Cobrado' },
      { field: 'saldo',               header: 'Saldo' },
    ];

    // Iniciamos el acceso a las opciones con la que cuenta el usuario
    this.buttonAcces = this.accesoOpcionesService.getObtieneOpciones('app-ven-panel-factura-venta-by-filter');
  }

  onToBuscar() {
    this.onListar();
  }

  onSetParametro()
  {
    this.params = this.modeloForm.getRawValue();
  }

  onListar() {
    this.isDisplay = true;
    this.reporteList = [];
    this.onSetParametro();
    this.facturaVentaService.getListFacturaVentaByFilter(this.params)
    .subscribe({next:(data: IFacturaVentaByFecha[]) =>{
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
    this.facturaVentaService.getFacturaVentaByFilterExcel(this.params)
    .subscribe({next:(response: any) => {
      saveAs(
        new Blob([response],
        {
          type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        }),
        this.nombreArchivo + this.fecha
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
